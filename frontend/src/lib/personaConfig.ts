import { 
  Compass, 
  Activity, 
  HeartPulse, 
  CalendarDays, 
  Sprout, 
  Briefcase, 
  Users, 
  Waves,
  LucideIcon,
  Umbrella,
  Eye,
  Wind,
  Sun,
  ShieldAlert,
  Car,
  Bike,
  Thermometer,
  CloudRain
} from 'lucide-react';

export interface DecisionQuestion {
  text: string;
  icon: LucideIcon;
  category: string;
}

export interface PersonaDefinition {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: LucideIcon;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  scheduleLabel: string;
  scheduleDescription: string;
  primaryModuleId: 'travel' | 'fitness' | 'health' | 'event' | 'krishi' | 'family' | 'beach';
  priorityMetrics: string[];
  decisionQuestions: DecisionQuestion[];
  quickRecommendations: string[];
}

export const PERSONA_CONFIG: Record<string, PersonaDefinition> = {

  running: {
    id: 'running',
    title: 'Outdoor Fitness Intelligence',
    shortTitle: 'Fitness',
    subtitle: 'Cardio safety index, thermal stress, air quality & UV safety.',
    icon: Activity,
    themeColor: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/60',
    },
    scheduleLabel: 'Your Fitness Weather Window',
    scheduleDescription: 'Best hourly windows for outdoor running and training',
    primaryModuleId: 'fitness',
    priorityMetrics: ['temperature', 'uv', 'aqi', 'humidity'],
    decisionQuestions: [
      { text: "Best time for my run?", icon: Activity, category: "running" },
      { text: "Is it safe to exercise outside?", icon: ShieldAlert, category: "running" },
      { text: "Will rain interrupt my workout?", icon: CloudRain, category: "running" },
      { text: "How strong is the UV?", icon: Sun, category: "running" },
      { text: "Should I move my workout indoors?", icon: Activity, category: "running" },
    ],
    quickRecommendations: [
      "Target early morning hours for outdoor runs when AQI and temperature are lowest.",
      "Apply UV sunscreen for workouts between 11:00 AM and 04:00 PM.",
      "Stay hydrated — target 2.5L+ fluid intake today."
    ],
  },
  travel: {
    id: 'travel',
    title: 'Travel & Highway Visibility Intelligence',
    shortTitle: 'Travel',
    subtitle: 'Visibility and weather conditions for your selected travel context.',
    icon: Compass,
    themeColor: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      border: 'border-cyan-200 dark:border-cyan-800/60',
      text: 'text-cyan-700 dark:text-cyan-300',
      badge: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700/60',
    },
    scheduleLabel: 'Your Journey in Weather',
    scheduleDescription: 'Optimal departure windows and highway risk timelines',
    primaryModuleId: 'travel',
    priorityMetrics: ['visibility', 'rain', 'wind', 'temperature'],
    decisionQuestions: [
      { text: "Is it safe to travel now?", icon: Compass, category: "travel" },
      { text: "Will rain affect my journey?", icon: CloudRain, category: "travel" },
      { text: "How is highway visibility?", icon: Eye, category: "travel" },
      { text: "What is the best departure window?", icon: Compass, category: "travel" },
      { text: "Are severe conditions expected?", icon: ShieldAlert, category: "travel" },
    ],
    quickRecommendations: [
      "Check highway visibility before departure.",
      "Monitor crosswinds on elevated expressway bridges.",
      "Keep rain gear accessible in vehicle."
    ],
  },
  family: {
    id: 'family',
    title: 'Family Weather Intelligence',
    shortTitle: 'Family',
    subtitle: 'Children outdoor play suitability, thermal index & air quality.',
    icon: Users,
    themeColor: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700/60',
    },
    scheduleLabel: 'Your Family Day',
    scheduleDescription: 'Safe outdoor play windows and UV/heat protection for children',
    primaryModuleId: 'family',
    priorityMetrics: ['rain', 'temperature', 'uv', 'aqi'],
    decisionQuestions: [
      { text: "Can children play outside?", icon: Users, category: "family" },
      { text: "Should we carry umbrellas?", icon: Umbrella, category: "family" },
      { text: "Is the afternoon too hot?", icon: Thermometer, category: "family" },
      { text: "Is air quality suitable for outdoor activity?", icon: ShieldAlert, category: "family" },
      { text: "What is the best family outdoor window?", icon: Sun, category: "family" },
    ],
    quickRecommendations: [
      "Plan outdoor park activities before 10:30 AM or after 04:30 PM.",
      "Ensure children stay hydrated during warm afternoon hours.",
      "Check AQI levels before long outdoor playground visits."
    ],
  },
  gardening: {
    id: 'gardening',
    title: 'Krishi Mausam Intelligence',
    shortTitle: 'Krishi',
    subtitle: 'Agromet crop protection, spraying safety, irrigation & field work.',
    icon: Sprout,
    themeColor: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/60',
    },
    scheduleLabel: "Today's Krishi Schedule",
    scheduleDescription: 'Agromet spraying windows, soil moisture trends, and harvest timing',
    primaryModuleId: 'krishi',
    priorityMetrics: ['rain', 'humidity', 'temperature', 'wind'],
    decisionQuestions: [
      { text: "Should I irrigate today?", icon: CloudRain, category: "gardening" },
      { text: "Should I spray pesticides today?", icon: Sprout, category: "gardening" },
      { text: "Is rain expected?", icon: CloudRain, category: "gardening" },
      { text: "Is wind suitable for spraying?", icon: Wind, category: "gardening" },
      { text: "Is today suitable for field work?", icon: Sun, category: "gardening" },
    ],
    quickRecommendations: [
      "Apply crop sprays only when wind speed is under 15 km/h.",
      "Delay irrigation if rainfall probability exceeds 60% in the next 24h.",
      "Protect sensitive nursery crops against extreme afternoon solar radiation."
    ],
  },
  beach: {
    id: 'beach',
    title: 'Beach & Coastal Intelligence',
    shortTitle: 'Beach / Marine',
    subtitle: 'Wave height, tide telemetry, coastal winds, and sea surface conditions.',
    icon: Waves,
    themeColor: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800/60',
      text: 'text-teal-700 dark:text-teal-300',
      badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700/60',
    },
    scheduleLabel: 'Your Coastal Day',
    scheduleDescription: 'Tide schedules, wave heights, and coastal wind advisories',
    primaryModuleId: 'beach',
    priorityMetrics: ['wind', 'uv', 'temperature', 'rain'],
    decisionQuestions: [
      { text: "Is today suitable for beach activity?", icon: Waves, category: "beach" },
      { text: "When is the best beach window?", icon: Sun, category: "beach" },
      { text: "Will rain affect the beach?", icon: CloudRain, category: "beach" },
      { text: "How strong is the UV?", icon: Sun, category: "beach" },
      { text: "What are the current coastal conditions?", icon: Waves, category: "beach" },
    ],
    quickRecommendations: [
      "Check official tide warnings before entering deep coastal waters.",
      "Apply water-resistant sunscreen for beach activities.",
      "Heed lifeguard flags regarding wave heights and rip currents."
    ],
  },
  health: {
    id: 'health',
    title: 'Health & Environmental Intelligence',
    shortTitle: 'Health',
    subtitle: 'AQI, particulate smog, respiratory exposure, UV, and allergen guidance.',
    icon: HeartPulse,
    themeColor: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700/60',
    },
    scheduleLabel: 'Your Environmental Exposure Timeline',
    scheduleDescription: 'Hourly respiratory risk levels and ambient sensitivity tracking',
    primaryModuleId: 'health',
    priorityMetrics: ['aqi', 'uv', 'humidity', 'temperature'],
    decisionQuestions: [
      { text: "Is air quality suitable for outdoor activity?", icon: ShieldAlert, category: "health" },
      { text: "When is UV lowest?", icon: Sun, category: "health" },
      { text: "What is today's AQI?", icon: HeartPulse, category: "health" },
      { text: "Is pollen data available?", icon: Sprout, category: "health" },
      { text: "What is the best outdoor exposure window?", icon: Sun, category: "health" },
    ],
    quickRecommendations: [
      "Monitor real-time PM2.5 telemetry before prolonged outdoor exposure.",
      "Keep windows closed during peak particulate hours.",
      "Rinse eyes and face with water after returning indoors."
    ],
  },
  event_planning: {
    id: 'event_planning',
    title: 'Event & Outdoor Planning Intelligence',
    shortTitle: 'Event Planner',
    subtitle: 'Precipitation risk, golden-hour light windows, wind risk, and venue comfort.',
    icon: CalendarDays,
    themeColor: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700/60',
    },
    scheduleLabel: 'Your Event Weather Timeline',
    scheduleDescription: 'Sunlight angles, golden hours, and outdoor venue protection',
    primaryModuleId: 'event',
    priorityMetrics: ['rain', 'temperature', 'wind', 'visibility'],
    decisionQuestions: [
      { text: "Can we host our event outdoors?", icon: CalendarDays, category: "event_planning" },
      { text: "What is the best event time?", icon: Sun, category: "event_planning" },
      { text: "Will it rain during the event?", icon: CloudRain, category: "event_planning" },
      { text: "When is golden hour?", icon: Sun, category: "event_planning" },
      { text: "What time is sunset?", icon: CalendarDays, category: "event_planning" },
      { text: "Will wind affect the event?", icon: Wind, category: "event_planning" },
    ],
    quickRecommendations: [
      "Schedule outdoor photography during morning or evening golden-hour windows.",
      "Arrange waterproof venue canopies if precipitation risk exceeds 40%.",
      "Provide water stations for outdoor guests during peak afternoon UV hours."
    ],
  },
};

