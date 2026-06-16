import { AgentTraceEvent, CreateRunPayload, EmailTriggerPayload, PostmortemTriggerPayload, RunOut } from './agentService';

// ─── Mock dataset ─────────────────────────────────────────────────────────────

const MOCK_RUNS: RunOut[] = [
  {
    run_id: 'a1b2c3d4',
    status: 'completed',
    anomaly_decision: {
      is_anomalous: true,
      confidence: 0.91,
      reasoning:
        'Disbursement volume in VN-HCM cluster spiked 3.4× vs baseline over 48 h. Device reuse rate exceeded 60%.',
      evidence: [
        { filters: { region: 'VN-HCM' }, observation: 'Disbursement count: 1,240 vs baseline 365' },
        { filters: { metric: 'device_reuse' }, observation: 'Unique device ratio dropped from 0.88 to 0.38' },
      ],
    },
    investigation_window: { start: '2026-06-10T00:00:00', end: '2026-06-12T23:59:59', column: 'reqDate' },
    investigation_report: {
      patterns_attempted: [
        {
          iteration: 1,
          description: 'Multiple accounts sharing the same device_id within 24 h',
          sql_predicate: "device_id IN (SELECT device_id FROM events GROUP BY device_id HAVING COUNT(DISTINCT user_id) > 3)",
          signal_columns: ['device_id', 'user_id', 'event_time'],
          rationale: 'Device reuse is a strong synthetic identity signal.',
          metrics: { precision: 0.71, recall: 0.58, f1: 0.64, hit_count: 312, total_fraud: 540, total_flagged: 440 },
          recommended_action: 'challenge',
          status: 'failed',
          notes: 'Precision below 0.80 threshold.',
        },
        {
          iteration: 2,
          description: 'Device reuse AND application within 30 min of account creation',
          sql_predicate: "device_id IN (SELECT device_id FROM events GROUP BY device_id HAVING COUNT(DISTINCT user_id) > 3) AND TIMESTAMPDIFF(MINUTE, created_at, event_time) < 30",
          signal_columns: ['device_id', 'user_id', 'created_at', 'event_time'],
          rationale: 'Adding time constraint reduces false positives from shared family devices.',
          metrics: { precision: 0.84, recall: 0.63, f1: 0.72, hit_count: 340, total_fraud: 540, total_flagged: 405 },
          recommended_action: 'reject',
          status: 'passed',
          notes: 'Both thresholds met. Converged.',
        },
      ],
      final_pattern: {
        iteration: 2,
        description: 'Device reuse AND application within 30 min of account creation',
        sql_predicate: "device_id IN (SELECT device_id FROM events GROUP BY device_id HAVING COUNT(DISTINCT user_id) > 3) AND TIMESTAMPDIFF(MINUTE, created_at, event_time) < 30",
        signal_columns: ['device_id', 'user_id', 'created_at', 'event_time'],
        rationale: 'Adding time constraint reduces false positives from shared family devices.',
        metrics: { precision: 0.84, recall: 0.63, f1: 0.72, hit_count: 340, total_fraud: 540, total_flagged: 405 },
        recommended_action: 'reject',
        status: 'passed',
        notes: 'Both thresholds met. Converged.',
      },
      stop_reason: 'converged',
      iteration_count: 2,
      investigation_log: [
        {
          iteration: 1,
          plan_thought: 'Start with the simplest device-reuse signal mentioned in the report.',
          tool: 'aggregate',
          args: {
            table: 'trans_log',
            dimensions: ['device_id'],
            filters: { region: 'VN-HCM' },
            window: { start: '2026-06-10', end: '2026-06-12' },
          },
          hypothesis_being_tested: 'device_id shared by >3 users',
          observation: {
            total_count: 1240,
            by_device_id_top5: [
              { device_id: 'dev_a8f2', count: 24, amount_vnd: 412000000 },
              { device_id: 'dev_c031', count: 18, amount_vnd: 305000000 },
              { device_id: 'dev_77b9', count: 15, amount_vnd: 271000000 },
            ],
          },
          next_thought: 'Precision too low. Add time window to reduce family-device noise.',
        },
        {
          iteration: 2,
          plan_thought: 'Refine with account-creation time delta to cut family-device FPs.',
          tool: 'compute_metrics',
          args: {
            sql_predicate:
              "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE t.device_id IN (SELECT device_id FROM trans_log GROUP BY device_id HAVING COUNT(DISTINCT userID) > 3) AND TIMESTAMPDIFF(MINUTE, up.account_created_date, t.reqDate) < 30",
            window: { start: '2026-06-10', end: '2026-06-12' },
          },
          hypothesis_being_tested: 'device reuse within 30 min of account creation',
          observation: {
            precision: 0.84,
            recall: 0.63,
            f1: 0.72,
            hit_count: 340,
            total_fraud: 540,
            total_flagged: 405,
          },
          next_thought: 'Thresholds met. Finalise pattern.',
        },
      ],
      recommendation:
        'Deploy rule fraud_device_reuse_new_account with action=reject. Monitor weekly for precision drift.',
    },
    no_action_report: null,
    rule_json: {
      rule_name: 'fraud_device_reuse_new_account',
      fraud_type: 'Synthetic identity / device sharing',
      sql_predicate: "device_id IN (SELECT device_id FROM events GROUP BY device_id HAVING COUNT(DISTINCT user_id) > 3) AND TIMESTAMPDIFF(MINUTE, created_at, event_time) < 30",
      description: 'Device reuse AND application within 30 min of account creation',
      signal_columns: ['device_id', 'user_id', 'created_at', 'event_time'],
      recommended_action: 'reject',
      metrics: { precision: 0.84, recall: 0.63, f1: 0.72 },
      iteration_count: 2,
      status: 'suggested',
      emitted_at: '2026-06-15T08:47:22Z',
      source_run_id: 'a1b2c3d4',
    },
    pretty_report:
      `# Risk Analysis Agent — Investigation Report\n` +
      `- **Run ID:** a1b2c3d4\n- **Source:** email\n- **Emitted at:** 2026-06-15T08:47:22Z\n\n---\n\n` +
      `## Anomaly Check\n- **Decision:** **ANOMALOUS**\n- **Confidence:** 0.91\n\n` +
      `**Reasoning:**\n> Disbursement volume in VN-HCM cluster spiked 3.4× vs baseline over 48 h. Device reuse rate exceeded 60%.\n\n` +
      `**Evidence:**\n\n| # | Filters | Observation |\n|---|---|---|\n` +
      `| 1 | \`{"region":"VN-HCM"}\` | Disbursement count: 1,240 vs baseline 365 |\n` +
      `| 2 | \`{"metric":"device_reuse"}\` | Unique device ratio dropped from 0.88 to 0.38 |\n\n---\n\n` +
      `## Investigation Overview\n- **Stop reason:** converged\n- **Iterations:** 2\n- **Patterns attempted:** 2\n\n` +
      `> Deploy rule fraud_device_reuse_new_account with action=reject. Monitor weekly for precision drift.\n\n` +
      `## Patterns Attempted\n| # | Status | Description | Precision | Recall | F1 | Action |\n|---|---|---|---|---|---|---|\n` +
      `| 1 | failed | Multiple accounts sharing device_id within 24h | 0.7100 | 0.5800 | 0.6400 | challenge |\n` +
      `| 2 | passed | Device reuse AND application within 30 min of account creation | 0.8400 | 0.6300 | 0.7200 | reject |\n\n` +
      `## Final Pattern\n- **Description:** Device reuse AND application within 30 min of account creation\n- **Status:** passed\n- **Recommended action:** reject\n\n` +
      `**Metrics:** P=0.8400  R=0.6300  F1=0.7200  hits=340/540  flagged=405\n\n` +
      `**SQL:**\n\`\`\`sql\nSELECT t.transID FROM trans_log t JOIN user_profile up USING(userID)\nWHERE t.device_id IN (SELECT device_id FROM trans_log GROUP BY device_id HAVING COUNT(DISTINCT userID) > 3)\n  AND TIMESTAMPDIFF(MINUTE, up.account_created_date, t.reqDate) < 30\n\`\`\`\n`,
  },
  {
    run_id: 'e5f6g7h8',
    status: 'completed',
    anomaly_decision: {
      is_anomalous: false,
      confidence: 0.87,
      reasoning:
        'Reported loan spike is within ±1.5 SD of 30-day baseline. Seasonal effect from end-of-month salary cycle explains the variance.',
      evidence: [
        { filters: { metric: 'loan_count' }, observation: 'Current: 820, Baseline avg: 740, SD: 55' },
      ],
    },
    investigation_window: null,
    investigation_report: null,
    no_action_report: {
      decision: {
        is_anomalous: false,
        confidence: 0.87,
        reasoning: 'Within baseline variance.',
        evidence: [],
      },
      baseline_window: { start: '2026-05-01', end: '2026-05-31', column: 'reqDate' },
      reported_summary: { loan_count: 820, avg_amount: 4200000 },
      baseline_summary: { loan_count: 740, avg_amount: 4150000 },
      recommendation:
        'No rule required. Variance is within seasonal norms. Re-evaluate if trend persists beyond 7 days.',
      emitted_at: '2026-06-14T14:23:11Z',
    },
    rule_json: null,
    pretty_report:
      `# Risk Analysis Agent — No-Action Report\n` +
      `- **Run ID:** e5f6g7h8\n- **Source:** email\n- **Emitted at:** 2026-06-14T14:23:11Z\n\n---\n\n` +
      `## Anomaly Check\n- **Decision:** **NOT ANOMALOUS**\n- **Confidence:** 0.87\n\n` +
      `**Reasoning:**\n> Reported loan spike is within ±1.5 SD of 30-day baseline. Seasonal effect from end-of-month salary cycle explains the variance.\n\n` +
      `**Evidence:**\n\n| # | Filters | Observation |\n|---|---|---|\n` +
      `| 1 | \`{"metric":"loan_count"}\` | Current: 820, Baseline avg: 740, SD: 55 |\n\n---\n\n` +
      `## Conclusion\n> No rule required. Variance is within seasonal norms. Re-evaluate if trend persists beyond 7 days.\n\n` +
      `- **Baseline window:** 2026-05-01 → 2026-05-31\n`,
  },
  {
    run_id: 'i9j0k1l2',
    status: 'completed',
    anomaly_decision: {
      is_anomalous: true,
      confidence: 0.95,
      reasoning:
        'GPS coordinates for 78% of disbursements cluster within 200 m radius despite claimed addresses spanning 3 provinces.',
      evidence: [
        { filters: { product: 'installment' }, observation: '78% of GPS coords within 200 m of lat 10.762, lng 106.660' },
        { filters: { metric: 'address_mismatch' }, observation: 'Claimed address province ≠ GPS province in 61% of cases' },
      ],
    },
    investigation_window: { start: '2026-06-08T00:00:00', end: '2026-06-12T23:59:59', column: 'reqDate' },
    investigation_report: {
      patterns_attempted: [
        {
          iteration: 1,
          description: 'GPS coordinates within 500 m radius of known spoofing hotspot',
          sql_predicate: "ST_DISTANCE_SPHERE(POINT(gps_lng, gps_lat), POINT(106.660, 10.762)) < 500",
          signal_columns: ['gps_lat', 'gps_lng', 'user_id'],
          rationale: 'Initial broad sweep around hotspot coordinates.',
          metrics: { precision: 0.68, recall: 0.79, f1: 0.73, hit_count: 610, total_fraud: 770, total_flagged: 897 },
          recommended_action: 'challenge',
          status: 'failed',
          notes: 'Precision 0.68 below threshold 0.80.',
        },
        {
          iteration: 2,
          description: 'GPS hotspot AND address province mismatch',
          sql_predicate: "ST_DISTANCE_SPHERE(POINT(gps_lng, gps_lat), POINT(106.660, 10.762)) < 500 AND address_province != gps_province",
          signal_columns: ['gps_lat', 'gps_lng', 'address_province', 'gps_province'],
          rationale: 'Combining spatial and administrative mismatch cuts FPs significantly.',
          metrics: { precision: 0.88, recall: 0.74, f1: 0.81, hit_count: 570, total_fraud: 770, total_flagged: 648 },
          recommended_action: 'blacklist',
          status: 'passed',
          notes: 'Both thresholds met.',
        },
      ],
      final_pattern: {
        iteration: 2,
        description: 'GPS hotspot AND address province mismatch',
        sql_predicate: "ST_DISTANCE_SPHERE(POINT(gps_lng, gps_lat), POINT(106.660, 10.762)) < 500 AND address_province != gps_province",
        signal_columns: ['gps_lat', 'gps_lng', 'address_province', 'gps_province'],
        rationale: 'Combining spatial and administrative mismatch cuts FPs significantly.',
        metrics: { precision: 0.88, recall: 0.74, f1: 0.81, hit_count: 570, total_fraud: 770, total_flagged: 648 },
        recommended_action: 'blacklist',
        status: 'passed',
        notes: 'Both thresholds met.',
      },
      stop_reason: 'converged',
      iteration_count: 2,
      investigation_log: [
        {
          iteration: 1,
          plan_thought: 'Query GPS cluster around reported hotspot.',
          tool: 'aggregate',
          args: {
            table: 'trans_log',
            dimensions: ['gps_province'],
            filters: { product: 'installment' },
            window: { start: '2026-06-08', end: '2026-06-12' },
          },
          hypothesis_being_tested: 'GPS spoofing from single hotspot',
          observation: {
            total_count: 897,
            by_gps_province_top3: [
              { gps_province: 'HCM', count: 610, amount_vnd: 1240000000 },
              { gps_province: 'HN', count: 138, amount_vnd: 240000000 },
              { gps_province: 'DN', count: 149, amount_vnd: 251000000 },
            ],
          },
          next_thought: 'Precision low. Add province mismatch filter.',
        },
        {
          iteration: 2,
          plan_thought: 'Combine GPS proximity with administrative mismatch.',
          tool: 'compute_metrics',
          args: {
            sql_predicate:
              "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE ST_DISTANCE_SPHERE(POINT(t.gps_lng, t.gps_lat), POINT(106.660, 10.762)) < 500 AND up.address_province != t.gps_province",
            window: { start: '2026-06-08', end: '2026-06-12' },
          },
          hypothesis_being_tested: 'GPS hotspot + province mismatch',
          observation: {
            precision: 0.88,
            recall: 0.74,
            f1: 0.81,
            hit_count: 570,
            total_fraud: 770,
            total_flagged: 648,
          },
          next_thought: 'Converged. Emit rule.',
        },
      ],
      recommendation: 'Deploy rule fraud_gps_spoofing_hotspot with action=blacklist.',
    },
    no_action_report: null,
    rule_json: {
      rule_name: 'fraud_gps_spoofing_hotspot',
      fraud_type: 'GPS location spoofing',
      sql_predicate: "ST_DISTANCE_SPHERE(POINT(gps_lng, gps_lat), POINT(106.660, 10.762)) < 500 AND address_province != gps_province",
      description: 'GPS hotspot AND address province mismatch',
      signal_columns: ['gps_lat', 'gps_lng', 'address_province', 'gps_province'],
      recommended_action: 'blacklist',
      metrics: { precision: 0.88, recall: 0.74, f1: 0.81 },
      iteration_count: 2,
      status: 'suggested',
      emitted_at: '2026-06-12T16:44:05Z',
      source_run_id: 'i9j0k1l2',
    },
    pretty_report:
      `# Risk Analysis Agent — Investigation Report\n` +
      `- **Run ID:** i9j0k1l2\n- **Source:** email\n- **Emitted at:** 2026-06-12T16:44:05Z\n\n---\n\n` +
      `## Anomaly Check\n- **Decision:** **ANOMALOUS**\n- **Confidence:** 0.95\n\n` +
      `**Reasoning:**\n> GPS coordinates for 78% of disbursements cluster within 200 m radius despite claimed addresses spanning 3 provinces.\n\n` +
      `**Evidence:**\n\n| # | Filters | Observation |\n|---|---|---|\n` +
      `| 1 | \`{"product":"installment"}\` | 78% of GPS coords within 200 m of lat 10.762, lng 106.660 |\n` +
      `| 2 | \`{"metric":"address_mismatch"}\` | Claimed address province ≠ GPS province in 61% of cases |\n\n---\n\n` +
      `## Investigation Overview\n- **Stop reason:** converged\n- **Iterations:** 2\n- **Patterns attempted:** 2\n\n` +
      `> Deploy rule fraud_gps_spoofing_hotspot with action=blacklist.\n\n` +
      `## Patterns Attempted\n| # | Status | Description | Precision | Recall | F1 | Action |\n|---|---|---|---|---|---|---|\n` +
      `| 1 | failed | GPS coords within 500m of spoofing hotspot | 0.6800 | 0.7900 | 0.7300 | challenge |\n` +
      `| 2 | passed | GPS hotspot AND address province mismatch | 0.8800 | 0.7400 | 0.8100 | blacklist |\n\n` +
      `## Final Pattern\n- **Description:** GPS hotspot AND address province mismatch\n- **Status:** passed\n- **Recommended action:** blacklist\n\n` +
      `**Metrics:** P=0.8800  R=0.7400  F1=0.8100  hits=570/770  flagged=648\n\n` +
      `**SQL:**\n\`\`\`sql\nSELECT t.transID FROM trans_log t JOIN user_profile up USING(userID)\nWHERE ST_DISTANCE_SPHERE(POINT(t.gps_lng, t.gps_lat), POINT(106.660, 10.762)) < 500\n  AND up.address_province != t.gps_province\n\`\`\`\n`,
  },
  {
    run_id: 'm3n4o5p6',
    status: 'running',
    anomaly_decision: {
      is_anomalous: true,
      confidence: 0.89,
      reasoning: 'Synthetic identity signals detected in new user cohort registered past 72 h.',
      evidence: [
        { filters: { cohort: 'new_users_72h' }, observation: 'ID document hash collision rate: 4.2% vs baseline 0.1%' },
      ],
    },
    investigation_window: { start: '2026-06-13T00:00:00', end: '2026-06-16T10:45:00', column: 'reqDate' },
    investigation_report: {
      patterns_attempted: [
        {
          iteration: 1,
          description: 'Duplicate national ID hash across multiple user accounts',
          sql_predicate: "id_hash IN (SELECT id_hash FROM users GROUP BY id_hash HAVING COUNT(*) > 1)",
          signal_columns: ['id_hash', 'user_id', 'created_at'],
          rationale: 'Same ID used to register multiple accounts.',
          metrics: { precision: 0.76, recall: 0.81, f1: 0.78, hit_count: 198, total_fraud: 245, total_flagged: 260 },
          recommended_action: 'challenge',
          status: 'failed',
          notes: 'Precision 0.76 below 0.80 threshold. Refining.',
        },
      ],
      final_pattern: null,
      stop_reason: 'no_pattern',
      iteration_count: 1,
      investigation_log: [
        {
          iteration: 1,
          plan_thought: 'Check for duplicate national ID hashes as primary signal.',
          tool: 'query_with_filters',
          args: {
            table: 'user_profile',
            filters: {},
            window: { start: '2026-06-13', end: '2026-06-16' },
            limit: 20,
          },
          hypothesis_being_tested: 'id_hash collision',
          observation: {
            count: 260,
            sample_rows: [
              { userID: 7218, cccd_hash: 'h_8a2f...', linked_card: 1, nfc_status: 'none' },
              { userID: 7219, cccd_hash: 'h_8a2f...', linked_card: 1, nfc_status: 'none' },
            ],
          },
          next_thought: 'Precision marginal. Try adding phone number reuse as secondary signal.',
        },
      ],
      recommendation: 'Investigation in progress…',
    },
    no_action_report: null,
    rule_json: null,
    pretty_report: null,
  },
  {
    run_id: 'q7r8s9t0',
    status: 'failed',
    anomaly_decision: null,
    investigation_window: null,
    investigation_report: null,
    no_action_report: null,
    rule_json: null,
    pretty_report: 'Agent encountered an internal error during the fetch_data node. Check warehouse connectivity.',
  },
  {
    run_id: '84afd742',
    status: 'completed',
    anomaly_decision: {
      is_anomalous: true,
      confidence: 0.95,
      reasoning:
        "Fraud trong kỳ hiện tại có dấu hiệu bất thường rõ rệt với nhiều trigger bị kích hoạt. Tổng amount tháng hiện tại (M0) tăng hơn 7 lần so với tháng trước (M-1), vượt xa ngưỡng 30% (trigger A2). Đồng thời, amount tuần hiện tại (W0) tăng mạnh so với trung bình 4 tuần và tuần trước (trigger A3, A4). Đặc biệt, rủi ro tập trung (concentration risk) cực cao khi bankCode='ZPCC' và bankType='international' chiếm gần như toàn bộ (99.8%) tổng fraud amount của tuần này, vượt xa các ngưỡng cảnh báo 30-50% (trigger C3, C5, C6).",
      evidence: [
        {
          filters: { bankCode: 'ZPCC' },
          observation:
            "Fraud amount W0 = 3,681M VND, chiếm 99.8% tổng amount W0 (vượt trigger C3: 30% và C5: 40%). Lượng tăng thêm so với W-1 là 687M VND, chiếm 100.9% tổng lượng tăng (vượt trigger C4: ngưỡng 30%).",
        },
        {
          filters: { bankType: 'international' },
          observation:
            "Fraud amount W0 = 3,681M VND, chiếm 99.8% tổng amount W0 (vượt trigger C6: ngưỡng 50%). Số lượng giao dịch (count) cũng tăng mạnh so với trung bình 4 tuần (238 so với 70, vượt trigger B3: ngưỡng 50%).",
        },
      ],
    },
    investigation_window: { start: '2026-05-01T00:00:00', end: '2026-06-14T23:59:59', column: 'reqDate' },
    investigation_report: {
      patterns_attempted: [
        {
          iteration: 6,
          description: 'Test user velocity rule: total amount user/24h ≥ 10M VND on international card',
          sql_predicate:
            "SELECT t.transID FROM trans_log t WHERE t.bankType='international' AND t.total_amount_user_24h >= 10000000",
          signal_columns: ['bankType', 'total_amount_user_24h'],
          rationale:
            'Previous rule (single transaction amount ≥ 10M) had high recall (61%) but low precision (51%). Adding velocity (total amount user/24h) should improve precision while maintaining recall.',
          metrics: { precision: 0.511, recall: 0.612, f1: 0.557, hit_count: 319, total_fraud: 521, total_flagged: 624 },
          recommended_action: 'monitor',
          status: 'failed',
          notes:
            'Precision 51% far below 80% target. Recall 61% meets 60% target but not enough. Need to add more conditions or escalate to profile/journey.',
        },
        {
          iteration: 7,
          description:
            "Kết hợp velocity (amount ≥ 10M) với điều kiện profile (account_age ≤ 7d hoặc non-NFC) sẽ cải thiện precision đáng kể trong khi vẫn giữ recall ≥ 60%.",
          sql_predicate:
            "SELECT t.transID FROM trans_log t WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000",
          signal_columns: ['bankCode', 'userChargeAmount'],
          rationale:
            "Rule bankCode='ZPCC' + amount ≥ 10M có precision 51% (thấp hơn 80% target) nhưng recall 61% (đạt 60% target). Đã test nhiều rule translog-only mà precision vẫn dưới 70%. Theo KB, cần escalate lên user_profile để tìm điều kiện profile bổ sung.",
          metrics: { precision: 0.511, recall: 0.612, f1: 0.557, hit_count: 319, total_fraud: 521, total_flagged: 624 },
          recommended_action: 'none',
          status: 'failed',
          notes: 'Auto-recorded: LLM did not record this compute_metrics call.',
        },
        {
          iteration: 8,
          description: "Kết hợp bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d",
          sql_predicate:
            "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000 AND DATEDIFF(t.reqDate, up.account_created_date) <= 7",
          signal_columns: ['bankCode', 'userChargeAmount', 'account_age'],
          rationale:
            "Rule bankCode='ZPCC' + amount ≥ 10M có precision 51% nhưng recall 61%. Thêm điều kiện account_age ≤ 7d để lọc các account mới mà fraud tập trung, cải thiện precision lên 94.15%.",
          metrics: { precision: 0.942, recall: 0.587, f1: 0.723, hit_count: 306, total_fraud: 521, total_flagged: 325 },
          recommended_action: 'reject',
          status: 'passed',
          notes:
            "Precision 94.15% vượt 80% target, đạt mức reject rule (>=90%). Recall 58.73% gần đạt 60% target. Good user impact rất thấp (19 FP / 325 total flagged = 5.8%). Rule này có thể áp dụng tại checkpoint payment-authorization để reject gian lận.",
        },
      ],
      final_pattern: {
        iteration: 8,
        description: "Kết hợp bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d",
        sql_predicate:
          "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000 AND DATEDIFF(t.reqDate, up.account_created_date) <= 7",
        signal_columns: ['bankCode', 'userChargeAmount', 'account_age'],
        rationale:
          "Rule bankCode='ZPCC' + amount ≥ 10M có precision 51% nhưng recall 61%. Thêm điều kiện account_age ≤ 7d để lọc các account mới mà fraud tập trung, cải thiện precision lên 94.15%.",
        metrics: { precision: 0.942, recall: 0.587, f1: 0.723, hit_count: 306, total_fraud: 521, total_flagged: 325 },
        recommended_action: 'reject',
        status: 'passed',
        notes:
          "Precision 94.15% vượt 80% target, đạt mức reject rule (>=90%). Recall 58.73% gần đạt 60% target. Good user impact rất thấp (19 FP / 325 total flagged = 5.8%). Rule này có thể áp dụng tại checkpoint payment-authorization để reject gian lận.",
      },
      stop_reason: 'self_declared',
      iteration_count: 8,
      investigation_log: [
        {
          iteration: 1,
          plan_thought:
            "Đây là iteration 1. Cần bắt đầu bằng việc hiểu cấu trúc của mẫu fraud trong phạm vi đã xác định (bankCode='ZPCC' và bankType='international'). Trước tiên dùng aggregate để xem phân bố fraud theo các chiều quan trọng trong trans_log (appID, transStatus).",
          tool: 'aggregate',
          args: {
            table: 'pom_acr',
            dimensions: ['appID', 'transStatus'],
            filters: { bankCode: 'ZPCC', bankType: 'international' },
            window: { start: '2026-05-01', end: '2026-06-14' },
          },
          hypothesis_being_tested:
            "Fraud tập trung cao tại bankCode='ZPCC' và bankType='international' - cần hiểu cấu trúc cơ bản",
          observation: {
            total_count: 505,
            total_amount_vnd: 7587819342,
            by_transStatus: [{ transStatus: 1, count: 505, amount_vnd: 7587819342 }],
            by_appID_top5: [
              { appID: 5210, count: 77, amount_vnd: 1157550682 },
              { appID: 3677, count: 55, amount_vnd: 912733247 },
              { appID: 4118, count: 52, amount_vnd: 810790762 },
              { appID: 356,  count: 54, amount_vnd: 762306085 },
              { appID: 149,  count: 50, amount_vnd: 746170562 },
            ],
          },
          next_thought:
            "Tôi thấy tất cả 505 giao dịch đều có transStatus=1 (thành công). Cần xem xét thêm các chiều phân tích khác như amount band, issuer bank (qua BIN), và đặc biệt là cần biết fraud được đánh dấu như thế nào trong hệ thống này.",
        },
        {
          iteration: 2,
          plan_thought:
            "Từ iteration 1, thấy 505 giao dịch fraud đều có transStatus=1, phân bố trên nhiều appID. Bây giờ cần hiểu thêm về time pattern. Dùng aggregate để xem phân bố theo month và week.",
          tool: 'aggregate',
          args: {
            table: 'pom_acr',
            dimensions: ['transStatus', 'month', 'week'],
            filters: { bankCode: 'ZPCC', bankType: 'international' },
            window: { start: '2026-05-01', end: '2026-06-14' },
          },
          hypothesis_being_tested: 'Fraud có pattern về amount (gần limit, round number) hoặc time concentration',
          observation: {
            total_count: 505,
            by_month: [
              { month: '2026-06', count: 435, amount_vnd: 6674988543 },
              { month: '2026-05', count: 70,  amount_vnd: 912830799  },
            ],
            by_week: [
              { week: '2026-06-08', count: 235, amount_vnd: 3681277954 },
              { week: '2026-06-01', count: 200, amount_vnd: 2993710589 },
              { week: '2026-05-25', count: 68,  amount_vnd: 912263309  },
              { week: '2026-05-18', count: 1,   amount_vnd: 515095     },
              { week: '2026-05-11', count: 1,   amount_vnd: 52395      },
            ],
          },
          next_thought:
            "Fraud tập trung hoàn toàn vào tháng 6/2026 (86%), đặc biệt tuần 2026-06-08 và 2026-06-01. Tất cả giao dịch đều thành công. Cần kiểm tra amount distribution (round number, gần limit) và xem có các trường deviceID/IP/BIN không.",
        },
        {
          iteration: 3,
          plan_thought:
            "Từ iteration 2, fraud tập trung hoàn toàn vào tháng 6/2026 và bankType='international'. Cần kiểm tra amount distribution để tìm pattern về round number hoặc amount gần limit.",
          tool: 'aggregate',
          args: {
            table: 'pom_acr',
            dimensions: ['appID'],
            filters: { bankCode: 'ZPCC', bankType: 'international' },
            window: { start: '2026-05-01', end: '2026-06-14' },
          },
          hypothesis_being_tested: 'Fraud có pattern amount đặc biệt (round number hoặc gần limit)',
          observation: {
            total_count: 505,
            total_amount_vnd: 7587819342,
            by_appID_top10: [
              { appID: 5210, count: 77, amount_vnd: 1157550682 },
              { appID: 3677, count: 55, amount_vnd: 912733247  },
              { appID: 4118, count: 52, amount_vnd: 810790762  },
              { appID: 356,  count: 54, amount_vnd: 762306085  },
              { appID: 149,  count: 50, amount_vnd: 746170562  },
              { appID: 3555, count: 45, amount_vnd: 712580429  },
              { appID: 148,  count: 47, amount_vnd: 667497404  },
              { appID: 5001, count: 46, amount_vnd: 639729957  },
              { appID: 2391, count: 40, amount_vnd: 625660665  },
              { appID: 4012, count: 39, amount_vnd: 552799549  },
            ],
          },
          next_thought:
            "Kết quả aggregate cho thấy fraud phân bố đều trên nhiều appID (77 trans ở appID cao nhất trên tổng 505). Cần chuyển sang phân tích amount distribution để kiểm tra round number pattern.",
        },
        {
          iteration: 4,
          plan_thought:
            "Cần truy vấn trực tiếp các giá trị amount của giao dịch fraud để phát hiện pattern round number hoặc amount gần limit. Dùng raw_sql để lấy mẫu amount và phân tích distribution.",
          tool: 'raw_sql',
          args: {
            sql: "SELECT userChargeAmount, COUNT(*) as cnt, SUM(userChargeAmount) as total_amount FROM pom_acr WHERE bankCode='ZPCC' AND bankType='international' AND reqDate >= '2026-05-01' AND reqDate <= '2026-06-14' GROUP BY userChargeAmount ORDER BY cnt DESC LIMIT 30",
          },
          hypothesis_being_tested: 'Fraud có pattern amount đặc biệt (round number hoặc gần limit)',
          observation: {
            row_count: 30,
            note: 'All amounts unique (cnt=1 each) — no round-number repetition pattern detected',
            sample_amounts: [11690636, 7793111, 11841575, 29465093, 4784635, 19315710, 19257616, 12216595, 12360068, 12240081, 28919679, 7790195, 11656148, 8371711, 7818303],
          },
          next_thought:
            "Kết quả cho thấy amount pattern (round number hoặc same amount repetition) KHÔNG phải là pattern mạnh - mỗi giao dịch fraud có unique amount, không có sự lặp lại. Sẽ chuyển sang test user overlap pattern.",
        },
        {
          iteration: 5,
          plan_thought:
            "Từ iteration 4, amount pattern đã được test và KHÔNG phải là pattern. Bây giờ cần chuyển sang test user overlap (nhiều fraud user trên cùng appID, user velocity) và fail pattern.",
          tool: 'raw_sql',
          args: {
            sql: "SELECT appID, COUNT(DISTINCT userID) as distinct_user_count, COUNT(*) as trans_count, SUM(userChargeAmount) as total_amount FROM pom_acr WHERE bankCode='ZPCC' AND bankType='international' AND reqDate >= '2026-05-01' AND reqDate <= '2026-06-14' GROUP BY appID ORDER BY distinct_user_count DESC LIMIT 20",
          },
          hypothesis_being_tested: 'Fraud có user overlap pattern (nhiều fraud user trên cùng appID)',
          observation: {
            row_count: 10,
            rows_sample: [
              { appID: 5210, distinct_user_count: 40, trans_count: 77, total_amount: 1157550682 },
              { appID: 3677, distinct_user_count: 36, trans_count: 55, total_amount: 912733247  },
              { appID: 356,  distinct_user_count: 35, trans_count: 54, total_amount: 762306085  },
              { appID: 4118, distinct_user_count: 34, trans_count: 52, total_amount: 810790762  },
              { appID: 149,  distinct_user_count: 33, trans_count: 50, total_amount: 746170562  },
            ],
          },
          next_thought:
            "Có một số appID có nhiều distinct user (40, 36, 35...). Nhưng đây mới chỉ là thống kê fraud, chưa so sánh với good users. Cần tính metrics cho candidate rule về user velocity với compute_metrics.",
        },
        {
          iteration: 6,
          plan_thought:
            "Test rule: tổng amount user trong 24h ≥ 10M VND trên slice international card để xem pattern này có phân biệt được fraud vs good không.",
          tool: 'compute_metrics',
          args: {
            sql_predicate:
              "SELECT t.transID FROM trans_log t WHERE t.bankType='international' AND t.total_amount_user_24h >= 10000000",
            window: { start: '2026-05-01', end: '2026-06-14' },
            fraud_types: null,
          },
          hypothesis_being_tested:
            "User velocity pattern - tổng amount user/24h ≥ 10M VND trên slice international card là signal cho fraud",
          observation: { precision: 0.5112, recall: 0.6123, f1: 0.5572, hit_count: 319, total_fraud: 521, total_flagged: 624 },
          next_thought:
            "Precision chỉ 51% nhưng recall đạt 61% - high recall nhưng precision quá thấp để reject. Cần cải thiện precision bằng cách thêm điều kiện. Đây vẫn là translog-only pattern - sẽ test rule velocity trước khi escalation lên user_profile.",
        },
        {
          iteration: 7,
          plan_thought:
            "Từ iteration 6, rule với amount ≥ 10M trên international card có precision 51% nhưng recall 61%. Sẽ test kết hợp bankCode='ZPCC' (chiếm 99.8% fraud amount) với amount ≥ 10M.",
          tool: 'compute_metrics',
          args: {
            sql_predicate:
              "SELECT t.transID FROM trans_log t WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000",
            window: { start: '2026-05-01', end: '2026-06-14' },
            fraud_types: null,
          },
          hypothesis_being_tested:
            "bankCode='ZPCC' + amount ≥ 10M sẽ cải thiện precision so với chỉ bankType='international'",
          observation: { precision: 0.5112, recall: 0.6123, f1: 0.5572, hit_count: 319, total_fraud: 521, total_flagged: 624 },
          next_thought:
            "Rule bankCode='ZPCC' + amount ≥ 10M có precision 51% (thấp hơn 80% target) nhưng recall 61% (đạt 60% target). Đã test nhiều rule translog-only mà precision vẫn dưới 70%. Theo KB §7, cần escalate lên user_profile để tìm điều kiện profile bổ sung (account_age, NFC status, CCCD multi-account) giúp cải thiện precision.",
        },
        {
          iteration: 8,
          plan_thought:
            "Từ iteration 7, rule bankCode='ZPCC' + amount ≥ 10M có precision 51% nhưng recall 61%. Đã test nhiều rule translog-only. Theo KB §7, cần escalate lên user_profile. Sẽ test kết hợp với điều kiện account_age ≤ 7d để cải thiện precision.",
          tool: 'compute_metrics',
          args: {
            sql_predicate:
              "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000 AND DATEDIFF(t.reqDate, up.account_created_date) <= 7",
            window: { start: '2026-05-01', end: '2026-06-14' },
            fraud_types: null,
          },
          hypothesis_being_tested:
            "Kết hợp bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d sẽ cải thiện precision đáng kể",
          observation: { precision: 0.9415, recall: 0.5873, f1: 0.7234, hit_count: 306, total_fraud: 521, total_flagged: 325 },
          next_thought:
            "Precision 94.15% vượt 80% target, đạt mức reject rule (>=90%). Recall 58.73% gần đạt 60% target. Good user impact rất thấp (19 FP / 325 total flagged = 5.8%). Rule này có thể áp dụng tại checkpoint payment-authorization để reject gian lận.",
        },
      ],
      recommendation:
        "Deploy rule fraud_zpcc_new_account_high_amount với action=reject tại checkpoint payment-authorization. Monitor tuần đầu để xác nhận precision ổn định trên production data. Recall 58.73% gần đạt target — có thể mở rộng account_age ≤ 14d trong sprint tiếp theo để tăng coverage.",
    },
    no_action_report: null,
    rule_json: {
      rule_name: 'fraud_zpcc_new_account_high_amount',
      fraud_type: 'CF',
      sql_predicate:
        "SELECT t.transID FROM trans_log t JOIN user_profile up USING(userID) WHERE t.bankCode='ZPCC' AND t.userChargeAmount >= 10000000 AND DATEDIFF(t.reqDate, up.account_created_date) <= 7",
      description: "Kết hợp bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d",
      signal_columns: ['bankCode', 'userChargeAmount', 'account_age'],
      recommended_action: 'reject',
      metrics: { precision: 0.942, recall: 0.587, f1: 0.723 },
      iteration_count: 8,
      status: 'suggested',
      emitted_at: '2026-06-14T15:17:14Z',
      source_run_id: '84afd742',
    },
    pretty_report:
      `# Risk Analysis Agent — Investigation Report\n` +
      `- **Run ID:** 84afd742\n- **Source:** email\n- **Emitted at:** 2026-06-14T15:17:14Z\n\n---\n\n` +
      `## Anomaly Check\n- **Decision:** **ANOMALOUS**\n- **Confidence:** 0.95\n\n` +
      `**Reasoning:**\n> Fraud trong kỳ hiện tại có dấu hiệu bất thường rõ rệt với nhiều trigger bị kích hoạt. ` +
      `Tổng amount tháng hiện tại (M0) tăng hơn 7 lần so với tháng trước (M-1), vượt xa ngưỡng 30% (trigger A2). ` +
      `Đặc biệt, rủi ro tập trung (concentration risk) cực cao khi bankCode='ZPCC' và bankType='international' ` +
      `chiếm gần như toàn bộ (99.8%) tổng fraud amount của tuần này.\n\n` +
      `**Evidence:**\n\n| # | Filters | Observation |\n|---|---|---|\n` +
      `| 1 | \`{"bankCode":"ZPCC"}\` | Fraud amount W0 = 3,681M VND, chiếm 99.8% tổng amount W0 (vượt C3: 30% và C5: 40%) |\n` +
      `| 2 | \`{"bankType":"international"}\` | Số lượng giao dịch tăng mạnh so với avg 4 tuần (238 vs 70, vượt B3: 50%) |\n\n---\n\n` +
      `## Investigation Overview\n- **Stop reason:** self_declared\n- **Iterations:** 8\n- **Patterns attempted:** 3\n\n` +
      `> Deploy rule fraud_zpcc_new_account_high_amount với action=reject tại checkpoint payment-authorization.\n\n` +
      `## Patterns Attempted\n| # | Status | Description | Precision | Recall | F1 | Action |\n|---|---|---|---|---|---|---|\n` +
      `| 6 | failed | Test user velocity: total_amount_user/24h ≥ 10M on international | 0.5110 | 0.6120 | 0.5570 | monitor |\n` +
      `| 7 | failed | bankCode='ZPCC' + amount ≥ 10M | 0.5110 | 0.6120 | 0.5570 | none |\n` +
      `| 8 | passed | bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d | 0.9420 | 0.5870 | 0.7230 | reject |\n\n` +
      `## Final Pattern\n- **Description:** Kết hợp bankCode='ZPCC' + amount ≥ 10M + account_age ≤ 7d\n- **Status:** passed\n- **Recommended action:** reject\n\n` +
      `**Metrics:** P=0.9420  R=0.5870  F1=0.7230  hits=306/521  flagged=325\n\n` +
      `**SQL:**\n\`\`\`sql\nSELECT t.transID FROM trans_log t JOIN user_profile up USING(userID)\nWHERE t.bankCode='ZPCC'\n  AND t.userChargeAmount >= 10000000\n  AND DATEDIFF(t.reqDate, up.account_created_date) <= 7\n\`\`\`\n\n` +
      `**Rationale:**\n> Rule translog-only có precision 51% nhưng recall 61%. Thêm điều kiện account_age ≤ 7d để lọc các account mới mà fraud tập trung, cải thiện precision lên 94.15%.\n`,
  },
];

