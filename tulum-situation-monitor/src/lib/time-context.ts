export type TimeOfDay = 'earlyMorning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export interface TimeContext {
  timeOfDay: TimeOfDay;
  hour: number;
  minute: number;
  isNight: boolean;
  isMorning: boolean;
  isEvening: boolean;
  minutesUntilSunrise?: number;
  minutesUntilSunset?: number;
}

/**
 * Get current time of day category
 * earlyMorning: 4am-7am
 * morning: 7am-11am
 * midday: 11am-3pm
 * afternoon: 3pm-6pm
 * evening: 6pm-10pm
 * night: 10pm-4am
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 4 && hour < 7) return 'earlyMorning';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Calculate minutes until a target time
 */
function minutesUntil(targetHour: number, targetMinute: number, currentHour: number, currentMinute: number): number {
  const current = currentHour * 60 + currentMinute;
  const target = targetHour * 60 + targetMinute;

  if (target > current) {
    return target - current;
  }
  // Target is tomorrow
  return (24 * 60) - current + target;
}

/**
 * Get full time context with sunrise/sunset data
 */
export function getTimeContext(sunriseHour?: number, sunsetHour?: number): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeOfDay = getTimeOfDay(hour);

  let minutesUntilSunrise: number | undefined;
  let minutesUntilSunset: number | undefined;

  if (sunriseHour !== undefined) {
    minutesUntilSunrise = minutesUntil(sunriseHour, 0, hour, minute);
  }

  if (sunsetHour !== undefined) {
    minutesUntilSunset = minutesUntil(sunsetHour, 0, hour, minute);
  }

  return {
    timeOfDay,
    hour,
    minute,
    isNight: timeOfDay === 'night' || timeOfDay === 'earlyMorning',
    isMorning: timeOfDay === 'earlyMorning' || timeOfDay === 'morning',
    isEvening: timeOfDay === 'evening',
    minutesUntilSunrise,
    minutesUntilSunset,
  };
}

/**
 * Format time until a future event
 */
export function formatTimeUntil(minutes: number): string {
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${Math.round(minutes)}min`;

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours < 24) {
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/**
 * Get a friendly time period label
 */
export function getTimePeriodLabel(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'earlyMorning':
      return 'Early Morning';
    case 'morning':
      return 'Morning';
    case 'midday':
      return 'Midday';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
    case 'night':
      return 'Night';
  }
}
