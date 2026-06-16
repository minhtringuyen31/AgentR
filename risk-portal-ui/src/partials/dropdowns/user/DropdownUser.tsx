import { KeenIcon } from '@/components';
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuArrow,
  MenuIcon
} from '@/components/menu';
import { ChangeEvent, Fragment, useState } from 'react';
import { toAbsoluteUrl } from '@/utils';
import { DropdownUserLanguages } from './DropdownUserLanguages';
import { Link } from 'react-router-dom';
import { useSettings } from '@/providers/SettingsProvider';
import { useAuthContext } from '@/auth';

const DropdownUser = () => {
  const { settings, storeSettings } = useSettings();
  const { logout } = useAuthContext();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { currentUser } = useAuthContext();

  const toggleStatus = () => {
    setIsOnline((prev) => !prev);
  };

  const handleThemeMode = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('checked:' + event.target.checked);
    const newMode = event.target.checked ? 'dark' : 'light';

    storeSettings({
      mode: newMode
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const buildHeader = () => {
    return (
      <div className="flex flex-row items-center justify-between px-5 py-1.5 gap-5">
        <div className="flex items-center gap-2">
          <img
            className="size-9 rounded-full border-2 border-success"
            src={currentUser?.avatar ? currentUser.avatar : '/media/avatars/default-avatar.jpg'}
            alt=""
          />
          <div className="flex flex-col gap-1.5 max-w-[100px]">
            <div className="text-sm text-gray-800 hover:text-primary font-semibold leading-none truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <div className="text-xs text-gray-600 hover:text-primary font-medium leading-none truncate">
              {currentUser?.email}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-1 cursor-pointer" onClick={toggleStatus}>
          <p className={`text-2sm font-medium ${isOnline ? 'text-[#FABB08]' : 'text-blue-500'}`}>
            {isOnline ? 'Online' : 'Away'}
          </p>
          <KeenIcon icon="arrows-loop" style="outline" className="text-gray-500 text-xs" />
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          <MenuItem>
            <MenuLink path="/">
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>Manage Profile</MenuTitle>
            </MenuLink>
          </MenuItem>

          <div className="menu-item mb-0.5">
            <div className="menu-link">
              <span className="menu-icon">
                <KeenIcon icon="moon" />
              </span>
              <span className="menu-title">Display sende's name</span>
              <label className="switch switch-sm">
                <input
                  name="theme"
                  type="checkbox"
                  checked={settings.mode === 'dark'}
                  onChange={handleThemeMode}
                  value="1"
                />
              </label>
            </div>
          </div>

          <DropdownUserLanguages />

          <MenuItem>
            <MenuLink path="/">
              <MenuIcon className="menu-icon">
                <KeenIcon icon="underlining" />
              </MenuIcon>
              <MenuTitle>Term of use</MenuTitle>
            </MenuLink>
          </MenuItem>

          <MenuItem>
            <MenuLink path="/">
              <MenuIcon className="menu-icon">
                <KeenIcon icon="shield-tick" />
              </MenuIcon>
              <MenuTitle>Privacy policy</MenuTitle>
            </MenuLink>
          </MenuItem>

          <MenuItem>
            <MenuLink path="/">
              <MenuIcon className="menu-icon">
                <KeenIcon icon="arrow-circle-right" />
              </MenuIcon>
              <MenuTitle>Change password</MenuTitle>
            </MenuLink>
          </MenuItem>

          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item px-4 py-1.5">
          <a onClick={handleLogout} className="btn btn-sm btn-light justify-center">
            Logout
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