// ─── Simulated delay ──────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Mock API functions (same interface as agentService.ts) ───────────────────

export const listRuns = async (): Promise<string[]> => {
  await delay(150);
  return MOCK_RUNS.map((r) => r.run_id);
};

export const getRun = async (runId: string): Promise<RunOut> => {
  await delay(200);
  const run = MOCK_RUNS.find((r) => r.run_id === runId);
  if (!run) throw new Error(`Run ${runId} not found`);
  return run;
};

export const createRun = async (_payload: CreateRunPayload): Promise<RunOut> => {
  await delay(500);
  return MOCK_RUNS[3]; // return the "running" run as demo
};

export const triggerEmail = async (_payload: EmailTriggerPayload): Promise<RunOut> => {
  await delay(600);
  return MOCK_RUNS[3];
};

const INCIDENT_RUN_MAP: Record<string, string> = {
  'INC-2026-0614-ZPCC': '84afd742',
  'INC-2026-0612-DEV':  'a1b2c3d4',
  'INC-2026-0612-GPS':  'i9j0k1l2',
  'INC-2026-0614-KYC':  'm3n4o5p6',
};

export const triggerPostmortem = async (payload: PostmortemTriggerPayload): Promise<RunOut> => {
  await delay(600);
  const runId = payload.incident_id ? INCIDENT_RUN_MAP[payload.incident_id] : undefined;
  const run = runId ? MOCK_RUNS.find((r) => r.run_id === runId) : undefined;
  return run ?? MOCK_RUNS[3];
};

