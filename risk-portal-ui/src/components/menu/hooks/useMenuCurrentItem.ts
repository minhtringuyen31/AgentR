import { matchPath } from 'react-router';

import { IMenuItemConfig, type MenuConfigType } from '../types';

const useMenuCurrentItem = (
  pathname: string,
  items: MenuConfigType | null
): IMenuItemConfig | null => {
  pathname = pathname.trim();

  const findCurrentItem = (items: MenuConfigType | null): IMenuItemConfig | null => {
    if (!items) return null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.path && matchPath(pathname, item.path)) {
        return item ?? null;
      } else if (item.children) {
        const childItem = findCurrentItem(item.children as MenuConfigType);
        if (childItem) {
          return childItem;
        }
      }
    }

    return null;
  };

  return findCurrentItem(items);
};

export { useMenuCurrentItem };
