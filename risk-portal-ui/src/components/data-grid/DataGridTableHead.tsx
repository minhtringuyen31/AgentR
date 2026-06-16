import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { useDataGrid } from '@/components/data-grid';
import { DataGridTableHeadRowsSelect } from './DataGridTableHeadRowsSelect';

export interface TDataGridTableHeadProps {
  className?: string;
  children: ReactNode;
}

const DataGridTableHead = ({ children, className }: TDataGridTableHeadProps) => {
  const { props } = useDataGrid();

  return (
    <thead className={clsx(className && className)}>
      <tr key={0}>
        {props.rowSelect && <DataGridTableHeadRowsSelect />}
        {children}
      </tr>
    </thead>
  );
};

export { DataGridTableHead };