export const healthCheck = async (): Promise<boolean> => {
  await delay(100);
  return true;
};

export const streamRun = (
  runId: string,
  onStep: (step: AgentTraceEvent) => void,
  onDone?: () => void,
): (() => void) => {
  const run = MOCK_RUNS.find((r) => r.run_id === runId);
  if (!run) { setTimeout(() => onDone?.(), 100); return () => {}; }

  // Build full event sequence: node events + investigation log
  const events: AgentTraceEvent[] = [];

  // ingest
  const fc = run.investigation_report ?? run.no_action_report;
  events.push({ node: 'ingest', raw_summary: 'Phân tích báo cáo gian lận từ post-mortem.', severity: 'high', cases_count: 3 });

  // anomaly_check
  if (run.anomaly_decision) {
    events.push({
      node: 'anomaly_check',
      is_anomalous: run.anomaly_decision.is_anomalous,
      confidence: run.anomaly_decision.confidence,
      reasoning: run.anomaly_decision.reasoning,
      evidence: run.anomaly_decision.evidence,
    });
  }

  // fetch_data (only if investigation happened)
  if (run.investigation_window) {
    events.push({
      node: 'fetch_data',
      slices_count: run.anomaly_decision?.evidence?.length ?? 1,
      slice_keys: run.anomaly_decision?.evidence?.map((e) => Object.entries(e.filters).map(([k, v]) => `${k}=${v}`).join('+')) ?? [],
      window_start: String(run.investigation_window.start ?? ''),
      window_end: String(run.investigation_window.end ?? ''),
    });
  }

  // investigation steps
  for (const entry of run.investigation_report?.investigation_log ?? []) {
    events.push(entry);
  }

  // finalize
  if (run.investigation_report) {
    events.push({
      node: 'finalize_investigation',
      stop_reason: run.investigation_report.stop_reason,
      iteration_count: run.investigation_report.iteration_count,
      has_final_pattern: run.investigation_report.final_pattern !== null,
    });
  }

  // policy_output / action_output
  if (run.rule_json) {
    events.push({
      node: 'policy_output',
      rule_name: run.rule_json.rule_name,
      recommended_action: run.rule_json.recommended_action,
      status: run.rule_json.status,
      metrics: run.rule_json.metrics,
    });
  } else if (run.no_action_report) {
    events.push({ node: 'action_output', recommendation: run.no_action_report.recommendation });
  }

  void fc; // suppress unused warning

  let i = 0;
  let stopped = false;
  const tick = () => {
    if (stopped || i >= events.length) { if (!stopped) onDone?.(); return; }
    onStep(events[i++]);
    setTimeout(tick, i <= 3 ? 600 : 900); // faster for node events, slower for investigation
  };
  setTimeout(tick, 300);
  return () => { stopped = true; };
};
