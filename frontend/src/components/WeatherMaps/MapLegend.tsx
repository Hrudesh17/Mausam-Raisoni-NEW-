'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Info, HelpCircle } from 'lucide-react';
import { WeatherMapLayerType } from './MapLayerSelector';
import { useLanguage } from '../../hooks/useLanguage';

interface MapLegendProps {
  activeLayer: WeatherMapLayerType;
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeLayer }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const localizedText = React.useMemo(() => {
    switch (language) {
      case 'bn':
        return {
          legendTitle: 'মানচিত্রের নির্দেশিকা',
          openLegend: 'নির্দেশিকা খুলুন',
          closeLegend: 'নির্দেশিকা বন্ধ করুন',
          radar: {
            title: 'বৃষ্টিপাত (dBZ)',
            sub: 'ডপলার প্রতিফলন',
            light: 'হালকা (১৫)',
            mod: 'মাঝারি (৩০)',
            heavy: 'ভারী (৪৫)',
            severe: 'তীব্র (৬০+)',
            desc: 'IMD রাডার স্টেশন দ্বারা সনাক্তকৃত বৃষ্টিবিন্দু ও ঝড়ের গতিবিধি প্রদর্শন করে।',
          },
          wind: {
            title: 'বাতাসের গতিবেগ',
            unit: 'কিমি/ঘণ্টা',
            desc: 'কণাগুলো অ্যানিমেটেড স্ট্রীমলাইন প্রবাহ অনুসরণ করে; গতি রেখার বেগ ও রঙের সাথে সামঞ্জস্যপূর্ণ।',
          },
          temp: {
            title: 'পৃষ্ঠের তাপমাত্রা',
            desc: 'তাপমাত্রার রূপরেখা এবং স্টেশন পিন ২-মিটার বাতাসের তাপমাত্রা ও স্থানীয় তাপপ্রবাহ নির্দেশ করে।',
          },
          clouds: {
            title: 'মেঘের অপটিক্যাল গভীরতা',
            sub: 'ইনফ্রারেড',
            clear: 'পরিষ্কার',
            scattered: 'বিক্ষিপ্ত',
            broken: 'খণ্ড মেঘ',
            overcast: 'মেঘাচ্ছন্ন',
            desc: 'জিওস্টেশনারি স্যাটেলাইট ইনফ্রারেড সেন্সিং মেঘের উচ্চতা এবং বায়ুমণ্ডলীয় আর্দ্রতা প্রদর্শন করে।',
          },
          airq: {
            title: 'জাতীয় AQI সূচক',
            sub: 'CPCB মানদণ্ড',
            desc: 'সার্বক্ষণিক বায়ুর মান পর্যবেক্ষণ: PM2.5, PM10, নাইট্রোজেন ডাই অক্সাইড এবং ওজোন।',
          },
        };
      case 'te':
        return {
          legendTitle: 'మ్యాప్ లెజెండ్',
          openLegend: 'లెజెండ్ తెరవండి',
          closeLegend: 'లెజెండ్ మూసివేయండి',
          radar: {
            title: 'వర్షపాతం (dBZ)',
            sub: 'డాప్లర్ రిఫ్లెక్టివిటీ',
            light: 'తేలికపాటి (15)',
            mod: 'మోస్తరు (30)',
            heavy: 'భారీ (45)',
            severe: 'తీవ్రమైన (60+)',
            desc: 'IMD రాడార్ స్టేషన్లు గుర్తించిన వర్షపు చినుకులు మరియు తుఫాను కణాలను సూచిస్తుంది.',
          },
          wind: {
            title: 'గాలి వేగం',
            unit: 'కిమీ/గం',
            desc: 'కణాలు యానిమేటెడ్ స్ట్రీమ్‌లైన్ ప్రవాహాన్ని అనుసరిస్తాయి; వేగం రంగు తీవ్రతను బట్టి మారుతుంది.',
          },
          temp: {
            title: 'ఉపరితల ఉష్ణోగ్రత',
            desc: 'ఉష్ణోగ్రత కాంటూర్లు మరియు స్టేషన్ పిన్లు 2-మీటర్ల గాలి ఉష్ణోగ్రతను సూచిస్తాయి.',
          },
          clouds: {
            title: 'మేఘాల సాంద్రత',
            sub: 'ఇన్‌ఫ్రారెడ్',
            clear: 'నిర్మలంగా',
            scattered: 'చెల్లాచెదురుగా',
            broken: 'పాక్షిక మేఘాలు',
            overcast: 'పూర్తిగా మేఘావృతం',
            desc: 'శాటిలైట్ ఇన్‌ఫ్రారెడ్ సెన్సింగ్ మేఘాల ఎత్తు మరియు వాతావరణ తేమను చూపుతుంది.',
          },
          airq: {
            title: 'జాతీయ AQI సూచిక',
            sub: 'CPCB ప్రమాణాలు',
            desc: 'నిరంతర గాలి నాణ్యత పర్యవేక్షణ: PM2.5, PM10, నైట్రోజన్ డయాక్సైడ్ మరియు ఓజోన్.',
          },
        };
      case 'mr':
        return {
          legendTitle: 'नकाशा सूची',
          openLegend: 'सूची उघडा',
          closeLegend: 'सूची बंद करा',
          radar: {
            title: 'पर्जन्यवृष्टी (dBZ)',
            sub: 'डॉपलर परावर्तकता',
            light: 'हलका (१५)',
            mod: 'मध्यम (३०)',
            heavy: 'मुसळधार (४५)',
            severe: 'अतिवृष्टी (६०+)',
            desc: 'IMD रडार स्थानकांद्वारे नोंदवलेले पावसाचे थेंब, गारपीट आणि वादळी ढग दर्शवते.',
          },
          wind: {
            title: 'वाऱ्याचा वेग',
            unit: 'किमी/तास',
            desc: 'कण ॲनिमेटेड प्रवाह रेषेनुसार वाहतात; वेग रेषेचा वेग व रंगाशी संबंधित आहे.',
          },
          temp: {
            title: 'पृष्ठभागाचे तापमान',
            desc: 'थर्मल कंटूर्स आणि स्थानक चिन्हे जमिनीपासून २-मीटर हवेचे तापमान दर्शवतात.',
          },
          clouds: {
            title: 'ढगांची सघनता',
            sub: 'इन्फ्रारेड',
            clear: 'निरभ्र',
            scattered: 'विखुरलेले',
            broken: 'खंडित ढग',
            overcast: 'ढगाळ वातावरण',
            desc: 'उपग्रह इन्फ्रारेड सेन्सिंगद्वारे ढगांची उंची व वातावरणातील आर्द्रता दर्शवली जाते.',
          },
          airq: {
            title: 'राष्ट्रीय AQI निर्देशांक',
            sub: 'CPCB मानके',
            desc: 'सतत हवेची गुणवत्ता देखरेख: PM2.5, PM10, नायट्रोजन डायऑक्साइड आणि ओझोन.',
          },
        };
      case 'hi':
        return {
          legendTitle: 'मानचित्र संकेतिका',
          openLegend: 'संकेतिका खोलें',
          closeLegend: 'संकेतिका बंद करें',
          radar: {
            title: 'वर्षण तीव्रता (dBZ)',
            sub: 'डॉप्लर परावर्तन',
            light: 'हल्का (15)',
            mod: 'मध्यम (30)',
            heavy: 'भारी (45)',
            severe: 'अति गंभीर (60+)',
            desc: 'आईएमडी रडार स्टेशनों द्वारा पता लगाए गए वर्षा की बूंदों और बादलों को दर्शाता है।',
          },
          wind: {
            title: 'वायु वेग',
            unit: 'किमी/घंटा',
            desc: 'कण एनिमेटेड प्रवाह रेखा का अनुसरण करते हैं; गति रेखा के वेग और रंग से संबंधित है।',
          },
          temp: {
            title: 'सतह का तापमान',
            desc: 'थर्मल कंटूर और स्टेशन पिन 2-मीटर हवा के तापमान और लू की स्थिति को दर्शाते हैं।',
          },
          clouds: {
            title: 'बादलों की सघनता',
            sub: 'इन्फ्रारेड',
            clear: 'साफ',
            scattered: 'छितराए हुए',
            broken: 'खंडित बादल',
            overcast: 'घने बादल',
            desc: 'उपग्रह इन्फ्रारेड सेंसिंग बादलों की ऊंचाई और वायुमंडलीय नमी को मापता है।',
          },
          airq: {
            title: 'राष्ट्रीय AQI सूचकांक',
            sub: 'सीपीसीबी मानक',
            desc: 'सतत परिवेशी वायु गुणवत्ता निगरानी: PM2.5, PM10, नाइट्रोजन डाइऑक्साइड और ओजोन।',
          },
        };
      default:
        return {
          legendTitle: 'Map Legend',
          openLegend: 'Open Map Legend',
          closeLegend: 'Close Legend',
          radar: {
            title: 'Precipitation (dBZ)',
            sub: 'Doppler Reflectivity',
            light: 'Light (15)',
            mod: 'Mod (30)',
            heavy: 'Heavy (45)',
            severe: 'Severe (60+)',
            desc: 'Reflects raindrops, hail cores, and convective storm cells detected by IMD radar stations.',
          },
          wind: {
            title: 'Wind Velocity',
            unit: 'km/h',
            desc: 'Particles follow animated streamline flow; speed corresponds to streak velocity and color warmth.',
          },
          temp: {
            title: 'Surface Temperature',
            desc: 'Thermal contours and station pins reflect 2-meter air temperature and regional heatwave bands.',
          },
          clouds: {
            title: 'Cloud Optical Depth',
            sub: 'Infrared',
            clear: 'Clear',
            scattered: 'Scattered',
            broken: 'Broken',
            overcast: 'Overcast',
            desc: 'Geostationary satellite infrared sensing cloud top heights and atmospheric moisture coverage.',
          },
          airq: {
            title: 'National AQI Index',
            sub: 'CPCB Standards',
            desc: 'Continuous Ambient Air Quality Monitoring: PM2.5, PM10, Nitrogen Dioxide and Ozone.',
          },
        };
    }
  }, [language]);

  const renderLegendContent = () => {
    switch (activeLayer) {
      case 'radar':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{localizedText.radar.title}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{localizedText.radar.sub}</span>
            </div>
            
            {/* Gradient bar */}
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 via-rose-500 to-purple-600 shadow-2xs" />
            
            {/* Scale values */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span>{localizedText.radar.light}</span>
              <span>{localizedText.radar.mod}</span>
              <span>{localizedText.radar.heavy}</span>
              <span>{localizedText.radar.severe}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {localizedText.radar.desc}
            </p>
          </div>
        );

      case 'wind':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{localizedText.wind.title}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{localizedText.wind.unit}</span>
            </div>
            
            {/* Gradient bar */}
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-cyan-400 via-teal-400 via-yellow-400 via-orange-500 to-rose-600 shadow-2xs" />
            
            {/* Scale values */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span>0 {localizedText.wind.unit}</span>
              <span>20</span>
              <span>45</span>
              <span>75</span>
              <span>100+</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {localizedText.wind.desc}
            </p>
          </div>
        );

      case 'temp':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{localizedText.temp.title}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">°C</span>
            </div>
            
            {/* Gradient bar */}
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-blue-500 via-teal-400 via-amber-300 via-orange-500 to-rose-700 shadow-2xs" />
            
            {/* Scale values */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span>&lt; 15°</span>
              <span>22°</span>
              <span>30°</span>
              <span>38°</span>
              <span>44°+</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {localizedText.temp.desc}
            </p>
          </div>
        );

      case 'clouds':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{localizedText.clouds.title}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{localizedText.clouds.sub}</span>
            </div>
            
            {/* Gradient bar */}
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-slate-200 via-slate-400 via-indigo-300 to-white shadow-2xs" />
            
            {/* Scale values */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span>{localizedText.clouds.clear}</span>
              <span>{localizedText.clouds.scattered}</span>
              <span>{localizedText.clouds.broken}</span>
              <span>{localizedText.clouds.overcast}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {localizedText.clouds.desc}
            </p>
          </div>
        );

      case 'airq':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{localizedText.airq.title}</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{localizedText.airq.sub}</span>
            </div>
            
            {/* Gradient bar */}
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 via-red-600 to-purple-800 shadow-2xs" />
            
            {/* Scale values */}
            <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300">
              <span>0-50</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400+</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {localizedText.airq.desc}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="absolute right-0 top-16 z-30 flex items-start select-none">
      {/* Collapsed Tab (< Legend) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 py-3 px-1.5 rounded-l-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-y border-slate-300 dark:border-slate-700 shadow-xl text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition [writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-wider"
          title={localizedText.openLegend}
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          <span>{localizedText.legendTitle}</span>
        </button>
      )}

      {/* Expanded Legend Panel */}
      {isOpen && (
        <div className="mr-2 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-64 text-xs animate-in slide-in-from-right duration-200 space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {localizedText.legendTitle}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={localizedText.closeLegend}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Layer Content */}
          {renderLegendContent()}

        </div>
      )}
    </div>
  );
};
