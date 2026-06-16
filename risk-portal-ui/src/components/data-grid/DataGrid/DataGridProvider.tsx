/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TDataGridProps, TDataGridSelectedRowIds } from './DataGrid';
import { Table } from '@tanstack/react-table';

export interface IDataGridContextProps<TData extends object> {
  props: TDataGridProps<TData>;
  table: Table<TData>;
  loading: boolean;
  setLoading: (state: boolean) => void;
  selectedRowIds: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleAllRowsSelection: (checked: boolean) => void;
  getSelectedRowIds: () => string[];
  isSelectAllChecked: boolean;
  isSelectAllIndeterminate: boolean;
}

// Create the context
const DataGridContext = createContext<IDataGridContextProps<any> | undefined>(undefined);

// Custom hook to use the DataGrid context
const useDataGrid = () => {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context;
};

const DataGridProvider = <TData extends object>({
  table,
  props,
  children
}: {
  table: Table<TData>;
  props: TDataGridProps<TData>;
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
  const [isSelectAllIndeterminate, setIsSelectAllIndeterminate] = useState<boolean>(false);

  // Get the IDs of the current rows being displayed
  const currentRows = table.getRowModel().rows.map((row) => row.id);

  // Handle sorting, pagination, and search loading
  const handleStateChange = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false); // Stop loading after action completes
    }, 300); // Delay for smooth experience
    return () => clearTimeout(timer);
  };

  // Listen for sorting changes
  useEffect(() => {
    if (table.getState().sorting.length > 0) {
      handleStateChange();
    }
  }, [table.getState().sorting]);

  // Listen for pagination changes
  useEffect(() => {
    handleStateChange();
  }, [table.getState().pagination]);

  // Handle data loading (trigger loading when data is being fetched)
  useEffect(() => {
    if (props.data.length === 0) {
      setLoading(true);
    } else {
      setLoading(false); // Data loaded
    }
  }, [props.data]);

  // Toggle individual row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRowIds((prevSelected) => {
      const newSelected: TDataGridSelectedRowIds = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id); // Uncheck the row if already selected
      } else {
        newSelected.add(id); // Select the row if not selected
      }

      if (props.onRowsSelectChange) {
        props.onRowsSelectChange(newSelected);
      }

      return newSelected;
    });
  };

  // Toggle all rows selection
  const toggleAllRowsSelection = (checked: boolean) => {
    const newSelectedRowIds: TDataGridSelectedRowIds = checked ? new Set(currentRows) : new Set();

    setSelectedRowIds(newSelectedRowIds); // Deselect all rows

    if (props.onRowsSelectChange) {
      props.onRowsSelectChange(newSelectedRowIds);
    }
  };

  // Update the "Select All" and indeterminate states
  useEffect(() => {
    if (currentRows.length === 0) {
      setIsSelectAllChecked(false);
      setIsSelectAllIndeterminate(false);
      return;
    }

    const isAllSelected = currentRows.every((id) => selectedRowIds.has(id));
    const isSomeSelected = currentRows.some((id) => selectedRowIds.has(id));

    setIsSelectAllChecked(isAllSelected);
    setIsSelectAllIndeterminate(!isAllSelected && isSomeSelected);
  }, [selectedRowIds, currentRows]);

  // Get all selected row IDs
  const getSelectedRowIds = () => {
    return Array.from(selectedRowIds);
  };

  return (
    <DataGridContext.Provider
      value={{
        props,
        table,
        loading,
        setLoading,
        selectedRowIds,
        toggleRowSelection,
        toggleAllRowsSelection,
        getSelectedRowIds,
        isSelectAllChecked,
        isSelectAllIndeterminate
      }}
    >
      {children}
    </DataGridContext.Provider>
  );
};

export { DataGridProvider, useDataGrid };
