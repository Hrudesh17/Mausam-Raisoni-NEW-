'use client';

import React from 'react';
import { Eye, EyeOff, Bike, Car, Truck, Footprints, Calendar, Navigation, Sprout, HeartPulse, Users, Waves } from 'lucide-react';
import { VisibilityIntelligence } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface VisibilityCardProps {
  visibilityIntel?: VisibilityIntelligence | null;
  currentVisibilityKm?: number;
  activePersonaId?: string;
  initialRole?: string;
}

export const VisibilityCard: React.FC<VisibilityCardProps> = ({
  visibilityIntel,
  currentVisibilityKm = 8.5,
  activePersonaId,
  initialRole = 'commute',
}) => {
  const { t } = useLanguage();
  const effectivePersona = activePersonaId || initialRole;

  const isAvailable = visibilityIntel?.is_available !== false;
  const visKm = visibilityIntel?.visibility_km ?? currentVisibilityKm;

  // Dynamic persona-specific visual identity, titles & advisories (No local tab switching)
  const personaConfig = React.useMemo(() => {
    switch (effectivePersona) {
      case 'travel':
      case 'traveler':
        return {
          title: t.vis_travel_title,
          subtitle: t.vis_travel_subtitle,
          icon: Truck,
          advisory:
            visibilityIntel?.traveler_advisory ||
            t.vis_travel_advisory,
        };
      case 'commute':
      case 'commuter':
        return {
          title: t.vis_commute_title,
          subtitle: t.vis_commute_subtitle,
          icon: Car,
          advisory:
            visibilityIntel?.commuter_advisory ||
            t.vis_commuter_advisory_adequate,
        };
      case 'delivery':
        return {
          title: t.vis_delivery_title,
          subtitle: t.vis_delivery_subtitle,
          icon: Bike,
          advisory:
            visibilityIntel?.delivery_advisory ||
            t.vis_delivery_advisory,
        };
      case 'running':
      case 'athlete':
      case 'fitness':
        return {
          title: t.vis_activity_title,
          subtitle: t.vis_activity_subtitle,
          icon: Footprints,
          advisory:
            visibilityIntel?.athlete_advisory ||
            t.vis_activity_advisory,
        };
      case 'event_planning':
      case 'event_planner':
      case 'event':
        return {
          title: t.vis_event_title,
          subtitle: t.vis_event_subtitle,
          icon: Calendar,
          advisory:
            visibilityIntel?.event_planner_advisory ||
            t.vis_event_advisory,
        };
      case 'gardening':
      case 'krishi':
        return {
          title: t.vis_agriculture_title,
          subtitle: t.vis_agriculture_subtitle,
          icon: Sprout,
          advisory: t.vis_agriculture_advisory,
        };
      case 'health':
        return {
          title: t.vis_health_title,
          subtitle: t.vis_health_subtitle,
          icon: HeartPulse,
          advisory: t.vis_health_advisory,
        };
      case 'family':
        return {
          title: t.vis_family_title,
          subtitle: t.vis_family_subtitle,
          icon: Users,
          advisory: t.vis_family_advisory,
        };
      case 'beach':
        return {
          title: t.vis_beach_title,
          subtitle: t.vis_beach_subtitle,
          icon: Waves,
          advisory: t.vis_beach_advisory,
        };
      default:
        return {
          title: t.vis_commute_title,
          subtitle: t.vis_commute_subtitle,
          icon: Car,
          advisory:
            visibilityIntel?.commuter_advisory ||
            t.vis_commuter_advisory_adequate,
        };
    }
  }, [effectivePersona, visibilityIntel, t]);

  const IconComponent = personaConfig.icon;

  const getVisibilityStatus = (km: number) => {
    if (km < 1.0) return { label: t.vis_status_hazardous, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800/50' };
    if (km < 3.0) return { label: t.vis_status_poor, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/50' };
    if (km < 6.0) return { label: t.vis_status_moderate, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/50' };
    if (km < 10.0) return { label: t.vis_status_good, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50' };
    return { label: t.vis_status_clear, color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800/50' };
  };

  const getTrendLabel = (trend?: string) => {
    const tr = (trend || 'Stable').toLowerCase();
    if (tr.includes('improv')) return t.vis_trend_improving;
    if (tr.includes('deteriorat') || tr.includes('wors')) return t.vis_trend_deteriorating;
    return t.vis_trend_stable;
  };

  const status = getVisibilityStatus(visKm);

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-sky-100 dark:border-slate-800 p-6 sm:p-7 text-slate-900 dark:text-white shadow-xs">
      {/* Header (Persona-Specific Title & Subtitle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 shadow-xs">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{personaConfig.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{personaConfig.subtitle}</p>
          </div>
        </div>

        {/* Real Visibility Telemetry Badge */}
        {isAvailable ? (
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 text-right shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
                {t.metric_visibility}
              </span>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xl font-black text-slate-900 dark:text-white">{visKm.toFixed(1)} km</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${status.bg} ${status.color} ${status.border}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span>{t.vis_unavailable_title}</span>
          </div>
        )}
      </div>

      {!isAvailable ? (
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          {t.vis_unavailable_desc}
        </div>
      ) : (
        <>
          {/* Active Role Advisory Card (No local role tabs selector) */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
                  <IconComponent className="w-4 h-4" />
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{personaConfig.title} {t.vis_advisory_suffix}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t.vis_trend}: <span className="text-slate-800 dark:text-slate-200 font-semibold">{getTrendLabel(visibilityIntel?.trend)}</span></span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-3 border-l-2 border-cyan-500 mt-2">
              {personaConfig.advisory}
            </p>
          </div>

          {/* Quick Visibility Range Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{t.vis_clear_sightline}</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{t.vis_optimum_range}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{t.vis_moderate_haze}</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">4.0 - 9.9 km</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{t.vis_thick_mist}</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">1.0 - 3.9 km</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{t.vis_dense_fog}</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">&lt; 1.0 km</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
