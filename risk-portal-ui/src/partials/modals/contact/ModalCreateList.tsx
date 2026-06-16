import { FC, useState } from 'react';
import { useMutateContactList } from '@/hooks';
import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input } from '@/components/forms';
import { useSnackbar } from 'notistack';
// import { toast } from "react-toastify";

interface ModalCreateListProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const ModalCreateList: FC<ModalCreateListProps> = ({
  isOpen,
  onClose,
  onCreateSuccess = () => {}
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const { createList } = useMutateContactList();

  const closeModal = () => {
    setName('');
    onClose();
  };

  const create = async () => {
    if (!name) {
      return;
    }
    setIsLoading(true);
    const isCreated = await createList({ name });
    if (isCreated) {
      onCreateSuccess();
      enqueueSnackbar('Create list successfully', { variant: 'success' });
    } else {
      enqueueSnackbar('Create list failed', { variant: 'error' });
    }
    closeModal();

    setIsLoading(false);
  };

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader className="p-0 border-0" title="Create New List">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="text-sm">
          <div className="bg-white rounded-2xl">
            <label htmlFor="name">
              Name
              <Input
                type="text"
                placeholder="List name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </label>
          </div>
        </ModalBody>

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button className="px-6" onClick={create} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalCreateList };
