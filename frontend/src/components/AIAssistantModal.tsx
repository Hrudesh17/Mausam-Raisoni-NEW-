'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  ArrowRight,
  AlertTriangle,
  Loader2,
  MapPin,
  TrendingUp,
  Square
} from 'lucide-react';
import { WeatherResponse, IntelligenceSummary, UserContext } from '../lib/types';
import { chatWithAssistant } from '../lib/api';
import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../hooks/useLanguage';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherResponse;
  intelligence: IntelligenceSummary;
  context: UserContext;
}

interface HourlyCurveItem {
  time: string;
  hour: number;
  temp: number;
  feels_like: number;
  rain_prob: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  location?: string;
  intent?: string;
  data?: any;
  suggestedActions?: string[];
}

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'STOPPED';

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  weather,
  intelligence,
  context,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationLocation, setConversationLocation] = useState<string | null>(null);

  // Live Continuous Voice Conversation States
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState<boolean>(false);

  const userStoppedRef = useRef<boolean>(false);
  const sessionTokenRef = useRef<number>(0);
  const sessionIdRef = useRef<string>(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { language, t } = useLanguage();

  const {
    isListening,
    transcript,
    isSupported,
    isSpeaking,
    micError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech();

  // Active roles list
  const activeRoles = (context.interests && context.interests.length > 0)
    ? context.interests.map((i) => i.replace('_', ' ').toUpperCase()).join(' + ')
    : 'COMMUTE';

  const primaryPersona = (context.interests && context.interests[0]) || 'commute';
  const displayLocation = conversationLocation || weather.location.name;

  // Persona-adaptive prompt chips generator
  const getPersonaQuickButtons = (persona: string, locName: string): string[] => {
    const defaultLoc = language === 'bn' ? 'আমার অবস্থান' : language === 'te' ? 'నా ప్రాంతం' : language === 'mr' ? 'माझे स्थान' : language === 'hi' ? 'मेरा स्थान' : 'my location';
    const loc = locName || defaultLoc;

    if (language === 'bn') {
      switch (persona.toLowerCase()) {
        case 'travel':
          return [
            `কি ${loc}-এ ভ্রমণ করা নিরাপদ?`,
            `বৃষ্টি কি রাস্তায় প্রভাব ফেলবে?`,
            `হাইওয়েতে দৃশ্যমানতা কেমন?`,
            `কলকাতায় আবহাওয়া`,
          ];
        case 'running':
        case 'fitness':
          return [
            `${loc}-এ দৌড়ানোর সেরা সময় কোনটি?`,
            `ইউভি স্তর কি নিরাপদ?`,
            `তাপমাত্রার পূর্বাভাস`,
            `আজ কি দৌড়ানো যাবে?`,
          ];
        case 'gardening':
        case 'krishi':
        case 'farmer':
          return [
            `আজ কি কীটনাশক স্প্রে করব?`,
            `আজ কি সেচ দেওয়া উচিত?`,
            `বাতাসের গতিবেগ কত?`,
            `২৪ ঘণ্টার বৃষ্টিপাত`,
          ];
        case 'event_planning':
        case 'event':
          return [
            `বাইরে কি অনুষ্ঠান করা সম্ভব?`,
            `অনুষ্ঠানের সবচেয়ে উপযুক্ত সময়?`,
            `সূর্যাস্ত কখন হবে?`,
            `অনুষ্ঠানের সময় কি বৃষ্টি হবে?`,
          ];
        case 'beach':
        case 'coastal':
          return [
            `সৈকতে বাতাস ও তরঙ্গের উচ্চতা কত?`,
            `সৈকতে যাওয়া কি নিরাপদ?`,
            `সৈকতে ইউভি সূচক`,
            `উপকূলে বৃষ্টির সম্ভাবনা`,
          ];
        case 'family':
          return [
            `বাচ্চাদের খেলার জন্য কি আবহাওয়া ভালো?`,
            `আজ খেলার সেরা সময়`,
            `আমার কি ছাতা নেওয়া উচিত?`,
            `বর্তমান তাপমাত্রা`,
          ];
        case 'health':
          return [
            `${loc}-এ বায়ুর মান (AQI)`,
            `আজ শ্বাসযন্ত্রের ঝুঁকি কেমন?`,
            `ইউভি সূচক সুরক্ষা`,
            `পানি পানের লক্ষ্যমাত্রা`,
          ];
        default:
          return [
            `আমার কি ${loc}-এ ছাতা নেওয়া উচিত?`,
            `${loc}-এ বাতাসের গতি কেমন?`,
            `তাপমাত্রার পূর্বাভাস`,
            `আজ দৌড়ানোর উপযুক্ত সময়`,
          ];
      }
    }

    if (language === 'te') {
      switch (persona.toLowerCase()) {
        case 'travel':
          return [
            `${loc}లో ప్రయాణించడం సురక్షితమేనా?`,
            `వర్షం మార్గాన్ని ప్రభావితం చేస్తుందా?`,
            `హైవే దృశ్యమానత ఎలా ఉంది?`,
            `హైదరాబాద్‌లో వాతావరణం`,
          ];
        case 'running':
        case 'fitness':
          return [
            `${loc}లో పరుగుకు ఉత్తమ సమయం ఏది?`,
            `UV స్థాయి సురక్షితమేనా?`,
            `ఉష్ణోగ్రత సూచన`,
            `ఈరోజు పరుగెత్తవచ్చా?`,
          ];
        case 'gardening':
        case 'krishi':
        case 'farmer':
          return [
            `ఈరోజు పురుగుమందులు పిచికారీ చేయవచ్చా?`,
            `ఈరోజు నీరు పెట్టాలా?`,
            `గాలి వేగం ఎంత?`,
            `24 గంటల వర్షపాతం`,
          ];
        case 'event_planning':
        case 'event':
          return [
            `బయట ఈవెంట్ నిర్వహించవచ్చా?`,
            `ఈవెంట్ ఉత్తమ సమయం?`,
            `సూర్యాస్తమయం ఎప్పుడు?`,
            `ఈవెంట్ సమయంలో వర్షం పడుతుందా?`,
          ];
        case 'beach':
        case 'coastal':
          return [
            `తీరప్రాంత గాలి మరియు అలల ఎత్తు ఎంత?`,
            `బీచ్‌కు వెళ్లడం సురక్షితమేనా?`,
            `బీచ్‌లో UV సూచిక`,
            `తీరంలో వర్ష సూచన`,
          ];
        case 'family':
          return [
            `${loc}లో పిల్లల ఆటకు వాతావరణం అనుకూలమేనా?`,
            `ఆడుకోవడానికి ఉత్తమ సమయం`,
            `నేను గొడుగు తీసుకెళ్లాలా?`,
            `ప్రస్తుత ఉష్ణోగ్రత`,
          ];
        case 'health':
          return [
            `${loc}లో గాలి నాణ్యత (AQI)`,
            `శ్వాసకోశ ప్రమాదం ఎలా ఉంది?`,
            `UV సూచిక భద్రత`,
            `నీరు త్రాగే లక్ష్యం`,
          ];
        default:
          return [
            `${loc}లో గొడుగు తీసుకెళ్లాలా?`,
            `${loc}లో గాలి వేగం ఎంత?`,
            `గంటవారీ ఉష్ణోగ్రత`,
            `పరుగుకు సరైన సమయం`,
          ];
      }
    }

    if (language === 'mr') {
      switch (persona.toLowerCase()) {
        case 'travel':
          return [
            `${loc} मध्ये प्रवास करणे सुरक्षित आहे का?`,
            `पावसामुळे रस्त्यावर परिणाम होईल का?`,
            `महामार्गावरील दृश्यमानता कशी आहे?`,
            `मुंबईतील हवामान`,
          ];
        case 'running':
        case 'fitness':
          return [
            `${loc} मध्ये धावण्यासाठी सर्वोत्तम वेळ कोणती?`,
            `अतिनील किरणे सुरक्षित आहेत का?`,
            `ताशी तापमान अंदाज`,
            `आज धावणे सुरक्षित आहे का?`,
          ];
        case 'gardening':
        case 'krishi':
        case 'farmer':
          return [
            `आज कीटकनाशक फवारणी करावी का?`,
            `आज पिकांना पाणी द्यावे का?`,
            `वाऱ्याचा वेग किती आहे?`,
            `२४ तासांचा पाऊस`,
          ];
        case 'event_planning':
        case 'event':
          return [
            `घराबाहेर कार्यक्रम आयोजित करू शकतो का?`,
            `कार्यक्रमासाठी सर्वोत्तम वेळ?`,
            `सूर्यास्त कधी होईल?` ,
            `कार्यक्रमादरम्यान पाऊस पडेल का?`,
          ];
        case 'beach':
        case 'coastal':
          return [
            `समुद्रकिनाऱ्यावर वाऱ्याचा वेग आणि लाटांची उंची?`,
            `समुद्रकिनाऱ्यावर जाणे सुरक्षित आहे का?`,
            `किनाऱ्यावरील अतिनील निर्देशांक`,
            `किनाऱ्यावर पावसाची शक्यता`,
          ];
        case 'family':
          return [
            `${loc} मध्ये मुलांसाठी बाहेर खेळणे सुरक्षित आहे का?`,
            `खेळण्यासाठी सर्वोत्तम वेळ`,
            `छत्री सोबत ठेवावी का?`,
            `सध्याचे तापमान`,
          ];
        case 'health':
          return [
            `${loc} मध्ये हवेची गुणवत्ता (AQI)`,
            `आज श्वसन जोखीम कशी आहे?`,
            `अतिनील किरणांपासून सुरक्षा`,
            `पाणी पिण्याचे उद्दिष्ट`,
          ];
        default:
          return [
            `${loc} मध्ये छत्री सोबत ठेवावी का?`,
            `${loc} मध्ये वाऱ्याचा वेग किती आहे?`,
            `ताशी तापमान अंदाज`,
            `धावण्यासाठी सर्वोत्तम वेळ`,
          ];
      }
    }

    if (language === 'hi') {
      switch (persona.toLowerCase()) {
        case 'travel':
          return [
            `क्या ${loc} में यात्रा करना सुरक्षित है?`,
            `क्या बारिश से रास्ते पर असर पड़ेगा?`,
            `हाइवे पर दृश्यता कैसी है?`,
            `मुंबई में मौसम`,
          ];
        case 'running':
        case 'fitness':
          return [
            `${loc} में दौड़ने का सबसे अच्छा समय?`,
            `क्या यूवी स्तर सुरक्षित है?`,
            `तापमान का पूर्वानुमान`,
            `क्या आज दौड़ सकते हैं?`,
          ];
        case 'gardening':
        case 'krishi':
        case 'farmer':
          return [
            `क्या आज कीटनाशक छिड़काव करें?`,
            `क्या आज सिंचाई करनी चाहिए?`,
            `हवा की गति कितनी है?`,
            `24 घंटे की बारिश`,
          ];
        case 'event_planning':
        case 'event':
          return [
            `क्या आउटडोर कार्यक्रम कर सकते हैं?`,
            `कार्यक्रम का सबसे अच्छा समय?`,
            `सूर्यास्त कब होगा?`,
            `क्या कार्यक्रम के दौरान बारिश होगी?`,
          ];
        case 'beach':
        case 'coastal':
          return [
            `समुद्र तट पर हवा और लहरें कैसी हैं?`,
            `क्या समुद्र किनारे जाना सुरक्षित है?`,
            `समुद्र तट पर यूवी इंडेक्स`,
            `तट पर बारिश की संभावना`,
          ];
        case 'family':
          return [
            `क्या बच्चों के खेलने के लिए मौसम सही है?`,
            `आज खेलने का सबसे अच्छा समय`,
            `क्या छाता ले जाना चाहिए?`,
            `वर्तमान तापमान`,
          ];
        case 'health':
          return [
            `${loc} में वायु गुणवत्ता (AQI)`,
            `आज श्वसन जोखिम कैसा है?`,
            `यूवी इंडेक्स सुरक्षा`,
            `पानी पीने का लक्ष्य`,
          ];
        default:
          return [
            `क्या ${loc} में छाता ले जाना चाहिए?`,
            `${loc} में हवा की गति कैसी है?`,
            `तापमान का पूर्वानुमान`,
            `आज दौड़ने का सही समय`,
          ];
      }
    }

    switch (persona.toLowerCase()) {
      case 'travel':
        return [
          `Is it safe to travel in ${loc}?`,
          `Will rain affect my route?`,
          `How is highway visibility in ${loc}?`,
          `Weather in Mumbai`,
        ];
      case 'running':
      case 'fitness':
        return [
          `Best time to run in ${loc} today?`,
          `Is UV safe for outdoor exercise?`,
          `Hourly temperature curve`,
          `Can I run today?`,
        ];
      case 'gardening':
      case 'krishi':
      case 'farmer':
        return [
          `Should I spray today in ${loc}?`,
          `Should I irrigate today?`,
          `Wind speed for spraying`,
          `24h rainfall sum`,
        ];
      case 'event_planning':
      case 'event':
        return [
          `Can we host outdoors in ${loc}?`,
          `Best event window today?`,
          `When is sunset & golden hour?`,
          `Will it rain during event?`,
        ];
      case 'beach':
      case 'coastal':
        return [
          `Coastal wind & wave height in ${loc}`,
          `Is it safe for beach visit?`,
          `UV index at beach`,
          `Rain chance at coast`,
        ];
      case 'family':
        return [
          `Is AQI safe for outdoor play in ${loc}?`,
          `Best play window today`,
          `Should I carry an umbrella?`,
          `Temperature right now`,
        ];
      case 'health':
        return [
          `Air quality (AQI) in ${loc}`,
          `Respiratory risk today`,
          `UV index safety`,
          `Hydration target`,
        ];
      default:
        return [
          `Should I carry an umbrella in ${loc}?`,
          `How strong is the wind in ${loc}?`,
          `Hourly temperature curve`,
          `Best time to run today`,
        ];
    }
  };

  // Stop continuous live voice conversation completely
  const stopLiveVoiceSession = useCallback(() => {
    userStoppedRef.current = true;
    sessionTokenRef.current += 1;
    setIsLiveVoiceMode(false);
    setVoiceState('STOPPED');
    stopSpeaking();
    stopListening();
  }, [stopSpeaking, stopListening]);

  // Clean up session if modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopLiveVoiceSession();
    }
  }, [isOpen, stopLiveVoiceSession]);

  // Initialize welcoming message
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      let welcomeText = `Namaste ${context.name}! I am **VayuSync Sahayak**, your context-aware weather AI companion.\n\nI am currently evaluating weather telemetry for **${displayLocation}** in **${activeRoles}** mode. Today's suitability score is **${intelligence.mausam_score.score}/100 (${intelligence.mausam_score.rating})**.\n\nTap the microphone for **Continuous Live Voice Conversation** or type your question below!`;

      if (language === 'bn') {
        welcomeText = `নমস্কার ${context.name}! আমি **বায়ুসিঙ্ক সহায়ক**, আপনার ব্যক্তিগত আবহাওয়া এআই সঙ্গী।\n\nআমি বর্তমানে **${displayLocation}**-এর আবহাওয়া পর্যবেক্ষণ করছি। আজকের আবহাওয়া স্কোর **${intelligence.mausam_score.score}/১০০ (${intelligence.mausam_score.rating})**।\n\nকথা বলতে মাইকে চাপ দিন বা নিচে আপনার প্রশ্ন লিখুন!`;
      } else if (language === 'te') {
        welcomeText = `నమస్కారం ${context.name}! నేను **వాయుసింక్ సహాయక్**, మీ వ్యక్తిగత వాతావరణ ఏఐ సహాయకుడిని.\n\nనేను ప్రస్తుతం **${displayLocation}** కోసం వాతావరణాన్ని విశ్లేషిస్తున్నాను. నేటి వాతావరణ అనుకూలత స్కోరు **${intelligence.mausam_score.score}/100 (${intelligence.mausam_score.rating})**.\n\nమాట్లాడటానికి మైక్ నొక్కండి లేదా మీ ప్రశ్నను క్రింద టైప్ చేయండి!`;
      } else if (language === 'mr') {
        welcomeText = `नमस्कार ${context.name}! मी **वायुसिंक सहाय्यक** आहे, आपला वैयक्तिक हवामान एआय सोबती.\n\nमी सध्या **${displayLocation}** साठी हवामानाचे विश्लेषण करत आहे. आजचा अनुकूलता स्कोअर **${intelligence.mausam_score.score}/१०० (${intelligence.mausam_score.rating})** आहे.\n\nबोलण्यासाठी माइकवर टॅप करा किंवा खाली आपला प्रश्न विचारा!`;
      } else if (language === 'hi') {
        welcomeText = `नमस्ते ${context.name}! मैं **वायुसिंक सहायक** हूँ, आपका मौसम साथी।\n\nमैं वर्तमान में **${displayLocation}** के लिए मौसम का विश्लेषण कर रहा हूँ। आज का अनुकूलता स्कोर **${intelligence.mausam_score.score}/100 (${intelligence.mausam_score.rating})** है।\n\nबोलने के लिए माइक पर टैप करें या अपना प्रश्न नीचे लिखें!`;
      }

      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: welcomeText,
          timestamp: 'Just now',
          suggestedActions: getPersonaQuickButtons(primaryPersona, displayLocation),
        },
      ]);
    }
  }, [isOpen, context, weather, intelligence, activeRoles, messages.length, displayLocation, primaryPersona, language]);

  // Sync input with voice transcript in single-turn mode
  useEffect(() => {
    if (transcript && !isLiveVoiceMode) {
      setInputText(transcript);
    }
  }, [transcript, isLiveVoiceMode]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, voiceState]);

  // General message sender (handles both text input & single-turn / multi-turn queries)
  const handleSendMessage = async (textToSend: string, isVoiceMode: boolean = false) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await chatWithAssistant(
        textToSend,
        weather,
        context,
        intelligence,
        conversationLocation,
        weather.location.name,
        sessionIdRef.current,
        context.interests || [],
        isVoiceMode ? 'voice' : 'text',
        language
      );

      if (res.conversation_location) {
        setConversationLocation(res.conversation_location);
      } else if (res.location) {
        const locName = typeof res.location === 'object' ? res.location.name : res.location;
        if (locName) setConversationLocation(locName);
      }

      const replyText = res.reply || res.answer || 'Response generated.';
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: res.conversation_location || (typeof res.location === 'object' ? res.location.name : res.location),
        intent: res.intent,
        data: res.data,
        suggestedActions: res.suggested_actions || getPersonaQuickButtons(primaryPersona, res.conversation_location || displayLocation),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      return replyText;
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I apologize, live weather intelligence is currently unreachable. Please retry.',
          timestamp: 'Now',
        },
      ]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger a single listening iteration in the continuous live voice loop
  const triggerNextListening = useCallback((token: number) => {
    if (userStoppedRef.current || token !== sessionTokenRef.current || !isOpen) {
      return;
    }

    setVoiceState('LISTENING');

    startListening(
      async (spokenText: string) => {
        // Guard check before processing
        if (userStoppedRef.current || token !== sessionTokenRef.current || !isOpen) {
          return;
        }

        setVoiceState('PROCESSING');
        const replyText = await handleSendMessage(spokenText, true);

        // Guard check after backend processing
        if (userStoppedRef.current || token !== sessionTokenRef.current || !isOpen) {
          return;
        }

        if (replyText) {
          setVoiceState('SPEAKING');

          // Speak response aloud with active language
          speak(
            replyText,
            language,
            () => {
              // TTS Finished Callback: Return to LISTENING if session still active
              if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
                setTimeout(() => {
                  if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
                    triggerNextListening(token);
                  }
                }, 350);
              } else {
                setVoiceState('IDLE');
              }
            },
            () => {
              // TTS Error Callback: Recover to LISTENING safely
              if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
                setTimeout(() => {
                  if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
                    triggerNextListening(token);
                  }
                }, 500);
              }
            }
          );
        } else {
          // In case backend failed, return to listening after brief pause
          if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
            setTimeout(() => {
              if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
                triggerNextListening(token);
              }
            }, 1000);
          }
        }
      },
      language,
      (errType: string) => {
        // Recognition error callback
        if (userStoppedRef.current || token !== sessionTokenRef.current || !isOpen) {
          return;
        }

        if (errType === 'no-speech') {
          // Gracefully retry listening on brief user silence without ending session
          setTimeout(() => {
            if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
              triggerNextListening(token);
            }
          }, 500);
        } else if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          stopLiveVoiceSession();
        } else {
          // Transient recognition failure retry
          setTimeout(() => {
            if (!userStoppedRef.current && token === sessionTokenRef.current && isOpen) {
              triggerNextListening(token);
            }
          }, 1000);
        }
      }
    );
  }, [startListening, speak, language, isOpen, stopLiveVoiceSession]);

  // Start continuous live voice conversation mode
  const startLiveVoiceSession = useCallback(() => {
    userStoppedRef.current = false;
    sessionTokenRef.current += 1;
    const currentToken = sessionTokenRef.current;
    setIsLiveVoiceMode(true);
    stopSpeaking();
    triggerNextListening(currentToken);
  }, [stopSpeaking, triggerNextListening]);

  // Toggle live voice mode on/off
  const toggleLiveVoiceMode = () => {
    if (isLiveVoiceMode || isListening || isSpeaking || voiceState === 'LISTENING') {
      stopLiveVoiceSession();
    } else {
      startLiveVoiceSession();
    }
  };

  const statusInfo = isLiveVoiceMode
    ? voiceState === 'LISTENING'
      ? { label: '🎙️ Live Listening...', color: 'bg-rose-500 text-white animate-pulse' }
      : voiceState === 'PROCESSING'
      ? { label: '⚡ Evaluating Telemetry...', color: 'bg-amber-100 text-amber-900 border border-amber-300 animate-bounce' }
      : voiceState === 'SPEAKING'
      ? { label: '🔊 Speaking Answer...', color: 'bg-sky-100 text-sky-900 border border-sky-300 animate-pulse' }
      : { label: 'Voice Active', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    : isLoading
    ? { label: 'Querying Weather API...', color: 'bg-amber-100 text-amber-900 border border-amber-300 animate-bounce' }
    : isSpeaking
    ? { label: 'Speaking...', color: 'bg-sky-100 text-sky-900 border border-sky-300 animate-pulse' }
    : { label: `Focus: ${displayLocation}`, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl h-[92vh] max-h-[720px] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap truncate">
                <span>{t.assistant_title || 'VayuSync Sahayak'}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full truncate ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Conversational Focus: <strong className="text-sky-700 dark:text-sky-400">{displayLocation}</strong></span>
                <span className="text-slate-400 dark:text-slate-500">({activeRoles})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* End / Stop Live Voice Session Button */}
            {isLiveVoiceMode && (
              <button
                onClick={stopLiveVoiceSession}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                title="Stop Continuous Voice Conversation"
              >
                <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={() => {
                stopLiveVoiceSession();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Microphone Error Alert */}
        {micError && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{micError}</span>
          </div>
        )}

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[88%] sm:max-w-[80%] space-y-2">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-xs'
                  }`}
                >
                  {m.text}

                  {/* Inline Chart rendering for HOURLY_FORECAST */}
                  {m.data && m.data.hourly_curve && Array.isArray(m.data.hourly_curve) && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                      <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Hourly Forecast Curve ({m.data.location || displayLocation})</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-center">
                        {(m.data.hourly_curve as HourlyCurveItem[]).slice(0, 6).map((item, idx) => (
                          <div key={idx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.time}</span>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 my-0.5">{item.temp}°C</span>
                            <span className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">💧{item.rain_prob}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Controls & Metadata */}
                <div className="flex items-center gap-3 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.location && (
                    <span className="text-sky-600 dark:text-sky-400 font-medium">📍 {m.location}</span>
                  )}
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => (isSpeaking ? stopSpeaking() : speak(m.text, language))}
                      className="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition"
                      title={isSpeaking ? 'Stop speaking' : 'Speak answer'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-500">Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Speak Answer</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Prompt Suggestion Chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action, false)}
                        className="text-[11px] px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-700 dark:text-slate-200 hover:text-sky-800 dark:hover:text-sky-300 transition flex items-center gap-1.5 text-left shadow-xs"
                      >
                        <span className="truncate">{action}</span>
                        <ArrowRight className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Dynamic Voice & Processing State Banner */}
          {voiceState === 'LISTENING' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-pulse">
              <Mic className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              <div className="flex-1">
                <p className="font-bold">Listening for your question...</p>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Speak naturally in your preferred language. Click Stop Voice to end conversation.</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
                <span>Evaluating real weather telemetry for {displayLocation}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Voice Controls Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLiveVoiceMode) stopLiveVoiceSession();
              handleSendMessage(inputText, false);
            }}
            className="flex items-center gap-2"
          >
            {/* Live Voice Assistant Toggle Button */}
            <button
              type="button"
              onClick={toggleLiveVoiceMode}
              className={`p-3 rounded-2xl border transition flex items-center justify-center shrink-0 ${
                isLiveVoiceMode
                  ? 'bg-rose-600 border-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-600 shadow-xs'
              }`}
              title={isLiveVoiceMode ? 'Click to Stop Live Voice Assistant' : 'Click for Continuous Live Voice Conversation'}
            >
              {isLiveVoiceMode ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isLiveVoiceMode
                  ? (language === 'bn' ? 'ভয়েস কথোপকথন চালু আছে... প্রশ্নটি বলুন' : language === 'te' ? 'లైవ్ వాయిస్ సంభాషణ సక్రియంగా ఉంది... మీ ప్రశ్నను చెప్పండి' : language === 'mr' ? 'लाइव्ह व्हॉईस संवाद सुरू आहे... आपला प्रश्न बोला' : language === 'hi' ? 'लाइव वॉयस बातचीत सक्रिय है... अपना प्रश्न बोलें' : 'Live voice conversation active... Speak your question')
                  : (language === 'bn' ? `${displayLocation}-এর আবহাওয়া সম্পর্কে সহায়ককে জিজ্ঞাসা করুন...` : language === 'te' ? `${displayLocation} వాతావరణం గురించి సహాయక్‌ను అడగండి...` : language === 'mr' ? `${displayLocation} च्या हवामानाबद्दल सहाय्यकला विचारा...` : language === 'hi' ? `सहायक से ${displayLocation} के मौसम के बारे में पूछें...` : `Ask Sahayak about ${displayLocation} weather...`)
              }
              className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-xs"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-40 shrink-0 shadow-xs"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLiveVoiceMode ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              {isLiveVoiceMode 
                ? (language === 'bn' ? 'লাইভ ভয়েস সক্রিয়' : language === 'te' ? 'లైవ్ వాయిస్ సక్రియం' : language === 'mr' ? 'थेट व्हॉईस संवाद सक्रिय' : language === 'hi' ? 'लाइव वॉयस सक्रिय' : 'Continuous 2-Way Live Voice Active')
                : (language === 'bn' ? 'ভয়েস সহকারী প্রস্তুত' : language === 'te' ? 'వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది' : language === 'mr' ? 'व्हॉईस सहाय्यक तयार आहे' : language === 'hi' ? 'वॉयस असिस्टेंट तैयार है' : 'Voice Assistant Ready')}
            </span>
            <span className="text-sky-700 dark:text-sky-400 font-mono font-medium">
              {language === 'bn' ? 'অবস্থান' : language === 'te' ? 'ప్రాంతం' : language === 'mr' ? 'स्थान' : language === 'hi' ? 'स्थान' : 'Conversational Location'}: {displayLocation}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
