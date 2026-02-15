import { useEffect, useRef, useCallback } from 'react';

/**
 * Throttles a callback function to limit how often it can be executed.
 * Useful for high-frequency events like resize, scroll, or mouse move.
 *
 * Unlike debouncing (which delays execution), throttling ensures the function
 * executes at most once per delay period while the event is ongoing.
 *
 * @param callback - The function to throttle
 * @param delay - Minimum time in milliseconds between function executions
 * @returns A throttled version of the callback
 *
 * @example
 * const handleResize = () => {
 *   setIsMobile(window.innerWidth < 768);
 * };
 * const throttledResize = useThrottle(handleResize, 250);
 *
 * useEffect(() => {
 *   window.addEventListener('resize', throttledResize);
 *   return () => window.removeEventListener('resize', throttledResize);
 * }, [throttledResize]);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        // Enough time has passed, execute immediately
        lastRun.current = now;
        callback(...args);
      } else {
        // Not enough time has passed, schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}
