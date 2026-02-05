export interface OpenMeteoCurrent {
  time?: string; // ISO8601 from API
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m?: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  precipitation_probability?: number[];
  weather_code?: number[];
}

export interface OpenMeteoDaily {
  uv_index_max?: number[];
  sunrise?: string[];
  sunset?: string[];
}

export interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

export interface MarineResponse {
  current?: {
    sea_surface_temperature?: number;
  };
}
