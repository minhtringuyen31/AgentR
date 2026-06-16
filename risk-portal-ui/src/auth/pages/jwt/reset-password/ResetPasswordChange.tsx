import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components';
import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import * as Yup from 'yup';

const initialValues = {
  newPassword: '',
  confirmPassword: ''
};

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('Please enter Password')
    .max(50, 'Password cannot exceed 50 characters')
    .min(8, 'Password must be at least 8 characters')
    .matches(/\S/, 'Password cannot contain spaces')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[\W_]/, 'Password must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
});

const ResetPasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const { callResetPassword } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/auth/reset-password/changed';
  const { confirmationCode, username } = location.state;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        if (!callResetPassword) {
          throw new Error('JWTProvider is required for this form.');
        }
        await callResetPassword(username, confirmationCode, values.newPassword);
        navigate(from, { replace: true });
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const toggleNewPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
          <span className="text-2sm text-gray-700">Enter your new password</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">New Password</label>
          <label className="input">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              autoComplete="off"
              {...formik.getFieldProps('newPassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.newPassword && formik.errors.newPassword
                },
                {
                  'is-valid': formik.touched.newPassword && !formik.errors.newPassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleNewPassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showNewPassword })}
              />
            </button>
          </label>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.newPassword}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Confirm New Password</label>
          <label className="input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter a new password"
              autoComplete="off"
              {...formik.getFieldProps('confirmPassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword
                },
                {
                  'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showConfirmPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
              />
            </button>
          </label>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordChange };
