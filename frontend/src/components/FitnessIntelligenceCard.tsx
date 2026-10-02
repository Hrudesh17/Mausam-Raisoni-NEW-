'use client';

import React from 'react';
import { 
  Activity, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  Wind, 
  Thermometer, 
  CloudRain,
  Droplets,
  HeartPulse
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface FitnessIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const FitnessIntelligenceCard: React.FC<FitnessIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { language, t } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const roleDetails = context.role_details?.running;
  const healthIntel = intelligence.health;

  const workoutTime = roleDetails?.running_time || '06:00 AM';
  const timeOfDay = roleDetails?.time_of_day || 'Morning';

  const aqi = curr.aqi;
  const temp = curr.temperature;
  const feelsLike = curr.feels_like;
  const uv = curr.uv_index;
  const rainProb = curr.precipitation_probability;
  const windSpeed = curr.wind_speed;
  const humidity = curr.humidity;

  // Calculate dynamic workout safety index (0 - 100)
  const workoutScore = React.useMemo(() => {
    let score = 100;
    if (temp > 35 || temp < 5) score -= 25;
    else if (temp > 30 || temp < 10) score -= 10;
    if (aqi > 150) score -= 35;
    else if (aqi > 100) score -= 20;
    if (uv > 8) score -= 20;
    else if (uv > 5) score -= 10;
    if (rainProb > 60) score -= 25;
    else if (rainProb > 30) score -= 10;
    return Math.max(10, Math.min(100, score));
  }, [temp, aqi, uv, rainProb]);

  // Dynamic Status calculation
  const statusLevel = React.useMemo(() => {
    if (workoutScore >= 80) return 'favorable';
    if (workoutScore >= 55) return 'caution';
    return 'risk';
  }, [workoutScore]);

  // Dynamic Advisory
  const fitnessAdvisory = React.useMemo(() => {
    if (healthIntel?.outdoor_exercise_verdict) {
      return healthIntel.outdoor_exercise_verdict;
    }
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `कम यूवी (${uv}) और सुखद तापमान (${temp}°C) के साथ यह समय आउटडोर वर्कआउट के लिए सबसे उपयुक्त है।`;
      if (language === 'mr') return `कमी अतिनील किरणे (${uv}) आणि आल्हाददायक तापमान (${temp}°C) यामुळे बाहेर व्यायाम करण्यासाठी ही सर्वोत्तम वेळ आहे.`;
      if (language === 'bn') return `স্বাভাবিক ইউভি (${uv}) এবং আরামদায়ক তাপমাত্রা (${temp}°C) নিয়ে আউটডোর ওয়ার্কআউটের জন্য এই সময়টি অত্যন্ত উপযোগী।`;
      if (language === 'te') return `తక్కువ UV (${uv}) మరియు అనుకూలమైన ఉష్ణోగ్రత (${temp}°C) తో బయట వ్యాయామం చేయడానికి ఈ సమయం చాలా మంచిది.`;
      return `Lower UV (${uv}) and comfortable temperatures (${temp}°C) make ${timeOfDay.toLowerCase()} the preferred outdoor workout window.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `बढ़ा हुआ तापमान (${temp}°C) या AQI (${aqi})। वर्कआउट मध्यम रखें, पानी पीते रहें और तेज धूप से बचें।`;
      if (language === 'mr') return `वाढलेले तापमान (${temp}°C) किंवा AQI (${aqi}). व्यायाम मध्यम स्वरूपाचा ठेवा आणि पुरेसे पाणी प्या.`;
      if (language === 'bn') return `উচ্চ তাপমাত্রা (${temp}°C) বা AQI (${aqi})। ব্যায়াম পরিমিত রাখুন এবং পর্যাপ্ত পানি পান করুন।`;
      if (language === 'te') return `ఎక్కువ ఉష్ణోగ్రత (${temp}°C) లేదా AQI (${aqi}). వ్యాయామం మోస్తరుగా చేయండి మరియు నీరు త్రాగండి.`;
      return `Elevated temperature (${temp}°C) or AQI (${aqi}) suggest keeping workouts moderate. Stay hydrated and avoid peak heat hours.`;
    }
    if (language === 'hi') return `${loc.name} में उच्च तापीय तनाव या AQI (${aqi}) दर्ज। इनडोर जिम में व्यायाम करने पर विचार करें।`;
    if (language === 'mr') return `${loc.name} मध्ये अति उष्णता किंवा AQI (${aqi}) वाढला आहे. इनडोअर जिममध्ये व्यायाम करणे श्रेयस्कर.`;
    if (language === 'bn') return `${loc.name} অঞ্চলে তীব্র তাপ বা প্রতিকূল AQI (${aqi})। ইনডোর জিমে ব্যায়াম করার পরামর্শ দেওয়া হচ্ছে।`;
    if (language === 'te') return `${loc.name} లో అధిక వేడి లేదా AQI (${aqi}) ఉంది. జిమ్ లోపల వ్యాయామం చేయడం మంచిది.`;
    return `High thermal stress or AQI (${aqi}) reported over ${loc.name}. Consider shifting intense cardio to an indoor gym session.`;
  }, [healthIntel, statusLevel, uv, temp, timeOfDay, aqi, loc.name, language]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                {t.commute_personalized_role}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Fitness</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.fitness_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.fitness_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.fitness_optimal}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.fitness_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.fitness_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.commute_location_label}:</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.fitness_workout_window}:</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{timeOfDay} ({workoutTime})</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_temp}:</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{temp}°C ({t.metric_feels_like} {feelsLike}°C)</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Cardio Safety Score */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.fitness_workout_score}</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {workoutScore}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {workoutScore >= 80 ? t.fitness_optimal : workoutScore >= 60 ? t.fitness_caution : t.fitness_risk}
          </p>
        </div>

        {/* Metric 2: Air Quality (AQI) */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.metric_aqi}</span>
            <HeartPulse className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {aqi}
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
              {curr.aqi_category || (aqi <= 50 ? t.status_good : aqi <= 100 ? t.status_moderate : t.status_poor)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.health_pm25_desc}
          </p>
        </div>

        {/* Metric 3: Solar UV Radiation */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.fitness_uv_exposure}</span>
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
          <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_wind}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{windSpeed} km/h</strong>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_humidity}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{humidity}%</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_hydration_target}</span>
          <strong className="text-slate-800 dark:text-slate-200">{healthIntel?.hydration_target_liters || 2.5} {t.health_liters}</strong>
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
                {statusLevel === 'favorable' && `🟢 ${t.fitness_optimal.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.fitness_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.fitness_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {fitnessAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[11px]">{t.health_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.health_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
