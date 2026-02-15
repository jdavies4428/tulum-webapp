import React, { useEffect, useRef } from "react";
import { zIndex, spacing, radius, transition } from "@/lib/design-tokens";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  glass?: boolean;
  heavyBackdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles: Record<Exclude<ModalProps["size"], undefined>, React.CSSProperties> = {
  sm: { maxWidth: "400px", width: "90%" },
  md: { maxWidth: "600px", width: "90%" },
  lg: { maxWidth: "900px", width: "95%" },
  full: { maxWidth: "none", width: "95%", height: "90vh" },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  glass = false,
  heavyBackdrop = false,
  className = "",
  style = {},
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Esc key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Return focus when modal closes
    return () => {
      previousActiveElement?.focus();
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeStyle = sizeStyles[size];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`modal-backdrop ${heavyBackdrop ? "modal-backdrop-heavy" : ""}`}
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          background: heavyBackdrop ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
          backdropFilter: heavyBackdrop ? "blur(10px)" : "blur(4px)",
          WebkitBackdropFilter: heavyBackdrop ? "blur(10px)" : "blur(4px)",
          zIndex: zIndex.modalBackdrop,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${spacing.lg}px`,
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`spring-slide-up ${className}`}
          style={{
            position: "relative",
            ...sizeStyle,
            maxHeight: size === "full" ? "90vh" : "90vh",
            background: glass
              ? "rgba(255, 255, 255, 0.9)"
              : "#FFFFFF",
            backdropFilter: glass ? "blur(24px)" : undefined,
            WebkitBackdropFilter: glass ? "blur(24px)" : undefined,
            border: glass ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
            borderRadius: radius.xl,
            boxShadow: "0 8px 32px rgba(0, 206, 209, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: zIndex.modal,
            ...style,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              style={{
                padding: `${spacing.lg}px ${spacing.xl}px`,
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {title && (
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: radius.md,
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: transition("all", "fast", "easeOut"),
                    color: "#666",
                  }}
                  aria-label="Close modal"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="scrollbar-hide"
            style={{
              flex: 1,
              overflow: "auto",
              padding: `${spacing.xl}px`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

Modal.displayName = "Modal";
