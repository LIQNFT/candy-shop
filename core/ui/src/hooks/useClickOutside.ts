import { useEffect, useRef } from 'react';

export const useClickOutside = (callback: (event: Event) => any) => {
  const innerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const listener = (event: Event) => {
      if (
        innerRef.current &&
        callbackRef.current &&
        !(innerRef.current as HTMLElement).contains(event.target as Node)
      ) {
        callbackRef.current(event);
      }
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

  return innerRef;
};
