# Risk Analysis Agent — Context Handoff

> Snapshot of state on 2026-06-13. Use this to bootstrap a fresh session.

---

## 1. Goal (recap)

LangGraph agent for the Risk team. Two agents total — this repo covers the
**Risk Analysis Agent** only (Config Agent is Phase 2 / 3 of overall plan,
not started). Agent receives weekly fraud reports, detects trend
anomalies, runs deep investigation to find detection patterns, pauses for
strategist review, outputs `RuleJSON` for handoff to Config Agent.

---

## 2. Current graph topology

```
START → ingest → anomaly_check ──── normal ────→ action_output → END
                       │
                       └── anomalous ─→ fetch_data → [INVESTIGATION SUB-GRAPH — TO BUILD]
                                                          ↓
                                                    human_review → policy_output → END
```

`investigation_router` will hand off the winning pattern to `human_review`
which still uses LangGraph `interrupt_before`.

---

## 3. What's done

### Phase 1 — Risk Analysis Agent baseline
| Task | Status |
|---|---|
| Port skeleton from `risk_agent.zip` into `fraud-risk-analysis-agent/app/{state,contracts,data,llm,tools,nodes,graph,service,main}` | ✅ |
| Production prompts (ingest / hypothesis / sql_gen) | ✅ (hypothesis/sql_gen will be replaced by investigation sub-graph) |
| env-flag warehouse / checkpointer / ground-truth source | ✅ |
| router_node best-so-far tracking | ✅ |
| Trigger endpoints `/triggers/email` + `/triggers/postmortem` | ✅ |
| Streamlit review UI (`review_ui.py`) | ✅ |
| E2E tests via TestClient | ✅ (will need rewrite after sub-graph) |

### Node-by-node refactor
| Node | Status | Notes |
|---|---|---|
| `ingest_node` | ✅ | 4-section prompt (ROLE/SCHEMA/RULES/EXAMPLES), 2 few-shot, mirrors `pom_acr` schema. `FraudContext.reported_cases: list[dict]` (no enum, no schema). |
| `anomaly_check_node` | ✅ | Multi-window (9 windows) trigger engine using `anomaly_strategy.md` frontmatter (`dimensions: [...]`) + rules A1-A7 / B1-B6 / C1-C7. Outputs structured `evidence: list[AnomalyEvidence]` with multi-field filters. |
| `action_output_node` | ✅ | Builds `NoActionReport` for the "no anomaly" branch. |
| `fetch_data_node` | ✅ | Targeted retrieval driven by `anomaly_decision.evidence`. For each evidence, queries pom_acr + trans_log with filters in window `[first_day_of_prev_month, today]`. Strategy loaded from `fetch_strategy.md`. |
| `hypothesis_node` / `sql_gen_node` / `metrics_node` / `router_node` | 🗑 To be deleted (replaced by investigation sub-graph) |
| `human_review_node` | ✅ Keep as-is | LangGraph `interrupt_before`. |
| `policy_output_node` | ⚠️ Needs adapt | Currently reads old `final_report`; will read `final_pattern` from `InvestigationReport`. |

### Database layer
- MySQL backend on GreenNode (`49.213.71.37:3306`, db `risk_db`)
- `app/data/seed_mysql.py` seeds 50k `trans_log` + ~2.8k `pom_acr` rows
- `app/tools/warehouse.py` uses SQLAlchemy + PyMySQL with URL-encoded credentials
- DuckDB path fully removed
- DB has `risk_db` schema created but **tables not yet seeded** — user needs to run `uv run python -m app.data.seed_mysql`

---

## 4. State shape (current)

