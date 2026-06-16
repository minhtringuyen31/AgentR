import { useEffect } from 'react';

const useBodyClasses = (classNames: string) => {
  useEffect(() => {
    const classes = classNames.split(' ');

    // Add classes to body when component mounts
    classes.forEach((className) => document.body.classList.add(className));

    // Cleanup function to remove classes when component unmounts
    return () => {
      classes.forEach((className) => document.body.classList.remove(className));
    };
  }, [classNames]); // Re-run the effect if classNames changes
};

export default useBodyClasses;
