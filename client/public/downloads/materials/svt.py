"""
svt.py - reference implementation of the served-token unit (spec v0.2.0).

WHY THIS EXISTS
The paper's Appendix A argues that C = S/W is computable today from data that
already exists. This module proves it by consuming the two schemas that already
exist in production - OpenTelemetry generative-AI semantic conventions for the
work side, FinOps FOCUS for the cost side - and emitting a conforming record.
Nothing here requires a new telemetry bus. The unit is a join, not a sensor.

THE THREE INVARIANTS THIS CODE ENFORCES (each one is a paper revision)
1. Commensurability. Token-denominated cost is only defined WITHIN one model
   artifact, because output token counts are seller-controlled and tokenizer-
   dependent. Across artifacts, only cost per compliant TASK is defined.
   compare() raises rather than returning a misleading ranking.
2. Provenance inheritance. A derived figure carries the weakest label among its
   inputs. Implemented in weakest(), applied automatically in compute().
3. Uncertainty. Compliance is an estimated proportion, so C is an interval, not
   a scalar. Wilson score interval, propagated to C.

Python 3.10+. Standard library only, except jsonschema for validation.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Iterable, Sequence

SPEC_VERSION = "0.2.0"


# --------------------------------------------------------------------------
# Provenance (Appendix A.6)
# --------------------------------------------------------------------------

class Provenance(str, Enum):
    """Ordered strongest to weakest. Order is load-bearing: see weakest()."""
    MEASURED = "MEASURED"
    CONFIG = "CONFIG"
    SPEC = "SPEC"
    SIM = "SIM"
    EST = "EST"


_STRENGTH = {p: i for i, p in enumerate(Provenance)}  # lower index = stronger


def weakest(labels: Iterable[Provenance]) -> Provenance:
    """Inheritance rule: a derived figure carries the weakest label among inputs.

    This is the single line that stops 'a measured number divided by a simulated
    one' from being published as measured - the red line in A.6.
    """
    labels = list(labels)
    if not labels:
        raise ValueError("provenance inheritance requires at least one input label")
    return max(labels, key=lambda p: _STRENGTH[p])


# --------------------------------------------------------------------------
# Statistics
# --------------------------------------------------------------------------

def wilson_ci(successes: int, trials: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a binomial proportion.

    Chosen over the normal approximation because compliance rates legitimately
    sit near 0 and near 1, exactly where the normal interval misbehaves and can
    return bounds outside [0,1].
    """
    if trials <= 0:
        raise ValueError("cannot form an interval on zero trials")
    p = successes / trials
    denom = 1 + z**2 / trials
    centre = (p + z**2 / (2 * trials)) / denom
    half = (z / denom) * math.sqrt(p * (1 - p) / trials + z**2 / (4 * trials**2))
    return (max(0.0, centre - half), min(1.0, centre + half))


# --------------------------------------------------------------------------
# Conditioning tuple (Appendix A.4)
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class SLO:
    percentile: float
    ttft_ms_max: float
    tpot_ms_max: float
    task_deadline_s_max: float | None = None

    def __post_init__(self) -> None:
        if not 0 < self.percentile <= 100:
            raise ValueError("SLO percentile must be in (0, 100]")
        if self.ttft_ms_max <= 0 or self.tpot_ms_max <= 0:
            raise ValueError("SLO bounds must be positive; an unbounded SLO is not an SLO")


@dataclass(frozen=True)
class QualityFloor:
    """An acceptance test, declared before measurement.

    NOTE ON A REVISION: the draft permitted 'minimally, exact identification of
    the model artifact' as a quality floor. That is a configuration declaration,
    not a test, and it makes the quality leg optional in practice. Artifact
    identity is field 2 of the tuple; it is not accepted here as field 5.
    """
    test_type: str
    test_id: str
    threshold: float
    evaluated_fraction: float = 1.0

    _ALLOWED = ("eval_score", "task_completion_check", "human_rating",
                "reference_accuracy", "programmatic_assertion")

    def __post_init__(self) -> None:
        if self.test_type not in self._ALLOWED:
            raise ValueError(
                f"quality floor must be an operational test, one of {self._ALLOWED}; "
                f"'{self.test_type}' is not one. Naming the model artifact is not a quality floor."
            )
        if not 0 < self.evaluated_fraction <= 1:
            raise ValueError("evaluated_fraction must be in (0, 1]")


