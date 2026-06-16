import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Table,
  useReactTable
} from '@tanstack/react-table';
import { DataGridInner, DataGridProvider } from './';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';

export type TDataGridTableSpacingType = 'xs' | 'sm' | 'lg';

export type TDataGridSelectedRowIds = Set<string>;

export interface TDataGridProps<TData extends object> {
  columns: any[]; // Define columns and data props
  data: TData[];
  loadingText?: string;
  saveState?: boolean;
  saveStateId?: string;
  rowSelect?: boolean;
  onRowsSelectChange?: (prselectedRowIds: TDataGridSelectedRowIds) => void;
  emptyState?: ReactNode;
  cellsBorder?: boolean;
  tableSpacing?: TDataGridTableSpacingType;
  paginationInfo?: string;
  paginationIndex?: number;
  paginationSizes?: number[];
  paginationSizesLabel?: string;
  paginationSizesDesc?: string;
  paginationSize?: number;
  paginationMore?: boolean;
  paginationMoreLimit?: number;
  onPaginationChange?: Dispatch<SetStateAction<PaginationState>>;
  initialSorting?: { id: string; desc?: boolean }[]; // New prop to set initial sorting
  onSortingChange?: Dispatch<SetStateAction<any[]>>;
  getRowId: (row: TData) => string;
}

const DataGrid = <TData extends object>({
  paginationIndex = 0,
  paginationSize = 10,
  onPaginationChange = () => {},
  ...props
}: TDataGridProps<TData>) => {
  // Set default values for the required props
  const defaultValues: Partial<TDataGridProps<TData>> = {
    saveState: false,
    saveStateId: '',
    cellsBorder: true,
    loadingText: 'Loading...', // Default value for loadingText
    rowSelect: false, // Default value for rowSelect
    emptyState: 'No data available', // Default value for emptyInfo
    paginationInfo: '{from} - {to} of {count}', // Default value for paginationInfo
    paginationSizes: [5, 10, 25, 50, 100], // Default pagination sizes
    paginationSizesLabel: 'Show',
    paginationSizesDesc: 'per page',
    paginationSize: 5, // Default pagination size
    paginationMoreLimit: 5, // Default limit for "load more"
    paginationMore: false, // Default for paginationMore
    initialSorting: props.initialSorting || [] // Default for initial sorting
  };

  // Merge default values with props
  const mergedProps = { ...defaultValues, ...props };

  /// Load saved pagination, sorting state from localStorage
  const loadSavedState = (): { pagination: PaginationState; sorting: any[] } => {
    if (props.saveState && props.saveStateId) {
      const savedState = localStorage.getItem(props.saveStateId);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          pagination: {
            pageIndex: parsedState.pageIndex || 0,
            pageSize: parsedState.pageSize || mergedProps.paginationSize || 5
          },
          sorting: parsedState.sorting || mergedProps.initialSorting || []
        };
      }
    }
    return {
      pagination: {
        pageIndex: 0,
        pageSize: mergedProps.paginationSize || 5
      },
      sorting: mergedProps.initialSorting || []
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveState = (newState: any) => {
    if (props.saveState && props.saveStateId) {
      const existingState = localStorage.getItem(props.saveStateId);
      let mergedState = newState;

      if (existingState) {
        const parsedState = JSON.parse(existingState);
        mergedState = { ...parsedState, ...newState };
      }

      localStorage.setItem(props.saveStateId, JSON.stringify(mergedState));
    }
  };

  // Load initial saved state (pagination, sorting)
  const { pagination: initialPagination, sorting: initialSorting } = loadSavedState();

  // Initialize pagination and sorting states
  const [sorting, setSorting] = useState<any[]>(initialSorting);

  const handlePaginationChange: OnChangeFn<PaginationState> = (newPagination) => {
    onPaginationChange(newPagination);
  };

  const handleSortingChange: OnChangeFn<any[]> = (newSorting) => {
    setSorting(newSorting);
    if (mergedProps.onSortingChange) {
      mergedProps.onSortingChange(newSorting);
    }
  };

  // Initialize the table using useReactTable and pass props.columns and props.data
  const table = useReactTable({
    columns: mergedProps.columns, // Access columns from mergedProps
    data: mergedProps.data, // Access data from mergedProps
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: handlePaginationChange,
    autoResetPageIndex: false,
    onSortingChange: handleSortingChange,
    getRowId: mergedProps.getRowId,
    state: {
      pagination: {
        pageIndex: paginationIndex,
        pageSize: paginationSize
      },
      sorting
    }
  });

  // Save pagination, sorting state when they change
  useEffect(() => {
    saveState({
      pageIndex: table.getState().pagination.pageIndex,
      pageSize: table.getState().pagination.pageSize,
      sorting: table.getState().sorting
    });
  }, [saveState, table]);

  return (
    <DataGridProvider table={table} props={mergedProps}>
      <DataGridInner />
    </DataGridProvider>
  );
};

export { DataGrid };
