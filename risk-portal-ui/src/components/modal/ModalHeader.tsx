import { forwardRef, ReactNode } from 'react';

interface ModalHeaderProps {
  title?: string;
  className?: string;
  children?: ReactNode;
}

// Forwarding ref to ensure this component can hold a ref
const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, className, children }, ref) => {
    return (
      <div ref={ref} className={`modal-header ${className}`}>
        {title && <h2 className="text-xl font-semibold text-start text-gray-900">{title}</h2>}

        <div className="flex flex-grow justify-end">{children}</div>
      </div>
    );
  }
);

export { ModalHeader };
