import { useRef, useEffect } from 'react';

export const useUnmountTimeout = (): {
  current: NodeJS.Timeout | undefined;
} => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timeout = timeoutRef.current;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return timeoutRef;
};
