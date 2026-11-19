"""Tests for svt.py. Run: python3 test_svt.py

Covers the three invariants that are also paper revisions:
  1. commensurability refusal across artifact classes
  2. provenance inheritance (weakest label wins)
  3. interval on C driven by the compliance interval
plus the reproduced A.9 inversion, which is the paper's own worked example.
"""

import json
import math
import os
import random
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from svt import (OTEL_TPOT_BUCKETS_S, SLO, Denominator, ModelArtifact, Placement,
                 Provenance, compliance_from_histogram,
                 QualityFloor, Request, Workload, attribute_multitenant,
                 build_record, compare, compute, from_otel_spans, slo_sweep,
                 spend_from_focus, split_half, validate, weakest, wilson_ci)

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA = os.path.join(HERE, "served-token-record.schema.json")

PASS = FAIL = 0


def check(name, cond, detail=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name} {detail}")


ARTIFACT_A = ModelArtifact("llama-3.3-70b-fp8", "Llama-3.3-70B-Instruct", "3.3", "fp8", "llama-bpe")
ARTIFACT_B = ModelArtifact("llama-3.3-70b-bf16", "Llama-3.3-70B-Instruct", "3.3", "bf16", "llama-bpe")


def make_requests(n, tpot_ms, ttft_ms, out_tokens=500, quality=True, seed=0):
    rng = random.Random(seed)
    t0 = datetime(2026, 7, 12, 0, 0, 0)
    return [Request(
        request_id=f"r{i}", task_id=f"t{i}",
        output_tokens=out_tokens, billed_output_tokens=out_tokens,
        billed_input_tokens=200,
        ttft_ms=ttft_ms * rng.uniform(0.85, 1.15),
        tpot_ms=tpot_ms * rng.uniform(0.85, 1.15),
        quality_pass=quality, end_time=t0 + timedelta(seconds=i),
    ) for i in range(n)]


print("\n[1] provenance inheritance")
check("weakest picks EST over MEASURED",
      weakest([Provenance.MEASURED, Provenance.EST]) is Provenance.EST)
check("weakest picks SIM over CONFIG",
      weakest([Provenance.CONFIG, Provenance.SIM]) is Provenance.SIM)
r = compute(make_requests(50, 5, 300), 10.0, SLO(99, 1000, 40), ARTIFACT_A,
            spend_provenance=Provenance.MEASURED, work_provenance=Provenance.SIM)
check("measured spend / simulated work is labelled SIM", r.provenance is Provenance.SIM)

print("\n[2] Wilson interval")
lo, hi = wilson_ci(50, 50)
check("perfect compliance keeps upper bound at 1.0", math.isclose(hi, 1.0) and lo < 1.0)
lo, hi = wilson_ci(0, 50)
check("zero compliance keeps lower bound at 0.0", math.isclose(lo, 0.0) and hi > 0.0)

print("\n[3] the unit: compliance is binary, failure is waste not discount")
slo = SLO(99, ttft_ms_max=1000, tpot_ms_max=10)
fast = compute(make_requests(100, tpot_ms=5, ttft_ms=400), 100.0, slo, ARTIFACT_A)
slow = compute(make_requests(100, tpot_ms=50, ttft_ms=400), 20.0, slo, ARTIFACT_A)
check("compliant placement yields finite C", math.isfinite(fast.C))
check("non-compliant placement diverges despite 5x lower spend", math.isinf(slow.C))
check("wasted units recorded when work is zero", slow.wasted_units == slow.billed_units)
check("C interval brackets the point estimate",
      fast.ci95[0] <= fast.C <= fast.ci95[1] or math.isclose(fast.ci95[0], fast.C))

print("\n[4] retries: full spend, only final compliant output")
reqs = make_requests(10, 5, 400)
retry = Request("r0b", "t0", 500, 500, 200, 400, 5, True, attempt=2,
                end_time=datetime(2026, 7, 12, 0, 0, 30))
r_with = compute(reqs + [retry], 10.0, slo, ARTIFACT_A)
check("retry does not double-count work", r_with.work == 10.0)
check("retry still counted in billed units", r_with.billed_units == 10.0)

print("\n[5] commensurability enforcement")
a = compute(make_requests(50, 5, 400, out_tokens=500), 10.0, slo, ARTIFACT_A, Denominator.TOKENS)
b = compute(make_requests(50, 5, 400, out_tokens=900), 10.0, slo, ARTIFACT_B, Denominator.TOKENS)
try:
    compare([a, b])
    check("cross-artifact token ranking refused", False, "(no exception raised)")
except ValueError as e:
    check("cross-artifact token ranking refused", "artifact classes" in str(e))
at = compute(make_requests(50, 5, 400, out_tokens=500), 10.0, slo, ARTIFACT_A, Denominator.TASKS)
bt = compute(make_requests(50, 5, 400, out_tokens=900), 10.0, slo, ARTIFACT_B, Denominator.TASKS)
ranked = compare([at, bt])
check("cross-artifact task ranking permitted", len(ranked) == 2)
check("verbose model is not rewarded under task denominator",
      math.isclose(at.C, bt.C), f"({at.C} vs {bt.C})")

print("\n[6] the A.9 inversion, reproduced")
# Public figures from Artificial Analysis via the paper: cheapest provider
# $0.12/Mtok blended at 15.2 tok/s; Groq ~$0.64/Mtok at 329.6 tok/s.
CHEAP_TPOT, FAST_TPOT = 1000 / 15.2, 1000 / 329.6
n, out = 200, 500
cheap_spend = 0.12 * (n * out) / 1e6
fast_spend = 0.64 * (n * out) / 1e6
voice = SLO(99, ttft_ms_max=1000, tpot_ms_max=10)   # >=100 tok/s sustained
batch = SLO(99, ttft_ms_max=60_000, tpot_ms_max=60_000)
cheap_voice = compute(make_requests(n, CHEAP_TPOT, 900, out), cheap_spend, voice, ARTIFACT_A, Denominator.TOKENS)
fast_voice = compute(make_requests(n, FAST_TPOT, 900, out), fast_spend, voice, ARTIFACT_A, Denominator.TOKENS)
cheap_batch = compute(make_requests(n, CHEAP_TPOT, 900, out), cheap_spend, batch, ARTIFACT_A, Denominator.TOKENS)
fast_batch = compute(make_requests(n, FAST_TPOT, 900, out), fast_spend, batch, ARTIFACT_A, Denominator.TOKENS)
check("voice buyer: cheapest token is the most expensive placement",
      math.isinf(cheap_voice.C) and math.isfinite(fast_voice.C))
check("batch buyer: ranking inverts to raw price",
      cheap_batch.C < fast_batch.C, f"({cheap_batch.C:.3f} vs {fast_batch.C:.3f})")
check("batch ratio matches the paper's 5.3x", abs(fast_batch.C / cheap_batch.C - 5.33) < 0.1,
      f"(got {fast_batch.C / cheap_batch.C:.2f})")

print("\n[7] quality floor rejects a configuration declaration")
try:
    QualityFloor("model_artifact_identity", "llama-3.3-70b-fp8", 1.0)
    check("artifact identity rejected as quality floor", False, "(no exception)")
except ValueError:
    check("artifact identity rejected as quality floor", True)

print("\n[8] adapters")
# SemConv v1.40.0: latency instruments are in SECONDS.
spans = [{"span_id": "s1", "attributes": {
    "gen_ai.usage.output_tokens": 500, "gen_ai.usage.input_tokens": 200,
    "gen_ai.server.time_to_first_token": 0.400, "gen_ai.server.time_per_output_token": 0.005,
    "quality.pass": True, "task.id": "t1"}}]
parsed = from_otel_spans(spans)[0]
check("OTel adapter normalises a span", parsed.output_tokens == 500)
check("OTel seconds converted to milliseconds",
      math.isclose(parsed.ttft_ms, 400.0) and math.isclose(parsed.tpot_ms, 5.0))
try:
    from_otel_spans([{"attributes": {"gen_ai.usage.output_tokens": 1}}])
    check("OTel adapter fails loudly on missing attributes", False)
