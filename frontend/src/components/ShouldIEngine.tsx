'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Send, 
  Sparkles,
  ArrowRight,
  Umbrella,
  Car,
  Bike,
  Activity,
  Sprout,
  Users
} from 'lucide-react';
import { WeatherResponse, UserContext, ShouldIResponse } from '../lib/types';
import { askShouldI } from '../lib/api';
import { getPersonaQuestionsForRoles } from '../lib/personaConfig';
import { useLanguage } from '../hooks/useLanguage';

interface ShouldIEngineProps {
  weather: WeatherResponse;
  context: UserContext;
  activePersonaId?: string;
}

export const ShouldIEngine: React.FC<ShouldIEngineProps> = ({ weather, context, activePersonaId }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Derive dynamic persona-specific questions with active language
  const activeRoles = activePersonaId ? [activePersonaId] : (context.interests || ['commute']);
  const dynamicQuestions = getPersonaQuestionsForRoles(activeRoles, language);
  const defaultQueryText = dynamicQuestions[0]?.text || (
    language === 'bn' ? 'আমার কি আজ ছাতা নেওয়া উচিত?' :
    language === 'te' ? 'నేను ఈరోజు గొడుగు తీసుకెళ్లాలా?' :
    language === 'mr' ? 'मी आज छत्री सोबत ठेवावी का?' :
    language === 'hi' ? 'क्या मुझे आज छाता ले जाना चाहिए?' :
    'Should I carry an umbrella today?'
  );

  const getDefaultResponse = React.useCallback((): ShouldIResponse => {
    const isRainy = weather.current.precipitation_probability >= 50;
    const p = weather.current.precipitation_probability;
    const cond = weather.current.condition_text;

    switch (language) {
      case 'bn':
        return {
          query: defaultQueryText,
          verdict: isRainy ? "YES" : "NO",
          headline: isRainy ? "ছাতা বা বৃষ্টির পোশাক সাথে রাখুন।" : "আবহাওয়া বর্তমানে পরিষ্কার রয়েছে।",
          reason: isRainy 
            ? `বৃষ্টির সম্ভাবনা ${p}% বেশি রয়েছে।` 
            : `বৃষ্টির সম্ভাবনা কম, মাত্র ${p}%।`,
          tip: isRainy 
            ? "ব্যাগে একটি ছোট ছাতা রাখুন।" 
            : "আপনার দৈনিক রুটিনের জন্য অনুকূল পরিস্থিতি।",
          confidence: 0.94,
          data_points: {
            "বৃষ্টির ঝুঁকি": `${p}%`,
            "বর্তমান পরিস্থিতি": cond
          }
        };
      case 'te':
        return {
          query: defaultQueryText,
          verdict: isRainy ? "YES" : "NO",
          headline: isRainy ? "గొడుగు లేదా రెయిన్‌కోట్ వెంట ఉంచుకోండి." : "ప్రస్తుతం వాతావరణం నిర్మలంగా ఉంది.",
          reason: isRainy 
            ? `వర్షం పడే అవకాశం ${p}% ఎక్కువగా ఉంది.` 
            : `వర్షం పడే అవకాశం చాలా తక్కువ, కేవలం ${p}%.`,
          tip: isRainy 
            ? "మీ బ్యాగ్‌లో కాంపాక్ట్ గొడుగు ఉంచుకోండి." 
            : "మీ దినచర్యలకు అనుకూలమైన పరిస్థితులు.",
          confidence: 0.94,
          data_points: {
            "వర్ష ప్రమాదం": `${p}%`,
            "ప్రస్తుత పరిస్థితి": cond
          }
        };
      case 'mr':
        return {
          query: defaultQueryText,
          verdict: isRainy ? "YES" : "NO",
          headline: isRainy ? "छत्री किंवा पावसाळी कपडे सोबत ठेवा." : "सध्या हवामान निरभ्र आहे.",
          reason: isRainy 
            ? `पावसाची शक्यता ${p}% इतकी जास्त आहे.` 
            : `पावसाची शक्यता कमी, फक्त ${p}% आहे.`,
          tip: isRainy 
            ? "बॅगेत फोल्डिंग छत्री ठेवा." 
            : "तुमच्या दैनंदिन कामांसाठी अनुकूल वातावरण.",
          confidence: 0.94,
          data_points: {
            "पावसाचा धोका": `${p}%`,
            "सध्याची स्थिती": cond
          }
        };
      case 'hi':
        return {
          query: defaultQueryText,
          verdict: isRainy ? "YES" : "NO",
          headline: isRainy ? "छाता या रेन गियर साथ रखें।" : "मौसम वर्तमान में साफ है।",
          reason: isRainy 
            ? `बारिश की संभावना ${p}% है।` 
            : `बारिश की संभावना कम, केवल ${p}% है।`,
          tip: isRainy 
            ? "बैग में एक कॉम्पैक्ट छाता रखें।" 
            : "आपकी दिनचर्या के लिए अनुकूल स्थितियां।",
          confidence: 0.94,
          data_points: {
            "बारिश का जोखिम": `${p}%`,
            "वर्तमान स्थिति": cond
          }
        };
      default:
        return {
          query: defaultQueryText,
          verdict: isRainy ? "YES" : "NO",
          headline: isRainy ? "Carry an umbrella or rain gear." : "Conditions currently clear.",
          reason: isRainy 
            ? `Precipitation probability is high at ${p}%.` 
            : `Precipitation probability is low at ${p}%.`,
          tip: isRainy 
            ? "Keep a compact umbrella in your bag." 
            : "Favorable conditions for your active persona routines.",
          confidence: 0.94,
          data_points: {
            "Precipitation Risk": `${p}%`,
            "Current Condition": cond
          }
        };
    }
  }, [language, defaultQueryText, weather]);

  const [response, setResponse] = useState<ShouldIResponse | null>(getDefaultResponse());

  // Update default response when language changes if no custom response was queried
  React.useEffect(() => {
    if (!query) {
      setResponse(getDefaultResponse());
    }
  }, [language, getDefaultResponse, query]);

  const handleEvaluate = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setIsLoading(true);
    setQuery(userQuery);
    try {
      const res = await askShouldI(userQuery, weather, context);
      setResponse(res);
    } catch (err) {
      console.error('Should-I evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'YES':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
          badgeBg: 'bg-emerald-600 text-white shadow-xs',
          icon: CheckCircle2,
        };
      case 'NO':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300',
          badgeBg: 'bg-rose-600 text-white shadow-xs',
          icon: XCircle,
        };
      case 'CAUTION':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300',
          badgeBg: 'bg-amber-500 text-slate-900 shadow-xs',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50 text-sky-800 dark:text-sky-300',
          badgeBg: 'bg-sky-600 text-white shadow-xs',
          icon: Clock,
        };
    }
  };

  const currentVerdict = response ? getVerdictStyle(response.verdict) : null;
  const VerdictIcon = currentVerdict?.icon || HelpCircle;

  return (
    <section className="w-full rounded-2xl glass-panel p-5 sm:p-6 space-y-4 border border-sky-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B1F33] dark:text-white flex items-center gap-2">
              {t.should_i_title}
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {t.should_i_action_layer}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.should_i_subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Persona-Driven Preset Quick Chips */}
      <div className="flex flex-wrap gap-2">
        {dynamicQuestions.map((preset, idx) => {
          const PresetIcon = preset.icon;
          const isCurrent = response?.query === preset.text;
          return (
            <button
              key={idx}
              onClick={() => handleEvaluate(preset.text)}
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 transition transform active:scale-95 ${
                isCurrent
                  ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300 font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-slate-700/50 shadow-xs'
              }`}
            >
              <PresetIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{preset.text}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEvaluate(query);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.should_i_input_placeholder}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs transition"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Decision Output Card */}
      {response && currentVerdict && (
        <div className={`p-4 sm:p-5 rounded-xl border ${currentVerdict.bg} transition-all duration-300 space-y-3`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${currentVerdict.badgeBg}`}>
                Verdict: {response.verdict === 'YES' ? t.should_i_verdict_yes : response.verdict === 'NO' ? t.should_i_verdict_no : response.verdict === 'CAUTION' ? t.should_i_verdict_caution : response.verdict}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {response.headline}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {t.should_i_confidence}: {Math.round(response.confidence * 100)}%
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {response.reason}
          </p>

          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 flex items-start gap-2 text-xs text-sky-900 dark:text-sky-200 shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{t.should_i_proactive_advice}: </span>
              {response.tip}
            </div>
          </div>

          {/* Underpinning Telemetry Data Points */}
          {response.data_points && Object.keys(response.data_points).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(response.data_points).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
                >
                  <strong className="text-slate-500 dark:text-slate-400">{k}:</strong> {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
