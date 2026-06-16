import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';

const initialValues = {
  username: ''
};

const forgotPasswordSchema = Yup.object().shape({
  username: Yup.string()
    .required('Please enter User name')
    .max(50, 'Username cannot exceed 50 characters')
    .test('username-check', 'User name already exists', (value) => value !== 'existing_username')
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthContext();
  const { currentLayout } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/auth/reset-password/verify-email';

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!forgotPassword) {
          throw new Error('JWTProvider is required for this form.');
        }
        console.log('dd');
        await forgotPassword(values.username);

        navigate(from, { replace: true, state: { username: values.username } });
      } catch {
        setSubmitting(false);
        setStatus('The login detail is incorrect');
      }
      setLoading(false);
    }
  });
  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Your Username</h3>
          <span className="text-2sm text-gray-600 font-medium">
            Enter your username to reset password
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Username</label>
          <label className="input">
            <input
              type="text"
              placeholder="Enter Your Username"
              autoComplete="off"
              {...formik.getFieldProps('username')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.username && formik.errors.username },
                {
                  'is-valid': formik.touched.username && !formik.errors.username
                }
              )}
            />
          </label>
          {formik.touched.username && formik.errors.username && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.username}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 items-stretch">
          <button
            type="submit"
            className="btn btn-primary flex justify-center grow"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? 'Please wait...' : 'Continue'}
          </button>
          <Link
            to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
            className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
          >
            <KeenIcon icon="black-left" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export { ResetPassword };
