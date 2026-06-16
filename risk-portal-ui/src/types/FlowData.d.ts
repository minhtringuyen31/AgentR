import { Vendor } from './Vendor';
import { IUser } from './User';
import { Edge, Node } from '@xyflow/react';

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

interface FlowDesign {
  id: string;
  name: string;
  flow_data: FlowTrigger;
  status: string;
  creator: IUser;
  updated_by_user?: IUser;
  updated_at: string;
  flow_enrollments?: number;
  last_enrollment?: string;
}

interface FlowDesignBody {
  name: string;
  flow: string;
  status: string;
}

interface FlowTrigger {
  id: string;
  vendor?: Vendor;
  title: string;
  desc: string;
  type: string;
}

export { FlowData, FlowDesign, FlowDesignBody, FlowTrigger };

// interface FlowData {
//   nodes: Node[];
//   edges: Edge[];
// }

// interface Node {
//   id: string;
//   type: string;
//   // Các trường thiếu
//   data: any;
// }

// interface Edge {
//   id: string;
//   source: string;
//   target: string;
//   type: string;
//   data: any;
// }
