import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const lastCall = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    }
  }, [callback, delay]);
}