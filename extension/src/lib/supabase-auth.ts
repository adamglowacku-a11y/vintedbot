import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/constants";
import type { SupabaseSessionSnapshot } from "@/types/extension";

type SupabaseUserResponse = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

type SupabaseRefreshResponse = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: SupabaseUserResponse;
};

export function isSessionExpiring(session: SupabaseSessionSnapshot, bufferSeconds = 90) {
  if (!session.expiresAt) {
    return false;
  }

  return session.expiresAt * 1000 <= Date.now() + bufferSeconds * 1000;
}

export async function refreshSupabaseSession(session: SupabaseSessionSnapshot) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error: "Missing extension Supabase configuration."
    };
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: session.refreshToken
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Supabase session expired. Reconnect the extension from the dashboard."
    };
  }

  const refreshed = (await response.json()) as SupabaseRefreshResponse;
  const nextSession: SupabaseSessionSnapshot = {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: refreshed.expires_at,
    user: {
      id: refreshed.user.id,
      email: refreshed.user.email,
      name: refreshed.user.user_metadata?.full_name ?? refreshed.user.user_metadata?.name
    }
  };

  return {
    ok: true,
    session: nextSession,
    user: nextSession.user
  };
}

export async function verifySupabaseSession(session: SupabaseSessionSnapshot) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error: "Missing extension Supabase configuration."
    };
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken}`
    }
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Supabase session could not be verified."
    };
  }

  const user = (await response.json()) as SupabaseUserResponse;

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name
    }
  };
}
