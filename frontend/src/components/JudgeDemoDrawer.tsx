'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Clock, 
  CloudLightning, 
  Wind, 
  Sun, 
  Flame, 
  Waves,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { UserContext } from '../lib/types';

interface JudgeDemoDrawerProps {
  activeScenario: string | null;
  onSelectScenario: (scenario: string) => void;
  onResetToLive: () => void;
  simulatedHour: number;
  onHourChange: (hour: number) => void;
  onApplyProfile: (profile: Partial<UserContext>) => void;
}

const DEMO_SCENARIOS = [
  {
    id: 'mumbai_monsoon',
    name: 'Mumbai Monsoon Downpour',
    desc: 'Heavy rain, waterlogging risk & red alert',
    icon: CloudLightning,
  },
  {
    id: 'delhi_smog',
    name: 'Delhi Winter Smog',
    desc: 'AQI 385 Severe, low visibility & GRAP IV',
    icon: Wind,
  },
  {
    id: 'bengaluru_pleasant',
    name: 'Bengaluru Pleasant Day',
    desc: '23°C, optimal running & clear skies',
    icon: Sun,
  },
  {
    id: 'rajasthan_heatwave',
    name: 'Rajasthan Heatwave',
    desc: '44°C extreme heat & solar UV 11',
    icon: Flame,
  },
  {
    id: 'chennai_cyclone',
    name: 'Chennai Cyclone Alert',
    desc: '75 km/h gale gusts & rough sea swell',
    icon: Waves,
  },
];

const DEMO_PROFILES = [
  {
    name: 'Health + Morning Runner',
    desc: 'Interested in health and running',
    context: {
      name: 'Ameya (Health/Runner)',
      interests: ['health', 'running'],
      priorities: ['rain', 'aqi'],
      is_personalized: true,
    },
  },
  {
    name: 'Event Organizer + Outdoor Cricket',
    desc: 'Has Outdoor Cricket match scheduled at 5 PM',
    context: {
      name: 'Ameya (Event Planner)',
      interests: ['events', 'travel', 'family'],
      priorities: ['rain', 'wind', 'heat'],
      is_personalized: true,
    },
  },
  {
    name: 'Krishi Mitra (Farmer / Gardener)',
    desc: 'Focus on pesticide spraying, crop care & soil moisture',
    context: {
      name: 'Ameya (Krishi Mitra)',
      interests: ['gardening', 'family'],
      priorities: ['rain', 'wind', 'heat'],
      is_personalized: true,
    },
  },
];

export const JudgeDemoDrawer: React.FC<JudgeDemoDrawerProps> = ({
  activeScenario,
  onSelectScenario,
  onResetToLive,
  simulatedHour,
  onHourChange,
  onApplyProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Discreet Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shadow-xl text-xs font-bold transition transform hover:scale-105 active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Judge / Demo Controls</span>
          {activeScenario && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden text-slate-900 dark:text-white">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-xs">
                  <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Evaluator Demo Controls
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      DEMO MODE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Simulate extreme weather and test personalized reactions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              
              {/* Section 1: Scenarios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">
                    1. Extreme Weather Scenarios
                  </label>
                  {activeScenario && (
                    <button
                      onClick={onResetToLive}
                      className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to Live
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {DEMO_SCENARIOS.map((sc) => {
                    const Icon = sc.icon;
                    const isSelected = activeScenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => onSelectScenario(sc.id)}
                        className={`w-full p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition shadow-xs ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{sc.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{sc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Preset User Contexts */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">
                  2. Rapid User Context Presets
                </label>
                <div className="space-y-1.5">
                  {DEMO_PROFILES.map((prof, i) => (
                    <button
                      key={i}
                      onClick={() => onApplyProfile(prof.context)}
                      className="w-full p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-left transition shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-bold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{prof.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{prof.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Time Slider */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Simulated Hour:
                  </span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                    {simulatedHour.toString().padStart(2, '0')}:00 IST
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={simulatedHour}
                  onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition shadow-xs"
              >
                Close Demo Controls
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
