import { Language } from './i18n';

export interface ConditionLocalization {
  en: string;
  hi: string;
  mr: string;
  bn: string;
  te: string;
}

export const WEATHER_CONDITIONS: Record<string, ConditionLocalization> = {
  // WMO Code text matches
  'clear sky': {
    en: 'Clear Sky',
    hi: 'साफ आसमान',
    mr: 'निरभ्र आकाश',
    bn: 'পরিষ্কার আকাশ',
    te: 'నిర్మలమైన ఆకాశం',
  },
  'mainly clear': {
    en: 'Mainly Clear',
    hi: 'मुख्य रूप से साफ',
    mr: 'मुख्यतः निरभ्र',
    bn: 'বেশিরভাগ পরিষ্কার',
    te: 'ఎక్కువగా నిర్మలంగా ఉంది',
  },
  'partly cloudy': {
    en: 'Partly Cloudy',
    hi: 'आंशिक रूप से बादल',
    mr: 'अंशतः ढगाळ',
    bn: 'আংশিক মেঘলা',
    te: 'పాక్షికంగా మేఘావృతం',
  },
  'overcast': {
    en: 'Overcast',
    hi: 'मेघाच्छादित',
    mr: 'पूर्ण ढगाळ',
    bn: 'মেঘাচ্ছন্ন',
    te: 'పూర్తిగా మేఘావృతం',
  },
  'fog': {
    en: 'Fog',
    hi: 'कोहरा',
    mr: 'धुके',
    bn: 'কুয়াশা',
    te: 'పొగమంచు',
  },
  'depositing rime fog': {
    en: 'Depositing Rime Fog',
    hi: 'सघन पाला कोहरा',
    mr: 'दाट धुके',
    bn: 'ঘন তুষার কুয়াশা',
    te: 'దట్టమైన పొగమంచు',
  },
  'light drizzle': {
    en: 'Light Drizzle',
    hi: 'हल्की बूंदाबांदी',
    mr: 'हलकी रिमझिम',
    bn: 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি',
    te: 'తేలికపాటి చినుకులు',
  },
  'moderate drizzle': {
    en: 'Moderate Drizzle',
    hi: 'मध्यम बूंदाबांदी',
    mr: 'मध्यम रिमझिम',
    bn: 'মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি',
    te: 'మోస్తరు చినుకులు',
  },
  'dense drizzle': {
    en: 'Dense Drizzle',
    hi: 'घनी बूंदाबांदी',
    mr: 'दाट रिमझिम',
    bn: 'ঘন গুঁড়ি গুঁড়ি বৃষ্টি',
    te: 'దట్టమైన చినుకులు',
  },
  'slight rain showers': {
    en: 'Slight Rain Showers',
    hi: 'हल्की बारिश की बौछारें',
    mr: 'हलक्या पावसाच्या सरी',
    bn: 'হালকা বৃষ্টির ধারা',
    te: 'తేలికపాటి జల్లులు',
  },
  'light rain showers': {
    en: 'Light Rain Showers',
    hi: 'हल्की बारिश की बौछारें',
    mr: 'हलक्या पावसाच्या सरी',
    bn: 'হালকা বৃষ্টির ধারা',
    te: 'తేలికపాటి జల్లులు',
  },
  'moderate rain showers': {
    en: 'Moderate Rain Showers',
    hi: 'मध्यम बारिश की बौछारें',
    mr: 'मध्यम पावसाच्या सरी',
    bn: 'মাঝারি বৃষ্টির ধারা',
    te: 'మోస్తరు జల్లులు',
  },
  'violent rain showers': {
    en: 'Violent Rain Showers',
    hi: 'मूसलाधार बारिश की बौछारें',
    mr: 'मुसळधार पावसाच्या सरी',
    bn: 'প্রবল বর্ষণের ধারা',
    te: 'భారీ వర్షపు జల్లులు',
  },
  'slight rain': {
    en: 'Slight Rain',
    hi: 'हल्की बारिश',
    mr: 'हलका पाऊस',
    bn: 'হালকা বৃষ্টি',
    te: 'తేలికపాటి వర్షం',
  },
  'light rain': {
    en: 'Light Rain',
    hi: 'हल्की बारिश',
    mr: 'हलका पाऊस',
    bn: 'হালকা বৃষ্টি',
    te: 'తేలికపాటి వర్షం',
  },
  'moderate rain': {
    en: 'Moderate Rain',
    hi: 'मध्यम बारिश',
    mr: 'मध्यम पाऊस',
    bn: 'মাঝারি বৃষ্টি',
    te: 'మోస్తరు వర్షం',
  },
  'heavy rain': {
    en: 'Heavy Rain',
    hi: 'भारी बारिश',
    mr: 'मुसळधार पाऊस',
    bn: 'ভারী বৃষ্টি',
    te: 'భారీ వర్షం',
  },
  'thunderstorm': {
    en: 'Thunderstorm',
    hi: 'गरज के साथ बारिश',
    mr: 'वादळी पाऊस / मेघगर्जना',
    bn: 'বজ্রবিদ্যুৎসহ ঝড়-বৃষ্টি',
    te: 'ఉరుములు మెరుపులతో కూడిన వర్షం',
  },
  'thunderstorm with slight hail': {
    en: 'Thunderstorm with Slight Hail',
    hi: 'ओलावृष्टि के साथ आंधी-तूफान',
    mr: 'गारपिटीसह वादळी पाऊस',
    bn: 'শিলাবৃষ্টিসহ বজ্রঝড়',
    te: 'వడగండ్లతో కూడిన ఉరుముల వర్షం',
  },
  'thunderstorm with heavy hail': {
    en: 'Thunderstorm with Heavy Hail',
    hi: 'भारी ओलावृष्टि के साथ आंधी-तूफान',
    mr: 'तीव्र गारपिटीसह वादळी पाऊस',
    bn: 'ভারী শিলাবৃষ্টিসহ তীব্র বজ্রঝড়',
    te: 'తీవ్ర వడగండ్లతో భారీ ఉరుముల వర్షం',
  },
  'slight snow fall': {
    en: 'Slight Snow Fall',
    hi: 'हल्की बर्फबारी',
    mr: 'हलकी हिमवृष्टी',
    bn: 'হালকা তুষারপাত',
    te: 'తేలికపాటి మంచు కురవడం',
  },
  'moderate snow fall': {
    en: 'Moderate Snow Fall',
    hi: 'मध्यम बर्फबारी',
    mr: 'मध्यम हिमवृष्टी',
    bn: 'মাঝারি তুষারপাত',
    te: 'మోస్తరు మంచు కురవడం',
  },
  'heavy snow fall': {
    en: 'Heavy Snow Fall',
    hi: 'भारी बर्फबारी',
    mr: 'दाट हिमवृष्टी',
    bn: 'ভারী তুষারপাত',
    te: 'భారీ మంచు కురవడం',
  },
  'mist': {
    en: 'Mist',
    hi: 'कुहासा',
    mr: 'धुके',
    bn: 'কুয়াশাচ্ছন্ন ভাব',
    te: 'చిరు పొగమంచు',
  },
  'haze': {
    en: 'Haze',
    hi: 'धुंध',
    mr: 'धुसर हवा',
    bn: 'ধোঁয়াশা',
    te: 'మసక బారిన వాతావరణం',
  },
  'smog': {
    en: 'Smog',
    hi: 'स्मॉग / धुआंसा',
    mr: 'धूरकट धुके',
    bn: 'বিষাক্ত ধোঁয়াশা (স্মগ)',
    te: 'పొగ-మంచు (స్మాగ్)',
  },
  'dust': {
    en: 'Dust Storm',
    hi: 'धूल भरी आंधी',
    mr: 'धुळीचे वादळ',
    bn: 'ধূলিঝড়',
    te: 'ధూళి తుఫాను',
  },
};

