"""
trace_replay.py - compute the served-token unit on real production traces.

WHAT IS MEASURED AND WHAT IS MODELLED
[MEASURED] Arrival timestamps, context-token counts, and generated-token counts
  for 28,183 requests across two production Azure OpenAI inference services
  (conversation and code), released under CC-BY as AzureLLMInferenceDataset2023.
[SIM] Per-request latency. The public traces carry no TTFT or TPOT - no public
  LLM trace does, which is Section 8's argument appearing as a data limitation -
  so latency is produced by replaying the measured arrivals and measured token
  counts through a continuous-batching serving model calibrated to a
  70B-class deployment.

Under the provenance rules of Appendix A.6 the derived cost figures inherit the
weakest label, [SIM]. What the real traces contribute is the workload: the true
arrival process, its burstiness, and the true joint distribution of context and
generation lengths. Those are exactly the inputs the synthetic M/M/1 analysis of
Section 8.2 had to assume, and the point of this script is to test whether that
assumption was optimistic in the direction the paper claimed.

Serving model: iteration-level scheduling in the style of a modern continuously
batched server. Each iteration either admits one waiting request and pays its
prefill, or advances every active request by one decoded token. Decode step time
grows linearly in batch size, which is the standard first-order model for a
memory-bandwidth-bound decode phase.
"""

import csv
import json
import math
import os
from bisect import insort
from datetime import datetime

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
TRACES = {
    "conversation": "AzureLLMInferenceTrace_conv.csv",
    "code": "AzureLLMInferenceTrace_code.csv",
}

# Serving-model constants, calibrated to a 70B-class deployment on one node.
PREFILL_TOK_PER_S = 20_000.0   # prefill is compute-bound
DECODE_T0_S = 0.008            # fixed cost of one decode iteration
DECODE_T1_S = 0.00035          # marginal cost per request in the batch
MAX_BATCH = 64
RENT_PER_HR = 2.35             # [SPEC] node rental


def load_trace(path):
    """Returns (arrival_seconds_from_start, context_tokens, generated_tokens)."""
    ts, ctx, gen = [], [], []
    with open(path, newline="") as fh:
        for row in csv.DictReader(fh):
            raw = row["TIMESTAMP"].strip()
            # microsecond field has 7 digits; python accepts 6
            if "." in raw:
                head, frac = raw.split(".")
                raw = f"{head}.{frac[:6]}"
            ts.append(datetime.fromisoformat(raw).timestamp())
            ctx.append(int(row["ContextTokens"]))
            gen.append(int(row["GeneratedTokens"]))
    t0 = min(ts)
    order = np.argsort(np.array(ts))
    ts = np.array(ts)[order] - t0
    return ts, np.array(ctx)[order], np.array(gen)[order]


def characterise(ts, ctx, gen):
    """Workload statistics. All [MEASURED]. These are the numbers a partner can
    disclose without revealing scale, and they are what a fitted generator must
    reproduce."""
    gaps = np.diff(ts)
    gaps = gaps[gaps > 0]
    duration = ts[-1] - ts[0]
    rate = len(ts) / duration
    # Index of dispersion for counts: Var/Mean of arrivals per second.
    # Poisson has IDC = 1 by construction; anything above is bursty.
    bins = np.arange(0, duration + 1.0, 1.0)
    counts, _ = np.histogram(ts, bins=bins)
    idc = counts.var() / counts.mean() if counts.mean() > 0 else float("nan")
    return {
        "requests": int(len(ts)),
        "duration_s": round(float(duration), 1),
        "mean_rate_rps": round(float(rate), 4),
        "interarrival_cv": round(float(gaps.std() / gaps.mean()), 4),
        "index_of_dispersion": round(float(idc), 3),
        "context_tokens_p50": int(np.percentile(ctx, 50)),
        "context_tokens_p99": int(np.percentile(ctx, 99)),
        "generated_tokens_p50": int(np.percentile(gen, 50)),
        "generated_tokens_p99": int(np.percentile(gen, 99)),
        "generated_tokens_mean": round(float(gen.mean()), 1),
        "provenance": "MEASURED",
    }


def replay(ts, ctx, gen, rate_multiplier=1.0, max_batch=MAX_BATCH):
    """Continuous-batching replay. Returns per-request TTFT and TPOT in seconds.

    Time is compressed by rate_multiplier to sweep offered load while preserving
    the trace's burst structure, which is the property a Poisson model discards.
    """
    arrivals = ts / rate_multiplier
    n = len(arrivals)
    ttft = np.full(n, np.nan)
    tpot = np.full(n, np.nan)
    first_tok_time = np.full(n, np.nan)

    now = 0.0
    nxt = 0                 # next request index to arrive
    waiting = []            # indices admitted to queue, FIFO
    active = {}             # idx -> tokens remaining
    started = {}            # idx -> time first token emitted

    while nxt < n or waiting or active:
        # advance clock to next arrival if nothing to do
        if not waiting and not active and nxt < n:
            now = max(now, arrivals[nxt])
        # admit all arrivals up to now
        while nxt < n and arrivals[nxt] <= now:
            waiting.append(nxt)
            nxt += 1

        if waiting and len(active) < max_batch:
            i = waiting.pop(0)
            now += ctx[i] / PREFILL_TOK_PER_S      # prefill this request
            first_tok_time[i] = now
            ttft[i] = now - arrivals[i]
            started[i] = now
            remaining = max(1, int(gen[i])) - 1
            if remaining > 0:
                active[i] = remaining
            else:
                tpot[i] = 0.0
            continue

        if active:
            b = len(active)
            step = DECODE_T0_S + DECODE_T1_S * b
            now += step
            done = []
            for i in list(active.keys()):
                active[i] -= 1
                if active[i] <= 0:
                    done.append(i)
            for i in done:
                span = now - started[i]
                tpot[i] = span / max(1, int(gen[i]) - 1)
                del active[i]
            continue

        if nxt < n:
            now = max(now, arrivals[nxt])
        else:
            break

    tpot = np.where(np.isnan(tpot), 0.0, tpot)
    makespan = np.nanmax(first_tok_time) if n else 0.0
    return ttft, tpot, makespan


