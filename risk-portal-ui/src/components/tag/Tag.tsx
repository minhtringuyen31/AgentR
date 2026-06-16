import clsx from 'clsx';
import { FC, HTMLProps } from 'react';

type TagProps = {
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  dotClassName?: string;
} & HTMLProps<HTMLSpanElement>;

const Tag: FC<TagProps> = (props) => {
  return (
    <span
      className={clsx(
        `badge badge-pill badge-outline badge-${props.color} gap-1 items-center`,
        props.className
      )}
    >
      <span className={clsx(`badge badge-dot size-1.5 badge-${props.color}`, props.dotClassName)} />
      {props.children}
    </span>
  );
};

export { Tag };