```python
class AgentState(TypedDict, total=False):
    # ingest
    source_type: Literal["email", "postmortem"]
    raw_input: str
    fraud_context: dict   # FraudContext.model_dump() — includes reported_cases

    # anomaly_check
    baseline_window: dict           # prev_week window for backwards compat
    baseline_summary: dict          # prev_week period summary
    reported_summary: dict          # current_week period summary
    anomaly_decision: dict          # AnomalyDecision (evidence: list[AnomalyEvidence])
    no_action_report: dict          # NoActionReport (only set on "normal" branch)

    # fetch_data
    investigation_window: dict      # [first_day_of_prev_month, today]
    investigation_slices: dict      # {evidence_key: {filters, observation, pom, trans}}
    fetch_strategy_body: str        # body of fetch_strategy.md
    data_schema: dict               # {"trans_log": [ColumnInfo], "pom_acr": [...]}

    threshold_config: dict

    # === TO BE ADDED for investigation sub-graph ===
    # investigation_kb_body: str
    # investigation_skill_body: str
    # investigation_log: list[dict]
    # patterns_attempted: list[dict]
    # current_hypothesis: dict | None
    # investigation_iteration: int
    # investigation_stop_reason: str | None
    # investigation_report: dict

    # output
    final_report: dict              # legacy — will become investigation_report
    rule_json: dict
    run_id: str
```

Key Pydantic models in `app/state.py`:
- `FraudContext` — ingest output
- `AnomalyEvidence` — `filters: dict + observation: str`
- `AnomalyDecision` — `is_anomalous, confidence, reasoning, evidence: list[AnomalyEvidence]`
- `NoActionReport` — terminal report on no-anomaly branch
- `PatternHypothesis`, `MetricsResult`, `ThresholdConfig`, `PatternReport` — legacy, will be replaced by investigation models

---

## 5. Tools available

`app/tools/` re-exports:

| Tool | Purpose |
|---|---|
| `warehouse_query(sql)` | Raw SELECT on MySQL (with `validate_sql`) |
| `validate_sql(sql)` | Block writes (INSERT/UPDATE/etc) |
| `resolve_time_window(time_hint, now)` | NL → ISO date range |
| `compute_investigation_window(now)` | `[first_day_of_prev_month, today]` |
| `compute_baseline_window(now)` | `[today - BASELINE_DAYS, today]` (used by anomaly_check) |
| `fetch_all_windows(now)` | 9-window batch query for anomaly_check |
| `query_pom_acr(fraud_types, window)` | Filter pom_acr by fraud_type IN + window |
| `query_baseline_pom_acr(window)` | Filter pom_acr by window only |
| `query_with_filters(table, filters, window)` | Generic multi-field filter |
| `aggregate_pom_acr(df, sample_n, top_k)` | Rich aggregate (top_channels, quantiles, hour_of_day, etc.) |
| `aggregate_by(df, dimensions)` | Group by dims, return count + amount_vnd |
| `count_by(df, dimensions)` | Count per value per dimension |
| `universe_profile(window)` | trans_log baseline aggregates |
| `get_schema(tables)` | DESCRIBE result normalized |
| `compute_metrics(matched_ids, window, fraud_types)` | precision / recall / f1 |
| `notify_strategist(summary)` | stdout notification stub |

---

## 6. Strategy files (markdown-driven config)

| File | Read by | Frontmatter | Body purpose |
|---|---|---|---|
| `app/nodes/anomaly_strategy.md` | `anomaly_check_node` | `dimensions: [appID, integratedChannel, bankType, bankCode, is_kyc]` | Triggers A1-A7, B1-B6, C1-C7 + dimension→schema mapping + confidence guidance |
| `app/nodes/fetch_strategy.md` | `fetch_data_node` | `sample_size: 20` | Pattern-finding hints (passed to investigation via `fetch_strategy_body` state) |
| `docs/Fraud_Analysis_Knowledge.md` | **TO INJECT** into investigation sub-graph | — | **Full KB from user — 854 lines, 2 parts** |
| `app/nodes/investigation_kb.md` | TO BUILD | — | Will mirror `docs/Fraud_Analysis_Knowledge.md` Part 2 (sections 4-20) |
| `app/nodes/investigation_skill.md` | TO BUILD | — | User will provide later |

---

## 7. Knowledge base contents (high-level summary)

`docs/Fraud_Analysis_Knowledge.md` has two parts:

### Part 1 — Fraud Trend Detection (already mapped to anomaly_check)
- 6 dimensions: appID, payment flow, source of fund, BIN, issuer bank, user segment (eKYC/non-eKYC)
- Trigger sets: amount (7 rules), count (6 rules), concentration risk (7 rules)
- Already encoded as A/B/C trigger sets in `anomaly_strategy.md`

