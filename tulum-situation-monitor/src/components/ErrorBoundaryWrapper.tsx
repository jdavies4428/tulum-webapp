"use client";

import { AppErrorBoundary } from "./AppErrorBoundary";

export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <AppErrorBoundary>{children}</AppErrorBoundary>;
}
