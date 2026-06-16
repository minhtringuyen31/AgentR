import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';

import { ITeam } from '@/types/Team';
import { IRole } from '@/types/Role';
import { IUser } from '@/types/User';
import { UserBody } from '@/types/UserBody';
import {
  Button,
  Divider,
  KeenIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@/components';
import { countryCodes, genderOptions } from '@/constants';
import { Input, Select } from '@/components/forms';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: IUser | null;
  teamsData: ITeam[];
  rolesData: IRole[];
  updateUser: (userId: string, postBody: UserBody) => Promise<void>;
}

const ModalEditUser: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userData,
  teamsData,
  rolesData,
  updateUser
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);

  useEffect(() => {
    setRoles(rolesData);
  }, [rolesData]);

  useEffect(() => {
    const optionsData = teamsData.map((team: ITeam) => ({
      label: team.name,
      value: team.id
    }));

    setOptions(optionsData);
  }, [teamsData]);

  const filterRoles = (roles: IRole[]) => {
    return roles.filter((role) => role.roleName !== 'owner');
  };

  const getDefaultTeams = () => {
    if (userData?.teams && userData.teams.length > 0) {
      return userData.teams.map((team: { id: string }) => team.id);
    }
    return [];
  };

  const initialValues: UserBody = {
    firstName: userData?.firstName ?? '',
    lastName: userData?.lastName ?? '',
    email: userData?.email ?? '',
    username: userData?.username ?? '',
    gender: userData?.gender ?? '',
    dateOfBirth: userData?.dateOfBirth ?? '',
    role: userData?.role?.id ?? '',
    phoneNumber: userData?.phoneNumber ?? '',
    countryCode: userData?.countryCode ?? '',
    teams:
      userData?.teams && userData?.teams.length > 0
        ? userData.teams.map((team: { id: string }) => team.id)
        : [],
    position: userData?.position ?? ''
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .max(100, 'First name must be at most 100 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .max(100, 'Last name must be at most 100 characters')
      .required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    username: Yup.string().required('Username is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().matches(/^\d+$/, 'Phone number must be numeric'),
    position: Yup.string().max(100, 'Position must be at most 100 characters'),
    dateOfBirth: Yup.date().required('Date of birth is required')
  });

  const createPostBody = (values: typeof initialValues) => {
    const postBody: UserBody = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      role: values.role,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth || '',
      phoneNumber: values.phoneNumber,
      countryCode: values.countryCode,
      teams: values.teams,
      position: values.position
    };

    return postBody;
  };

  const handleEditUser = async (userData: IUser | null, values: typeof initialValues) => {
    if (!userData?.id) {
      return;
    }
    try {
      const postBody = createPostBody(values);

      await updateUser(userData?.id, postBody);

      enqueueSnackbar('Failed to update user', { variant: 'error' });
    } catch (error) {
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      console.error('Error in updateUser', error);
    }
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Profile Information" className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleEditUser(userData, values)}
          >
            {() => (
              <Form className="max-w-4xl w-full">
                <div className="flex flex-col items-center p-4">
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="relative">
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        // onChange={(e) => {
                        //     setFieldValue("avatar", url)
                        //   }
                        // }}
                      />
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                        {userData?.avatar ? (
                          <img
                            src={userData.avatar}
                            alt="User Avatar"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <KeenIcon icon="picture" className="text-2xl text-gray-700" />
                        )}

                        <div className="absolute inset-0 bg-black opacity-50 rounded-full"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <KeenIcon icon="picture" className="text-2xl text-white" />
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 text-sm text-blue-500 font-semibold">
                      Upload cover photo
                    </span>
                  </label>
                </div>

                <Divider />

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="col-span-1">
                      <label htmlFor="firstName" className="block text-sm">
                        First Name<span className="text-red-500">*</span>
                      </label>
                      <Field name="firstName" type="text">
                        {({ field }: FieldProps) => <Input id="firstName" {...field} />}
                      </Field>
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="col-span-1">
                      <label htmlFor="lastName" className="block text-sm">
                        Last Name<span className="text-red-500">*</span>
                      </label>
                      <Field name="lastName" type="text">
                        {({ field }: FieldProps) => <Input id="lastName" {...field} />}
                      </Field>
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-1">
                      <label htmlFor="email" className="block text-sm">
                        Email<span className="text-red-500">*</span>
                      </label>
                      <Field id="email" name="email" type="email">
                        {({ field }: FieldProps) => <Input {...field} />}
                      </Field>
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* User Name */}
                    <div className="col-span-1">
                      <label htmlFor="username" className="block text-sm">
                        Username<span className="text-red-500">*</span>
                      </label>
                      <Field id="username" name="username" type="text" disabled>
                        {({ field }: FieldProps) => <Input {...field} />}
                      </Field>
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Gender */}
                    <div className="col-span-1">
                      <label htmlFor="gender" className="block text-sm">
                        Gender
                      </label>
                      <Field name="gender">
                        {({ field, form }: FieldProps) => (
                          <Select
                            className="block"
                            {...field}
                            id="gender"
                            options={genderOptions}
                            placeholder="Select a gender"
                            onChange={(e) => form.setFieldValue('gender', e)}
                          />
                        )}
                      </Field>
                    </div>

                    {/* Birthday */}
                    <div className="col-span-1">
                      <label htmlFor="dateOfBirth" className="block text-sm">
                        Birthday
                      </label>
                      <Field name="dateOfBirth" max={new Date().toISOString().split('T')[0]}>
                        {({ field, form }: FieldProps) => (
                          <DatePicker
                            id="dateOfBirth"
                            className="block"
                            {...field}
                            value={field.value ? dayjs(field.value) : null}
                            size="large"
                            format={'MMM DD YYYY'}
                            onChange={(date) =>
                              form.setFieldValue('dateOfBirth', date.format('YYYY-MM-DD'))
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="dateOfBirth"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Role */}
                    <div className="col-span-1">
                      <label htmlFor="role" className="block text-sm">
                        Role<span className="text-red-500">*</span>
                      </label>
                      <Field name="role">
                        {({ field, form }: FieldProps) => (
                          <Select
                            className="block"
                            {...field}
                            id="role"
                            options={filterRoles(roles).map((role) => ({
                              value: role.id,
                              label: role.roleName
                            }))}
                            placeholder="Select a role"
                            onChange={(e) => form.setFieldValue('role', e)}
                          />
                        )}
                        {/* <option value="" label="Select a role" disabled />
                        {filterRoles(roles).map((role) => (
                          <option key={role.id} value={role.id} className="capitalize">
                            {role.roleName}
                          </option>
                        ))} */}
                      </Field>
                      <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* Phone Number */}
                    <div className="col-span-1">
                      <label htmlFor="phoneNumber" className="block text-sm">
                        Phone Number
                      </label>
                      <div className="flex gap-2 items-center">
                        <Field name="countryCode">
                          {({ field, form }: FieldProps) => (
                            <Select
                              className="block"
                              {...field}
                              id="countryCode"
                              options={countryCodes}
                              defaultValue={countryCodes[0]}
                              onChange={(e) => form.setFieldValue('countryCode', e)}
                            />
                          )}
                        </Field>
                        <Field name="phoneNumber">
                          {({ field }: FieldProps) => (
                            <Input id="phoneNumber" {...field} className="!w-1/2 flex-grow" />
                          )}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="phoneNumber"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Team */}
                    <div className="col-span-1">
                      <label htmlFor="teams" className="block text-sm">
                        Teams
                      </label>
                      <Field name="teams">
                        {({ field, form }: FieldProps) => (
                          <Select
                            mode="multiple"
                            className="block"
                            placeholder="Please select"
                            value={field.value}
                            onChange={(value) => form.setFieldValue('teams', value)}
                            defaultValue={getDefaultTeams()}
                            options={options}
                          />
                        )}
                      </Field>
                    </div>

                    {/* Position */}
                    <div className="col-span-1">
                      <label htmlFor="position" className="block text-sm">
                        Position
                      </label>
                      <Field name="position" type="text">
                        {({ field }: FieldProps) => <Input id="position" {...field} />}
                      </Field>
                      <ErrorMessage
                        name="position"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <Divider />

                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={onClose} color="secondary" className="rounded-lg border-2 px-6">
                    Cancel
                  </Button>
                  <Button className="rounded-lg px-8">Update</Button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalEditUser };
