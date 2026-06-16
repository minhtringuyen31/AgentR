import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Select } from '@/components/forms';
import { useMutateContactList } from '@/hooks';
import { useContactContext } from '@/layouts/contact';
import { useSnackbar } from 'notistack';
import { FC, useMemo, useState } from 'react';

interface ModalAddToListProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRowsId: string[];
  onUpdateSuccess?: () => void;
}
const ModalAddToList: FC<ModalAddToListProps> = ({
  isOpen,
  onClose,
  onUpdateSuccess = () => {},
  selectedRowsId
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { contactListsData } = useContactContext();
  const contactLists = useMemo(() => contactListsData?.results || [], [contactListsData]);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedAction, setSelectedAction] = useState<'add' | 'remove'>('add');
  const { addToList, removeFromList } = useMutateContactList();

  const updateList = async () => {
    setIsLoading(true);
    if (selectedAction === 'add') {
      const isAdded = await addToList(selectedListId, selectedRowsId);
      if (!isAdded) {
        enqueueSnackbar('Failed to add to list', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Added to list successfully', { variant: 'success' });
      onUpdateSuccess();
    } else {
      const isRemoved = await removeFromList(selectedListId, selectedRowsId);
      if (!isRemoved) {
        enqueueSnackbar('Failed to remove from list', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Removed from list successfully', { variant: 'success' });
      onUpdateSuccess();
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Add Or Remove Contacts From List" className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 mt-4 text-sm">
          <div>
            <label className="block">Action</label>
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                name="action"
                value="add"
                checked={selectedAction === 'add'}
                onChange={(e) => setSelectedAction(e.target.value as 'add' | 'remove')}
              />
              <label htmlFor="add" className="me-4">
                Add
              </label>

              <input
                type="radio"
                name="action"
                value="remove"
                checked={selectedAction === 'remove'}
                onChange={(e) => setSelectedAction(e.target.value as 'add' | 'remove')}
              />
              <label htmlFor="remove">Remove</label>
            </div>
          </div>
          <div>
            <label htmlFor="list" className="block">
              List Name
            </label>
            <Select
              className="w-full"
              placeholder="Select a list"
              value={selectedListId}
              options={contactLists.map((list) => ({
                value: list.id,
                label: list.name
              }))}
              filterOption={(input, option) =>
                !!option?.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => setSelectedListId(value)}
            />
          </div>
        </ModalBody>
        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button className="btn px-6" onClick={updateList} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalAddToList };
