"""
exhibits_1_2.py - regenerate the two historical exhibits from the paper's
own cited figures, so that every exhibit in the preprint is reproducible
from a script rather than pasted from a prior draft.

PROVENANCE
Exhibit 1: capex from company reports 2022-2024 and press compilation
2025-2026 [SPEC]; inference prices from the Stanford AI Index series
[MEASURED, third party]; 2026 capex is guidance and 2026 price is an
open-weight upper bound, both drawn as open markers and never connected.
Exhibit 2: endpoint pairs as cited in the text for each series; series are
indexed to 100 at their own turning point by log-interpolation between the
nearest measured points. Measured points only; connecting lines are
log-linear interpolations, not data.
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- Exhibit 1
capex_years = np.array([2022, 2023, 2024, 2025])
capex_vals = np.array([150.0, 154.0, 228.0, 410.0])      # $B
capex_guid = (2026, 725.0)                                # guidance

price_years = np.array([2022.87, 2024.79])                # Nov 2022, Oct 2024
price_vals = np.array([20.00, 0.07])                      # $/Mtok
price_open = (2026.53, 0.12)                              # open-weight upper bound

fig, ax1 = plt.subplots(figsize=(7.2, 4.3))
ax2 = ax1.twinx()

ax1.plot(capex_years, capex_vals, "s-", color="#1f3f6e", lw=1.9, ms=5,
         label="Big-four hyperscaler capex ($B, left)")
ax1.plot([capex_years[-1], capex_guid[0]], [capex_vals[-1], capex_guid[1]],
         "--", color="#1f3f6e", lw=1.6)
ax1.plot(*capex_guid, "s", mfc="white", mec="#1f3f6e", mew=1.8, ms=7)
ax1.set_yscale("log")
ax1.set_ylim(100, 1000)
ax1.set_ylabel("Combined capital expenditure (\\$B, log scale)", fontsize=8.5)
ax1.set_xlabel("Year", fontsize=8.5)
ax1.annotate("\\$150B", (2022, 150), textcoords="offset points", xytext=(0, -14),
             fontsize=7.5, ha="center")
ax1.annotate("\\$725B\n(guidance)", capex_guid, textcoords="offset points",
             xytext=(-6, 10), fontsize=7.5, ha="center")

ax2.plot(price_years, price_vals, "o-", color="#c0392b", lw=1.9, ms=5,
         label="GPT-3.5-class inference (\\$/Mtok, right)")
ax2.plot(*price_open, "o", mfc="white", mec="#c0392b", mew=1.8, ms=7)
ax2.set_yscale("log")
ax2.set_ylim(0.03, 40)
ax2.set_ylabel("Inference price at fixed capability (\\$/Mtok, log scale)",
               fontsize=8.5, color="#c0392b")
ax2.tick_params(axis="y", colors="#c0392b")
ax2.annotate("\\$20.00/Mtok", (price_years[0], price_vals[0]),
             textcoords="offset points", xytext=(14, 4), fontsize=7.5, color="#c0392b")
ax2.annotate("\\$0.07/Mtok", (price_years[1], price_vals[1]),
             textcoords="offset points", xytext=(-4, -14), fontsize=7.5, color="#c0392b")
ax2.annotate("open-weight,\nmore-capable class\n(upper bound)", price_open,
             textcoords="offset points", xytext=(-22, 12), fontsize=6.8,
             color="#c0392b", ha="center")

h1, l1 = ax1.get_legend_handles_labels()
h2, l2 = ax2.get_legend_handles_labels()
ax1.legend(h1 + h2, l1 + l2, fontsize=7.5, loc="center left", framealpha=0.95)
ax1.set_title("Record spending and a collapsing unit price, in the same four years.",
              fontsize=9, loc="left")
ax1.grid(alpha=0.2, which="major")
fig.tight_layout()
fig.savefig(os.path.join(HERE, "fig_exhibit1.png"), dpi=200)
plt.close(fig)

# ---------------------------------------------------------------- Exhibit 2
def index_series(years_from_tp, values):
    """Index to 100 at year 0 by log-interpolation between nearest points."""
    x, y = np.asarray(years_from_tp, float), np.asarray(values, float)
    anchor = np.exp(np.interp(0.0, x, np.log(y)))
    return x, 100.0 * y / anchor

series = {
    "Rail freight (US, rev/ton-mile)": (
        [-3, 27], [1.9, 0.73], "#7f8c8d", ["1.9 cents/t-mi", "0.73 cents/t-mi"]),
    "Electricity (Chicago, \\$/kWh)": (
        [-5, 0, 12], [0.20, 0.10, 0.025], "#d4ac0d", ["20 cents/kWh", "", "2.5 cents/kWh"]),
    "Cargo handling (\\$/ton)": (
        [0, 1, 10], [5.86, 0.16, 0.16], "#2e86c1", ["\\$5.86/ton", "\\$0.16/ton", ""]),
    "Internet transit (\\$/Mbps/mo)": (
        [-2, 15], [1200.0, 0.63], "#1e8449", ["\\$1,200/Mbps", "\\$0.63/Mbps"]),
    "AI inference, GPT-3.5-class (\\$/Mtok)": (
        [-2.17, -0.25], [20.00, 0.07], "#c0392b", ["\\$20.00/Mtok", "\\$0.07/Mtok"]),
}

fig, ax = plt.subplots(figsize=(7.2, 4.5))
for name, (xs, ys, colour, labels) in series.items():
    x, yi = index_series(xs, ys)
    if name.startswith("AI"):
        # anchor extrapolates 2.5 months beyond the last measured point
        slope = (np.log(yi[-1]) - np.log(yi[0])) / (x[-1] - x[0])
        x = np.append(x, 0.0)
        yi = np.append(yi, np.exp(np.log(yi[-1]) + slope * (0.0 - x[-2])))
        labels = labels + [""]
    ax.plot(x, yi, "o-", color=colour, lw=1.8, ms=4.5, label=name)
    for xx, yy, lab in zip(x, yi, labels):
        if lab:
            ax.annotate(lab, (xx, yy), textcoords="offset points", xytext=(5, 5),
                        fontsize=6.8, color=colour)

ax.axvline(0, color="#7f8c8d", ls="--", lw=1.0)
ax.text(0.4, 3e4, "year 0 = turning point\n(crash or standardization event)",
        fontsize=7, color="#555555")
ax.set_yscale("log")
ax.set_xlim(-6, 30)
ax.set_ylim(1e-1, 1e5)
ax.set_xlabel("Years from turning point", fontsize=8.5)
ax.set_ylabel("Unit cost, indexed to 100 at turning point (log scale)", fontsize=8.5)
ax.set_title("Each revolution's cost curve is steeper than the last. "
             "AI's is the steepest ever measured.", fontsize=9, loc="left")
ax.legend(fontsize=7.2, loc="lower left", framealpha=0.95)
ax.grid(alpha=0.2, which="major")
fig.tight_layout()
fig.savefig(os.path.join(HERE, "fig_exhibit2.png"), dpi=200)
plt.close(fig)

print("wrote fig_exhibit1.png and fig_exhibit2.png")