// Fallback normalized dictionary
export function getLocalizedWeatherCondition(
  rawConditionText: string | undefined | null,
  lang: Language = 'en'
): string {
  if (!rawConditionText) return '';
  const normalized = rawConditionText.trim().toLowerCase();

  // Exact match
  if (WEATHER_CONDITIONS[normalized]) {
    const item = WEATHER_CONDITIONS[normalized];
    if (lang === 'hi') return item.hi;
    if (lang === 'mr') return item.mr;
    if (lang === 'bn') return item.bn;
    if (lang === 'te') return item.te;
    return item.en;
  }

  // Partial match checks
  if (normalized.includes('thunder')) {
    if (lang === 'hi') return 'गरज के साथ बारिश';
    if (lang === 'mr') return 'वादळी पाऊस';
    if (lang === 'bn') return 'বজ্রবিদ্যুৎসহ ঝড়-বৃষ্টি';
    if (lang === 'te') return 'ఉరుములతో కూడిన వర్షం';
    return 'Thunderstorm';
  }
  if (normalized.includes('drizzle')) {
    if (normalized.includes('light') || normalized.includes('slight')) {
      if (lang === 'hi') return 'हल्की बूंदाबांदी';
      if (lang === 'mr') return 'हलकी रिमझिम';
      if (lang === 'bn') return 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি';
      if (lang === 'te') return 'తేలికపాటి చినుకులు';
      return 'Light Drizzle';
    }
    if (lang === 'hi') return 'मध्यम बूंदाबांदी';
    if (lang === 'mr') return 'मध्यम रिमझिम';
    if (lang === 'bn') return 'মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি';
    if (lang === 'te') return 'మోస్తరు చినుకులు';
    return 'Moderate Drizzle';
  }
  if (normalized.includes('shower')) {
    if (lang === 'hi') return 'बारिश की बौछारें';
    if (lang === 'mr') return 'पावसाच्या सरी';
    if (lang === 'bn') return 'বৃষ্টির ধারা';
    if (lang === 'te') return 'వర్షపు జల్లులు';
    return 'Rain Showers';
  }
  if (normalized.includes('rain')) {
    if (normalized.includes('heavy')) {
      if (lang === 'hi') return 'भारी बारिश';
      if (lang === 'mr') return 'मुसळधार पाऊस';
      if (lang === 'bn') return 'ভারী বৃষ্টি';
      if (lang === 'te') return 'భారీ వర్షం';
      return 'Heavy Rain';
    }
    if (normalized.includes('light') || normalized.includes('slight')) {
      if (lang === 'hi') return 'हल्की बारिश';
      if (lang === 'mr') return 'हलका पाऊस';
      if (lang === 'bn') return 'হালকা বৃষ্টি';
      if (lang === 'te') return 'తేలికపాటి వర్షం';
      return 'Light Rain';
    }
    if (lang === 'hi') return 'बारिश';
    if (lang === 'mr') return 'पाऊस';
    if (lang === 'bn') return 'বৃষ্টি';
    if (lang === 'te') return 'వర్షం';
    return 'Rain';
  }
  if (normalized.includes('cloud')) {
    if (normalized.includes('partly')) {
      if (lang === 'hi') return 'आंशिक रूप से बादल';
      if (lang === 'mr') return 'अंशतः ढगाळ';
      if (lang === 'bn') return 'আংশিক মেঘলা';
      if (lang === 'te') return 'పాక్షికంగా మేఘావృతం';
      return 'Partly Cloudy';
    }
    if (lang === 'hi') return 'बादल छाए रहेंगे';
    if (lang === 'mr') return 'ढगाळ';
    if (lang === 'bn') return 'মেঘাচ্ছন্ন';
    if (lang === 'te') return 'మేఘావృతం';
    return 'Cloudy';
  }
  if (normalized.includes('clear')) {
    if (lang === 'hi') return 'साफ आसमान';
    if (lang === 'mr') return 'निरभ्र आकाश';
    if (lang === 'bn') return 'পরিষ্কার আকাশ';
    if (lang === 'te') return 'నిర్మలమైన ఆకాశం';
    return 'Clear Sky';
  }
  if (normalized.includes('fog')) {
    if (lang === 'hi') return 'कोहरा';
    if (lang === 'mr') return 'धुके';
    if (lang === 'bn') return 'কুয়াশা';
    if (lang === 'te') return 'పొగమంచు';
    return 'Fog';
  }
  if (normalized.includes('haze')) {
    if (lang === 'hi') return 'धुंध';
    if (lang === 'mr') return 'धुसर हवा';
    if (lang === 'bn') return 'ধোঁয়াশা';
    if (lang === 'te') return 'మసక బారిన వాతావరణం';
    return 'Haze';
  }

  return rawConditionText;
}

