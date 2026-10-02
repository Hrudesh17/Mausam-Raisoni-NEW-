'use client';

import React from 'react';
import { 
  Home, 
  CloudSun, 
  Compass, 
  AlertTriangle, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface MobileBottomNavProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  onOpenAssistant?: () => void;
  onOpenPersonalizeModal: () => void;
  alertsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onSelectSection,
  onOpenAssistant,
  onOpenPersonalizeModal,
  alertsCount = 0,
}) => {
  const { t } = useLanguage();

  const handleNavClick = (section: string) => {
    onSelectSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-sky-100 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] px-2 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* 1. Overview / Home */}
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition active:scale-95 ${
            activeSection === 'overview'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeSection === 'overview' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.nav_overview || 'Home'}</span>
        </button>

        {/* 2. Forecast (Hourly / 7-Day) */}
        <button
          type="button"
          onClick={() => handleNavClick('hourly')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition active:scale-95 ${
            activeSection === 'hourly' || activeSection === 'daily'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CloudSun className={`w-5 h-5 ${activeSection === 'hourly' || activeSection === 'daily' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.nav_hourly || 'Forecast'}</span>
        </button>

        {/* 3. Sahayak (AI Voice Assistant Core Hero Center) */}
        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex flex-col items-center justify-center -mt-4 py-1 px-2 group active:scale-95 transition"
            title="Open VayuSync Sahayak Assistant"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 ring-4 ring-white dark:ring-slate-950 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-tight mt-0.5">
              Sahayak
            </span>
          </button>
        )}

        {/* 4. Radar Maps */}
        <button
          type="button"
          onClick={() => handleNavClick('radar')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition active:scale-95 ${
            activeSection === 'radar'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeSection === 'radar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.nav_radar || 'Radar'}</span>
        </button>

        {/* 5. Alerts / Warnings */}
        <button
          type="button"
          onClick={() => handleNavClick('warnings')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition active:scale-95 ${
            activeSection === 'warnings'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <AlertTriangle className={`w-5 h-5 ${activeSection === 'warnings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{t.nav_warnings || 'Alerts'}</span>
        </button>

        {/* 6. Personalize Settings */}
        <button
          type="button"
          onClick={onOpenPersonalizeModal}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95"
          title="Personalize Weather Experience"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-2 text-amber-500" />
          <span className="text-[10px] tracking-tight mt-0.5">{t.btn_customize || 'Settings'}</span>
        </button>

      </div>
    </nav>
  );
};
