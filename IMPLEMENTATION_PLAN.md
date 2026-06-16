# Implementation Plan

## Giai đoạn 1 — Risk Analysis Agent lên production

- [x] Viết prompt thật cho `hypothesis_node` (extended thinking). Test chất lượng pattern trên data mẫu thật.
- [x] Viết prompt cho `ingest_node` và `sql_gen_node`.
- [x] Đổi `warehouse_query()` trỏ warehouse thật (giữ DuckDB cho dev qua env flag). _Stub `WAREHOUSE_BACKEND=warehouse`, cần nối client thật._
- [x] Nối ground truth thật vào `compute_metrics()` (theo kết quả prerequisite #1). _Switch `GROUND_TRUTH_SOURCE=column|postmortem`._
- [x] Cải tiến `router_node`: track best-so-far, escalate kèm pattern tốt nhất thay vì pattern cuối.
- [x] Đổi checkpointer SqliteSaver → PostgresSaver cho prod. _Switch `CHECKPOINTER_BACKEND=sqlite|postgres|memory`._
- [x] Implement trigger thật: email listener + post-mortem DB event → `POST /runs`. _Endpoints sẵn sàng, normalize payload._
- [x] Review UI tối thiểu (Streamlit): hiện report, nút approve/reject → `POST /review`.
- [x] Test E2E qua TestClient. _6/6 pass, cover pass + escalate + 2 trigger endpoints._

## Giai đoạn 2 — Config Agent build-path (KHÔNG ghi)

- [ ] Scaffold `services/config-agent/` dùng `agent-core`.
- [ ] Định nghĩa `AgentState` (CLAUDE.md mục 6).
- [ ] Implement knowledge base: schema tĩnh các component + client query config-service lấy component hiện có.
- [ ] `intake_node`: nhận policy (RuleJSON) hoặc chat, normalize thành requirement.
- [ ] `planner_node`: liệt kê component cần theo cây phụ thuộc.
- [ ] `dependency_resolver`: so khớp knowledge base, phân loại reuse/tạo mới, sắp `create_order`.
- [ ] `build_config`: dựng JSON config từ component đã resolve.
- [ ] `validator_node`: gọi dry-run API config-service, đọc kết quả.
- [ ] `clarify_loop`: interrupt hỏi lại khi requirement mơ hồ, resume sau câu trả lời.
- [ ] `human_review_node`: interrupt confirm config plan.
- [ ] **DỪNG Ở ĐÂY**: output config plan để strategist tự áp dụng tay. Chưa implement `update_conf`.
- [ ] Service layer + chat interface. Test E2E với config-service sandbox.

## Giai đoạn 3 — Config Agent write-path

- [ ] Implement `update_conf`: deploy component theo `create_order`.
- [ ] Transaction/rollback: nếu lỗi giữa chừng, rollback các component đã tạo.
- [ ] Test kỹ rollback trên sandbox trước khi cho chạy production.
- [ ] Bật write-path sau khi dry-run + human review đã vững.

## Giai đoạn 4 — Pipeline + hoàn thiện

- [ ] Policy store: Risk Agent `policy_output_node` ghi approved policy theo RuleJSON contract.
- [ ] Handoff: UI Risk Agent có nút "Triển khai" → gọi `POST /runs` Config Agent với `policy_id`.
- [ ] Knowledge base nâng cấp: vector DB cho RAG, retrieve component tái dùng.
- [ ] Scale nếu cần: tách Celery worker, PostgresSaver dùng chung.
- [ ] Observability đầy đủ cho cả hai service.

## Lưu ý cho Claude Code

- Mỗi giai đoạn chạy được độc lập, đừng nhảy cóc sang write-path khi read-path chưa vững.
- Giữ mock layer xuyên suốt — đừng xóa MockLLM/DuckDB khi lên prod, dùng env flag.
- Mỗi node mới: viết test trước khi nối vào graph.
- Tham khảo skeleton Risk Agent làm khuôn mẫu cho Config Agent (cùng pattern state/nodes/tools/graph/service).
