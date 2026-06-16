import { matchPath } from 'react-router';

import { MenuConfigType } from '../types';

const useMenuChildren = (
  pathname: string,
  items: MenuConfigType,
  level: number
): MenuConfigType | null => {
  const hasActiveChild = (items: MenuConfigType): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.path && matchPath(pathname, item.path)) {
        return true;
      } else if (item.children) {
        if (hasActiveChild(item.children as MenuConfigType)) {
          return true;
        }
      }
    }

    return false;
  };

  const getChildren = (
    items: MenuConfigType,
    level: number = 0,
    currentLevel: number = 0
  ): MenuConfigType | null => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.children) {
        if (level === currentLevel && hasActiveChild(item.children)) {
          return item.children;
        } else {
          return getChildren(item.children, level, currentLevel++);
        }
      } else if (level === currentLevel && item.path && matchPath(pathname, item.path)) {
        return items;
      }
    }

    return null;
  };

  return getChildren(items, level);
};

export { useMenuChildren };
