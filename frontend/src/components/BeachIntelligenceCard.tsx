'use client';

import React from 'react';
import { 
  Waves, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  Sun, 
  CloudRain, 
  Eye
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface BeachIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const BeachIntelligenceCard: React.FC<BeachIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const marine = weather.marine;
  const roleDetails = context.role_details?.beach;

  const activityType = roleDetails?.activity_type || t.opt_coastal_walk;
  const preferredTiming = roleDetails?.preferred_timing || t.opt_morning;

  const windSpeed = curr.wind_speed;
  const uv = curr.uv_index;
  const rainProb = curr.precipitation_probability;
  const visKm = curr.visibility;

  const hasMarineData = marine && marine.is_coastal;
  const waveHeight = marine?.wave_height_meters;
  const seaTemp = marine?.sea_surface_temp;
  const tideType = marine?.tide_type;

  // Dynamic Status
  const statusLevel = React.useMemo(() => {
    if (rainProb > 60 || windSpeed > 40 || (hasMarineData && (waveHeight || 0) > 2.5)) return 'risk';
    if (rainProb > 30 || windSpeed > 25 || (hasMarineData && (waveHeight || 0) > 1.5)) return 'caution';
    return 'favorable';
  }, [rainProb, windSpeed, hasMarineData, waveHeight]);

  // Dynamic Advisory
  const beachAdvisory = React.useMemo(() => {
    if (marine?.coastal_advisory) {
      return marine.coastal_advisory;
    }
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `शांत तटीय हवाएं (${windSpeed} किमी/घंटा) और कम बारिश जोखिम (${rainProb}%)। ${loc.name} में समुद्र तट और पानी की गतिविधियां अनुकूल हैं।`;
      if (language === 'mr') return `शांत सागरी वारे (${windSpeed} किमी/तास) आणि पावसाची कमी शक्यता (${rainProb}%). ${loc.name} मध्ये समुद्रकिनाऱ्यावर फिरण्यासाठी परिस्थिती उत्तम आहे.`;
      if (language === 'bn') return `উপকূলের শান্ত বাতাস (${windSpeed} কিমি/ঘণ্টা) এবং বৃষ্টির কম ঝুঁকি (${rainProb}%)। ${loc.name} সৈকত ভ্রমণের জন্য অনুকূল।`;
      if (language === 'te') return `ప్రశాంతమైన తీర గాలులు (${windSpeed} కి.మీ/గం) మరియు తక్కువ వర్షం ముప్పు (${rainProb}%). ${loc.name} లో బీచ్ సందర్శనకు అనుకూలం.`;
      return `Calm coastal winds (${windSpeed} km/h) and low rain risk (${rainProb}%) provide favorable beach and water conditions over ${loc.name}.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `मध्यम तटीय हवाएं (${windSpeed} किमी/घंटा) या यूवी सूचकांक (${uv})। ${loc.name} में तैरते समय सावधानी बरतें और धूप से बचें।`;
      if (language === 'mr') return `सागरी वारे (${windSpeed} किमी/तास) किंवा अतिनील किरणे (${uv}). ${loc.name} मध्ये समुद्रात उतरताना काळजी घ्या.`;
      if (language === 'bn') return `উপকূলীয় বাতাস (${windSpeed} কিমি/ঘণ্টা) বা ইউভি সূচক (${uv})। ${loc.name} সৈকতে সাঁতারের ক্ষেত্রে সতর্কতা অবলম্বন করুন।`;
      if (language === 'te') return `తీరప్రాంత గాలులు (${windSpeed} కి.మీ/గం) లేదా UV తీవ్రత (${uv}). ${loc.name} బీచ్‌లో ఈత కొట్టేటప్పుడు జాగ్రత్త పాటించండి.`;
      return `Moderate onshore winds (${windSpeed} km/h) or UV index (${uv}) over ${loc.name} require sun protection and swim caution.`;
    }
    if (language === 'hi') return `तेज तटीय हवाएं (${windSpeed} किमी/घंटा) या उच्च बारिश का खतरा (${rainProb}%)। ${loc.name} में गहरे पानी में जाने से बचें।`;
    if (language === 'mr') return `तीव्र वारे (${windSpeed} किमी/तास) आणि पावसाचा धोका (${rainProb}%). ${loc.name} मध्ये समुद्रात जाणे टाळा.`;
    if (language === 'bn') return `তীব্র উপকূলীয় বাতাস (${windSpeed} কিমি/ঘণ্টা) বা বৃষ্টির প্রবল ঝুঁকি (${rainProb}%)। ${loc.name} সৈকতে গভীর পানিতে নামা এড়িয়ে চলুন।`;
    if (language === 'te') return `తీవ్రమైన తీర గాలులు (${windSpeed} కి.మీ/గం) లేదా వర్షపు ముప్పు (${rainProb}%). లోతైన నీటిలోకి వెళ్లవద్దు.`;
    return `High coastal winds (${windSpeed} km/h) or elevated rain risk (${rainProb}%) reported over ${loc.name}. Avoid deep water activities today.`;
  }, [marine, statusLevel, windSpeed, rainProb, loc.name, uv, language]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-teal-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 shrink-0 shadow-xs">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                {t.beach_role_badge}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Beach</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.beach_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.beach_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.beach_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.beach_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.beach_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.beach_location}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.beach_coastal_focus}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{activityType}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.beach_preferred_timing}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{preferredTiming}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Wave & Swell Height */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.beach_wave_height_title}</span>
            <Waves className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {hasMarineData && waveHeight !== undefined ? `${waveHeight.toFixed(1)} m` : 'N/A'}
            </span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {hasMarineData && waveHeight !== undefined 
                ? (waveHeight < 1.2 ? t.beach_wave_calm : waveHeight < 2.0 ? t.beach_wave_moderate : t.beach_wave_rough) 
                : t.health_pollen_unavailable}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {hasMarineData ? t.beach_subtitle : t.vis_unavailable_desc}
          </p>
        </div>

        {/* Metric 2: Coastal Wind Velocity */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.beach_coastal_wind_title}</span>
            <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {windSpeed} km/h
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {windSpeed < 15 ? t.travel_crosswind_calm : windSpeed < 30 ? t.travel_crosswind_breezy : t.travel_crosswind_strong}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.krishi_wind_desc}
          </p>
        </div>

        {/* Metric 3: Sea Surface & Solar UV */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.beach_sea_temp_title}</span>
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              UV {uv}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {hasMarineData && seaTemp !== undefined ? `${seaTemp}°C` : (uv <= 5 ? t.health_uv_low : t.health_uv_high)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.health_uv_desc}
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_rain}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{rainProb}%</strong>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_visibility}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{visKm ? `${visKm} km` : t.status_ideal}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Waves className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.beach_tide_title}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{tideType || t.bulletin_normal}</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.commute_safety_index}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{statusLevel === 'favorable' ? t.status_ideal : statusLevel === 'caution' ? t.status_moderate : t.status_caution}</strong>
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
                {statusLevel === 'favorable' && `🟢 ${t.beach_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.beach_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.beach_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {beachAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-teal-700 dark:text-teal-400 font-semibold block text-[11px]">{t.beach_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.beach_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
