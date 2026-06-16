import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KeenIcon } from '@/components';
import { Container } from '@/components/container';
import { getRun, RuleJSON } from '@/services/apis/Agent';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'analysis' | 'dependency' | 'build' | 'dryrun' | 'deploy' | 'done';

type MsgRole =
  | 'system'
  | 'user'
  | 'assistant'
  | 'reasoning'
  | 'tool_call'
  | 'tool_result'
  | 'hitl'
  | 'config_preview';

interface HitlDetail {
  label: string;
  value: string;
  status?: 'new' | 'reuse' | 'warn' | 'ok';
}

interface Msg {
  id: string;
  role: MsgRole;
  content: string;
  /* tool */
  toolName?: string;
  toolArgs?: string;
  toolOutput?: string;
  /* hitl */
  hitlTitle?: string;
  hitlDetails?: HitlDetail[];
  hitlApproved?: boolean | null; // null = pending
  hitlConfigPreview?: string;
  /* state */
  isThinking?: boolean;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => `m${++_id}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Phase definitions ────────────────────────────────────────────────────────

const PHASES: { id: Phase; label: string; icon: string }[] = [
  { id: 'analysis',   label: 'Analysis',    icon: 'search-list' },
  { id: 'dependency', label: 'Dependencies', icon: 'graph-3'    },
  { id: 'build',      label: 'Build Config', icon: 'setting-2'  },
  { id: 'dryrun',     label: 'Dry Run',      icon: 'shield-tick' },
  { id: 'deploy',     label: 'Deploy',       icon: 'rocket'      },
];

const PHASE_ORDER: Phase[] = ['analysis', 'dependency', 'build', 'dryrun', 'deploy', 'done'];

// ─── Thinking animation ───────────────────────────────────────────────────────

const THINKING_LABELS: Record<Phase, string[]> = {
  analysis:   ['Reading investigation report…', 'Extracting fraud signals…', 'Reasoning about rule scope…'],
  dependency: ['Querying existing components…', 'Checking for reusable configs…', 'Resolving dependency order…'],
  build:      ['Constructing variable schema…', 'Building tier config…', 'Assembling rule definition…'],
  dryrun:     ['Submitting to config-service…', 'Validating rule syntax…', 'Estimating impact…'],
  deploy:     ['Writing variable…', 'Creating tier…', 'Activating rule…'],
  done:       ['Done.'],
};

const ThinkingBubble = ({ phase }: { phase: Phase }) => {
  const labels = THINKING_LABELS[phase];
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % labels.length); setVis(true); }, 280);
    }, 1700);
    return () => clearInterval(t);
  }, [labels.length]);

  return (
    <div className="flex gap-3 mb-3">
      <div className="relative size-7 shrink-0 mt-0.5">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center relative">
          <KeenIcon icon="robot" className="text-primary text-[11px]" />
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-primary/25 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm shadow-primary/10">
        <svg className="size-3.5 animate-spin text-primary shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-gray-400 transition-opacity duration-300" style={{ opacity: vis ? 1 : 0 }}>
          {labels[idx]}
        </span>
        <span className="w-0.5 h-3.5 bg-primary/60 rounded-full animate-[blink_1s_ease-in-out_infinite] shrink-0" />
      </div>
    </div>
  );
};

// ─── Reasoning block ──────────────────────────────────────────────────────────

const ReasoningBlock = ({ content }: { content: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-3 mb-2">
      <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
        <KeenIcon icon="abstract-26" className="text-gray-400 text-[11px]" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-1"
        >
          <KeenIcon icon={open ? 'down' : 'right'} className="text-[10px]" />
          Reasoning
        </button>
        {open && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tool call/result block ───────────────────────────────────────────────────

const ToolBlock = ({ msg }: { msg: Msg }) => {
  const [open, setOpen] = useState(false);
  const isCall = msg.role === 'tool_call';
  const label = isCall ? `▶ ${msg.toolName}` : `← result`;
  const body = isCall ? msg.toolArgs : msg.toolOutput;

  return (
    <div className="flex gap-3 mb-2">
      <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
        <KeenIcon icon={isCall ? 'code' : 'check-circle'} className={`text-[11px] ${isCall ? 'text-warning' : 'text-success'}`} />
      </div>
      <div className="flex-1 max-w-[85%] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <span className={`font-mono font-semibold flex-1 ${isCall ? 'text-warning' : 'text-success'}`}>{label}</span>
          <KeenIcon icon="down" className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <pre className="px-3 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {body}
          </pre>
        )}
      </div>
    </div>
  );
};

// ─── Config preview block ─────────────────────────────────────────────────────

const ConfigPreview = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex gap-3 mb-3">
      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <KeenIcon icon="robot" className="text-primary text-[11px]" />
      </div>
      <div className="flex-1 max-w-[85%] border border-primary/20 rounded-2xl rounded-tl-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-primary/15">
          <span className="text-xs font-semibold text-primary/80">Generated Config</span>
          <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <KeenIcon icon={copied ? 'check' : 'copy'} className="text-xs" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="px-4 py-3 bg-white dark:bg-gray-900 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64">
          {content}
        </pre>
      </div>
    </div>
  );
};

// ─── HITL checkpoint card ─────────────────────────────────────────────────────

interface HitlCardProps {
  msg: Msg;
  onApprove: () => void;
  onRequestChange: (feedback: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  new:   'text-primary bg-primary/10',
  reuse: 'text-success bg-success/10',
  warn:  'text-warning bg-warning/10',
  ok:    'text-success bg-success/10',
};

const HitlCard = ({ msg, onApprove, onRequestChange }: HitlCardProps) => {
  const [feedback, setFeedback] = useState('');
  const [mode, setMode] = useState<'idle' | 'request'>('idle');
  const approved = msg.hitlApproved;

  if (approved === true) {
    return (
      <div className="flex gap-3 mb-4">
        <div className="size-7 shrink-0" />
        <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border border-success/25 rounded-2xl text-sm text-success">
          <KeenIcon icon="check-circle" />
          <span className="font-medium">{msg.hitlTitle} — Approved</span>
        </div>
      </div>
    );
  }

  if (approved === false) {
    return (
      <div className="flex gap-3 mb-4">
        <div className="size-7 shrink-0" />
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-500">
          <KeenIcon icon="message-text" />
          <span>Changes requested — agent is revising…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className="size-7 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
        <KeenIcon icon="user" className="text-warning text-[11px]" />
      </div>
      <div className="flex-1 max-w-[90%] border-2 border-warning/30 rounded-2xl rounded-tl-sm overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-warning/5 border-b border-warning/20">
          <KeenIcon icon="information-2" className="text-warning text-sm" />
          <span className="text-sm font-semibold text-gray-800 dark:text-white">{msg.hitlTitle}</span>
          <span className="ms-auto text-xs text-warning font-medium uppercase tracking-wide">Awaiting review</span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {msg.content && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{msg.content}</p>
          )}

          {/* Details table */}
          {msg.hitlDetails && msg.hitlDetails.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-3">
              <table className="w-full text-xs">
                <tbody>
                  {msg.hitlDetails.map((d, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : 'bg-white dark:bg-transparent'}>
                      <td className="px-3 py-2 text-gray-500 font-medium w-40 shrink-0">{d.label}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-mono flex-1">{d.value}</td>
                      {d.status && (
                        <td className="px-3 py-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[d.status] ?? ''}`}>
                            {d.status}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Config preview inside HITL */}
          {msg.hitlConfigPreview && (
            <details className="mb-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none mb-1">
                View generated config JSON
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-48">
                {msg.hitlConfigPreview}
              </pre>
            </details>
          )}

          {/* Request changes input */}
          {mode === 'request' && (
            <div className="mt-3 flex gap-2">
              <textarea
                className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-primary resize-none"
                rows={2}
                placeholder="Describe what to change…"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                autoFocus
              />
              <button
                className="btn btn-sm btn-warning self-end"
                disabled={!feedback.trim()}
                onClick={() => { onRequestChange(feedback); setMode('idle'); setFeedback(''); }}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        {mode === 'idle' && (
          <div className="flex gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <button className="btn btn-sm btn-success flex-1" onClick={onApprove}>
              <KeenIcon icon="check" /> Approve
            </button>
            <button className="btn btn-sm btn-light flex-1" onClick={() => setMode('request')}>
              <KeenIcon icon="message-edit" /> Request Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Assistant text bubble ────────────────────────────────────────────────────

const InlineCode = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={i} className="font-mono text-[0.8em] bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
};

const AssistantBubble = ({ content }: { content: string }) => {
  let inCode = false;
  const codeAcc: string[] = [];
  const els: React.ReactNode[] = [];
  let key = 0;

  const flushCode = () => {
    if (codeAcc.length) {
      els.push(
        <pre key={key++} className="my-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl font-mono text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {codeAcc.join('\n')}
        </pre>
      );
      codeAcc.length = 0;
    }
  };

  for (const line of content.split('\n')) {
    if (line.startsWith('```')) { inCode ? (flushCode(), inCode = false) : (inCode = true); continue; }
    if (inCode) { codeAcc.push(line); continue; }
    if (line === '---') { els.push(<hr key={key++} className="my-2 border-gray-200 dark:border-gray-700" />); continue; }
    if (line === '') { els.push(<div key={key++} className="h-2" />); continue; }
    els.push(<div key={key++} className="leading-relaxed"><InlineCode text={line} /></div>);
  }
  flushCode();

  return (
    <div className="flex gap-3 mb-3">
      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <KeenIcon icon="robot" className="text-primary text-[11px]" />
      </div>
      <div className="flex-1 max-w-[85%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
        {els}
      </div>
    </div>
  );
};

const UserBubble = ({ content }: { content: string }) => (
  <div className="flex justify-end mb-3">
    <div className="max-w-[70%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
      {content}
    </div>
  </div>
);

const SystemMsg = ({ content }: { content: string }) => (
  <div className="flex justify-center my-3">
    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{content}</span>
  </div>
);

// ─── Phase stepper ────────────────────────────────────────────────────────────

const PhaseStepper = ({ current }: { current: Phase }) => {
  const idx = PHASE_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-0 overflow-x-auto shrink-0">
      {PHASES.map((p, i) => {
        const done = i < idx;
        const active = p.id === current;
        return (
          <div key={p.id} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active ? 'bg-primary/10 text-primary' :
              done   ? 'text-success' :
                       'text-gray-400'
            }`}>
              {done ? (
                <KeenIcon icon="check-circle" className="text-success text-sm" />
              ) : (
                <KeenIcon icon={p.icon} className="text-sm" />
              )}
              <span className="hidden sm:block">{p.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-6 h-px mx-0.5 ${done ? 'bg-success/40' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Workflow script ──────────────────────────────────────────────────────────

const buildWorkflow = (runId: string, rule: RuleJSON) => {
  const varName = rule.signal_columns[0] ?? 'signal_var';
  const tierName = `tier_${rule.recommended_action}_strict`;
  const configJson = JSON.stringify({
    variable: { name: varName, type: 'count', window: '24h', event: 'loan_application', group_by: 'device_id' },
    tier: { name: tierName, action: rule.recommended_action, priority: 80 },
    rule: {
      name: rule.rule_name, tier: tierName,
      condition: rule.sql_predicate,
      description: rule.description,
      signal_columns: rule.signal_columns,
    },
  }, null, 2);

  return {
    // Phase: analysis
    analysisReasoning: `Investigation run: ${runId}
Rule: ${rule.rule_name}
Fraud type: ${rule.fraud_type}
SQL predicate: ${rule.sql_predicate}
Signal columns: ${rule.signal_columns.join(', ')}
Recommended action: ${rule.recommended_action}
Precision: ${(rule.metrics.precision*100).toFixed(1)}% | Recall: ${(rule.metrics.recall*100).toFixed(1)}% | F1: ${(rule.metrics.f1*100).toFixed(1)}%

→ I need to create: Variable (aggregation) → Tier (action mapping) → Rule (condition) → Condition (SQL)
→ I should check whether Profile already exists before creating Tier.`,

    analysisMsg: `I've read the investigation report for run \`${runId}\`.

**Fraud type:** ${rule.fraud_type}
**Signal:** ${rule.signal_columns.join(', ')}
**Target action:** \`${rule.recommended_action}\`
**Performance:** Precision ${(rule.metrics.precision*100).toFixed(0)}% · Recall ${(rule.metrics.recall*100).toFixed(0)}% · F1 ${(rule.metrics.f1*100).toFixed(0)}%

To deploy \`${rule.rule_name}\` I'll need to build the full dependency chain. Let me check existing components first.`,

    analysisHitl: {
      title: 'Confirm Analysis',
      content: `Does this match your understanding of the investigation? Approve to proceed with dependency resolution.`,
      details: [
        { label: 'Rule name',   value: rule.rule_name,         status: 'new'  as const },
        { label: 'Fraud type',  value: rule.fraud_type,        status: 'ok'   as const },
        { label: 'Action',      value: rule.recommended_action, status: 'new'  as const },
        { label: 'Precision',   value: `${(rule.metrics.precision*100).toFixed(1)}%`, status: 'ok' as const },
      ],
    },

    // Phase: dependency
    depToolArgs: JSON.stringify({ lookup: ['profile', 'tier', 'variable', 'rule'], rule_name: rule.rule_name }, null, 2),
    depToolResult: JSON.stringify({
      profile:  { found: true,  id: 'profile_vn_consumer_lending',  action: 'reuse' },
      tier:     { found: false, suggested_name: tierName,            action: 'create' },
      variable: { found: false, suggested_name: varName,             action: 'create' },
      rule:     { found: false, suggested_name: rule.rule_name,      action: 'create' },
    }, null, 2),

    depMsg: `Dependency check complete. Here's the plan:

- **Profile** \`profile_vn_consumer_lending\` → ♻️ reuse existing (no change)
- **Tier** \`${tierName}\` → 🆕 create new (action: ${rule.recommended_action}, priority: 80)
- **Variable** \`${varName}\` → 🆕 create new (24h rolling count by device_id)
- **Rule** \`${rule.rule_name}\` → 🆕 create new

**Create order:** Variable → Tier → Rule → Condition`,

    depHitl: {
      title: 'Confirm Dependency Plan',
      content: 'Review which components will be reused vs created. Approve to proceed to config build.',
      details: [
        { label: 'profile_vn_consumer_lending', value: 'reuse existing', status: 'reuse' as const },
        { label: tierName,                        value: 'create new',    status: 'new'   as const },
        { label: varName,                         value: 'create new',    status: 'new'   as const },
        { label: rule.rule_name,                  value: 'create new',    status: 'new'   as const },
      ],
    },

    // Phase: build
    buildMsg: `Config built. Here's what I'll send to the config-service:`,
    configJson,
    buildHitl: {
      title: 'Review Generated Config',
      content: 'Review the JSON before dry-run. You can request changes to any field.',
      details: [
        { label: 'variable.window',  value: '24h rolling count',          status: 'new'  as const },
        { label: 'tier.priority',    value: '80',                          status: 'new'  as const },
        { label: 'rule.condition',   value: rule.sql_predicate.slice(0,60)+'…', status: 'new' as const },
      ],
      configJson,
    },

    // Phase: dryrun
    dryRunToolArgs: JSON.stringify({ mode: 'dry_run', atomic: true, components: [varName, tierName, rule.rule_name] }, null, 2),
    dryRunToolResult: JSON.stringify({
      status: 'ok',
      validation_errors: [],
      warnings: [`${tierName}: no cooldown period — recommend 24h between flags for same user`],
      estimated_daily_flags: 340,
      estimated_precision: rule.metrics.precision,
    }, null, 2),

    dryRunMsg: `Dry-run passed ✅

**Validation errors:** none
**Warning:** \`${tierName}\` has no cooldown — recommend 24h between flags for the same user to avoid aggressive blocking. I can add it.
**Estimated impact:** ~340 flags / day at ${(rule.metrics.precision*100).toFixed(0)}% precision.

Ready to deploy to production.`,

    dryRunHitl: {
      title: 'Confirm Production Deploy',
      content: 'This is the final step. Configs will be written atomically — rollback is available if anything fails.',
      details: [
        { label: 'Target env',   value: 'production',              status: 'warn'  as const },
        { label: 'Write ops',    value: '3 (variable, tier, rule)', status: 'new'  as const },
        { label: 'Rollback',     value: 'automatic on error',       status: 'ok'   as const },
        { label: 'Est. impact',  value: '~340 flags / day',         status: 'ok'   as const },
      ],
    },

    // Phase: deploy
    deployToolArgs: JSON.stringify({ mode: 'production', atomic: true, rollback_on_error: true }, null, 2),
    deployToolResult: JSON.stringify({
      status: 'success',
      created: [varName, tierName, rule.rule_name],
      rule_id: 'rule_' + runId.slice(0,6),
      activated_at: new Date().toISOString(),
    }, null, 2),

    deployMsg: `Rule deployed successfully 🚀

**Rule ID:** \`rule_${runId.slice(0,6)}\`
**Components created:** \`${varName}\`, \`${tierName}\`, \`${rule.rule_name}\`
**Status:** active

The rule is now live. You can monitor precision/recall drift on the risk dashboard. I'll alert if metrics drop below trained thresholds.`,
  };
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AiAssistantPage = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const [rule, setRule] = useState<RuleJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('analysis');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState('');
  const [hitlPendingId, setHitlPendingId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const workflowRef = useRef<ReturnType<typeof buildWorkflow> | null>(null);

  type Message = Msg;

  const push = useCallback((msgs: Message | Message[]) => {
    setMessages(prev => [...prev, ...(Array.isArray(msgs) ? msgs : [msgs])]);
  }, []);

  const addThinking = useCallback(() => {
    const id = uid();
    push({ id, role: 'assistant', content: '', isThinking: true, timestamp: new Date() });
    return id;
  }, [push]);

  const removeThinking = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Boot: load run then kick off analysis ──────────────────────────────────
  useEffect(() => {
    if (!runId) return;
    getRun(runId).then(run => {
      if (!run.rule_json) { setLoading(false); return; }
      setRule(run.rule_json);
      workflowRef.current = buildWorkflow(runId, run.rule_json);
      setLoading(false);
      runAnalysisPhase(run.rule_json);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const runAnalysisPhase = async (r: RuleJSON) => {
    const wf = buildWorkflow(runId!, r);
    push({ id: uid(), role: 'system', content: `Loaded rule ${r.rule_name} from investigation ${runId}`, timestamp: new Date() });
    await sleep(600);
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    await sleep(2200);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);

    push({ id: uid(), role: 'reasoning', content: wf.analysisReasoning, timestamp: new Date() });
    await sleep(300);
    push({ id: uid(), role: 'assistant', content: wf.analysisMsg, timestamp: new Date() });
    await sleep(400);
    const hitlId = uid();
    setHitlPendingId(hitlId);
    push({
      id: hitlId, role: 'hitl',
      hitlTitle: wf.analysisHitl.title,
      content: wf.analysisHitl.content,
      hitlDetails: wf.analysisHitl.details,
      hitlApproved: null,
      timestamp: new Date(),
    });
  };

  const runDependencyPhase = useCallback(async () => {
    const wf = workflowRef.current!;
    setPhase('dependency');
    await sleep(400);
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    push({ id: uid(), role: 'tool_call', content: '', toolName: 'check_existing_components', toolArgs: wf.depToolArgs, timestamp: new Date() });
    await sleep(1800);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);
    push({ id: uid(), role: 'tool_result', content: '', toolOutput: wf.depToolResult, timestamp: new Date() });
    await sleep(300);
    push({ id: uid(), role: 'assistant', content: wf.depMsg, timestamp: new Date() });
    await sleep(400);
    const hitlId = uid();
    setHitlPendingId(hitlId);
    push({ id: hitlId, role: 'hitl', hitlTitle: wf.depHitl.title, content: wf.depHitl.content, hitlDetails: wf.depHitl.details, hitlApproved: null, timestamp: new Date() });
  }, [push]);

  const runBuildPhase = useCallback(async () => {
    const wf = workflowRef.current!;
    setPhase('build');
    await sleep(400);
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    await sleep(1600);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);
    push({ id: uid(), role: 'assistant', content: wf.buildMsg, timestamp: new Date() });
    push({ id: uid(), role: 'config_preview', content: wf.configJson, timestamp: new Date() });
    await sleep(400);
    const hitlId = uid();
    setHitlPendingId(hitlId);
    push({ id: hitlId, role: 'hitl', hitlTitle: wf.buildHitl.title, content: wf.buildHitl.content, hitlDetails: wf.buildHitl.details, hitlApproved: null, hitlConfigPreview: wf.buildHitl.configJson, timestamp: new Date() });
  }, [push]);

  const runDryRunPhase = useCallback(async () => {
    const wf = workflowRef.current!;
    setPhase('dryrun');
    await sleep(400);
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    push({ id: uid(), role: 'tool_call', content: '', toolName: 'dry_run_config', toolArgs: wf.dryRunToolArgs, timestamp: new Date() });
    await sleep(2000);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);
    push({ id: uid(), role: 'tool_result', content: '', toolOutput: wf.dryRunToolResult, timestamp: new Date() });
    await sleep(300);
    push({ id: uid(), role: 'assistant', content: wf.dryRunMsg, timestamp: new Date() });
    await sleep(400);
    const hitlId = uid();
    setHitlPendingId(hitlId);
    push({ id: hitlId, role: 'hitl', hitlTitle: wf.dryRunHitl.title, content: wf.dryRunHitl.content, hitlDetails: wf.dryRunHitl.details, hitlApproved: null, timestamp: new Date() });
  }, [push]);

  const runDeployPhase = useCallback(async () => {
    const wf = workflowRef.current!;
    setPhase('deploy');
    await sleep(400);
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    push({ id: uid(), role: 'tool_call', content: '', toolName: 'deploy_config', toolArgs: wf.deployToolArgs, timestamp: new Date() });
    await sleep(2200);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);
    push({ id: uid(), role: 'tool_result', content: '', toolOutput: wf.deployToolResult, timestamp: new Date() });
    await sleep(300);
    push({ id: uid(), role: 'assistant', content: wf.deployMsg, timestamp: new Date() });
    setPhase('done');
    setHitlPendingId(null);
  }, [push]);

  // ── HITL handlers ──────────────────────────────────────────────────────────
  const handleApprove = useCallback((hitlId: string) => {
    setMessages(prev => prev.map(m => m.id === hitlId ? { ...m, hitlApproved: true } : m));
    setHitlPendingId(null);
    const currentPhase = phase;
    if (currentPhase === 'analysis')   runDependencyPhase();
    else if (currentPhase === 'dependency') runBuildPhase();
    else if (currentPhase === 'build')      runDryRunPhase();
    else if (currentPhase === 'dryrun')     runDeployPhase();
  }, [phase, runDependencyPhase, runBuildPhase, runDryRunPhase, runDeployPhase]);

  const handleRequestChange = useCallback((hitlId: string, feedback: string) => {
    setMessages(prev => prev.map(m => m.id === hitlId ? { ...m, hitlApproved: false } : m));
    push({ id: uid(), role: 'user', content: feedback, timestamp: new Date() });
    setHitlPendingId(null);
    // Re-run current phase after feedback
    const currentPhase = phase;
    setTimeout(async () => {
      setThinking(true);
      const tid = uid();
      setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
      await sleep(1800);
      setMessages(prev => prev.filter(m => m.id !== tid));
      setThinking(false);
      push({ id: uid(), role: 'assistant', content: `Understood. I've revised the plan based on your feedback. Re-running ${currentPhase} phase…`, timestamp: new Date() });
      await sleep(500);
      if (currentPhase === 'analysis')    runAnalysisPhase(rule!);
      else if (currentPhase === 'dependency') runDependencyPhase();
      else if (currentPhase === 'build')      runBuildPhase();
      else if (currentPhase === 'dryrun')     runDryRunPhase();
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, rule, push, runDependencyPhase, runBuildPhase, runDryRunPhase]);

  // ── Free-text chat ─────────────────────────────────────────────────────────
  const sendFreeText = async () => {
    if (!input.trim() || thinking || hitlPendingId) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    push({ id: uid(), role: 'user', content: text, timestamp: new Date() });
    setThinking(true);
    const tid = uid();
    setMessages(prev => [...prev, { id: tid, role: 'assistant', content: '', isThinking: true, timestamp: new Date() }]);
    await sleep(1400);
    setMessages(prev => prev.filter(m => m.id !== tid));
    setThinking(false);
    push({ id: uid(), role: 'assistant', content: `Got it. I'll factor that into the current phase. Continue when you're ready.`, timestamp: new Date() });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFreeText(); }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] gap-3 text-gray-500">
      <span className="spinner-border spinner-border-sm" /> Loading context…
    </div>
  );

  if (!rule) return (
    <Container>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <KeenIcon icon="information-2" className="text-4xl text-gray-300" />
        <p className="text-gray-500 text-sm">No rule found for this investigation.</p>
        <button className="btn btn-sm btn-light" onClick={() => navigate(`/ai-investigation/${runId}`)}>
          <KeenIcon icon="arrow-left" className="me-1" /> Back
        </button>
      </div>
    </Container>
  );

  const inputBlocked = !!hitlPendingId || thinking;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 70px)' }}>

      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => navigate(`/ai-investigation/${runId}`)}>
          <KeenIcon icon="arrow-left" />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <KeenIcon icon="robot" className="text-primary text-sm" />
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-white hidden sm:block">Config Agent</span>
          <span className="text-xs text-gray-400 font-mono hidden md:block">· {rule.rule_name}</span>
        </div>
        <div className="flex-1 flex justify-center">
          <PhaseStepper current={phase} />
        </div>
        <span className={`badge rounded-[30px] text-xs shrink-0 ${phase === 'done' ? 'badge-success badge-outline' : 'badge-primary badge-outline'}`}>
          <span className={`size-1.5 rounded-full me-1.5 ${phase === 'done' ? 'bg-success' : 'bg-primary animate-pulse'}`} />
          {phase === 'done' ? 'Deployed' : 'In progress'}
        </span>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => {
            if (msg.isThinking) return <ThinkingBubble key={msg.id} phase={phase} />;
            if (msg.role === 'system')       return <SystemMsg key={msg.id} content={msg.content} />;
            if (msg.role === 'user')         return <UserBubble key={msg.id} content={msg.content} />;
            if (msg.role === 'assistant')    return <AssistantBubble key={msg.id} content={msg.content} />;
            if (msg.role === 'reasoning')    return <ReasoningBlock key={msg.id} content={msg.content} />;
            if (msg.role === 'tool_call' || msg.role === 'tool_result') return <ToolBlock key={msg.id} msg={msg} />;
            if (msg.role === 'config_preview') return <ConfigPreview key={msg.id} content={msg.content} />;
            if (msg.role === 'hitl') return (
              <HitlCard
                key={msg.id}
                msg={msg}
                onApprove={() => handleApprove(msg.id)}
                onRequestChange={(fb) => handleRequestChange(msg.id, fb)}
              />
            );
            return null;
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3">
        <div className="max-w-3xl mx-auto">
          {phase === 'done' ? (
            <div className="flex items-center justify-center gap-3 py-2 text-sm text-success">
              <KeenIcon icon="check-circle" className="text-lg" />
              <span>Rule deployed. Configuration complete.</span>
              <button className="btn btn-sm btn-light ms-2" onClick={() => navigate(`/ai-investigation/${runId}`)}>
                Back to investigation
              </button>
            </div>
          ) : hitlPendingId ? (
            <p className="text-xs text-center text-gray-400 py-2">
              Review the checkpoint above — use <strong>Approve</strong> or <strong>Request Changes</strong> to continue.
            </p>
          ) : (
            <div className={`flex items-end gap-2 bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2.5 transition-colors ${thinking ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-600 focus-within:border-primary'}`}>
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 leading-relaxed"
                placeholder="Ask a question or give guidance…"
                value={input}
                onChange={e => { setInput(e.target.value); if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }}
                onKeyDown={onKey}
                disabled={inputBlocked}
              />
              <button className="btn btn-primary btn-sm btn-icon shrink-0" onClick={sendFreeText} disabled={!input.trim() || inputBlocked}>
                {thinking ? <span className="spinner-border spinner-border-sm" /> : <KeenIcon icon="send" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AiAssistantPage };
