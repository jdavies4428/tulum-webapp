import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Supabase may redirect here with error params if OAuth fails before our callback
  if (errorParam) {
    const msg = errorDescription
      ? `${errorParam}: ${decodeURIComponent(errorDescription)}`
      : errorParam;
    return NextResponse.redirect(
      `${url.origin}/signin?error=auth_oauth_error&message=${encodeURIComponent(msg)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${url.origin}/signin?error=auth_callback_no_code`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = error.message || "Exchange failed";
    return NextResponse.redirect(
      `${url.origin}/signin?error=auth_exchange_failed&message=${encodeURIComponent(message)}`
    );
  }

  return NextResponse.redirect(`${url.origin}${next.startsWith("/") ? next : `/${next}`}`);
}