### Part 2 — Fraud Pattern Mining (drives investigation sub-graph)
- 3 data sources: `translog` → `user_profile` → `user_journey` (escalation order)
- 13-step thinking flow: identify scope → fraud sample → base population → metrics → simple rules → eval → join profile → eval → join journey → eval → recommend
- Metric families: user-level velocity, card-level, BIN-level, device-level, IP-level, time interval, amount pattern
- Acceptance criteria 3 levels: Reject (P≥90%, R≥20%), Challenge (P≥70%), Targeted (P≥95%)
- Action mapping: monitor / challenge / reject / blacklist / whitelist exclusion
- Required output: fraud scope, pattern findings, candidate rules tested (with metrics), 1-3 recommended rules
- Default threshold tables (amount, count, journey, time windows)
- Hard rules: don't combine too early, don't only optimize recall, must compute precision + good user impact, no look-ahead bias

---

## 8. Investigation sub-graph design (agreed, NOT YET BUILT)

User answers from this session:

| Decision | Choice |
|---|---|
| Architecture | Sub-graph LangGraph (plan → act → observe → router → plan) |
| Tools registry | ALL tools (incl. raw_sql) |
| Stop condition | max_iter + threshold pass + LLM self-declare done |
| KB / skill format | Markdown files (will mirror strategy.md pattern) |
| Old nodes | DELETE `hypothesis.py`, `sql_gen.py`, `metrics.py`, `router.py` |

### Planned nodes
1. `investigation_init` — load KB + skill markdown, reset state
2. `plan_node` — LLM picks next tool + args + hypothesis being tested
3. `act_node` — dispatch tool call (query_with_filters / aggregate / compute_metrics / raw_sql)
4. `observe_node` — LLM reads observation, refines hypothesis, appends `PatternAttempt`, decides continue/stop
5. `investigation_router` — route "continue" / "converged" / "max_iter" / "no_pattern"
6. `finalize_investigation` — build `InvestigationReport` from patterns_tried + log

### Tool registry (JSON-friendly args, returned to LLM as observations)
- `query_with_filters(table, filters, window?) → {count, sample_rows (capped 15)}`
- `aggregate(table, filters?, window?, dimensions) → {total, by_<dim>}`
- `compute_metrics(sql_predicate, window?, fraud_types?) → {precision, recall, f1, ...}`
- `raw_sql(sql) → {columns, rows_sample, row_count}` (validate_sql)

### Pydantic models to add
```python
class PatternAttempt(BaseModel):
    iteration: int
    description: str
    sql_predicate: str
    signal_columns: list[str]
    rationale: str
    metrics: MetricsResult | None
    status: Literal["candidate", "passed", "failed", "abandoned"]
    notes: str = ""

class InvestigationStep(BaseModel):
    iteration: int
    plan: str
    action: dict             # {tool, args}
    observation_summary: str
    next_thought: str

class InvestigationReport(BaseModel):
    patterns_attempted: list[PatternAttempt]
    final_pattern: PatternAttempt | None
    stop_reason: Literal["converged", "max_iter", "no_pattern", "self_declared"]
    iteration_count: int
    investigation_log: list[InvestigationStep]
    recommendation: str
```

---

## 9. File structure

```
fraud-risk-analysis-agent/
  app/
    state.py
    main.py                     # CLI entry
    service.py                  # FastAPI service
    contracts/rulejson.py
    data/
      mock_data.py              # generate() — used by seed_mysql
      seed_mysql.py             # seeds MySQL via SQLAlchemy
    llm/
      __init__.py
      base.py                   # OpenAILLM (no Mock anymore — user removed)
    tools/
      __init__.py               # re-exports
      sql_safety.py
      warehouse.py              # MySQL via SQLAlchemy
      time_window.py
      baseline.py               # fetch_all_windows + compute_baseline_window
      historical.py             # query_pom_acr / query_with_filters / aggregate_pom_acr / aggregate_by / count_by
      universe.py
      schema.py
      metrics.py
      notify.py
    nodes/
      __init__.py               # re-exports
      ingest.py
      anomaly_check.py
      anomaly_strategy.md       # ← user edits this
      action_output.py
      fetch_data.py
      fetch_strategy.md         # ← user edits this
      human_review.py
      policy_output.py
      hypothesis.py             # 🗑 delete in next phase
      sql_gen.py                # 🗑 delete
      metrics.py                # 🗑 delete
      router.py                 # 🗑 delete
      investigation_init.py     # ← TO BUILD
      plan.py                   # ← TO BUILD
      act.py                    # ← TO BUILD
      observe.py                # ← TO BUILD
      investigation_router.py   # ← TO BUILD
      finalize_investigation.py # ← TO BUILD
      investigation_kb.md       # ← TO BUILD (placeholder for user to fill from docs/Fraud_Analysis_Knowledge.md Part 2)
      investigation_skill.md    # ← TO BUILD (user will provide)
    graph/__init__.py           # ← wire sub-graph
  tests/test_service.py
  review_ui.py
  pyproject.toml                # MySQL deps (sqlalchemy, pymysql); duckdb removed
docs/
  Fraud_Analysis_Knowledge.md   # ← 854 lines, full KB (read this for content)
  ai-agents-risk-team-doc.docx  # original team doc
  Fraud Analysis Knowledge.docx # docx version of above
.env                            # MYSQL_* + LLM_* (gitignored)
.env.example                    # template
docker-compose.yml              # agent + fraud-risk-analysis-agent + ui (NO mysql service — DB self-hosted)
```

