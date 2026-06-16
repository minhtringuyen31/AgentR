import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input } from '@/components/forms';
import { useMutateContactList } from '@/hooks';
import { useSnackbar } from 'notistack';
import { FC, useState } from 'react';

interface BulkEditContactListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSuccess?: () => void;
  selectedRowsId: string[];
}

const ModalBulkEditContactLists: FC<BulkEditContactListModalProps> = ({
  isOpen,
  onClose,
  onEditSuccess = () => {},
  selectedRowsId
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const { bulkUpdateLists } = useMutateContactList();

  const update = async () => {
    if (selectedRowsId.length === 0) {
      enqueueSnackbar('No list selected', { variant: 'error' });
      return;
    }
    if (!name) {
      enqueueSnackbar('Name is required', { variant: 'error' });
      return;
    }
    setIsLoading(true);
    const isUpdated = await bulkUpdateLists(selectedRowsId, { name });

    if (!isUpdated) {
      enqueueSnackbar('Update contacts failed', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Update contacts successfully', { variant: 'success' });
    onEditSuccess();
    closeModal();
    setIsLoading(false);
  };

  const closeModal = () => {
    setName('');
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader title={`Edit ${selectedRowsId.length} Lists`} className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <label htmlFor="name">
            Name
            <Input
              type="text"
              placeholder="List name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </label>
        </ModalBody>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button
            onClick={update}
            className="rounded-lg px-8"
            disabled={!name || selectedRowsId.length === 0 || isLoading}
          >
            Edit
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalBulkEditContactLists };
