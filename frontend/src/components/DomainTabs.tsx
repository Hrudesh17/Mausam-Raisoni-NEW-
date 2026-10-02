'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Sprout, 
  HeartPulse, 
  Waves, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Bike, 
  Car, 
  Droplet, 
  Wind, 
  Sun,
  ShieldAlert,
  CalendarCheck
} from 'lucide-react';
import { 
  WeatherResponse, 
  IntelligenceSummary, 
  UserContext 
} from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface DomainTabsProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const DomainTabs: React.FC<DomainTabsProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t } = useLanguage();
  // Select initial tab based on persona
  const getInitialTab = () => {
    if (context.interests?.includes('gardening')) return 'krishi';
    if (context.interests?.includes('running') || context.interests?.includes('health')) return 'health';
    if (context.interests?.includes('beach')) return 'marine';
    return 'activities';
  };

  const [activeTab, setActiveTab] = useState<'krishi' | 'health' | 'marine' | 'activities'>(getInitialTab());
  const krishi = intelligence.krishi;
  const health = intelligence.health;
  const marine = weather.marine;
  const activities = intelligence.activities || [];

  return (
    <section className="w-full rounded-2xl glass-panel p-5 sm:p-6 space-y-5 border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-sm">
      {/* Tab Navigation Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-sky-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('krishi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'krishi'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{t.role_gardening_title}</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'health'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>{t.role_health_title}</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'activities'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t.pers_priorities_heading || 'Activity Index'}</span>
        </button>

        {marine && (
          <button
            onClick={() => setActiveTab('marine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'marine'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{t.role_beach_title}</span>
          </button>
        )}
      </div>

      {/* Tab Content: Krishi Mausam */}
      {activeTab === 'krishi' && krishi && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pesticide / Foliar Spray Window</p>
              <p className={`text-base font-bold mt-1 ${
                krishi.spray_score > 70 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {krishi.spray_conditions} ({krishi.spray_score}/100)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Safe wind limit: &lt;15 km/h (Current: {weather.current.wind_speed} km/h)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Soil Moisture & Irrigation</p>
              <p className="text-base font-bold text-sky-700 dark:text-sky-400 mt-1">
                {krishi.soil_moisture_estimate}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {krishi.irrigation_advice}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pest & Fungal Disease Risk</p>
              <p className={`text-base font-bold mt-1 ${
                krishi.pest_disease_risk === 'High' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {krishi.pest_disease_risk} Risk
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                High humidity ({weather.current.humidity}%) accelerates spore germination
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-3 shadow-xs">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950 dark:text-emerald-200">Harvesting & Post-Harvest Advice:</p>
              <p className="mt-0.5 text-emerald-900 dark:text-emerald-300">{krishi.harvesting_window}</p>
              {krishi.storage_warning && (
                <p className="mt-1 text-amber-800 dark:text-amber-300 font-medium">⚠️ {krishi.storage_warning}</p>
              )}
            </div>
          </div>

          {krishi?.recommended_crops && krishi?.recommended_crops?.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">Recommended Crops for Current Weather</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{krishi?.crop_reasoning}</p>
              <div className="flex flex-wrap gap-2">
                {krishi?.recommended_crops?.map((crop) => (
                  <span key={crop} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Health & AQI */}
      {activeTab === 'health' && health && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">National AQI (NAQI)</p>
              <p className={`text-xl font-extrabold mt-1 ${
                weather.current.aqi > 200 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {weather.current.aqi}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{weather.current.aqi_category}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Respiratory Threat Level</p>
              <p className={`text-base font-bold mt-1 ${
                health.respiratory_risk === 'Severe' || health.respiratory_risk === 'High' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {health.respiratory_risk}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {health.mask_recommended ? 'N95 Respirator Strongly Advised' : 'No mask necessary'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">UV Radiation Window</p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-1">
                Safe: {health.uv_safe_hours}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Peak UV: {weather.current.uv_index}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Hydration Target</p>
              <p className="text-xl font-extrabold text-sky-700 dark:text-sky-400 mt-1">
                {health.hydration_target_liters} L
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">To counter heat evaporation</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 flex items-center justify-between text-xs shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Outdoor Exercise Verdict:</span>
            <span className="font-bold text-slate-900 dark:text-white">{health.outdoor_exercise_verdict}</span>
          </div>
        </div>
      )}

      {/* Tab Content: Activity Matrix */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activities.map((act, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.name}</h4>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  act.score > 75 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : (act.score > 45 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800')
                }`}>
                  {act.score} / 100
                </span>
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-400 font-mono font-medium">
                Best Window: {act.best_time}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {act.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Coastal & Marine */}
      {activeTab === 'marine' && marine && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Significant Wave Height</p>
              <p className="text-xl font-bold text-cyan-700 dark:text-cyan-400 mt-1">
                {marine.wave_height_meters} Meters
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sea State: {marine.sea_condition}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Tidal Prediction</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {marine.tide_type} ({marine.tide_height_meters}m)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Next Peak: {marine.next_tide_time}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">Fishermen Sea Safety</p>
              <p className={`text-base font-bold mt-1 ${
                marine.fishermen_warning ? 'text-rose-700 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {marine.fishermen_warning ? '⚠️ Red Alert: Stay Ashore' : '✓ Safe for Trawling'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sea Temp: {marine.sea_surface_temp}°C
              </p>
            </div>
          </div>

          {marine.coastal_advisory && (
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-xs text-sky-900 dark:text-sky-300 shadow-xs">
              <strong>IMD Marine Advisory: </strong> {marine.coastal_advisory}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
