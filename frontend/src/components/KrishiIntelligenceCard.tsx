'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Sprout, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  CloudRain, 
  Droplets, 
  Thermometer,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Leaf,
  Calendar,
  FlaskConical,
  TrendingUp
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext, CropPredictionResponse, CropClimateResponse } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { evaluateWateringWindow } from '../lib/agronomyEngine';
import { fetchCropPrediction, fetchCropClimate } from '../lib/api';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'crops'>('overview');
  const curr = weather.current;
  const loc = weather.location;
  const roleDetails = context.role_details?.gardening;

  const cropType = roleDetails?.crop_type || 'Vegetables & Herbs';
  const wateringSchedule = roleDetails?.watering_schedule || 'Early Morning';

  const rainProb = curr.precipitation_probability;
  const rain24h = curr.precipitation;
  const windSpeed = curr.wind_speed;
  const humidity = curr.humidity;

  // Evaluate watering schedule window against hourly telemetry
  const wateringEval = useMemo(() => {
    return evaluateWateringWindow(wateringSchedule, weather.hourly || [], curr);
  }, [wateringSchedule, weather.hourly, curr]);

  // Spraying safety window
  const isSprayingSafe = windSpeed < 15 && rainProb < 40;

  // Dynamic Status Level
  const statusLevel = useMemo(() => {
    if (rainProb > 65 || windSpeed > 35) return 'risk';
    if (rainProb > 35 || windSpeed > 20 || humidity > 85 || wateringEval.status === 'Avoid') return 'caution';
    return 'favorable';
  }, [rainProb, windSpeed, humidity, wateringEval.status]);

  // ── CROP INTELLIGENCE STATE (JOB 1 & JOB 2) ──────────────────────────────────
  // Soil Inputs: User-entered ONLY, starts COMPLETELY EMPTY on fresh load / refresh
  const [nitrogen, setNitrogen] = useState<string>('');
  const [phosphorus, setPhosphorus] = useState<string>('');
  const [potassium, setPotassium] = useState<string>('');
  const [ph, setPh] = useState<string>('');

  // Climate Inputs: Auto-filled accurately from location + Open-Meteo 30-day telemetry
  const [temperature, setTemperature] = useState<string>('');
  const [humInput, setHumInput] = useState<string>('');
  const [rainfall, setRainfall] = useState<string>('');

  const [climateInfo, setClimateInfo] = useState<CropClimateResponse | null>(null);
  const [isClimateLoading, setIsClimateLoading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<CropPredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [lastPredictionInputs, setLastPredictionInputs] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch 30-day climate telemetry when location changes
  const loadClimateData = useCallback(async (lat: number, lon: number, cityName: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsClimateLoading(true);
    try {
      const data = await fetchCropClimate(lat, lon, cityName, controller.signal);
      setClimateInfo(data);
      if (data.is_available && data.temperature !== null && data.temperature !== undefined) {
        setTemperature(data.temperature.toString());
        setHumInput(data.humidity !== null && data.humidity !== undefined ? data.humidity.toString() : '');
        setRainfall(data.rainfall !== null && data.rainfall !== undefined ? data.rainfall.toString() : '');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Failed to fetch 30-day climate telemetry:', err);
      }
    } finally {
      setIsClimateLoading(false);
    }
  }, []);

  // Fetch climate telemetry whenever coordinates change
  useEffect(() => {
    loadClimateData(loc.lat, loc.lon, loc.name);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loc.lat, loc.lon, loc.name, loadClimateData]);

  // Reset climate inputs to live API telemetry
  const handleResetToLive = () => {
    if (climateInfo && climateInfo.is_available && climateInfo.temperature !== null && climateInfo.temperature !== undefined) {
      setTemperature(climateInfo.temperature.toString());
      setHumInput(climateInfo.humidity !== null && climateInfo.humidity !== undefined ? climateInfo.humidity.toString() : '');
      setRainfall(climateInfo.rainfall !== null && climateInfo.rainfall !== undefined ? climateInfo.rainfall.toString() : '');
    } else {
      loadClimateData(loc.lat, loc.lon, loc.name);
    }
  };


  // Soil Presets shortcuts
  const handleApplyPreset = (type: 'black_cotton' | 'alluvial' | 'red_soil') => {
    if (type === 'black_cotton') {
      setNitrogen('120');
      setPhosphorus('45');
      setPotassium('50');
      setPh('7.5');
    } else if (type === 'alluvial') {
      setNitrogen('90');
      setPhosphorus('40');
      setPotassium('40');
      setPh('6.8');
    } else if (type === 'red_soil') {
      setNitrogen('70');
      setPhosphorus('30');
      setPotassium('35');
      setPh('6.0');
    }
  };

  // Strict numeric input sanitizer (digits, at most one dot, optional leading minus for temperature)
  const sanitizeNumericInput = (val: string, setter: (v: string) => void, allowNegative = false) => {
    let clean: string;
    if (allowNegative) {
      // Allow an optional leading minus, digits, and at most one dot
      clean = val.replace(/[^0-9.\-]/g, '');
      // Only allow minus at position 0
      if (clean.indexOf('-') > 0) {
        clean = clean.replace(/-/g, '');
      }
      // Only allow one minus
      const minusCount = (clean.match(/-/g) || []).length;
      if (minusCount > 1) {
        clean = '-' + clean.replace(/-/g, '');
      }
    } else {
      clean = val.replace(/[^0-9.]/g, '');
    }
    const parts = clean.split('.');
    if (parts.length > 2) {
      setter(`${parts[0]}.${parts.slice(1).join('')}`);
    } else {
      setter(clean);
    }
  };

  // Field validation rules
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);
    const tVal = parseFloat(temperature);
    const h = parseFloat(humInput);
    const phVal = parseFloat(ph);
    const r = parseFloat(rainfall);

    if (nitrogen !== '' && (isNaN(n) || n < 0 || n > 200)) errors.nitrogen = 'Allowed: 0 - 200';
    if (phosphorus !== '' && (isNaN(p) || p < 0 || p > 200)) errors.phosphorus = 'Allowed: 0 - 200';
    if (potassium !== '' && (isNaN(k) || k < 0 || k > 200)) errors.potassium = 'Allowed: 0 - 200';
    if (ph !== '' && (isNaN(phVal) || phVal < 0 || phVal > 14)) errors.ph = 'Allowed: 0.0 - 14.0';
    if (temperature !== '' && (isNaN(tVal) || tVal < -10 || tVal > 50)) errors.temperature = 'Allowed: -10°C to 50°C';
    if (humInput !== '' && (isNaN(h) || h < 0 || h > 100)) errors.humidity = 'Allowed: 0% to 100%';
    if (rainfall !== '' && (isNaN(r) || r < 0 || r > 3000)) errors.rainfall = 'Allowed: 0 to 3000 mm';

    return errors;
  }, [nitrogen, phosphorus, potassium, ph, temperature, humInput, rainfall]);

  // Form validity for button enable
  const isFormComplete = 
    nitrogen !== '' && 
    phosphorus !== '' && 
    potassium !== '' && 
    ph !== '' && 
    temperature !== '' && 
    humInput !== '' && 
    rainfall !== '' && 
    Object.keys(validationErrors).length === 0;

  // Check if inputs changed since last prediction
  const currentInputsFingerprint = `${nitrogen},${phosphorus},${potassium},${ph},${temperature},${humInput},${rainfall}`;
  const hasInputsChanged = predictionResult !== null && lastPredictionInputs !== '' && lastPredictionInputs !== currentInputsFingerprint;

  // Handle Predict Submission
  const handlePredictCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || isPredicting) return;

    setIsPredicting(true);
    setPredictionError(null);

    const payload = {
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humInput),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
      location_name: loc.name,
    };

    try {
      const res = await fetchCropPrediction(payload);
      setPredictionResult(res);
      setLastPredictionInputs(currentInputsFingerprint);
    } catch (err: any) {
      setPredictionError(err.message || 'Error occurred while computing crop recommendation.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Dynamic Advisory text
  const krishiAdvisory = useMemo(() => {
    if (rainProb >= 50) {
      return `Elevated rainfall probability (${rainProb}%, ${rain24h} mm forecast) over ${loc.name}. Hold canal/overhead irrigation to prevent root waterlogging.`;
    }
    if (humidity > 80 && curr.temperature > 24) {
      return `High relative humidity (${humidity}%) combined with warm ambient temperature (${curr.temperature}°C) elevates fungal spore and foliar blight risk over ${loc.name}. Inspect crop canopy.`;
    }
    if (windSpeed >= 20) {
      return `Elevated wind speed (${windSpeed} km/h) creates spray drift hazard over ${loc.name}. Postpone chemical spraying until winds subside below 15 km/h.`;
    }
    if (wateringEval.status === 'Avoid' && wateringEval.normalizedWindow === 'Afternoon') {
      return `Afternoon solar heat and UV radiation over ${loc.name} drive excessive evapotranspiration and risk foliar leaf scorch. Switch to Early Morning (5 AM – 8 AM) or Late Evening.`;
    }
    if (statusLevel === 'favorable') {
      return `Calm winds (${windSpeed} km/h), minimal rain probability (${rainProb}%), and comfortable humidity (${humidity}%) provide optimal field conditions for ${cropType} over ${loc.name}. ${wateringEval.reason}`;
    }
    return `Moderate atmospheric conditions (${curr.temperature}°C, humidity ${humidity}%) over ${loc.name}. ${wateringEval.action}`;
  }, [rainProb, rain24h, humidity, curr.temperature, windSpeed, wateringEval, statusLevel, loc.name, cropType]);

  // Formatted timestamp for auto-fill subtitle
  const formattedClimateTime = useMemo(() => {
    if (!climateInfo?.fetched_at) return 'just now';
    try {
      const date = new Date(climateInfo.fetched_at);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'just now';
    }
  }, [climateInfo?.fetched_at]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 space-y-6 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:shadow-md">
      
      {/* Background Subtle Accent */}
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
                {t.krishi_role_badge || 'AGRI-MAUSAM'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">• VayuSync Krishi</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.krishi_title || 'Krishi & Agricultural Operations'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.krishi_subtitle || 'Hyperlocal agromet advisories, spraying safety windows, and precision intelligence'}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="shrink-0">
          {statusLevel === 'favorable' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.krishi_favorable || 'Favorable'}
            </span>
          )}
          {statusLevel === 'caution' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.krishi_caution || 'Caution'}
            </span>
          )}
          {statusLevel === 'risk' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {t.krishi_risk || 'High Risk'}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. TAB SWITCHER ─────────────────────────────────────────────────── */}
      <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 pb-px">
        <button 
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'overview' 
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Operations</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('crops')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'crops' 
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Crop Recommendations</span>
          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
            ML
          </span>
        </button>
      </div>

      {/* ── 3. DAILY OPERATIONS TAB (JOB 3 OVERFLOW FIXES APPLIED) ──────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Context Information Bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Location:</span>
              <strong className="text-slate-900 dark:text-white font-semibold truncate">{loc.name}</strong>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <Sprout className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Crop Focus:</span>
              <strong className="text-slate-900 dark:text-white font-semibold truncate">{cropType}</strong>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Watering Schedule:</span>
              <strong className="text-slate-900 dark:text-white font-semibold truncate">{wateringSchedule}</strong>
            </div>
          </div>

          {/* Primary Metrics Grid (Fixed Text Overflows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Spraying Safety Window */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs overflow-hidden min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Spraying Safety Window</span>
                <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isSprayingSafe ? 'Safe to Spray' : 'Hold Spraying'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Wind speed and rain window for pesticide application ({windSpeed} km/h)
              </p>
            </div>

            {/* Card 2: Rain & Irrigation Need (Job 3a Fix: Responsive font & overflow-hidden) */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs overflow-hidden min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Rain & Irrigation Need</span>
                <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              </div>
              <div className="flex items-baseline min-w-0">
                <span className={`text-base sm:text-lg lg:text-xl font-black break-words leading-tight ${
                  wateringEval.status === 'Optimal' ? 'text-emerald-600 dark:text-emerald-400' :
                  wateringEval.status === 'Caution' ? 'text-amber-600 dark:text-amber-400' :
                  'text-rose-600 dark:text-rose-400'
                }`}>
                  {wateringEval.status === 'Avoid' 
                    ? (rainProb >= 50 ? 'Hold Irrigation' : 'Shift Window') 
                    : wateringEval.status === 'Optimal' 
                    ? 'Irrigation Recommended' 
                    : 'Caution / Drip Only'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                {wateringEval.reason}
              </p>
            </div>

            {/* Card 3: Expected 24h Rainfall (Job 3b Fix: 0 mm on one line, rain chance below) */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs overflow-hidden min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Expected 24h Rainfall</span>
                <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {rain24h}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  mm
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                Rain Chance: {rainProb}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {rain24h > 10 ? 'Heavy precipitation expected' : rainProb > 40 ? 'Moderate rain showers likely' : 'Clear / dry field conditions'}
              </p>
            </div>
          </div>

          {/* Secondary Metrics Bar (Job 3c Fix: Clean responsive auto-fit grid, no overlapping) */}
          <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">{t.health_relative_humidity || 'Relative Humidity:'}</span>
              </div>
              <strong className="text-slate-900 dark:text-white shrink-0 whitespace-nowrap">{humidity}%</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">{t.krishi_wind_title || 'Surface Wind:'}</span>
              </div>
              <strong className="text-slate-900 dark:text-white shrink-0 whitespace-nowrap">{windSpeed} km/h</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">{t.metric_temp || 'Temperature:'}</span>
              </div>
              <strong className="text-slate-900 dark:text-white shrink-0 whitespace-nowrap">{curr.temperature}°C</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">{t.commute_safety_index || 'Field Safety Index:'}</span>
              </div>
              <strong className="text-slate-900 dark:text-white shrink-0 whitespace-nowrap">{humidity > 80 ? 'Caution' : 'Optimal'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. CROP INTELLIGENCE SECTION (JOB 2: EXACT MATCH TO IMAGE 1) ────── */}
      {activeTab === 'crops' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Card Header (Matching Image 1: Green Icon + Crop Intelligence + Subtitle + Divider) */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Crop Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-Powered precision farming recommendations
                </p>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800" />
          </div>

          {/* Soil Presets Row (Matching Image 1) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mr-1">
              SOIL PRESETS:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('black_cotton')}
              className="px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/10 transition active:scale-95 shadow-2xs"
            >
              Black Soil
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('alluvial')}
              className="px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/10 transition active:scale-95 shadow-2xs"
            >
              Alluvial
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('red_soil')}
              className="px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/10 transition active:scale-95 shadow-2xs"
            >
              Red Soil
            </button>
          </div>

          {/* 2-Column Responsive Layout (Desktop: ~55% Left Form / ~45% Right Result Panel) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            
            {/* ── LEFT COLUMN: 7-PARAMETER FORM ──────────────────────────────── */}
            <form onSubmit={handlePredictCrop} className="lg:col-span-7 space-y-4">
              
              {/* Row 1: Nitrogen (N) | Phosphorus (P) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="crop-n" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    NITROGEN (N)
                  </label>
                  <input
                    id="crop-n"
                    type="text"
                    inputMode="decimal"
                    placeholder="0 - 200"
                    value={nitrogen}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setNitrogen)}
                    aria-invalid={Boolean(validationErrors.nitrogen)}
                    aria-describedby={validationErrors.nitrogen ? 'crop-n-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.nitrogen 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.nitrogen && (
                    <p id="crop-n-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.nitrogen}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="crop-p" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    PHOSPHORUS (P)
                  </label>
                  <input
                    id="crop-p"
                    type="text"
                    inputMode="decimal"
                    placeholder="0 - 200"
                    value={phosphorus}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setPhosphorus)}
                    aria-invalid={Boolean(validationErrors.phosphorus)}
                    aria-describedby={validationErrors.phosphorus ? 'crop-p-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.phosphorus 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.phosphorus && (
                    <p id="crop-p-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.phosphorus}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Potassium (K) | Temperature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="crop-k" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    POTASSIUM (K)
                  </label>
                  <input
                    id="crop-k"
                    type="text"
                    inputMode="decimal"
                    placeholder="0 - 200"
                    value={potassium}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setPotassium)}
                    aria-invalid={Boolean(validationErrors.potassium)}
                    aria-describedby={validationErrors.potassium ? 'crop-k-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.potassium 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.potassium && (
                    <p id="crop-k-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.potassium}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="crop-temp" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      TEMPERATURE
                    </label>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      title="Auto-filled from 30-day mean temperature"
                    >
                      AUTO
                    </span>
                  </div>
                  <input
                    id="crop-temp"
                    type="text"
                    inputMode="decimal"
                    placeholder="-10 to 50"
                    value={temperature}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setTemperature, true)}
                    aria-invalid={Boolean(validationErrors.temperature)}
                    aria-describedby={validationErrors.temperature ? 'crop-temp-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.temperature 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.temperature && (
                    <p id="crop-temp-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.temperature}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Humidity | PH Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="crop-hum" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      HUMIDITY
                    </label>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      title="Auto-filled from 30-day mean relative humidity"
                    >
                      AUTO
                    </span>
                  </div>
                  <input
                    id="crop-hum"
                    type="text"
                    inputMode="decimal"
                    placeholder="0 - 100"
                    value={humInput}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setHumInput)}
                    aria-invalid={Boolean(validationErrors.humidity)}
                    aria-describedby={validationErrors.humidity ? 'crop-hum-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.humidity 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.humidity && (
                    <p id="crop-hum-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.humidity}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="crop-ph" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    PH LEVEL
                  </label>
                  <input
                    id="crop-ph"
                    type="text"
                    inputMode="decimal"
                    placeholder="0 - 14"
                    value={ph}
                    onChange={(e) => sanitizeNumericInput(e.target.value, setPh)}
                    aria-invalid={Boolean(validationErrors.ph)}
                    aria-describedby={validationErrors.ph ? 'crop-ph-err' : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                      validationErrors.ph 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  {validationErrors.ph && (
                    <p id="crop-ph-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.ph}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Rainfall (Full Width) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="crop-rain" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    RAINFALL
                  </label>
                  <span 
                    className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    title="Auto-filled from 30-day cumulative precipitation"
                  >
                    AUTO
                  </span>
                </div>
                <input
                  id="crop-rain"
                  type="text"
                  inputMode="decimal"
                  placeholder="0 - 3000"
                  value={rainfall}
                  onChange={(e) => sanitizeNumericInput(e.target.value, setRainfall)}
                  aria-invalid={Boolean(validationErrors.rainfall)}
                  aria-describedby={validationErrors.rainfall ? 'crop-rain-err' : undefined}
                  className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border text-slate-900 dark:text-white text-sm focus:outline-none transition shadow-inner ${
                    validationErrors.rainfall 
                      ? 'border-rose-500 ring-1 ring-rose-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                  }`}
                  required
                />
                {validationErrors.rainfall && (
                  <p id="crop-rain-err" className="text-[10px] text-rose-500 font-medium">{validationErrors.rainfall}</p>
                )}
              </div>

              {/* Predict Ideal Crop Button (Matching Image 1: Green with sprout icon) */}
              <button
                type="submit"
                disabled={!isFormComplete || isPredicting}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isPredicting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Soil & Agro-Climate...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    <span>Predict Ideal Crop</span>
                  </>
                )}
              </button>

              {/* Single Muted Caption + Reset live button (Job 1 requirement 7) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">
                  {isClimateLoading ? (
                    'Fetching live 30-day agro-climatic telemetry...'
                  ) : climateInfo?.is_available ? (
                    `Auto-filled for ${loc.name} • 30-day average • Open-Meteo • updated ${formattedClimateTime}`
                  ) : (
                    "Couldn't fetch live data - enter manually"
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleResetToLive}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold shrink-0"
                  title="Restore temperature, humidity, and rainfall from live API"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to live data</span>
                </button>
              </div>

            </form>

            {/* ── RIGHT COLUMN: RESULT PANEL ──────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="w-full min-h-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950/60 dark:to-slate-900/80 p-5 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300">
                
                {/* Subtle decorative gradient orb */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* 1. Empty State */}
                {!predictionResult && !isPredicting && !predictionError && (
                  <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                      Ready for Recommendation
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                      Enter your soil values and tap <strong className="text-emerald-600 dark:text-emerald-400">Predict Ideal Crop</strong> to receive AI-powered farming intelligence.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> 22 Crop Classes</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Random Forest ML</span>
                    </div>
                  </div>
                )}

                {/* 2. Loading State */}
                {isPredicting && (
                  <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="relative">
                      <div className="w-14 h-14 border-[3px] border-emerald-500/15 border-t-emerald-500 rounded-full animate-spin" />
                      <Sprout className="w-5 h-5 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Evaluating Random Forest model across 22 crop classes...
                    </p>
                  </div>
                )}

                {/* 3. Error State */}
                {predictionError && (
                  <div className="flex flex-col items-center justify-center space-y-3 p-4 text-rose-500">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-xs font-semibold">{predictionError}</p>
                    <button
                      type="button"
                      onClick={handlePredictCrop}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition"
                    >
                      Retry Prediction
                    </button>
                  </div>
                )}

                {/* 4. Result State — Premium Layout */}
                {predictionResult && !isPredicting && (
                  <div className="w-full flex flex-col items-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Inputs Changed Notice */}
                    {hasInputsChanged && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-1">
                        Inputs changed — predict again
                      </span>
                    )}

                    {/* RECOMMENDED MATCH Pill + Confidence Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        RECOMMENDED MATCH
                      </div>
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                        {Math.round(predictionResult.confidence * 100)}%
                      </div>
                    </div>

                    {/* Crop Name */}
                    <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight capitalize leading-tight">
                      {predictionResult.recommended_crop}
                    </h2>

                    {/* Sentence */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                      {predictionResult.recommended_crop} is the best crop to be cultivated right there.
                    </p>

                    {/* Crop Photo */}
                    <div className="w-full max-w-[260px] h-40 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 mt-1">
                      <img 
                        src={predictionResult.primary_image_url} 
                        alt={predictionResult.recommended_crop}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-400">
                                <span class="text-3xl">🌱</span>
                                <span class="text-xs font-bold mt-1 text-white">${predictionResult.recommended_crop}</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>

                    {/* ── Fertilizer Recommendation Panel (Phase 1 Backend Integration) ── */}
                    {predictionResult.fertilizer_recommendation && (
                      <div className="w-full p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/70 border border-amber-500/30 text-left space-y-1.5 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Fertilizer Advisory</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                              {predictionResult.fertilizer_recommendation.primary_fertilizer}
                            </span>
                            {predictionResult.fertilizer_recommendation.secondary_fertilizer && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[9px]">
                                + {predictionResult.fertilizer_recommendation.secondary_fertilizer}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {predictionResult.fertilizer_recommendation.reasoning}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Dose: </span>
                            <span>{predictionResult.fertilizer_recommendation.dose_guidance}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <span>N: <strong className="text-slate-800 dark:text-white">{predictionResult.fertilizer_recommendation.npk_gap.nitrogen_status}</strong></span>
                            <span>P: <strong className="text-slate-800 dark:text-white">{predictionResult.fertilizer_recommendation.npk_gap.phosphorus_status}</strong></span>
                            <span>K: <strong className="text-slate-800 dark:text-white">{predictionResult.fertilizer_recommendation.npk_gap.potassium_status}</strong></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Growth Hints Grid ────────────────────────────────────── */}
                    {predictionResult.growth_hints && Object.keys(predictionResult.growth_hints).length > 0 && (
                      <div className="w-full grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(predictionResult.growth_hints).map(([key, value]) => (
                          <div key={key} className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-left">
                            <div className="flex items-center gap-1 mb-0.5">
                              {key.toLowerCase().includes('sowing') && <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />}
                              {key.toLowerCase().includes('fertilizer') && <FlaskConical className="w-3 h-3 text-amber-500 shrink-0" />}
                              {key.toLowerCase().includes('classification') && <Leaf className="w-3 h-3 text-lime-500 shrink-0" />}
                              {key.toLowerCase().includes('season') && <Sprout className="w-3 h-3 text-teal-500 shrink-0" />}
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{key}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug block">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Top Alternative Crops ───────────────────────────────── */}
                    {predictionResult.top_alternatives && predictionResult.top_alternatives.length > 0 && (
                      <div className="w-full mt-2 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">
                          ALSO SUITABLE
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {predictionResult.top_alternatives.map((alt) => (
                            <div key={alt.crop} className="flex-shrink-0 w-[120px] rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/60 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                              <div className="w-full h-16 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                <img 
                                  src={alt.image_url} 
                                  alt={alt.crop}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                              <div className="p-1.5">
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">{alt.crop}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(alt.confidence * 100)}%` }} />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 shrink-0">{Math.round(alt.confidence * 100)}%</span>
                                </div>
                                {alt.ideal_season && (
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">{alt.ideal_season}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safeguard Footer */}
                    <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 max-w-xs leading-tight border-t border-slate-200/60 dark:border-slate-800/60 mt-1 w-full">
                      <span>Source: {predictionResult.source === 'ml_model' ? 'ML Model (Random Forest)' : 'Agronomy Matrix'} • Advisory only — consult your local Krishi Vigyan Kendra (KVK)</span>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

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
                {statusLevel === 'favorable' && `🟢 ${t.krishi_favorable || 'FAVORABLE'}`}
                {statusLevel === 'caution' && `🟡 ${t.krishi_caution || 'CAUTION'}`}
                {statusLevel === 'risk' && `🔴 ${t.krishi_risk || 'RISK'}`}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {krishiAdvisory}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0 sm:max-w-xs shadow-xs">
          <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[11px]">{t.krishi_guidance_box_title || 'Agromet Best Practice:'}</strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">{t.krishi_guidance_box_desc || 'Prioritize pesticide foliar applications when surface wind speed remains under 15 km/h.'}</span>
        </div>
      </div>

    </div>
  );
};
