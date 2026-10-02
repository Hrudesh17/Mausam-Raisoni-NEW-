'use client';

import React from 'react';
import { 
  CalendarClock, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext, RoutineWeatherImpact } from '../lib/types';
import { getPersonaConfig } from '../lib/personaConfig';
import { useLanguage } from '../hooks/useLanguage';

interface RoutineTimelineProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
  activePersonaId?: string;
}

export const RoutineTimeline: React.FC<RoutineTimelineProps> = ({
  weather,
  intelligence,
  context,
  activePersonaId,
}) => {
  const { language, t } = useLanguage();
  const impacts = intelligence.routine_impacts || [];
  const hourly = weather.hourly || [];

  const primaryPersonaId = activePersonaId || (context.interests && context.interests[0]) || 'commute';
  const personaCfg = getPersonaConfig(primaryPersonaId, language);

  const getRiskBadge = (level: RoutineWeatherImpact['risk_level']) => {
    switch (level) {
      case 'red':
        return {
          border: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300',
          dot: 'bg-rose-500',
          badge: 'bg-rose-600 text-white shadow-xs',
          label: t.risk_critical_hazard,
        };
      case 'amber':
        return {
          border: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300',
          dot: 'bg-amber-500',
          badge: 'bg-amber-500 text-slate-900 shadow-xs',
          label: t.risk_moderate_impact,
        };
      case 'yellow':
        return {
          border: 'border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/70 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300',
          dot: 'bg-yellow-500',
          badge: 'bg-yellow-400 text-slate-900 shadow-xs',
          label: t.risk_precaution,
        };
      default:
        return {
          border: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          label: t.risk_optimal,
        };
    }
  };

  return (
    <section className="w-full rounded-2xl glass-panel p-5 sm:p-6 space-y-5 border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B1F33] dark:text-white flex items-center gap-2">
              {personaCfg.scheduleLabel}
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {t.routine_sync_badge}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {personaCfg.scheduleDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Quick Scroll Rail */}
      <div className="w-full overflow-x-auto pb-2 pt-1">
        <div className="flex items-center gap-2 min-w-[720px]">
          {hourly.slice(0, 16).map((h, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[65px] p-2 rounded-xl text-center border transition ${
                h.precipitation_probability > 50
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
              }`}
            >
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{h.time.split('T').pop()?.slice(0, 5) || `${h.hour}:00`}</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{Math.round(h.temperature)}°</p>
              
              {/* Rain Probability Bar */}
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${h.precipitation_probability > 50 ? 'bg-sky-500 dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'}`}
                  style={{ width: `${h.precipitation_probability}%` }}
                />
              </div>
              <p className={`text-[9px] mt-1 font-semibold ${h.precipitation_probability > 50 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {h.precipitation_probability}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Routine Impact Cards */}
      <div className="space-y-3">
        {impacts.map((imp) => {
          const style = getRiskBadge(imp.risk_level);
          return (
            <div
              key={imp.event_id}
              className={`p-3.5 sm:p-4 rounded-xl border ${style.border} transition flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {imp.time_window}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {imp.event_title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {imp.impact_details}
                </p>
              </div>

              {/* Proactive Action Pill */}
              <div className="shrink-0 sm:max-w-xs p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-sky-100 dark:border-slate-700 shadow-xs flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  <strong className="text-sky-700 dark:text-sky-400">
                    {language === 'bn' ? 'পদক্ষেপ: ' : language === 'te' ? 'చర్య: ' : language === 'mr' ? 'कृती: ' : language === 'hi' ? 'कार्रवाई: ' : 'Action: '}
                  </strong>
                  {imp.proactive_action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
