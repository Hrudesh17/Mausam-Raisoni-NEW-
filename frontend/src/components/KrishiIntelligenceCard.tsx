'use client';

import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  CloudRain, 
  Droplets, 
  Thermometer
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface KrishiIntelligenceCardProps {
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

export const KrishiIntelligenceCard: React.FC<KrishiIntelligenceCardProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'crops'>('overview');
  const curr = weather.current;
  const loc = weather.location;
  const roleDetails = context.role_details?.gardening;
  const krishiIntel = intelligence.krishi;

  const cropType = roleDetails?.crop_type || t.pers_crop_placeholder;
  const wateringSchedule = roleDetails?.watering_schedule || t.opt_early_morning;

  const rainProb = curr.precipitation_probability;
  const rain24h = curr.precipitation;
  const windSpeed = curr.wind_speed;
  const humidity = curr.humidity;

  // Spraying safety
  const isSprayingSafe = windSpeed < 15 && rainProb < 40;

  // Dynamic Status
  const statusLevel = React.useMemo(() => {
    if (rainProb > 65 || windSpeed > 35) return 'risk';
    if (rainProb > 35 || windSpeed > 20 || humidity > 85) return 'caution';
    return 'favorable';
  }, [rainProb, windSpeed, humidity]);

  // Dynamic Advisory
  const krishiAdvisory = React.useMemo(() => {
    if (krishiIntel?.irrigation_advice) {
      return krishiIntel.irrigation_advice;
    }
    if (statusLevel === 'favorable') {
      if (language === 'hi') return `हवा की गति 15 किमी/घंटा से कम (${windSpeed} किमी/घंटा) और कम बारिश का जोखिम (${rainProb}%)। ${loc.name} में कीटनाशक छिड़काव और खेत कार्य के लिए अनुकूल स्थितियां।`;
      if (language === 'mr') return `वाऱ्याचा वेग १५ किमी/तास पेक्षा कमी (${windSpeed} किमी/तास) आणि पावसाची कमी शक्यता (${rainProb}%). ${loc.name} मध्ये कीटकनाशक फवारणीसाठी परिस्थिती उत्तम आहे.`;
      if (language === 'bn') return `বাতাসের গতি ১৫ কিমি/ঘণ্টার কম (${windSpeed} কিমি/ঘণ্টা) এবং বৃষ্টির কম ঝুঁকি (${rainProb}%)। ${loc.name} অঞ্চলে কীটনাশক স্প্রে ও মাঠপর্যায়ের কাজের জন্য অনুকূল পরিবেশ।`;
      if (language === 'te') return `గాలి వేగం 15 కి.మీ/గం కంటే తక్కువ (${windSpeed} కి.మీ/గం) మరియు వర్షం ముప్పు తక్కువ (${rainProb}%). ${loc.name} లో పంటల మందుల పిచికారీకి అనుకూల పరిస్థితులు.`;
      return `Wind speeds under 15 km/h (${windSpeed} km/h) and low rain risk (${rainProb}%) provide favorable conditions for crop spraying and field work over ${loc.name}.`;
    }
    if (statusLevel === 'caution') {
      if (language === 'hi') return `मध्यम हवा (${windSpeed} किमी/घंटा) या आर्द्रता (${humidity}%)। ${loc.name} में छिड़काव सावधानीपूर्वक करें और सिंचाई से पहले पूर्वानुमान देखें।`;
      if (language === 'mr') return `मध्यम वारे (${windSpeed} किमी/तास) आणि दमटपणा (${humidity}%). ${loc.name} मध्ये काळजीपूर्वक फवारणी करा.`;
      if (language === 'bn') return `মাঝারি বাতাস (${windSpeed} কিমি/ঘণ্টা) বা আর্দ্রতা (${humidity}%)। ${loc.name} অঞ্চলে স্প্রে করার সময় সতর্ক থাকুন।`;
      if (language === 'te') return `మోస్తరు గాలులు (${windSpeed} కి.మీ/గం) లేదా తేమ (${humidity}%). ${loc.name} లో జాగ్రత్తగా పిచికారీ చేయండి.`;
      return `Moderate wind (${windSpeed} km/h) or humidity (${humidity}%) over ${loc.name} requires careful pesticide spraying. Monitor rain forecasts before irrigating.`;
    }
    if (language === 'hi') return `तेज बारिश की संभावना (${rainProb}%) या तेज हवाएं (${windSpeed} किमी/घंटा)। ${loc.name} में छिड़काव और खेत कार्य स्थगित करें।`;
    if (language === 'mr') return `मुसळधार पावसाची शक्यता (${rainProb}%) किंवा वेगवान वारे (${windSpeed} किमी/तास). शेतातील कामे आणि फवारणी पुढे ढकला.`;
    if (language === 'bn') return `ভারী বৃষ্টির আশঙ্কা (${rainProb}%) বা তীব্র বাতাস (${windSpeed} কিমি/ঘণ্টা)। ${loc.name} অঞ্চলে স্প্রে ও মাঠের কাজ স্থগিত রাখুন।`;
    if (language === 'te') return `భారీ వర్షపు సూచన (${rainProb}%) లేదా తీవ్ర గాలులు (${windSpeed} కి.మీ/గం). పొలం పనులు మరియు పిచికారీ వాయిదా వేయండి.`;
    return `High rainfall probability (${rainProb}%) or high winds (${windSpeed} km/h) reported over ${loc.name}. Delay spraying and field operations until weather stabilizes.`;
  }, [krishiIntel, statusLevel, windSpeed, rainProb, loc.name, humidity, language]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 space-y-6 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-1">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER (Title, Subtitle & Dynamic Status Badge) ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-xs">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                {t.krishi_role_badge}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Krishi</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.krishi_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.krishi_subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.krishi_favorable}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.krishi_caution}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.krishi_risk}
            </span>
          )}
        </div>
      </div>

      {/* ── 1.5. TAB SWITCHER ───────────────────────────────────────────── */}
      <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          Daily Operations
        </button>
        <button 
          onClick={() => setActiveTab('crops')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'crops' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          Crop Recommendations
        </button>
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* ── 2. CONTEXT INFORMATION ROW ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.krishi_location}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{loc.name}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.krishi_crop_focus}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{cropType}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.krishi_watering_schedule}</span>
          <strong className="text-slate-900 dark:text-white font-semibold">{wateringSchedule}</strong>
        </div>
      </div>

      {/* ── 3. PRIMARY METRICS (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1: Spraying Safety Window */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.krishi_spraying_title}</span>
            <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isSprayingSafe ? t.krishi_spraying_safe : t.krishi_spraying_unsafe}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.krishi_spraying_desc} ({windSpeed} km/h)
          </p>
        </div>

        {/* Metric 2: Irrigation Requirement */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.krishi_irrigation_title}</span>
            <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">
              {krishiIntel?.irrigation_needed ? t.krishi_rain_unlikely : t.krishi_rain_expected}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {rainProb > 50 ? `${t.metric_rain} ${rainProb}% — ${t.krishi_rain_expected}` : `${t.metric_rain} ${rainProb}% — ${t.krishi_rain_unlikely}`}
          </p>
        </div>

        {/* Metric 3: Field Work & Harvest Window */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.metric_rain}</span>
            <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {rain24h} mm
            </span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {rain24h > 10 ? t.travel_rain_high : t.status_ideal}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {t.forecast_24h_title} & {t.metric_humidity}
          </p>
        </div>

      </div>

      {/* ── 4. SECONDARY METRICS BAR ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.health_relative_humidity}:</span>
          <strong className="text-slate-900 dark:text-white">{humidity}%</strong>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.krishi_wind_title}:</span>
          <strong className="text-slate-900 dark:text-white">{windSpeed} km/h</strong>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.metric_temp}:</span>
          <strong className="text-slate-900 dark:text-white">{curr.temperature}°C</strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{t.commute_safety_index}:</span>
          <strong className="text-slate-900 dark:text-white">{humidity > 80 ? t.status_caution : t.status_ideal}</strong>
        </div>
      </div>

          </div>
      )}

      {/* ── CROPS TAB ────────────────────────────────────────── */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          {krishiIntel?.recommended_crops && krishiIntel?.recommended_crops?.length > 0 ? (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
              <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Crops for Current Weather</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {krishiIntel.crop_reasoning}
          </p>
          <div className="flex flex-wrap gap-2">
            {krishiIntel?.recommended_crops?.map((crop) => (
              <span 
                key={crop}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-100 dark:border-emerald-800/50 shadow-xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {crop}
              </span>
            ))}
          </div>
        </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No specific crop recommendations available right now.
            </div>
          )}
        </div>
      )}

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
                {statusLevel === 'favorable' && `🟢 ${t.krishi_favorable.toUpperCase()}`}
                {statusLevel === 'caution' && `🟡 ${t.krishi_caution.toUpperCase()}`}
                {statusLevel === 'risk' && `🔴 ${t.krishi_risk.toUpperCase()}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {krishiAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[11px]">{t.krishi_guidance_box_title}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.krishi_guidance_box_desc}</span>
        </div>
      </div>

    </div>
  );
};
