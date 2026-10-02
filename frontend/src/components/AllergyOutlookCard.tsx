'use client';

import React from 'react';
import { ShieldAlert, Flower2, Wind, Droplets, Sun, AlertTriangle, CheckCircle2, Shield, AlertCircle, Info } from 'lucide-react';
import { AllergyOutlook } from '../lib/types';
import { useLanguage } from '../hooks/useLanguage';

interface AllergyOutlookCardProps {
  allergyOutlook?: AllergyOutlook | null;
  userSensitivities?: string[];
}

export const AllergyOutlookCard: React.FC<AllergyOutlookCardProps> = ({
  allergyOutlook,
  userSensitivities = [],
}) => {
  const { language, t } = useLanguage();

  if (!allergyOutlook) {
    return null;
  }

  const riskLabel = language === 'hi' ? 'जोखिम' : language === 'mr' ? 'धोका' : language === 'bn' ? 'ঝুঁকি' : language === 'te' ? 'ప్రమాదం' : 'Risk';
  const getRiskBadge = (level: string, color: string) => {
    let localizedLevel = level;
    if (level.toLowerCase() === 'low') localizedLevel = language === 'hi' ? 'कम' : language === 'mr' ? 'कमी' : language === 'bn' ? 'কম' : language === 'te' ? 'తక్కువ' : level;
    else if (level.toLowerCase() === 'moderate') localizedLevel = language === 'hi' ? 'मध्यम' : language === 'mr' ? 'मध्यम' : language === 'bn' ? 'মাঝারি' : language === 'te' ? 'మధ్యస్థం' : level;
    else if (level.toLowerCase() === 'high') localizedLevel = language === 'hi' ? 'उच्च' : language === 'mr' ? 'उच्च' : language === 'bn' ? 'উচ্চ' : language === 'te' ? 'ఎక్కువ' : level;

    if (color === 'green' || level.toLowerCase() === 'low') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {localizedLevel} {riskLabel}
        </span>
      );
    }
    if (color === 'blue') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          <Shield className="w-3.5 h-3.5" />
          {localizedLevel} {riskLabel}
        </span>
      );
    }
    if (color === 'amber' || level.toLowerCase() === 'moderate') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          {localizedLevel} {riskLabel}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        <ShieldAlert className="w-3.5 h-3.5" />
        {localizedLevel} {riskLabel}
      </span>
    );
  };

  const getSeverityBadge = (severity: 'low' | 'moderate' | 'high') => {
    if (severity === 'low') return <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">{language === 'hi' ? 'कम' : language === 'mr' ? 'कमी' : language === 'bn' ? 'কম' : language === 'te' ? 'తక్కువ' : 'Low'}</span>;
    if (severity === 'moderate') return <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">{language === 'hi' ? 'मध्यम' : language === 'mr' ? 'मध्यम' : language === 'bn' ? 'মাঝারি' : language === 'te' ? 'మధ్యస్థం' : 'Moderate'}</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold">{language === 'hi' ? 'उच्च' : language === 'mr' ? 'उच्च' : language === 'bn' ? 'উচ্চ' : language === 'te' ? 'ఎక్కువ' : 'High'}</span>;
  };

  const pollen = allergyOutlook.pollen;

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-purple-100 dark:border-slate-800 p-6 sm:p-7 text-slate-900 dark:text-white shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 shadow-xs">
            <Flower2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.allergy_title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.allergy_subtitle}</p>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 text-right shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
              {t.allergy_risk}
            </span>
            <div className="mt-0.5 flex justify-end">
              {getRiskBadge(allergyOutlook.risk_level, allergyOutlook.risk_color)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner & Peak Period */}
      <div className="bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl p-4 sm:p-5 border border-purple-200 dark:border-purple-800/60 mb-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
            {language === 'hi' ? 'वायुमंडलीय संपर्क विश्लेषण' : language === 'mr' ? 'वातावरणीय संपर्क विश्लेषण' : language === 'bn' ? 'বায়ুমণ্ডলীয় এক্সপোজার বিশ্লেষণ' : language === 'te' ? 'వాతావరణ బహిర్గతం విశ్లేషణ' : 'Atmospheric Exposure Analysis'}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {language === 'hi' ? 'चरम प्रभाव समय:' : language === 'mr' ? 'कमाल संपर्क वेळ:' : language === 'bn' ? 'সর্বোচ্চ প্রভাবের সময়:' : language === 'te' ? 'గరిష్ట ప్రభావ సమయం:' : 'Peak Exposure Window:'} <strong className="text-purple-700 dark:text-purple-400 font-mono">{allergyOutlook.peak_period}</strong>
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{allergyOutlook.summary}</p>
        <div className="mt-2 text-xs text-purple-800 dark:text-purple-300 font-medium">
          {language === 'hi' ? 'मार्गदर्शन:' : language === 'mr' ? 'मार्गदर्शन:' : language === 'bn' ? 'নির্দেশনা:' : language === 'te' ? 'మార్గదర్శకత్వం:' : 'Guidance:'} {allergyOutlook.vayusync_guidance}
        </div>
      </div>

      {/* Sensitivities Tags if set by user */}
      {userSensitivities.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.sensitivities}:</span>
          {userSensitivities.map((sens, i) => (
            <span
              key={i}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-xs"
            >
              {sens}
            </span>
          ))}
        </div>
      )}

      {/* Environmental Triggers Grid */}
      <div className="mb-5">
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
          {language === 'hi' ? 'वायुमंडलीय ट्रिगर मूल्यांकन' : language === 'mr' ? 'वातावरणीय ट्रिगर मूल्यांकन' : language === 'bn' ? 'বায়ুমণ্ডলীয় ট্রিগার মূল্যায়ন' : language === 'te' ? 'వాతావరణ ప్రేరేపకాల అంచనా' : 'Atmospheric Trigger Assessment'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allergyOutlook.factors.map((factor, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{factor.factor}</span>
                {getSeverityBadge(factor.severity)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pollen Data Status Panel (Strictly Handles Real Data or Explicit Unavailable Notice) */}
      <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 mb-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Flower2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.pollen_status}</span>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${pollen.available ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            {pollen.available 
              ? (language === 'hi' ? 'लाइव सेंसर डेटा' : language === 'mr' ? 'थेट सेन्सर डेटा' : language === 'bn' ? 'লাইভ সেন্সর ডেটা' : language === 'te' ? 'లైవ్ సెన్సార్ డేటా' : 'Live Sensor Data')
              : (language === 'hi' ? 'सेंसर टेलीमेट्री ऑफलाइन' : language === 'mr' ? 'सेन्सर टेलिमेट्री ऑफलाइन' : language === 'bn' ? 'সেন্সর টেলিমেট্রি অফলাইন' : language === 'te' ? 'సెన్సార్ టెలిమెట్రీ ఆఫ్‌లైన్' : 'Sensor Telemetry Offline')
            }
          </span>
        </div>

        {pollen.available ? (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {language === 'hi' ? 'पेड़ों का पराग' : language === 'mr' ? 'झाडांचे परागकण' : language === 'bn' ? 'গাছের পরাগরেণু' : language === 'te' ? 'చెట్ల పుప్పొడి' : 'Tree Pollen'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{pollen.tree_pollen ?? 0} grains/m³</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {language === 'hi' ? 'घास का पराग' : language === 'mr' ? 'गवताचे परागकण' : language === 'bn' ? 'ঘাসের পরাগরেণু' : language === 'te' ? 'గడ్డి పుప్పొడి' : 'Grass Pollen'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{pollen.grass_pollen ?? 0} grains/m³</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {language === 'hi' ? 'खरपतवार पराग' : language === 'mr' ? 'तणांचे परागकण' : language === 'bn' ? 'আগাছার পরাগরেণু' : language === 'te' ? 'కలుపు పుప్పొడి' : 'Weed Pollen'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{pollen.weed_pollen ?? 0} grains/m³</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              {language === 'hi' ? 'इस स्थान के लिए पराग डेटा अनुपलब्ध है। वायु गुणवत्ता और कण टेलीमेट्री का उपयोग किया जाता है।' :
               language === 'mr' ? 'या स्थानासाठी परागकण माहिती उपलब्ध नाही. हवा गुणवत्ता आणि कण टेलिमेट्रीचा वापर केला आहे.' :
               language === 'bn' ? 'এই অবস্থানের জন্য পরাগরেণুর তথ্য উপলব্ধ নয়। বায়ুর মান এবং কণার টেলিমেট্রি ব্যবহার করে পূর্বাভাস তৈরি করা হয়েছে।' :
               language === 'te' ? 'ఈ ప్రదేశానికి పుప్పొడి డేటా అందుబాటులో లేదు. గాలి నాణ్యత మరియు కణ టెలిమెట్రీని ఉపయోగించి అంచనా వేయబడింది.' :
               'Pollen data unavailable for this location. Air quality and particulate telemetry are used to calculate outlook.'}
            </span>
          </div>
        )}
      </div>

      {/* Precautions List */}
      {allergyOutlook.precautions && allergyOutlook.precautions.length > 0 && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">
            {t.precautions}
          </div>
          <div className="space-y-1.5">
            {allergyOutlook.precautions.map((prec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>{prec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Non-Medical Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {allergyOutlook.disclaimer || t.allergy_disclaimer}
        </p>
      </div>
    </div>
  );
};

