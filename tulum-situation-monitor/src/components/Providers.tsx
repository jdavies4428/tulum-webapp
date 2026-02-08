"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { PendingFavoriteHandler } from "@/components/auth/PendingFavoriteHandler";
import { WelcomeModal } from "@/components/auth/WelcomeModal";
import { SyncProfileOnAuth } from "@/components/auth/SyncProfileOnAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncProfileOnAuth />
      <PendingFavoriteHandler />
      <WelcomeModal lang="en" />
      {children}
    </AuthProvider>
  );
}
