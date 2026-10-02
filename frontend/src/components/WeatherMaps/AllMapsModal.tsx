'use client';

import React from 'react';
import { 
  X, 
  CloudRain, 
  Cloud, 
  Droplets, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Flame, 
  Thermometer, 
  Wind,
  Info,
  Check
} from 'lucide-react';
import { WeatherMapLayerType } from './MapLayerSelector';
import { useLanguage } from '../../hooks/useLanguage';

interface AllMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayer: WeatherMapLayerType;
  onSelectLayer: (layer: WeatherMapLayerType) => void;
}

interface MapCatalogItem {
  id: WeatherMapLayerType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface MapCatalogSection {
  title: string;
  info: string;
  items: MapCatalogItem[];
}

export const AllMapsModal: React.FC<AllMapsModalProps> = ({
  isOpen,
  onClose,
  activeLayer,
  onSelectLayer,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const sections: MapCatalogSection[] = [
    {
      title: t.map_category_radar || 'Radar',
      info: 'Real-time IMD & international Doppler radar telemetry',
      items: [
        {
          id: 'radar',
          title: t.map_radar_layer || 'Doppler Radar Precipitation',
          subtitle: t.map_legend_rain_desc || 'Live storm cells, rainfall intensity & timeline history',
          icon: <CloudRain className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
        },
      ],
    },
    {
      title: t.map_category_satellite || 'Satellite View',
      info: 'Geostationary infrared cloud cover',
      items: [
        {
          id: 'clouds',
          title: t.map_satellite_layer || 'Infrared Cloud Canopy',
          subtitle: t.map_legend_clouds_desc || 'Atmospheric moisture & cyclone cloud bands',
          icon: <Cloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        },
        {
          id: 'clouds',
          title: t.map_layer_clouds || 'Color-Enhanced Clouds',
          subtitle: t.map_legend_clouds || 'Thermal cloud-top height analysis and convective fronts',
          icon: <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
        },
      ],
    },
    {
      title: t.map_category_severe || 'Severe Weather',
      info: 'Government advisories and severe thunderstorm warnings',
      items: [
        {
          id: 'radar',
          title: t.bulletin_title || 'Government Advisories & Warnings',
          subtitle: t.map_legend_heatwave_desc || 'IMD weather alerts and active cyclone tracks',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        },
        {
          id: 'radar',
          title: t.map_legend_heatwave || 'Convective Storms & Warnings',
          subtitle: t.risk_critical_hazard || 'High-energy thunderstorm strikes & flash hazard zones',
          icon: <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
        },
      ],
    },
    {
      title: t.map_category_air_quality || 'Air Quality',
      info: 'CPCB national air monitoring and aerosol optical depth',
      items: [
        {
          id: 'airq',
          title: t.map_aqi_layer || 'National Air Quality Index (AQI)',
          subtitle: t.health_pm25_desc || 'Real-time PM2.5, PM10, and atmospheric pollutant distribution',
          icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        },
        {
          id: 'airq',
          title: t.sensitivity_pollution || 'Pollution & Smoke Transport',
          subtitle: t.sensitivity_dust || 'Regional smoke transport, stubble burning & dust dispersal',
          icon: <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
        },
      ],
    },
    {
      title: t.map_category_current || 'Current Conditions',
      info: 'Surface meteorology across Indian stations',
      items: [
        {
          id: 'temp',
          title: t.map_temperature_layer || 'Surface Temperature (°C)',
          subtitle: t.map_heat_legend_title || 'Live thermal field, heatwave thresholds, and station readings',
          icon: <Thermometer className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        },
        {
          id: 'wind',
          title: t.map_wind_layer || 'Surface Wind Streamlines (km/h)',
          subtitle: t.metric_wind || 'Animated wind vectors, monsoon flow direction & gust speeds',
          icon: <Wind className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-in Drawer Container */}
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-sky-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              {t.map_all_maps_title || t.map_all_maps || 'All Weather Maps'}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
              Live APIs
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={t.btn_close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Categorized Lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {sec.title}
                </span>
                <span title={sec.info} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help">
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Items in section */}
              <div className="space-y-1.5">
                {sec.items.map((item, itemIdx) => {
                  const isCurrent = activeLayer === item.id;
                  return (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => {
                        onSelectLayer(item.id);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between group border ${
                        isCurrent
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs group-hover:scale-105 transition">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] text-slate-500 dark:text-slate-400 text-center font-mono">
          Connected Providers: RainViewer Radar & Satellite • Open-Meteo
        </div>

      </div>
    </div>
  );
};