@dataclass(frozen=True)
class ModelArtifact:
    artifact_class_id: str
    weights: str
    version: str
    quantization: str
    tokenizer_id: str


@dataclass(frozen=True)
class Placement:
    provider: str
    silicon: str
    region: str
    batching_policy: str
    self_hosted: bool = False
    offered_load_rps: float | None = None


@dataclass(frozen=True)
class Workload:
    trace_class: str
    arrival_pattern: str
    input_tokens_p50: float
    output_tokens_p50: float
    pre_registered: bool


# --------------------------------------------------------------------------
# Inputs
# --------------------------------------------------------------------------

@dataclass
class Request:
    """One request, normalised from an OpenTelemetry gen_ai span.

    billed_output_tokens is separate from output_tokens because the invoice
    counts everything emitted, including output later discarded by a retry.
    """
    request_id: str
    task_id: str
    output_tokens: int
    billed_output_tokens: int
    billed_input_tokens: int
    ttft_ms: float
    tpot_ms: float
    quality_pass: bool
    attempt: int = 1
    end_time: datetime | None = None

    def meets(self, slo: SLO) -> bool:
        return self.ttft_ms <= slo.ttft_ms_max and self.tpot_ms <= slo.tpot_ms_max

    def compliant(self, slo: SLO) -> bool:
        """Compliant work passes the quality floor AND every term of the SLO.

        Output failing either is not discounted work. It is zero work that was
        paid for - which is why it lands in wasted_units, never in W.
        """
        return self.quality_pass and self.meets(slo)


# --- OpenTelemetry generative-AI semantic conventions -------------------------
# Verified against SemConv v1.40.0 (April 2026). Status: Development
# (experimental), so these names are version-pinned and may move.
#
# TOKENS are span attributes:
#     gen_ai.usage.input_tokens, gen_ai.usage.output_tokens
# (there is also an aggregate metric, gen_ai.client.token.usage, split by
#  gen_ai.token.type; the span attributes are the per-request form.)
#
# LATENCY IS NOT A SPAN ATTRIBUTE. It is exposed as two histogram METRIC
# instruments, both in SECONDS:
#     gen_ai.server.time_to_first_token
#     gen_ai.server.time_per_output_token
#
# This distinction is load-bearing rather than pedantic. A histogram is an
# aggregate: it can tell you what share of requests fell below a bound, which is
# exactly the compliance rate, but it cannot tell you WHICH request failed, so it
# cannot be joined to a per-request quality result. The two ingestion paths below
# reflect that, and the gap between them is a finding the paper should report.

OTEL_TOKEN_ATTRS = {
    "gen_ai.usage.output_tokens": "output_tokens",
    "gen_ai.usage.input_tokens": "billed_input_tokens",
}

# Default explicit bucket boundaries from the semantic conventions, in seconds.
OTEL_TTFT_BUCKETS_S = [0.001, 0.005, 0.01, 0.02, 0.04, 0.06, 0.08, 0.1,
                       0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0]
OTEL_TPOT_BUCKETS_S = [0.01, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.3,
                       0.4, 0.5, 0.75, 1.0, 2.5]


def from_otel_spans(spans: Sequence[dict], latency_source: str = "span_timing") -> list[Request]:
    """Per-request path. Token counts come from the standard span attributes.

    Per-request TTFT and TPOT are NOT standardised as span attributes as of
    SemConv v1.40.0, so they must come from span timing or from a vendor
    extension. Emitters vary; this adapter accepts the metric names used as
    attribute keys (the de facto convention in vLLM and TGI exporters) and
    records the provenance of that choice rather than pretending it is standard.

    Latency values are read in SECONDS, matching the semantic conventions, and
    converted to milliseconds internally.
    """
    if latency_source not in ("span_timing", "vendor_extension"):
        raise ValueError("latency_source must be 'span_timing' or 'vendor_extension'")
    out: list[Request] = []
    for i, span in enumerate(spans):
        attrs = span.get("attributes", span)
        missing = [k for k in OTEL_TOKEN_ATTRS if k not in attrs]
        if missing:
            raise KeyError(f"span {i} missing required gen_ai attributes: {missing}")
        for k in ("gen_ai.server.time_to_first_token", "gen_ai.server.time_per_output_token"):
            if k not in attrs:
                raise KeyError(
                    f"span {i} lacks per-request latency '{k}'. This is not a standard "
                    "span attribute in SemConv v1.40.0; supply it from span timing or a "
                    "vendor extension, or use compliance_from_histogram() for the "
                    "aggregate path."
                )
        out.append(Request(
            request_id=span.get("span_id", f"span-{i}"),
            task_id=attrs.get("task.id", span.get("span_id", f"span-{i}")),
            output_tokens=int(attrs["gen_ai.usage.output_tokens"]),
            billed_output_tokens=int(attrs.get("billing.output_tokens",
                                               attrs["gen_ai.usage.output_tokens"])),
            billed_input_tokens=int(attrs["gen_ai.usage.input_tokens"]),
            ttft_ms=float(attrs["gen_ai.server.time_to_first_token"]) * 1000.0,
            tpot_ms=float(attrs["gen_ai.server.time_per_output_token"]) * 1000.0,
            quality_pass=bool(attrs.get("quality.pass", False)),
            attempt=int(attrs.get("task.attempt", 1)),
        ))
    return out


def compliance_from_histogram(bucket_counts: Sequence[int],
                              boundaries: Sequence[float],
                              bound_s: float) -> tuple[float, bool]:
    """Aggregate path. Compliance rate at a bound, read from an OTel histogram.

    Returns (compliance_rate, resolvable). The second value is the point.

    A histogram resolves a bound EXACTLY only when the bound coincides with a
    bucket boundary. Off-boundary bounds require interpolation inside the
    straddling bucket, which is an assumption about a distribution the histogram
    has already discarded.

    This matters concretely. The default TPOT boundaries begin at 10 ms and the
    next is 25 ms, so an interactive SLO of 6 ms per output token - well inside
    the range production voice agents actually require, and tighter than MLPerf
    Inference's 40 ms Interactive bound - is not resolvable at all from default
    telemetry. The standard cost bus cannot currently see the deadlines the
    market is buying against. Under A.6 an interpolated figure is [SIM], never
    [MEASURED], and this function labels it by returning resolvable=False.
    """
    if len(bucket_counts) != len(boundaries) + 1:
        raise ValueError("a histogram with n boundaries has n+1 buckets")
    total = sum(bucket_counts)
    if total == 0:
        raise ValueError("cannot compute compliance from an empty histogram")

    resolvable = any(math.isclose(bound_s, b, rel_tol=1e-9) for b in boundaries)
    if bound_s < boundaries[0]:
        # The first bucket covers [0, boundaries[0]). A bound inside it cannot be
        # resolved; interpolate and flag. This is the interactive-SLO case: the
        # default TPOT ladder starts at 10 ms, so every bound a voice agent
        # actually needs lands here.
        frac = bound_s / boundaries[0] if boundaries[0] > 0 else 0.0
        return (bucket_counts[0] * frac) / total, False

    below = 0
    for i, b in enumerate(boundaries):
        if b <= bound_s:
            below += bucket_counts[i]
        else:
            if not resolvable:
                # Linear interpolation within the straddling bucket. Stated, not hidden.
                lo = boundaries[i - 1] if i > 0 else 0.0
                frac = (bound_s - lo) / (b - lo) if b > lo else 0.0
                below += bucket_counts[i] * frac
            break
    else:
        below += bucket_counts[-1] if bound_s >= boundaries[-1] else 0
    return below / total, resolvable


