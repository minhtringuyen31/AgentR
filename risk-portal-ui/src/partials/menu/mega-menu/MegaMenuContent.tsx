import { KeenIcon } from '@/components';
import {
  MenuConfigType,
  IMenuItemConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuArrow
} from '@/components/menu';
import { MegaMenuSubDefault } from './MegaMenuSubDefault';
import { MegaMenuSubHighlighted } from './MegaMenuSubHighlighted';
import { MegaMenuSubDropdown } from './MegaMenuSubDropdown';
import { Fragment } from 'react';
import { useResponsive } from '@/hooks';

const MegaMenuContent = (items: MenuConfigType) => {
  const desktopMode = useResponsive('up', 'lg');

  const homeItem = items[0];
  const publicProfilesItem = items[1];

  const myAccountItem = items[2];
  const myAccountItemGeneral = myAccountItem.children ? myAccountItem.children[0] : {};
  const myAccountItemOthers = myAccountItem.children ? myAccountItem.children[1] : {};

  const networkItem = items[3];
  const networkItemGeneral = networkItem.children ? networkItem.children[0] : {};
  const networkItemOthers = networkItem.children ? networkItem.children[1] : {};

  const authItem = items[4];
  const authItemGeneral = authItem.children ? authItem.children[0] : {};
  const authItemOthers = authItem.children ? authItem.children[1] : {};

  const helpItem = items[5];

  const linkClass =
    'text-sm text-gray-800 menu-link-hover:text-primary menu-item-active:text-gray-900 menu-item-show:text-primary menu-item-here:text-gray-900 menu-item-active:font-medium menu-item-here:font-medium';

  const build = () => {
    return (
      <Fragment>
        <MenuItem key="home">
          <MenuLink path={homeItem.path} className={linkClass}>
            <MenuTitle className="text-nowrap">{homeItem.title}</MenuTitle>
          </MenuLink>
        </MenuItem>

        <MenuItem
          key="public-profiles"
          toggle={desktopMode ? 'dropdown' : 'accordion'}
          trigger={desktopMode ? 'hover' : 'click'}
          dropdownProps={{
            placement: 'bottom-start'
          }}
        >
          <MenuLink className={linkClass}>
            <MenuTitle className="text-nowrap">{publicProfilesItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="w-full gap-0 lg:max-w-[875px]">
            <div className="pt-4 pb-2 lg:p-7.5">
              <div className="grid lg:grid-cols-2 gap-5 lg:gap-10">
                {publicProfilesItem.children?.map((item: IMenuItemConfig, index) => {
                  return (
                    <div key={`item-${index}`} className="menu menu-default menu-fit flex-col">
                      <h3 className="text-sm text-gray-800 font-semibold leading-none pl-2.5 mb-2 lg:mb-5">
                        {item.title}
                      </h3>
                      <div className="grid lg:grid-cols-2 lg:gap-5">
                        {item.children?.map((item: IMenuItemConfig, index) => {
                          return (
                            <div key={`item-${index}`} className="flex flex-col gap-0.5">
                              {item.children && MegaMenuSubDefault(item.children)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {buildFooter()}
          </MenuSub>
        </MenuItem>

        <MenuItem
          key="my-account"
          toggle={desktopMode ? 'dropdown' : 'accordion'}
          trigger={desktopMode ? 'hover' : 'click'}
          dropdownProps={{
            placement: 'bottom-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-300, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink className={linkClass}>
            <MenuTitle className="text-nowrap">{myAccountItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="flex-col lg:flex-row gap-0 w-full lg:max-w-[1240px]">
            <div className="lg:w-[250px] mt-2 lg:mt-0 lg:border-r lg:border-r-gray-200 rounded-xl lg:rounded-l-xl lg:rounded-r-none shrink-0 px-3 py-4 lg:p-7.5 bg-light-active dark:bg-coal-500 dark:lg:border-r-coal-100">
              <h3 className="text-sm text-gray-800 font-semibold leading-none pl-2.5 mb-2 lg:mb-5">
                {myAccountItemGeneral.title}
              </h3>
              <div className="menu menu-default menu-fit flex-col gap-0.5">
                {myAccountItemGeneral.children &&
                  MegaMenuSubHighlighted(myAccountItemGeneral.children)}
              </div>
            </div>
            <div className="pt-4 pb-2 lg:p-7.5 lg:pb-5 grow">
              <div className="grid lg:grid-cols-5 gap-5">
                {myAccountItemOthers.children?.map((item: IMenuItemConfig, index) => {
                  return (
                    <div key={`item-${index}`} className="flex flex-col">
                      <h3 className="text-sm text-gray-800 font-semibold leading-none pl-2.5 mb-2 lg:mb-5">
                        {item.title}
                      </h3>
                      <div className="menu menu-default menu-fit flex-col gap-0.5">
                        {item.children && MegaMenuSubDefault(item.children)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </MenuSub>
        </MenuItem>

        <MenuItem
          key="network"
          toggle={desktopMode ? 'dropdown' : 'accordion'}
          trigger={desktopMode ? 'hover' : 'click'}
          dropdownProps={{
            placement: 'bottom-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-300, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink className={linkClass}>
            <MenuTitle className="text-nowrap">{networkItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="flex-col gap-0 w-full lg:max-w-[670px]">
            <div className="flex flex-col lg:flex-row">
              <div className="flex flex-col gap-5 lg:w-[250px] mt-2 lg:mt-0 lg:border-r lg:border-r-gray-200 rounded-xl lg:rounded-none lg:rounded-tl-xl shrink-0 px-3 py-4 lg:p-7.5 bg-light-active dark:bg-coal-500 dark:lg:border-r-coal-100">
                <h3 className="text-sm text-gray-800 font-semibold leading-none pl-2.5 h-3.5">
                  {networkItemGeneral.title}
                </h3>
                <div className="menu menu-default menu-fit flex-col gap-0.5">
                  {networkItemGeneral.children &&
                    MegaMenuSubHighlighted(networkItemGeneral.children)}
                </div>
              </div>
              <div className="pt-4 pb-2 lg:p-7.5 lg:pb-5 grow">
                <div className="grid lg:grid-cols-2 gap-5">
                  {networkItemOthers.children?.map((item: IMenuItemConfig, index) => {
                    return (
                      <div key={`item-${index}`} className="flex flex-col gap-5">
                        <h3 className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold leading-none pl-2.5 h-3.5">
                          {item.title}
                          {item.badge && (
                            <span className="left-auto badge badge-xs badge-primary badge-outline">
                              {item.badge}
                            </span>
                          )}
                        </h3>
                        <div className="menu menu-default menu-fit flex-col gap-0.5">
                          {item.children && MegaMenuSubDefault(item.children)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {buildFooter()}
          </MenuSub>
        </MenuItem>

        <MenuItem
          key="auth"
          toggle={desktopMode ? 'dropdown' : 'accordion'}
          trigger={desktopMode ? 'hover' : 'click'}
          dropdownProps={{
            placement: 'bottom-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-300, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink className={linkClass}>
            <MenuTitle className="text-nowrap">{authItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="flex-col gap-0 w-full lg:max-w-[670px]">
            <div className="flex flex-col lg:flex-row">
              <div className="pt-4 pb-2 lg:p-7.5 lg:pb-5 grow">
                <div className="grid lg:grid-cols-2 gap-5">
                  {authItemGeneral.children?.map((item: IMenuItemConfig, index) => {
                    return (
                      <div key={`item-${index}`} className="flex flex-col gap-5">
                        <h3 className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold leading-none pl-2.5 h-3.5">
                          {item.title}
                          {item.badge && (
                            <span className="left-auto badge badge-xs badge-primary badge-outline">
                              {item.badge}
                            </span>
                          )}
                        </h3>
                        <div className="menu menu-default menu-fit flex-col gap-0.5">
                          {item.children && MegaMenuSubDefault(item.children)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="lg:w-[250px] mb-4 lg:mb-0 lg:border-l lg:border-l-gray-200 rounded-xl lg:rounded-r-xl lg:rounded-l-none shrink-0 px-3 py-4 lg:p-7.5 bg-light-active dark:bg-coal-500 dark:lg:border-l-coal-100">
                <h3 className="text-sm text-gray-800 font-semibold leading-none pl-2.5 mb-5">
                  {authItemOthers.title}
                </h3>
                <div className="menu menu-default menu-fit flex-col gap-0.5">
                  {authItemOthers.children && MegaMenuSubHighlighted(authItemOthers.children)}
                </div>
              </div>
            </div>
            {buildFooter()}
          </MenuSub>
        </MenuItem>

        <MenuItem
          key="help"
          toggle={desktopMode ? 'dropdown' : 'accordion'}
          trigger={desktopMode ? 'hover' : 'click'}
          dropdownProps={{
            placement: 'bottom-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-20, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink className="text-sm text-gray-800 menu-link-hover:text-primary menu-item-active:text-gray-900 menu-item-show:text-primary menu-item-here:text-gray-900 menu-item-active:font-medium menu-item-here:font-medium">
            <MenuTitle className="text-nowrap">{helpItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="menu-default lg:py-2.5 lg:w-[220px]">
            {helpItem.children && MegaMenuSubDropdown(helpItem.children)}
          </MenuSub>
        </MenuItem>
      </Fragment>
    );
  };

  const buildArrow = () => {
    return (
      <MenuArrow className="flex lg:hidden text-gray-400">
        <KeenIcon icon="plus" className="text-2xs menu-item-show:hidden" />
        <KeenIcon icon="minus" className="text-2xs hidden menu-item-show:inline-flex" />
      </MenuArrow>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-wrap items-center lg:justify-between rounded-xl lg:rounded-t-none bg-light-active dark:bg-coal-500 border border-gray-300 lg:border-0 lg:border-t lg:border-t-gray-300 dark:lg:border-t-gray-100 px-4 py-4 lg:px-7.5 lg:py-5 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <div className="text-md font-semibold text-gray-900 leading-none">
            Read to Get Started ?
          </div>
          <div className="text-2sm fomt-medium text-gray-600">
            Take your docs to the next level of Metronic
          </div>
        </div>
        <a href="#" className="btn btn-sm btn-dark">
          Read Documentation
        </a>
      </div>
    );
  };

  return <div className="menu flex-col lg:flex-row gap-5 lg:gap-7.5">{build()}</div>;
};

export { MegaMenuContent };
