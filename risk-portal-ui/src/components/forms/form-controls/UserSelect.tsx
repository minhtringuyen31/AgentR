import { getNameFirstLetters } from '@/utils/helpers';
import { SelectProps } from 'antd';
import React from 'react';
import { Select } from './Select';

type LabelRender = SelectProps['labelRender'];
interface OptionData {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const UserSelect: React.FC<UserSelectProps & SelectProps> = ({
  options = [],
  value: selectedValue,
  onChange,
  ...props
}) => {
  const labelRender: LabelRender = (props) => {
    if (!selectedValue) return '';
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

  const renderOption = (option: OptionData) => (
    <div className="flex flex-row justify-start items-center gap-2" key={option.value}>
      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-500 text-white text-2sm">
        {getNameFirstLetters(option.label)}
      </div>

      <div className="flex flex-col justify-center items-start">
        <p className="text-2sm text-gray-800 ">{option.label}</p>
        <p className="text-3sm  text-gray-400">{option.description}</p>
      </div>
    </div>
  );

  return (
    <Select
      size="large"
      value={selectedValue}
      options={options}
      labelRender={labelRender}
      onChange={onChange}
      optionRender={(option) => renderOption(option as OptionData)}
      className="w-full"
      {...props}
    />
  );
};

export { UserSelect };
