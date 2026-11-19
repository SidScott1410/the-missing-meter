"""
slo_cliff.py - how the winning placement changes as the SLO bound sweeps.

WHY
Compliance is binary, so C is discontinuous in the SLO parameter. That is the
largest attack surface on the served token: a placement at 99 tok/s against a
100 tok/s floor scores zero. This script turns the objection into a result by
measuring where, and how often, the ranking inverts.

PROVENANCE (Appendix A.6 labels, applied to this script's own inputs)
[MEASURED, third party] the three disclosed anchor points from Artificial
  Analysis via the paper: cheapest provider $0.12/Mtok blended at 15.2 tok/s;
  Groq ~$0.64/Mtok at 329.6 tok/s; highest price $1.05/Mtok. Fifteen providers,
  price spread 8.6x, speed spread 21.7x.
[SIM] the twelve undisclosed providers, drawn from a documented generator and
  re-drawn 2000 times so that no single arbitrary reconstruction carries the
  finding. What is reported is the distribution of inversion counts, not one draw.

The derived result therefore inherits [SIM]. Under the paper's own red line it
would be non-conforming to present it as measured, and it is not.
"""

import csv
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
RNG = np.random.default_rng(20260712)

N_PROVIDERS = 15
PRICE_LO, PRICE_HI = 0.12, 1.05      # $/Mtok blended  [MEASURED]
SPEED_LO, SPEED_HI = 15.2, 329.6     # output tok/s    [MEASURED]
ANCHORS = [(0.12, 15.2, "cheapest (fp8)"), (0.64, 329.6, "fastest")]
N_DRAWS = 2000


def draw_market(rng):
    """Reconstruct the 15-provider market consistent with the disclosed bounds.

    Generator, stated so it can be criticised: prices log-uniform across the
    measured 8.6x spread; speeds log-uniform across the measured 21.7x spread
    with a mild positive rank correlation to price (rho ~ 0.5), since faster
    serving generally costs more. The two anchor providers are pinned to their
    measured values, which deliberately breaks the correlation at both ends -
    the cheapest provider is also the slowest, which is the whole point of A.9.
    """
    n = N_PROVIDERS - len(ANCHORS)
    lp = rng.uniform(np.log(PRICE_LO), np.log(PRICE_HI), n)
    ls = rng.uniform(np.log(SPEED_LO), np.log(SPEED_HI), n)
    # induce rank correlation by blending speed ranks toward price ranks
    blend = 0.5
    ls = blend * (ls[np.argsort(np.argsort(lp))]) + (1 - blend) * ls
    prices = np.concatenate([[a[0] for a in ANCHORS], np.exp(lp)])
    speeds = np.concatenate([[a[1] for a in ANCHORS], np.exp(ls)])
    return prices, speeds


def cheapest_compliant(prices, speeds, floor):
    """C* at a given throughput floor, and the index of the winner.

    A non-compliant placement has W = 0 and C diverges; it is excluded rather
    than penalised, which is exactly the spec's treatment of failed work.
    """
    ok = np.where(speeds >= floor)[0]
    if ok.size == 0:
        return np.inf, -1
    j = ok[np.argmin(prices[ok])]
    return float(prices[j]), int(j)


