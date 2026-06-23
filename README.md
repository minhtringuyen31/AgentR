# AgentR — Fraud Risk AI Agent System

**AgentR** là hệ thống AI agent nội bộ được xây dựng cho đội ngũ **Risk Management** tại **ZaloPay**. Hàng ngày phải đối mặt với bài toán **phát hiện gian** lận trong một hệ thống giao dịch vận hành liên tục, khối lượng lớn và các pattern tấn công không ngừng thay đổi.

Bài toán cốt lõi không phải là thiếu dữ liệu mà là khoảng cách quá lớn giữa lúc một tín hiệu bất thường xuất hiện và lúc nó trở thành một rule thực sự chặn được gian lận. Quy trình truyền thống đòi hỏi strategist phải đọc report, tự điều tra, phân tích data, phát hiển hành vì bất thường tiến đến thiết lập các rule vào hệ thống. Công việc tốn thời gian, dễ bỏ sót và không thể scale kịp tốc độ của fraud.

AgentR giải quyết điều đó bằng cách tự động hóa toàn bộ vòng điều tra: nhận tín hiệu từ stakeholders, tự đặt hypothesis, với bộ skill của fraud risk analysis thực hiện phân tích data để tìm pattern có đủ độ tin cậy, rồi tổng hợp thành rule config sẵn sàng deploy. AgentR sẽ phối hợp cùng strategist để đưa các hành vi, quyết định quan trong trong quy trình.

Ý nghĩa thực sự của dự án không chỉ là tiết kiệm thời gian mà còn giúp đội Risk phản ứng nhanh hơn fraud. Quá trình xử lý được rút ngắn từ **vài ngày** xuống chỉ còn **vài phút**.

#### 🎬 Demo Video [AgentR Demo Video](https://drive.google.com/file/d/1WhqAe3MZY7t7ty3yZCI6fXF9nR2V59Zw/view?usp=sharing)


Kiến trúc hệ thống của **AgentR**:

![system-overview](/docs/system-overview.jpeg)

- **Agent 1 — `fraud-analysis-agent`**  tự động điều tra dữ liệu, phân tích, tìm kiếm các behavior pattern của fraudster từ đó chuẩn bị một báo cáo toàn diện về các trường hợp này.
- **Agent 2 — `config-agent`**  lấy cảm hứng từ **Claude Code**, **Config Agent** hỗ trợ strategist các tác vụ liên quan đến việc set up rule configuration lên hệ thống **Risk Engine**. Từ pattern được đề xuất ở agent 1 (hoặc mô tả của strategist trên khung chat), agent phân tích, suy luận, trao đổi, tương tác với stragist để sinh ra các bộ Rule Config và thực hiện tích hợp vào hệ thống khi được chấp nhận.

---

## 1. Thành phần dự án

| Thư mục | Vai trò                                                                                                                                       | Trạng thái |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------|---|
| **`fraud-analysis-agent/`** | **Risk Analysis Agent** — phát hiện anomaly + điều tra ReAct + sinh RuleJSON, Fraud Analysis Report. FastAPI, port `8080` (map `8081` ngoài). | ✅ Active |
| **`fraud-config-agent-v2/`** | **Config Agent (v2)** — sinh `FraudConfig` rule và ghi MySQL sau human review. FastAPI, port `8080` (map `8081`).                             | ✅ Active |
| `risk-portal-ui/` | Frontend React + Vite (template Metronic 9) cho Risk Portal, gọi `fraud-analysis-agent`. Port `3000`.                                         | ✅ Active |

---

## 2. Agent 1 — `fraud-analysis-agent` (Risk Analysis Agent)

Một agent LangGraph phát hiện làn sóng gian lận mới nổi từ report, điều tra trên warehouse bằng vòng lặp **ReAct**, và phát ra một **RuleJSON** (gợi ý policy) kèm toàn bộ trace điều tra để audit.

### Workflow (StateGraph)

![fraud-analysis-agent-workflow](/docs/fraud-analysis-topology.png)

**Các node** (`app/nodes/`):

