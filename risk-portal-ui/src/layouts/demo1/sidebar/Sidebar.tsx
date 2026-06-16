/* eslint-disable react-hooks/exhaustive-deps */
import { Drawer } from '@/components';
import { useEffect, useRef, useState } from 'react';
import { useResponsive, useViewport } from '@/hooks';
import { useDemo1Layout } from '../';
import { SidebarContent, SidebarHeader } from './';
import clsx from 'clsx';
import { getHeight } from '@/utils';
import { usePathname } from '@/providers';

const Sidebar = () => {
  const selfRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const { pathname, prevPathname } = usePathname();

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = getHeight(headerRef.current);
      const availableHeight = viewportHeight - headerHeight;
      setContentHeight(availableHeight);
    } else {
      setContentHeight(viewportHeight);
    }
  }, [viewportHeight]);

  const desktopMode = useResponsive('up', 'lg');
  const { mobileSidebarOpen, setSidebarMouseLeave, setMobileSidebarOpen } = useDemo1Layout();
  const { layout } = useDemo1Layout();
  const themeClass: string =
    layout.options.sidebar.theme === 'dark' || pathname === '/dark-sidebar'
      ? 'dark [&.dark]:bg-coal-600'
      : 'dark:bg-coal-600';

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const handleMouseEnter = () => {
    setSidebarMouseLeave(false);
  };

  const handleMouseLeave = () => {
    setSidebarMouseLeave(true);
  };

  const renderContent = () => {
    return (
      <div
        ref={selfRef}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className={clsx(
          'sidebar lg:fixed lg:z-20 lg:top-0 lg:bottom-0 lg:start-0 lg:translate-x-0 flex flex-col items-stretch shrink-0 bg-light lg:border lg:border-r-gray-200',
          themeClass
        )}
      >
        {desktopMode && <SidebarHeader ref={headerRef} />}
        <SidebarContent {...(desktopMode && { height: contentHeight })} />
      </div>
    );
  };

  useEffect(() => {
    if (!desktopMode && prevPathname !== pathname) {
      handleMobileSidebarClose();
    }
  }, [desktopMode, handleMobileSidebarClose, pathname, prevPathname]);

  if (desktopMode) {
    return renderContent();
  } else {
    return (
      <Drawer
        open={mobileSidebarOpen}
        onClose={handleMobileSidebarClose}
        ModalProps={{
          keepMounted: true
        }}
      >
        {renderContent()}
      </Drawer>
    );
  }
};

export { Sidebar };
