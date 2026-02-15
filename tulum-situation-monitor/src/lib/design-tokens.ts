/**
 * Design System Tokens for Tulum Discovery App
 * Centralized design tokens for consistent styling across all components
 */

// Spacing scale based on 8px grid system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Elevation shadows with teal accent
export const shadows = {
  none: 'none',
  soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
  float: '0 4px 20px rgba(0, 206, 209, 0.15)',
  lifted: '0 8px 32px rgba(0, 206, 209, 0.2)',
  glow: '0 0 24px rgba(0, 206, 209, 0.25)',
  glowStrong: '0 0 32px rgba(0, 206, 209, 0.4)',
} as const;

// Glassmorphism effects
export const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  heavy: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  dark: {
    background: 'rgba(10, 10, 10, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const;

// Animation durations and easings
export const animation = {
  // Durations
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',

  // Easing functions
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design standard
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like bounce
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Border radius scale
export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
} as const;

// Typography scale (font weights)
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Button variants
export const buttonVariants = {
  primary: {
    background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
    color: '#FFFFFF',
    border: 'none',
    shadow: shadows.float,
    hoverShadow: shadows.lifted,
    hoverTransform: 'translateY(-2px) scale(1.02)',
  },
  secondary: {
    background: 'rgba(0, 206, 209, 0.1)',
    color: '#00CED1',
    border: '2px solid #00CED1',
    shadow: shadows.soft,
    hoverShadow: shadows.float,
    hoverTransform: 'scale(1.02)',
  },
  ghost: {
    background: 'transparent',
    color: '#666',
    border: 'none',
    shadow: shadows.none,
    hoverShadow: shadows.soft,
    hoverTransform: 'scale(1.02)',
  },
  danger: {
    background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    color: '#FFFFFF',
    border: 'none',
    shadow: shadows.float,
    hoverShadow: shadows.lifted,
    hoverTransform: 'translateY(-2px) scale(1.02)',
  },
  glass: {
    background: glass.light.background,
    color: '#1A1A1A',
    border: glass.light.border,
    backdropFilter: glass.light.backdropFilter,
    shadow: shadows.soft,
    hoverShadow: shadows.float,
    hoverTransform: 'translateY(-2px)',
  },
} as const;

// Card variants
export const cardVariants = {
  flat: {
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    shadow: shadows.none,
    hoverShadow: shadows.soft,
  },
  elevated: {
    background: '#FFFFFF',
    border: 'none',
    shadow: shadows.medium,
    hoverShadow: shadows.float,
  },
  glass: {
    background: glass.light.background,
    border: glass.light.border,
    backdropFilter: glass.light.backdropFilter,
    shadow: shadows.soft,
    hoverShadow: shadows.float,
  },
  glassHeavy: {
    background: glass.heavy.background,
    border: glass.heavy.border,
    backdropFilter: glass.heavy.backdropFilter,
    shadow: shadows.medium,
    hoverShadow: shadows.float,
  },
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 9998,
  modal: 9999,
  popover: 10000,
  tooltip: 10001,
} as const;

// Helper function to apply glass effect
export function applyGlassEffect(variant: keyof typeof glass = 'light') {
  const glassStyle = glass[variant];
  return {
    background: glassStyle.background,
    backdropFilter: glassStyle.backdropFilter,
    border: glassStyle.border,
    WebkitBackdropFilter: glassStyle.backdropFilter, // Safari support
  };
}

// Helper function for transition styles
export function transition(
  property: string = 'all',
  duration: keyof typeof animation = 'normal',
  easing: keyof typeof animation = 'easeOut'
) {
  const durationValue = animation[duration];
  const easingValue = animation[easing];
  return `${property} ${durationValue} ${easingValue}`;
}