---

## 10. Env (in `.env`)

```
LLM_API_KEY=<set>
LLM_MODEL=google/gemma-4-31b-it
LLM_BASE_URL=https://maas-llm-aiplatform-hcm.api.vngcloud.vn/v1

MYSQL_HOST=49.213.71.37
MYSQL_PORT=3306
MYSQL_DB=risk_db
MYSQL_USER=root
MYSQL_PASSWORD=agentdb@123
```

Optional / runtime:
- `WAREHOUSE_BACKEND=mysql` (default)
- `CHECKPOINTER_BACKEND=sqlite` (default) / `postgres`
- `BASELINE_DAYS=7` (anomaly_check baseline window)
- `GROUND_TRUTH_SOURCE=pom_acr` (default) / `column`

---

## 11. Open prerequisites (still need user input)

1. **Seed MySQL** — connection verified, `risk_db` schema exists but tables empty. Run:
   ```bash
   cd fraud-risk-analysis-agent
   uv run python -m app.data.seed_mysql
   ```
2. **Investigation skill content** — user will provide separately (markdown text or another docx).
3. **Investigation KB content** — agreed to mirror `docs/Fraud_Analysis_Knowledge.md` Part 2 into `app/nodes/investigation_kb.md`.
4. **Decide raw_sql tool safety** — user picked "all tools incl. raw_sql". Need to confirm if `validate_sql` (block writes) is enough or want more guardrails (row limit / timeout / explain).

---

## 12. Resume points

To resume in a new session:

1. Read this file + `docs/Fraud_Analysis_Knowledge.md` Part 2 (sections 4-20).
2. Read `app/state.py` for current types and `app/graph/__init__.py` for current wiring.
3. Read `app/nodes/anomaly_check.py` + `app/nodes/anomaly_strategy.md` to see the strategy-file pattern.
4. Read `app/nodes/fetch_data.py` to see the evidence-driven retrieval pattern.
5. Confirm with user: ready to build investigation sub-graph? If yes:
   - Create `app/nodes/investigation_kb.md` (start by copying KB Part 2 sections 1-20)
   - Wait for user's `investigation_skill.md` content
   - Then code the 6 sub-graph nodes + tool registry + state additions
   - Delete old nodes (`hypothesis.py`, `sql_gen.py`, `metrics.py`, `router.py`)
   - Adapt `policy_output_node` to read `final_pattern` from `InvestigationReport`
   - Rewire `app/graph/__init__.py`
   - Rewrite `tests/test_service.py`

---

## 13. User preferences observed

- **Just start, don't stall** — when given a direct command, execute with reasonable defaults instead of clarifying.
- **Ask before big actions** — for major refactors / new sub-graphs, propose plan + ask before coding (user said "nhớ hỏi tôi trước khi action").
- Prefers **strategy.md files** with frontmatter for tunable config + body for LLM prompt injection.
- Prefers **deleting old code** when replaced rather than keeping as reference.
- Wants tools generic, not auto-aggregate hidden behavior (e.g. they asked to replace `aggregate_pom_acr` calls with explicit `count_by(dimensions)` in anomaly_check).
- Vietnamese + English mixed input; prompts ask for Vietnamese summaries.
