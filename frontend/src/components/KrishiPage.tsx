'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Sprout, 
  MapPin, 
  RotateCcw, 
  Leaf, 
  FlaskConical, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  ShieldCheck,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { 
  WeatherResponse, 
  IntelligenceSummary, 
  UserContext, 
  CropPredictionResponse, 
  CropClimateResponse 
} from '../lib/types';
import { fetchCropPrediction, fetchCropClimate } from '../lib/api';

interface KrishiPageProps {
  weather: WeatherResponse;
  intelligence?: IntelligenceSummary | null;
  context?: UserContext;
}

export const KrishiPage: React.FC<KrishiPageProps> = ({
  weather,
  intelligence,
  context,
}) => {
  const loc = weather.location;

  // ── SOIL INPUTS (Typed by user, start empty on fresh load/refresh) ─────────
  const [nitrogen, setNitrogen] = useState<string>('');
  const [phosphorus, setPhosphorus] = useState<string>('');
  const [potassium, setPotassium] = useState<string>('');
  const [ph, setPh] = useState<string>('');

  // ── CLIMATE INPUTS (Auto-filled from 30-day Open-Meteo telemetry) ───────────
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

  useEffect(() => {
    loadClimateData(loc.lat, loc.lon, loc.name);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loc.lat, loc.lon, loc.name, loadClimateData]);

  // Reset climate inputs to live Open-Meteo values
  const handleResetToLive = () => {
    if (climateInfo && climateInfo.is_available && climateInfo.temperature !== null) {
      setTemperature(climateInfo.temperature?.toString() || '');
      setHumInput(climateInfo.humidity?.toString() || '');
      setRainfall(climateInfo.rainfall?.toString() || '');
    } else {
      loadClimateData(loc.lat, loc.lon, loc.name);
    }
  };

  // Soil Presets
  const handleApplyPreset = (type: 'black_cotton' | 'alluvial' | 'red_soil') => {
    switch (type) {
      case 'black_cotton':
        setNitrogen('50');
        setPhosphorus('30');
        setPotassium('50');
        setPh('7.8');
        break;
      case 'alluvial':
        setNitrogen('80');
        setPhosphorus('40');
        setPotassium('40');
        setPh('6.8');
        break;
      case 'red_soil':
        setNitrogen('40');
        setPhosphorus('25');
        setPotassium('30');
        setPh('6.2');
        break;
    }
  };

  // Input Sanitizer
  const sanitizeNumericInput = (val: string, setter: (v: string) => void, allowNegative = false) => {
    let clean = '';
    if (allowNegative) {
      clean = val.replace(/[^0-9.-]/g, '');
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

  // Field validation rules matching backend bounds
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

  // Confidence color helper
  const getConfidenceBadgeColor = (conf: number) => {
    if (conf >= 0.7) return 'bg-emerald-500 text-white';
    if (conf >= 0.4) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  return (
    <div id="crop" className="w-full rounded-3xl bg-[#09131F] dark:bg-[#09131F] border border-slate-800 text-slate-100 shadow-2xl p-5 sm:p-8 space-y-6 transition-all duration-300">
      
      {/* ── CARD HEADER (Image 1: Sprout Icon + Crop Intelligence Title + Subtitle) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/25">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight leading-none">
              Crop Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              AI-Powered precision farming recommendations
            </p>
          </div>
        </div>

        {/* Location & Model Attribution Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{loc.name}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            Random Forest ML
          </span>
        </div>
      </div>

      {/* ── SOIL PRESETS ROW (Image 1: Pill Buttons) ─────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mr-1">
          SOIL PRESETS:
        </span>
        <button
          type="button"
          onClick={() => handleApplyPreset('black_cotton')}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-xs"
        >
          Black Soil
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('alluvial')}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-xs"
        >
          Alluvial
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('red_soil')}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-xs"
        >
          Red Soil
        </button>
      </div>

      {/* ── 2-COLUMN BALANCED LAYOUT (Image 1: 50% Left Form / 50% Right Result) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* ── LEFT COLUMN: 7-PARAMETER FORM ─────────────────────────────────── */}
        <form onSubmit={handlePredictCrop} className="lg:col-span-6 space-y-4">
          
          {/* Row 1: Nitrogen (N) | Phosphorus (P) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="k-crop-n" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                NITROGEN (N)
              </label>
              <input
                id="k-crop-n"
                type="text"
                inputMode="decimal"
                placeholder="0 - 200"
                value={nitrogen}
                onChange={(e) => sanitizeNumericInput(e.target.value, setNitrogen)}
                aria-invalid={Boolean(validationErrors.nitrogen)}
                aria-describedby={validationErrors.nitrogen ? 'k-crop-n-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.nitrogen 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.nitrogen && (
                <p id="k-crop-n-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.nitrogen}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="k-crop-p" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                PHOSPHORUS (P)
              </label>
              <input
                id="k-crop-p"
                type="text"
                inputMode="decimal"
                placeholder="0 - 200"
                value={phosphorus}
                onChange={(e) => sanitizeNumericInput(e.target.value, setPhosphorus)}
                aria-invalid={Boolean(validationErrors.phosphorus)}
                aria-describedby={validationErrors.phosphorus ? 'k-crop-p-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.phosphorus 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.phosphorus && (
                <p id="k-crop-p-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.phosphorus}</p>
              )}
            </div>
          </div>

          {/* Row 2: Potassium (K) | Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="k-crop-k" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                POTASSIUM (K)
              </label>
              <input
                id="k-crop-k"
                type="text"
                inputMode="decimal"
                placeholder="0 - 200"
                value={potassium}
                onChange={(e) => sanitizeNumericInput(e.target.value, setPotassium)}
                aria-invalid={Boolean(validationErrors.potassium)}
                aria-describedby={validationErrors.potassium ? 'k-crop-k-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.potassium 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.potassium && (
                <p id="k-crop-k-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.potassium}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="k-crop-temp" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  TEMPERATURE
                </label>
                <span 
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  title="Auto-filled from 30-day agro-climatic telemetry"
                >
                  AUTO
                </span>
              </div>
              <input
                id="k-crop-temp"
                type="text"
                inputMode="decimal"
                placeholder="-10 to 50"
                value={temperature}
                onChange={(e) => sanitizeNumericInput(e.target.value, setTemperature, true)}
                aria-invalid={Boolean(validationErrors.temperature)}
                aria-describedby={validationErrors.temperature ? 'k-crop-temp-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.temperature 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.temperature && (
                <p id="k-crop-temp-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.temperature}</p>
              )}
            </div>
          </div>

          {/* Row 3: Humidity | PH Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="k-crop-hum" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  HUMIDITY
                </label>
                <span 
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  title="Auto-filled from 30-day mean relative humidity"
                >
                  AUTO
                </span>
              </div>
              <input
                id="k-crop-hum"
                type="text"
                inputMode="decimal"
                placeholder="0 - 100"
                value={humInput}
                onChange={(e) => sanitizeNumericInput(e.target.value, setHumInput)}
                aria-invalid={Boolean(validationErrors.humidity)}
                aria-describedby={validationErrors.humidity ? 'k-crop-hum-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.humidity 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.humidity && (
                <p id="k-crop-hum-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.humidity}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="k-crop-ph" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                PH LEVEL
              </label>
              <input
                id="k-crop-ph"
                type="text"
                inputMode="decimal"
                placeholder="0 - 14"
                value={ph}
                onChange={(e) => sanitizeNumericInput(e.target.value, setPh)}
                aria-invalid={Boolean(validationErrors.ph)}
                aria-describedby={validationErrors.ph ? 'k-crop-ph-err' : undefined}
                className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                  validationErrors.ph 
                    ? 'border-rose-500 ring-1 ring-rose-500' 
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
                required
              />
              {validationErrors.ph && (
                <p id="k-crop-ph-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.ph}</p>
              )}
            </div>
          </div>

          {/* Row 4: Rainfall (Full Width) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="k-crop-rain" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                RAINFALL
              </label>
              <span 
                className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                title="Auto-filled from 30-day cumulative precipitation"
              >
                AUTO
              </span>
            </div>
            <input
              id="k-crop-rain"
              type="text"
              inputMode="decimal"
              placeholder="0 - 3000"
              value={rainfall}
              onChange={(e) => sanitizeNumericInput(e.target.value, setRainfall)}
              aria-invalid={Boolean(validationErrors.rainfall)}
              aria-describedby={validationErrors.rainfall ? 'k-crop-rain-err' : undefined}
              className={`w-full h-11 px-4 rounded-xl bg-[#0E1B2A] border text-white text-sm focus:outline-none transition shadow-inner placeholder:text-slate-600 ${
                validationErrors.rainfall 
                  ? 'border-rose-500 ring-1 ring-rose-500' 
                  : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
              }`}
              required
            />
            {validationErrors.rainfall && (
              <p id="k-crop-rain-err" className="text-[10px] text-rose-400 font-medium">{validationErrors.rainfall}</p>
            )}
          </div>

          {/* Predict Ideal Crop Button (Matching Image 1: Emerald button with sprout icon) */}
          <button
            type="submit"
            disabled={!isFormComplete || isPredicting}
            className="w-full h-12 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
          >
            {isPredicting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Agro-Climate & Soil Model...</span>
              </>
            ) : (
              <>
                <Sprout className="w-5 h-5" />
                <span>Predict Ideal Crop</span>
              </>
            )}
          </button>

          {/* Single Muted Caption + Reset live button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
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
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline font-semibold shrink-0"
              title="Restore temperature, humidity, and rainfall from live API"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to live data</span>
            </button>
          </div>

        </form>

        {/* ── RIGHT COLUMN: RECOMMENDED MATCH PANEL (Image 1 Layout) ────────── */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <div className="w-full min-h-[460px] rounded-2xl border border-slate-800 bg-[#0C1724]/90 backdrop-blur-md p-6 sm:p-7 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300">
            
            {/* Subtle decorative gradient glow */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Empty State */}
            {!predictionResult && !isPredicting && !predictionError && (
              <div className="flex flex-col items-center justify-center space-y-4 p-6 my-auto">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                  <Sprout className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  Recommended Match Preview
                </h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Enter soil values or click a <strong className="text-emerald-400">Soil Preset</strong> above, then tap <strong className="text-emerald-400">Predict Ideal Crop</strong> to generate the optimal agricultural match.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2">
                  <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-400" /> 22 Crop Classes</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-amber-400" /> Fertilizer Guidance</span>
                </div>
              </div>
            )}

            {/* 2. Loading State */}
            {isPredicting && (
              <div className="flex flex-col items-center justify-center space-y-4 p-8 my-auto">
                <div className="relative">
                  <div className="w-16 h-16 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <Sprout className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Evaluating Random Forest classifier across 22 crop classes...
                </p>
              </div>
            )}

            {/* 3. Error State */}
            {predictionError && (
              <div className="flex flex-col items-center justify-center space-y-3 p-6 text-rose-400 my-auto">
                <AlertTriangle className="w-10 h-10" />
                <p className="text-xs font-semibold">{predictionError}</p>
                <button
                  type="button"
                  onClick={handlePredictCrop}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition"
                >
                  Retry Prediction
                </button>
              </div>
            )}

            {/* 4. Result State (Image 1 Layout: RECOMMENDED MATCH badge + Crop + Sentence + Photo) */}
            {predictionResult && !isPredicting && (
              <div className="w-full flex flex-col items-center space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Inputs Changed Notice */}
                {hasInputsChanged && (
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1">
                    Inputs changed — predict again
                  </span>
                )}

                {/* RECOMMENDED MATCH Pill + Confidence Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    RECOMMENDED MATCH
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${getConfidenceBadgeColor(predictionResult.confidence)}`}>
                    {Math.round(predictionResult.confidence * 100)}% Match
                  </div>
                </div>

                {/* Big Crop Heading */}
                <h3 className="text-3xl sm:text-4xl font-black text-[#10B981] tracking-tight capitalize leading-tight">
                  {predictionResult.recommended_crop}
                </h3>

                {/* Subtitle Sentence */}
                <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                  {predictionResult.recommended_crop} is the best crop to be cultivated right there.
                </p>

                {/* Crop Photo (Clean rounded frame) */}
                <div className="w-full max-w-[340px] h-44 sm:h-52 rounded-2xl overflow-hidden shadow-xl border border-slate-700/80 bg-slate-900 mt-1">
                  <img 
                    src={predictionResult.primary_image_url} 
                    alt={predictionResult.recommended_crop}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-400">
                            <span class="text-4xl">🌱</span>
                            <span class="text-sm font-bold mt-2 text-white capitalize">${predictionResult.recommended_crop}</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>

                {/* ── FERTILIZER RECOMMENDATION PANEL ── */}
                {predictionResult.fertilizer_recommendation && (
                  <div className="w-full p-3.5 rounded-2xl bg-[#091522] border border-amber-500/30 text-left space-y-2 mt-2">

                    {/* Header row: icon + label + ratio badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <FlaskConical className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Fertilizer Advisory</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {predictionResult.fertilizer_recommendation.primary_fertilizer}
                        </span>
                        {predictionResult.fertilizer_recommendation.secondary_fertilizer && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                            + {predictionResult.fertilizer_recommendation.secondary_fertilizer}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ★ HIGHLIGHTED FERTILIZER NAME ★ */}
                    {predictionResult.fertilizer_recommendation.fertilizer_name && (
                      <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                        <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-base font-extrabold text-amber-300 tracking-tight leading-none">
                          {predictionResult.fertilizer_recommendation.fertilizer_name}
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {predictionResult.fertilizer_recommendation.reasoning}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-300">Target Dose: </span>
                        <span>{predictionResult.fertilizer_recommendation.dose_guidance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>N: <strong className="text-white">{predictionResult.fertilizer_recommendation.npk_gap.nitrogen_status}</strong></span>
                        <span>P: <strong className="text-white">{predictionResult.fertilizer_recommendation.npk_gap.phosphorus_status}</strong></span>
                        <span>K: <strong className="text-white">{predictionResult.fertilizer_recommendation.npk_gap.potassium_status}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Growth Hints 2x2 Grid ── */}
                {predictionResult.growth_hints && Object.keys(predictionResult.growth_hints).length > 0 && (
                  <div className="w-full grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(predictionResult.growth_hints).map(([key, value]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
                        <div className="flex items-center gap-1 mb-0.5">
                          {key.toLowerCase().includes('sowing') && <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {key.toLowerCase().includes('fertilizer') && <FlaskConical className="w-3 h-3 text-amber-400 shrink-0" />}
                          {key.toLowerCase().includes('classification') && <Leaf className="w-3 h-3 text-lime-400 shrink-0" />}
                          {key.toLowerCase().includes('season') && <Sprout className="w-3 h-3 text-teal-400 shrink-0" />}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">{key}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200 leading-snug block">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Top Alternative Crops (Also Suitable) ── */}
                {predictionResult.top_alternatives && predictionResult.top_alternatives.length > 0 && (
                  <div className="w-full mt-2 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-left">
                      ALSO SUITABLE
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {predictionResult.top_alternatives.map((alt) => (
                        <div key={alt.crop} className="flex-shrink-0 w-[125px] rounded-xl border border-slate-800 bg-[#0E1A29] overflow-hidden shadow-xs hover:border-slate-700 transition">
                          <div className="w-full h-16 bg-slate-900 overflow-hidden">
                            <img 
                              src={alt.image_url} 
                              alt={alt.crop}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          <div className="p-1.5 text-left">
                            <span className="text-[11px] font-bold text-white block truncate">{alt.crop}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(alt.confidence * 100)}%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 shrink-0">{Math.round(alt.confidence * 100)}%</span>
                            </div>
                            {alt.ideal_season && (
                              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{alt.ideal_season}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safeguard Footer */}
                <div className="pt-2 text-[10px] text-slate-400 leading-tight border-t border-slate-800/80 mt-1 w-full">
                  <span>Source: {predictionResult.source === 'ml_model' ? 'Random Forest ML Model' : 'Agronomy Rule Engine'} • Advisory only — consult your local Krishi Vigyan Kendra (KVK)</span>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
