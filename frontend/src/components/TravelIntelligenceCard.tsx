'use client';

import React from 'react';
import { 
  Globe, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Compass,
  Sun
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedWeatherCondition } from '../lib/weatherConditions';

interface TravelIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const TravelIntelligenceCard: React.FC<TravelIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const roleDetails = context.role_details?.travel;
  const visIntel = intelligence.visibility_intel;

  // Real available context
  const route = roleDetails?.frequent_destination;
  const travelType = roleDetails?.travel_type;

  // Real weather metrics
  const visibilityKm = curr.visibility;
  const rainProb = curr.precipitation_probability;
  const windSpeed = curr.wind_speed;
  const temp = curr.temperature;
  const feelsLike = curr.feels_like;
  const condition = getLocalizedWeatherCondition(curr.condition_text, language);
  const isVisAvailable = curr.visibility_available !== false && visibilityKm !== undefined && visibilityKm !== null;

  // Dynamic calculation for Status Badge
  const statusLevel = React.useMemo(() => {
    if (rainProb > 60 || (isVisAvailable && visibilityKm < 3) || windSpeed > 40) {
      return 'risk';
    }
    if (rainProb > 30 || (isVisAvailable && visibilityKm < 6) || windSpeed > 25) {
      return 'caution';
    }
    return 'favorable';
  }, [rainProb, isVisAvailable, visibilityKm, windSpeed]);

  // Dynamic travel advisory generated strictly from actual weather data
  const travelAdvisory = React.useMemo(() => {
    if (visIntel?.traveler_advisory) {
      return visIntel.traveler_advisory;
    }
    const visStr = isVisAvailable ? `${visibilityKm.toFixed(1)} km` : t.travel_sightline_clear;
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `स्पष्ट दृश्यता (${visStr}) और कम बारिश जोखिम (${rainProb}%) के साथ ${loc.name} में राजमार्ग यात्रा अनुकूल है।`;
      if (language === 'mr') return `स्पष्ट दृश्यमानता (${visStr}) आणि पावसाची कमी शक्यता (${rainProb}%) असल्याने ${loc.name} मध्ये महामार्गावर प्रवास सुरक्षित आहे.`;
      if (language === 'bn') return `স্পষ্ট দৃশ্যমানতা (${visStr}) এবং বৃষ্টির কম ঝুঁকি (${rainProb}%) নিয়ে ${loc.name} অঞ্চলে হাইওয়ে ভ্রমণ অনুকূল।`;
      if (language === 'te') return `స్పష్టమైన దృశ్యమానత (${visStr}) మరియు తక్కువ వర్షపు ముప్పుతో (${rainProb}%) ${loc.name} లో హైవే ప్రయాణానికి పరిస్థితులు అనుకూలంగా ఉన్నాయి.`;
      return `Clear visibility (${visStr}) and low precipitation risk (${rainProb}%) currently support normal highway travel over ${loc.name}.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `बारिश का जोखिम (${rainProb}%) और सतही हवाएं (${windSpeed} किमी/घंटा)। ${loc.name} के राजमार्गों पर गति नियंत्रित रखें।`;
      if (language === 'mr') return `पावसाचा धोका (${rainProb}%) आणि वारे (${windSpeed} किमी/तास). ${loc.name} च्या महामार्गांवर सावधपणे वाहन चालवा.`;
      if (language === 'bn') return `বৃষ্টির ঝুঁকি (${rainProb}%) এবং বাতাসের গতি (${windSpeed} কিমি/ঘণ্টা)। ${loc.name} হাইওয়েতে সাবধানে গাড়ি চালান।`;
      if (language === 'te') return `వర్షపు సూచన (${rainProb}%) మరియు గాలి వేగం (${windSpeed} కి.మీ/గం). ${loc.name} హైవేపై వాహనాన్ని అదుపులో ఉంచుకోండి.`;
      return `Rain risk (${rainProb}%) and surface wind speed (${windSpeed} km/h) over ${loc.name} suggest driving with caution. Maintain safe follow distances on highway corridors.`;
    }
    if (language === 'hi') return `बारिश और कम दृश्यता (${visStr}) के कारण ${loc.name} में यात्रा प्रभावित हो सकती है। प्रस्थान से पहले जांच लें।`;
    if (language === 'mr') return `पाऊस आणि कमी दृश्यमानतेमुळे (${visStr}) ${loc.name} मधील प्रवासात अडथळा येऊ शकतो. निघण्यापूर्वी खात्री करा.`;
    if (language === 'bn') return `বৃষ্টি ও হ্রাসপ্রাপ্ত দৃশ্যমানতার কারণে (${visStr}) ${loc.name} অঞ্চলে যাত্রা বিলম্বিত হতে পারে।`;
    if (language === 'te') return `వర్షం మరియు తగ్గిన దృశ్యమానత వలన (${visStr}) ${loc.name} లో ప్రయాణం ఆలస్యం కావచ్చు. ప్రయాణానికి ముందు సమాచారం తెలుసుకోండి.`;
    return `Rain and reduced visibility (${visStr}) may affect highway travel over ${loc.name}. Consider checking conditions before departure.`;
  }, [visIntel, statusLevel, rainProb, isVisAvailable, visibilityKm, windSpeed, loc.name, language, t]);

  // Visibility status text
  const getVisStatusText = (km: number) => {
    if (km >= 10) return t.travel_vis_status_excellent;
    if (km >= 6) return t.travel_vis_status_good;
    if (km >= 3) return t.travel_vis_status_moderate;
    return t.travel_vis_status_hazard;
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-sky-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 shrink-0 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                {t.travel_role_badge}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Travel</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.travel_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.travel_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.travel_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.travel_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.travel_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW (Route / Location state) ─────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        {route ? (
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">{t.travel_route}</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{route}</strong>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">{t.travel_location}</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
          </div>
        )}

        {travelType && (
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">{t.travel_mode}</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{travelType}</strong>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_rain}:</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{condition}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY TRAVEL METRICS (3-Column Grid) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Travel / Highway Visibility */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.travel_highway_vis_title}</span>
            <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isVisAvailable ? `${visibilityKm.toFixed(1)} km` : 'N/A'}
            </span>
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
              {isVisAvailable ? getVisStatusText(visibilityKm) : t.health_pollen_unavailable}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.travel_sightline_monitored}
          </p>
        </div>

        {/* Metric 2: Rain / Precipitation Risk */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.travel_rain_risk_title}</span>
            <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {rainProb}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {rainProb < 20 ? t.travel_rain_low : rainProb < 50 ? t.travel_rain_moderate : t.travel_rain_high}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.commute_delay_desc}
          </p>
        </div>

        {/* Metric 3: Wind Conditions */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.travel_crosswind_title}</span>
            <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {windSpeed} km/h
            </span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {windSpeed < 15 ? t.travel_crosswind_calm : windSpeed < 30 ? t.travel_crosswind_breezy : t.travel_crosswind_strong}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.krishi_wind_desc}
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR (Temperature, Weather Impact & Outlook) ─── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_temp}:</span>
          <strong className="text-slate-900 dark:text-white">{temp}°C <span className="text-slate-500 dark:text-slate-400 text-[10px] font-normal">({t.metric_feels_like} {feelsLike}°C)</span></strong>
        </div>

        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_uv_title}:</span>
          <strong className="text-slate-900 dark:text-white">{curr.uv_index}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.vis_trend}:</span>
          <strong className="text-cyan-700 dark:text-cyan-400 truncate">{visIntel?.trend || t.vis_trend_stable}</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.commute_safety_index}:</span>
          <strong className="text-slate-900 dark:text-white truncate">{statusLevel === 'favorable' ? t.status_ideal : statusLevel === 'caution' ? t.status_moderate : t.status_caution}</strong>
        </div>
      </div>

      {/* ── 5. TRAVEL ADVISORY (Concise Personalized Interpretation) ───────── */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        statusLevel === 'favorable' 
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200' 
          : statusLevel === 'caution'
          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
      }`}>
        <div className="flex items-start gap-3">
          {statusLevel === 'favorable' && <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
          {statusLevel === 'caution' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
          {statusLevel === 'risk' && <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
          
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {statusLevel === 'favorable' && `🟢 ${t.travel_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.travel_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.travel_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {travelAdvisory}
            </p>
          </div>
        </div>

        {/* Tip / Advisory Callout */}
        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-cyan-700 dark:text-cyan-400 font-semibold block text-[11px]">{t.travel_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            {visIntel?.traveler_advisory || t.travel_guidance_box_desc}
          </span>
        </div>
      </div>

    </div>
  );
};