export const LOCALIZED_DECISION_QUESTIONS: Record<string, Record<string, string>> = {
  "Should I carry an umbrella?": {
    hi: "क्या मुझे आज छाता ले जाना चाहिए?",
    mr: "मी आज छत्री सोबत ठेवावी का?",
    bn: "আমার কি আজ ছাতা নেওয়া উচিত?",
    te: "నేను ఈరోజు గొడుగు తీసుకెళ్లాలా?",
  },
  "Is it safe to ride my bike?": {
    hi: "क्या बाइक चलाना सुरक्षित है?",
    mr: "दुचाकी चालवणे सुरक्षित आहे का?",
    bn: "বাইক চালানো কি নিরাপদ?",
    te: "బైక్ నడపడం సురక్షితమేనా?",
  },
  "Will rain affect my commute?": {
    hi: "क्या बारिश से आवागमन प्रभावित होगा?",
    mr: "पावसामुळे प्रवासात अडथळा येईल का?",
    bn: "বৃষ্টি কি যাতায়াতে প্রভাব ফেলবে?",
    te: "వర్షం నా ప్రయాణాన్ని ప్రభావితం చేస్తుందా?",
  },
  "What is the best time to leave?": {
    hi: "निकलने का सबसे अच्छा समय क्या है?",
    mr: "निघण्यासाठी सर्वोत्तम वेळ कोणती?",
    bn: "বের হওয়ার সেরা সময় কোনটি?",
    te: "బయలుదేరడానికి ఉత్తమ సమయం ఏది?",
  },
  "Is visibility suitable for commuting?": {
    hi: "क्या आवागमन के लिए दृश्यता उपयुक्त है?",
    mr: "प्रवासासाठी दृश्यमानता योग्य आहे का?",
    bn: "যাতায়াতের জন্য দৃশ্যমানতা কি ঠিক আছে?",
    te: "ప్రయాణానికి దృశ్యమానత అనుకూలమేనా?",
  },
  "Best time for my run?": {
    hi: "दौड़ने का सबसे अच्छा समय क्या है?",
    mr: "धावण्यासाठी सर्वोत्तम वेळ कोणती?",
    bn: "দৌড়ানোর সেরা সময় কোনটি?",
    te: "పరుగుకు ఉత్తమ సమయం ఏది?",
  },
  "Is it safe to exercise outside?": {
    hi: "क्या बाहर व्यायाम करना सुरक्षित है?",
    mr: "बाहेर व्यायाम करणे सुरक्षित आहे का?",
    bn: "বাইরে ব্যায়াম করা কি নিরাপদ?",
    te: "బయట వ్యాయామం చేయడం సురక్షితమేనా?",
  },
  "Will rain interrupt my workout?": {
    hi: "क्या बारिश से कसरत में बाधा आएगी?",
    mr: "पावसामुळे व्यायामात अडथळा येईल का?",
    bn: "বৃষ্টি কি ওয়ার্কআউটে ব্যাঘাত ঘটাবে?",
    te: "వర్షం నా వ్యాయామానికి అంతరాయం కలిగిస్తుందా?",
  },
  "How strong is the UV?": {
    hi: "यूवी किरणें कितनी तीव्र हैं?",
    mr: "अतिनील किरणांची तीव्रता किती आहे?",
    bn: "ইউভি স্তর কতটা শক্তিশালী?",
    te: "UV తీవ్రత ఎంత ఉంది?",
  },
  "Should I move my workout indoors?": {
    hi: "क्या कसरत घर के अंदर करनी चाहिए?",
    mr: "व्यायाम घरात करावा का?",
    bn: "ওয়ার্কআউট কি ঘরের ভেতরে করা উচিত?",
    te: "నేను వ్యాయామాన్ని లోపలికి మార్చాలా?",
  },
  "Is it safe to travel now?": {
    hi: "क्या अभी यात्रा करना सुरक्षित है?",
    mr: "आता प्रवास करणे सुरक्षित आहे का?",
    bn: "এখন ভ্রমণ করা কি নিরাপদ?",
    te: "ఇప్పుడు ప్రయాణించడం సురక్షితమేనా?",
  },
  "Will rain affect my journey?": {
    hi: "क्या बारिश से यात्रा पर असर पड़ेगा?",
    mr: "पावसामुळे प्रवासावर परिणाम होईल का?",
    bn: "বৃষ্টি কি যাত্রায় প্রভাব ফেলবে?",
    te: "వర్షం నా ప్రయాణంపై ప్రభావం చూపుతుందా?",
  },
  "How is highway visibility?": {
    hi: "राजमार्ग पर दृश्यता कैसी है?",
    mr: "महामार्गावरील दृश्यमानता कशी आहे?",
    bn: "হাইওয়েতে দৃশ্যমানতা কেমন?",
    te: "హైవే దృశ్యమానత ఎలా ఉంది?",
  },
  "What is the best departure window?": {
    hi: "प्रस्थान का सबसे उपयुक्त समय क्या है?",
    mr: "प्रवासासाठी सर्वात योग्य वेळ कोणती?",
    bn: "যাত্রার সবচেয়ে উপযুক্ত সময় কোনটি?",
    te: "బయలుదేరడానికి అత్యంత అనుకూల సమయం ఏది?",
  },
  "Are severe conditions expected?": {
    hi: "क्या गंभीर मौसम की संभावना है?",
    mr: "गंभीर हवामानाचा अंदाज आहे का?",
    bn: "খারাপ আবহাওয়ার সম্ভাবনা আছে কি?",
    te: "తీవ్రమైన వాతావరణ పరిస్థితులు ఉంటాయా?",
  },
  "Can children play outside?": {
    hi: "क्या बच्चे बाहर खेल सकते हैं?",
    mr: "मुले बाहेर खेळू शकतात का?",
    bn: "বাচ্চারা কি বাইরে খেলতে পারে?",
    te: "పిల్లలు బయట ఆడుకోవచ్చా?",
  },
  "Should we carry umbrellas?": {
    hi: "क्या हमें छाते साथ रखने चाहिए?",
    mr: "आम्ही छत्र्या सोबत ठेवाव्यात का?",
    bn: "আমাদের কি ছাতা নেওয়া উচিত?",
    te: "మనం గొడుగులు తీసుకెళ్లాలా?",
  },
  "Is the afternoon too hot?": {
    hi: "क्या दोपहर में बहुत गर्मी होगी?",
    mr: "दुपारी खूप उष्णता असेल का?",
    bn: "দুপুরে কি অতিরিক্ত গরম?",
    te: "మధ్యాహ్నం చాలా వేడిగా ఉంటుందా?",
  },
  "Is air quality suitable for outdoor activity?": {
    hi: "क्या बाहरी गतिविधियों के लिए वायु गुणवत्ता उपयुक्त है?",
    mr: "बाहेरील हालचालींसाठी हवेची गुणवत्ता योग्य आहे का?",
    bn: "বাইরের কাজকর্মের জন্য বায়ুর মান কি উপযুক্ত?",
    te: "బహిరంగ కార్యకలాపాలకు గాలి నాణ్యత అనుకూలమేనా?",
  },
  "What is the best family outdoor window?": {
    hi: "परिवार के साथ बाहर जाने का सबसे अच्छा समय?",
    mr: "कुटुंबासह बाहेर जाण्यासाठी सर्वोत्तम वेळ?",
    bn: "পরিবারের সাথে বাইরে যাওয়ার সেরা সময়?",
    te: "కుటుంబంతో బయటకు వెళ్ళడానికి ఉత్తమ సమయం?",
  },
  "Should I irrigate today?": {
    hi: "क्या आज सिंचाई करनी चाहिए?",
    mr: "आज पिकांना पाणी द्यावे का?",
    bn: "আজ কি সেচ দেওয়া উচিত?",
    te: "ఈరోజు నీరు పెట్టాలా?",
  },
  "Should I spray pesticides today?": {
    hi: "क्या आज कीटनाशक छिड़काव करें?",
    mr: "आज कीटकनाशक फवारणी करावी का?",
    bn: "আজ কি কীটনাশক স্প্রে করা উচিত?",
    te: "ఈరోజు పురుగుమందులు పిచికారీ చేయాలా?",
  },
  "Is rain expected?": {
    hi: "क्या बारिश की संभावना है?",
    mr: "पावसाची शक्यता आहे का?",
    bn: "বৃষ্টির সম্ভাবনা আছে কি?",
    te: "వర్షం పడే అవకాశం ఉందా?",
  },
  "Is wind suitable for spraying?": {
    hi: "क्या छिड़काव के लिए हवा अनुकूल है?",
    mr: "फवारणीसाठी वारा योग्य आहे का?",
    bn: "স্প্রে করার জন্য বাতাসের গতি কি ঠিক আছে?",
    te: "పిచికారీకి గాలి వేగం అనుకూలమేనా?",
  },
  "Is today suitable for field work?": {
    hi: "क्या आज खेत के काम के लिए अनुकूल है?",
    mr: "आज शेतातील कामांसाठी अनुकूल आहे का?",
    bn: "আজ মাঠের কাজের উপযুক্ত কি?",
    te: "ఈరోజు పొలం పనులకు అనుకూలమేనా?",
  },
  "Is today suitable for beach activity?": {
    hi: "क्या समुद्र तट की गतिविधियों के लिए आज अनुकूल है?",
    mr: "समुद्रकिनाऱ्यावरील उपक्रमांसाठी आज अनुकूल आहे का?",
    bn: "সৈকতে যাওয়ার জন্য দিনটি কেমন?",
    te: "బీచ్ కార్యకలాపాలకు ఈరోజు అనుకూలమేనా?",
  },
  "When is the best beach window?": {
    hi: "समुद्र तट के लिए सबसे अच्छा समय क्या है?",
    mr: "समुद्रकिनाऱ्यावर जाण्यासाठी सर्वोत्तम वेळ कोणती?",
    bn: "সৈকতে যাওয়ার সেরা সময় কোনটি?",
    te: "బీచ్‌కు వెళ్లడానికి ఉత్తమ సమయం ఏది?",
  },
  "Will rain affect the beach?": {
    hi: "क्या बारिश से समुद्र तट पर असर पड़ेगा?",
    mr: "पावसामुळे समुद्रकिनाऱ्यावर अडथळा येईल का?",
    bn: "বৃষ্টি কি সৈকতে প্রভাব ফেলবে?",
    te: "వర్షం బీచ్‌ను ప్రభావితం చేస్తుందా?",
  },
  "What are the current coastal conditions?": {
    hi: "वर्तमान तटीय स्थितियां कैसी हैं?",
    mr: "सध्याची किनारपट्टीची परिस्थिती कशी आहे?",
    bn: "উপকূলীয় বর্তমান পরিস্থিতি কেমন?",
    te: "ప్రస్తుత తీరప్రాంత పరిస్థితులు ఎలా ఉన్నాయి?",
  },
  "When is UV lowest?": {
    hi: "यूवी सबसे कम कब होगा?",
    mr: "अतिनील किरणे सर्वात कमी कधी असतील?",
    bn: "ইউভি সবচেয়ে কম কখন?",
    te: "UV ఎప్పుడు తక్కువగా ఉంటుంది?",
  },
  "What is today's AQI?": {
    hi: "आज का AQI क्या है?",
    mr: "आजचा AQI किती आहे?",
    bn: "আজকের AQI কত?",
    te: "ఈరోజు AQI ఎంత?",
  },
  "Is pollen data available?": {
    hi: "क्या परागकण डेटा उपलब्ध है?",
    mr: "परागकण माहिती उपलब्ध आहे का?",
    bn: "পরাগরেণুর তথ্য কি পাওয়া যাচ্ছে?",
    te: "పరాగ సంపర్క డేటా అందుబాటులో ఉందా?",
  },
  "What is the best outdoor exposure window?": {
    hi: "बाहर रहने का सबसे सुरक्षित समय क्या है?",
    mr: "बाहेर राहण्यासाठी सर्वात सुरक्षित वेळ कोणती?",
    bn: "বাইরে থাকার সবচেয়ে নিরাপদ সময় কোনটি?",
    te: "బయట ఉండటానికి అత్యంత సురక్షితమైన సమయం ఏది?",
  },
  "Can we host our event outdoors?": {
    hi: "क्या हम आउटडोर कार्यक्रम आयोजित कर सकते हैं?",
    mr: "आम्ही कार्यक्रम घराबाहेर आयोजित करू शकतो का?",
    bn: "আমরা কি বাইরে অনুষ্ঠান করতে পারি?",
    te: "మనం బయట ఈవెంట్ నిర్వహించవచ్చా?",
  },
  "What is the best event time?": {
    hi: "कार्यक्रम का सबसे अच्छा समय क्या है?",
    mr: "कार्यक्रमासाठी सर्वोत्तम वेळ कोणती?",
    bn: "অনুষ্ঠানের সেরা সময় কোনটি?",
    te: "ఈవెంట్ నిర్వహణకు ఉత్తమ సమయం ఏది?",
  },
  "Will it rain during the event?": {
    hi: "क्या कार्यक्रम के दौरान बारिश होगी?",
    mr: "कार्यक्रमादरम्यान पाऊस पडेल का?",
    bn: "অনুষ্ঠানের সময় কি বৃষ্টি হবে?",
    te: "ఈవెంట్ సమయంలో వర్షం పడుతుందా?",
  },
  "When is golden hour?": {
    hi: "गोल्डन ऑवर कब है?",
    mr: "गोल्डन अवर कधी आहे?",
    bn: "গোল্ডেন আওয়ার কখন?",
    te: "గోల్డెన్ అవర్ ఎప్పుడు?",
  },
  "What time is sunset?": {
    hi: "सूर्यास्त किस समय होगा?",
    mr: "सूर्यास्त किती वाजता होईल?",
    bn: "সূর্যাস্ত কখন হবে?",
    te: "సూర్యాస్తమయం ఏ సమయానికి అవుతుంది?",
  },
  "Will wind affect the event?": {
    hi: "क्या हवा से कार्यक्रम पर असर पड़ेगा?",
    mr: "वाऱ्यामुळे कार्यक्रमावर परिणाम होईल का?",
    bn: "বাতাস কি অনুষ্ঠানে প্রভাব ফেলবে?",
    te: "గాలి ఈవెంట్‌పై ప్రభావం చూపుతుందా?",
  },
};

