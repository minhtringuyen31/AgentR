import { DatePicker, Select, SelectProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Input, UserSelect } from './form-controls';
import { LabelInValueType } from 'rc-select/lib/Select';

interface OptionData {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

interface Property {
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'user';
  options?: OptionData[];
  renderOption?: (option: OptionData) => React.ReactNode;
}

interface BulkEditFormProps {
  properties: Property[];
  onSave: (objtects: string[], selectedProperty: string, inputValue: string) => void;
  onClose: () => void;
  objects: string[];
}

const BaseBulkEditForm: React.FC<BulkEditFormProps> = ({
  properties,
  onSave,
  onClose,
  objects
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    setInputValue('');
  }, [selectedProperty]);

  const handleChangeProperty = (e: string) => {
    setSelectedProperty(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectChange = (value: string) => {
    setInputValue(value);
  };

  const labelRender = (props: LabelInValueType, options: OptionData[] = []) => {
    const { value } = props;

    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? (
      <div className="flex flex-row justify-start items-center gap-2">
        <div className="flex justify-center items-center h-full aspect-square rounded-full bg-blue-500 text-white text-4sx p-0.5">
          NQ
        </div>

        <div className="flex flex-col justify-center items-start">
          <p className="text-2sm text-gray-800 ">{selectedOption.label}</p>
        </div>
      </div>
    ) : (
      <span>No option match</span>
    );
  };

  const renderInputField = () => {
    const selected = properties.find((property) => property.value === selectedProperty);

    if (!selected) return <Input type="text" id="value" value="" disabled />;

    switch (selected.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Enter ${selected.label}`}
          />
        );
      case 'date':
        return (
          <DatePicker
            format={'DD MMM YYYY'}
            value={inputValue ? dayjs(inputValue) : null}
            onChange={(date) => setInputValue(date.format('YYYY-MM-DD'))}
          />
        );
      case 'user': {
        const renderOption =
          selected.renderOption || ((option: OptionData) => <div>{option.label}</div>);
        return (
          <UserSelect
            options={selected.options || []}
            value={inputValue}
            onChange={handleSelectChange}
          />
        );
      }
      case 'select':
        return (
          <Select
            size="large"
            className="block"
            options={selected.options || []}
            value={inputValue}
            onChange={handleSelectChange}
          />
        );

      default:
        return <Input type="text" id="value" value="" disabled />;
    }
  };
  const handleSubmit = () => {
    onSave(objects, selectedProperty, inputValue);
    onClose();
  };

  return (
    <div className="p-4">
      {/* Property Dropdown */}
      <label htmlFor="property" className="block mt-2 text-3sm">
        Select Property to Update
      </label>
      <Select
        id="property"
        value={selectedProperty}
        onChange={handleChangeProperty}
        size="large"
        className="block"
      >
        <option value="" disabled className="text-2sm">
          Please select a property
        </option>
        {properties.map((property) => (
          <option key={property.value} value={property.value}>
            {property.label}
          </option>
        ))}
      </Select>

      {/* Dynamic Input Field */}
      <label htmlFor="value" className="block mt-2 text-3sm">
        Value
      </label>
      {renderInputField()}

      {/* Divider */}
      <div className="border-t border-gray-300 my-6" />

      <div className="flex justify-end gap-2 ">
        <button
          onClick={onClose}
          className="px-8 py-2 rounded-lg text-gray-700 font-semibold bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-2 rounded-lg text-white bg-blue-500"
          disabled={!selectedProperty || !inputValue}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export { BaseBulkEditForm };
