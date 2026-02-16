"use client";

import { useEffect } from 'react';
import { ContextualGrid } from '@/components/dashboard/ContextualGrid';
import { useWeather } from '@/hooks/useWeather';
import { getWeatherDescription } from '@/lib/weather';
import type { Lang } from '@/lib/weather';

interface TulumRightNowModalProps {
  lang: Lang;
  onClose: () => void;
}

export function TulumRightNowModal({ lang, onClose }: TulumRightNowModalProps) {
  const { data: weatherData } = useWeather();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none',
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
            borderRadius: '32px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
            animation: 'spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'auto',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              transition: 'all 0.2s',
              color: '#333',
              fontWeight: 300,
              lineHeight: 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            ×
          </button>

          <div style={{
            flex: 1,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {weatherData?.current && (
              <ContextualGrid
                weather={{
                  temperature: weatherData.current.temperature_2m,
                  condition: getWeatherDescription(weatherData.current.weather_code, lang).desc,
                  uvIndex: weatherData.daily?.uv_index_max?.[0] ?? 0,
                  sunrise: weatherData.daily?.sunrise?.[0],
                  sunset: weatherData.daily?.sunset?.[0],
                }}
                lang={lang}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
