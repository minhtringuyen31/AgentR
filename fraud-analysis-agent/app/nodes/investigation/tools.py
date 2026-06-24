"""Tool specification exposed to the investigation ReAct loop.

`plan_node` embeds TOOL_REGISTRY_SPEC in the LLM system prompt so the model
knows which MCP tools are available and how to call them.

Actual tool execution is handled by `act_node` via `app.mcp_client.call_tool`.

Tables exposed to the agent:
  trans_log     — universe of transactions
  pom_acr       — confirmed-fraud subset (extras: fraud_type, is_loss, report_date)
  user_profile  — 1 row / user (identity + KYC/NFC + trust flags)
  user_journey  — append-only event log per user
"""

TOOL_REGISTRY_SPEC = """\
Available tools (call by name with the listed args; return value is a JSON dict).

Tables exposed to the agent:
  trans_log     : universe of all transactions (time col = reqDate)
  pom_acr       : confirmed-fraud subset (time col = reqDate; extras: fraud_type, is_loss, report_date)
  user_profile  : 1 row / user (identity + KYC/NFC + trust flags; time col = account_created_date)
  user_journey  : event log per user (time col = event_time)

Join order recommendation (per KB):
  trans_log/pom_acr  →  user_profile  →  user_journey
Join keys: userID across all four tables. transID links trans_log ↔ pom_acr.

1. query_with_filters(table, filters?, window?, limit?)
     table   : one of {trans_log, pom_acr, user_profile, user_journey}
     filters : {<column>: <value>, ...}   AND-combined exact match. {} = no filter.
     window  : {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"} on the table's time column.
               Pass null to skip the time filter.
     limit   : optional cap (default 5000 when no filter+window).
   Returns: {count, sample_rows (<= 15)}

2. aggregate(table, dimensions, filters?, window?)
     table      : one of the 4 tables.
     dimensions : [<column>, ...]   group-by columns.
     filters    : optional pre-filter {col: value}.
     window     : optional time window (uses the table's time column).
   Returns: {total_count, total_amount_vnd (only when amount column exists),
             by_<dim>: [{<dim>, count, amount_vnd?}, ...]}

3. compute_metrics(sql_predicate, window?, fraud_types?)
     sql_predicate : single SELECT returning a `transID` column.
                     JOINs with user_profile / user_journey allowed.
                     Examples:
                       "SELECT transID FROM trans_log
                        WHERE bankType='international' AND userChargeAmount>=5000000"
                       "SELECT t.transID FROM trans_log t
                        JOIN user_profile up USING(userID)
                        WHERE t.bankType='international' AND t.userChargeAmount>=5000000
                          AND DATEDIFF(t.reqDate, up.account_created_date) <= 7"
                       "SELECT t.transID FROM trans_log t
                        JOIN user_profile up USING(userID)
                        WHERE t.bankType='international' AND t.userChargeAmount>=5000000
                          AND DATEDIFF(t.reqDate, up.account_created_date) <= 7
                          AND EXISTS (SELECT 1 FROM user_journey j
                                      WHERE j.userID=t.userID AND j.event_type='map_card'
                                        AND j.event_time<t.reqDate
                                        AND TIMESTAMPDIFF(HOUR, j.event_time, t.reqDate) <= 24)"
     window        : optional truth-set time window
     fraud_types   : optional ["CF","AT",...] to restrict truth set
   Returns: {precision, recall, f1, hit_count, total_fraud, total_flagged}

4. raw_sql(sql)
     sql : single READ-ONLY SELECT (writes blocked).
   Returns: {columns, row_count, rows_sample (<= 15)}
"""
