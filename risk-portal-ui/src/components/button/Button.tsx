import clsx from 'clsx';
import { FC, HTMLProps } from 'react';

type ButtonProps = HTMLProps<HTMLButtonElement> & {
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  type?: 'submit' | 'reset' | 'button';
};

const Button: FC<ButtonProps> = (props) => {
  return (
    <button
      {...props}
      className={clsx(
        `text-sm rounded-lg p-2 ${props.color ? `btn-${props.color}` : 'btn-primary'}`,
        props.disabled && 'opacity-50 ',
        props.className
      )}
    >
      {props.children}
    </button>
  );
};

export { Button };
