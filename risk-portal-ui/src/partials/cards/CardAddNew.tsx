import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';

import { CommonHexagonBadge } from '../common';
import { IAddNewProps } from './CardAddNewRow';

const CardAddNew = ({ path, size, iconSize, title, subTitle }: IAddNewProps) => {
  return (
    <Fragment>
      <style>
        {`
          .add-new-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-4.png')}');
          }
          .dark .add-new-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-4-dark.png')}');
          }
        `}
      </style>

      <Link
        to={`${path}`}
        className="card border-2 border-dashed border-brand-clarity bg-center bg-[length:600px] bg-no-repeat add-new-bg"
      >
        <div className="card-body grid items-center">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center pt-5">
              <CommonHexagonBadge
                size={size}
                badge={<KeenIcon icon="rocket" className={`${iconSize} text-brand`} />}
                stroke="stroke-brand-clarity"
                fill="fill-light"
              />
            </div>

            <div className="flex flex-col text-center">
              <span className="text-lg font-medium text-gray-900 hover:text-primary-active mb-px">
                {title}
              </span>
              <span className="text-2sm text-gray-700">{subTitle}</span>
            </div>
          </div>
        </div>
      </Link>
    </Fragment>
  );
};

export { CardAddNew };
