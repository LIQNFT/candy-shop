import { useEffect, useRef } from 'react';

interface UseObserverProps {
  callbackFn: () => void;
  triggerTargetId: string;
  enable: boolean;
}

const BOTTOM_GAP = 50;

export function useObserver({ callbackFn, triggerTargetId, enable = true }: UseObserverProps): void {
  const callbackFnRef = useRef(callbackFn);

  if (callbackFn !== callbackFnRef.current) {
    callbackFnRef.current = callbackFn;
  }

  useEffect(() => {
    if (!enable || !('IntersectionObserver' in window)) return;
    const target = document.getElementById(triggerTargetId);
    if (!target) {
      console.warn(`Element with id=${triggerTargetId} is not existed.`);
      return;
    }

    let prevRatio = 0;
    const callbackObserver = (entries: any[]) => {
      entries.forEach((entry) => {
        console.log('entry.intersectionRatio', entry.intersectionRatio);
        if (entry.intersectionRatio > prevRatio) {
          callbackFnRef.current && callbackFnRef.current();
          window.scrollTo({ top: window.scrollY - BOTTOM_GAP, behavior: 'smooth' });
        }
        prevRatio = entry.intersectionRatio;
      });
    };

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    };

    const observer = new IntersectionObserver(callbackObserver, options);
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [enable, triggerTargetId]);
}
