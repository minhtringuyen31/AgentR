import { KeenIcon } from '@/components/keenicons';
import clsx from 'clsx';
import { FC, InputHTMLAttributes } from 'react';
import { Input } from './Input';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

const SearchInput: FC<SearchInputProps> = (props) => (
  <div className="relative">
    <KeenIcon
      icon="magnifier"
      className="leading-none text-md text-gray-500 absolute top-1/2 left-0 -translate-y-1/2 ml-3"
    />
    <Input {...props} type="text" className={clsx('input input-md pl-8', props.className)} />
  </div>
);

export { SearchInput };
