'use client';

import React, { useState } from 'react';
import { Thermometer, Sun, CloudRain, Droplets, Wind, Activity, Info } from 'lucide-react';
import { HourlyForecast } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

interface DetailedColorCodedGraphsProps {
  hourly: HourlyForecast[];
}

type MetricKey = 'temp' | 'uv' | 'rain' | 'humidity' | 'wind' | 'aqi';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  icon: React.ReactNode;
  getValue: (h: HourlyForecast) => number;
  getColor: (val: number) => { stroke: string; fill: string; text: string; bg: string; tier: string };
  ceiling: (maxVal: number) => number;
  thresholds: { label: string; color: string }[];
}

export const DetailedColorCodedGraphs: React.FC<DetailedColorCodedGraphsProps> = ({ hourly }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('temp');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hours24 = hourly.slice(0, 24);

  const configs: Record<MetricKey, MetricConfig> = {
    temp: {
      key: 'temp',
      label: t.metric_temp,
      unit: '°C',
      icon: <Thermometer className="w-4 h-4" />,
      getValue: (h) => Math.round(h.temperature),
      getColor: (val) => {
        if (val < 18) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Cool (Blue)' };
        if (val <= 28) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Comfortable (Green)' };
        if (val <= 36) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'Warm / Caution (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'High Heat (Red)' };
      },
      ceiling: (maxVal) => Math.max(45, Math.ceil(maxVal + 4)),
      thresholds: [
        { label: '<18°C Cool', color: '#38bdf8' },
        { label: '18-28°C Optimal', color: '#10b981' },
        { label: '29-36°C Warm', color: '#f59e0b' },
        { label: '>36°C Extreme', color: '#ef4444' },
      ],
    },
    uv: {
      key: 'uv',
      label: t.metric_uv,
      unit: '',
      icon: <Sun className="w-4 h-4" />,
      getValue: (h) => h.uv_index ?? 0,
      getColor: (val) => {
        if (val <= 2) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Low (Blue)' };
        if (val <= 5) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Moderate (Green)' };
        if (val <= 7) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'High (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'Very High / Extreme (Red)' };
      },
      ceiling: (maxVal) => Math.max(12, Math.ceil(maxVal + 2)),
      thresholds: [
        { label: '0-2 Safe', color: '#38bdf8' },
        { label: '3-5 Moderate', color: '#10b981' },
        { label: '6-7 High', color: '#f59e0b' },
        { label: '8+ Extreme', color: '#ef4444' },
      ],
    },
    rain: {
      key: 'rain',
      label: t.metric_rain,
      unit: '%',
      icon: <CloudRain className="w-4 h-4" />,
      getValue: (h) => h.precipitation_probability,
      getColor: (val) => {
        if (val < 20) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Dry / Minimal (Blue)' };
        if (val < 45) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Low Chance (Green)' };
        if (val < 70) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'Likely Showers (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'Heavy Rain Risk (Red)' };
      },
      ceiling: () => 100,
      thresholds: [
        { label: '<20% Dry', color: '#38bdf8' },
        { label: '20-44% Slight', color: '#10b981' },
        { label: '45-69% Likely', color: '#f59e0b' },
        { label: '70%+ Heavy', color: '#ef4444' },
      ],
    },
    humidity: {
      key: 'humidity',
      label: t.metric_humidity,
      unit: '%',
      icon: <Droplets className="w-4 h-4" />,
      getValue: (h) => h.humidity,
      getColor: (val) => {
        if (val < 35) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Dry Air (Blue)' };
        if (val <= 65) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Optimal Comfort (Green)' };
        if (val <= 80) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'Humid (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'Oppressive (Red)' };
      },
      ceiling: () => 100,
      thresholds: [
        { label: '<35% Dry', color: '#38bdf8' },
        { label: '35-65% Optimal', color: '#10b981' },
        { label: '66-80% Humid', color: '#f59e0b' },
        { label: '>80% Muggy', color: '#ef4444' },
      ],
    },
    wind: {
      key: 'wind',
      label: t.metric_wind,
      unit: ' km/h',
      icon: <Wind className="w-4 h-4" />,
      getValue: (h) => Math.round(h.wind_speed),
      getColor: (val) => {
        if (val < 10) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Light Air (Blue)' };
        if (val <= 20) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Gentle Breeze (Green)' };
        if (val <= 35) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'Breezy / Gusty (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'Squally / High Wind (Red)' };
      },
      ceiling: (maxVal) => Math.max(40, Math.ceil(maxVal + 5)),
      thresholds: [
        { label: '<10 Light', color: '#38bdf8' },
        { label: '10-20 Gentle', color: '#10b981' },
        { label: '21-35 Gusty', color: '#f59e0b' },
        { label: '>35 Gale', color: '#ef4444' },
      ],
    },
    aqi: {
      key: 'aqi',
      label: t.metric_aqi,
      unit: ' AQI',
      icon: <Activity className="w-4 h-4" />,
      getValue: (h) => h.aqi ?? 65,
      getColor: (val) => {
        if (val <= 50) return { stroke: '#38bdf8', fill: '#0284c7', text: 'text-sky-400', bg: 'bg-sky-500/20', tier: 'Good Air (Blue)' };
        if (val <= 100) return { stroke: '#10b981', fill: '#059669', text: 'text-emerald-400', bg: 'bg-emerald-500/20', tier: 'Satisfactory (Green)' };
        if (val <= 200) return { stroke: '#f59e0b', fill: '#d97706', text: 'text-amber-400', bg: 'bg-amber-500/20', tier: 'Moderate (Amber)' };
        return { stroke: '#ef4444', fill: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/20', tier: 'Poor / Severe (Red)' };
      },
      ceiling: (maxVal) => Math.max(250, Math.ceil(maxVal + 20)),
      thresholds: [
        { label: '0-50 Good', color: '#38bdf8' },
        { label: '51-100 OK', color: '#10b981' },
        { label: '101-200 Caution', color: '#f59e0b' },
        { label: '200+ Hazardous', color: '#ef4444' },
      ],
    },
  };

  const currentCfg = configs[selectedMetric];
  const maxMetricVal = Math.max(...hours24.map((h) => currentCfg.getValue(h)));
  const minMetricVal = Math.min(...hours24.map((h) => currentCfg.getValue(h)));
  const ceiling = currentCfg.ceiling(maxMetricVal);

  // SVG Geometry
  const width = 800;
  const height = 210;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    } catch (e) {
      return timeStr;
    }
  };

  const points = hours24.map((h, i) => {
    const x = paddingX + (i / (hours24.length - 1 || 1)) * chartW;
    const val = currentCfg.getValue(h);
    const y = paddingTop + chartH - (val / ceiling) * chartH;
    return { x, y, val, hour: formatTime(h.time), rawTime: h.time, condition: h.condition_text };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (p.x - prev.x) / 2;
    const cpy2 = p.y;
    return `${acc} C ${cpx1},${cpy1} ${cpx2},${cpy2} ${p.x},${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${paddingTop + chartH} L ${points[0].x},${paddingTop + chartH} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-sky-100 dark:border-slate-800 p-6 text-slate-900 dark:text-white shadow-sm transition-colors">
      {/* Title & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sky-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-[#0B1F33] dark:text-white">{t.graphs_title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.graphs_subtitle}</p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          {(Object.keys(configs) as MetricKey[]).map((key) => {
            const cfg = configs[key];
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedMetric(key);
                  setHoveredIdx(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-3 py-2.5 rounded-xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Current 24h Peak:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {maxMetricVal}
            {currentCfg.unit}
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${currentCfg.getColor(maxMetricVal).bg} ${currentCfg.getColor(maxMetricVal).text}`}>
            {currentCfg.getColor(maxMetricVal).tier}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">24h Minimum:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {minMetricVal}
            {currentCfg.unit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Color System:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" title="Blue: Cool / Safe"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Green: Optimal"></span>
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Amber: Caution"></span>
            <span className="w-2 h-2 rounded-full bg-rose-500" title="Red: High / Severe"></span>
          </div>
        </div>
      </div>

      {/* SVG Multi-Metric Graph */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[620px] select-none">
          <defs>
            <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentCfg.getColor(maxMetricVal).stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={currentCfg.getColor(maxMetricVal).stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const yVal = Math.round(ceiling * (1 - ratio));
            const y = paddingTop + chartH * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad-${selectedMetric})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={currentCfg.getColor(maxMetricVal).stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Points */}
          {points.map((p, i) => {
            const pointColor = currentCfg.getColor(p.val);
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={p.x - 12}
                  y={paddingTop}
                  width="24"
                  height={chartH + paddingBottom}
                  fill="transparent"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill={pointColor.fill}
                  stroke={isDark ? '#0f172a' : '#ffffff'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {i % 3 === 0 && (
                  <text
                    x={p.x}
                    y={paddingTop + chartH + 22}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 dark:fill-slate-400 font-mono"
                  >
                    {p.hour}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hover highlight line */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartH}
                stroke={isDark ? '#94a3b8' : '#64748b'}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={7}
                fill={currentCfg.getColor(activePoint.val).stroke}
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && hoveredIdx !== null && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl z-20 backdrop-blur-md"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{activePoint.hour}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${currentCfg.getColor(activePoint.val).bg} ${currentCfg.getColor(activePoint.val).text}`}>
                {currentCfg.getColor(activePoint.val).tier}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {activePoint.val}
              {currentCfg.unit}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activePoint.condition}</div>
          </div>
        )}
      </div>

      {/* Thresholds Legend */}
      <div className="mt-4 pt-3 border-t border-sky-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          <span>{currentCfg.label} Thresholds:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {currentCfg.thresholds.map((th, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.color }}></span>
              <span className="text-slate-600 dark:text-slate-300 font-mono">{th.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
