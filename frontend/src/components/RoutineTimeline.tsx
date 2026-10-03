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

import { evaluateWateringWindow, normalizeWateringSchedule } from '../lib/agronomyEngine';

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
  const rawImpacts = intelligence.routine_impacts || [];
  const hourly = weather.hourly || [];
  const curr = weather.current;

  const primaryPersonaId = activePersonaId || (context.interests && context.interests[0]) || 'commute';
  const personaCfg = getPersonaConfig(primaryPersonaId, language);
  const roleDetails = context.role_details;

  // Generate persona-tailored routine items if in specialized roles like Krishi/Gardening
  const impacts: RoutineWeatherImpact[] = React.useMemo(() => {
    if (primaryPersonaId === 'gardening') {
      const wateringSchedule = roleDetails?.gardening?.watering_schedule || 'Early Morning';
      const normWatering = normalizeWateringSchedule(wateringSchedule);
      const wateringEval = evaluateWateringWindow(wateringSchedule, hourly, curr);

      const items: RoutineWeatherImpact[] = [
        {
          event_id: 'g-inspect',
          event_title: 'Field Inspection & Soil Monitoring',
          time_window: '06:00 - 08:00',
          is_outdoor: true,
          risk_level: curr.precipitation_probability >= 60 ? 'amber' : 'green',
          impact_title: curr.precipitation_probability >= 60 ? 'Wet Field Conditions' : 'Optimal Field Scouting',
          impact_details: `Morning temperature ${hourly[6]?.temperature ?? 24}°C with ${curr.humidity}% humidity.`,
          proactive_action: 'Inspect crop leaf undersides for pests and check ground moisture levels.',
        },
      ];

      // Watering slot specifically driven by selected watering schedule
      if (normWatering === 'Afternoon') {
        items.push({
          event_id: 'g-water-noon',
          event_title: 'Afternoon Crop Irrigation Slot',
          time_window: '12:00 - 16:00',
          is_outdoor: true,
          risk_level: wateringEval.status === 'Avoid' ? 'amber' : wateringEval.status === 'Caution' ? 'yellow' : 'green',
          impact_title: wateringEval.status === 'Avoid'
            ? (wateringEval.metrics.maxRainProb >= 50 ? `Rain Expected (${wateringEval.metrics.maxRainProb}%) — Hold Irrigation` : `Midday Evaporation & Heat Stress (${wateringEval.metrics.maxTemp}°C, UV ${wateringEval.metrics.maxUV})`)
            : wateringEval.status === 'Caution'
            ? `Moderate Evaporation Loss (${wateringEval.metrics.maxTemp}°C)`
            : 'Favorable Overcast Afternoon Irrigation',
          impact_details: wateringEval.reason,
          proactive_action: wateringEval.action,
        });
      } else if (normWatering === 'Late Evening') {
        items.push({
          event_id: 'g-water-eve',
          event_title: 'Late Evening Root Irrigation Slot',
          time_window: '17:00 - 20:00',
          is_outdoor: true,
          risk_level: wateringEval.status === 'Avoid' ? 'amber' : 'green',
          impact_title: wateringEval.status === 'Avoid' ? 'Rain Expected — Hold Irrigation' : 'Cool Sunset Soil Irrigation',
          impact_details: wateringEval.reason,
          proactive_action: wateringEval.action,
        });
      } else if (normWatering === 'Twice Daily') {
        items.push({
          event_id: 'g-water-am',
          event_title: 'Morning Split Irrigation Slot',
          time_window: '06:00 - 08:00',
          is_outdoor: true,
          risk_level: 'green',
          impact_title: 'Deep Root Zone Irrigation',
          impact_details: 'Cool morning soil absorbs water efficiently before sun rises.',
          proactive_action: 'Deliver 60% of daily irrigation quota to crop root base.',
        });
        items.push({
          event_id: 'g-water-pm',
          event_title: 'Evening Split Top-Up Slot',
          time_window: '17:00 - 19:00',
          is_outdoor: true,
          risk_level: curr.precipitation_probability >= 50 ? 'amber' : 'green',
          impact_title: curr.precipitation_probability >= 50 ? 'Rain Expected — Hold PM Slot' : 'Evening Hydration Top-Up',
          impact_details: 'Replenishes midday transpiration loss under gentle evening conditions.',
          proactive_action: 'Perform light soil top-up; avoid wetting leaf foliage.',
        });
      } else {
        items.push({
          event_id: 'g-water-morn',
          event_title: 'Early Morning Deep Irrigation Window',
          time_window: '05:00 - 08:00',
          is_outdoor: true,
          risk_level: wateringEval.status === 'Avoid' ? 'amber' : 'green',
          impact_title: wateringEval.status === 'Avoid' ? 'Rain Expected — Hold Irrigation' : 'Prime Agromet Watering Window',
          impact_details: wateringEval.reason,
          proactive_action: wateringEval.action,
        });
      }

      // Spraying window
      const isHighWind = curr.wind_speed >= 18;
      const isRainy = curr.precipitation_probability >= 40;
      items.push({
        event_id: 'g-spray',
        event_title: 'Crop Spraying & Foliar Treatment Window',
        time_window: '08:00 - 10:30',
        is_outdoor: true,
        risk_level: (isHighWind || isRainy) ? 'amber' : 'green',
        impact_title: isHighWind ? `High Wind Spray Drift (${curr.wind_speed} km/h)` : isRainy ? `Rain Wash-Off Hazard (${curr.precipitation_probability}%)` : 'Safe Spraying Window',
        impact_details: (isHighWind || isRainy) ? 'Adverse weather compromises pesticide adherence and heightens chemical drift risk.' : 'Winds below 15 km/h ensure uniform droplet deposition across crop foliage.',
        proactive_action: (isHighWind || isRainy) ? 'Postpone foliar applications until winds calm below 15 km/h and rain clears.' : 'Proceed with scheduled organic / chemical pest protection.',
      });

      // Harvesting window
      items.push({
        event_id: 'g-harvest',
        event_title: 'Produce Harvesting & Field Sorting',
        time_window: '16:00 - 18:30',
        is_outdoor: true,
        risk_level: curr.precipitation_probability >= 50 ? 'amber' : 'green',
        impact_title: curr.precipitation_probability >= 50 ? 'Rain Spoilage Risk' : 'Dry Harvest Conditions',
        impact_details: curr.precipitation_probability >= 50 ? 'Excessive moisture during harvest induces post-harvest fungal decay.' : 'Mild late-afternoon conditions preserve produce freshness.',
        proactive_action: curr.precipitation_probability >= 50 ? 'Delay harvesting vulnerable crops until field surfaces dry.' : 'Harvest ripe produce and store in shaded, aerated crates.',
      });

      return items;
    }

    if (rawImpacts.length > 0) return rawImpacts;

    return [
      {
        event_id: 'ev-default-1',
        event_title: 'Morning Routine & Outdoor Activity',
        time_window: '06:30 - 08:30',
        is_outdoor: true,
        risk_level: 'green',
        impact_title: 'Optimal Outdoor Window',
        impact_details: `Pleasant morning temperature (${curr.temperature}°C) and light winds (${curr.wind_speed} km/h).`,
        proactive_action: 'Proceed with scheduled outdoor activity.',
      },
      {
        event_id: 'ev-default-2',
        event_title: 'Evening Transit & Commute Window',
        time_window: '17:00 - 19:30',
        is_outdoor: true,
        risk_level: curr.precipitation_probability >= 50 ? 'amber' : 'green',
        impact_title: curr.precipitation_probability >= 50 ? 'Passing Rain Showers Likely' : 'Clear Commute Corridor',
        impact_details: `Rain probability ${curr.precipitation_probability}% over ${weather.location.name}.`,
        proactive_action: curr.precipitation_probability >= 50 ? 'Keep compact umbrella handy.' : 'Smooth transit conditions.',
      },
    ];
  }, [primaryPersonaId, roleDetails, hourly, curr, rawImpacts, weather.location.name]);

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
      <div className="w-full overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory">
        <div className="flex items-center gap-2 min-w-[720px] px-0.5">
          {hourly.slice(0, 16).map((h, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[65px] p-2 rounded-xl text-center border transition snap-start ${
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
