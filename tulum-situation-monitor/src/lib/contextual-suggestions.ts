import type { TimeContext } from './time-context';
import { formatTimeUntil } from './time-context';

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
    href: string;
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
    href: string;
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

const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  // Sunrise/Sunset
  {
    id: 'sunrise-soon',
    icon: '🌅',
    title: (ctx) => `Sunrise in ${formatTimeUntil(ctx.timeContext.minutesUntilSunrise || 0)}`,
    description: 'Perfect time for a peaceful beach walk',
    action: { label: 'View Map', href: '/map' },
    basePriority: 70,
    conditions: {
      urgent: (ctx) => (ctx.timeContext.minutesUntilSunrise || 999) < 30,
    },
  },
  {
    id: 'sunset-soon',
    icon: '🌅',
    title: (ctx) => `Sunset in ${formatTimeUntil(ctx.timeContext.minutesUntilSunset || 0)}`,
    description: 'Golden hour - perfect for photos and beach clubs',
    action: { label: 'Find Beach Clubs', href: '/map' },
    basePriority: 80,
    conditions: {
      urgent: (ctx) => (ctx.timeContext.minutesUntilSunset || 999) < 30,
    },
  },

  // Morning Activities
  {
    id: 'morning-beach',
    icon: '🏖️',
    title: 'Perfect Beach Morning',
    description: (ctx) => `Clear skies, ${Math.round(ctx.weather.temperature)}°C - ideal beach conditions`,
    action: { label: 'Check Beach Conditions', href: '/' },
    basePriority: 60,
    conditions: {
      timeOfDay: ['earlyMorning', 'morning'],
      weather: (w) => w.condition !== 'rainy' && w.uvIndex < 8,
    },
  },
  {
    id: 'morning-coffee',
    icon: '☕',
    title: 'Morning Coffee Spots',
    description: 'Start your day at a local cafe',
    action: { label: 'Find Cafes', href: '/map' },
    basePriority: 50,
    conditions: {
      timeOfDay: ['earlyMorning', 'morning'],
    },
  },

  // Midday Warnings & Suggestions
  {
    id: 'uv-warning',
    icon: '☀️',
    title: (ctx) => `High UV Alert (${ctx.weather.uvIndex})`,
    description: 'Seek shade, wear sunscreen SPF 50+',
    basePriority: 90,
    conditions: {
      timeOfDay: ['midday', 'afternoon'],
      weather: (w) => w.uvIndex >= 8,
    },
  },
  {
    id: 'indoor-lunch',
    icon: '🍽️',
    title: 'Lunch Time',
    description: 'Escape the midday heat at a local restaurant',
    action: { label: 'Find Restaurants', href: '/map' },
    basePriority: 55,
    conditions: {
      timeOfDay: ['midday'],
    },
  },

  // Rain/Weather
  {
    id: 'rain-alert',
    icon: '🌧️',
    title: 'Rain Detected',
    description: 'Indoor activities recommended',
    action: { label: 'Discover Indoor Spots', href: '/discover' },
    basePriority: 85,
    conditions: {
      weather: (w) => w.condition === 'rainy',
    },
  },

  // Afternoon
  {
    id: 'afternoon-explore',
    icon: '🗺️',
    title: 'Explore Tulum',
    description: 'Visit cultural sites and local shops',
    action: { label: 'Discover', href: '/discover' },
    basePriority: 50,
    conditions: {
      timeOfDay: ['afternoon'],
    },
  },

  // Evening
  {
    id: 'evening-dining',
    icon: '🌮',
    title: 'Dinner Time',
    description: 'Discover the best restaurants in Tulum',
    action: { label: 'Find Restaurants', href: '/map' },
    basePriority: 60,
    conditions: {
      timeOfDay: ['evening'],
    },
  },
  {
    id: 'beach-clubs-evening',
    icon: '🍹',
    title: 'Beach Club Evening',
    description: 'Sunset cocktails and live music',
    action: { label: 'Find Beach Clubs', href: '/map' },
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
    title: 'Plan Tomorrow',
    description: 'Check weather and tide forecast',
    action: { label: 'View Forecast', href: '/' },
    basePriority: 40,
    conditions: {
      timeOfDay: ['night'],
    },
  },

  // General
  {
    id: 'local-events',
    icon: '📅',
    title: 'Local Events',
    description: 'See what\'s happening in Tulum today',
    action: { label: 'View Events', href: '/discover/events' },
    basePriority: 45,
    conditions: {},
  },
  {
    id: 'transportation',
    icon: '🚗',
    title: 'Getting Around',
    description: 'Bikes, scooters, taxis, and colectivos',
    action: { label: 'Transportation Guide', href: '/discover/transportation' },
    basePriority: 35,
    conditions: {},
  },
];

/**
 * Score and rank suggestions based on current context
 */
export function getSuggestions(contextData: ContextData): ContextualSuggestion[] {
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
