'use client';

import React, { useState, useEffect } from 'react';
import { getWindyEmbedUrl } from './MapProviderService';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface WindyWeatherMapProps {
  center: { lat: number; lon: number };
  zoom: number;
  overlay: 'wind' | 'temp' | 'airq' | 'clouds';
}

export const WindyWeatherMap: React.FC<WindyWeatherMapProps> = ({
  center,
  zoom,
  overlay,
}) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = getWindyEmbedUrl({
    lat: center.lat,
    lon: center.lon,
    zoom,
    overlay,
    isDark,
  });

  useEffect(() => {
    setIsLoading(true);
  }, [overlay]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs text-white">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" />
          <p className="text-xs font-mono tracking-wider uppercase text-sky-200">
            Initializing Live {overlay.toUpperCase()} Streamlines...
          </p>
        </div>
      )}

      {/* Windy Interactive Embed Frame */}
      <iframe
        src={embedUrl}
        title={`Live Windy Weather Engine - ${overlay}`}
        className="w-full h-full border-0 select-none"
        onLoad={() => setIsLoading(false)}
        allow="geolocation"
        loading="lazy"
      />
    </div>
  );
};
