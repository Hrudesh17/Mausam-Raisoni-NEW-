'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Navigation, 
  Sparkles, 
  RefreshCw, 
  ChevronDown,
  SlidersHorizontal,
  Globe,
  LifeBuoy,
  Search,
  Check,
  Mic,
  Sun,
  Moon,
  MoreHorizontal
} from 'lucide-react';
import { Location } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { ALL_INDIAN_LANGUAGES } from '../lib/i18n';

interface HeaderProps {
  currentLocation: Location;
  cities: Array<{ name: string; state: string; lat: number; lon: number; default_persona: string }>;
  onSelectCity: (city: { name: string; state: string; lat: number; lon: number; default_persona: string }) => void;
  onUseCurrentLocation: () => void;
  activeMode: 'standard' | 'personalized';
  onToggleMode: (mode: 'standard' | 'personalized') => void;
  onOpenPersonalizeModal: () => void;
  onOpenHelpReportModal: () => void;
  onOpenAssistant?: () => void;
  isPersonalized: boolean;
  activeSection: string;
  onSelectSection: (section: string) => void;
  providerName: string;
  isLiveLoading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  cities,
  onSelectCity,
  onUseCurrentLocation,
  activeMode,
  onToggleMode,
  onOpenPersonalizeModal,
  onOpenHelpReportModal,
  onOpenAssistant,
  isPersonalized,
  activeSection,
  onSelectSection,
  providerName,
  isLiveLoading,
  onRefresh,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1920);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // ResizeObserver on the header inner container ensures progressive collapse works across all zoom levels
  useEffect(() => {
    const el = headerContainerRef.current;
    if (!el) return;

    const handleResize = () => {
      if (el) {
        setContainerWidth(el.clientWidth);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(el);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Progressive breakpoint flags based on container width (zoom-friendly)
  const isMobile = containerWidth < 768;
  const isTwoRow = containerWidth < 1280;
  const isCompactControls = containerWidth < 1500;
  const isIconOnlyHelpers = containerWidth < 1700;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 dark:border-slate-800/80 glass-panel bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* Centered responsive container */}
      <div 
        ref={headerContainerRef}
        id="main-header-container"
        className="mx-auto w-full max-w-[1800px] px-3 sm:px-4 lg:px-6 transition-all duration-150"
      >
        {/* DESKTOP SINGLE ROW (>= 1280px) */}
        {!isTwoRow ? (
          <div className="h-16 flex items-center justify-between gap-2 min-w-0 w-full">
            {/* Brand / Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-sky-600 dark:bg-sky-500 flex items-center justify-center shadow-sm text-white font-extrabold shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-xl tracking-wider text-[#0B1F33] dark:text-white uppercase font-heading leading-none">
                    {t.app_title}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                    {t.nav_official_weather}
                  </span>
                </div>
                <p className="flex text-[11px] text-slate-500 dark:text-slate-400 font-medium items-center gap-1.5 mt-0.5">
                  <span>{t.app_subtitle}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> {t.portal_tag}
                  </span>
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => onToggleMode('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  activeMode === 'standard'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.tab_overview}
              </button>
              <button
                type="button"
                onClick={() => onToggleMode('personalized')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                  activeMode === 'personalized'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-300 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{t.tab_personalized}</span>
              </button>
            </div>

            {/* Right Controls Container */}
            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
              {/* Light/Dark Toggle */}
              {isCompactControls ? (
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="p-2 h-9 w-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 flex items-center justify-center transition hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                  title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
                </button>
              ) : (
                <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                      !isDark
                        ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Light Mode (दिन का दृश्य)"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                      isDark
                        ? 'bg-slate-700 text-sky-300 shadow-sm border border-slate-600'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Dark Mode (रात का दृश्य)"
                  >
                    <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Dark</span>
                  </button>
                </div>
              )}

              {/* Language Selector */}
              <div className="relative shrink-0" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setLangDropdownOpen(!langDropdownOpen);
                    setLangSearch('');
                  }}
                  className="flex items-center gap-1 px-2.5 h-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition text-slate-700 dark:text-slate-200 shadow-sm shrink-0"
                  title="Select Indian Language"
                  aria-label="Select Indian Language"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="uppercase font-mono tracking-wider font-bold text-sky-700 dark:text-sky-400">{language}</span>
                  {!isCompactControls && <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />}
                </button>

                {langDropdownOpen && (
                  <div 
                    className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[min(320px,calc(100vw-24px))] max-w-[calc(100vw-24px)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-sky-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{ zIndex: 100 }}
                  >
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between pb-2 px-1">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          Indian Languages
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          22+ Supported
                        </span>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          placeholder="Search language / भाषा खोजें..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 py-1">
                      {ALL_INDIAN_LANGUAGES.filter((l) => {
                        if (!langSearch.trim()) return true;
                        const q = langSearch.toLowerCase().trim();
                        return (
                          l.code.toLowerCase().includes(q) ||
                          l.name.toLowerCase().includes(q) ||
                          l.native.toLowerCase().includes(q) ||
                          l.region.toLowerCase().includes(q)
                        );
                      }).map((l) => {
                        const isSelected = language === l.code;
                        return (
                          <button
                            type="button"
                            key={l.code}
                            onClick={() => {
                              setLanguage(l.code);
                              setLangDropdownOpen(false);
                              setLangSearch('');
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[13px] text-slate-900 dark:text-white">{l.native}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">({l.name})</span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{l.region}</span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Help & Report Button */}
              <button
                type="button"
                onClick={onOpenHelpReportModal}
                className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold transition shadow-sm shrink-0"
                title={t.btn_help_report}
                aria-label={t.btn_help_report}
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                {!isIconOnlyHelpers && <span>{t.btn_help_report}</span>}
              </button>

              {/* City Selector (Clamped width, fixed height, title tooltip, identical across all cities) */}
              <div className="relative shrink-0" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={`Selected City: ${currentLocation.name}`}
                  aria-label={`Selected City: ${currentLocation.name}`}
                  style={{ width: 'clamp(120px, 11vw, 170px)' }}
                  className="flex items-center justify-between gap-1.5 px-2.5 h-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium transition text-slate-700 dark:text-slate-200 shadow-sm shrink-0"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate text-left">{currentLocation.name}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      {t.nav_select_observatory}
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {cities.map((c) => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => {
                            onSelectCity(c);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-300 flex items-center justify-between transition ${
                            c.name === currentLocation.name ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GPS Location Button */}
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="p-2 h-9 w-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition shadow-sm active:scale-95 flex items-center justify-center shrink-0"
                title={t.nav_gps_location}
                aria-label={t.nav_gps_location}
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLiveLoading}
                className={`p-2 h-9 w-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition shadow-sm active:scale-95 flex items-center justify-center shrink-0 ${
                  isLiveLoading ? 'animate-spin text-sky-600' : ''
                }`}
                title={t.nav_refresh}
                aria-label={t.nav_refresh}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Voice Assistant */}
              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 transition active:scale-95 shrink-0"
                  title={t.nav_voice_assistant}
                  aria-label={t.nav_voice_assistant}
                >
                  <Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  {!isIconOnlyHelpers && <span>{t.nav_voice_assistant}</span>}
                </button>
              )}

              {/* Personalize Button (ALWAYS VISIBLE & UNCLIPPED, shrink-0) */}
              <button
                type="button"
                id="header-personalize-button"
                onClick={onOpenPersonalizeModal}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all duration-200 hover:shadow-md shadow-xs whitespace-nowrap shrink-0 ml-0.5"
                title="Personalize Weather Experience"
                aria-label="Personalize Weather Experience"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t.btn_customize || 'Personalize'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* TABLET & MOBILE (< 1280px) MULTI-ROW LAYOUT */
          <div className="py-2 space-y-2">
            {/* ROW 1: Brand + Mode Toggle + Personalize Button */}
            <div className="flex items-center justify-between gap-2 w-full min-w-0">
              {/* Brand Logo */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white font-extrabold shrink-0">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div className="shrink-0">
                  <h1 className="font-black text-lg tracking-wider text-[#0B1F33] dark:text-white uppercase font-heading leading-none">
                    {t.app_title}
                  </h1>
                  <span className="hidden xs:inline-block text-[9px] font-bold text-sky-700 dark:text-sky-400 uppercase">
                    {t.portal_tag}
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleMode('standard')}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition shrink-0 ${
                    activeMode === 'standard'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.tab_overview}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleMode('personalized')}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition shrink-0 ${
                    activeMode === 'personalized'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{t.tab_personalized}</span>
                </button>
              </div>

              {/* Personalize Button (Prominent in Row 1 on mobile/tablet) */}
              <button
                type="button"
                id="header-personalize-button-mobile"
                onClick={onOpenPersonalizeModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
                title="Personalize Weather Experience"
                aria-label="Personalize Weather Experience"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className={isMobile ? "hidden sm:inline" : "inline"}>{t.btn_customize || 'Personalize'}</span>
              </button>
            </div>

            {/* ROW 2: Location, Tools & Overflow/Secondary Buttons */}
            <div className="flex items-center justify-between gap-1.5 w-full min-w-0 pt-0.5">
              {/* City Selector */}
              <div className="relative shrink-0" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={`Selected City: ${currentLocation.name}`}
                  style={{ width: isMobile ? 'clamp(120px, 34vw, 160px)' : 'clamp(130px, 18vw, 170px)' }}
                  className="flex items-center justify-between gap-1 px-2 h-8 sm:h-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium transition text-slate-700 dark:text-slate-200 shadow-sm shrink-0"
                >
                  <span className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate text-left">{currentLocation.name}</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      {t.nav_select_observatory}
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {cities.map((c) => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => {
                            onSelectCity(c);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-300 flex items-center justify-between transition ${
                            c.name === currentLocation.name ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tools row */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* GPS */}
                <button
                  type="button"
                  onClick={onUseCurrentLocation}
                  className="p-1.5 sm:p-2 h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition shadow-sm"
                  title={t.nav_gps_location}
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </button>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLiveLoading}
                  className="p-1.5 sm:p-2 h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition shadow-sm"
                  title={t.nav_refresh}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLiveLoading ? 'animate-spin text-sky-600' : ''}`} />
                </button>

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="p-1.5 sm:p-2 h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 flex items-center justify-center transition"
                  title={isDark ? "Light Theme" : "Dark Theme"}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
                </button>

                {/* Language Button */}
                <div className="relative shrink-0" ref={langDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setLangDropdownOpen(!langDropdownOpen);
                      setLangSearch('');
                    }}
                    className="flex items-center gap-1 px-2 h-8 sm:h-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm shrink-0"
                    title="Select Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="uppercase font-mono font-bold text-sky-700 dark:text-sky-400">{language}</span>
                  </button>

                  {langDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-[min(300px,calc(100vw-24px))] max-w-[calc(100vw-24px)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-sky-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
                      style={{ zIndex: 100 }}
                    >
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-800/50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            placeholder="Search language..."
                            className="w-full pl-8 pr-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {ALL_INDIAN_LANGUAGES.filter((l) => {
                          if (!langSearch.trim()) return true;
                          const q = langSearch.toLowerCase().trim();
                          return l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q);
                        }).map((l) => (
                          <button
                            type="button"
                            key={l.code}
                            onClick={() => {
                              setLanguage(l.code);
                              setLangDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <span className="font-medium">{l.native} ({l.name})</span>
                            {language === l.code && <Check className="w-3.5 h-3.5 text-sky-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Help & Report */}
                <button
                  type="button"
                  onClick={onOpenHelpReportModal}
                  className="flex items-center gap-1 px-2 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold shrink-0 shadow-sm"
                  title={t.btn_help_report}
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="hidden md:inline">{t.btn_help_report}</span>
                </button>

                {/* Voice Assistant */}
                {onOpenAssistant && (
                  <button
                    type="button"
                    onClick={onOpenAssistant}
                    className="flex items-center gap-1 px-2 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                    title={t.nav_voice_assistant}
                  >
                    <Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="hidden md:inline">Voice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Bar (Tabs Row) */}
      <div className="bg-white/90 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800/80 px-2 sm:px-4 lg:px-6 py-1.5 flex flex-wrap items-center justify-between gap-y-1 text-xs">
        {/* Navigation Tabs (Smooth horizontal scrolling with scrollbar hidden) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            type="button"
            onClick={() => onSelectSection('overview')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'overview' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {t.nav_overview}
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('hourly')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'hourly' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {t.nav_hourly}
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('daily')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'daily' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {t.nav_daily}
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('radar')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'radar' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {t.nav_radar}
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('warnings')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'warnings' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {t.nav_warnings}
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('crop')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeSection === 'crop' ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300/60 dark:border-emerald-700/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {language === 'hi' ? 'फसल' : language === 'mr' ? 'पिके' : language === 'bn' ? 'ফসল' : language === 'te' ? 'పంట' : 'Crop'}
          </button>

          {activeMode === 'personalized' && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap ml-2">
              ✨ {language === 'hi' ? 'वायुसिंक सक्रिय' : language === 'mr' ? 'वायुसिंक सक्रिय' : language === 'bn' ? 'বায়ুসিঙ্ক সক্রিয়' : language === 'te' ? 'వాయుసింక్ యాక్టివ్' : 'VayuSync Active'}
            </span>
          )}
        </nav>

        {/* Source Telemetry Attribution */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{language === 'hi' ? 'डेटा' : language === 'mr' ? 'माहिती' : language === 'bn' ? 'উপাত্ত' : language === 'te' ? 'డేటా' : 'Data'}: {providerName}</span>
          <span>•</span>
          <span>{language === 'hi' ? 'अपडेट: अभी' : language === 'mr' ? 'अपडेट: नुकतेच' : language === 'bn' ? 'হালনাগাদ: এইমাত্র' : language === 'te' ? 'నవీకరించబడింది: ఇప్పుడే' : 'Updated: Just now'}</span>
        </div>
      </div>
    </header>
  );
};

