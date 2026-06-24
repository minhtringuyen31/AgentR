"""fetch_data_node — targeted historical retrieval driven by anomaly evidence.

For each evidence entry coming out of `anomaly_check_node` (a dict of
`filters` + an `observation`), this node:

  1. Resolves the investigation window (last month + this month-to-date).
  2. Queries `pom_acr` rows matching `filters` in window (confirmed fraud).
  3. Queries `trans_log` rows matching the same `filters` (universe).
  4. Bundles per-slice counts + sample rows.

The reasoning rules for hypothesis_node are loaded from
`strategy.md` and passed through state (`fetch_strategy_body`).
"""
from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path

from app.mcp_client import call_tool
from app.shared.time_window import compute_investigation_window
from app.state import AgentState


_STRATEGY_PATH = Path(__file__).parent / "strategy.md"


def _read_strategy() -> tuple[int, str]:
    """Return (sample_size, body). Defaults if file missing or unparseable."""
    if not _STRATEGY_PATH.exists():
        return 20, ""

    text = _STRATEGY_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()
    sample_size = 20
    body = text.strip()

    if lines and lines[0].strip() == "---":
        end = next(
            (i for i in range(1, len(lines)) if lines[i].strip() == "---"),
            None,
        )
        if end is not None:
            fm = "\n".join(lines[1:end])
            body = "\n".join(lines[end + 1:]).strip()
            m = re.search(r"sample_size\s*:\s*(\d+)", fm)
            if m:
                sample_size = max(1, int(m.group(1)))

    return sample_size, body


def _slice_key(filters: dict) -> str:
    return "+".join(f"{k}={filters[k]}" for k in sorted(filters))


def fetch_data_node(state: AgentState) -> dict:
    decision = state.get("anomaly_decision") or {}
    evidence_list = decision.get("evidence", []) or []

    _, strategy_body = _read_strategy()
    window = compute_investigation_window(datetime.utcnow())

    slices: dict[str, dict] = {}
    for ev in evidence_list:
        filters = ev.get("filters") or {}
        if not filters:
            continue

        key = _slice_key(filters)
        if key in slices:
            continue

        pom_result = call_tool("query_with_filters", table="pom_acr", filters=filters, window=window)
        trans_result = call_tool("query_with_filters", table="trans_log", filters=filters, window=window)

        slices[key] = {
            "filters": filters,
            "observation": ev.get("observation", ""),
            "pom": {
                "count": pom_result.get("count", 0),
                "sample_rows": pom_result.get("sample_rows", []),
            },
            "trans": {
                "count": trans_result.get("count", 0),
                "sample_rows": trans_result.get("sample_rows", []),
            },
        }

    data_schema = call_tool("get_schema", tables=["trans_log", "pom_acr", "user_profile", "user_journey"])

    return {
        "investigation_window": window,
        "investigation_slices": slices,
        "fetch_strategy_body": strategy_body,
        "data_schema": data_schema,
    }