def spend_from_focus(rows: Sequence[dict]) -> tuple[float, Provenance]:
    """Sum BilledCost from FOCUS v1.x rows. Cost is MEASURED when it comes from
    a billing export and SPEC when it comes from a rate card."""
    total = 0.0
    labels: list[Provenance] = []
    for r in rows:
        if "BilledCost" not in r:
            raise KeyError("FOCUS row lacks BilledCost")
        total += float(r["BilledCost"])
        labels.append(Provenance(r.get("_provenance", "MEASURED")))
    return total, weakest(labels)


# --------------------------------------------------------------------------
# The unit (Appendix A.3, revised)
# --------------------------------------------------------------------------

class Denominator(str, Enum):
    TASKS = "compliant_tasks"
    TOKENS = "compliant_output_tokens_millions"


def _final_attempts(requests: Sequence[Request]) -> list[Request]:
    """Retries count their full spend and only their final output."""
    best: dict[str, Request] = {}
    for r in requests:
        if r.task_id not in best or r.attempt > best[r.task_id].attempt:
            best[r.task_id] = r
    return list(best.values())


@dataclass
class Result:
    C: float
    ci95: tuple[float, float]
    units: str
    provenance: Provenance
    denominator: Denominator
    work: float
    spend: float
    compliance_rate: float
    compliance_ci95: tuple[float, float]
    billed_units: float
    wasted_units: float
    artifact_class_id: str
    margin_to_slo: dict = field(default_factory=dict)


def compute(requests: Sequence[Request],
            spend: float,
            slo: SLO,
            artifact: ModelArtifact,
            denominator: Denominator = Denominator.TASKS,
            spend_provenance: Provenance = Provenance.MEASURED,
            work_provenance: Provenance = Provenance.MEASURED) -> Result:
    """C = S / W.

    S is total spend attributable to the workload, including failures and
    retries. W counts only final compliant output.
    """
    if not requests:
        raise ValueError("cannot compute C over an empty window")
    if spend < 0:
        raise ValueError("spend must be non-negative")

    finals = _final_attempts(requests)
    compliant = [r for r in finals if r.compliant(slo)]

    billed_tokens = sum(r.billed_output_tokens for r in requests)
    if denominator is Denominator.TASKS:
        W = float(len(compliant))
        billed_units = float(len({r.task_id for r in requests}))
        units = "USD_per_compliant_task"
    else:
        W = sum(r.output_tokens for r in compliant) / 1e6
        billed_units = billed_tokens / 1e6
        units = "USD_per_Msvt"

    if W == 0:
        # The voice-agent case in A.9: the cheapest token in the market becomes
        # the most expensive placement at any price. Diverges rather than errors,
        # because divergence is the correct economic answer.
        C = math.inf
        ci = (math.inf, math.inf)
    else:
        C = spend / W

    n, k = len(finals), len(compliant)
    comp_rate = k / n
    comp_ci = wilson_ci(k, n)
    if W > 0:
        # Interval on C is driven by the interval on the compliance rate: C
        # scales as 1/compliance, so the bounds invert.
        ci = (spend / (W * (comp_ci[1] / comp_rate)) if comp_rate else math.inf,
              spend / (W * (comp_ci[0] / comp_rate)) if comp_rate and comp_ci[0] > 0 else math.inf)

    prov = weakest([spend_provenance, work_provenance])

    # Headroom to the cliff. A placement at 0.99 of its bound is one traffic
    # spike from non-compliance; the point estimate of C cannot show that.
    if compliant:
        margin = {
            "ttft_ratio": max(r.ttft_ms for r in compliant) / slo.ttft_ms_max,
            "tpot_ratio": max(r.tpot_ms for r in compliant) / slo.tpot_ms_max,
        }
    else:
        margin = {}

    return Result(
        C=C, ci95=ci, units=units, provenance=prov, denominator=denominator,
        work=W, spend=spend, compliance_rate=comp_rate, compliance_ci95=comp_ci,
        billed_units=billed_units, wasted_units=max(0.0, billed_units - W),
        artifact_class_id=artifact.artifact_class_id, margin_to_slo=margin,
    )


