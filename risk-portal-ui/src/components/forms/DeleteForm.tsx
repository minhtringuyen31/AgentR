import React from 'react';
import { Button } from '../button';
import { Divider } from '../divider';

interface DeleteFormProps {
  data?: string | string[];
  description: string;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onClose: () => void;
}

const DeleteForm: React.FC<DeleteFormProps> = ({
  data,
  description,
  onDelete,
  onBulkDelete,
  onClose
}) => {
  const handleDelete = () => {
    if (typeof data === 'string' && onDelete) {
      onDelete(data); // Single delete
      onClose();
    } else if (Array.isArray(data) && onBulkDelete) {
      onBulkDelete(data); // Bulk delete
      onClose();
    } else {
      console.error('Invalid data type or handlers are undefined');
    }
  };

  return (
    <div>
      <div className="p-4">
        <p className="text-gray-500 text-2sm">{description}</p>
      </div>

      <Divider />

      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onClose} color="secondary" className="px-8 border border-gray-300">
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} className="px-8">
          Delete
        </Button>
      </div>
    </div>
  );
};

export { DeleteForm };
