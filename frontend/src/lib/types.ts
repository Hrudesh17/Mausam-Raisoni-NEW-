export type PersonaType = string;

export interface Location {
  name: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
}

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  wind_gust?: number;
  precipitation: number;
  precipitation_probability: number;
  uv_index: number;
  aqi: number;
  aqi_category: string;
  pm2_5?: number;
  pm10?: number;
  visibility: number;
  visibility_category?: string;
  visibility_available?: boolean;
  pressure: number;
  condition_code: number;
  condition_text: string;
  is_day: boolean;
  observation_time: string;
  sunrise: string;
  sunset: string;
  daylight_duration?: string;
}

export interface HourlyForecast {
  time: string;
  hour: number;
  temperature: number;
  feels_like: number;
  precipitation_probability: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  aqi: number;
  visibility?: number;
  condition_code: number;
  condition_text: string;
  is_day: boolean;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  temp_max: number;
  temp_min: number;
  precipitation_probability: number;
  precipitation_sum: number;
  condition_code: number;
  condition_text: string;
  uv_index_max: number;
  sunrise: string;
  sunset: string;
  daylight_duration_seconds?: number;
  daylight_duration?: string;
}

export interface SevereWeatherAlert {
  id: string;
  severity: "advisory" | "watch" | "warning" | "emergency";
  title: string;
  description: string;
  impact_level: string;
  affected_area: string;
  effective_from: string;
  effective_to: string;
  source: string;
}

export interface MarineData {
  is_coastal: boolean;
  wave_height_meters?: number;
  tide_type?: string;
  tide_height_meters?: number;
  next_tide_time?: string;
  sea_surface_temp?: number;
  sea_condition?: string;
  fishermen_warning: boolean;
  coastal_advisory?: string;
}

export interface WeatherResponse {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: SevereWeatherAlert[];
  marine?: MarineData | null;
  provider: string;
  cached?: boolean;
  simulated_scenario?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date?: string; // e.g. "YYYY-MM-DD"
  start_hour: number;
  end_hour: number;
  is_outdoor: boolean;
  location_name?: string;
  notes?: string;
}

export interface ActivityConfig {
  id: string;
  name: string;
  preferred_start_hour: number;
  preferred_end_hour: number;
  importance: string;
}

export interface UserRoleDetails {
  running?: {
    time_of_day: 'Morning' | 'Evening';
    running_time: string;
  };
  travel?: {
    travel_type?: string;
    frequent_destination?: string;
  };
  family?: {
    children_age_group?: string;
    outdoor_play_time?: string;
  };
  gardening?: {
    crop_type?: string;
    watering_schedule?: string;
  };
  beach?: {
    activity_type?: string;
    preferred_timing?: string;
  };
  health?: {
    primary_condition?: string;
    air_quality_threshold?: string;
  };
  event_planning?: {
    events?: CalendarEvent[];
  };
}

export interface UserContext {
  name: string;
  is_personalized: boolean;
  interests: string[];        // selected roles
  priorities: string[];       // ["rain", "heat", "aqi", "uv", "wind", "cold"]
  sensitivities?: string[];   // ["pollen", "dust", "air_pollution", "humidity", "heat", "uv"]
  persona?: string;
  activities?: ActivityConfig[];
  calendar_events: CalendarEvent[];
  role_details?: UserRoleDetails;
}

export interface MausamScoreBreakdown {
  temperature_score: number;
  precipitation_penalty: number;
  aqi_penalty: number;
  uv_penalty: number;
  wind_penalty: number;
}

export interface MausamScore {
  score: number;
  rating: "Ideal" | "Favorable" | "Moderate" | "Unfavorable" | "Hazardous";
  headline: string;
  subtext: string;
  primary_risk?: string | null;
  breakdown?: MausamScoreBreakdown;
}

export interface ActivityScore {
  name: string;
  category: string;
  score: number;
  status: string;
  best_time: string;
  recommendation: string;
  icon_key: string;
}

export interface RoutineWeatherImpact {
  event_id: string;
  event_title: string;
  time_window: string;
  is_outdoor: boolean;
  risk_level: "green" | "yellow" | "amber" | "red";
  impact_title: string;
  impact_details: string;
  proactive_action: string;
}

