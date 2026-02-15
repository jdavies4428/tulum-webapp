"use client";

import { spacing, colors, radius, shadows } from "@/lib/design-tokens";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: colors.neutral.white,
          borderRadius: radius.lg,
          boxShadow: shadows.lg,
          padding: spacing.xl,
        }}
      >
        <h3
          style={{
            margin: 0,
            marginBottom: spacing.md,
            fontSize: "20px",
            fontWeight: "700",
            color: danger ? "#FF6B6B" : colors.neutral.gray[800],
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            marginBottom: spacing.xl,
            fontSize: "15px",
            lineHeight: "1.5",
            color: colors.neutral.gray[600],
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: spacing.md }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: spacing.md,
              background: colors.neutral.gray[100],
              border: "none",
              borderRadius: radius.md,
              fontSize: "15px",
              fontWeight: "600",
              color: colors.neutral.gray[700],
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: spacing.md,
              background: danger
                ? "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)"
                : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              border: "none",
              borderRadius: radius.md,
              fontSize: "15px",
              fontWeight: "700",
              color: colors.neutral.white,
              cursor: "pointer",
              boxShadow: shadows.md,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
