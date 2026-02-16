import type { TimeContext } from './time-context';
import { formatTimeUntil } from './time-context';
import { translations, type Lang } from './i18n';

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partlyCloudy' | string;
  uvIndex: number;
  sunrise?: string;
  sunset?: string;
}

export interface ContextualSuggestion {
  id: string;
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    modal?: 'beachCam';
  };
  priority: number;
  matchedConditions: string[];
}

interface SuggestionTemplate {
  id: string;
  icon: string;
  title: string | ((ctx: ContextData) => string);
  description: string | ((ctx: ContextData) => string);
  action?: {
    label: string;
    href?: string;
    modal?: 'beachCam';
  };
  basePriority: number;
  conditions: {
    timeOfDay?: string[];
    weather?: (weather: WeatherData) => boolean;
    urgent?: (ctx: ContextData) => boolean;
  };
}

interface ContextData {
  timeContext: TimeContext;
  weather: WeatherData;
}

/**
 * Score and rank suggestions based on current context
 */
export function getSuggestions(contextData: ContextData, lang: Lang): ContextualSuggestion[] {
  const t = translations[lang];

  const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  // Sunrise/Sunset
  {
    id: 'sunrise-soon',
    icon: '🌅',
    title: (ctx) => {
      const time = formatTimeUntil(ctx.timeContext.minutesUntilSunrise || 0, lang);
      return t.ctxSunriseSoon.replace('{time}', time);
    },
    description: () => t.ctxSunriseSoonDesc,
    action: { label: t.ctxViewMap, href: '/map' },
    basePriority: 70,
    conditions: {
      urgent: (ctx) => (ctx.timeContext.minutesUntilSunrise || 999) < 30,
    },
  },
  {
    id: 'sunset-soon',
    icon: '🌅',
    title: (ctx) => {
      const time = formatTimeUntil(ctx.timeContext.minutesUntilSunset || 0, lang);
      return t.ctxSunsetSoon.replace('{time}', time);
    },
    description: () => t.ctxSunsetSoonDesc,
    action: { label: t.ctxFindBeachClubs, href: '/map' },
    basePriority: 80,
    conditions: {
      urgent: (ctx) => (ctx.timeContext.minutesUntilSunset || 999) < 30,
    },
  },

  // Morning Activities
  {
    id: 'morning-beach',
    icon: '🏖️',
    title: () => t.ctxPerfectBeachMorning,
    description: (ctx) => {
      const temp = Math.round(ctx.weather.temperature);
      return t.ctxBeachMorningDesc.replace('{temp}', String(temp));
    },
    action: { label: t.ctxViewBeachCam, modal: 'beachCam' },
    basePriority: 60,
    conditions: {
      timeOfDay: ['earlyMorning', 'morning'],
      weather: (w) => w.condition !== 'rainy' && w.uvIndex < 8,
    },
  },
  {
    id: 'morning-coffee',
    icon: '☕',
    title: () => t.ctxMorningCoffee,
    description: () => t.ctxMorningCoffeeDesc,
    action: { label: t.ctxFindCafes, href: '/map' },
    basePriority: 50,
    conditions: {
      timeOfDay: ['earlyMorning', 'morning'],
    },
  },

  // Midday Warnings & Suggestions
  {
    id: 'uv-warning',
    icon: '☀️',
    title: (ctx) => t.ctxHighUvAlert.replace('{uv}', String(ctx.weather.uvIndex)),
    description: () => t.ctxHighUvDesc,
    basePriority: 90,
    conditions: {
      timeOfDay: ['midday', 'afternoon'],
      weather: (w) => w.uvIndex >= 8,
    },
  },
  {
    id: 'indoor-lunch',
    icon: '🍽️',
    title: () => t.ctxLunchTime,
    description: () => t.ctxLunchTimeDesc,
    action: { label: t.ctxFindRestaurants, href: '/map' },
    basePriority: 55,
    conditions: {
      timeOfDay: ['midday'],
    },
  },

  // Rain/Weather
  {
    id: 'rain-alert',
    icon: '🌧️',
    title: () => t.ctxRainAlert,
    description: () => t.ctxRainAlertDesc,
    action: { label: t.ctxDiscoverIndoor, href: '/discover' },
    basePriority: 85,
    conditions: {
      weather: (w) => w.condition === 'rainy',
    },
  },

  // Afternoon
  {
    id: 'afternoon-explore',
    icon: '🗺️',
    title: () => t.ctxExploreTulum,
    description: () => t.ctxExploreTulumDesc,
    action: { label: t.ctxDiscover, href: '/discover' },
    basePriority: 50,
    conditions: {
      timeOfDay: ['afternoon'],
    },
  },

  // Evening
  {
    id: 'evening-dining',
    icon: '🌮',
    title: () => t.ctxDinnerTime,
    description: () => t.ctxDinnerTimeDesc,
    action: { label: t.ctxFindRestaurants, href: '/map' },
    basePriority: 60,
    conditions: {
      timeOfDay: ['evening'],
    },
  },
  {
    id: 'beach-clubs-evening',
    icon: '🍹',
    title: () => t.ctxBeachClubEvening,
    description: () => t.ctxBeachClubEveningDesc,
    action: { label: t.ctxFindBeachClubs, href: '/map' },
    basePriority: 65,
    conditions: {
      timeOfDay: ['evening'],
      weather: (w) => w.condition !== 'rainy',
    },
  },

  // Night
  {
    id: 'night-rest',
    icon: '🌙',
    title: () => t.ctxPlanTomorrow,
    description: () => t.ctxPlanTomorrowDesc,
    action: { label: t.ctxViewForecast, href: '/' },
    basePriority: 40,
    conditions: {
      timeOfDay: ['night'],
    },
  },

  // General
  {
    id: 'local-events',
    icon: '📅',
    title: () => t.ctxLocalEvents,
    description: () => t.ctxLocalEventsDesc,
    action: { label: t.ctxViewEvents, href: '/discover/events' },
    basePriority: 45,
    conditions: {},
  },
  {
    id: 'transportation',
    icon: '🚗',
    title: () => t.ctxGettingAround,
    description: () => t.ctxGettingAroundDesc,
    action: { label: t.ctxTransportGuide, href: '/discover/transportation' },
    basePriority: 35,
    conditions: {},
  },
];

  const scored = SUGGESTION_TEMPLATES.map((template) => {
    let score = template.basePriority;
    const matched: string[] = [];

    // Time of day match (+30 points)
    if (template.conditions.timeOfDay) {
      if (template.conditions.timeOfDay.includes(contextData.timeContext.timeOfDay)) {
        score += 30;
        matched.push('time');
      } else {
        // Doesn't match time requirement - very low score
        score = Math.min(score, 20);
      }
    }

    // Weather match (+20 points)
    if (template.conditions.weather) {
      if (template.conditions.weather(contextData.weather)) {
        score += 20;
        matched.push('weather');
      } else {
        // Weather condition not met - reduce score
        score = Math.min(score, 25);
      }
    }

    // Urgent condition (+50 points)
    if (template.conditions.urgent) {
      if (template.conditions.urgent(contextData)) {
        score += 50;
        matched.push('urgent');
      }
    }

    return {
      template,
      score,
      matched,
    };
  });

  // Sort by score (highest first) and take top 6
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Convert to suggestion objects
  return top.map((item) => ({
    id: item.template.id,
    icon: item.template.icon,
    title: typeof item.template.title === 'function'
      ? item.template.title(contextData)
      : item.template.title,
    description: typeof item.template.description === 'function'
      ? item.template.description(contextData)
      : item.template.description,
    action: item.template.action,
    priority: item.score,
    matchedConditions: item.matched,
  }));
}
