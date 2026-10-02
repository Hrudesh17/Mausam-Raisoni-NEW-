'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Globe, 
  Search, 
  Check, 
  ArrowRight, 
  Sparkles,
  Navigation,
  Mic
} from 'lucide-react';
import { Header } from '../components/Header';
import { StandardMausam } from '../components/StandardMausam';
import { VayuSyncPersonalized } from '../components/VayuSyncPersonalized';
import { PersonalizationModal } from '../components/PersonalizationModal';
import { AIAssistantModal } from '../components/AIAssistantModal';
import { JudgeDemoDrawer } from '../components/JudgeDemoDrawer';
import { HelpReportModal } from '../components/HelpReportModal';
import { useLanguage } from '../hooks/useLanguage';
import { ALL_INDIAN_LANGUAGES, Language } from '../lib/i18n';
import { 
  WeatherResponse, 
  IntelligenceSummary, 
  UserContext 
} from '../lib/types';
import { fetchWeather, 
  fetchIntelligence, 
  fetchCities,
  reverseGeocodeLocation
} from '../lib/api';
import { LiveTelemetryBar } from '../components/LiveTelemetryBar';
import { MobileBottomNav } from '../components/MobileBottomNav';

const todayDateString = new Date().toISOString().split('T')[0];

const DEFAULT_USER_CONTEXT: UserContext = {
  name: 'Ameya',
  is_personalized: false,
  interests: ['health', 'running'],
  priorities: ['rain', 'heat', 'aqi'],
  calendar_events: [
    { id: 'ev-1', title: 'Morning Run / Jog', date: todayDateString, start_hour: 6, end_hour: 7, is_outdoor: true },
  ],
};

