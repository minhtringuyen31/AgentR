import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import { useAuthContext } from '../../useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { RegistrationData } from '@/types/RegistrationData';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const sizeCompany = [
  { name: '1-19', value: '1-19' },
  { name: '20-50', value: '20-50' },
  { name: '51-100', value: '51-100' },
  { name: '>100', value: '>100' }
];

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
  email: '',
  gender: '',
  dateOfBirth: '',
  countryCode: '+65',
  phoneNumber: '',
  companyName: '',
  website: '',
  size: '',
  industry: '',
  acceptTerms: false
};

const signupSchema = Yup.object().shape({
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
  email: Yup.string()
    .email('Wrong email format')
    .max(100, 'Email must be a maximum of 100 characters.')
    .required('Email is required'),
  phoneNumber: Yup.string().matches(/^\d+$/, 'Phone number must be numeric.').nullable(),
  companyName: Yup.string().required('Company name is required.'),
  size: Yup.string().required('Size is required.'),
  industry: Yup.string().required('Industry is required.'),
  // acceptTerms: Yup.bool().required('You must accept the terms and conditions')
  acceptTerms: Yup.bool()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('Terms acceptance is required')
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/auth/check-email';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>({
    code: '+65',
    label: 'Singapore',
    flag: 'singapore.svg'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    formik.setFieldValue('countryCode', country.code);
    setIsDropdownOpen(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error('JWTProvider is required for this form.');
        }
        const registerData: RegistrationData = {
          id: values.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          username: values.username,
          companyName: values.companyName,
          size: values.size,
          industry: values.industry,
          ...(values.gender && { gender: values.gender }),
          ...(values.dateOfBirth && { dateOfBirth: values.dateOfBirth }),
          ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
          ...(values.website && { website: values.website }),
          ...(values.countryCode && { countryCode: values.countryCode })
        };
        await register(registerData);
        navigate(from, { replace: true, state: { registerData } });
      } catch (error) {
        console.error(error);
        setStatus('The sign up details are incorrect');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[600px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign up</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Already have an Account ?</span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
              className="text-2sm link"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
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

          {/* Email  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Email*</label>
            <label className="input">
              <input
                placeholder="email@email.com"
                type="email"
                autoComplete="off"
                {...formik.getFieldProps('email')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.email && formik.errors.email },
                  {
                    'is-valid': formik.touched.email && !formik.errors.email
                  }
                )}
              />
            </label>
            {formik.touched.email && formik.errors.email && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.email}
              </span>
            )}
          </div>

          {/* Gender  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Gender</label>
            <label className="input">
              <select
                {...formik.getFieldProps('gender')}
                className={clsx(
                  'form-control bg-transparent w-full',
                  { 'is-invalid': formik.touched.gender && formik.errors.gender },
                  { 'is-valid': formik.touched.gender && !formik.errors.gender }
                )}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            {formik.touched.gender && formik.errors.gender && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.gender}
              </span>
            )}
          </div>

          {/* Date of birth  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Date of Birth</label>
            <DatePicker
              {...formik.getFieldProps('dateOfBirth')}
              onBlur={formik.handleBlur('dateOfBirth')}
              value={formik.values.dateOfBirth ? dayjs(formik.values.dateOfBirth) : null}
              size="large"
              format={'MMM DD YYYY'}
              onChange={(date) => formik.setFieldValue('dateOfBirth', date.format('YYYY-MM-DD'))}
              className={clsx(
                'bg-transparent',
                { 'is-invalid': formik.touched.dateOfBirth && formik.errors.dateOfBirth },
                { 'is-valid': formik.touched.dateOfBirth && !formik.errors.dateOfBirth }
              )}
            />
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.dateOfBirth}
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

          {/* Company name  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Company Name*</label>
            <label className="input">
              <input
                placeholder="Enter Company Name"
                type="text"
                autoComplete="off"
                {...formik.getFieldProps('companyName')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.companyName && formik.errors.companyName },
                  { 'is-valid': formik.touched.companyName && !formik.errors.companyName }
                )}
              />
            </label>
            {formik.touched.companyName && formik.errors.companyName && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.companyName}
              </span>
            )}
          </div>

          {/* Website  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Website</label>
            <label className="input">
              <input
                placeholder="https://www.example.com"
                type="url"
                autoComplete="off"
                {...formik.getFieldProps('website')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.website && formik.errors.website },
                  { 'is-valid': formik.touched.website && !formik.errors.website }
                )}
              />
            </label>
            {formik.touched.website && formik.errors.website && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.website}
              </span>
            )}
          </div>

          {/* Size  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Size*</label>
            <label className="input">
              <select
                {...formik.getFieldProps('size')}
                className={clsx(
                  'form-control bg-transparent w-full',
                  { 'is-invalid': formik.touched.size && formik.errors.size },
                  { 'is-valid': formik.touched.size && !formik.errors.size }
                )}
              >
                <option value="">Select Size</option>
                {sizeCompany.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            {formik.touched.size && formik.errors.size && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.size}
              </span>
            )}
          </div>

          {/* Industry  */}
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Industry*</label>
            <label className="input">
              <input
                placeholder="Enter Industry"
                type="text"
                autoComplete="off"
                {...formik.getFieldProps('industry')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.industry && formik.errors.industry },
                  { 'is-valid': formik.touched.industry && !formik.errors.industry }
                )}
              />
            </label>
            {formik.touched.industry && formik.errors.industry && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.industry}
              </span>
            )}
          </div>
        </div>

        {/* Policy */}
        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('acceptTerms')}
          />
          <span className="checkbox-label">
            I accept{' '}
            <Link to="#" className="text-2sm link">
              Terms & Conditions
            </Link>
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <span role="alert" className="text-danger text-xs mt-1">
            {formik.errors.acceptTerms}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Sign Up'}
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

export { Signup };