def cost_of_useful_work(ts, ctx, gen, ttft, tpot, ttft_max_s, tpot_max_s, wall_s):
    """C in $/Msvt, plus compliance. Failed work is waste, never discount."""
    compliant = (ttft <= ttft_max_s) & (tpot <= tpot_max_s)
    served = gen[compliant].sum()
    billed = gen.sum()
    spend = RENT_PER_HR * (wall_s / 3600.0)
    C = float("inf") if served == 0 else spend / (served / 1e6)
    return {
        "compliance_rate": float(compliant.mean()),
        "served_tokens": int(served),
        "billed_tokens": int(billed),
        "wasted_tokens": int(billed - served),
        "spend_usd": spend,
        "C_usd_per_Msvt": C,
    }


def engineering_capacity(ts, ctx, gen):
    """Saturation throughput in requests/sec, measured by offering far more load
    than the node can absorb and observing completed requests per unit wall time.
    This is the denominator that makes the load factor comparable to Section 8.2."""
    ttft, tpot, wall = replay(ts, ctx, gen, rate_multiplier=200.0)
    return len(ts) / wall


def utilisation_sweep(name, ts, ctx, gen, tpot_bounds_ms, fractions, mu):
    """Sweep offered load as a fraction of measured engineering capacity."""
    native = len(ts) / (ts[-1] - ts[0])
    rows = []
    for f in fractions:
        target = f * mu
        m = target / native
        ttft, tpot, wall = replay(ts, ctx, gen, rate_multiplier=m)
        for b in tpot_bounds_ms:
            r = cost_of_useful_work(ts, ctx, gen, ttft, tpot,
                                    ttft_max_s=1.0, tpot_max_s=b / 1000.0,
                                    wall_s=wall)
            rows.append({
                "workload": name, "utilisation": round(f, 4),
                "offered_rps": round(target, 4),
                "tpot_bound_ms": b, **r,
            })
    return rows


def main():
    out = {"provenance_note": (
        "Arrivals and token counts MEASURED from AzureLLMInferenceDataset2023 "
        "(CC-BY). Latency SIM from a continuous-batching replay. Derived cost "
        "figures inherit SIM under Appendix A.6 inheritance."),
        "serving_model": {
            "prefill_tokens_per_s": PREFILL_TOK_PER_S,
            "decode_step_s": f"{DECODE_T0_S} + {DECODE_T1_S}*batch",
            "max_batch": MAX_BATCH, "rent_usd_per_hr": RENT_PER_HR},
        "workloads": {}, "findings": {}}

    loaded = {}
    for name, fn in TRACES.items():
        ts, ctx, gen = load_trace(os.path.join(HERE, fn))
        loaded[name] = (ts, ctx, gen)
        out["workloads"][name] = characterise(ts, ctx, gen)

    bounds = [10, 15, 20, 30, 50]
    fracs = [0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70,
             0.75, 0.80, 0.85, 0.90, 0.95, 0.98]
    all_rows = []
    for name, (ts, ctx, gen) in loaded.items():
        mu = engineering_capacity(ts, ctx, gen)
        out["workloads"][name]["engineering_capacity_rps"] = round(mu, 3)
        out["workloads"][name]["native_trace_rps"] = round(len(ts)/(ts[-1]-ts[0]), 3)
        all_rows += utilisation_sweep(name, ts, ctx, gen, bounds, fracs, mu)

    with open(os.path.join(HERE, "trace_sweep.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(all_rows[0].keys()))
        w.writeheader()
        for r in all_rows:
            w.writerow(r)

    # economic capacity per (workload, bound)
    econ = {}
    for name in loaded:
        for b in bounds:
            sub = [r for r in all_rows if r["workload"] == name
                   and r["tpot_bound_ms"] == b and math.isfinite(r["C_usd_per_Msvt"])]
            if not sub:
                continue
            best = min(sub, key=lambda r: r["C_usd_per_Msvt"])
            hi = [r for r in sub if r["utilisation"] >= 0.95]
            peak = min(hi, key=lambda r: r["C_usd_per_Msvt"]) if hi else max(sub, key=lambda r: r["utilisation"])
            econ[f"{name}@{b}ms"] = {
                "economic_capacity_rps": best["offered_rps"],
                "load_factor": best["utilisation"],
                "C_min_usd_per_Msvt": round(best["C_usd_per_Msvt"], 4),
                "compliance_at_optimum": round(best["compliance_rate"], 4),
                "C_at_95pct_util": round(peak["C_usd_per_Msvt"], 4),
                "penalty_at_95pct": round(peak["C_usd_per_Msvt"] / best["C_usd_per_Msvt"], 3),
            }
    out["findings"]["economic_capacity"] = econ

    with open(os.path.join(HERE, "trace_findings.json"), "w") as fh:
        json.dump(out, fh, indent=2)

    print(json.dumps(out["workloads"], indent=2))
    print("\nEconomic capacity by workload and deadline:")
    for k, v in econ.items():
        print(f"  {k:22s} load factor {v['load_factor']:5.0%}  "
              f"C* {v['C_min_usd_per_Msvt']:8.4f}  "
              f"compliance {v['compliance_at_optimum']:.3f}  "
              f"penalty at 95% util {v['penalty_at_95pct']:8.2f}x")


if __name__ == "__main__":
    main()
