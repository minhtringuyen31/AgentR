interface ConditionNodeData {
  title: string;
  condition_block_id: string;
  title?: string;
  flow_design_id?: string;
  keyword?: string;
  first_name_contact?: string;
  last_name_contact?: string;
  detect_type?: string;
  isActive?: string;
  start_at?: string;
  end_at?: string;
  next_block?: string;
  another_block?: string;
}

interface ActionNodeData {
  id: string;
  title: string;
  type_action: string;
  // sendVia: {
  //   type: string;
  //   channel?: string[];
  // };
  send_message: string;
  // timeout: {
  //   isOn: boolean;
  //   value: number;
  //   valueType: string;
  // };
  // button?: {
  //   type: "";
  //   valueList: "";
  // };
  onUpdateNodeDataCallback: (updateNodeId: string, updatedData: Partial<ActionNodeData>) => void;
  onDeleteNodeCallback: (nodeId: string) => void;
  onAddQuickButtonNode: (nodeId: string) => void;
  next_blocks: NextBlockConfig[];
  [key: string]: unknown;
}

interface StartNodeData {
  id: string;
  data_trigger: DataTrigger;
  title: string;
  is_active: boolean;
  configs: ConditionConfig[];

  next_block: NextBlockConfig[];

  onUpdateNodeDataCallback: (updateNodeId: string, updatedData: Partial<StartNodeData>) => void;
  onDeleteNodeCallback: (nodeId: string) => void;
  onAddNewConditionBranch: (nodeId: string) => void;
  next_blocks: NextBlockConfig[];
  [key: string]: unknown;
}

interface ConditionConfig {
  id: string;
  type_config?: string;
  operator?: string;
  field?: string;
  value?: string;
  start_by_date?: string;
  end_by_date?: string;
  start_by_time?: string;
  end_by_time?: string;
  start_by_datetime?: string;
  end_by_datetime?: string;
  time?: string;
  units_of_time?: string;
  days?: string[];
  channels?: string[];
  keywords?: string[];
}

interface DataTrigger {
  id: string;
  type_trigger: string;
  configs?: ConditionConfig[];
  channel?: string;
  conversation_status?: string;
}

interface CustomeEdgeData {
  onAddNodeCallback: (targetEdgeId: string, nodeType: NodeType, actionType?: string) => void;
  [key: string]: unknown;
}

interface NextBlockConfig {
  id: string;
  next_block: string;
  index: number;
}

interface Condition {
  label: string;
  name: string;
  value: string;
  type?: ConditionType;
  options?: Condition[];
}

type ConditionType =
  | 'select'
  | 'text'
  | 'dateTime'
  | 'dateRange'
  | 'date'
  | 'day'
  | 'timeRange'
  | 'within'
  | 'multiSelectDay'
  | 'multiSelect'
  | 'none';

type NodeType =
  | 'start-node'
  | 'normal-node'
  | 'action-node'
  | 'condition-node'
  | 'branching-node'
  | 'time-delay-node'
  | 'else-node'
  | 'end-node';

interface StartNodeFormValues {
  id: string;
  data_trigger: DataTriggerConfigFormvalues;
  title?: string;
  is_active: boolean;
  configs: ConditionConfigFormValues[];
}

interface DataTriggerConfigFormvalues {
  id: string;
  type_trigger: string;
  configs?: ConditionConfig[];
  channel?: string;
  conversation_status?: string;
}

interface ConditionConfigFormValues {
  id: string;
  type?: string;
  operator?: string;
  field?: string;
  value?: string;
  start_by_date?: string;
  end_by_date?: string;
  start_by_time?: string;
  end_by_time?: string;
  start_by_datetime?: string;
  end_by_datetime?: string;
  time?: string;
  units_of_time?: string;
  days?: string[];
  channels?: string[];
  keywords?: string[];
}
