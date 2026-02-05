export type Lang = "en" | "es" | "fr";

export function formatTemp(tempC: number, lang: Lang): string {
  if (lang === "es" || lang === "fr") {
    return `${Math.round(tempC)}°`;
  }
  return `${Math.round((tempC * 9) / 5 + 32)}°`;
}

export function formatTempFull(tempC: number, lang: Lang): string {
  if (lang === "es" || lang === "fr") {
    return `${Math.round(tempC)}°C`;
  }
  return `${Math.round((tempC * 9) / 5 + 32)}°F`;
}

export function formatWind(speedKmh: number, lang: Lang): string {
  if (lang === "es" || lang === "fr") {
    return `${Math.round(speedKmh)} km/h`;
  }
  return `${Math.round(speedKmh * 0.621371)} mph`;
}

export function getWindDirection(degrees: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

const weatherCodes: Record<
  number,
  { en: string; es: string; fr: string; icon: string }
> = {
  0: { en: "Clear", es: "Despejado", fr: "Dégagé", icon: "☀️" },
  1: { en: "Mostly Clear", es: "Mayormente Despejado", fr: "Plutôt Dégagé", icon: "🌤️" },
  2: { en: "Partly Cloudy", es: "Parcialmente Nublado", fr: "Partiellement Nuageux", icon: "⛅" },
  3: { en: "Overcast", es: "Nublado", fr: "Couvert", icon: "☁️" },
  45: { en: "Foggy", es: "Neblina", fr: "Brouillard", icon: "🌫️" },
  48: { en: "Foggy", es: "Neblina", fr: "Brouillard", icon: "🌫️" },
  51: { en: "Drizzle", es: "Llovizna", fr: "Bruine", icon: "🌦️" },
  53: { en: "Drizzle", es: "Llovizna", fr: "Bruine", icon: "🌦️" },
  55: { en: "Drizzle", es: "Llovizna", fr: "Bruine", icon: "🌧️" },
  61: { en: "Rain", es: "Lluvia", fr: "Pluie", icon: "🌧️" },
  63: { en: "Rain", es: "Lluvia", fr: "Pluie", icon: "🌧️" },
  65: { en: "Heavy Rain", es: "Lluvia Fuerte", fr: "Forte Pluie", icon: "🌧️" },
  95: { en: "Thunderstorm", es: "Tormenta", fr: "Orage", icon: "⛈️" },
  96: { en: "Thunderstorm", es: "Tormenta", fr: "Orage", icon: "⛈️" },
  99: { en: "Thunderstorm", es: "Tormenta", fr: "Orage", icon: "⛈️" },
};

export function getWeatherDescription(
  code: number,
  lang: Lang
): { desc: string; icon: string } {
  const w = weatherCodes[code] ?? { en: "?", es: "?", fr: "?", icon: "❓" };
  const desc = w[lang] ?? w.en;
  return { desc, icon: w.icon };
}

export function getWeatherIcon(code: number): string {
  const icons: Record<number, string> = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };
  return icons[code] ?? "❓";
}
