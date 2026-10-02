'use client';

import React from 'react';
import { 
  Layers, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Cloud, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export type WeatherMapLayerType = 'radar' | 'wind' | 'temp' | 'clouds' | 'airq';

interface MapLayerSelectorProps {
  activeLayer: WeatherMapLayerType;
  onSelectLayer: (layer: WeatherMapLayerType) => void;
  onOpenAllMaps: () => void;
}

export const MapLayerSelector: React.FC<MapLayerSelectorProps> = ({
  activeLayer,
  onSelectLayer,
  onOpenAllMaps,
}) => {
  const { t } = useLanguage();

  const layers: Array<{ id: WeatherMapLayerType; label: string; icon: React.ReactNode }> = [
    {
      id: 'radar',
      label: t.map_layer_radar || 'RADAR',
      icon: <CloudRain className="w-3.5 h-3.5" />,
    },
    {
      id: 'wind',
      label: t.map_layer_wind || 'WIND FLOW (KPH)',
      icon: <Wind className="w-3.5 h-3.5" />,
    },
    {
      id: 'temp',
      label: t.map_layer_temperature || 'TEMPERATURE (°C)',
      icon: <Thermometer className="w-3.5 h-3.5" />,
    },
    {
      id: 'clouds',
      label: t.map_layer_clouds || 'CLOUDS',
      icon: <Cloud className="w-3.5 h-3.5" />,
    },
    {
      id: 'airq',
      label: t.map_layer_aqi || 'AIR QUALITY INDEX',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar select-none">
      {/* 1. "ALL MAPS" Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenAllMaps}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-sky-400 active:scale-95"
        title="Open All Weather Maps Catalog"
      >
        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span>{t.map_all_maps || 'ALL MAPS'}</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
      </button>

      {/* Vertical Divider */}
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 shrink-0 mx-0.5" />

      {/* 2. Direct Weather Layer Chips */}
      {layers.map((layer) => {
        const isActive = activeLayer === layer.id;
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelectLayer(layer.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
              isActive
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-md ring-2 ring-sky-400/30'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs'
            }`}
          >
            <span className={isActive ? 'text-sky-300 dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}>
              {layer.icon}
            </span>
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