export const LOCALIZED_SCHEDULES: Record<string, Record<string, { label: string; desc: string }>> = {

  running: {
    hi: { label: "आपकी फिटनेस मौसम विंडो", desc: "दौड़ने और व्यायाम के लिए सर्वश्रेष्ठ समय" },
    mr: { label: "तुमची तंदुरुस्ती हवामान वेळ", desc: "बाहेर धावण्यासाठी आणि सरावासाठी सर्वोत्तम तास" },
    bn: { label: "ফিটনেস আবহাওয়ার সময়সীমা", desc: "বাইরে দৌড়ানো এবং অনুশীলনের জন্য সেরা সময়" },
    te: { label: "మీ ఫిట్‌నెస్ వాతావరణ సమయం", desc: "బయట పరుగు మరియు శిక్షణ కోసం ఉత్తమ గంటలు" },
  },
  travel: {
    hi: { label: "मौसम में आपकी यात्रा", desc: "सर्वोत्तम प्रस्थान समय और राजमार्ग जोखिम" },
    mr: { label: "हवामानात तुमचा प्रवास", desc: "योग्य प्रस्थान वेळ आणि महामार्ग जोखीम अंदाज" },
    bn: { label: "আবহাওয়া ও আপনার যাত্রা", desc: "উপযুক্ত যাত্রার সময় এবং হাইওয়ে ঝুঁকির পূর্বাভাস" },
    te: { label: "వాతావరణంలో మీ ప్రయాణం", desc: "సరైన ప్రయాణ సమయం మరియు హైవే ప్రమాద వివరాలు" },
  },
  family: {
    hi: { label: "आपका पारिवारिक दिन", desc: "बच्चों के खेलने का समय और धूप से सुरक्षा" },
    mr: { label: "तुमचा कौटुंबिक दिवस", desc: "मुलांसाठी सुरक्षित खेळण्याची वेळ आणि उष्णतेपासून संरक्षण" },
    bn: { label: "পারিবারিক দিনের পরিকল্পনা", desc: "শিশুদের খেলার নিরাপদ সময় এবং রোদ থেকে সুরক্ষা" },
    te: { label: "మీ కుటుంబ దినోత్సవం", desc: "పిల్లల ఆట సమయాలు మరియు ఎండ నుంచి రక్షణ" },
  },
  gardening: {
    hi: { label: "आज का कृषि कार्यक्रम", desc: "छिड़काव के समय, मिट्टी की नमी और कटाई का समय" },
    mr: { label: "आजचे कृषी वेळापत्रक", desc: "फवारणीच्या वेळा, जमिनीतील ओलावा आणि काढणीची वेळ" },
    bn: { label: "আজকের কৃষি সময়সূচী", desc: "স্প্রে করার উপযুক্ত সময়, মাটির আর্দ্রতা এবং ফসল তোলার সময়" },
    te: { label: "ఈరోజు వ్యవసాయ సమయపట్టిక", desc: "పిచికారీ వేళలు, నేల తేమ మరియు కోత సమయం" },
  },
  beach: {
    hi: { label: "आपका तटीय दिन", desc: "ज्वार-भाटा का समय, लहरों की ऊंचाई और हवा की चेतावनी" },
    mr: { label: "तुमचा किनारपट्टी दिवस", desc: "भरती-ओहोटीच्या वेळा, लाटांची उंची आणि वाऱ्याचा इशारा" },
    bn: { label: "আপনার উপকূলীয় দিন", desc: "জোয়ার-ভাটার সময়সূচী, তরঙ্গের উচ্চতা এবং বাতাসের সতর্কতা" },
    te: { label: "మీ తీరప్రాంత దినం", desc: "అలల ఎత్తు, పోటు-పాటు వేళలు మరియు గాలి హెచ్చరికలు" },
  },
  health: {
    hi: { label: "पर्यावरणीय जोखिम समयरेखा", desc: "प्रति घंटे श्वसन जोखिम और संवेदनशीलता ट्रैकिंग" },
    mr: { label: "पर्यावरणीय जोखीम टाइमलाइन", desc: "ताशी श्वसन जोखीम पातळी आणि हवेतील संवेदनशीलता" },
    bn: { label: "পরিবেশগত এক্সপোজার টাইমলাইন", desc: "প্রতি ঘণ্টার শ্বাসযন্ত্রের ঝুঁকি এবং সংবেদনশীলতা ট্র্যাকিং" },
    te: { label: "పర్యావరణ బహిర్గత టైమ్‌లైన్", desc: "గంటవారీ శ్వాసకోశ ప్రమాద స్థాయిలు మరియు సున్నితత్వ ట్రాకింగ్" },
  },
  event_planning: {
    hi: { label: "इवेंट मौसम समयरेखा", desc: "धूप का कोण, गोल्डन ऑवर और वेन्यू सुरक्षा" },
    mr: { label: "कार्यक्रम हवामान टाइमलाइन", desc: "सूर्यप्रकाश, गोल्डन अवर आणि स्थळ संरक्षण" },
    bn: { label: "ইভেন্ট আবহাওয়া টাইমলাইন", desc: "সূর্যালোকের কোণ, গোল্ডেন আওয়ার এবং ভেন্যু সুরক্ষা" },
    te: { label: "ఈవెంట్ వాతావరణ టైమ్‌లైన్", desc: "సూర్యరశ్మి, గోల్డెన్ అవర్స్ మరియు వేదిక రక్షణ" },
  },
};

