import React from 'react';
import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';

type DrawerProps = MuiDrawerProps & {
  // Add any additional props if needed
};

const StyledDrawer = styled(MuiDrawer)(() => ({
  '& .MuiDrawer-paper': {
    backgroundColor: 'var(--tw-drawer-background-color)',
    boxShadow: 'var(--tw-drawer-box-shadow)'
  },
  '& .MuiModal-backdrop': {
    backgroundColor: 'var(--tw-backdrop-background-color)'
  }
}));

const Drawer = (props: DrawerProps) => {
  return <StyledDrawer {...props}>{props.children}</StyledDrawer>;
};

export { Drawer };
