import { useFormik } from 'formik';
import { FC, useState } from 'react';
import * as Yup from 'yup';

import { Button, KeenIcon, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Input, Select } from '@/components/forms';
import { countryCodes } from '@/constants';
import { useMutateContact } from '@/hooks';
import { IUpdateContactPayload } from '@/types/Contact';
import { useSnackbar } from 'notistack';

interface ModalBulkEditContactsProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSuccess?: () => void;
  selectedRowsId: string[];
}

const options = [
  {
    value: 'name',
    label: 'Name'
  },
  {
    value: 'email',
    label: 'Email'
  },
  {
    value: 'phone',
    label: 'Phone Number'
  },
  {
    value: 'company',
    label: 'Company Name'
  },
  {
    value: 'job_title',
    label: 'Job Title'
  }
];

const ModalBulkEditContacts: FC<ModalBulkEditContactsProps> = ({
  isOpen,
  onClose,
  onEditSuccess = () => {},
  selectedRowsId
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<keyof IUpdateContactPayload>('name');
  const { bulkUpdateContacts } = useMutateContact();

  const validationSchema = Yup.object<IUpdateContactPayload>({
    name: Yup.string()
      .trim()
      .max(100, 'Name must be 100 characters or less.')
      .when([], {
        is: () => selectedProperty == 'name',
        then: (schema) => schema.required('Name is required'),
        otherwise: (schema) => schema.notRequired()
      }),
    email: Yup.string()
      .email('Invalid email address')
      .when([], {
        is: () => selectedProperty == 'email',
        then: (schema) => schema.required('Email is required'),
        otherwise: (schema) => schema.notRequired()
      }),
    phone: Yup.string()
      .matches(/^\d+$/, 'Invalid phone number.')
      .when([], {
        is: () => selectedProperty == 'phone',
        then: (schema) => schema.required('Phone number is required'),
        otherwise: (schema) => schema.notRequired()
      }),
    country_code: Yup.string().when([], {
      is: () => selectedProperty == 'phone',
      then: (schema) => schema.required('Country code is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    company: Yup.string().when([], {
      is: () => selectedProperty == 'company',
      then: (schema) => schema.required('Company name is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    job_title: Yup.string().when([], {
      is: () => selectedProperty == 'job_title',
      then: (schema) => schema.required('Job title is required'),
      otherwise: (schema) => schema.notRequired()
    })
  });

  const formik = useFormik<IUpdateContactPayload>({
    initialValues: {},
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      if (selectedRowsId.length === 0) {
        return false;
      }
      try {
        const contactIds = Array.from(selectedRowsId.values());
        await bulkUpdateContacts(contactIds, values);

        enqueueSnackbar('Update contacts successfully', { variant: 'success' });
        onEditSuccess();
      } catch (error) {
        console.error('Error in bulkUpdateContacts', error);
        enqueueSnackbar('Update contacts failed', { variant: 'error' });
      }

      onClose();

      setIsLoading(false);
    }
  });

  const closeModal = () => {
    formik.resetForm();
    onClose();
  };

  const changeSelectedProp = (value: string) => {
    setSelectedProperty(value as keyof IUpdateContactPayload);
    formik.resetForm();
  };

  const submitForm = () => {
    formik.validateForm();
    formik.submitForm();
  };

  const renderInputField = (selectedProperty: string) => {
    switch (selectedProperty) {
      case 'phone':
        return (
          <div className="grid grid-cols-12 gap-4 grid-flow-col auto-cols-max">
            <Select
              id="country_code"
              className="col-span-3"
              value={formik.values.country_code}
              options={countryCodes}
              onChange={(value) => formik.setFieldValue('country_code', value)}
            />
            <Input
              id="value"
              type="tel"
              placeholder={`Enter Phone Number`}
              className="col-span-9"
              {...formik.getFieldProps('phone')}
            />
          </div>
        );
      case 'email':
        return (
          <Input
            id="value"
            type="email"
            placeholder={`Enter Email`}
            className="col-span-12"
            {...formik.getFieldProps('email')}
          />
        );
      default:
        return (
          <Input
            id="value"
            type="text"
            placeholder={`Enter ${
              options.find((option) => option.value === selectedProperty)?.label
            }`}
            className="col-span-12"
            {...formik.getFieldProps(selectedProperty)}
          />
        );
    }
  };

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader title={`Edit ${selectedRowsId.length} Contacts`} className="p-0 border-0">
          <button onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          {/* <div className="p-4"> */}
          <label htmlFor="property" className="block mb-2 text-sm">
            <span className=" font-semibold ">Contact property to update</span>
            <Select
              id="property"
              className="block "
              value={selectedProperty}
              onChange={changeSelectedProp}
              options={options}
            />
          </label>
          <div>
            <label htmlFor="value" className="block text-sm">
              <span className=" font-semibold ">Value</span>
            </label>
            {renderInputField(selectedProperty)}

            {formik.errors[selectedProperty] && (
              <div className="text-red-500 text-2sm">{formik.errors[selectedProperty]}</div>
            )}
          </div>
        </ModalBody>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} color="secondary" className="border-2 px-6">
            Cancel
          </Button>
          <Button
            onClick={submitForm}
            className="rounded-lg px-8"
            disabled={
              isLoading || !selectedProperty || formik.errors[selectedProperty] !== undefined
            }
          >
            Edit
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalBulkEditContacts };
