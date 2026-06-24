"""act_node — dispatch the planned tool call via MCP server and attach observation.

Pure dispatcher; no LLM. Failures land as `{"error": ...}` in the
observation so the loop can recover instead of crashing.
"""
from __future__ import annotations

from app.mcp_client import TOOL_NAMES, call_tool
from app.state import AgentState

OBSERVATION_TRUNCATE_KEYS = ("sample_rows", "rows_sample")


def _truncate_observation(obs: dict, cap: int = 15) -> dict:
    out = dict(obs)
    for key in OBSERVATION_TRUNCATE_KEYS:
        if isinstance(out.get(key), list) and len(out[key]) > cap:
            out[key] = out[key][:cap]
    return out


def act_node(state: AgentState) -> dict:
    step = dict(state.get("current_step") or {})
    tool_name = step.get("tool")
    args = step.get("args") or {}

    if tool_name not in TOOL_NAMES:
        step["observation"] = {
            "error": f"unknown tool {tool_name!r}; valid: {sorted(TOOL_NAMES)}"
        }
        return {"current_step": step}

    try:
        result = call_tool(tool_name, **args)
    except Exception as e:  # noqa: BLE001
        result = {"error": f"{type(e).__name__}: {e}"}

    step["observation"] = _truncate_observation(result)
    return {"current_step": step}
