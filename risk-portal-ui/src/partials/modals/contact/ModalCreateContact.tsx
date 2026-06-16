import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input, Select } from '@/components/forms';
import { countryCodes, genderOptions } from '@/constants';
import { useMutateContact, useUser } from '@/hooks';
import { useContactContext } from '@/layouts/contact';
import { ICreateContactPayload } from '@/types/Contact';
import { debounce } from '@mui/material';
import { DatePicker } from 'antd';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { FC, useMemo, useState } from 'react';
import * as Yup from 'yup';

interface ModalCreateContactProps {
  isOpen?: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const validationSchema = Yup.object<ICreateContactPayload>({
  name: Yup.string()
    .trim()
    .required('Name is required.')
    .max(100, 'Name must be 100 characters or less.'),
  email: Yup.string().email('Invalid email address'),
  phone: Yup.string().required('Phone number is required.'),
  country_code: Yup.string(),
  user: Yup.string(),
  birthday: Yup.date(),
  gender: Yup.string(),
  contact_lists: Yup.array(),
  company: Yup.string(),
  job_title: Yup.string()
});

const ModalCreateContact: FC<ModalCreateContactProps> = ({
  isOpen = false,
  onClose,
  onCreateSuccess = () => {}
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchUserKeyword, setSearchUserKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { usersData } = useUser(1, 10, '', searchUserKeyword);
  const { contactListsData } = useContactContext();
  const { createContact } = useMutateContact();
  // const { getUserInfo } = useAuth();
  // const user = useMemo(() => getUserInfo(), [getUserInfo]);
  const contactLists = useMemo(() => contactListsData?.results || [], [contactListsData]);

  const users = useMemo(() => usersData?.results || [], [usersData]);

  const formik = useFormik<ICreateContactPayload>({
    initialValues: {
      name: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      country_code: '+84',
      // user: user?.id || '',
      user: '',
      birthday: undefined,
      gender: '',
      contact_lists: [],
      company: '',
      job_title: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await createContact(values);

        enqueueSnackbar('Create contact successfully', { variant: 'success' });
        onCreateSuccess();
      } catch (error) {
        console.error('Error in createContact', error);
        enqueueSnackbar('Create contact failed', { variant: 'error' });
      }

      setIsLoading(false);
      closeModal();
    }
  });

  const debounceSearchUser = debounce((keyword: string) => {
    setSearchUserKeyword(keyword);
  }, 500);

  const closeModal = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader title="Create New Contact" className="p-0 border-0">
          <button onClick={closeModal}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid-cols-2 grid gap-4 text-sm">
              <div>
                <label htmlFor="name" className="block text-2sm font-medium text-gray-700">
                  Full Name*
                </label>
                <Input type="text" id="name" className="mt-1" {...formik.getFieldProps('name')} />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500">{formik.errors.name}</div>
                )}
              </div>
              <div>
                <label htmlFor="firstname" className="block text-2sm font-medium text-gray-700">
                  First Name
                </label>
                <Input
                  type="text"
                  id="firstname"
                  className="w-full p-2 border rounded-md "
                  {...formik.getFieldProps('firstname')}
                />
                {formik.touched.firstname && formik.errors.firstname && (
                  <div className="text-red-500">{formik.errors.firstname}</div>
                )}
              </div>
              <div>
                <label htmlFor="lastname" className="block text-2sm font-medium text-gray-700">
                  Last Name
                </label>
                <Input
                  type="text"
                  id="lastname"
                  className="mt-1"
                  {...formik.getFieldProps('lastname')}
                />
                {formik.touched.lastname && formik.errors.lastname && (
                  <div className="text-red-500">{formik.errors.lastname}</div>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-2sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  className="mt-1"
                  {...formik.getFieldProps('email')}
                />
              </div>
              <div>
                <label htmlFor="birthday" className="block text-2sm font-medium text-gray-700">
                  Birthday
                </label>
                <DatePicker
                  id="birthday"
                  format={'MMM DD YYYY'}
                  onChange={(date) => formik.setFieldValue('birthday', date.format('YYYY-MM-DD'))}
                  size="large"
                  className="block mt-1"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-2sm font-medium text-gray-700">
                  Gender
                </label>
                <Select
                  id="gender"
                  placeholder="Select Gender"
                  value={formik.values.gender}
                  onChange={(value) => formik.setFieldValue('gender', value)}
                  className="block mt-1"
                  options={genderOptions}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-2sm font-medium text-gray-700">
                  Phone Number*
                </label>
                <div className="flex gap-2">
                  <Select
                    id="country_code"
                    className="block mt-1 basis-2/6 -pb-2"
                    value={formik.values.country_code}
                    options={countryCodes}
                    onChange={(e) => formik.setFieldValue('country_code', e)}
                  />

                  <div className="block basis-4/6">
                    <Input
                      type="text"
                      id="phone"
                      className="mt-1"
                      {...formik.getFieldProps('phone')}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="text-red-500">{formik.errors.phone}</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="contact_lists" className="block text-2sm font-medium text-gray-700">
                  Lists
                </label>
                <Select
                  id="contact_lists"
                  mode="multiple"
                  placeholder="Select Lists"
                  value={formik.values.contact_lists}
                  filterOption={(input, option) =>
                    !!option?.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(e) => formik.setFieldValue('contact_lists', Array.from(e.values()))}
                  className="block mt-1"
                  options={contactLists.map((list) => ({
                    value: list.id,
                    label: list.name
                  }))}
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-2sm font-medium text-gray-700">
                  Company Name
                </label>
                <Input
                  type="text"
                  id="company"
                  className="mt-1"
                  {...formik.getFieldProps('company')}
                />
              </div>
              <div>
                <label htmlFor="job_title" className="block text-2sm font-medium text-gray-700">
                  Job Title
                </label>
                <Input
                  type="text"
                  id="job_title"
                  className="mt-1"
                  {...formik.getFieldProps('job_title')}
                />
              </div>
              <div>
                <label htmlFor="user" className="block text-2sm font-medium text-gray-700">
                  Contact Owner
                </label>
                <Select
                  id="user"
                  onSearch={(value) => debounceSearchUser(value)}
                  className="block mt-1"
                  value={formik.values.user}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => formik.setFieldValue('user', value)}
                  options={users.map((user) => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName}`
                  }))}
                />
              </div>
            </div>
          </form>
        </ModalBody>
        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button className="px-6" onClick={formik.submitForm} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalCreateContact };
