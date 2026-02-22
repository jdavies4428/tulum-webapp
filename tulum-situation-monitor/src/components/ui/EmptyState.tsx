"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        minHeight: 300,
      }}
    >
      <div
        style={{
          fontSize: 56,
          marginBottom: 16,
          filter: "grayscale(0.2)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#E8ECEF",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "rgba(232, 236, 239, 0.5)",
          maxWidth: 280,
          lineHeight: 1.5,
          marginBottom: actionLabel ? 24 : 0,
        }}
      >
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #00CED1, #00A5A8)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s ease",
          }}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #00CED1, #00A5A8)",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
