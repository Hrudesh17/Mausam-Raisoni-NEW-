'use client';

import React from 'react';
import { Sunrise, Sunset, Sun, Clock, Sparkles, Calendar, CheckCircle2, AlertTriangle, XCircle, Compass } from 'lucide-react';
import { EventPlanningIntelligence } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface EventPlannerCardProps {
  eventIntel?: EventPlanningIntelligence | null;
  sunrise?: string;
  sunset?: string;
  daylightDuration?: string;
}

export const EventPlannerCard: React.FC<EventPlannerCardProps> = ({
  eventIntel,
  sunrise = '06:15',
  sunset = '18:45',
  daylightDuration = '12h 30m',
}) => {
  const { t } = useLanguage();

  const sunlight = eventIntel?.sunlight || {
    sunrise,
    sunset,
    daylight_duration: daylightDuration,
    morning_golden_hour: '06:15 - 07:15 IST',
    peak_sunlight_window: '11:30 - 15:00 IST',
    evening_golden_hour: '17:30 - 18:45 IST',
    twilight_window: '18:45 - 19:20 IST',
  };

  const windows = eventIntel?.windows || [
    {
      time_window: '06:00 - 10:30 IST (Morning)',
      suitability: 'Ideal',
      color: 'green',
      temperature: 24,
      rain_prob: 10,
      uv_index: 2.5,
      wind_speed: 12,
      visibility: 9.0,
      recommendation: 'Soft golden light and mild temperature. Prime window for photography, outdoor ceremonies, and morning marathons.',
    },
    {
      time_window: '11:00 - 15:30 IST (Midday)',
      suitability: 'Moderate',
      color: 'amber',
      temperature: 32,
      rain_prob: 25,
      uv_index: 8.2,
      wind_speed: 16,
      visibility: 8.5,
      recommendation: 'High UV exposure and thermal load. Setup covered canopy, mist fans, and hydration stations.',
    },
    {
      time_window: '16:00 - 20:30 IST (Evening / Twilight)',
      suitability: 'Ideal',
      color: 'green',
      temperature: 26,
      rain_prob: 15,
      uv_index: 1.5,
      wind_speed: 14,
      visibility: 8.0,
      recommendation: 'Optimal ambient temperature, scenic golden hour illumination, and pleasant evening breeze.',
    },
  ];

  const getLocalizedBadgeLabel = (suitability: string) => {
    const s = suitability.toLowerCase();
    if (s.includes('ideal')) return t.event_suitability_ideal;
    if (s.includes('moderate')) return t.event_suitability_moderate;
    if (s.includes('challenging')) return t.event_suitability_challenging;
    if (s.includes('recommended')) return t.event_suitability_recommended;
    return suitability;
  };

  const getSuitabilityBadge = (suitability: string, color: string) => {
    const label = getLocalizedBadgeLabel(suitability);
    if (color === 'green' || suitability.toLowerCase().includes('ideal')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {label}
        </span>
      );
    }
    if (color === 'amber' || suitability.toLowerCase().includes('moderate')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        {label}
      </span>
    );
  };

  const getLocalizedTimeWindow = (timeWin: string) => {
    if (timeWin.includes('Morning Ceremony')) {
      return `${t.event_slot_morning} (07:00 - 11:00)`;
    }
    if (timeWin.includes('Midday Setup')) {
      return `${t.event_slot_midday} (11:00 - 15:00)`;
    }
    if (timeWin.includes('Sunset Reception')) {
      return `${t.event_slot_sunset} (16:00 - 19:00)`;
    }
    if (timeWin.includes('Evening Dinner')) {
      return `${t.event_slot_evening} (19:00 - 23:00)`;
    }
    if (timeWin.includes('(Morning)')) {
      return `06:00 - 10:30 IST (${t.event_slot_morning})`;
    }
    if (timeWin.includes('(Midday)')) {
      return `11:00 - 15:30 IST (${t.event_slot_midday})`;
    }
    if (timeWin.includes('(Evening')) {
      return `16:00 - 20:30 IST (${t.event_slot_sunset})`;
    }
    return timeWin;
  };

  const getLocalizedRecommendation = (rec: string) => {
    if (rec.includes('Pleasant ambient lighting') || rec.includes('morning marathons')) {
      return t.event_rec_morning;
    }
    if (rec.includes('High solar radiation') || rec.includes('hydration stations')) {
      return t.event_rec_midday;
    }
    if (rec.includes('Optimal soft warm') || rec.includes('wedding vows')) {
      return t.event_rec_sunset;
    }
    if (rec.includes('Clear night conditions') || rec.includes('stage lighting')) {
      return t.event_rec_evening;
    }
    return rec;
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-amber-100 dark:border-slate-800 p-6 sm:p-7 text-slate-900 dark:text-white shadow-xs transition-colors">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.event_planner_title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.event_planner_subtitle}</p>
          </div>
        </div>

        {eventIntel && (
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 text-right shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
                {t.suitability_score}
              </span>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{eventIntel.suitability_score}/100</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">({getLocalizedBadgeLabel(eventIntel.outdoor_comfort_rating)})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sunlight & Daylight Duration Grid */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>{t.sunlight_window}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {/* Sunrise */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>{t.metric_sunrise}</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{sunlight.sunrise}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.event_dawn_onset}</div>
          </div>

          {/* Sunset */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Sunset className="w-4 h-4 text-orange-500" />
              <span>{t.metric_sunset}</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{sunlight.sunset}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.event_dusk_transition}</div>
          </div>

          {/* Daylight Duration */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>{t.metric_daylight}</span>
            </div>
            <div className="text-lg font-black text-sky-600 dark:text-sky-400">{sunlight.daylight_duration}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.event_total_solar}</div>
          </div>

          {/* Golden Hour (Morning) */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.morning_golden_hour}</span>
            </div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{sunlight.morning_golden_hour}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.event_soft_warm_lighting}</div>
          </div>

          {/* Evening Golden Hour */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between col-span-2 sm:col-span-1 xl:col-span-1 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.evening_golden_hour}</span>
            </div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{sunlight.evening_golden_hour}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.event_prime_aesthetic}</div>
          </div>
        </div>
      </div>

      {/* Special Solar Badges: Peak Sunlight & Twilight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-3.5 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.peak_sunlight}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{sunlight.peak_sunlight_window}</span>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shadow-xs">
            {t.event_solar_glare}
          </span>
        </div>

        <div className="bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl p-3.5 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.twilight}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{sunlight.twilight_window}</span>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700 shadow-xs">
            {t.event_ambient_light}
          </span>
        </div>
      </div>

      {/* Event Suitability Windows */}
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>{t.event_suitability}</span>
          </span>
          {eventIntel?.optimal_event_window && (
            <span className="text-sky-600 dark:text-sky-400 font-medium normal-case">
              {t.event_recommended_prefix} {eventIntel.optimal_event_window}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {windows.map((win, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{getLocalizedTimeWindow(win.time_window)}</span>
                  {getSuitabilityBadge(win.suitability, win.color)}
                </div>

                {/* Telemetry stats pill */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{win.temperature}°C</span>
                  <span>•</span>
                  <span>{t.telemetry_rain}: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{win.rain_prob}%</span></span>
                  <span>•</span>
                  <span>{t.telemetry_uv}: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{win.uv_index.toFixed(1)}</span></span>
                  <span>•</span>
                  <span>{t.telemetry_vis}: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{win.visibility} km</span></span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1 border-l-2 border-slate-300 dark:border-slate-600 mt-1">
                {getLocalizedRecommendation(win.recommendation)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
