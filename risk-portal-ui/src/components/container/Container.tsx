import clsx from 'clsx';
import { type ReactNode } from 'react';

import { useSettings } from '../../providers/SettingsProvider';
import { SettingsContainerType } from '@/config';

export interface PageContainerProps {
  children?: ReactNode;
  width?: SettingsContainerType;
  className?: string;
}

const Container = ({ children, width, className = '' }: PageContainerProps) => {
  const { settings } = useSettings();
  const { container } = settings;
  const widthMode = width ?? container;

  return (
    <div className={clsx(className, widthMode === 'fixed' ? 'container-fixed' : 'container-fluid')}>
      {children}
    </div>
  );
};

export { Container };
