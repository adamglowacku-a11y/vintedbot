"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    window.postMessage({ source: "vintedflow-dashboard", type: "DASHBOARD_LOGOUT" }, window.location.origin);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button disabled={isLoading} onClick={handleLogout} size="sm" type="button" variant="ghost">
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}
