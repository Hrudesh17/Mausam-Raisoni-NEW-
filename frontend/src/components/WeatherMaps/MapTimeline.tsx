'use client';

import React from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { RainViewerFrame, formatFrameTimeIST } from './MapProviderService';
import { useLanguage } from '../../hooks/useLanguage';

interface MapTimelineProps {
  frames: RainViewerFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectFrame: (index: number) => void;
  onNextFrame?: () => void;
  onPrevFrame?: () => void;
}

export const MapTimeline: React.FC<MapTimelineProps> = ({
  frames,
  currentFrameIndex,
  isPlaying,
  onTogglePlay,
  onSelectFrame,
}) => {
  const { language, t } = useLanguage();

  if (!frames || frames.length === 0) return null;

  const currentFrame = frames[currentFrameIndex] || frames[frames.length - 1];
  const timeLabel = formatFrameTimeIST(currentFrame.time);

  // Split frames into past vs nowcast
  const nowcastStartIndex = frames.findIndex((f) => f.type === 'nowcast');
  const pastCount = nowcastStartIndex === -1 ? frames.length : nowcastStartIndex;

  const startTimeStr = frames[0] ? formatFrameTimeIST(frames[0].time).split(',')[1]?.trim() || '' : '';
  const endTimeStr = frames[frames.length - 1] 
    ? formatFrameTimeIST(frames[frames.length - 1].time).split(',')[1]?.trim() || '' 
    : '';

  const frameText = language === 'bn' 
    ? `ফ্রেম ${currentFrameIndex + 1} / ${frames.length}` 
    : language === 'te' 
    ? `ఫ్రేమ్ ${currentFrameIndex + 1} / ${frames.length}` 
    : language === 'mr' 
    ? `फ्रेम ${currentFrameIndex + 1} / ${frames.length}` 
    : language === 'hi' 
    ? `फ्रेम ${currentFrameIndex + 1} / ${frames.length}` 
    : `Frame ${currentFrameIndex + 1} of ${frames.length}`;

  const nowcastLabel = language === 'bn' ? 'পূর্বাভাস নাওকাস্ট' : language === 'te' ? 'ఫోర్‌కాస్ట్ నౌకాస్ట్' : language === 'mr' ? 'अंदाज नाऊकास्ट' : language === 'hi' ? 'पूर्वानुमान नाउकास्ट' : 'FORECAST NOWCAST';
  const liveTelemetryLabel = language === 'bn' ? 'লাইভ রাডার টেলিমেট্রি' : language === 'te' ? 'లైవ్ రాడార్ టెలిమెట్రీ' : language === 'mr' ? 'थेट रडार टेलिमेट्री' : language === 'hi' ? 'लाइव रडार टेलीमेट्री' : 'Live Radar Telemetry';

  return (
    <div className="w-full flex flex-col items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl select-none">
      
      {/* 1. Time Badge Indicator */}
      <div className="flex items-center justify-between w-full px-1 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-black text-xs shadow-xs tracking-wide">
            {timeLabel}
          </span>
          {currentFrame.type === 'nowcast' ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 animate-pulse">
              {nowcastLabel}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              {liveTelemetryLabel}
            </span>
          )}
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-[10px] hidden sm:block">
          {frameText}
        </div>
      </div>

      {/* 2. Timeline Controls & Interactive Scrubber Bar */}
      <div className="flex items-center gap-3 w-full">
        
        {/* Play / Pause Circular Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-400/40'
              : 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
          }`}
          title={isPlaying ? t.map_pause || 'Pause Animation' : t.map_play || 'Play Animation'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Timeline Scrubber Container */}
        <div className="flex-1 flex flex-col gap-1">
          
          {/* Segmented Ticks Scrubber */}
          <div className="relative h-6 flex items-center cursor-pointer group"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                 const pct = x / rect.width;
                 const targetIndex = Math.min(frames.length - 1, Math.floor(pct * frames.length));
                 onSelectFrame(targetIndex);
               }}
          >
            {/* Background Track Rail */}
            <div className="absolute inset-x-0 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              {/* Past Radar frames (Orange/Amber colored as in Reference Image 5) */}
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{ width: `${(pastCount / frames.length) * 100}%` }}
              />
              {/* Forecast frames (Sky Blue) */}
              {nowcastStartIndex !== -1 && (
                <div 
                  className="h-full bg-sky-500/60 border-l border-white/40"
                  style={{ width: `${((frames.length - pastCount) / frames.length) * 100}%` }}
                />
              )}
            </div>

            {/* Individual Tick Marks */}
            <div className="absolute inset-x-0 flex justify-between px-1 pointer-events-none">
              {frames.map((f, idx) => {
                const isCurrent = idx === currentFrameIndex;
                const isPast = f.type === 'past';
                return (
                  <div
                    key={idx}
                    className={`h-4 w-0.5 transition-all ${
                      isCurrent
                        ? 'bg-white h-5 w-1 ring-2 ring-slate-900 dark:ring-white rounded-full z-10 scale-125'
                        : isPast
                        ? 'bg-white/70'
                        : 'bg-sky-200/70'
                    }`}
                  />
                );
              })}
            </div>

            {/* Scrubber Thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-sky-400 border-2 border-slate-900 dark:border-slate-950 shadow-md transition-all pointer-events-none -ml-2"
              style={{ left: `${((currentFrameIndex + 0.5) / frames.length) * 100}%` }}
            />
          </div>

          {/* Timeline Range Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5">
            <span>{startTimeStr || t.map_past || 'PAST'}</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{t.map_now || 'NOW'}</span>
            <span>{endTimeStr || t.map_future || 'FORECAST'}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
