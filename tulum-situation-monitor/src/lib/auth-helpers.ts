import type { User } from "@supabase/supabase-js";

/**
 * Check if a user has admin role.
 * Checks user_metadata.role first (set via Supabase dashboard or trigger),
 * then falls back to NEXT_PUBLIC_ADMIN_EMAIL for backwards compatibility.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.user_metadata?.role === "admin") return true;
  // Fallback for existing admin before role migration
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) return true;
  return false;
}