def main():
    floors = np.linspace(10, 340, 400)

    # ---- Monte Carlo: how unstable is the ranking? ----
    inversion_counts, first_inversion, cliff_ratios = [], [], []
    for _ in range(N_DRAWS):
        prices, speeds = draw_market(RNG)
        winners = [cheapest_compliant(prices, speeds, f)[1] for f in floors]
        changes = [i for i in range(1, len(winners))
                   if winners[i] != winners[i - 1] and winners[i] != -1]
        inversion_counts.append(len(changes))
        first_inversion.append(floors[changes[0]] if changes else np.nan)
        # size of the largest single jump in C* across one floor increment
        cs = np.array([cheapest_compliant(prices, speeds, f)[0] for f in floors])
        finite = np.isfinite(cs)
        jumps = np.abs(np.diff(cs[finite]) / np.maximum(cs[finite][:-1], 1e-9))
        cliff_ratios.append(float(jumps.max()) if jumps.size else 0.0)

    inv = np.array(inversion_counts)
    fi = np.array(first_inversion, dtype=float)
    cr = np.array(cliff_ratios)

    stats = {
        "draws": N_DRAWS,
        "providers": N_PROVIDERS,
        "winner_changes_median": float(np.median(inv)),
        "winner_changes_p05_p95": [float(np.percentile(inv, 5)), float(np.percentile(inv, 95))],
        "share_of_draws_with_any_inversion": float((inv > 0).mean()),
        "first_inversion_floor_tok_s_median": float(np.nanmedian(fi)),
        "largest_single_step_jump_in_C_median_pct": float(np.median(cr) * 100),
        "largest_single_step_jump_in_C_p95_pct": float(np.percentile(cr, 95) * 100),
        "provenance": "SIM (twelve of fifteen providers reconstructed)",
    }

    # ---- one representative draw for the figure ----
    prices, speeds = draw_market(np.random.default_rng(7))
    cstar, winners = [], []
    for f in floors:
        c, j = cheapest_compliant(prices, speeds, f)
        cstar.append(c)
        winners.append(j)
    cstar = np.array(cstar)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(9, 7.2), sharex=True,
                                   gridspec_kw={"height_ratios": [3, 1]})

    finite = np.isfinite(cstar)
    ax1.step(floors[finite], cstar[finite], where="post", lw=2.0, color="#c0392b")
    ax1.set_ylabel("Cheapest compliant placement, $/Msvt")
    ax1.set_yscale("log")
    ax1.set_title("The SLO cliff: cost of useful work as the throughput floor sweeps\n"
                  "Same fifteen providers, same weights, same prompts. Only the deadline changes.",
                  fontsize=11)
    for i in range(1, len(winners)):
        if winners[i] != winners[i - 1] and winners[i] != -1 and winners[i - 1] != -1:
            ax1.axvline(floors[i], color="#7f8c8d", lw=0.7, ls=":", alpha=0.8)
    exhausted = floors[~finite]
    if exhausted.size:
        ax1.axvspan(exhausted.min(), floors[-1], color="#ecf0f1", alpha=0.7)
        ax1.text(exhausted.min() + 4, cstar[finite].max() * 0.75,
                 "no compliant placement\nat any price", fontsize=8.5, color="#7f8c8d")
    ax1.axvline(100, color="#2c3e50", lw=1.2, ls="--")
    ax1.text(103, cstar[finite].min() * 1.1, "voice agent floor\n(100 tok/s, A.9)",
             fontsize=8.5, color="#2c3e50")
    ax1.grid(alpha=0.25, which="both")

    ax2.step(floors, [w if w >= 0 else np.nan for w in winners], where="post",
             lw=1.6, color="#2c3e50")
    ax2.set_ylabel("winner\n(provider index)", fontsize=9)
    ax2.set_xlabel("SLO throughput floor (output tokens/sec)")
    ax2.grid(alpha=0.25)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "fig_slo_cliff.png"), dpi=170)

    with open(os.path.join(HERE, "slo_cliff.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["floor_tok_s", "cheapest_compliant_usd_per_Msvt", "winner_index", "provenance"])
        for f, c, j in zip(floors, cstar, winners):
            w.writerow([round(f, 2), "" if not np.isfinite(c) else round(c, 4), j, "SIM"])

    with open(os.path.join(HERE, "slo_cliff_stats.json"), "w") as fh:
        json.dump(stats, fh, indent=2)

    print(json.dumps(stats, indent=2))
    print("\nInterpretation")
    print(f"  The identity of the cheapest compliant placement changes a median of "
          f"{stats['winner_changes_median']:.0f} times as the deadline sweeps,")
    print(f"  in {stats['share_of_draws_with_any_inversion']*100:.0f}% of reconstructions, "
          f"with the first inversion at ~{stats['first_inversion_floor_tok_s_median']:.0f} tok/s.")
    print(f"  A single increment of the deadline moves C* by a median of "
          f"{stats['largest_single_step_jump_in_C_median_pct']:.0f}% at its worst step.")
    print("  Raw $/Mtok ranks these placements identically at every floor. That is the defect.")


if __name__ == "__main__":
    main()
