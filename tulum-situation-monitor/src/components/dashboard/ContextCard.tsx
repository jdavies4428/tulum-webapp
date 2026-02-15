"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { ContextualSuggestion } from '@/lib/contextual-suggestions';

interface ContextCardProps {
  suggestion: ContextualSuggestion;
  index: number;
}

export function ContextCard({ suggestion, index }: ContextCardProps) {
  const [hovered, setHovered] = useState(false);

  const cardContent = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '24px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0, 0, 0, 0.12)'
          : '0 8px 32px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: suggestion.action ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: `slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          fontSize: '48px',
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
          transition: 'transform 0.2s',
          transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0)',
        }}
      >
        {suggestion.icon}
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#1a1a1a',
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {suggestion.title}
        </h3>
        <p
          style={{
            fontSize: '15px',
            color: '#555',
            margin: 0,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {suggestion.description}
        </p>
      </div>

      {suggestion.action && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#00CED1',
            marginTop: '8px',
          }}
        >
          {suggestion.action.label}
          <span
            style={{
              transition: 'transform 0.2s',
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            }}
          >
            →
          </span>
        </div>
      )}
    </div>
  );

  if (suggestion.action) {
    return (
      <Link
        href={suggestion.action.href}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
