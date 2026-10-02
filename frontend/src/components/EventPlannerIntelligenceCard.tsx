'use client';

import React from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  CloudRain, 
  Wind, 
  Sparkles, 
  Thermometer
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface EventPlannerIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const EventPlannerIntelligenceCard: React.FC<EventPlannerIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const curr = weather.current;
  const loc = weather.location;
  const eventIntel = intelligence.event_planning;

  const eventCount = context.calendar_events?.length || 0;
  const rainProb = curr.precipitation_probability;
  const temp = curr.temperature;
  const feelsLike = curr.feels_like;
  const windSpeed = curr.wind_speed;
  const uv = curr.uv_index;
  const sunrise = curr.sunrise || '06:00 AM';
  const sunset = curr.sunset || '06:42 PM';

  // Dynamic Status
  const statusLevel = React.useMemo(() => {
    if (rainProb > 60 || windSpeed > 35) return 'risk';
    if (rainProb > 30 || windSpeed > 20 || temp > 35) return 'caution';
    return 'favorable';
  }, [rainProb, windSpeed, temp]);

  // Dynamic Advisory
  const eventAdvisory = React.useMemo(() => {
    if (eventIntel?.outdoor_comfort_rating) {
      return `${t.event_thermal_title}: ${eventIntel.outdoor_comfort_rating}. ${eventIntel.optimal_event_window ? `${t.event_recommended_prefix} ${eventIntel.optimal_event_window}.` : ''}`;
    }
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `साफ आसमान और कम बारिश जोखिम (${rainProb}%) के साथ ${loc.name} में बाहरी कार्यक्रम अनुकूल हैं। शाम का समय (${sunset}) उत्कृष्ट प्रकाश प्रदान करेगा।`;
      if (language === 'mr') return `निरभ्र आकाश आणि पावसाची कमी शक्यता (${rainProb}%) असल्याने ${loc.name} मध्ये मैदानी कार्यक्रमांसाठी उत्तम वेळ आहे.`;
      if (language === 'bn') return `পরিষ্কার আকাশ এবং বৃষ্টির কম ঝুঁকি (${rainProb}%) নিয়ে ${loc.name} অঞ্চলে আউটডোর অনুষ্ঠান সফলভাবে আয়োজন করা সম্ভব।`;
      if (language === 'te') return `నిర్మలమైన ఆకాశం మరియు తక్కువ వర్షపు ముప్పుతో (${rainProb}%) ${loc.name} లో బహిరంగ కార్యక్రమాలకు పరిస్థితులు అనుకూలంగా ఉన్నాయి.`;
      return `Clear skies and low rain risk (${rainProb}%) over ${loc.name} support outdoor events. Evening golden hour (${sunset}) provides optimal lighting.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `मध्यम बारिश का खतरा (${rainProb}%) या हवा की गति (${windSpeed} किमी/घंटा)। वाटरप्रूफ शामियाने की व्यवस्था रखें।`;
      if (language === 'mr') return `पावसाची शक्यता (${rainProb}%) किंवा वाऱ्याचा वेग (${windSpeed} किमी/तास). वॉटरप्रूफ मंडपाची व्यवस्था ठेवा.`;
      if (language === 'bn') return `মাঝারি বৃষ্টির সম্ভাবনা (${rainProb}%) বা বাতাসের গতি (${windSpeed} কিমি/ঘণ্টা)। ওয়াটারপ্রুফ শামিয়ানার ব্যবস্থা রাখুন।`;
      if (language === 'te') return `మోస్తరు వర్షపు ముప్పు (${rainProb}%) లేదా గాలి వేగం (${windSpeed} కి.మీ/గం). షామియానా ఏర్పాట్లు సిద్ధం చేసుకోండి.`;
      return `Moderate rain risk (${rainProb}%) or wind speed (${windSpeed} km/h) over ${loc.name}. Arrange waterproof venue canopies.`;
    }
    if (language === 'hi') return `बारिश का उच्च खतरा (${rainProb}%) या तेज हवाएं (${windSpeed} किमी/घंटा)। इनडोर बैकअप स्थान की सख्त सिफारिश की जाती है।`;
    if (language === 'mr') return `पावसाचा मोठा धोका (${rainProb}%) किंवा वादळी वारे (${windSpeed} किमी/तास). इनडोअर पर्यायी हॉलची व्यवस्था ठेवा.`;
    if (language === 'bn') return `বৃষ্টির প্রবল ঝুঁকি (${rainProb}%) বা তীব্র বাতাস (${windSpeed} কিমি/ঘণ্টা)। ইনডোর ব্যাকআপ ভেন্যু প্রস্তুত রাখার পরামর্শ দেওয়া হচ্ছে।`;
    if (language === 'te') return `భారీ వర్షపు ముప్పు (${rainProb}%) లేదా తీవ్ర గాలులు (${windSpeed} కి.మీ/గం). ఇండోర్ వేదికను ఎంపిక చేసుకోవడం మంచిది.`;
    return `Elevated rain risk (${rainProb}%) or wind hazard (${windSpeed} km/h) reported over ${loc.name}. Indoor backup venue strongly recommended.`;
  }, [eventIntel, statusLevel, rainProb, loc.name, sunset, windSpeed, language, t]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 space-y-6 shadow-xs relative overflow-hidden transition-colors">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0 shadow-xs">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                {t.event_role_badge}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">• VayuSync Event</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.event_planner_card_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.event_planner_card_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.event_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.event_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.event_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.event_location}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.event_scheduled_events}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{eventCount} {t.pers_outdoor_tag}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.event_golden_hour}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{sunset} {t.event_sunset_window}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Event Disruption Risk */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.event_disruption_title}</span>
            <CloudRain className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {rainProb}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {rainProb < 30 ? t.event_disruption_low : rainProb < 60 ? t.event_disruption_moderate : t.event_disruption_high}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.pers_event_conflict_hint}
          </p>
        </div>

        {/* Metric 2: Sunlight & Photography */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.event_prime_aesthetic}</span>
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {sunset}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {t.evening_golden_hour}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.metric_sunrise}: {sunrise} • {t.metric_sunset}: {sunset}
          </p>
        </div>

        {/* Metric 3: Guest Thermal Comfort */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.event_thermal_title}</span>
            <Thermometer className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {temp}°C
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {t.metric_feels_like} {feelsLike}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {temp <= 30 ? t.family_comfort_comfortable : t.family_comfort_warm}
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.event_wind_sound_title}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{windSpeed < 20 ? t.status_ideal : t.status_caution}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_uv_title}:</span>
          <strong className="text-slate-800 dark:text-slate-200">UV {uv}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.event_slot_evening}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{eventIntel?.optimal_event_window || 'Late Afternoon'}</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.suitability_score}:</span>
          <strong className="text-slate-800 dark:text-slate-200">{statusLevel === 'favorable' ? t.event_suitability_ideal : t.event_suitability_moderate}</strong>
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
                {statusLevel === 'favorable' && `🟢 ${t.event_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.event_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.event_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {eventAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shadow-xs shrink-0 sm:max-w-xs">
          <strong className="text-indigo-600 dark:text-indigo-400 font-semibold block text-[11px]">{t.event_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.event_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
