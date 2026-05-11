import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireActiveUser() {
  const user = await requireUser();
  const accessStatus = user.app_metadata?.access_status;

  if (!isAdminEmail(user.email) && accessStatus === "blocked") {
    redirect("/login?message=Twoj dostep do aplikacji zostal wstrzymany.");
  }

  return user;
}
