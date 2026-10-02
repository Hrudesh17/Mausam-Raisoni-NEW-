'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  SlidersHorizontal,
  Briefcase,
  Activity,
  CalendarDays,
  Compass,
  Users,
  Sprout,
  Waves,
  HeartPulse,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ShieldCheck,
  Eye,
  Wind,
  Thermometer,
  CloudRain
} from 'lucide-react';
import { 
  WeatherResponse, 
  IntelligenceSummary, 
  UserContext 
} from '../lib/types';
import { getPersonaConfig } from '../lib/personaConfig';
import { MausamScoreCard } from './MausamScoreCard';
import { ShouldIEngine } from './ShouldIEngine';
import { RoutineTimeline } from './RoutineTimeline';
import { DomainTabs } from './DomainTabs';
import { AllergyOutlookCard } from './AllergyOutlookCard';
import { EventPlannerCard } from './EventPlannerCard';
import { VisibilityCard } from './VisibilityCard';

import { TravelIntelligenceCard } from './TravelIntelligenceCard';
import { FitnessIntelligenceCard } from './FitnessIntelligenceCard';
import { FamilyIntelligenceCard } from './FamilyIntelligenceCard';
import { KrishiIntelligenceCard } from './KrishiIntelligenceCard';
import { BeachIntelligenceCard } from './BeachIntelligenceCard';
import { HealthIntelligenceCard } from './HealthIntelligenceCard';
import { EventPlannerIntelligenceCard } from './EventPlannerIntelligenceCard';
import { DetailedUVGraph } from './DetailedUVGraph';
import { DetailedColorCodedGraphs } from './DetailedColorCodedGraphs';
import { useLanguage } from '../hooks/useLanguage';

interface VayuSyncPersonalizedProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
  onOpenPersonalizeModal: () => void;
  onOpenAssistant?: () => void;
}

export const VayuSyncPersonalized: React.FC<VayuSyncPersonalizedProps> = ({
  weather,
  intelligence,
  context,
  onOpenPersonalizeModal,
  onOpenAssistant,
}) => {
  const { t } = useLanguage();
  const conflicts = intelligence.calendar_conflicts || [];
  const interests = context.interests || ['commute'];
  const roleDetails = context.role_details;

  // Active persona selection state
  const [activePersonaId, setActivePersonaId] = useState<string>(interests[0] || 'commute');
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  // Sync activePersonaId if interests change
  useEffect(() => {
    if (interests.length > 0 && !interests.includes(activePersonaId)) {
      setActivePersonaId(interests[0]);
    }
  }, [interests, activePersonaId]);

  const getLocalizedRoleTitle = (id: string) => {
    switch (id) {
      case 'commute': return t.role_commute_title || personaCfg.title;
      case 'running': return t.role_running_title || personaCfg.title;
      case 'travel': return t.role_travel_title || personaCfg.title;
      case 'family': return t.role_family_title || personaCfg.title;
      case 'gardening': return t.role_gardening_title || personaCfg.title;
      case 'beach': return t.role_beach_title || personaCfg.title;
      case 'health': return t.role_health_title || personaCfg.title;
      case 'event_planning': return t.role_event_planning_title || personaCfg.title;
      default: return personaCfg.title;
    }
  };

  const getLocalizedRoleSubtitle = (id: string) => {
    switch (id) {
      case 'commute': return t.role_commute_desc || personaCfg.subtitle;
      case 'running': return t.role_running_desc || personaCfg.subtitle;
      case 'travel': return t.role_travel_desc || personaCfg.subtitle;
      case 'family': return t.role_family_desc || personaCfg.subtitle;
      case 'gardening': return t.role_gardening_desc || personaCfg.subtitle;
      case 'beach': return t.role_beach_desc || personaCfg.subtitle;
      case 'health': return t.role_health_desc || personaCfg.subtitle;
      case 'event_planning': return t.role_event_planning_desc || personaCfg.subtitle;
      default: return personaCfg.subtitle;
    }
  };

  const getLocalizedShortTitle = (id: string, defaultShort: string) => {
    switch (id) {
      case 'commute': return t.role_commuter || defaultShort;
      case 'running': return t.role_athlete || defaultShort;
      case 'travel': return t.role_traveler || defaultShort;
      case 'family': return t.role_family_title || defaultShort;
      case 'gardening': return t.role_gardening_title || defaultShort;
      case 'beach': return t.role_beach_title || defaultShort;
      case 'health': return t.role_health_title || defaultShort;
      case 'event_planning': return t.role_event_planner || defaultShort;
      default: return defaultShort;
    }
  };

  // Shared Cross-Persona Priority Alert calculation
  const sharedCrossPersonaAlert = React.useMemo(() => {
    if (interests.length < 2) return null;
    const rain = weather.current.precipitation_probability;
    const aqi = weather.current.aqi;
    const uv = weather.current.uv_index;

    if (rain >= 40) {
      return `Precipitation risk (${rain}%) over ${weather.location.name} affects both your ${getPersonaConfig(interests[0]).shortTitle} and ${getPersonaConfig(interests[1]).shortTitle} routines today.`;
    }
    if (aqi >= 100) {
      return `Elevated Air Quality Index (AQI ${aqi}) impacts your active outdoor roles. Limit prolonged outdoor exertion.`;
    }
    if (uv >= 6) {
      return `High UV solar radiation index (${uv}) affects outdoor plans across your selected active personas. Sun protection advised.`;
    }
    return null;
  }, [interests, weather]);

  // Displayed roles (ordered with activePersonaId prioritized, scoped strictly to user interests)
  const displayRoles = React.useMemo(() => {
    if (interests.length === 0) return ['commute'];
    if (!interests.includes(activePersonaId)) return interests;
    const otherRoles = interests.filter(r => r !== activePersonaId);
    return [activePersonaId, ...otherRoles];
  }, [interests, activePersonaId]);

  const personaCfg = getPersonaConfig(activePersonaId);
  const PersonaIcon = personaCfg.icon;

  // Helper context detail text
  const getContextDetailText = (id: string): string => {
    switch (id) {
      case 'travel':
        return roleDetails?.travel?.frequent_destination 
          ? `Route: ${roleDetails.travel.frequent_destination} (${roleDetails.travel.travel_type || 'Highway'})` 
          : `Travel Corridor: ${weather.location.name} Region`;

      case 'running':
        return `${roleDetails?.running?.time_of_day || 'Morning'} Run at ${roleDetails?.running?.running_time || '06:00 AM'}`;
      case 'gardening':
        return `Crops: ${roleDetails?.gardening?.crop_type || 'Vegetables & Herbs'} (${roleDetails?.gardening?.watering_schedule || 'Early Morning'})`;
      case 'health':
        return `Condition: ${roleDetails?.health?.primary_condition || 'AQI & Pollen Sensitivity'}`;
      case 'event_planning':
        return `${context.calendar_events?.length || 0} scheduled outdoor event(s)`;
      case 'family':
        return `${roleDetails?.family?.children_age_group || 'Young Children'} • Play: ${roleDetails?.family?.outdoor_play_time || 'Evening'}`;
      case 'beach':
        return `${roleDetails?.beach?.activity_type || 'Coastal Activity'} (${roleDetails?.beach?.preferred_timing || 'Sunrise'})`;
      default:
        return `Personalized for ${weather.location.name}`;
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* ── 1. PERSONA HEADER (NO TECHNICAL WEIGHTING STRINGS) ──────────────── */}
      <div className="p-5 rounded-3xl glass-panel border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Persona Identity Title & Context */}
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl ${personaCfg.themeColor.bg} ${personaCfg.themeColor.text} border ${personaCfg.themeColor.border} shrink-0 shadow-sm`}>
              <PersonaIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {t.pers_dashboard_tag}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • {interests.length} {t.pers_dashboard_roles}
                </span>
              </div>

              <h2 className="text-2xl font-heading font-bold text-[#0B1F33] dark:text-white tracking-tight">
                {getLocalizedRoleTitle(activePersonaId)}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {getLocalizedRoleSubtitle(activePersonaId)}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400 font-medium pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{getContextDetailText(activePersonaId)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Voice Assistant & Edit Preferences */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-extrabold shadow-sm shadow-amber-500/20 transition text-xs"
              >
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>{t.pers_dashboard_voice_btn}</span>
              </button>
            )}
            <button
              onClick={onOpenPersonalizeModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-xs transition text-xs font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t.pers_dashboard_edit_btn}</span>
            </button>
          </div>
        </div>

        {/* Multi-Persona Switcher Tabs (If multiple roles selected) */}
        {interests.length > 1 && (
          <div className="pt-2 border-t border-sky-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {t.pers_dashboard_switch_persona}:
            </span>
            {interests.map((roleId) => {
              const rCfg = getPersonaConfig(roleId);
              const RIcon = rCfg.icon;
              const isActive = activePersonaId === roleId;
              return (
                <button
                  key={roleId}
                  onClick={() => setActivePersonaId(roleId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ease-out border ${
                    isActive
                      ? `${rCfg.themeColor.bg} ${rCfg.themeColor.text} ${rCfg.themeColor.border} ring-1 ring-sky-400 shadow-sm scale-[1.02]`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 shadow-xs hover:scale-[1.02]'
                  }`}
                >
                  <RIcon className="w-3.5 h-3.5" />
                  <span>{getLocalizedShortTitle(roleId, rCfg.shortTitle)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. CALENDAR WEATHER CONFLICT DETECTOR (ONLY IF CONFLICTS EXIST) ─── */}
      {conflicts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t.pers_dashboard_calendar_conflict}</span>
            </div>
            <span className="text-xs font-mono text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              {t.pers_dashboard_schedule_risk_high}
            </span>
          </div>

          <div className="space-y-2">
            {conflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-100 dark:border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {c.event_title} ({c.scheduled_time})
                  </h4>
                  <p className="text-amber-900 dark:text-amber-300 mt-0.5">{c.conflict_summary}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 shrink-0 sm:max-w-xs flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-snug">
                    <strong className="text-sky-800 dark:text-sky-300">VayuSync Advice: </strong>
                    {c.suggested_action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. TWO-COLUMN SPLIT DASHBOARD LAYOUT (Reduces scrolling time by 50%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Role-Specific Intelligence, Alerts & Decision Engine */}
        <div className="space-y-6">
          
          {/* Cross-Persona Priority Alert Banner (If 2+ roles selected) */}
          {interests.length > 1 && sharedCrossPersonaAlert && (
            <div className="p-4 sm:p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-200 text-xs flex items-start gap-3.5 shadow-sm">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0B1F33] dark:text-white font-heading font-bold text-sm block tracking-wide">VayuSync Cross-Persona Priority Insight</strong>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">{sharedCrossPersonaAlert}</p>
              </div>
            </div>
          )}

          {/* Active Persona Intelligence Card (Cleanly balanced for each selected role) */}
          {(() => {
            switch (activePersonaId) {
              case 'travel':
                return <TravelIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'running':
                return <FitnessIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'family':
                return <FamilyIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'gardening':
                return <KrishiIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'beach':
                return <BeachIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'health':
                return <HealthIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              case 'event_planning':
                return <EventPlannerIntelligenceCard key={activePersonaId} weather={weather} intelligence={intelligence} context={context} />;
              default:
                return null;
            }
          })()}

          {/* Persona-Specific Decision Engine (Should-I?) */}
          <ShouldIEngine
            weather={weather}
            context={context}
            activePersonaId={activePersonaId}
          />
        </div>

        {/* RIGHT COLUMN: Environmental Scoring & Routine Timeline */}
        <div className="space-y-6">
          {/* Hero Mausam Score Card */}
          <MausamScoreCard
            weather={weather}
            intelligence={intelligence}
            context={context}
          />

          {/* Persona-Aware Routine Timeline ("Your Routine in Weather") */}
          <RoutineTimeline
            weather={weather}
            intelligence={intelligence}
            context={context}
            activePersonaId={activePersonaId}
          />
        </div>

      </div>

      {/* ── 7. EXPLORE DETAILED METEOROLOGICAL ANALYTICS (EXPANDABLE DECK) ─── */}
      <div className="rounded-3xl glass-panel border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
          className="w-full p-4 sm:p-5 bg-white dark:bg-slate-900 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F33] dark:text-white flex items-center gap-2">
                Explore Detailed Meteorological Data & Analytics
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Full Telemetry
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                24h UV curves, multi-metric color-coded graphs, and domain decks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            <span>{showDetailedAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
            {showDetailedAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDetailedAnalytics && (
          <div className="p-4 sm:p-6 space-y-6 border-t border-sky-100 dark:border-slate-800 bg-sky-50/20 dark:bg-slate-950/40 animate-in fade-in">
            {/* 24h UV Index Analytics */}
            <DetailedUVGraph
              hourly={weather.hourly || []}
              currentUV={weather.current.uv_index || 0}
            />

            {/* Detailed Multi-Metric Color-Coded Curves */}
            <DetailedColorCodedGraphs
              hourly={weather.hourly || []}
            />

            {/* Deep Dive Domain Decks */}
            <DomainTabs
              weather={weather}
              intelligence={intelligence}
              context={context}
            />
          </div>
        )}
      </div>

    </div>
  );
};
