import { TDataGridSelectedRowIds } from '@/components';
import { debounce } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';

const useCrudTable = () => {
  const [selectedRows, setSelectedRows] = useState<TDataGridSelectedRowIds>(new Set());
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [warningModalContent, setWarningModalContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);

  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openBulkEditModal = () => setIsBulkEditModalOpen(true);

  const closeBulkEditModal = () => setIsBulkEditModalOpen(false);

  const openWarningModal = () => {
    if (selectedRows?.size > 0) {
      const content = {
        title: `Delete ${selectedRows?.size} items`,
        description: `Are you sure you want to delete ${selectedRows?.size} items? Progress will not be rolled back once deleted.`
      };
      setWarningModalContent(content);
      setIsWarningModalOpen(true);
    }
  };

  const closeWarningModal = () => {
    setIsWarningModalOpen(false);
    setWarningModalContent(null);
  };

  const handleCheckboxChange = (rowIds: TDataGridSelectedRowIds) => setSelectedRows(rowIds);

  const debounceCallback = useCallback(
    debounce((callback) => callback(), 500),
    []
  );

  // This search is debounced, you only need to implement callback for your use case
  const handleSearch = (
    event: ChangeEvent<HTMLInputElement>,
    callback?: (value: string) => void
  ) => {
    setSearchKeyword(event.target.value);
    if (callback) debounceCallback(() => callback(event.target.value));
  };

  return {
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    isBulkEditModalOpen,
    openBulkEditModal,
    closeBulkEditModal,
    isWarningModalOpen,
    openWarningModal,
    closeWarningModal,
    warningModalContent,
    handleCheckboxChange,
    handleSearch
  };
};

export { useCrudTable };
