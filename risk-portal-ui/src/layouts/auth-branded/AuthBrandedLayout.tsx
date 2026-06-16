import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';
import { KeenIcon } from '@/components';

const langs = [
  { key: 'english', label: 'English' },
  { key: 'chineses', label: '中文' }
];

const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <div className="flex flex-col h-screen w-screen p-4">
        <div className="flex justify-between items-center w-full h-16">
          <img src={'/media/logo/logo.svg'} className="h-10" />

          <div className="relative w-31">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <KeenIcon icon="icon" />
            </div>

            <select className="block w-full pl-10 pr-4 py-2 text-sm rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
              {langs.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 grow">
          <div className="hidden lg:flex w-full flex-col justify-center items-center gap-5">
            <img src={'/media/logo/bg.svg'} />
            <h3 className="text-2xl font-semibold text-gray-900">
              Collaborate on key conversations
            </h3>
            <div className="w-2/3 text-md  text-gray-600 text-center">
              Combine all your messaging channels into one and work together efficiently across
              teams through automatic chat assignment and internal notes
            </div>
          </div>

          <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-2">
            <Outlet />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
