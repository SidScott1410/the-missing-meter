"""
load_curve.py - C is not a scalar. It is a function of offered load.

WHY THIS IS THE PAPER'S MISSING RESULT
Section 9 argues that load factor, delivered work over provisioned capacity, is
the operator's core metric, and grounds it in Insull. The argument is currently
historical. This script makes it quantitative, and in doing so answers the
objection a performance reviewer raises first: a cost-per-unit-of-work figure
quoted without an offered load is a category error, because latency, and
therefore compliance, and therefore W, all depend on utilisation.

THE RESULT
C(lambda) is U-shaped. At low load the rented capacity amortises over too little
work. At high load queueing pushes latency past the SLO, compliance collapses,
and W falls faster than throughput rises. The minimum sits strictly below
engineering capacity, and the gap widens as the SLO tightens. Call the
minimising load the ECONOMIC CAPACITY; the ratio to engineering capacity is the
load-factor analogue Section 9 asks for, now computed rather than asserted.

MODEL AND ITS LIMITS  [SIM]
M/M/1 with FCFS. Response time is exponential with rate mu(1-rho), so
  compliance(lambda) = P(T <= D) = 1 - exp(-mu(1-rho)D)
where D is the per-request deadline implied by the TPOT bound.
This is a deliberate simplification and must be labelled as one: a continuously
batched LLM server has a batch-size-dependent service rate, prefill and decode
contend differently, and real arrivals are burstier than Poisson. Every one of
those effects moves the knee LEFT, so the M/M/1 curve is the optimistic bound.
The qualitative claim - economic capacity strictly below engineering capacity,
gap widening as the SLO tightens - is robust to all three.
"""

import csv
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))

MU = 10.0            # service rate, requests/sec (engineering capacity)
N_OUT = 500          # output tokens per request
RENT_PER_HR = 2.35   # $/hr for the serving node. [SPEC] SemiAnalysis H100 range, Mar 2026.
TPOT_BOUNDS_MS = [3.0, 4.0, 6.0, 10.0, 20.0]   # tightest to loosest


def compliance(lam, mu, deadline_s):
    """Share of requests meeting the deadline under M/M/1."""
    rho = lam / mu
    if rho >= 1:
        return 0.0
    return 1.0 - np.exp(-mu * (1 - rho) * deadline_s)


def cost_of_useful_work(lam, mu, deadline_s, rent_per_hr=RENT_PER_HR, n_out=N_OUT):
    """C in $/Msvt at offered load lam. Spend is the rental, independent of load;
    that independence is exactly why utilisation drives the unit economics."""
    if lam <= 0:
        return np.inf
    comp = compliance(lam, mu, deadline_s)
    compliant_mtok_per_hr = lam * 3600 * n_out * comp / 1e6
    if compliant_mtok_per_hr <= 0:
        return np.inf
    return rent_per_hr / compliant_mtok_per_hr


def main():
    lams = np.linspace(0.05, 0.995 * MU, 3000)
    rows, summary = [], []

    fig, ax = plt.subplots(figsize=(9, 5.6))
    colours = ["#7b241c", "#c0392b", "#e67e22", "#2e86c1", "#1e8449"]

    for tpot_ms, colour in zip(TPOT_BOUNDS_MS, colours):
        D = tpot_ms * 1e-3 * N_OUT               # per-request deadline, seconds
        cs = np.array([cost_of_useful_work(l, MU, D) for l in lams])
        i = int(np.nanargmin(cs))
        lam_star, c_star = lams[i], cs[i]
        load_factor = lam_star / MU

        ax.plot(lams / MU, cs, lw=1.9, color=colour,
                label=f"TPOT p99 $\\leq$ {tpot_ms:.0f} ms  (deadline {D:.1f}s)")
        ax.plot(load_factor, c_star, "o", color=colour, ms=6.5, zorder=5)

        summary.append({
            "tpot_ms_max": tpot_ms,
            "deadline_s": round(D, 3),
            "engineering_capacity_rps": MU,
            "economic_capacity_rps": round(float(lam_star), 3),
            "load_factor": round(float(load_factor), 4),
            "C_min_usd_per_Msvt": round(float(c_star), 4),
            "compliance_at_optimum": round(float(compliance(lam_star, MU, D)), 4),
            "C_at_95pct_engineering_capacity": round(float(cost_of_useful_work(0.95 * MU, MU, D)), 4),
            "penalty_for_running_at_95pct": round(float(cost_of_useful_work(0.95 * MU, MU, D) / c_star), 3),
        })
        for l, c in zip(lams, cs):
            rows.append([tpot_ms, round(l, 4), round(l / MU, 4),
                         round(float(compliance(l, MU, D)), 5),
                         "" if not np.isfinite(c) else round(float(c), 6), "SIM"])

    ax.set_xlabel("Utilisation (offered load / engineering capacity)")
    ax.set_ylabel("Cost of useful work, $/Msvt")
    ax.set_yscale("log")
    ax.set_ylim(0.1, 20)
    ax.set_xlim(0, 1.0)
    ax.set_title("Economic capacity sits below engineering capacity, and the gap widens\n"
                 "as the SLO tightens. Markers are the minimising load: the load-factor optimum.",
                 fontsize=11)
    ax.axvline(1.0, color="#34495e", lw=1.0, ls="--")
    ax.text(0.955, 11, "engineering\ncapacity", fontsize=8.5, ha="right", color="#34495e")
    ax.legend(fontsize=8.5, loc="upper right", framealpha=0.95)
    ax.grid(alpha=0.25, which="both")
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "fig_load_curve.png"), dpi=170)

    with open(os.path.join(HERE, "load_curve.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["tpot_ms_max", "offered_load_rps", "utilisation",
                    "compliance_rate", "C_usd_per_Msvt", "provenance"])
        w.writerows(rows)
    with open(os.path.join(HERE, "load_curve_stats.json"), "w") as fh:
        json.dump({"model": "M/M/1 FCFS [SIM]", "mu_rps": MU, "output_tokens": N_OUT,
                   "rent_usd_per_hr": RENT_PER_HR, "cases": summary}, fh, indent=2)

    print(f"{'TPOT bound':>11} {'econ cap':>9} {'load factor':>12} {'C* $/Msvt':>11} "
          f"{'C at 95% util':>14} {'penalty':>8}")
    for s in summary:
        print(f"{s['tpot_ms_max']:>9.0f}ms {s['economic_capacity_rps']:>8.2f}/s "
              f"{s['load_factor']:>12.1%} {s['C_min_usd_per_Msvt']:>11.3f} "
              f"{s['C_at_95pct_engineering_capacity']:>14.3f} {s['penalty_for_running_at_95pct']:>7.2f}x")
    print("\nEvery current metric is blind to this table.")
    print("  $/GPU-hour is flat across the whole x-axis: it cannot see the workload at all.")
    print("  Raw $/Mtok falls monotonically in utilisation: it says run at 100%, which is wrong.")
    print("  Only a work-denominated, SLO-conditioned unit has an interior optimum.")


if __name__ == "__main__":
    main()
