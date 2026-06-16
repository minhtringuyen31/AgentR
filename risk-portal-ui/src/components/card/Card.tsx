import clsx from 'clsx';
import { FC, HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card: FC<CardProps> & { Header: typeof CardHeader; Body: typeof CardBody } = (props) => (
  <div {...props} className={clsx('card card-grid', props.className)} />
);

type CardHeaderProps = {
  title?: string | ReactNode;
} & HTMLAttributes<HTMLDivElement>;
const CardHeader: FC<CardHeaderProps> = ({ title, children, ...props }) => (
  <div {...props} className={clsx('card-header', props.className)}>
    {title && <h2 className="card-title">{title}</h2>}
    {children}
  </div>
);

const CardBody: FC<CardProps> = (props) => (
  <div {...props} className={clsx('card-body', props.className)} />
);

Card.Header = CardHeader;
Card.Body = CardBody;

export { Card, CardHeader, CardBody };
