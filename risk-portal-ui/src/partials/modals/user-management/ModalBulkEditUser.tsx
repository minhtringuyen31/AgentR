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
import { genderOptions } from '@/constants';
import { IRole } from '@/types/Role';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

interface EditBulkUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersIds: string[];
  rolesData: IRole[];
  updateBulkUser: (
    userIds: string[],
    selectedProperty: string,
    inputValue: string
  ) => Promise<void>;
}

const ModalBulkEditUser: React.FC<EditBulkUserModalProps> = ({
  isOpen,
  onClose,
  selectedUsersIds,
  rolesData,
  updateBulkUser
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption>();
  const [inputValue, setInputValue] = useState<string>('');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  const handleChangeProperty = (e: string) => {
    setSelectedProperty(e);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    setRoleOptions(convertRolesToOptions(filterRoles(rolesData)));
  }, [rolesData]);

  const convertRolesToOptions = (roles: IRole[]) => {
    return roles.map((role) => ({
      label: role.roleName,
      value: role.id
    }));
  };

  const filterRoles = (roles: IRole[]) => {
    return roles.filter((role) => role.roleName !== 'owner');
  };

  const options = [
    { label: 'First Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Gender', value: 'gender' },
    { label: 'Birthday', value: 'dateOfBirth' },
    { label: 'Role', value: 'role' },
    { label: 'Position', value: 'position' }
  ];

  const handleEditBulkUserModal = async () => {
    if (selectedUsersIds.length === 0) {
      console.warn('No users selected to add to the team.');
      return;
    }
    try {
      await updateBulkUser(selectedUsersIds, selectedProperty?.value || '', inputValue);
      enqueueSnackbar('Updated users successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error in updateBulkUser', error);
      enqueueSnackbar('Failed to update users', { variant: 'error' });
    }
    onClose();
  };

  const renderInputField = (selectedProperty?: string) => {
    switch (selectedProperty) {
      case 'firstName':
      case 'lastName':
      case 'position':
        return (
          <Input
            type="text"
            id="value"
            placeholder={`Enter ${selectedProperty.replace(/([A-Z])/g, ' $1')}`}
            value={inputValue}
            onChange={handleInputChange}
            className="border p-2 rounded-lg w-full text-2sm"
            disabled={!selectedProperty}
          />
        );
      case 'gender':
        return (
          <Select
            id="gender"
            className="block"
            value={inputValue}
            options={genderOptions}
            placeholder="Select a gender"
            onChange={(value) => setInputValue(value)}
          />
        );
      case 'dateOfBirth':
        return (
          <DatePicker
            id="value"
            size="large"
            className="w-full"
            value={inputValue ? dayjs(inputValue) : null}
            onChange={(value) => setInputValue(value?.format('YYYY-MM-DD') || '')}
            disabled={!selectedProperty}
          />
        );
      case 'role':
        return (
          <Select
            id="role"
            className="block"
            value={inputValue}
            options={filterRoles(rolesData).map((role) => ({
              value: role.id,
              label: role.roleName
            }))}
            placeholder="Select a role"
            onChange={(value) => setInputValue(value || '')}
          />
        );
      default:
        return <Input type="text" id="value" value="" disabled />;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Edit Bulk User" className="p-0 pb-4">
          <button onClick={() => onClose()} className="text-lg">
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {/* Property Dropdown */}
            <label htmlFor="property" className="block mb-2 text-sm">
              <span className="font-medium ">Contact property to update</span>
              <Select
                id="property"
                options={options}
                value={selectedProperty}
                placeholder="Please select"
                onChange={handleChangeProperty}
                className="text-2sm w-full"
              />
            </label>

            <label htmlFor="value" className="block mb-2 text-sm">
              <span className=" font-medium ">Value</span>
              {renderInputField(selectedProperty)}
            </label>
          </div>

          {/* Divider */}
        </ModalBody>
        <Divider />
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} color="secondary" className="rounded-lg border-2 px-6">
            Cancel
          </Button>
          <Button
            onClick={handleEditBulkUserModal}
            className="rounded-lg px-8"
            disabled={!selectedProperty || !inputValue}
          >
            Edit
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalBulkEditUser };
