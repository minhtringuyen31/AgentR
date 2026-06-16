import React from 'react';
import { ITeam } from '../../../types/Team';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Use formik or react-hook-form? Needs to be consistent
import * as Yup from 'yup';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamData: ITeam | null;
  updateTeam: (teamId: string, name: string) => Promise<void>;
}

const ModalEditTeam: React.FC<EditTeamModalProps> = ({ isOpen, onClose, teamData, updateTeam }) => {
  const { enqueueSnackbar } = useSnackbar();
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required('Name is required.')
      .max(100, 'Name must be 100 characters or less.')
  });

  const handleSubmit = async (values: { name: string }, teamData: ITeam | null) => {
    if (teamData) {
      try {
        await updateTeam(teamData.id, values.name);
        enqueueSnackbar('Team updated successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error in updateTeam', error);
        enqueueSnackbar('Failed to update team', { variant: 'error' });
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-80">
        <div className="flex justify-between p-4">
          <h2 className="text-2sm font-semibold text-start">Edit Team</h2>
          <button onClick={onClose} className="text-lg">
            <KeenIcon icon="cross" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex border-t border-black-300" />

        {/* Need to put initial value as states, plus add more options so that values can be updated from outside form */}
        <Formik
          initialValues={{ name: teamData?.name ?? '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSubmit(values, teamData)}
        >
          <Form className="p-4">
            <div>
              <label className="block mb-2 text-3sm" htmlFor="name">
                Name<span className="text-red-500">*</span>
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                className="w-full text-2sm p-2 border rounded-lg"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-3sm" />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 mt-4" />

            <div className="flex justify-end gap-2 p-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2 rounded-lg text-2sm text-gray-700 font-semibold bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-8 py-2 rounded-lg text-2sm text-white 
                 bg-blue-500
                `}
              >
                Save
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export { ModalEditTeam };
