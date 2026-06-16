import { Chip, Divider, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input } from '@/components/forms';
import { IUser } from '@/types/User';
import React from 'react';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: IUser | null;
}

const countries = [
  { code: '+84', flag: 'VN', name: 'Vietnam' },
  { code: '+1', flag: 'US', name: 'United States' },
  { code: '+44', flag: 'GB', name: 'United Kingdom' }
];

const ModalViewUser: React.FC<ViewUserModalProps> = ({ isOpen, onClose, userData }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Profile Information" className="p-0 !border-0">
          <button onClick={onClose} color="light" className="text-lg rounded-lg">
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center p-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <KeenIcon icon="picture" className="text-6xl" />
                )}
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex flex-col justify-center items-center mt-4">
            <div className="max-w-4xl w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* First Name */}
                <div className="col-span-1">
                  <label className="block text-gray-500">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <Input readOnly value={userData?.firstName} />
                </div>

                {/* Last Name */}
                <div className="col-span-1">
                  <label className="block text-gray-500">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <Input readOnly value={userData?.lastName} />
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <label className="block text-gray-500">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <Input readOnly value={userData?.email} />
                </div>

                {/* User Name */}
                <div className="col-span-1">
                  <label className="block text-gray-500">
                    Username<span className="text-red-500">*</span>
                  </label>
                  <Input readOnly value={userData?.username} />
                </div>

                {/* Gender */}
                <div className="col-span-1">
                  <label className="block text-gray-500">Gender</label>
                  <Input readOnly value={userData?.gender} />
                </div>

                {/* Birthday */}
                <div className="col-span-1">
                  <label className="block text-gray-500">Birthday</label>
                  <Input readOnly value={userData?.dateOfBirth} />
                </div>

                {/* Role */}
                <div className="col-span-1">
                  <label className="block text-gray-500">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <Input readOnly value={userData?.role?.roleName} />
                </div>

                {/* Phone Number */}
                <div className="col-span-1">
                  <label className="block text-gray-500">Phone Number</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      readOnly
                      value={`(${userData?.countryCode})${countries
                        .find((country) => country.code === userData?.countryCode)
                        ?.flag.toUpperCase()}`}
                      className="!w-2/5"
                    />

                    <Input value={userData?.phoneNumber} readOnly className="flex-grow" />
                  </div>
                </div>

                {/* Team */}
                <div className="col-span-1 ">
                  <label className="block text-gray-500">Teams</label>
                  <div className="w-full p-1 border rounded-lg min-h-[40px] border-gray-300">
                    {Array.isArray(userData?.teams) && userData.teams.length > 0 && (
                      <div className="flex flex-wrap">
                        {userData.teams.map((team) => (
                          <Chip className="mx-1" key={team.id}>
                            {team.name}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Position */}
                <div className="col-span-1">
                  <label className="block text-gray-500 ">Position</label>
                  <Input readOnly value={userData?.position} />
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalViewUser };
