import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lang } from '@/lib/weather';

interface UseVoiceRecordingOptions {
  lang: Lang;
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceRecordingReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Hook for voice recording using Web Speech API
 * Supports English, Spanish, and French
 */
export function useVoiceRecording({
  lang,
  onTranscript,
  onError,
}: UseVoiceRecordingOptions): UseVoiceRecordingReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
    } else {
      setIsSupported(false);
    }
  }, []);

  // Configure recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    // Map lang to speech recognition locale
    const langMap: Record<Lang, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    recognition.lang = langMap[lang];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      let errorMessage = 'Voice recognition failed';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User stopped manually, not an error
          errorMessage = '';
          break;
      }

      if (errorMessage) {
        setError(errorMessage);
        onError?.(errorMessage);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [lang, onTranscript, onError, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      const err = 'Voice input is not supported in this browser';
      setError(err);
      onError?.(err);
      return;
    }

    setError(null);
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      const errorMsg = 'Failed to start voice recognition';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