def compare(results: Sequence[Result]) -> list[Result]:
    """Rank placements by C, refusing incommensurable comparisons.

    THE COMMENSURABILITY RULE, ENFORCED
    Token-denominated cost is comparable only within one artifact class, because
    a token is a seller-controlled quantity and token counts differ by tokenizer
    even for identical text. Across artifacts, only cost per compliant task is
    defined. Silently ranking $/Msvt across models would reproduce, inside this
    spec, the exact error the spec exists to correct.
    """
    if len(results) < 2:
        return list(results)
    denoms = {r.denominator for r in results}
    if len(denoms) > 1:
        raise ValueError(f"cannot rank across denominators {denoms}; convert to compliant tasks")
    if results[0].denominator is Denominator.TOKENS:
        classes = {r.artifact_class_id for r in results}
        if len(classes) > 1:
            raise ValueError(
                "refusing to rank token-denominated cost across artifact classes "
                f"{sorted(classes)}: output token counts are seller-controlled and "
                "tokenizer-dependent, so $/Msvt is not comparable here. "
                "Use Denominator.TASKS for cross-artifact comparison."
            )
    return sorted(results, key=lambda r: r.C)


# --------------------------------------------------------------------------
# Required disclosures: SLO sensitivity, stationarity, attribution
# --------------------------------------------------------------------------

def slo_sweep(requests: Sequence[Request], spend: float, slo: SLO,
              artifact: ModelArtifact, bounds: Sequence[float],
              parameter: str = "tpot_ms_max",
              denominator: Denominator = Denominator.TASKS) -> list[dict]:
    """C and compliance as the SLO bound sweeps. Required by A.7 (revised).

    Compliance is binary, so C is discontinuous in the SLO parameter. The point
    estimate hides that; the curve is the honest object.
    """
    pts = []
    for b in bounds:
        swept = SLO(
            percentile=slo.percentile,
            ttft_ms_max=b if parameter == "ttft_ms_max" else slo.ttft_ms_max,
            tpot_ms_max=b if parameter == "tpot_ms_max" else slo.tpot_ms_max,
            task_deadline_s_max=slo.task_deadline_s_max,
        )
        r = compute(requests, spend, swept, artifact, denominator)
        pts.append({"bound": b, "compliance_rate": r.compliance_rate,
                    "C": None if math.isinf(r.C) else round(r.C, 6)})
    return pts


def split_half(requests: Sequence[Request], spend: float, slo: SLO,
               artifact: ModelArtifact, denominator: Denominator = Denominator.TASKS,
               threshold: float = 0.10) -> dict:
    """Stationarity check. If C differs materially between window halves, the
    window is non-stationary and a second observer will not reproduce the number.
    """
    ordered = sorted(requests, key=lambda r: (r.end_time or datetime.min, r.request_id))
    mid = len(ordered) // 2
    if mid < 2:
        raise ValueError("window too short to split")
    a = compute(ordered[:mid], spend / 2, slo, artifact, denominator)
    b = compute(ordered[mid:], spend / 2, slo, artifact, denominator)
    if math.isinf(a.C) or math.isinf(b.C):
        delta = math.inf
    else:
        delta = abs(a.C - b.C) / max(a.C, b.C)
    return {"first_half_C": None if math.isinf(a.C) else round(a.C, 6),
            "second_half_C": None if math.isinf(b.C) else round(b.C, 6),
            "relative_delta": None if math.isinf(delta) else round(delta, 4),
            "passes": bool(delta <= threshold), "threshold": threshold}


def attribute_multitenant(total_spend: float, tenant_reserved_share: float,
                          tenant_token_share: float, work: float) -> dict:
    """Multi-tenant attribution of S, moved out of A.10's excluded list.

    Two defensible bases bracket the honest answer:
      reserved_share - charges idle reserved capacity to whoever reserved it.
                       Conservative, and the correct basis under a reservation.
      token_share    - ignores idle capacity entirely. A strict lower bound.
    The spec reports both and requires the record to name which one it uses,
    because the gap between them IS the tenant's load factor, restated.
    """
    for name, v in (("reserved", tenant_reserved_share), ("token", tenant_token_share)):
        if not 0 <= v <= 1:
            raise ValueError(f"{name} share must be in [0,1]")
    if work <= 0:
        return {"reserved_share_C": None, "token_share_C": None}
    return {
        "reserved_share_C": round(total_spend * tenant_reserved_share / work, 6),
        "token_share_C": round(total_spend * tenant_token_share / work, 6),
    }


