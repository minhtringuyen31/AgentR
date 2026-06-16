import { Drawer } from '@/components';
import { useResponsive } from '@/hooks';
import { MENU_MEGA } from '@/config/menu.config';
import { MegaMenuContent } from '@/partials/menu/mega-menu';
import { Menu } from '@/components/menu';
import { useEffect, useState } from 'react';
import { usePathname } from '@/providers';
import { useDemo1Layout } from '@/layouts/demo1';

const MegaMenu = () => {
  const desktopMode = useResponsive('up', 'lg');
  const { pathname, prevPathname } = usePathname();
  const [disabled, setDisabled] = useState(true); // Initially set disabled to true
  const {
    layout,
    sidebarMouseLeave,
    mobileMegaMenuOpen,
    setMobileMegaMenuOpen,
    setMegaMenuEnabled
  } = useDemo1Layout();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDrawerClose = () => {
    setMobileMegaMenuOpen(false);
  };

  // Change disabled state to false after a certain time (e.g., 5 seconds)
  useEffect(() => {
    setDisabled(true);

    const timer = setTimeout(() => {
      setDisabled(false);
    }, 1000); // 1000 milliseconds

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [layout.options.sidebar.collapse, sidebarMouseLeave]);

  useEffect(() => {
    setMegaMenuEnabled(true);
  });

  useEffect(() => {
    if (desktopMode === false && prevPathname !== pathname) {
      handleDrawerClose();
    }
  }, [desktopMode, handleDrawerClose, pathname, prevPathname]);

  const renderContent = () => {
    return (
      <Menu
        multipleExpand={true}
        disabled={disabled}
        highlight={true}
        className="flex-col lg:flex-row gap-5 lg:gap-7.5 p-4 lg:p-0"
      >
        {MegaMenuContent(MENU_MEGA)}
      </Menu>
    );
  };

  if (desktopMode) {
    return renderContent();
  } else {
    return (
      <Drawer
        open={mobileMegaMenuOpen}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true
        }}
        PaperProps={{
          sx: {
            width: '250px',
            maxWidth: '90%' // Set the maximum width to 90%
          }
        }}
      >
        {renderContent()}
      </Drawer>
    );
  }
};

export { MegaMenu };