export interface CalendarConflict {
  event_id: string;
  event_title: string;
  scheduled_time: string;
  risk_type: string;
  severity: string;
  conflict_summary: string;
  suggested_alternate_time?: string | null;
  suggested_action: string;
}

export interface ShouldIResponse {
  query: string;
  verdict: "YES" | "NO" | "CAUTION" | "CONDITIONAL";
  headline: string;
  reason: string;
  tip: string;
  confidence: number;
  data_points: Record<string, string>;
}


export interface KrishiIntelligence {
  spray_conditions: string;
  spray_score: number;
  soil_moisture_estimate: string;
  irrigation_needed: boolean;
  irrigation_advice: string;
  pest_disease_risk: string;
  harvesting_window: string;
  storage_warning?: string | null;
  recommended_crops?: string[];
  crop_reasoning?: string | null;
}

export interface HealthAQIIntelligence {
  health_index: number;
  respiratory_risk: string;
  mask_recommended: boolean;
  uv_safe_hours: string;
  hydration_target_liters: number;
  outdoor_exercise_verdict: string;
}

export interface SunlightWindow {
  sunrise: string;
  sunset: string;
  daylight_duration: string;
  morning_golden_hour: string;
  peak_sunlight_window: string;
  evening_golden_hour: string;
  twilight_window: string;
}

export interface EventSuitabilityWindow {
  time_window: string;
  suitability: string;
  color: string;
  temperature: number;
  rain_prob: number;
  uv_index: number;
  wind_speed: number;
  visibility: number;
  recommendation: string;
}

export interface EventPlanningIntelligence {
  sunlight: SunlightWindow;
  outdoor_comfort_rating: string;
  suitability_score: number;
  optimal_event_window: string;
  windows: EventSuitabilityWindow[];
  recommendations: string[];
}

export interface EnvironmentalPollenData {
  available: boolean;
  tree_pollen?: number | null;
  grass_pollen?: number | null;
  weed_pollen?: number | null;
  dominant_pollen?: string | null;
  status_text: string;
}

export interface AllergyFactor {
  factor: string;
  severity: "low" | "moderate" | "high";
  description: string;
}

export interface AllergyOutlook {
  risk_level: string;
  risk_color: string;
  peak_period: string;
  summary: string;
  vayusync_guidance: string;
  factors: AllergyFactor[];
  pollen: EnvironmentalPollenData;
  precautions: string[];
  disclaimer: string;
}

export interface VisibilityIntelligence {
  visibility_km: number;
  risk_level: string;
  risk_color: string;
  trend: string;
  commuter_advisory: string;
  delivery_advisory: string;
  traveler_advisory: string;
  athlete_advisory: string;
  event_planner_advisory: string;
  is_available: boolean;
}

export interface EmergencyContact {
  service: string;
  number: string;
  badge: string;
  description: string;
  icon: string;
  priority: string;
}

export interface HelplineItem {
  title: string;
  number: string;
  hours: string;
}

export interface HelplineCategory {
  category: string;
  contacts: HelplineItem[];
}

export interface FeedbackSubmission {
  user_id?: string;
  name?: string;
  email?: string;
  category: string;
  rating: number;
  comment: string;
  location?: string;
}

export interface FeedbackSubmissionResponse {
  status: string;
  id: number;
  message: string;
  points_awarded?: number;
  total_points?: number;
  national_rank?: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  is_current_user?: boolean;
}

export interface CurrentUserLeaderboardInfo {
  user_id: string;
  name: string;
  points: number;
  rank: number | null;
  in_top_100: boolean;
}

export interface NationalLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser: CurrentUserLeaderboardInfo;
  pointsPerFeedback: number;
}

export interface IssueReportSubmission {
  category: string;
  description: string;
  location_name?: string;
  lat?: number;
  lon?: number;
  app_version?: string;
  timestamp?: string;
}

export interface IntelligenceSummary {
  is_personalized: boolean;
  mausam_score: MausamScore;
  top_recommendations: string[];
  critical_alerts: string[];
  activities: ActivityScore[];
  routine_impacts: RoutineWeatherImpact[];
  calendar_conflicts: CalendarConflict[];
  krishi?: KrishiIntelligence | null;
  health?: HealthAQIIntelligence | null;
  event_planning?: EventPlanningIntelligence | null;
  allergy_outlook?: AllergyOutlook | null;
  visibility_intel?: VisibilityIntelligence | null;
}
