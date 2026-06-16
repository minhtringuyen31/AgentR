import clsx from 'clsx';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import { useAuthContext } from '../../useAuthContext';
import { KeenIcon } from '@/components';
import { RegistrationData } from '@/types/RegistrationData';
import { useSnackbar } from 'notistack';

interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

const countries = [
  {
    code: '+65',
    label: 'Singapore',
    flag: 'singapore.svg'
  },
  {
    code: '+84',
    label: 'Vietnam',
    flag: 'vietnam.svg'
  },
  {
    code: '+86',
    label: 'China',
    flag: 'china.svg'
  }
];

const initialValues = {
  id: uuidv4(),
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  position: '',
  countryCode: '+65',
  phoneNumber: '',
  role: '',
  vendor: '',
  email: ''
};

const createAccountSchema = Yup.object().shape({
  username: Yup.string()
    .required('Please enter User name')
    .max(50, 'Username cannot exceed 50 characters')
    .test('username-check', 'User name already exists', (value) => value !== 'existing_username'),
  password: Yup.string()
    .required('Please enter Password')
    .max(50, 'Password cannot exceed 50 characters')
    .min(8, 'Password must be at least 8 characters')
    .matches(/\S/, 'Password cannot contain spaces')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[\W_]/, 'Password must contain at least one special character'),
  firstName: Yup.string()
    .max(100, 'First name must be a maximum of 100 characters.')
    .required('First name is required.'),
  lastName: Yup.string()
    .max(100, 'Last name must be a maximum of 100 characters.')
    .required('Last name is required.'),
  phoneNumber: Yup.string().matches(/^\d+$/, 'Phone number must be numeric.').nullable()
});

const CreateAccount = () => {
  const [loading, setLoading] = useState(false);
  const { createUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>({
    code: '+65',
    label: 'Singapore',
    flag: 'singapore.svg'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: createAccountSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!createUser) {
          throw new Error('JWTProvider is required for this form.');
        }
        const registerData: RegistrationData = {
          id: values.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          username: values.username,
          ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
          ...(values.countryCode && { countryCode: values.countryCode })
        };
        await createUser(registerData);
        enqueueSnackbar('Create account succesfully', {
          variant: 'solid',
          state: 'success'
        });
        navigate(from, { replace: true });
      } catch (error) {
        console.error(error);
        setStatus('The sign up details are incorrect');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || '';
    const vendor = urlParams.get('vendor') || '';
    const email = urlParams.get('email') || '';

    formik.setValues({
      ...formik.values,
      role,
      vendor,
      email
    });
  }, []);

  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    formik.setFieldValue('countryCode', country.code);
    setIsDropdownOpen(false);
  };

  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[485px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Create Your Account
          </h3>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Username*</label>
          <label className="input">
            <input
              placeholder="Enter Username"
              type="text"
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

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Password*</label>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password
                }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        {/* Firstname */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">First Name*</label>
          <label className="input">
            <input
              placeholder="Enter First Name"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('firstName')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.firstName && formik.errors.firstName },
                { 'is-valid': formik.touched.firstName && !formik.errors.firstName }
              )}
            />
          </label>
          {formik.touched.firstName && formik.errors.firstName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.firstName}
            </span>
          )}
        </div>

        {/* Lastname  */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Last Name*</label>
          <label className="input">
            <input
              placeholder="Enter Last Name"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('lastName')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.lastName && formik.errors.lastName },
                { 'is-valid': formik.touched.lastName && !formik.errors.lastName }
              )}
            />
          </label>
          {formik.touched.lastName && formik.errors.lastName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.lastName}
            </span>
          )}
        </div>

        {/* Position  */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Position</label>
          <label className="input">
            <input
              placeholder="Enter Position"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('position')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.position && formik.errors.position },
                { 'is-valid': formik.touched.position && !formik.errors.position }
              )}
            />
          </label>
          {formik.touched.position && formik.errors.position && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.position}
            </span>
          )}
        </div>

        {/* Phone number */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Phone Number</label>
          <div className="flex items-center gap-2">
            <label className="input w-1/3">
              <div className="relative w-auto">
                <button
                  type="button"
                  className=" w-full"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`/media/flags/${selectedCountry.flag}`}
                      className="inline-block size-3.5 rounded-full"
                      alt={selectedCountry.label}
                    />
                    <span>{selectedCountry.code}</span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute w-[80px] z-10 bg-white border mt-2  rounded shadow-lg max-h-60 overflow-y-auto">
                    <ul className="w-auto">
                      {countries.map((country) => (
                        <li
                          key={country.code}
                          className="p-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleSelectCountry(country)}
                        >
                          <img
                            src={`/media/flags/${country.flag}`}
                            className="inline-block size-3.5 rounded-full"
                            alt={country.label}
                          />
                          <span>{country.code}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </label>
            <label className="input w-2/3">
              <input
                placeholder="Enter Phone Number"
                type="text"
                autoComplete="off"
                {...formik.getFieldProps('phoneNumber')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.phoneNumber && formik.errors.phoneNumber },
                  { 'is-valid': formik.touched.phoneNumber && !formik.errors.phoneNumber }
                )}
              />
            </label>
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.phoneNumber}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Create'}
        </button>

        {formik.status && (
          <div className="text-danger text-xs mt-1" role="alert">
            {formik.status}
          </div>
        )}
      </form>
    </div>
  );
};

export { CreateAccount };