function MainApp() {
  const { language, setLanguage, t } = useLanguage();
  const [activeMode, setActiveMode] = useState<'standard' | 'personalized'>('standard');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [context, setContext] = useState<UserContext>(DEFAULT_USER_CONTEXT);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceSummary | null>(null);
  const [cities, setCities] = useState<Array<{ name: string; state: string; lat: number; lon: number; default_persona: string }>>([]);
  const [currentCity, setCurrentCity] = useState({
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lon: 73.8567,
    default_persona: 'student',
  });
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simulatedHour, setSimulatedHour] = useState<number>(new Date().getHours());
  
  // Modals
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isHelpReportOpen, setIsHelpReportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── ONBOARDING FLOW STATE ──────────────────────────────────────────────────
  // Step 1: 'location' -> Step 2: 'language' -> Step 3: 'personalize' -> 'completed'
  const [onboardingStep, setOnboardingStep] = useState<'location' | 'language' | 'personalize' | 'completed'>('completed');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const [tempSelectedLang, setTempSelectedLang] = useState<Language>(language || 'en');

  // Keep tempSelectedLang synchronized with active language
  useEffect(() => {
    if (language) {
      setTempSelectedLang(language);
    }
  }, [language]);

  // Check onboarding status and load saved context on mount
  useEffect(() => {
    try {
      const onboarded = localStorage.getItem('vayusync_onboarded');
      if (!onboarded) {
        localStorage.setItem('vayusync_onboarded', 'true');
      }
      setOnboardingStep('completed');

      const savedContext = localStorage.getItem('vayusync_user_context');
      if (savedContext) {
        const parsed = JSON.parse(savedContext);
        setContext(parsed);
        if (parsed.is_personalized) {
          setActiveMode('personalized');
        }
      }
    } catch {
      // In restricted storage environments
    }
  }, []);


  // Load cities on mount
  useEffect(() => {
    fetchCities().then(setCities).catch(console.error);
  }, []);

  // Fetch Weather & Compute Intelligence
  const loadData = useCallback(async (
    lat: number,
    lon: number,
    cityName: string,
    scenario: string | null,
    activeCtx: UserContext,
    forceRefresh: boolean = false
  ) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const wData = await fetchWeather(
        lat, 
        lon, 
        cityName, 
        scenario ? 'mock' : 'open_meteo', 
        scenario || undefined,
        forceRefresh
      );
      setWeather(wData);

      const iData = await fetchIntelligence(wData, activeCtx);
      setIntelligence(iData);
    } catch (err: any) {
      console.error('Failed to load telemetry or intelligence:', err);
      setFetchError(err.message || 'Live weather data unavailable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentCity.lat, currentCity.lon, currentCity.name, activeScenario, context);
  }, [currentCity, activeScenario, loadData]);

  // Handle saving personalization preferences
  const handleSaveContext = async (updatedCtx: UserContext) => {
    setContext(updatedCtx);
    setActiveMode('personalized'); // Automatically transition to personalized view upon saving!
    try {
      localStorage.setItem('vayusync_user_context', JSON.stringify(updatedCtx));
      localStorage.setItem('vayusync_onboarded', 'true');
    } catch {
      // ignore
    }
    setOnboardingStep('completed');
    setIsPersonalizeOpen(false);

    if (weather) {
      try {
        const iData = await fetchIntelligence(weather, updatedCtx);
        setIntelligence(iData);
      } catch (err) {
        console.error('Failed to recompute intelligence:', err);
      }
    }
  };

  // Switch City
  const handleSelectCity = (c: { name: string; state?: string; lat: number; lon: number; default_persona: string }) => {
    setCurrentCity({
      name: c.name,
      state: c.state || '',
      lat: c.lat,
      lon: c.lon,
      default_persona: c.default_persona,
    });
    setActiveScenario(null);
  };

  // Browser Geolocation with Live Reverse Geocoding
  const handleUseCurrentLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const geo = await reverseGeocodeLocation(lat, lon);
            setCurrentCity({
              name: geo.name,
              state: geo.state || 'GPS Station',
              lat,
              lon,
              default_persona: geo.default_persona || 'commuter',
            });
          } catch {
            setCurrentCity({
              name: `Station (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
              state: 'GPS Telemetry',
              lat,
              lon,
              default_persona: 'commuter',
            });
          }
          setActiveScenario(null);
        },
        (err) => {
          console.warn(`Geolocation error: ${err.message}`);
        }
      );
    }
  };

  // Onboarding Step 1: Accept Location Permission (ONLY Accept button)
  const handleAcceptLocation = () => {
    setIsRequestingLocation(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const geo = await reverseGeocodeLocation(lat, lon);
            setCurrentCity({
              name: geo.name,
              state: geo.state || 'Local Station',
              lat,
              lon,
              default_persona: geo.default_persona || 'commuter',
            });
          } catch {
            setCurrentCity({
              name: `Station (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
              state: 'GPS Telemetry',
              lat,
              lon,
              default_persona: 'commuter',
            });
          }
          setIsRequestingLocation(false);
          setOnboardingStep('language');
        },
        () => {
          setIsRequestingLocation(false);
          setOnboardingStep('language');
        },
        { timeout: 8000 }
      );
    } else {
      setIsRequestingLocation(false);
      setOnboardingStep('language');
    }
  };

  // Onboarding Step 2: Complete Language Selection
  const handleCompleteLanguage = () => {
    setLanguage(tempSelectedLang);
    setOnboardingStep('personalize');
    setIsPersonalizeOpen(true);
  };

  // Handle section scrolling
  const handleSelectSection = (sec: string) => {
    setActiveSection(sec);
    const elem = document.getElementById(sec);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Application Header */}
      <Header
        currentLocation={weather?.location || currentCity}
        cities={cities}
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        activeMode={activeMode}
        onToggleMode={(mode) => setActiveMode(mode)}
        onOpenPersonalizeModal={() => setIsPersonalizeOpen(true)}
        onOpenHelpReportModal={() => setIsHelpReportOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        isPersonalized={context.is_personalized}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        providerName={weather?.provider || 'Mausam Data Standard'}
        isLiveLoading={isLoading}
        onRefresh={() => loadData(currentCity.lat, currentCity.lon, currentCity.name, activeScenario, context, true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 md:pb-8">
        
        {fetchError && !weather && (
          <div className="rounded-3xl glass-panel p-8 text-center space-y-4 max-w-xl mx-auto border border-rose-200 dark:border-rose-900/50 bg-white/80 dark:bg-slate-900/80">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Data Unavailable</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fetchError}. Per live compliance requirements, no fake placeholder weather is being substituted.
            </p>
            <button
              onClick={() => loadData(currentCity.lat, currentCity.lon, currentCity.name, activeScenario, context, true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
            >
              Retry Live Connection
            </button>
          </div>
        )}

        {weather && (
          <>
            {activeMode === 'standard' ? (
              /* State 1: Standard Mausam Official Weather Experience */
              <StandardMausam
                weather={weather}
                eventIntel={intelligence?.event_planning}
                visibilityIntel={intelligence?.visibility_intel}
                onSelectCity={handleSelectCity}
                onOpenPersonalizeModal={() => setIsPersonalizeOpen(true)}
                onEnablePersonalizedMode={() => {
                  setActiveMode('personalized');
                  if (!context.is_personalized) {
                    setIsPersonalizeOpen(true);
                  }
                }}
                activeSection={activeSection}
              />
            ) : (
              /* State 2: VayuSync Personalized Mausam Experience */
              intelligence && (
                <VayuSyncPersonalized
                  weather={weather}
                  intelligence={intelligence}
                  context={context}
                  onOpenPersonalizeModal={() => setIsPersonalizeOpen(true)}
                  onOpenAssistant={() => setIsAssistantOpen(true)}
                />
              )
            )}
          </>
        )}

      </main>

      {/* Development & Audit Live Telemetry Bar */}
      <LiveTelemetryBar
        weather={weather}
        selectedCity={currentCity}
        isLoading={isLoading}
        onRefresh={() => loadData(currentCity.lat, currentCity.lon, currentCity.name, activeScenario, context, true)}
      />

      {/* Mobile Bottom Navigation Bar (App-like UX) */}
      <MobileBottomNav
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenPersonalizeModal={() => setIsPersonalizeOpen(true)}
        alertsCount={weather?.alerts?.length || 0}
      />

      {/* Help & Report / Contact & Feedback Modal */}
      <HelpReportModal
        isOpen={isHelpReportOpen}
        onClose={() => setIsHelpReportOpen(false)}
        currentCity={weather?.location.name || currentCity.name}
        lat={weather?.location.lat || currentCity.lat}
        lon={weather?.location.lon || currentCity.lon}
        userName={context?.name}
      />

      {/* Personalization Modal ("What matters to you?") */}
      <PersonalizationModal
        isOpen={isPersonalizeOpen}
        onClose={() => {
          setIsPersonalizeOpen(false);
          if (onboardingStep === 'personalize') {
            setOnboardingStep('completed');
          }
        }}
        context={context}
        onSaveContext={handleSaveContext}
      />

      {/* Conversational AI Assistant (VayuSync Sahayak) */}
      {weather && intelligence && (
        <>
          <AIAssistantModal
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            weather={weather}
            intelligence={intelligence}
            context={context}
          />
          {/* Floating Voice Assistant Trigger (Bottom Right, elevated above telemetry bar) */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-20 right-6 z-50 p-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-110 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 animate-float"
            title="Open Assistant"
          >
            <Mic className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Discreet Evaluator Demo Controls Drawer */}
      <JudgeDemoDrawer
        activeScenario={activeScenario}
        onSelectScenario={(scId) => setActiveScenario(scId)}
        onResetToLive={() => setActiveScenario(null)}
        simulatedHour={simulatedHour}
        onHourChange={(hr) => setSimulatedHour(hr)}
        onApplyProfile={(prof) => handleSaveContext({ ...context, ...prof })}
      />

      {/* ── ONBOARDING MODAL 1: LOCATION PERMISSION (ONLY ACCEPT BUTTON) ────── */}
      {onboardingStep === 'location' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-sky-100 dark:border-slate-800 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center mx-auto shadow-sm">
              <MapPin className="w-8 h-8 animate-bounce text-sky-600 dark:text-sky-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#0B1F33] dark:text-white tracking-tight">
                {t.onboarding_location_title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.onboarding_location_desc}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Hyperlocal Doppler telemetry</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Automated IMD station synchronization</span>
              </div>
            </div>

            {/* ONLY ACCEPT BUTTON per strict instructions */}
            <button
              onClick={handleAcceptLocation}
              disabled={isRequestingLocation}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRequestingLocation ? (
                <span>{t.onboarding_locating}</span>
              ) : (
                <>
                  <span>{t.onboarding_accept}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── ONBOARDING MODAL 2: LANGUAGE SELECTION (ALL 23 INDIAN LANGUAGES) ─ */}
      {onboardingStep === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-sky-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {t.onboarding_lang_title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.onboarding_lang_desc}
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  placeholder={t.onboarding_search_lang}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Language Selection Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_INDIAN_LANGUAGES.filter((l) => {
                if (!langSearchQuery.trim()) return true;
                const q = langSearchQuery.toLowerCase().trim();
                return (
                  l.code.toLowerCase().includes(q) ||
                  l.name.toLowerCase().includes(q) ||
                  l.native.toLowerCase().includes(q) ||
                  l.region.toLowerCase().includes(q)
                );
              }).map((l) => {
                const isSelected = tempSelectedLang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setTempSelectedLang(l.code);
                      setLanguage(l.code);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/40 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{l.native}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{l.name} • {l.region}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Footer Continue Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.onboarding_selected}: <strong className="text-sky-700 dark:text-sky-400 uppercase font-mono">{tempSelectedLang}</strong>
              </span>
              <button
                onClick={handleCompleteLanguage}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5"
              >
                <span>{t.onboarding_continue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-800 dark:text-white">MAUSAM</strong>
            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
            <span>Powered by VayuSync Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Dynamic Dual-Theme (Light / Dark)</span>
            <span>•</span>
            <span>National Meteorological Service Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return <MainApp />;
}

