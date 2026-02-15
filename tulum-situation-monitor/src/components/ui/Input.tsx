import React, { useState } from "react";
import { spacing, radius, transition } from "@/lib/design-tokens";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      style = {},
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const hasError = Boolean(error);

    return (
      <div
        style={{
          width: fullWidth ? "100%" : "auto",
          marginBottom: (error || helperText) ? `${spacing.lg}px` : 0,
        }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              marginBottom: `${spacing.sm}px`,
              fontSize: "14px",
              fontWeight: 500,
              color: hasError ? "#EF4444" : "#1A1A1A",
            }}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div style={{ position: "relative", width: "100%" }}>
          {/* Left Icon */}
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: `${spacing.md}px`,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                color: hasError ? "#EF4444" : "#999",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={`input-modern ${className}`.trim()}
            style={{
              width: "100%",
              padding: `${spacing.md - 4}px ${rightIcon ? spacing.xxl + spacing.md : spacing.md}px ${spacing.md - 4}px ${leftIcon ? spacing.xxl + spacing.md : spacing.md}px`,
              background: isFocused ? "#FFFFFF" : "#F5F5F5",
              border: `2px solid ${hasError ? "#EF4444" : isFocused ? "#00CED1" : "transparent"}`,
              borderRadius: radius.md,
              fontSize: "15px",
              outline: "none",
              transition: transition("all", "fast"),
              fontFamily: "inherit",
              color: disabled ? "#999" : "#1A1A1A",
              cursor: disabled ? "not-allowed" : "text",
              boxShadow: isFocused && !hasError
                ? "0 0 0 4px rgba(0, 206, 209, 0.1)"
                : "none",
              ...style,
            }}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              style={{
                position: "absolute",
                right: `${spacing.md}px`,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                color: hasError ? "#EF4444" : "#999",
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <div
            style={{
              marginTop: `${spacing.sm}px`,
              fontSize: "13px",
              color: error ? "#EF4444" : "#666",
            }}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = "",
      style = {},
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const hasError = Boolean(error);

    return (
      <div
        style={{
          width: fullWidth ? "100%" : "auto",
          marginBottom: (error || helperText) ? `${spacing.lg}px` : 0,
        }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              display: "block",
              marginBottom: `${spacing.sm}px`,
              fontSize: "14px",
              fontWeight: 500,
              color: hasError ? "#EF4444" : "#1A1A1A",
            }}
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          className={`input-modern ${className}`.trim()}
          style={{
            width: "100%",
            padding: `${spacing.md}px`,
            background: isFocused ? "#FFFFFF" : "#F5F5F5",
            border: `2px solid ${hasError ? "#EF4444" : isFocused ? "#00CED1" : "transparent"}`,
            borderRadius: radius.md,
            fontSize: "15px",
            outline: "none",
            transition: transition("all", "fast"),
            fontFamily: "inherit",
            color: disabled ? "#999" : "#1A1A1A",
            cursor: disabled ? "not-allowed" : "text",
            resize: "vertical",
            minHeight: "100px",
            boxShadow: isFocused && !hasError
              ? "0 0 0 4px rgba(0, 206, 209, 0.1)"
              : "none",
            ...style,
          }}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <div
            style={{
              marginTop: `${spacing.sm}px`,
              fontSize: "13px",
              color: error ? "#EF4444" : "#666",
            }}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
