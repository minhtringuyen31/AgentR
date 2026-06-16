# Project: AI Agents cho Risk Team

> File này là context cho Claude Code. Đọc kỹ trước khi implement. Nó tổng hợp toàn bộ thiết kế đã chốt cho hai agent của team Risk.

## 1. Mục tiêu

Xây hai AI agent hỗ trợ team Risk, mỗi agent là một service độc lập:

- **Fraud Risk Analysis Agent** — nhận báo cáo fraud (email / post-mortem), tự phân tích historical data, lặp tìm và kiểm chứng pattern đến khi đạt ngưỡng precision/recall, pause chờ strategist duyệt, output policy.
- **Config Agent** — nhận policy đã duyệt (từ Risk Agent) hoặc yêu cầu ngôn ngữ tự nhiên (chat của strategist), phân rã thành các thành phần config, resolve dependency (reuse vs tạo mới), dry-run, rồi deploy vào config-service sau khi strategist confirm. Hoạt động như trợ lý tương tác kiểu Claude Code.

## 2. Nguyên tắc thiết kế (BẮT BUỘC tuân thủ)

1. **Human-in-the-loop là bắt buộc** — mọi quyết định tác động production (duyệt policy, deploy config) phải qua xác nhận con người. Dùng `interrupt_before` của LangGraph.
2. **Tách reasoning khỏi computation** — bước cần suy luận → LLM node; bước cần chính xác (tính metric, thực thi query) → tool node deterministic. KHÔNG để LLM tính metric.
3. **Read before write** — ưu tiên build read-path trước write-path.
4. **Mock-first** — giữ lớp mock (MockLLM, DuckDB) song song lớp thật để chạy CI/test/demo không tốn LLM hay đụng production. `get_llm()` và các tool phải swappable.
5. **Auditability** — state persist qua checkpointer ở mỗi bước.
6. **An toàn khi ghi** — SQL validation, dry-run trước deploy, rollback khi lỗi giữa chừng.

## 3. Kiến trúc tổng thể

- **Hai service độc lập**: `fraud-risk-analysis-agent` và `config-agent`. Deploy riêng, checkpointer riêng, KHÔNG share agent state.
- **Shared library** (`agent-core`): code chung — LangGraph base, LLM client (`get_llm`), checkpointer wrapper, FastAPI scaffolding.
- **Tương tác giữa hai agent**: qua `RuleJSON` contract + policy store. Risk Agent ghi approved policy vào store; strategist trigger handoff → gọi `POST /runs` của Config Agent với `policy_id`; Config Agent fetch policy từ store. KHÔNG gọi nội bộ của nhau, KHÔNG auto-chain (giữ human gate ở giữa).

## 4. Tech stack

| Tầng | Lựa chọn |
|---|---|
| LLM | Claude 3.5 Sonnet; extended thinking cho hypothesis_node và dependency_resolver |
| Agent framework | LangGraph (StateGraph, interrupt_before, conditional edges) |
| State | SqliteSaver (dev) → PostgresSaver (prod) |
| Data (Risk Agent) | DuckDB (local dev, query parquet) → BigQuery/Spark (prod) |
| Service | FastAPI + background task; client poll status |
| Knowledge base (Config Agent) | Vector DB cho RAG schema + config hiện có |
| Deploy | Docker + GitLab CI/CD |

## 5. Risk Analysis Agent — spec

**Status**: đã có skeleton chạy được end-to-end với mock data + DuckDB + FastAPI (tham khảo `risk_agent.zip`). Cần đưa lên production.

**Topology**:
```
START → ingest → fetch_data → hypothesis → sql_gen → metrics → router
router --retry--→ hypothesis
router --escalate/pass--→ human_review → [INTERRUPT] → policy_output → END
```

**Nodes**: `ingest_node`(LLM), `fetch_data_node`(tool), `hypothesis_node`(LLM+thinking, reasoning chính), `sql_gen_node`(LLM→tool), `metrics_node`(tool, deterministic), `router_node`(control, build report trước interrupt), `human_review_node`(interrupt), `policy_output_node`(tool, emit RuleJSON).

**Tools**: `warehouse_query(sql)` kèm `validate_sql()` chặn lệnh ghi; `compute_metrics(matched_ids)`; `get_schema_and_sample()`; `notify_strategist()`.

**Service**: `POST /runs` (trigger, chạy nền), `GET /runs/{id}` (poll status: running/awaiting_review/completed), `POST /runs/{id}/review` (resume), `/triggers/email`, `/triggers/postmortem`.

**Việc cần làm để lên prod**: thay MockLLM→Claude với prompt engineering cho hypothesis; thay DuckDB→warehouse thật; nối ground truth thật vào compute_metrics; cải tiến router track best-so-far (hiện agent nới pattern liên tục không nhớ pattern tốt nhất).

## 6. Config Agent — spec

**Status**: CHƯA build. Build read-path (đến validator) trước, write-path (update_conf) sau.

**Mô hình phụ thuộc component** (để deploy 1 Rule, mọi thành phần phía dưới phải tồn tại trước):
```
Profile → Tier → Rule → Condition → Variable → {Event, Accumulation key → Event}
```

**Topology**:
```
START → intake → planner → dependency_resolver → build_config → validator → router
router --ambiguous--→ clarify (interrupt hỏi lại) → intake
router --ok--→ human_review (interrupt confirm) → update_conf → END
```

**Nodes**:
- `intake_node` (LLM): normalize policy/chat → requirement chuẩn
- `planner_node` (LLM): liệt kê component cần, dựa knowledge base
- `dependency_resolver` (LLM+tool): reuse vs tạo mới, sắp create_order theo dependency
- `build_config` (LLM): chuẩn bị JSON config từ component + previous state
- `validator_node` (LLM+tool): dry-run qua config-service, đọc kết quả
- `clarify_loop` (interrupt): hỏi lại strategist khi requirement mơ hồ
- `human_review_node` (interrupt): confirm config plan
- `update_conf` (tool): lưu config theo thứ tự dependency, atomic + rollback

**Thành phần riêng**: knowledge base (RAG schema + config hiện có để tái dùng, tránh tạo trùng variable/accumulation key); config-service client (query/dry-run/update); transaction/rollback layer.

## 7. Build order (theo rủi ro tăng dần)

- **Giai đoạn 0** (BLOCKING, làm trước): chốt 3 prerequisite ở mục 8.
- **Giai đoạn 1**: Risk Analysis Agent lên production (read-only, rủi ro thấp).
- **Giai đoạn 2**: Config Agent build-path, dừng trước `update_conf` (chỉ output config plan, không ghi).
- **Giai đoạn 3**: Config Agent write-path (`update_conf` + rollback).
- **Giai đoạn 4**: nối pipeline (Risk→Config), knowledge base/RAG, observability, scale.

Luôn dùng thin vertical slice: chạy 1 use case xuyên suốt end-to-end trước, rồi mới làm sâu từng node.

## 8. Open prerequisites — CẦN XÁC NHẬN TRƯỚC KHI CODE NHIỀU

1. **Ground truth fraud labels** nằm ở đâu — trong warehouse sẵn hay join từ post-mortem DB? Có sẵn lúc agent chạy không? (ảnh hưởng `metrics_node`)
2. **config-service** đã có machine-readable schema + dry-run API chưa? (prerequisite sống còn của Config Agent)
3. **RuleJSON contract** — format chính xác. Đây là interface giữa hai agent, ảnh hưởng `policy_output_node` (Risk) và `intake_node` (Config). Định nghĩa ở `contracts/rulejson_schema.py`.

## 9. Coding conventions

- Python 3.12, LangGraph, Pydantic v2, FastAPI.
- `get_llm(thinking=bool)` trả MockLLM mặc định, ClaudeLLM khi `USE_REAL_LLM=1`. Stateless (đọc iteration từ prompt) để an toàn concurrent.
- Mọi SQL do LLM sinh phải qua `validate_sql()` trước khi execute.
- Node trả về partial state update (dict), không mutate state.
- Tool có signature ổn định, đổi implementation bên trong khi lên prod (DuckDB→warehouse).
- Test E2E qua FastAPI TestClient cho mỗi service.
