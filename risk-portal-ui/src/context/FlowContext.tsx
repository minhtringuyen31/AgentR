import React, { createContext, useContext, useState, useCallback } from 'react';
import { FlowData, FlowTrigger } from '@/types/FlowData';
import { Node } from '@xyflow/react';
import {
  getConditionFlow,
  getElementsAfterAddConditionBranch,
  getElementsAfterDelete,
  getUpdatedElementsAfterAddActionButtons,
  getUpdatedElementsAfterNodeAddition
} from '@/pages/custom-flow/flow-builder/utils/WorkflowElementUtils';

interface FlowContextProps {
  flowData: FlowData;
  setFlowData: React.Dispatch<React.SetStateAction<FlowData>>;
  flowTriggerData: FlowTrigger[];
  setFlowTriggerData: React.Dispatch<React.SetStateAction<FlowTrigger[]>>;
  onAddNodeCallback: (targetEdgeId: string, nodeType: string, actionType?: string) => void;
  onDeleteNodeCallback: (nodeId: string) => void;
  onUpdateNodeDataCallback: (updateNodeId: string, updatedData: Partial<Node>) => void;
  onAddNewConditionBranch: (targetNodeId: string) => void;
  onAddQuickButtonNode: (targetActNodeId: string) => void;
  cleanData: (elements: FlowData) => FlowData;
}

const FlowContext = createContext<FlowContextProps | undefined>(undefined);

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flowData, setFlowData] = useState<FlowData>({
    nodes: [],
    edges: []
  });

  const [flowTriggerData, setFlowTriggerData] = useState<FlowTrigger[]>([]);

  const cleanData = (elements: FlowData): FlowData => {
    const newElements: FlowData = {
      nodes: elements.nodes.map((node) => {
        const newData = { ...node.data };
        for (const key in newData) {
          if (typeof newData[key] === 'function') {
            delete newData[key];
          }
        }
        return { ...node, data: newData };
      }),
      edges: elements.edges.map(({ data, ...edge }) => edge)
    };
    return newElements;
  };

  const onAddNodeCallback = (targetEdgeId: string, nodeType: string, actionType?: string) => {
    setFlowData((flowData) => {
      if (nodeType === 'action-node' || nodeType === 'time-delay-node') {
        return getUpdatedElementsAfterNodeAddition(flowData, targetEdgeId, nodeType, actionType);
      } else if (nodeType == 'condition-node')
        return getConditionFlow(flowData, targetEdgeId, actionType);
      return flowData;
    });
  };

  const onDeleteNodeCallback = useCallback((nodeId: string) => {
    setFlowData((flowData) => getElementsAfterDelete(flowData, nodeId));
  }, []);

  const onUpdateNodeDataCallback = useCallback((updateNodeId: string, updatedData: Node) => {
    setFlowData((flowData) => {
      const newNodes: Node[] = flowData.nodes.map((node) =>
        node.id === updateNodeId ? { ...node, data: updatedData.data } : node
      );
      return { nodes: newNodes, edges: flowData.edges };
    });
  }, []);

  const onAddNewConditionBranch = (targetNodeId: string) => {
    setFlowData((flowData) => getElementsAfterAddConditionBranch(flowData, targetNodeId));
  };

  const onAddQuickButtonNode = (targetActNodeId: string) => {
    setFlowData((flowData) => getUpdatedElementsAfterAddActionButtons(flowData, targetActNodeId));
  };

  return (
    <FlowContext.Provider
      value={{
        flowData,
        setFlowData,
        flowTriggerData,
        setFlowTriggerData,
        onAddNodeCallback,
        onDeleteNodeCallback,
        onUpdateNodeDataCallback,
        onAddNewConditionBranch,
        onAddQuickButtonNode,
        cleanData
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};
