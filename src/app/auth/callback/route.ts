import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const authError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", authError);
    loginUrl.searchParams.set("redirectTo", next);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", "Nie otrzymano kodu autoryzacji Google.");
    loginUrl.searchParams.set("redirectTo", next);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("message", error.message);
      loginUrl.searchParams.set("redirectTo", next);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", error instanceof Error ? error.message : "Nie udało się zakończyć logowania Google.");
    loginUrl.searchParams.set("redirectTo", next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function getSafeNextPath(value: string | null) {
  if (value?.startsWith("/dashboard") || value === "/extension/connect") {
    return value;
  }

  return "/dashboard";
}
