import { Column, Table } from '@tanstack/react-table';
import React from 'react';

const DataGridColumnFilter = ({
  column,
  table
}: {
  column: Column<any, any>;
  table: Table<any>;
}) => {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
      <input
        className="input"
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [e.target.value, old?.[1]])
        }
        placeholder={`Min`}
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [old?.[0], e.target.value])
        }
        placeholder={`Max`}
        className="input"
      />
    </div>
  ) : (
    <input
      className="input"
      onChange={(e) => column.setFilterValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  );
};

export { DataGridColumnFilter };
