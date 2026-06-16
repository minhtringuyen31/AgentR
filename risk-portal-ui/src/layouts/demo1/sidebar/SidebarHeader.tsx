import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { SidebarToggle } from './';

const SidebarHeader = forwardRef<HTMLDivElement>(() => {
  const { layout } = useDemo1Layout();

  const collapsed = layout.options.sidebar.collapse as boolean;

  const logoContent = () => (
    <Link to="/" className="flex items-center gap-2.5">
      {collapsed ? (
        <img src="/media/logo/rshield-logo-prod.png" className="h-7 w-auto" alt="RShield" />
      ) : (
        <>
          <img src="/media/logo/rshield-logo-prod.png" className="h-10 w-auto" alt="RShield" />
          <span className="text-lg font-black tracking-wide text-gray-900 dark:text-white whitespace-nowrap">
            RISK PORTAL
          </span>
        </>
      )}
    </Link>
  );

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-6 shrink-0">
      {logoContent()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