// Weekday localization helper
export const WEEKDAY_LOCALIZATION: Record<string, { en: string; hi: string; mr: string; bn: string; te: string }> = {
  Mon: { en: 'Mon', hi: 'सोम', mr: 'सोम', bn: 'সোম', te: 'సోమ' },
  Tue: { en: 'Tue', hi: 'मंगल', mr: 'मंगळ', bn: 'মঙ্গল', te: 'మంగళ' },
  Wed: { en: 'Wed', hi: 'बुध', mr: 'बुध', bn: 'বুধ', te: 'బుధ' },
  Thu: { en: 'Thu', hi: 'गुरु', mr: 'गुरू', bn: 'বৃহঃ', te: 'గురు' },
  Fri: { en: 'Fri', hi: 'शुक्र', mr: 'शुक्र', bn: 'শুক্র', te: 'శుక్ర' },
  Sat: { en: 'Sat', hi: 'शनि', mr: 'शनि', bn: 'শনি', te: 'శని' },
  Sun: { en: 'Sun', hi: 'रवि', mr: 'रवि', bn: 'রবি', te: 'ఆది' },
  Monday: { en: 'Monday', hi: 'सोमवार', mr: 'सोमवार', bn: 'সোমবার', te: 'సోమవారం' },
  Tuesday: { en: 'Tuesday', hi: 'मंगलवार', mr: 'मंगळवार', bn: 'মঙ্গলবার', te: 'మంగళవారం' },
  Wednesday: { en: 'Wednesday', hi: 'बुधवार', mr: 'बुधवार', bn: 'बुధవారం', te: 'బుధవారం' },
  Thursday: { en: 'Thursday', hi: 'गुरुवार', mr: 'गुरूवार', bn: 'বৃহস্পতিবার', te: 'గురువారం' },
  Friday: { en: 'Friday', hi: 'शुक्रवार', mr: 'शुक्रवार', bn: 'শুক্রবার', te: 'శుక్రవారం' },
  Saturday: { en: 'Saturday', hi: 'शनिवार', mr: 'शनिवार', bn: 'শনিবার', te: 'శనివారం' },
  Sunday: { en: 'Sunday', hi: 'रविवार', mr: 'रविवार', bn: 'রবিবার', te: 'ఆదివారం' },
};