except KeyError:
    check("OTel adapter fails loudly on missing attributes", True)
try:
    from_otel_spans([{"attributes": {"gen_ai.usage.output_tokens": 1,
                                     "gen_ai.usage.input_tokens": 1}}])
    check("OTel adapter fails loudly on missing per-request latency", False)
except KeyError as e:
    check("OTel adapter fails loudly on missing per-request latency",
          "not a standard span attribute" in str(e))

print("\n[8b] histogram path and the resolvability finding")
# 13 boundaries -> 14 buckets. Put all mass below 10 ms except a long tail.
counts = [900, 60, 20, 10, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0]
rate, resolvable = compliance_from_histogram(counts, OTEL_TPOT_BUCKETS_S, 0.010)
check("bound on a bucket boundary is resolvable", resolvable and math.isclose(rate, 0.9))
rate6, resolvable6 = compliance_from_histogram(counts, OTEL_TPOT_BUCKETS_S, 0.006)
check("6 ms interactive bound is NOT resolvable from default TPOT buckets",
      resolvable6 is False)
check("unresolvable bound still returns an interpolated figure, flagged",
      0.0 < rate6 < 1.0)
try:
    compliance_from_histogram([1, 2], OTEL_TPOT_BUCKETS_S, 0.01)
    check("histogram shape validated", False)
except ValueError:
    check("histogram shape validated", True)
s, prov = spend_from_focus([{"BilledCost": 3.0}, {"BilledCost": 4.0, "_provenance": "SPEC"}])
check("FOCUS adapter sums BilledCost", math.isclose(s, 7.0))
check("FOCUS adapter inherits the weakest label", prov is Provenance.SPEC)

print("\n[9] end-to-end conforming record")
reqs = make_requests(400, tpot_ms=6, ttft_ms=500, out_tokens=500)
# 8% of the window fails its quality floor - realistic, and it is what makes
# wasted_units non-zero and the interval on C non-degenerate.
for q in reqs[::12]:
    q.quality_pass = False
spend = 0.64 * (400 * 500) / 1e6
res = compute(reqs, spend, slo, ARTIFACT_A, Denominator.TOKENS)
rec = build_record(
    result=res,
    workload=Workload("interactive-voice-agent-replay", "replayed_production", 200, 500, True),
    artifact=ARTIFACT_A,
    placement=Placement("provider-x", "H100-SXM", "us-east", "continuous-batching",
                        offered_load_rps=4.0),
    slo=slo,
    quality=QualityFloor("task_completion_check", "voice-intent-v3", 0.95, 1.0),
    window_start=datetime(2026, 7, 12, 0, 0, 0),
    window_end=datetime(2026, 7, 12, 1, 0, 0),
    sustained_load_rps=4.0,
    stationarity=split_half(reqs, spend, slo, ARTIFACT_A, Denominator.TOKENS),
    sensitivity=slo_sweep(reqs, spend, slo, ARTIFACT_A,
                          bounds=[4, 5, 6, 7, 8, 10, 15, 25, 40],
                          denominator=Denominator.TOKENS),
    attribution=attribute_multitenant(spend, 0.5, 0.35, res.work) | {"basis": "reserved_share"},
    measuring_party="The Ashby Institute", independent=True,
    p99_latency_s=3.4,
    notes="Synthetic window; latency and quality drawn from a documented generator. [SIM]",
)
validate(rec, SCHEMA)
check("record validates against the schema", True)
check("sensitivity curve is published", len(rec["slo_sensitivity"]["points"]) == 9)
check("stationarity reported", "relative_delta" in rec["conditioning_tuple"]["window"]["stationarity"])
check("token-denominated record marked not cross-artifact comparable",
      rec["cost_of_useful_work"]["cross_artifact_comparable"] is False)
check("wasted units non-zero when quality floor bites", rec["work"]["wasted_units"] > 0)

with open(os.path.join(HERE, "example_record.json"), "w") as fh:
    json.dump(rec, fh, indent=2)

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
