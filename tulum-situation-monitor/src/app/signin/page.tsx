"use client";

import { useEffect, Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useRouter } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";

function SignInContent() {
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
        router.push("/");
        router.refresh();
      }}
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
          }}
        >
          Loading…
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
