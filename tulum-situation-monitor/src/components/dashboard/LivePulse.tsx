"use client";

import { useState, useEffect } from 'react';

/**
 * "Updated Xs ago" indicator with live updates every second
 */
export function LivePulse({ lastUpdateTime }: { lastUpdateTime: number }) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateSeconds = () => {
      const now = Date.now();
      setSecondsAgo(Math.floor((now - lastUpdateTime) / 1000));
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  const formatElapsed = (seconds: number): string => {
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        padding: '6px 12px',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        fontSize: '12px',
        fontWeight: 600,
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#00CED1',
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
      {formatElapsed(secondsAgo)}
    </div>
  );
}
