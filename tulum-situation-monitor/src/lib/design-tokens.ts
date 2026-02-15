/**
 * Design System Tokens for Tulum Discovery App
 * Jony Ive principles: Simplicity, Clarity, Cohesion
 *
 * Rules:
 * - Use only these tokens throughout the app
 * - No arbitrary values in components
 * - Every element earns its place
 */

// ============================================================================
// COLOR PALETTE - Minimal & Intentional
// ============================================================================
export const colors = {
  // Primary: Ocean/Turquoise (Tulum's water)
  primary: {
    base: '#00CED1',      // Main turquoise
    dark: '#00BABA',      // Darker shade
    light: '#4DD4D6',     // Lighter shade
    subtle: 'rgba(0, 206, 209, 0.1)',
    glow: 'rgba(0, 206, 209, 0.25)',
  },

  // Accent: Coral (Used sparingly for special actions)
  accent: {
    base: '#FF8E53',
    dark: '#FF6B6B',
    subtle: 'rgba(255, 142, 83, 0.1)',
  },

  // Neutrals: Minimal grayscale
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },

  // Semantic colors
  success: '#50C878',
  warning: '#FFD700',
  error: '#EF4444',

  // Backgrounds (glass effects)
  glass: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.65)',
    dark: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY - Strict Scale (only use these sizes)
// ============================================================================
export const typography = {
  // Font sizes: 12, 14, 16, 20, 24, 32, 48 (7 sizes max)
  size: {
    xs: '12px',    // Captions, labels
    sm: '14px',    // Body small, buttons
    base: '16px',  // Body text (default)
    lg: '20px',    // H3, emphasized text
    xl: '24px',    // H2
    xxl: '32px',   // H1, page titles
    xxxl: '48px',  // Hero text (rare)
  },

  // Font weights: 4 weights max
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING - Strict 4px Grid (only use these values)
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================================================
// SHADOWS - 3 Levels Only (Jony Ive: less is more)
// ============================================================================
export const shadows = {
  none: 'none',
  sm: '0 2px 8px rgba(0, 0, 0, 0.06)',      // Subtle depth
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',     // Card elevation
  lg: '0 8px 32px rgba(0, 0, 0, 0.12)',     // Modal, floating elements
  glow: '0 0 24px rgba(0, 206, 209, 0.25)', // Accent glow (use sparingly)
} as const;

// ============================================================================
// GLASSMORPHISM - Tulum's Signature Look
// ============================================================================
export const glass = {
  // Light glass (primary choice)
  light: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  // Dark glass (overlays, modals)
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const;

// ============================================================================
// ANIMATION - Smooth & Intentional
// ============================================================================
export const animation = {
  // Durations: 2 speeds only
  fast: '200ms',   // Quick interactions (hover, focus)
  slow: '400ms',   // Transitions, page changes

  // Easing: 1 function for everything (consistency)
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)', // Apple's standard
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful bounce (use sparingly)
} as const;

// ============================================================================
// BORDER RADIUS - 3 Sizes Only
// ============================================================================
export const radius = {
  sm: '8px',    // Buttons, inputs, small cards
  md: '16px',   // Cards, panels
  lg: '24px',   // Modals, large containers
  full: '9999px', // Pills, circles
} as const;

// ============================================================================
// BUTTON STYLES - Only 3 Variants (Primary, Secondary, Ghost)
// ============================================================================
export const button = {
  // Primary: Main actions (turquoise)
  primary: {
    background: `linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%)`,
    color: colors.neutral.white,
    border: 'none',
    shadow: shadows.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    borderRadius: radius.md,
  },

  // Secondary: Supporting actions (glass with turquoise accent)
  secondary: {
    background: glass.light.background,
    backdropFilter: glass.light.backdropFilter,
    color: colors.primary.base,
    border: `2px solid ${colors.primary.base}`,
    shadow: shadows.sm,
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    borderRadius: radius.md,
  },

  // Ghost: Tertiary actions (minimal)
  ghost: {
    background: 'transparent',
    color: colors.neutral.gray[600],
    border: 'none',
    shadow: shadows.none,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    borderRadius: radius.sm,
  },
} as const;

// Backward compatibility: buttonVariants (for existing components)
export const buttonVariants = {
  primary: {
    background: `linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%)`,
    color: colors.neutral.white,
    border: 'none',
    boxShadow: shadows.md,
  },
  secondary: {
    background: glass.light.background,
    backdropFilter: glass.light.backdropFilter,
    color: colors.primary.base,
    border: `2px solid ${colors.primary.base}`,
    boxShadow: shadows.sm,
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral.gray[600],
    border: 'none',
    boxShadow: shadows.none,
  },
  danger: {
    background: `linear-gradient(135deg, ${colors.error} 0%, #DC2626 100%)`,
    color: colors.neutral.white,
    border: 'none',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
  },
  glass: {
    background: glass.light.background,
    backdropFilter: glass.light.backdropFilter,
    color: colors.neutral.gray[700],
    border: `1px solid ${colors.neutral.gray[200]}`,
    boxShadow: shadows.sm,
  },
} as const;

// ============================================================================
// CARD STYLES - Simplified variants
// ============================================================================
export const card = {
  // Glass: Primary card style (Tulum aesthetic)
  glass: {
    background: glass.light.background,
    backdropFilter: glass.light.backdropFilter,
    border: glass.light.border,
    shadow: shadows.sm,
    borderRadius: radius.md,
    padding: spacing.lg,
  },

  // Solid: Alternative when glass doesn't work
  solid: {
    background: colors.neutral.white,
    border: `1px solid ${colors.neutral.gray[200]}`,
    shadow: shadows.md,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
} as const;

// Backward compatibility: cardVariants (for existing components)
export const cardVariants = {
  flat: {
    background: colors.neutral.white,
    border: `1px solid ${colors.neutral.gray[200]}`,
    shadow: shadows.none,
    hoverShadow: shadows.sm,
  },
  elevated: {
    background: colors.neutral.white,
    border: 'none',
    shadow: shadows.md,
    hoverShadow: shadows.lg,
  },
  glass: {
    background: glass.light.background,
    border: glass.light.border,
    backdropFilter: glass.light.backdropFilter,
    shadow: shadows.sm,
    hoverShadow: shadows.md,
  },
  glassHeavy: {
    background: glass.light.background,
    border: glass.light.border,
    backdropFilter: glass.light.backdropFilter,
    shadow: shadows.md,
    hoverShadow: shadows.lg,
  },
} as const;

// ============================================================================
// Z-INDEX - Layering System
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  overlay: 9998,
  modal: 9999,
  tooltip: 10000,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Apply glass effect with Safari support
 */
export function applyGlass(variant: keyof typeof glass = 'light') {
  const glassStyle = glass[variant];
  return {
    background: glassStyle.background,
    backdropFilter: glassStyle.backdropFilter,
    WebkitBackdropFilter: glassStyle.backdropFilter,
    border: glassStyle.border,
  };
}

/**
 * Create transition string
 */
export function transition(
  property: string = 'all',
  speed: 'fast' | 'slow' = 'fast'
) {
  return `${property} ${animation[speed]} ${animation.ease}`;
}
