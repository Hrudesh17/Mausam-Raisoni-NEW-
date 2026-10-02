'use client';

import React from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Minimize2,
  Map as MapIcon,
  Globe2
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenterLocation: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  baseMapType?: 'roadmap' | 'satellite';
  onToggleBaseMap?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenterLocation,
  isFullscreen,
  onToggleFullscreen,
  baseMapType = 'roadmap',
  onToggleBaseMap,
}) => {
  const { t } = useLanguage();

  return (
    <div className="absolute right-3 bottom-20 z-30 flex flex-col gap-2 select-none">
      
      {/* Zoom In & Out Pill Stack */}
      <div className="flex flex-col rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95"
          title={t.map_zoom_in || 'Zoom In'}
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95"
          title={t.map_zoom_out || 'Zoom Out'}
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* "My Location" Recenter Button */}
      <button
        type="button"
        onClick={onRecenterLocation}
        className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95"
        title={t.map_my_location || 'Show My Location'}
        aria-label="Center on my location"
      >
        <Crosshair className="w-4 h-4" />
      </button>

      {/* Base Map Toggle (Roadmap vs Satellite) */}
      {onToggleBaseMap && (
        <button
          type="button"
          onClick={onToggleBaseMap}
          className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95"
          title={baseMapType === 'roadmap' ? (t.map_satellite_layer || 'Satellite View') : (t.map_all_maps_title || 'Map View')}
          aria-label="Toggle base map style"
        >
          {baseMapType === 'roadmap' ? (
            <Globe2 className="w-4 h-4" />
          ) : (
            <MapIcon className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Fullscreen Expand / Collapse */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95"
        title={t.map_fullscreen || 'Toggle Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

    </div>
  );
};
