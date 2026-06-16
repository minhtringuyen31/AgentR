import clsx from 'clsx';
import { FC, HTMLProps } from 'react';

const Chip: FC<HTMLProps<HTMLDivElement>> = (props) => (
  <div className={clsx('inline border bg-gray-200 px-3 py-1 rounded-md w-fit', props.className)}>
    {props.children}
  </div>
);

export { Chip };
