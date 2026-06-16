import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Container } from '@/components/container';

// ─── Schema types ─────────────────────────────────────────────────────────────

interface Variable {
  fieldName: string;
  fieldType: string;
  source: { keyId: string };
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Rule {
  name: string;
  description: string;
  conditionLogic: 'AND' | 'OR';
  conditions: Condition[];
  infoCode: string;
}

interface Event {
  name: string;
  description: string;
  filter: string;
  decisionCode: 'REJECT' | 'CHALLENGE' | 'APPROVE';
  variables: Variable[];
  rules: Rule[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const EVENTS: Event[] = [
  {
    name: 'PAYMENT_CF_SCREEN',
    description: 'Screening chargeback fraud trên giao dịch thẻ quốc tế',
    filter: 'AND',
    decisionCode: 'REJECT',
    variables: [
      { fieldName: 'bankCode',    fieldType: 'STRING',  source: { keyId: 'txn.bankCode' } },
      { fieldName: 'bankType',    fieldType: 'STRING',  source: { keyId: 'txn.bankType' } },
      { fieldName: 'amount',      fieldType: 'NUMERIC', source: { keyId: 'txn.userChargeAmount' } },
      { fieldName: 'account_age', fieldType: 'NUMERIC', source: { keyId: 'user.accountAgeDays' } },
    ],
    rules: [
      {
        name: 'RULE_ZPCC_NEW_ACCT_HIGH_AMT',
        description: 'Từ chối giao dịch thẻ ZPCC international với tài khoản mới và số tiền lớn',
        conditionLogic: 'AND',
        conditions: [
          { field: 'bankCode',    operator: '==', value: 'ZPCC' },
          { field: 'bankType',    operator: '==', value: 'international' },
          { field: 'amount',      operator: '>=', value: '10000000' },
          { field: 'account_age', operator: '<=', value: '7' },
        ],
        infoCode: 'CF_ZPCC_001',
      },
      {
        name: 'RULE_INTL_CARD_VELOCITY',
        description: 'Giới hạn tần suất giao dịch thẻ quốc tế trong 1h',
        conditionLogic: 'AND',
        conditions: [
          { field: 'bankType',        operator: '==', value: 'international' },
          { field: 'txn_count_1h',    operator: '>=', value: '3' },
          { field: 'total_amount_1h', operator: '>=', value: '30000000' },
        ],
        infoCode: 'CF_VELOCITY_002',
      },
    ],
  },
  {
    name: 'DISBURSE_NEW_ACCOUNT',
    description: 'Kiểm tra giải ngân cho tài khoản mới đăng ký trong 72h',
    filter: 'AND',
    decisionCode: 'CHALLENGE',
    variables: [
      { fieldName: 'device_id',    fieldType: 'STRING',  source: { keyId: 'device.deviceId' } },
      { fieldName: 'account_age',  fieldType: 'NUMERIC', source: { keyId: 'user.accountAgeDays' } },
      { fieldName: 'amount',       fieldType: 'NUMERIC', source: { keyId: 'txn.disbursementAmount' } },
      { fieldName: 'region',       fieldType: 'STRING',  source: { keyId: 'user.region' } },
      { fieldName: 'device_count', fieldType: 'NUMERIC', source: { keyId: 'device.accountsPerDevice' } },
    ],
    rules: [
      {
        name: 'RULE_DEVICE_REUSE_HIGH',
        description: 'Chặn khi 1 device đăng ký quá nhiều tài khoản',
        conditionLogic: 'AND',
        conditions: [
          { field: 'device_count', operator: '>=', value: '3' },
          { field: 'account_age',  operator: '<=', value: '3' },
        ],
        infoCode: 'SYN_DEV_001',
      },
      {
        name: 'RULE_NEW_ACCT_HIGH_DISBURSE',
        description: 'Challenge giải ngân lớn từ tài khoản mới tạo trong ngày',
        conditionLogic: 'OR',
        conditions: [
          { field: 'account_age', operator: '<=', value: '1' },
          { field: 'amount',      operator: '>=', value: '20000000' },
        ],
        infoCode: 'SYN_AMT_002',
      },
      {
        name: 'RULE_SAME_REGION_CLUSTER',
        description: 'Flag cluster giải ngân cùng region trong 1h',
        conditionLogic: 'AND',
        conditions: [
          { field: 'region',            operator: '==', value: 'VN-HCM' },
          { field: 'disburse_count_1h', operator: '>=', value: '5' },
          { field: 'account_age',       operator: '<=', value: '3' },
        ],
        infoCode: 'SYN_CLUSTER_003',
      },
    ],
  },
  {
    name: 'KYC_ID_VERIFY',
    description: 'Phát hiện trùng lặp CCCD khi đăng ký tài khoản mới',
    filter: 'AND',
    decisionCode: 'REJECT',
    variables: [
      { fieldName: 'id_hash',    fieldType: 'STRING',  source: { keyId: 'kyc.idDocumentHash' } },
      { fieldName: 'phone_hash', fieldType: 'STRING',  source: { keyId: 'kyc.phoneHash' } },
      { fieldName: 'id_count',   fieldType: 'NUMERIC', source: { keyId: 'kyc.accountsPerIdHash' } },
    ],
    rules: [
      {
        name: 'RULE_ID_HASH_COLLISION',
        description: 'Blacklist khi cùng 1 CCCD hash đăng ký nhiều tài khoản',
        conditionLogic: 'AND',
        conditions: [
          { field: 'id_count', operator: '>=', value: '2' },
        ],
        infoCode: 'KYC_DUP_001',
      },
      {
        name: 'RULE_ID_PHONE_MISMATCH_BURST',
        description: 'Flag burst đăng ký cùng id_hash nhưng phone khác nhau trong 24h',
        conditionLogic: 'OR',
        conditions: [
          { field: 'id_count',      operator: '>=', value: '3' },
          { field: 'phone_variety', operator: '>=', value: '2' },
        ],
        infoCode: 'KYC_BURST_002',
      },
    ],
  },
  {
    name: 'PAYMENT_GPS_CHECK',
    description: 'Phát hiện GPS spoofing khi địa chỉ khai báo không khớp với tọa độ thực',
    filter: 'AND',
    decisionCode: 'REJECT',
    variables: [
      { fieldName: 'gps_lat',          fieldType: 'NUMERIC', source: { keyId: 'device.gpsLat' } },
      { fieldName: 'gps_lng',          fieldType: 'NUMERIC', source: { keyId: 'device.gpsLng' } },
      { fieldName: 'address_province', fieldType: 'STRING',  source: { keyId: 'user.addressProvince' } },
      { fieldName: 'gps_province',     fieldType: 'STRING',  source: { keyId: 'device.gpsProvince' } },
    ],
    rules: [
      {
        name: 'RULE_GPS_PROVINCE_MISMATCH',
        description: 'Từ chối khi tỉnh GPS không khớp với tỉnh khai báo',
        conditionLogic: 'AND',
        conditions: [
          { field: 'gps_province', operator: '!=', value: 'address_province' },
          { field: 'distance_km',  operator: '>=', value: '50' },
        ],
        infoCode: 'GPS_MISMATCH_001',
      },
      {
        name: 'RULE_GPS_HOTSPOT_CLUSTER',
        description: 'Phát hiện cluster tọa độ bất thường trong bán kính 200m',
        conditionLogic: 'OR',
        conditions: [
          { field: 'cluster_count_200m', operator: '>=', value: '10' },
          { field: 'address_variety',    operator: '>=', value: '3' },
        ],
        infoCode: 'GPS_HOTSPOT_002',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DECISION_COLOR: Record<string, string> = {
  REJECT:    'danger',
  CHALLENGE: 'warning',
  APPROVE:   'success',
};

const TYPE_COLOR: Record<string, string> = {
  STRING:  'info',
  NUMERIC: 'success',
  BOOLEAN: 'warning',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ConditionPill = ({ c }: { c: Condition }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg px-2 py-0.5">
    <span className="text-gray-800 dark:text-gray-200">{c.field}</span>
    <span className="text-primary font-bold">{c.operator}</span>
    <span className="text-danger">{c.value}</span>
  </span>
);

const RuleCard = ({ rule, index }: { rule: Rule; index: number }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-mono text-gray-400">#{index + 1}</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white font-mono">{rule.name}</span>
        </div>
        <p className="text-xs text-gray-500">{rule.description}</p>
      </div>
      <span className="badge badge-primary badge-outline rounded-[30px] text-[11px] shrink-0 font-mono">{rule.infoCode}</span>
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      {rule.conditions.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <ConditionPill c={c} />
          {i < rule.conditions.length - 1 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              rule.conditionLogic === 'AND'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
            }`}>
              {rule.conditionLogic}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export const RuleManagementPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <Container>
      <div className="flex gap-6 py-6" style={{ minHeight: 'calc(100vh - 120px)' }}>

        {/* ── Event list ── */}
        <div className={`flex flex-col gap-3 transition-all duration-200 ${selectedEvent ? 'w-[380px] shrink-0' : 'w-full max-w-3xl mx-auto'}`}>

          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rule Management</h2>
            </div>
          </div>

          {EVENTS.map((ev) => {
            const active = selectedEvent?.name === ev.name;
            return (
              <button
                key={ev.name}
                onClick={() => setSelectedEvent(active ? null : ev)}
                className={[
                  'w-full text-left rounded-xl border p-4 transition-all duration-150',
                  active
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold font-mono text-gray-800 dark:text-white">{ev.name}</span>
                      <span className={`badge badge-${DECISION_COLOR[ev.decisionCode]} badge-outline rounded-[30px] text-[11px]`}>
                        {ev.decisionCode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">{ev.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <KeenIcon
                      icon="arrow-right"
                      className={`text-gray-400 transition-transform duration-200 ${active ? 'rotate-90 text-primary' : ''}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Rule detail panel ── */}
        {selectedEvent && (
          <div className="flex-1 min-w-0">
            <div className="sticky top-6">

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-semibold font-mono text-gray-900 dark:text-white">{selectedEvent.name}</h3>
                    <span className={`badge badge-${DECISION_COLOR[selectedEvent.decisionCode]} badge-outline rounded-[30px] text-[11px]`}>
                      {selectedEvent.decisionCode}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedEvent.description}</p>
                </div>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light shrink-0"
                  onClick={() => setSelectedEvent(null)}
                >
                  <KeenIcon icon="cross" />
                </button>
              </div>

              {/* Variables */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Variables</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                        <th className="px-3 py-2 text-left font-medium">fieldName</th>
                        <th className="px-3 py-2 text-left font-medium">fieldType</th>
                        <th className="px-3 py-2 text-left font-medium">source.keyId</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedEvent.variables.map((v) => (
                        <tr key={v.fieldName}>
                          <td className="px-3 py-1.5 font-mono text-gray-700 dark:text-gray-300">{v.fieldName}</td>
                          <td className="px-3 py-1.5">
                            <span className={`badge badge-${TYPE_COLOR[v.fieldType] ?? 'secondary'} badge-outline rounded-[30px]`}>
                              {v.fieldType}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-gray-500">{v.source.keyId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rules */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Rules <span className="font-normal normal-case text-gray-400">({selectedEvent.rules.length})</span>
                </p>
                <div className="flex flex-col gap-3">
                  {selectedEvent.rules.map((rule, i) => (
                    <RuleCard key={rule.name} rule={rule} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};
