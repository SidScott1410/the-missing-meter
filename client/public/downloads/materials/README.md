# Companion artifact — The Missing Meter

Reference implementation and reproduction code for the served-token unit
specified in Appendix A.

## Contents

`served-token-record.schema.json` — JSON Schema v0.2.0 for a conforming record
(Appendix A.7). The schema is designed so that an unconditioned number cannot be
serialized: the conditioning tuple, the sensitivity curve, the stationarity
check, and both multi-tenant attribution bases are required fields.

`svt.py` — reference implementation. Consumes OpenTelemetry `gen_ai` span
attributes and FinOps FOCUS `BilledCost` rows and emits a validated record.
Enforces three invariants in code rather than prose:
  - `compare()` raises on cross-artifact token comparison (Appendix A.3)
  - `weakest()` implements provenance inheritance (Appendix A.6)
  - `QualityFloor` rejects model-artifact identification as an acceptance test
`compliance_from_histogram()` returns `(rate, resolvable)` and flags any bound
that does not coincide with an OpenTelemetry bucket boundary as interpolated.

`test_svt.py` — 33 tests. Run: `python3 test_svt.py` (requires `jsonschema`).
Includes a reproduction of the Appendix A.9 inversion.

`load_curve.py` — Exhibit 3. Cost of useful work against offered load; locates
economic capacity and the load-factor optimum. Requires numpy, matplotlib.

`slo_cliff.py` — Exhibit 4. Monte Carlo over reconstructed provider
distributions; reports how often and how sharply the winning placement inverts.

CSV and JSON outputs accompany both analyses. Every derived figure carries a
provenance label under the Appendix A.6 taxonomy.

## Provenance

Exhibits 3 and 4 are [SIM]. Exhibit 4's three anchor points are [MEASURED,
third party]; the twelve reconstructed providers are [SIM]; derived statistics
inherit the weakest label. Presenting either as measured would be non-conforming
under the paper's own red line.

## Production-trace replay (Section 8.4)

`trace_replay.py` — characterises the Azure LLM inference traces and replays
them through a continuous-batching serving model to compute C against
utilisation. Download the two CSVs first:

    curl -O https://raw.githubusercontent.com/Azure/AzurePublicDataset/master/data/AzureLLMInferenceTrace_conv.csv
    curl -O https://raw.githubusercontent.com/Azure/AzurePublicDataset/master/data/AzureLLMInferenceTrace_code.csv

`fig_exhibit5.py` — produces Exhibit 5 and the M/M/1-versus-measured comparison.
`trace_findings.json`, `trace_sweep.csv` — outputs, so the section's numbers can
be checked without rerunning the replay.

Provenance: arrivals and token counts [MEASURED]; latency and all derived cost
figures [SIM], since no public LLM trace carries latency.

## Moonshot / Kimi traces (Section 8.4)

Two further production workloads, released with the Mooncake serving platform
(arXiv:2407.00079). Fetch the repository and use:
  FAST25-release/arxiv-trace/mooncake_trace.jsonl   (23,608 long-context requests)
  FAST25-release/traces/conversation_trace.jsonl    (12,031 conversation requests)
Fields: timestamp (ms), input_length, output_length, hash_ids (prefix blocks).
Scored at the operator's own declared service levels (TTFT <= 30 s, TBT <= 100 ms)
rather than a chat deadline. Outputs in kimi_sweep.csv and kimi_findings.json.
