import clsx from 'clsx';
import { FC, HTMLProps } from 'react';

const Input: FC<HTMLProps<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'text-sm w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-200',
      props.className
    )}
  />
);

export { Input };
