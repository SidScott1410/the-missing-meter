"""fig_exhibit5.py - Exhibit 5. C against utilisation on real production traces,
with the Section 8.2 M/M/1 prediction overlaid for comparison."""

import csv, json, os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(HERE, "trace_sweep.csv"))))
for r in rows:
    for k in ("utilisation", "C_usd_per_Msvt", "compliance_rate", "tpot_bound_ms"):
        r[k] = float(r[k])

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), sharex=True)
colours = {10: "#7b241c", 15: "#c0392b", 20: "#e67e22", 30: "#2e86c1", 50: "#1e8449"}

for ax, wl, title in zip(axes, ("conversation", "code"),
                         ("Conversation service (19,366 requests)",
                          "Code service (8,819 requests)")):
    for b, c in colours.items():
        sub = sorted([r for r in rows if r["workload"] == wl and r["tpot_bound_ms"] == b],
                     key=lambda r: r["utilisation"])
        x = np.array([r["utilisation"] for r in sub])
        y = np.array([r["C_usd_per_Msvt"] for r in sub])
        ok = np.isfinite(y) & (y > 0)
        ax.plot(x[ok], y[ok], "-", color=c, lw=1.7, label=f"TPOT p99 $\\leq$ {b:.0f} ms")
        if ok.any():
            i = int(np.nanargmin(np.where(ok, y, np.inf)))
            ax.plot(x[i], y[i], "o", color=c, ms=6, zorder=5)
    ax.set_yscale("log")
    ax.set_xlabel("Utilisation (offered load / measured engineering capacity)", fontsize=9)
    ax.set_title(title, fontsize=10)
    ax.grid(alpha=0.25, which="both")
    ax.axvspan(0.827, 0.954, color="#95a5a6", alpha=0.18)

axes[0].set_ylabel("Cost of useful work, \\$/Msvt", fontsize=9)
axes[0].legend(fontsize=8, loc="upper left", framealpha=0.95)
axes[1].text(0.89, axes[1].get_ylim()[1] * 0.35,
             "M/M/1 optima\n(Exhibit 3)", fontsize=7.5, ha="center", color="#5d6d7e")
axes[0].text(0.89, axes[0].get_ylim()[1] * 0.35,
             "M/M/1 optima\n(Exhibit 3)", fontsize=7.5, ha="center", color="#5d6d7e")

fig.suptitle("Real production traces put the economic optimum far below the synthetic prediction.",
             fontsize=10.5, y=0.99)
fig.tight_layout(rect=[0, 0, 1, 0.95])
fig.savefig(os.path.join(HERE, "fig_exhibit5.png"), dpi=190)
print("wrote fig_exhibit5.png")

f = json.load(open(os.path.join(HERE, "trace_findings.json")))
mm1 = {10: 0.827, 20: 0.889, 50: 0.954}
print("\nload factor: M/M/1 prediction vs measured trace")
for b in (10, 20, 50):
    conv = f["findings"]["economic_capacity"][f"conversation@{b}ms"]["load_factor"]
    code = f["findings"]["economic_capacity"][f"code@{b}ms"]["load_factor"]
    print(f"  {b:2d} ms:  M/M/1 {mm1[b]:.0%}   conversation {conv:.0%}   code {code:.0%}"
          f"   overestimate {mm1[b]/conv:.1f}x / {mm1[b]/code:.1f}x")
