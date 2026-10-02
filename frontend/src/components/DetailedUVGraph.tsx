'use client';

import React, { useState } from 'react';
import { Sun, ShieldAlert, ShieldCheck, Clock, Info, AlertTriangle } from 'lucide-react';
import { HourlyForecast } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

interface DetailedUVGraphProps {
  hourly: HourlyForecast[];
  currentUV: number;
}

export const DetailedUVGraph: React.FC<DetailedUVGraphProps> = ({ hourly, currentUV }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Take the next 24 hours of forecast
  const hours24 = hourly.slice(0, 24);

  // Find peak UV
  let peakHour = hours24[0];
  let maxUV = 0;
  hours24.forEach((h) => {
    const uv = h.uv_index ?? 0;
    if (uv > maxUV) {
      maxUV = uv;
      peakHour = h;
    }
  });

  const getUVCategory = (val: number) => {
    if (val < 3) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', stroke: '#10b981', fill: '#059669' };
    if (val < 6) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', stroke: '#f59e0b', fill: '#d97706' };
    if (val < 8) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', stroke: '#f97316', fill: '#ea580c' };
    if (val < 11) return { label: 'Very High', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', stroke: '#ef4444', fill: '#dc2626' };
    return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', stroke: '#a855f7', fill: '#9333ea' };
  };

  const getBurnTimeEstimate = (val: number) => {
    if (val < 3) return '> 60 mins (Low Risk)';
    if (val < 6) return '30 - 45 mins';
    if (val < 8) return '15 - 25 mins';
    if (val < 11) return '10 - 15 mins';
    return '< 10 mins (Urgent Protection)';
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    } catch (e) {
      return timeStr;
    }
  };

  const peakCategory = getUVCategory(maxUV);

  // SVG Chart Geometry
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;
  const ceilingUV = Math.max(11, Math.ceil(maxUV + 1));

  const points = hours24.map((h, i) => {
    const x = paddingX + (i / (hours24.length - 1 || 1)) * chartW;
    const uv = Math.max(0, h.uv_index ?? 0);
    const y = paddingTop + chartH - (uv / ceilingUV) * chartH;
    return { x, y, uv, hour: formatTime(h.time), rawTime: h.time, is_day: h.is_day };
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#0B1F33] dark:text-white">{t.uv_graph_title}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                24h Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.uv_graph_subtitle}</p>
          </div>
        </div>

        {/* Current & Peak Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-sky-50/50 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 border border-sky-100 dark:border-slate-700 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
              Current UV
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-lg font-black text-slate-900 dark:text-white">{currentUV.toFixed(1)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getUVCategory(currentUV).bg} ${getUVCategory(currentUV).color}`}>
                {getUVCategory(currentUV).label}
              </span>
            </div>
          </div>

          <div className="bg-sky-50/50 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 border border-sky-100 dark:border-slate-700 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
              {t.uv_peak}
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-lg font-black text-slate-900 dark:text-white">{maxUV.toFixed(1)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${peakCategory.bg} ${peakCategory.color}`}>
                at {peakHour ? formatTime(peakHour.time) : '1:00 PM'} ({peakCategory.label})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights / Protection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-sky-100 dark:border-slate-700/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.uv_safe_window}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">Before 10:30 & After 16:00</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">Minimal direct radiation risk</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-sky-100 dark:border-slate-700/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.uv_burn_time} (Peak)</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{getBurnTimeEstimate(maxUV)}</div>
            <div className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5 font-medium">For fair / unprotected skin</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-sky-100 dark:border-slate-700/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.uv_recommendation}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {maxUV >= 6 ? 'SPF 30+, Hat, Sunglasses' : 'Standard sunglasses optional'}
            </div>
            <div className="text-[10px] text-sky-700 dark:text-sky-400 mt-0.5 font-medium">WHO standard protection tier</div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[620px] select-none">
          <defs>
            <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="uvLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="45%" stopColor="#d97706" />
              <stop offset="60%" stopColor="#e11d48" />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 3, 6, 8, 11].map((lvl) => {
            const y = paddingTop + chartH - (lvl / ceilingUV) * chartH;
            return (
              <g key={lvl}>
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
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill="url(#uvGradient)" />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#uvLineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const cat = getUVCategory(p.uv);
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Hit area */}
                <rect
                  x={p.x - 12}
                  y={paddingTop}
                  width="24"
                  height={chartH + paddingBottom}
                  fill="transparent"
                />

                {/* Point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : p.uv > 0 ? 3.5 : 2}
                  fill={cat.fill}
                  stroke={isDark ? "#0f172a" : "#ffffff"}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />

                {/* X Axis Time Labels (Every 3 hours) */}
                {i % 3 === 0 && (
                  <text
                    x={p.x}
                    y={paddingTop + chartH + 22}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 dark:fill-slate-400 font-medium font-mono"
                  >
                    {p.hour}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Hover Guide & Tooltip in SVG */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartH}
                stroke={isDark ? "#94a3b8" : "#64748b"}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={7}
                fill={getUVCategory(activePoint.uv).stroke}
                stroke={isDark ? "#0f172a" : "#ffffff"}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && hoveredIdx !== null && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl z-20 backdrop-blur-md"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{activePoint.hour}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getUVCategory(activePoint.uv).bg} ${getUVCategory(activePoint.uv).color}`}>
                {getUVCategory(activePoint.uv).label}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              UV {activePoint.uv.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Burn risk: {getBurnTimeEstimate(activePoint.uv)}
            </div>
          </div>
        )}
      </div>

      {/* Scale Legend */}
      <div className="mt-4 pt-4 border-t border-sky-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>WHO Global UV Scale:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">0-2 Low</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-300">3-5 Moderate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-600 dark:text-slate-300">6-7 High</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-600 dark:text-slate-300">8-10 Very High</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-600 dark:text-slate-300">11+ Extreme</span>
          </span>
        </div>
      </div>
    </div>
  );
};
