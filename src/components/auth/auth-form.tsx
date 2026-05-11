"use client";

import { Mail, LockKeyhole, MonitorSmartphone, UserPlus } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "login" | "register";
type SafeAuthRoute = "/dashboard" | "/extension/connect" | Route;

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(searchParams.get("message"));
  const redirectTo = getSafeRedirectTo(searchParams.get("redirectTo"));

  function getAuthCallbackUrl() {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectTo);
    return callbackUrl.toString();
  }

  function getSafeRedirectTo(value: string | null): SafeAuthRoute {
    if (value?.startsWith("/dashboard") || value === "/extension/connect") {
      return value as SafeAuthRoute;
    }

    return "/dashboard";
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              },
              emailRedirectTo: getAuthCallbackUrl()
            }
          });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "register" && !result.data.session) {
      setMessage("Sprawdź email, aby potwierdzić konto.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleAuth() {
    setIsLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl()
      }
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Button className="w-full" disabled={isLoading} onClick={handleGoogleAuth} type="button" variant="secondary">
        <MonitorSmartphone className="size-4" />
        Kontynuuj z Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">lub</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={handleEmailAuth}>
        {mode === "register" ? (
          <div className="space-y-2">
            <Label htmlFor="name">Imię</Label>
            <div className="relative">
              <UserPlus className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                id="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Adam Sprzedawca"
                required
                value={name}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-11"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="sprzedawca@example.com"
              required
              type="email"
              value={email}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-11"
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 znaków"
              required
              type="password"
              value={password}
            />
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        ) : null}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Proszę czekać..." : mode === "login" ? "Zaloguj się" : "Utwórz konto"}
        </Button>
      </form>
    </div>
  );
}
