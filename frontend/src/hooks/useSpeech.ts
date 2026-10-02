'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const getLanguageLocale = (langCode?: string): string => {
  switch (langCode) {
    case 'hi': return 'hi-IN';
    case 'mr': return 'mr-IN';
    case 'bn': return 'bn-IN';
    case 'te': return 'te-IN';
    case 'ta': return 'ta-IN';
    case 'gu': return 'gu-IN';
    case 'kn': return 'kn-IN';
    case 'ml': return 'ml-IN';
    case 'pa': return 'pa-IN';
    case 'or': return 'or-IN';
    case 'as': return 'as-IN';
    case 'ur': return 'ur-IN';
    case 'sa': return 'sa-IN';
    case 'ne': return 'ne-NP';
    default: return 'en-IN';
  }
};

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isStartingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isStartingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (err) {
        // Safe cleanup
      }
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(
    (
      onResultCallback?: (text: string) => void,
      langCode?: string,
      onErrorCallback?: (errorType: string) => void
    ) => {
      setMicError(null);
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setMicError('Speech recognition is not supported by your browser. You can type your question.');
        if (onErrorCallback) onErrorCallback('not-supported');
        return;
      }

      // Cleanup existing recognition instance
      stopListening();

      try {
        isStartingRef.current = true;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = getLanguageLocale(langCode);

        recognition.onstart = () => {
          setIsListening(true);
          isStartingRef.current = false;
          setMicError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          let isFinalResult = false;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              isFinalResult = true;
            }
          }

          setTranscript(currentTranscript);

          if (isFinalResult && currentTranscript.trim() && onResultCallback) {
            // Stop recognition immediately before handling result to prevent audio feedback
            stopListening();
            onResultCallback(currentTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          setIsListening(false);
          isStartingRef.current = false;

          const errType = event.error || 'unknown';
          if (errType === 'not-allowed' || errType === 'service-not-allowed') {
            setMicError('Microphone permission denied. Please allow microphone access in browser settings.');
          } else if (errType === 'no-speech') {
            setMicError(null); // Silence is handled gracefully by continuous loop
          }

          if (onErrorCallback) {
            onErrorCallback(errType);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          isStartingRef.current = false;
        };

        recognition.start();
      } catch (e: any) {
        console.error('Error starting speech recognition:', e);
        setIsListening(false);
        isStartingRef.current = false;
        setMicError('Could not start microphone. Please check browser permissions.');
        if (onErrorCallback) onErrorCallback('exception');
      }
    },
    [stopListening]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (
      text: string,
      langCode?: string,
      onEndCallback?: () => void,
      onErrorCallback?: () => void
    ) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        if (onEndCallback) onEndCallback();
        return;
      }

      stopSpeaking(); // Cancel any ongoing speech

      // Clean markdown formatting before speaking aloud
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/(\r\n|\n|\r)/gm, ' ');

      if (!cleanText.trim()) {
        if (onEndCallback) onEndCallback();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLanguageLocale(langCode);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) {
          onEndCallback();
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        if (onErrorCallback) {
          onErrorCallback();
        } else if (onEndCallback) {
          onEndCallback();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking]
  );

  return {
    isListening,
    transcript,
    isSupported,
    isSpeaking,
    micError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
