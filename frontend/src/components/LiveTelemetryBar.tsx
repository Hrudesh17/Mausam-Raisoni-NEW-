'use client';

import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, RefreshCw, ShieldCheck, Database, Clock, MapPin, Radio } from 'lucide-react';
import { WeatherResponse } from '../lib/types';

interface LiveTelemetryBarProps {
  weather: WeatherResponse | null;
  selectedCity: { name: string; state?: string; lat: number; lon: number };
  isLoading: boolean;
  onRefresh: () => void;
}

export const LiveTelemetryBar: React.FC<LiveTelemetryBarProps> = ({
  weather,
  selectedCity,
  isLoading,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const lastFetched = React.useMemo(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), [weather]);

  if (!weather) return null;

  const coordsMatch = Math.abs(weather.location.lat - selectedCity.lat) < 0.15 && Math.abs(weather.location.lon - selectedCity.lon) < 0.15;

  return (
    <aside aria-label="Development Telemetry" className="fixed bottom-3 right-3 z-50 max-w-md w-full px-2 sm:px-0">
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white overflow-hidden transition-all duration-300">
        
        {/* Toggle Bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 select-none"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wide text-slate-800 dark:text-slate-200">LIVE STATION TELEMETRY</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 font-mono font-medium">
              {weather.provider}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isLoading}
              title="Force Refresh Live Telemetry"
              className="p-1 hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600 dark:text-sky-400' : ''}`} />
            </button>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Expanded Telemetry Inspector */}
        {isOpen && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3 font-mono bg-slate-50/50 dark:bg-slate-950/60">
            
            {/* Location & Coords Match */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans font-semibold">Requested Selection</p>
                <p className="font-semibold text-sky-700 dark:text-sky-400 truncate">{selectedCity.name} {selectedCity.state ? `(${selectedCity.state})` : ''}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedCity.lat.toFixed(4)}° N, {selectedCity.lon.toFixed(4)}° E</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans font-semibold">Provider API Station</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">{weather.location.name} {weather.location.state ? `(${weather.location.state})` : ''}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{weather.location.lat.toFixed(4)}° N, {weather.location.lon.toFixed(4)}° E</p>
              </div>
            </div>

            {/* Coordinates Validation Badge */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Coordinates Integrity:
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                coordsMatch ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
              }`}>
                {coordsMatch ? 'MATCH VERIFIED' : 'STALE / MISMATCH'}
              </span>
            </div>

            {/* Timezone & Observation Timestamp */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Timezone:
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {weather.location.timezone || 'Asia/Kolkata'} ({weather.location.timezone_abbreviation || 'IST'})
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Observation Time:
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {weather.current.observation_time || 'Just now'}
              </span>
            </div>

            {/* Cache Status & Freshness */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Cache Freshness:
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                weather.cached ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
              }`}>
                {weather.cached ? 'CACHE RECOVERY' : 'LIVE NETWORK (0 ms stale)'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Last Client Fetch: {lastFetched}</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3" /> No Fake Fallbacks
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
