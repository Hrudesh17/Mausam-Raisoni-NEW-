'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  AlertTriangle,
  Info,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { Location } from '../../lib/types';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { 
  MapLayerSelector, 
  WeatherMapLayerType 
} from './MapLayerSelector';
import { AllMapsModal } from './AllMapsModal';
import { MapTimeline } from './MapTimeline';
import { MapLegend } from './MapLegend';
import { MapControls } from './MapControls';
import { RainViewerRadarMap } from './RainViewerRadarMap';
import { WindyWeatherMap } from './WindyWeatherMap';
import { 
  fetchRainViewerMetadata, 
  RainViewerMetadata, 
  LIVE_INDIAN_STATIONS,
  MapStationTelemetry 
} from './MapProviderService';

interface WeatherMapsSectionProps {
  currentLocation: Location;
  onSelectCoordinates?: (city: {
    name: string;
    lat: number;
    lon: number;
    default_persona: string;
  }) => void;
}

export const WeatherMapsSection: React.FC<WeatherMapsSectionProps> = ({
  currentLocation,
  onSelectCoordinates,
}) => {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Map Layer & Modals
  const [activeLayer, setActiveLayer] = useState<WeatherMapLayerType>('radar');
  const [isAllMapsOpen, setIsAllMapsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [baseMapType, setBaseMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Geographic coordinates & viewport
  const [zoom, setZoom] = useState<number>(5);
  const [center, setCenter] = useState<{ lat: number; lon: number }>({
    lat: currentLocation?.lat || 20.5937,
    lon: currentLocation?.lon || 78.9629, // Centered on India
  });

  // RainViewer Real-time Radar & Cloud frames
  const [metadata, setMetadata] = useState<RainViewerMetadata | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingFrames, setIsLoadingFrames] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected station telemetry card
  const [selectedStation, setSelectedStation] = useState<MapStationTelemetry | null>(LIVE_INDIAN_STATIONS[0]);

  // Sync with currentLocation prop
  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      setCenter({ lat: currentLocation.lat, lon: currentLocation.lon });
      const nearest = LIVE_INDIAN_STATIONS.find(
        (s) => Math.hypot(s.lat - currentLocation.lat, s.lon - currentLocation.lon) < 1.0
      );
      if (nearest) {
        setSelectedStation(nearest);
      }
    }
  }, [currentLocation]);

  // Load RainViewer Radar Frames on Mount
  const loadRadarData = useCallback(async () => {
    setIsLoadingFrames(true);
    setFetchError(null);
    try {
      const data = await fetchRainViewerMetadata();
      setMetadata(data);
      if (data.radarFrames && data.radarFrames.length > 0) {
        // Default to the latest past frame (current "NOW" condition)
        const nowIndex = data.radarFrames.findIndex((f) => f.type === 'nowcast');
        const defaultIndex = nowIndex > 0 ? nowIndex - 1 : data.radarFrames.length - 1;
        setCurrentFrameIndex(defaultIndex);
      }
    } catch (err: any) {
      console.warn('Failed to fetch RainViewer radar telemetry:', err);
      setFetchError('Live radar frames temporarily buffering. Retrying...');
    } finally {
      setIsLoadingFrames(false);
    }
  }, []);

  useEffect(() => {
    loadRadarData();
  }, [loadRadarData]);

  // Animation Loop for Radar Playback
  useEffect(() => {
    if (!isPlaying || !metadata || !metadata.radarFrames || metadata.radarFrames.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        const next = prevIndex + 1;
        return next >= metadata.radarFrames.length ? 0 : next;
      });
    }, 750); // 750ms per frame for smooth Doppler radar motion

    return () => clearInterval(interval);
  }, [isPlaying, metadata]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true); // fallback CSS fullscreen
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleRecenter = () => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      setCenter({ lat: currentLocation.lat, lon: currentLocation.lon });
      setZoom(6);
    } else {
      setCenter({ lat: 20.5937, lon: 78.9629 });
      setZoom(5);
    }
  };

  const currentFrame = metadata?.radarFrames?.[currentFrameIndex] || null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen'
          : 'h-[400px] sm:h-[520px] lg:h-[650px]'
      } bg-slate-900`}
    >
      {/* ── TOP FLOATING CONTROL BAR ────────────────────────────────────── */}
      <div className="absolute top-3 inset-x-3 z-30 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Location Pill + Status Badges */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          
          {/* Location Badge (Matching Reference Images 2, 3, 4, 5) */}
          <button
            type="button"
            onClick={handleRecenter}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-md text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-sky-50 dark:hover:bg-slate-800 transition active:scale-95 group"
            title="Click to Recenter on Location"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-xs">
              {currentLocation?.name || 'Pune, Maharashtra'}
            </span>
          </button>

          {/* Provider Telemetry Tag */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {activeLayer === 'radar' || activeLayer === 'clouds' 
                ? 'RainViewer Doppler' 
                : 'Windy WebGL Engine'}
            </span>
          </div>
        </div>

        {/* Row 2: Horizontal Layer Chips Selector */}
        <div className="pointer-events-auto">
          <MapLayerSelector
            activeLayer={activeLayer}
            onSelectLayer={(l) => {
              setActiveLayer(l);
              setIsPlaying(false);
            }}
            onOpenAllMaps={() => setIsAllMapsOpen(true)}
          />
        </div>

      </div>

      {/* ── MAP VIEWPORT (RainViewer vs Windy) ─────────────────────────── */}
      <div className="w-full h-full">
        {activeLayer === 'radar' || activeLayer === 'clouds' ? (
          <RainViewerRadarMap
            currentLocation={currentLocation}
            metadata={metadata}
            currentFrame={currentFrame}
            activeLayer={activeLayer}
            zoom={zoom}
            center={center}
            onCenterChange={setCenter}
            onZoomChange={setZoom}
            onSelectStation={(station) => {
              setSelectedStation(station);
              if (onSelectCoordinates) {
                onSelectCoordinates({
                  name: station.name,
                  lat: station.lat,
                  lon: station.lon,
                  default_persona: 'commuter',
                });
              }
            }}
            baseMapType={baseMapType}
          />
        ) : (
          <WindyWeatherMap
            center={center}
            zoom={zoom}
            overlay={activeLayer === 'wind' ? 'wind' : activeLayer === 'temp' ? 'temp' : 'airq'}
          />
        )}
      </div>

      {/* ── MAP CONTROLS & RIGHT LEGEND ─────────────────────────────────── */}
      <MapLegend activeLayer={activeLayer} />

      <MapControls
        onZoomIn={() => setZoom((z) => Math.min(z + 1, 10))}
        onZoomOut={() => setZoom((z) => Math.max(z - 1, 3))}
        onRecenterLocation={handleRecenter}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        baseMapType={baseMapType}
        onToggleBaseMap={
          activeLayer === 'radar' || activeLayer === 'clouds'
            ? () => setBaseMapType((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'))
            : undefined
        }
      />

      {/* ── BOTTOM DOCKED TIMELINE BAR (When Radar / Clouds Active) ────── */}
      {(activeLayer === 'radar' || activeLayer === 'clouds') && metadata && metadata.radarFrames && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-30 max-w-2xl mx-auto pointer-events-auto">
          <MapTimeline
            frames={metadata.radarFrames}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSelectFrame={(idx) => {
              setCurrentFrameIndex(idx);
              setIsPlaying(false);
            }}
          />
        </div>
      )}

      {/* ── SELECTED STATION POPUP CARD (Bottom-Left) ──────────────────── */}
      {selectedStation && (
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden md:block">
          <div className="pointer-events-auto p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl max-w-xs text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                {selectedStation.fullName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'तापमान' : language === 'mr' ? 'तापमान' : language === 'bn' ? 'তাপমাত্রা' : language === 'te' ? 'ఉష్ణోగ్రత' : 'Temp'}
                </p>
                <p className="font-black text-slate-900 dark:text-white">{selectedStation.temp}°C</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'हवा' : language === 'mr' ? 'वारा' : language === 'bn' ? 'বাতাস' : language === 'te' ? 'గాలి' : 'Wind'}
                </p>
                <p className="font-black text-emerald-600 dark:text-emerald-400">{selectedStation.windSpeed} km/h</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'वायु गुणवत्ता' : language === 'mr' ? 'हवा गुणवत्ता' : language === 'bn' ? 'বায়ু মান' : language === 'te' ? 'గాలి నాణ్యత' : 'AQI'}
                </p>
                <p className="font-black text-amber-600 dark:text-amber-400">{selectedStation.aqi}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL MAPS CATEGORIZED DRAWER MODAL ───────────────────────────── */}
      <AllMapsModal
        isOpen={isAllMapsOpen}
        onClose={() => setIsAllMapsOpen(false)}
        activeLayer={activeLayer}
        onSelectLayer={(l) => {
          setActiveLayer(l);
          setIsPlaying(false);
        }}
      />
    </div>
  );
};
