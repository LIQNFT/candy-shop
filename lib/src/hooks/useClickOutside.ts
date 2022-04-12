import { useEffect, RefObject } from 'react';

const useClickOutside = (
  ref: RefObject<HTMLInputElement>,
  callback: () => void
): void => {
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ref, callback]);
};

export { useClickOutside };
