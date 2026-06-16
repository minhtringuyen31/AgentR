import React from 'react';
import { Button } from '../button';
import { KeenIcon } from '../keenicons';
import { Modal } from './Modal';
import { ModalBody } from './ModalBody';
import { ModalContent } from './ModalContent';
import { ModalHeader } from './ModalHeader';
import { Divider } from '../divider';

interface WarningContent {
  title: string;
  description: string;
}

interface ModalWarningProps {
  isOpen: boolean;
  onClose: () => void;
  content: WarningContent | null;
  action: () => void;
}

const ModalWarning: React.FC<ModalWarningProps> = ({ isOpen, onClose, content, action }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Confirm Delete" className="p-0 pb-4">
          <button onClick={() => onClose()} className="text-lg">
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="p-4">
            <p className="text-sm">{content?.description}</p>
          </div>

          {/* Divider */}
        </ModalBody>
        <Divider />
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button onClick={action} color="danger" className="px-6">
            Delete
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalWarning };
