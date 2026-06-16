import React, { ReactNode } from 'react';

interface Action {
  title: string;
  icon: ReactNode;
  action: () => void;
}

interface BulkActionProps {
  selectedCount: number;
  actions: Action[];
}

const BulkAction: React.FC<BulkActionProps> = ({ selectedCount, actions }) => {
  return (
    <div className="px-6 py-4 border-t">
      <div className="flex flex-row gap-4 items-center font-semibold text-blue-500">
        <span className="text-3sm">{selectedCount} contacts selected</span>

        {/* Render actions */}
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex items-center px-2 py-1 text-gray-500 rounded hover:bg-gray-200"
          >
            {action.icon}
            <span className="ml-2 font-semibold text-3sm">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { BulkAction };
