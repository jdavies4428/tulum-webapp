import React from "react";
import { cardVariants, spacing, radius, transition } from "@/lib/design-tokens";

export type CardVariant = "flat" | "elevated" | "glass" | "glassHeavy";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: keyof typeof spacing;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "elevated",
      hover = true,
      padding = "lg",
      className = "",
      style = {},
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = cardVariants[variant];
    const paddingValue = spacing[padding];

    const baseStyles: React.CSSProperties = {
      borderRadius: radius.lg,
      padding: `${paddingValue}px`,
      transition: transition("all", "fast"),
      background: variantStyle.background,
      border: variantStyle.border,
      boxShadow: variantStyle.shadow,
      ...(variant === "glass" || variant === "glassHeavy"
        ? {
            backdropFilter: "backdropFilter" in variantStyle ? variantStyle.backdropFilter : undefined,
            WebkitBackdropFilter: "backdropFilter" in variantStyle ? variantStyle.backdropFilter : undefined,
          }
        : {}),
      ...style,
    };

    const hoverClass = hover ? "hover-lift" : "";

    return (
      <div
        ref={ref}
        className={`card card-${variant} ${hoverClass} ${className}`.trim()}
        style={baseStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = "",
  style = {},
  children,
  ...props
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: `${spacing.md}px`,
        ...style,
      }}
      {...props}
    >
      <div style={{ flex: 1 }}>
        {title && (
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#222222",
              margin: 0,
              marginBottom: subtitle ? `${spacing.xs}px` : 0,
            }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: "14px",
              color: "#717171",
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div style={{ marginLeft: `${spacing.md}px` }}>{action}</div>}
    </div>
  );
};

CardHeader.displayName = "CardHeader";

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = "",
  style = {},
  children,
  ...props
}) => {
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = "CardContent";

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = "",
  style = {},
  children,
  ...props
}) => {
  return (
    <div
      className={className}
      style={{
        marginTop: `${spacing.md}px`,
        paddingTop: `${spacing.md}px`,
        borderTop: "1px solid #EEEEEE",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = "CardFooter";
