'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RainViewerFrame, 
  RainViewerMetadata, 
  getRainViewerTileUrl, 
  LIVE_INDIAN_STATIONS,
  MapStationTelemetry 
} from './MapProviderService';
import { Location } from '../../lib/types';
import { useTheme } from '../../hooks/useTheme';

interface RainViewerRadarMapProps {
  currentLocation: Location;
  metadata: RainViewerMetadata | null;
  currentFrame: RainViewerFrame | null;
  activeLayer: 'radar' | 'clouds';
  zoom: number;
  center: { lat: number; lon: number };
  onCenterChange: (center: { lat: number; lon: number }) => void;
  onZoomChange: (zoom: number) => void;
  onSelectStation: (station: MapStationTelemetry) => void;
  baseMapType: 'roadmap' | 'satellite';
}

// Mercator Projection Math
const lon2x = (lon: number, zoom: number) => ((lon + 180) / 360) * Math.pow(2, zoom);
const lat2y = (lat: number, zoom: number) =>
  ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
  Math.pow(2, zoom);

const x2lon = (x: number, zoom: number) => (x / Math.pow(2, zoom)) * 360 - 180;
const y2lat = (y: number, zoom: number) => {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

export const RainViewerRadarMap: React.FC<RainViewerRadarMapProps> = ({
  currentLocation,
  metadata,
  currentFrame,
  activeLayer,
  zoom,
  center,
  onCenterChange,
  onZoomChange,
  onSelectStation,
  baseMapType,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, lat: center.lat, lon: center.lon });
  const touchDistanceRef = useRef<number | null>(null);

  // Tile Caching
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const radarCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setRerenderTrigger] = useState(0);

  const TILE_SIZE = 256;

  // Base Map Tile URL generator (CartoDB / OSM / Satellite)
  const getBaseTileUrl = useCallback((x: number, y: number, z: number): string => {
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(x + y) % subdomains.length];
    
    if (baseMapType === 'satellite') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    
    if (isDark) {
      // CartoDB Dark Matter tiles
      return `https://${s}.basemaps.cartocdn.com/rastertiles/dark_all/${z}/${x}/${y}.png`;
    } else {
      // CartoDB Voyager tiles (clean, light, modern)
      return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
    }
  }, [baseMapType, isDark]);

  // Pixel to Lat/Lon conversions
  const latlonToPixel = useCallback(
    (lat: number, lon: number, canvasW: number, canvasH: number) => {
      const cx = lon2x(center.lon, zoom);
      const cy = lat2y(center.lat, zoom);
      const px = lon2x(lon, zoom);
      const py = lat2y(lat, zoom);
      return {
        x: canvasW / 2 + (px - cx) * TILE_SIZE,
        y: canvasH / 2 + (py - cy) * TILE_SIZE,
      };
    },
    [center, zoom]
  );

  // Preload adjacent frames
  useEffect(() => {
    if (!metadata || !metadata.radarFrames) return;
    const host = metadata.host;
    // Preload current frame + next 2 frames
    const framesToPreload = metadata.radarFrames.slice(0, 8);
    framesToPreload.forEach((f) => {
      const sampleTile = getRainViewerTileUrl(host, f.path, zoom, Math.floor(lon2x(center.lon, zoom)), Math.floor(lat2y(center.lat, zoom)), 2);
      if (!radarCacheRef.current.has(sampleTile)) {
        const img = new Image();
        img.src = sampleTile;
        radarCacheRef.current.set(sampleTile, img);
      }
    });
  }, [metadata, center, zoom]);

  // Main Canvas Render Loop
  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Calculate Mercator visible tile bounds
    const cx = lon2x(center.lon, zoom);
    const cy = lat2y(center.lat, zoom);
    const offsetX = W / 2 - (cx % 1) * TILE_SIZE;
    const offsetY = H / 2 - (cy % 1) * TILE_SIZE;

    const tileX0 = Math.floor(cx) - Math.ceil(W / 2 / TILE_SIZE) - 1;
    const tileY0 = Math.floor(cy) - Math.ceil(H / 2 / TILE_SIZE) - 1;
    const tileX1 = Math.floor(cx) + Math.ceil(W / 2 / TILE_SIZE) + 1;
    const tileY1 = Math.floor(cy) + Math.ceil(H / 2 / TILE_SIZE) + 1;

    const maxTiles = Math.pow(2, zoom);

    // Draw Base Tiles
    for (let tx = tileX0; tx <= tileX1; tx++) {
      for (let ty = tileY0; ty <= tileY1; ty++) {
        if (ty < 0 || ty >= maxTiles) continue;
        const wrappedTx = ((tx % maxTiles) + maxTiles) % maxTiles;
        const baseKey = `base/${baseMapType}/${isDark}/${zoom}/${wrappedTx}/${ty}`;
        const px = offsetX + (tx - Math.floor(cx)) * TILE_SIZE;
        const py = offsetY + (ty - Math.floor(cy)) * TILE_SIZE;

        if (tileCacheRef.current.has(baseKey)) {
          const img = tileCacheRef.current.get(baseKey)!;
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = isDark ? '#0b1320' : '#f0f5fa';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
        } else {
          ctx.fillStyle = isDark ? '#0b1320' : '#f0f5fa';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = getBaseTileUrl(wrappedTx, ty, zoom);
          img.onload = () => {
            tileCacheRef.current.set(baseKey, img);
            setRerenderTrigger((n) => n + 1);
          };
          tileCacheRef.current.set(baseKey, img);
        }

        // 2. Overlay RainViewer Doppler Radar / Satellite Cloud Tiles
        if (metadata && currentFrame) {
          const radarKey = `radar/${currentFrame.path}/${zoom}/${wrappedTx}/${ty}`;
          const radarUrl = getRainViewerTileUrl(metadata.host, currentFrame.path, zoom, wrappedTx, ty, 2, true);

          if (radarCacheRef.current.has(radarKey)) {
            const rImg = radarCacheRef.current.get(radarKey)!;
            if (rImg.complete && rImg.naturalWidth > 0) {
              ctx.globalAlpha = 0.82;
              ctx.drawImage(rImg, px, py, TILE_SIZE, TILE_SIZE);
              ctx.globalAlpha = 1.0;
            }
          } else {
            const rImg = new Image();
            rImg.crossOrigin = 'anonymous';
            rImg.src = radarUrl;
            rImg.onload = () => {
              radarCacheRef.current.set(radarKey, rImg);
              setRerenderTrigger((n) => n + 1);
            };
            radarCacheRef.current.set(radarKey, rImg);
          }
        }
      }
    }

    // 3. Draw City Meteorological Badges (As seen in Reference Image 4)
    LIVE_INDIAN_STATIONS.forEach((station) => {
      const pos = latlonToPixel(station.lat, station.lon, W, H);
      if (pos.x < -60 || pos.x > W + 60 || pos.y < -60 || pos.y > H + 60) return;

      // Draw City Point Dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Draw City Name & Temperature Label Badge
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      const labelText = `${station.name} ${station.temp}°`;
      const textMetrics = ctx.measureText(labelText);
      const badgeW = textMetrics.width + 12;
      const badgeH = 18;
      const badgeX = pos.x + 8;
      const badgeY = pos.y - 9;

      // Badge Background Pill
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.8)';
      ctx.stroke();

      // Badge Text
      ctx.fillStyle = isDark ? '#ffffff' : '#0b1f33';
      ctx.fillText(labelText, badgeX + 6, badgeY + 13);
    });

    // 4. Draw Current User Location Target Pin (As seen in Reference Images 2, 3, 4, 5)
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      const myPos = latlonToPixel(currentLocation.lat, currentLocation.lon, W, H);

      // Outer Pulse Ring
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.fill();

      // Inner Location Bullseye
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Pin center dot
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }, [
    center, 
    zoom, 
    baseMapType, 
    isDark, 
    metadata, 
    currentFrame, 
    currentLocation, 
    getBaseTileUrl, 
    latlonToPixel
  ]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderMap();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderMap]);

  useEffect(() => {
    renderMap();
  }, [renderMap]);

  // Mouse & Touch Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: center.lat,
      lon: center.lon,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const startX = lon2x(dragStartRef.current.lon, zoom);
    const startY = lat2y(dragStartRef.current.lat, zoom);

    const newX = startX - dx / TILE_SIZE;
    const newY = startY - dy / TILE_SIZE;

    const newLon = x2lon(newX, zoom);
    const newLat = Math.max(-85, Math.min(85, y2lat(newY, zoom)));

    onCenterChange({ lat: newLat, lon: newLon });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      onZoomChange(Math.min(zoom + 1, 10));
    } else {
      onZoomChange(Math.max(zoom - 1, 3));
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        lat: center.lat,
        lon: center.lon,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;

      const startX = lon2x(dragStartRef.current.lon, zoom);
      const startY = lat2y(dragStartRef.current.lat, zoom);

      const newX = startX - dx / TILE_SIZE;
      const newY = startY - dy / TILE_SIZE;

      const newLon = x2lon(newX, zoom);
      const newLat = Math.max(-85, Math.min(85, y2lat(newY, zoom)));

      onCenterChange({ lat: newLat, lon: newLon });
    } else if (e.touches.length === 2 && touchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - touchDistanceRef.current;
      if (Math.abs(diff) > 25) {
        if (diff > 0) onZoomChange(Math.min(zoom + 1, 10));
        else onZoomChange(Math.max(zoom - 1, 3));
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Click on Canvas to select station
  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    LIVE_INDIAN_STATIONS.forEach((station) => {
      const pos = latlonToPixel(station.lat, station.lon, canvas.width, canvas.height);
      const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
      if (dist < 20) {
        onSelectStation(station);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
