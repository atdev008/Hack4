export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface TripInput {
  mood: string;
  province: string;
  duration_hours: number;
  budget: number;
  transport_mode: string;
  locale?: string;
}

export interface RouteItem {
  time: string;
  place: string;
  mission: string;
  stay_minutes: number;
  rain_tip?: string;
  temp?: number;
  aqi?: number;
  aqi_color?: string;
  weather_icon?: "sun" | "cloud-sun" | "cloud" | "cloud-drizzle" | "cloud-rain";
  weather_warning?: string;
  photo_hint?: string;
  stamp_emoji?: string;
  place_image_query?: string;
  // Populated after Google Places lookup
  place_lat?: number;
  place_lng?: number;
  place_photo_url?: string | null;
  place_id?: string;
  distance_text?: string;
  duration_text?: string;
}

export interface TripResult {
  trip_title: string;
  short_description: string;
  estimated_budget: number;
  tiredness_level: string;
  route_items: RouteItem[];
  badge_reward: string;
  badge_emoji: string;
  travel_memory_preview: string;
}

export interface MissionStatus {
  index: number;
  completed: boolean;
  photoUrl?: string;
  verified?: boolean;
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainPercent: number;
  descTh: string;
  descEn: string;
}

export interface WeatherData {
  province: string;
  today: WeatherForecast;
  forecasts: WeatherForecast[];
}

export interface AqiData {
  aqi: number;
  level: string;
  levelTh: string;
  color: string;
  advice: string;
  adviceTh: string;
}

export interface LocationWeather {
  locationName: string;
  locationNameEn: string;
  maxTemp: number;
  minTemp: number;
  currentTemp: number;
  humidity: number;
  rainPercent: number;
  descTh: string;
  descEn: string;
  aqi: number;
  aqiLevel: string;
  aqiLevelTh: string;
  aqiColor: string;
  aqiAdvice: string;
  aqiAdviceTh: string;
}
