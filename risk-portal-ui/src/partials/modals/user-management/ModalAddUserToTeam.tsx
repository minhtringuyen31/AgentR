import {
  Button,
  Divider,
  KeenIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@/components';
import { Input, Select } from '@/components/forms';
import { ITeam } from '@/types/Team';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

interface AddUserToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersIds: string[];
  teamsData: ITeam[];
  updateUserInTeam: (userIds: string[], teamIds: string[], action: string) => Promise<void>;
}

const ModalAddUserToTeam: React.FC<AddUserToListModalProps> = ({
  isOpen,
  onClose,
  selectedUsersIds,
  teamsData,
  updateUserInTeam
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [action, setAction] = useState<'add-users' | 'remove-users'>('add-users');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const options = teamsData.map((team) => ({
    label: team.name,
    value: team.id
  }));

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAction(e.target.value as 'add-users' | 'remove-users');
  };

  const handleReset = () => {
    setAction('add-users');
    setSelectedTeams([]);
  };

  const handleSubmit = async () => {
    if (selectedUsersIds.length === 0) {
      console.warn('No users selected');
      return;
    }
    try {
      await updateUserInTeam(selectedUsersIds, selectedTeams, action);
      enqueueSnackbar('Updated team successfully', { variant: 'success' });

      handleReset();
    } catch (error) {
      enqueueSnackbar('Failed to update team', { variant: 'error' });
      console.error('Error in updateUserInTeam', error);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Add To Team" className="p-0 pb-4">
          <button onClick={() => onClose()} className="text-lg">
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="mb-2">
          <div className="mb-4 flex flex-col gap-2">
            <label className="text-sm font-medium mr-4">Action:</label>
            <div>
              <label className="inline-flex items-center mr-4">
                <Input
                  type="radio"
                  name="action"
                  value="add-users"
                  checked={action === 'add-users'}
                  onChange={handleActionChange}
                  className="form-radio h-5 w-5  text-blue-500 checked:bg-blue-500"
                />
                <span className="ml-2 text-2sm">Add</span>
              </label>
              <label className="inline-flex items-center">
                <Input
                  type="radio"
                  name="action"
                  value="remove-users"
                  checked={action === 'remove-users'}
                  onChange={handleActionChange}
                  className="form-radio h-5 w-5 text-blue-500 checked:bg-blue-500"
                />
                <span className="ml-2 text-2sm">Remove</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="lists" className="text-sm font-medium block mb-2">
              List name:
            </label>
            <Select
              id="lists"
              mode="multiple"
              value={selectedTeams}
              options={options}
              placeholder="Please select"
              onChange={(value) => setSelectedTeams(value)}
              className="text-2sm w-full"
            />
          </div>
        </ModalBody>
        {/* Divider */}
        <Divider />
        <div className="flex justify-end gap-4 mt-4">
          <Button onClick={onClose} color="secondary" className="rounded-lg border-2 px-6">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="rounded-lg px-8">
            Edit
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalAddUserToTeam };
