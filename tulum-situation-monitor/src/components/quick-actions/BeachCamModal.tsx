"use client";

import { useEffect, useState } from 'react';
import { translations } from '@/lib/i18n';
import type { Lang } from '@/lib/weather';

interface BeachCamModalProps {
  lang: Lang;
  onClose: () => void;
}

export function BeachCamModal({ lang, onClose }: BeachCamModalProps) {
  const [imageKey, setImageKey] = useState(Date.now());
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Auto-refresh image every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageKey(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
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
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            maxWidth: '1200px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
            animation: 'spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '24px',
              borderBottom: '2px solid rgba(0, 206, 209, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🏖️ {t.beachCam ?? 'Beach Cam'}
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                {t.beachCamSubtitle ?? 'Live view of Casa Malca Beach'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              ×
            </button>
          </div>

          <div style={{ position: 'relative', padding: '24px' }}>
            <img
              key={imageKey}
              src={`/data/webcam/latest.jpg?v=${imageKey}`}
              alt="Casa Malca Beach Live View"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                animation: 'fadeIn 0.5s ease-out',
              }}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-beach.jpg';
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 36,
                right: 36,
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00FF00',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <style jsx>{`
                @keyframes pulse {
                  0%, 100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.4;
                  }
                }
              `}</style>
              {t.live ?? 'LIVE'}
            </div>
          </div>

          <div
            style={{
              padding: '20px 24px',
              background: 'rgba(0, 206, 209, 0.05)',
              borderTop: '2px solid rgba(0, 206, 209, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
              {t.autoRefresh ?? 'Auto-refreshes every 30 seconds'}
            </p>
            <button
              type="button"
              onClick={() => setImageKey(Date.now())}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
                border: 'none',
                color: '#FFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 206, 209, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔄 {t.refresh ?? 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
