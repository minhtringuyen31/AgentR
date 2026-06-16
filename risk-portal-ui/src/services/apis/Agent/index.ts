// Switched to real backend. Set VITE_AGENT_URL in .env (defaults to http://localhost:8000).
// To go back to mocks, re-export from './agentServiceMock' instead.
export * from './agentService';

// Re-export types from the canonical source
export type {
  RunOut,
  RunStatus,
  RuleJSON,
  AnomalyDecision,
  InvestigationReport,
  InvestigationLogEntry,
  PatternAttempt,
  PatternMetrics,
  NoActionReport,
  RecommendedAction,
  CreateRunPayload,
  EmailTriggerPayload,
  PostmortemTriggerPayload,
  AgentTraceEvent,
  IngestEvent,
  AnomalyCheckEvent,
  FetchDataEvent,
  FinalizeEvent,
  PolicyOutputEvent,
  ActionOutputEvent,
} from './agentService';