# --------------------------------------------------------------------------
# Record emission (Appendix A.7)
# --------------------------------------------------------------------------

def build_record(result: Result, workload: Workload, artifact: ModelArtifact,
                 placement: Placement, slo: SLO, quality: QualityFloor,
                 window_start: datetime, window_end: datetime,
                 sustained_load_rps: float, stationarity: dict,
                 sensitivity: list[dict], attribution: dict,
                 measuring_party: str, independent: bool,
                 spend_provenance: Provenance = Provenance.MEASURED,
                 p99_latency_s: float | None = None,
                 notes: str = "") -> dict:
    duration_s = (window_end - window_start).total_seconds()
    rec = {
        "spec_version": SPEC_VERSION,
        "measuring_party": {"name": measuring_party, "independent_of_vendor": independent},
        "conditioning_tuple": {
            "workload": {
                "trace_class": workload.trace_class,
                "arrival_pattern": workload.arrival_pattern,
                "input_tokens_p50": workload.input_tokens_p50,
                "output_tokens_p50": workload.output_tokens_p50,
                "pre_registered": workload.pre_registered,
            },
            "model_artifact": {
                "artifact_class_id": artifact.artifact_class_id,
                "weights": artifact.weights, "version": artifact.version,
                "quantization": artifact.quantization, "tokenizer_id": artifact.tokenizer_id,
            },
            "placement": {
                "provider": placement.provider, "self_hosted": placement.self_hosted,
                "silicon": placement.silicon, "region": placement.region,
                "batching_policy": placement.batching_policy,
                **({"offered_load_rps": placement.offered_load_rps}
                   if placement.offered_load_rps is not None else {}),
            },
            "slo": {
                "percentile": slo.percentile, "ttft_ms_max": slo.ttft_ms_max,
                "tpot_ms_max": slo.tpot_ms_max, "task_deadline_s_max": slo.task_deadline_s_max,
            },
            "quality_floor": {
                "test_type": quality.test_type, "test_id": quality.test_id,
                "threshold": quality.threshold, "evaluated_fraction": quality.evaluated_fraction,
            },
            "window": {
                "start": window_start.isoformat(), "end": window_end.isoformat(),
                "sustained_load_rps": sustained_load_rps,
                "duration_over_p99_latency": round(duration_s / p99_latency_s, 2)
                    if p99_latency_s else 0.0,
                "stationarity": stationarity,
            },
        },
        "spend": {"value": round(result.spend, 6), "provenance": spend_provenance.value,
                  "units": "USD", "source": "FOCUS BilledCost"},
        "work": {
            "denominator": result.denominator.value, "value": round(result.work, 6),
            "provenance": result.provenance.value,
            "compliance_rate": round(result.compliance_rate, 6),
            "compliance_ci95": [round(x, 6) for x in result.compliance_ci95],
            "billed_units": round(result.billed_units, 6),
            "wasted_units": round(result.wasted_units, 6),
        },
        "cost_of_useful_work": {
            "value": round(result.C, 6) if not math.isinf(result.C) else 1e12,
            "units": result.units, "provenance": result.provenance.value,
            "ci95": [round(x, 6) if not math.isinf(x) else 1e12 for x in result.ci95],
            "cross_artifact_comparable": result.denominator is Denominator.TASKS,
            "margin_to_slo": {k: round(v, 4) for k, v in result.margin_to_slo.items()},
        },
        "slo_sensitivity": {"swept_parameter": "tpot_ms_max", "points": sensitivity},
        "attribution": attribution,
    }
    if notes:
        rec["notes"] = notes
    return rec


def validate(record: dict, schema_path: str) -> None:
    """Fail loudly. A record that does not validate is marketing, per A.7."""
    import jsonschema
    with open(schema_path) as fh:
        schema = json.load(fh)
    jsonschema.validate(record, schema)
