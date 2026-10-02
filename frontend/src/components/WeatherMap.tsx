'use client';

import React from 'react';
import { Location } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { WeatherMapsSection } from './WeatherMaps/WeatherMapsSection';
import { Radio, ShieldCheck } from 'lucide-react';

export interface WeatherMapProps {
  currentLocation: Location;
  onSelectCoordinates?: (city: {
    name: string;
    lat: number;
    lon: number;
    default_persona: string;
  }) => void;
}

export type WeatherLayer = 'radar' | 'wind' | 'temp' | 'clouds' | 'airq';
export type GoogleMapType = 'roadmap' | 'satellite' | 'terrain';

export const WeatherMap: React.FC<WeatherMapProps> = ({
  currentLocation,
  onSelectCoordinates,
}) => {
  const { t } = useLanguage();

  return (
    <section className="space-y-4 pt-2">
      {/* ── SECTION HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Radio className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-pulse" />
              Live Meteorological Maps
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Real-time API Feed
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.map_title || 'Interactive Doppler Radar & Weather Maps'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t.map_subtitle || 'Real-time Doppler precipitation radar, live wind streamlines, temperature fields, and satellite cloud imagery.'}
          </p>
        </div>
      </div>

      {/* ── COMPLETE INTERACTIVE REAL-TIME MAP MODULE ─────────────────── */}
      <WeatherMapsSection
        currentLocation={currentLocation}
        onSelectCoordinates={onSelectCoordinates}
      />
    </section>
  );
};

export default WeatherMap;
