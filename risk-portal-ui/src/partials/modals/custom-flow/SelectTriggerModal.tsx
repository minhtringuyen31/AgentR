import { KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { TriggerList } from '@/pages/custom-flow/flow-list/create-flow';
import { FlowTrigger } from '@/types/FlowData';
import React from 'react';

interface SelectTriggerModalProps {
  triggers: FlowTrigger[];
  selectedTrigger: FlowTrigger;
  isOpen: boolean;
  onSelect: (selectedTrigger: FlowTrigger) => void;
  onClose: () => void;
}

const SelectTriggerModal: React.FC<SelectTriggerModalProps> = ({
  triggers,
  selectedTrigger,
  isOpen,
  onSelect,
  onClose
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Select trigger" className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="scrollable-y py-0 mb-5">
          <TriggerList
            triggers={triggers}
            selected={selectedTrigger}
            onSelect={onSelect}
            onClose={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { SelectTriggerModal };