export function getLocalizedWeekday(dayName: string, lang: Language = 'en'): string {
  if (!dayName) return '';
  const match = WEEKDAY_LOCALIZATION[dayName.trim()];
  if (match) {
    if (lang === 'hi') return match.hi;
    if (lang === 'mr') return match.mr;
    if (lang === 'bn') return match.bn;
    if (lang === 'te') return match.te;
    return match.en;
  }
  return dayName;
}

export const MONTH_NAMES_LOCALIZATION: Array<{ en: string; hi: string; mr: string; bn: string; te: string }> = [
  { en: 'January',   hi: 'जनवरी',   mr: 'जानेवारी',   bn: 'জানুয়ারি',   te: 'జనవరి' },
  { en: 'February',  hi: 'फ़रवरी',   mr: 'फेब्रुवारी',  bn: 'ফেব্রুয়ারি',  te: 'ఫిబ్రవరి' },
  { en: 'March',     hi: 'मार्च',    mr: 'मार्च',     bn: 'মার্চ',      te: 'మార్చి' },
  { en: 'April',     hi: 'अप्रैल',   mr: 'एप्रिल',    bn: 'এপ্রিল',     te: 'ఏప్రిల్' },
  { en: 'May',       hi: 'मई',      mr: 'मे',       bn: 'মে',        te: 'మే' },
  { en: 'June',      hi: 'जून',     mr: 'जून',      bn: 'জুন',       te: 'జూన్' },
  { en: 'July',      hi: 'जुलाई',   mr: 'जुलै',      bn: 'জুলাই',      te: 'జూలై' },
  { en: 'August',    hi: 'अगस्त',   mr: 'ऑगस्ट',     bn: 'আগস্ট',      te: 'ఆగస్టు' },
  { en: 'September', hi: 'सितम्बर', mr: 'सप्टेंबर',  bn: 'সেপ্টেম্বর',  te: 'సెప్టెంబర్' },
  { en: 'October',   hi: 'अक्टूबर', mr: 'ऑक्टोबर',   bn: 'অক্টোবর',    te: 'అక్టోబర్' },
  { en: 'November',  hi: 'नवम्बर',  mr: 'नोव्हेंबर',  bn: 'নভেম্বর',    te: 'నవంబర్' },
  { en: 'December',  hi: 'दिसम्बर', mr: 'डिसेंबर',   bn: 'ডিসেম্বর',    te: 'డిసెంబర్' },
];

export function getLocalizedMonth(monthIndex: number, lang: Language = 'en'): string {
  const m = MONTH_NAMES_LOCALIZATION[monthIndex];
  if (!m) return '';
  if (lang === 'hi') return m.hi;
  if (lang === 'mr') return m.mr;
  if (lang === 'bn') return m.bn;
  if (lang === 'te') return m.te;
  return m.en;
}

export function formatDisplayDate(dateStr: string, lang: Language = 'en'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = getLocalizedMonth(monthIdx, lang);
  return `${day} ${monthName} ${year}`;
}
