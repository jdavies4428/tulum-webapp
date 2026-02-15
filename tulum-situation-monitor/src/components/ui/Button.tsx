import React from "react";
import { buttonVariants, spacing, transition } from "@/lib/design-tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "glass";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: "14px",
    borderRadius: "10px",
  },
  md: {
    padding: `${spacing.md - 4}px ${spacing.lg}px`,
    fontSize: "15px",
    borderRadius: "12px",
  },
  lg: {
    padding: `${spacing.md}px ${spacing.xl}px`,
    fontSize: "16px",
    borderRadius: "14px",
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      className = "",
      style = {},
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const variantStyle = buttonVariants[variant];
    const sizeStyle = sizeStyles[size];

    const isDisabled = disabled || loading;

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: `${spacing.sm}px`,
      fontWeight: 600,
      lineHeight: 1.5,
      cursor: isDisabled ? "not-allowed" : "pointer",
      border: "none",
      outline: "none",
      WebkitTapHighlightColor: "transparent",
      userSelect: "none",
      transition: transition("all", "normal", "easeOut"),
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? "100%" : "auto",
      ...sizeStyle,
      ...style,
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      // Haptic feedback on supported devices
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${className}`.trim()}
        style={baseStyles}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <>
            <span
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span style={{ display: "flex", alignItems: "center" }}>{leftIcon}</span>}
            {children}
            {rightIcon && <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Add spin animation to globals if not already present
if (typeof document !== "undefined" && !document.querySelector('style[data-button-animations]')) {
  const style = document.createElement("style");
  style.setAttribute("data-button-animations", "true");
  style.textContent = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}
