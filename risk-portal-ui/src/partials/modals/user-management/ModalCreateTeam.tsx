import {
  Button,
  Divider,
  KeenIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@/components';
import { Input } from '@/components/forms';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import * as yup from 'yup';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewTeam: (teamName: string) => Promise<void>;
}

// Define validation schema using yup
const teamSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Team name is required.')
    .max(100, 'Name must be 100 characters or less.')
});

const ModalCreateTeam: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onAddNewTeam }) => {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema: teamSchema,
    onSubmit: (values) => {
      handleAddTeam(values);
    }
  });

  const handleAddTeam = async (data: { name: string }) => {
    try {
      await onAddNewTeam(data.name);
      enqueueSnackbar('Team added successfully', { variant: 'success' });
      formik.resetForm();
    } catch (error) {
      console.error('Error in handleAddTeam', error);
      enqueueSnackbar('Failed to add team', { variant: 'error' });
    }
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader title="Add New Team" className="p-0 pb-4">
          <button onClick={onClose} className="text-lg">
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="mb-2">
          <form onSubmit={formik.handleSubmit}>
            <div className="">
              <label className="block text-sm mb-2" htmlFor="name">
                Name<span className=" text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                {...formik.getFieldProps('name')}
                className={`${formik.errors.name ? 'border-red-500' : ''}`}
              />
              {formik.errors.name && <p className="text-red-500 text-sm">{formik.errors.name}</p>}
            </div>
          </form>
        </ModalBody>
        <Divider />
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} color="secondary" className="rounded-lg border-2 px-6">
            Cancel
          </Button>
          <Button onClick={formik.submitForm} className="rounded-lg px-8">
            Add
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export { ModalCreateTeam };