- **`ingest`** — parse email / post-mortem JSON thành `FraudContext` (reported_cases, severity, time_hint). _LLM role `ingest`._
- **`anomaly_check`** — query nhiều cửa sổ thời gian (week/month/rolling) theo các chiều `appID, integratedChannel, bankType, bankCode, is_kyc`, áp các trigger rule (amount/count/concentration) định nghĩa trong `anomaly_check/strategy.md`. Trả `AnomalyDecision` và route. _LLM role `anomaly`._ (`baseline.py`)
- **`action_output`** — nếu không anomaly: phát `NoActionReport` rồi kết thúc.
- **Vòng điều tra ReAct** (`investigation/`):
  - **`init_node`** — nạp `kb.md` (catalog metric, threshold, rule template) và `skill.md` (chiến lược thinking + escalation), khởi tạo bộ đếm.
  - **`plan`** — LLM reasoning chọn tool kế tiếp + hypothesis đang test. _LLM role `plan`._
  - **`act`** — chạy tool từ registry: `query_with_filters`, `aggregate`, `compute_metrics`, `raw_sql` (`tools.py`). SQL bị chặn write qua `sql_safety.py`.
  - **`observe`** — LLM phân tích kết quả, ghi `PatternAttempt` với metrics; status được **tính lại bằng code** (`metrics.py`) chứ không tin status do LLM tự khai. _LLM role `observe`._
  - **`router`** — guard vòng lặp: `converged` khi precision rất cao hoặc đã escalate qua ≥2 nguồn dữ liệu; ngược lại `continue` / `max_iter` / `no_pattern`.
- **`finalize_investigation`** — chọn pattern F1 tốt nhất trong các pattern `passed`, dựng `InvestigationReport`.
- **`policy_output`** — dựng `RuleJSON` (`contracts/rulejson.py`) + `pretty_report` markdown (`shared/pretty_report.py`).

State đầy đủ ở `app/state.py` (`AgentState` TypedDict + các Pydantic model: `FraudContext`, `AnomalyDecision`, `PatternAttempt`, `InvestigationStep`, `InvestigationReport`).

### API (`app/service.py`)

| Method | Endpoint | Ghi chú |
|---|---|---|
| POST | `/runs` | Tạo run (async, background task), trả `run_id`. |
| GET | `/runs/{run_id}` | Poll trạng thái + snapshot report. |
| GET | `/runs/{run_id}/stream` | SSE stream các bước điều tra (replay + live). |
| DELETE | `/runs/{run_id}` | Hủy run. |
| GET | `/runs` | List run_id (backend sqlite). |
| POST | `/triggers/email` | Webhook email → normalize → `/runs`. |
| POST | `/triggers/postmortem` | Webhook post-mortem → `/runs`. |
| GET | `/health` | Health probe. |

### Đặc điểm kỹ thuật

- **Tech:** Python ≥3.13, LangGraph, FastAPI/Uvicorn, Pydantic v2, OpenAI-compatible client, SQLAlchemy + PyMySQL, Pandas. Review UI bằng Streamlit (`review_ui.py`, read-only).
- **Checkpointer:** LangGraph SQLite (`checkpoints.db`) mặc định; chọn được `memory` / `postgres` qua env.
- **Warehouse:** MySQL `risk_db` (qua `shared/warehouse.py`); có mock DuckDB/parquet trong `app/data/` cho dev.
- **LLM:** OpenAI-compatible (VNG MAAS / GreenNode AIP…), routing theo role qua `LLM_MODEL_<ROLE>` với fallback `LLM_MODEL`; có `MockLLM` khi `USE_REAL_LLM` chưa bật.
- **Tests:** `tests/test_service.py` (E2E qua TestClient, mock), `scripts/e2e_test.py`, `scripts/test_scenarios.py`.

---

## 3. Agent 2 — `fraud-config-agent-v2` (Config Agent)

Agent chat reasoning biến một fraud signal thành **rule config triển khai được** (`FraudConfig` JSON), tích hợp config và cập nhật vào MySQL `risk_db.rule_config` sau khi người xác nhận. Hai đường vào:

1. **Manual chat** — strategist mô tả pattern bằng ngôn ngữ tự nhiên (hỗ trợ tiếng Việt).
2. **From report** — kéo một run đã hoàn tất của `fraud-analysis-agent` theo `run_id`, đọc `final_pattern` (SQL predicate, signal columns, recommended action) + `recommendation` và **tự reason ra config** (cố ý **không** dùng thẳng `rule_json` của agent kia).

### Workflow (StateGraph + interrupt)

![config-builder-agent-workflow](/docs/config-builder-agent-topology.png)

**Các node** (`agent/nodes.py`):

- **`intake`** (LLM reasoning) — normalize chat text hoặc report đã serialize thành `requirement`; dịch SQL predicate thành mảng `conditions`.
- **`clarify`** (LLM) — hỏi tối đa 1 câu khi thiếu field bắt buộc (`app_id`/`event_name`, `action`, ≥1 condition); history lưu theo session (sửa lỗi multi-turn của V1).
- **`dependency_resolver`** (tool) — dedup mức rule: rule đã tồn tại trong event nào chưa → `create` vs `update`.
- **`build_config`** (LLM reasoning) — phát `FraudConfig` events JSON; khi update thì merge vào event hiện có; nhận lỗi validate trước đó để retry hội tụ.
- **`validator`** (tool) — validate config bằng cách gọi qua internal service để test logic flow trước khi apply vào hệ thống, logic validate + vòng retry
- **`human_review`** — interrupt; strategist approve/reject.
- **`update_conf`** (tool) — khi approve: ghi MySQL `rule_config` (atomic theo event) + lưu file plan `output/` + breadcrumb session.

State ở `agent/state.py` (`ConfigAgentState`). Schema output ở `agent/schema.py`.

### Output: `FraudConfig` JSON

```
FraudConfig → events[]
  Event   → name, description, filter("AND"/"OR"), actionCode, decisionCode, variables[], rules[]
  Rule    → name, description, conditions[], infoCode
  Condition → field, operator, value
  Variable  → fieldName, fieldType("LONG"/"DOUBLE"/"STRING"), source:{keyId}
```

Operator: `GREATER_THAN(_OR_EQUAL)`, `LESS_THAN(_OR_EQUAL)`, `EQUALS`, `NOT_EQUALS`, `CONTAINS`. Field gồm velocity (`count_txn_Xh`, `sum_amount_Xd`…), derived (`account_age` tính bằng giây), static (`ekyc`, `bankCode`, `amount`, `bankType`…). Ví dụ thực tế trong `output/*.json`.

### Services (`services/`)

- **`fraud_report_client.py`** — GET `{FRAUD_AGENT_URL}/runs/{run_id}`, trích `final_pattern` + `recommendation` (có `MockReportClient` cho test).
- **`config_store.py`** — `MySQLConfigStore` (ghi `risk_db.rule_config`) hoặc `MockConfigStore` (in-memory cho CI/demo).
- **`memory_service.py`** — `FileMemoryService` lưu session/clarify/conversation history dưới `sessions/`.

### API (`api/main.py`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/chat` | Đường manual; trả `clarify` hoặc `awaiting_review`. |
| POST | `/runs/from-report` | Kéo report theo `run_id`, build config. |
| GET | `/runs/{id}` | Poll trạng thái + config plan. |
| POST | `/runs/{id}/review` | `{decision: approve\|reject}` — resume qua interrupt. |
| GET | `/runs`, `/rules`, `/configs`, `/sessions`, `/health` | Listings / rule đã deploy / health. |
| GET | `/` | Chat UI tĩnh (`static/index.html`, tiếng Việt). |

### Đặc điểm kỹ thuật

- **Tech:** Python 3.11, LangGraph (+ SqliteSaver), FastAPI/Uvicorn, Pydantic v2, OpenAI SDK, SQLAlchemy + PyMySQL, httpx.
- **CLI:** `cli.py` chạy nhanh local (tự auto-approve để xem hết luồng), dùng MemorySaver.
- **LLM:** OpenAI-compatible VNG MAAS; mặc định `minimax/minimax-m2.5`, role `clarify` dùng `google/gemma-4-31b-it`; có `MockLLM`.
- **Tests:** `tests/` (test_nodes, test_units, test_api, test_graph) — chạy hoàn toàn bằng mock.

---

## 4. Tầng dữ liệu dùng chung (MySQL `risk_db`)

Cả hai agent dùng chung một MySQL warehouse (trong `docker-compose.yml` trỏ tới host GreenNode self-hosted), với data được mock hoàn toàn sử dụng trong phạm vi cuộc thi:

| Bảng | Vai trò                                                                                                              |
|---|----------------------------------------------------------------------------------------------------------------------|
| `trans_log` | Toàn bộ giao dịch                                                                                                    |
| `pom_acr` | Subset fraud đã xác nhận                                                                                             |
| `user_profile` | Thông tin user được lưu trữ đảm bảo policy                                                                           |
| `user_journey` | Sự kiện trước giao dịch (register, login_new_device, change_phone, reset_pin, map_bank, eKYC, change_device…).       |
| `rule_config` | **Output** của Config Agent: rule đã duyệt (event_name, config_json, status, source_run_id, created_by, created_at). |

