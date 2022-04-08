import { useEffect } from 'react';

const useClickOutside = (ref: any, callback: any): void => {
  useEffect(() => {
    const handleClick = (e: MouseEvent): any => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ref, callback]);
};

export { useClickOutside };
