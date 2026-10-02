'use client';

import React from 'react';
import { 
  HeartPulse, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  Thermometer, 
  Droplets,
  Sprout
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface HealthIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const HealthIntelligenceCard: React.FC<HealthIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const healthIntel = intelligence.health;
  const allergyIntel = intelligence.allergy_outlook;
  const roleDetails = context.role_details?.health;

  const primaryCondition = roleDetails?.primary_condition || 'AQI & Pollen Sensitivity';

  const aqi = curr.aqi;
  const aqiCategory = curr.aqi_category || (aqi <= 50 ? t.status_good : aqi <= 100 ? t.status_moderate : t.status_poor);
  const uv = curr.uv_index;
  const temp = curr.temperature;
  const feelsLike = curr.feels_like;
  const humidity = curr.humidity;
  const pollenData = allergyIntel?.pollen;
  const isPollenAvailable = pollenData?.available === true;

  // Dynamic Status
  const statusLevel = React.useMemo(() => {
    if (aqi > 150 || uv > 8 || feelsLike > 38) return 'risk';
    if (aqi > 100 || uv > 5 || feelsLike > 32) return 'caution';
    return 'favorable';
  }, [aqi, uv, feelsLike]);

  // Dynamic Advisory
  const healthAdvisory = React.useMemo(() => {
    if (allergyIntel?.vayusync_guidance) {
      return allergyIntel.vayusync_guidance;
    }
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `${loc.name} में अनुकूल वायु गुणवत्ता (AQI ${aqi}) और मध्यम यूवी (${uv}) संवेदनशील समूहों के लिए सुरक्षित बाहरी गतिविधियों का समर्थन करते हैं।`;
      if (language === 'mr') return `${loc.name} मध्ये उत्तम हवेची गुणवत्ता (AQI ${aqi}) आणि मध्यम अतिनील किरणे (${uv}) संवेदनशील घटकांसाठी सुरक्षित आहेत.`;
      if (language === 'bn') return `${loc.name} অঞ্চলে অনুকূল বায়ুর মান (AQI ${aqi}) এবং স্বাভাবিক ইউভি সূচক (${uv}) সংবেদনশীল ব্যক্তিদের জন্য নিরাপদ।`;
      if (language === 'te') return `${loc.name} లో మంచి గాలి నాణ్యత (AQI ${aqi}) మరియు మోస్తరు UV (${uv}) సున్నిత వ్యక్తులకు సురక్షితమైన పరిస్థితులను కల్పిస్తున్నాయి.`;
      return `Good ambient air quality (AQI ${aqi}) and moderate UV (${uv}) support safe outdoor exposure for sensitive groups over ${loc.name}.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `${loc.name} में बढ़ा हुआ AQI (${aqi}) या यूवी सूचकांक (${uv}) दर्ज। संवेदनशील व्यक्तियों को चरम घंटों में बाहरी व्यायाम सीमित रखना चाहिए।`;
      if (language === 'mr') return `${loc.name} मध्ये हवेचा निर्देशांक (${aqi}) किंवा अतिनील किरणे (${uv}) वाढली आहेत. दुपारच्या वेळी बाहेर जाणे टाळावे.`;
      if (language === 'bn') return `${loc.name} অঞ্চলে উচ্চ AQI (${aqi}) বা ইউভি মাত্রা (${uv}) রিপোর্ট করা হয়েছে। সংবেদনশীল ব্যক্তিদের সতর্ক থাকার পরামর্শ দেওয়া হচ্ছে।`;
      if (language === 'te') return `${loc.name} లో AQI (${aqi}) లేదా UV స్థాయి (${uv}) పెరిగింది. సున్నిత వ్యక్తులు రద్దీ వేళల్లో బయట తిరగడం తగ్గించాలి.`;
      return `Elevated AQI (${aqi}) or UV index (${uv}) reported over ${loc.name}. Sensitive individuals should limit prolonged outdoor exertion during peak hours.`;
    }
    if (language === 'hi') return `उच्च पर्यावरणीय जोखिम (AQI ${aqi}, PM सांद्रता अधिक)। संवेदनशील व्यक्तियों को घर के अंदर रहना चाहिए या N95 मास्क पहनना चाहिए।`;
    if (language === 'mr') return `अति उच्च पर्यावरणीय जोखीम (AQI ${aqi}). संवेदनशील नागरिकांनी घरातच राहावे किंवा N95 मास्कचा वापर करावा.`;
    if (language === 'bn') return `উচ্চ পরিবেশগত ঝুঁকি (AQI ${aqi})। সংবেদনশীল ব্যক্তিদের ঘরের ভেতরে থাকা বা N95 মাস্ক ব্যবহারের পরামর্শ দেওয়া হচ্ছে।`;
    if (language === 'te') return `అధిక పర్యావరణ ముప్పు (AQI ${aqi}). సున్నిత వ్యక్తులు ఇంట్లోనే ఉండటం లేదా N95 మాస్క్ ధరించడం మంచిది.`;
    return `High environmental exposure (AQI ${aqi}, PM concentration elevated). Sensitive groups should stay indoors or wear N95 protection.`;
  }, [allergyIntel, statusLevel, aqi, uv, loc.name, language]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-rose-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0 shadow-xs">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                {t.health_role_badge}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Health</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.health_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.health_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.health_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.health_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.health_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_location}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_sensitivity_focus}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{primaryCondition}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_hydration_target}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{healthIntel?.hydration_target_liters || 2.5} {t.health_liters}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Air Quality Index */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.health_aqi_title}</span>
            <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {aqi}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {aqiCategory}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {curr.pm2_5 ? `PM2.5: ${curr.pm2_5} µg/m³` : t.health_pm25_desc}
          </p>
        </div>

        {/* Metric 2: Solar UV Exposure */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.health_uv_title}</span>
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {uv}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {uv <= 2 ? t.health_uv_low : uv <= 5 ? t.health_uv_moderate : t.health_uv_high}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {healthIntel?.uv_safe_hours ? `${t.health_safe_window} ${healthIntel.uv_safe_hours}` : t.health_uv_desc}
          </p>
        </div>

        {/* Metric 3: Thermal & Heat Stress */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.health_heat_stress_title}</span>
            <Thermometer className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {feelsLike}°C
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
              {t.health_actual} {temp}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.health_apparent_desc} ({humidity}%)
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_mask_advice}</span>
          <strong className="text-slate-900 dark:text-white">{healthIntel?.mask_recommended ? t.health_mask_n95 : t.health_mask_none}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Sprout className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_pollen_count}</span>
          <strong className="text-slate-900 dark:text-white">{isPollenAvailable ? (pollenData?.status_text || 'Measured') : t.health_pollen_unavailable}</strong>
        </div>

        <div className="flex items-center gap-2">
          <HeartPulse className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_respiratory_risk}</span>
          <strong className="text-slate-900 dark:text-white">{healthIntel?.respiratory_risk ? String(healthIntel.respiratory_risk) : t.status_ideal}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_relative_humidity}</span>
          <strong className="text-slate-900 dark:text-white">{humidity}%</strong>
        </div>
      </div>

      {/* ── 5. VAYUSYNC ADVISORY BANNER ─────────────────────────────────────── */}
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
                {statusLevel === 'favorable' && `🟢 ${t.health_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.health_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.health_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {healthAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-rose-700 dark:text-rose-400 font-semibold block text-[11px]">{t.health_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.health_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
