import { Select as AntdSelect } from 'antd';
import clsx from 'clsx';

// @ts-ignore
const Select: typeof AntdSelect = (props) => {
  return (
    <AntdSelect
      size="large"
      showSearch
      {...props}
      rootClassName={clsx('!text-2sm capitalize !text-gray-700', props.rootClassName)}
      className={clsx('!text-2sm !text-gray-700', props.className)}
    />
  );
};

export { Select };
