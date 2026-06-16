import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const CheckEmail = () => {
  const [loading, setLoading] = useState(false);
  const { verifyEmailForRegister } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';
  const registerData = location.state?.registerData;
  const { currentLayout } = useLayout();
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = {
    confirmationCode: ''
  };

  const verifyEmailSchema = Yup.object().shape({
    confirmationCode: Yup.string()
      .required('Please enter OTP')
      .matches(/^\d{6}$/, 'OTP must be a 6-digit number')
  });

  const formik = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        console.log('Values: ', values, registerData);
        await verifyEmailForRegister(values.confirmationCode, registerData);
        enqueueSnackbar('Sign up succesfully', {
          variant: 'solid',
          state: 'success'
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } catch (error) {
        console.error(error);
        setStatus('The sign up details are incorrect');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });
  return (
    <div className="card max-w-[485px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-5">
            {' '}
            Verify your email to continues
          </h3>{' '}
          <div className="text-2sm text-center text-gray-700">
            Enter OTP sent to &nbsp;
            <p className="text-2sm text-gray-900 font-medium hover:text-primary-active">
              {registerData.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          <input {...formik.getFieldProps('confirmationCode')} className="input" type="text" />
          {formik.touched.confirmationCode && formik.errors.confirmationCode && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmationCode}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-700 me-1.5">Didn’t receive a code?</span>
          <Link to="/auth/login" className="text-xs link">
            Resend
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Verify'}
        </button>
        <Link
          to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
          className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
        >
          <KeenIcon icon="black-left" />
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export { CheckEmail };
