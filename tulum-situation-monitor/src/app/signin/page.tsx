"use client";

import { useEffect } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useRouter } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const auth = useAuthOptional();

  useEffect(() => {
    if (auth && !auth.loading && auth.isAuthenticated) {
      router.replace("/");
    }
  }, [auth, router]);

  if (auth?.loading || auth?.isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        Loading…
      </div>
    );
  }

  return (
    <AuthScreen
      onSignInComplete={(user) => {
        if (user) {
          router.push("/");
          router.refresh();
        } else {
          router.push("/");
          router.refresh();
        }
      }}
    />
  );
}