export function getPersonaConfig(personaId: string, language?: string): PersonaDefinition {
  const base = PERSONA_CONFIG[personaId] || PERSONA_CONFIG.health;
  if (!language || language === 'en') return base;

  const locSched = LOCALIZED_SCHEDULES[personaId]?.[language];
  return {
    ...base,
    scheduleLabel: locSched?.label || base.scheduleLabel,
    scheduleDescription: locSched?.desc || base.scheduleDescription,
    decisionQuestions: base.decisionQuestions.map((q) => ({
      ...q,
      text: LOCALIZED_DECISION_QUESTIONS[q.text]?.[language] || q.text,
    })),
  };
}

export function getPersonaQuestionsForRoles(activeRoleIds: string[], language?: string): DecisionQuestion[] {
  if (!activeRoleIds || activeRoleIds.length === 0) {
    return getPersonaConfig('health', language).decisionQuestions;
  }
  const questions: DecisionQuestion[] = [];
  const seenTexts = new Set<string>();

  for (const roleId of activeRoleIds) {
    const cfg = getPersonaConfig(roleId, language);
    if (cfg) {
      for (const q of cfg.decisionQuestions) {
        if (!seenTexts.has(q.text)) {
          seenTexts.add(q.text);
          questions.push(q);
        }
      }
    }
  }

  return questions.length > 0 ? questions : getPersonaConfig('health', language).decisionQuestions;
}
