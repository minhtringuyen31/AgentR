import React, { useEffect, useRef, useState } from 'react';
import { IRole } from '@/types/Role';
import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input, Select } from '@/components/forms';
import { useSnackbar } from 'notistack';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  rolesData: IRole[];
  inviteUser: (emails: string[], role: string) => Promise<void>; // Not sure why inviteUser funtion takes in emails as string array but role as single string
}

const ModalInviteUser: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  rolesData,
  inviteUser
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [roles, setRoles] = useState<IRole[]>([]);
  const [role, setRole] = useState<string>('');
  const [error, setError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRoles(rolesData);
  }, [rolesData]);

  const filterRoles = (roles: IRole[]) => {
    return roles.filter((role) => role.roleName !== 'owner');
  };

  const handleInvite = async (emailList: string[], role: string) => {
    try {
      await inviteUser(emailList, role);

      enqueueSnackbar('Invited successfully', { variant: 'success' });
      endProcess();
    } catch (error) {
      enqueueSnackbar('Failed to invite', { variant: 'error' });
      console.error('Error in inviteUser', error);
    }
    onClose();
  };

  const endProcess = () => {
    handleClearInputData();
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    // Basic email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEmail(e.target.value);
    setError('');
  };

  const handleAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentEmail) {
      if (validateEmail(currentEmail)) {
        if (!emails.includes(currentEmail)) {
          setEmails([...emails, currentEmail]);
          setCurrentEmail('');
        } else {
          setError('Email already added.');
        }
      } else {
        setError('Please enter a valid email address.');
      }
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleClearInputData = () => {
    setCurrentEmail('');
    setEmails([]);
    setRole('');
    setError('');
  };

  return (
    <Modal open={isOpen} onClose={endProcess}>
      <ModalContent>
        <ModalHeader title="Invite People" className="p-0 border-0">
          <button onClick={endProcess}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="scrollable-y py-0 mb-5">
          {/* Email Field */}
          <label className="text-sm block mb-2" htmlFor="email">
            Email<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col mb-2">
            <div className="flex flex-wrap">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-200 rounded-full px-2 py-1 mr-2 mb-2"
                >
                  <span className="text-2sm">{email}</span>
                  <button className="ml-2 text-red-500" onClick={() => handleRemoveEmail(email)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="email"
              value={currentEmail}
              onChange={handleEmailChange}
              onKeyDown={handleAddEmail}
              placeholder="Type email and press Enter"
              className="flex-1 border p-2 rounded-lg text-2sm"
              ref={inputRef}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>} {/* Error message */}
          </div>

          {/* Role Selection */}
          <label className="block mb-2 text-sm" htmlFor="role">
            Role<span className="text-red-500">*</span>
          </label>
          <Select
            id="role"
            value={role}
            options={filterRoles(roles).map((role) => ({
              value: role.id,
              label: role.roleName
            }))}
            onChange={(e) => setRole(e)}
            className="block"
          />
          {/* Action Buttons */}
        </ModalBody>
        <div className="flex justify-end gap-2 mt-4 ">
          <Button onClick={endProcess} color="secondary" className="rounded-lg border-2 px-6">
            Cancel
          </Button>
          <Button
            onClick={() => handleInvite(emails, role)}
            className={`px-8 text-2sm`}
            disabled={emails.length === 0 || !role}
          >
            Invite
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalInviteUser };
