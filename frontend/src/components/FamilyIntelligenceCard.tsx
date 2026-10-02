'use client';

import React from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  CloudRain, 
  Thermometer, 
  HeartPulse
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface FamilyIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const FamilyIntelligenceCard: React.FC<FamilyIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const roleDetails = context.role_details?.family;

  const playTime = roleDetails?.outdoor_play_time || '04:30 PM - 06:30 PM';
  const ageGroup = roleDetails?.children_age_group || t.opt_young_kids;

  const temp = curr.temperature;
  const feelsLike = curr.feels_like;
  const uv = curr.uv_index;
  const rainProb = curr.precipitation_probability;
  const aqi = curr.aqi;

  // Dynamic Status Calculation
  const statusLevel = React.useMemo(() => {
    if (temp > 36 || rainProb > 60 || aqi > 150 || uv > 8) return 'risk';
    if (temp > 31 || rainProb > 30 || aqi > 100 || uv > 5) return 'caution';
    return 'favorable';
  }, [temp, rainProb, aqi, uv]);

  // Dynamic Advisory
  const familyAdvisory = React.useMemo(() => {
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `${loc.name} में बाहरी वातावरण सुखद है। कम यूवी और सुरक्षित वायु गुणवत्ता दोपहर बाद बच्चों के खेल के लिए आदर्श है।`;
      if (language === 'mr') return `${loc.name} मध्ये हवामान आल्हाददायक आहे. कमी अतिनील किरणे आणि सुरक्षित हवेची गुणवत्ता यामुळे मुले संध्याकाळी खेळू शकतात.`;
      if (language === 'bn') return `${loc.name} অঞ্চলে বাইরের পরিবেশ মনোরম। কম ইউভি ও নিরাপদ বায়ুর মান শিশুদের খেলাধুলার জন্য উপযুক্ত।`;
      if (language === 'te') return `${loc.name} లో వాతావరణం ఆహ్లాదకరంగా ఉంది. తక్కువ UV మరియు స్వచ్ఛమైన గాలి పిల్లలు ఆడుకోవడానికి అనుకూలం.`;
      return `Outdoor conditions over ${loc.name} are comfortable. Lower UV and safe air quality make late afternoon ideal for outdoor play.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `दोपहर में यूवी (${uv}) या तापमान (${temp}°C) बढ़ सकता है। बच्चों को सुबह या देर शाम बाहर खेलने दें।`;
      if (language === 'mr') return `दुपारी तापमान (${temp}°C) आणि ऊन वाढू शकते. मुलांना सकाळी किंवा संध्याकाळी खेळू द्यावे.`;
      if (language === 'bn') return `দুপুরে রোদ (${uv}) ও তাপমাত্রা (${temp}°C) বাড়তে পারে। সকাল বা বিকেলে শিশুদের বাইরে খেলার পরামর্শ দেওয়া হচ্ছে।`;
      if (language === 'te') return `మధ్యాహ్నం వేళ ఎండ (${uv}) లేదా ఉష్ణోగ్రత (${temp}°C) పెరగవచ్చు. పిల్లలను ఉదయం లేదా సాయంత్రం వేళల్లో ఆడించండి.`;
      return `Increasing UV (${uv}) or temperature (${temp}°C) around midday makes earlier morning or evening outdoor activity preferable for children.`;
    }
    if (language === 'hi') return `अत्यधिक गर्मी (${temp}°C) या बारिश की संभावना (${rainProb}%) दर्ज। बच्चों के लिए इनडोर गतिविधियों की सिफारिश की जाती है।`;
    if (language === 'mr') return `अति उष्णता (${temp}°C) किंवा पावसाची शक्यता (${rainProb}%) आहे. आज मुलांना घरातच खेळण्याचा सल्ला दिला जातो.`;
    if (language === 'bn') return `তীব্র তাপ (${temp}°C) বা বৃষ্টির আশঙ্কা (${rainProb}%) রয়েছে। আজ ইনডোর খেলার পরামর্শ দেওয়া হচ্ছে।`;
    if (language === 'te') return `అధిక వేడి (${temp}°C) లేదా వర్షం ముప్పు (${rainProb}%) ఉంది. పిల్లలు ఇంట్లోనే ఆడుకోవడం మంచిది.`;
    return `High heat (${temp}°C) or elevated rain risk (${rainProb}%) reported over ${loc.name}. Indoor games and covered play areas recommended today.`;
  }, [statusLevel, loc.name, uv, temp, rainProb, language]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-pink-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/60 shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60">
                {t.family_role_badge}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Family</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.family_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.family_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.family_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.family_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.family_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.family_location}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.family_play_window}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{playTime}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.family_age_group}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{ageGroup}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Outdoor Comfort Index */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.family_comfort_title}</span>
            <Thermometer className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {temp}°C
            </span>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
              {t.metric_feels_like} {feelsLike}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {temp <= 30 ? t.family_comfort_comfortable : t.family_comfort_warm}
          </p>
        </div>

        {/* Metric 2: Rain & Storm Risk */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.family_rain_play_title}</span>
            <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {rainProb}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {rainProb < 30 ? t.family_outdoor_safe : t.family_indoor_rec}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.commute_delay_desc}
          </p>
        </div>

        {/* Metric 3: UV & Air Quality Exposure */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.family_sun_uv_title}</span>
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              UV {uv}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              AQI {aqi} ({curr.aqi_category || t.status_good})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {uv > 5 ? t.health_uv_high : t.health_uv_low}
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.fitness_workout_window}:</span>
          <strong className="text-slate-900 dark:text-white">04:30 - 06:30 PM</strong>
        </div>

        <div className="flex items-center gap-2">
          <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_aqi_title}:</span>
          <strong className="text-emerald-700 dark:text-emerald-400">{curr.aqi_category || t.status_good}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.family_sun_uv_title}:</span>
          <strong className="text-slate-900 dark:text-white">{uv > 5 ? t.health_uv_high : t.health_uv_low}</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.family_comfort_title}:</span>
          <strong className="text-slate-900 dark:text-white">{statusLevel === 'favorable' ? t.status_ideal : t.status_moderate}</strong>
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
                {statusLevel === 'favorable' && `🟢 ${t.family_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.family_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.family_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {familyAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-pink-700 dark:text-pink-400 font-semibold block text-[11px]">{t.family_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.family_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
