import { useState, useEffect } from 'react';
import { getTimeContext, type TimeContext } from '@/lib/time-context';

/**
 * Hook to get current time context with auto-updates every 60 seconds
 * Integrates with weather data for sunrise/sunset times
 */
export function useTimeContext(sunriseHour?: number, sunsetHour?: number): TimeContext {
  const [timeContext, setTimeContext] = useState<TimeContext>(() =>
    getTimeContext(sunriseHour, sunsetHour)
  );

  useEffect(() => {
    // Update immediately when sunrise/sunset hours change
    setTimeContext(getTimeContext(sunriseHour, sunsetHour));

    // Update every 60 seconds
    const interval = setInterval(() => {
      setTimeContext(getTimeContext(sunriseHour, sunsetHour));
    }, 60000);

    return () => clearInterval(interval);
  }, [sunriseHour, sunsetHour]);

  return timeContext;
}
