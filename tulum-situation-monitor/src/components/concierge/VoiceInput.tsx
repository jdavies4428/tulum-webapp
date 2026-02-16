"use client";

import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import type { Lang } from '@/lib/weather';

interface VoiceInputProps {
  lang: Lang;
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ lang, onTranscript, disabled }: VoiceInputProps) {
  const { isListening, isSupported, error, startListening, stopListening } =
    useVoiceRecording({
      lang,
      onTranscript,
      onError: (err) => console.error('Voice error:', err),
    });

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="interactive"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: isListening
          ? 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)'
          : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
        border: isListening ? '2px solid rgba(255, 0, 0, 0.3)' : '2px solid rgba(0, 206, 209, 0.3)',
        boxShadow: isListening
          ? '0 4px 16px rgba(255, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 206, 209, 0.3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: disabled ? 0.5 : 1,
        animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
        position: 'relative',
      }}
      title={isListening ? 'Listening... (click to stop)' : 'Tap to speak'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? '🔴' : '🎤'}
      {isListening && (
        <span
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid #FF0000',
            opacity: 0.6,
            animation: 'pulse-ring 1.5s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#FFF',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
          }}
        >
          {error}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
