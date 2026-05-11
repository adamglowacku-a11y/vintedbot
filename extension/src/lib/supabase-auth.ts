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
