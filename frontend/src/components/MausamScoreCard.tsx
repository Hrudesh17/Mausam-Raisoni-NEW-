'use client';

import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Info,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface MausamScoreCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const MausamScoreCard: React.FC<MausamScoreCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t } = useLanguage();
  const curr = weather.current;
  const scoreData = intelligence.mausam_score;
  const score = scoreData.score;
  const rating = scoreData.rating;

  // Determine score color theme
  let scoreColor = 'from-emerald-600 to-teal-500';
  let scoreBadgeBg = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  let gaugeStroke = '#059669';

  if (score < 30) {
    scoreColor = 'from-rose-600 to-red-600';
    scoreBadgeBg = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    gaugeStroke = '#e11d48';
  } else if (score < 55) {
    scoreColor = 'from-amber-600 to-orange-500';
    scoreBadgeBg = 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    gaugeStroke = '#d97706';
  } else if (score < 75) {
    scoreColor = 'from-sky-600 to-blue-600';
    scoreBadgeBg = 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    gaugeStroke = '#0284c7';
  }

  // Calculate circular stroke offset
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full space-y-4">
      {/* Active IMD Severe Alerts Banner */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 shadow-sm flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-600 text-white tracking-wider">
                {weather.alerts[0].severity}
              </span>
              <span className="text-xs font-mono text-rose-700 dark:text-rose-400 font-semibold">
                {weather.alerts[0].source}
              </span>
            </div>
            <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200 leading-snug">
              {weather.alerts[0].title}
            </h3>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
              {weather.alerts[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Hero Intelligence Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-sm">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Personalized Score Dial */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 text-center sm:text-left lg:text-center border-b lg:border-b-0 lg:border-r border-sky-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={gaugeStroke}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black tracking-tight bg-gradient-to-br ${scoreColor} bg-clip-text text-transparent`}>
                  {score}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Suitability
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${scoreBadgeBg}`}>
                {rating} Conditions
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tailored for <span className="text-slate-800 dark:text-slate-200 capitalize font-semibold">{context.interests?.slice(0, 2).join(' & ') || 'Your Day'}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Contextual Translation & Telemetry */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* The Translation: What it means for ME */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  VayuSync Decision Intelligence
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#0B1F33] dark:text-white leading-tight">
                "{scoreData.headline}"
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {scoreData.subtext}
              </p>
            </div>

            {/* Live Weather Parameter Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-1.5 overflow-hidden min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate" title={t.metric_temp}>{t.metric_temp}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5 whitespace-nowrap">{curr.temperature}°C</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">{t.metric_feels_like} {curr.feels_like}°C</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-1.5 overflow-hidden min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate" title={t.metric_rain}>{t.metric_rain}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5 whitespace-nowrap">{curr.precipitation_probability}%</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">{curr.precipitation > 0 ? `${curr.precipitation} mm` : 'Dry'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-1.5 overflow-hidden min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate" title={t.metric_wind}>{t.metric_wind}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5 whitespace-nowrap">{curr.wind_speed} km/h</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">Gust {curr.wind_gust || curr.wind_speed} km/h</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-1.5 overflow-hidden min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  curr.aqi > 200 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate" title={t.metric_aqi}>{t.metric_aqi}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5 whitespace-nowrap">AQI {curr.aqi}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">{curr.aqi_category}</p>
                </div>
              </div>
            </div>

            {/* Score Factor Deductions */}
            {scoreData.breakdown && (
              <div className="pt-2 border-t border-sky-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Factor Impact:</span>
                {scoreData.breakdown.precipitation_penalty > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                    Rain -{scoreData.breakdown.precipitation_penalty} pts
                  </span>
                )}
                {scoreData.breakdown.aqi_penalty > 0 && (
                  <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                    AQI -{scoreData.breakdown.aqi_penalty} pts
                  </span>
                )}
                {scoreData.breakdown.wind_penalty > 0 && (
                  <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                    Wind -{scoreData.breakdown.wind_penalty} pts
                  </span>
                )}
                {scoreData.breakdown.uv_penalty > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                    UV -{scoreData.breakdown.uv_penalty} pts
                  </span>
                )}
                {score >= 80 &&
                  (scoreData.breakdown.precipitation_penalty === 0 &&
                    scoreData.breakdown.aqi_penalty === 0 &&
                    scoreData.breakdown.wind_penalty === 0 &&
                    scoreData.breakdown.uv_penalty === 0) && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ All environmental factors optimal for daily routine
                  </span>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
