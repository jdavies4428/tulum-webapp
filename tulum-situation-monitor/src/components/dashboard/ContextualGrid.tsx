"use client";

import { useState, useEffect } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import { getSuggestions, type WeatherData } from '@/lib/contextual-suggestions';
import { ContextCard } from './ContextCard';
import { LivePulse } from './LivePulse';
import { BeachCamModal } from '@/components/quick-actions/BeachCamModal';
import type { Lang } from '@/lib/weather';
import { translations } from '@/lib/i18n';

interface ContextualGridProps {
  weather: WeatherData;
  lang: Lang;
}

export function ContextualGrid({ weather, lang }: ContextualGridProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [activeModal, setActiveModal] = useState<'beachCam' | null>(null);

  // Extract sunrise/sunset hours from weather data
  const sunriseHour = weather.sunrise ? new Date(weather.sunrise).getHours() : undefined;
  const sunsetHour = weather.sunset ? new Date(weather.sunset).getHours() : undefined;

  const timeContext = useTimeContext(sunriseHour, sunsetHour);

  const suggestions = getSuggestions({
    timeContext,
    weather,
  }, lang);

  // Auto-refresh suggestions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '24px',
        paddingTop: '70px',
        paddingBottom: '40px',
      }}
    >
      <LivePulse lastUpdateTime={lastUpdateTime} />

      <div
        style={{
          marginBottom: '24px',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ✨ {translations[lang].tulumRightNow}
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(232, 236, 239, 0.6)',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {timeContext.hour}:{timeContext.minute.toString().padStart(2, '0')} • {Math.round(weather.temperature)}°C • {weather.condition}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          paddingBottom: '24px',
        }}
      >
        {suggestions.map((suggestion, index) => (
          <ContextCard
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            onModalOpen={setActiveModal}
          />
        ))}
      </div>

      {activeModal === 'beachCam' && (
        <BeachCamModal lang={lang} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
