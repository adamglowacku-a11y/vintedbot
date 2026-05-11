"use client";

import { CheckCircle2, PlugZap, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type BridgeStatus = "checking" | "ready" | "missing" | "connected" | "error";

export function ExtensionConnectCard() {
  const [status, setStatus] = useState<BridgeStatus>("checking");
  const [message, setMessage] = useState("Checking extension bridge...");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.source !== "vintedflow-extension") {
        return;
      }

      if (event.data.type === "EXTENSION_READY") {
        setStatus("ready");
        setMessage("Extension detected. You can connect this dashboard session.");
      }

      if (event.data.type === "CONNECT_EXTENSION_RESULT") {
        if (event.data.payload?.ok) {
          setStatus("connected");
          setMessage("Extension connected to your Supabase dashboard session.");
        } else {
          setStatus("error");
          setMessage(event.data.payload?.error ?? "Extension connection failed.");
        }
      }
    }

    window.addEventListener("message", handleMessage);
    window.postMessage({ source: "vintedflow-dashboard", type: "CHECK_EXTENSION" }, window.location.origin);

    const timeout = window.setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === "checking") {
          setMessage("Extension not detected. Install or reload the unpacked extension, then refresh this page.");
          return "missing";
        }

        return currentStatus;
      });
    }, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeout);
    };
  }, []);

  async function connectExtension() {
    setStatus("checking");
    setMessage("Preparing Supabase session for extension...");

    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error || !session) {
      setStatus("error");
      setMessage(error?.message ?? "No active dashboard session found. Sign in again.");
      return;
    }

    window.postMessage(
      {
        source: "vintedflow-dashboard",
        type: "CONNECT_EXTENSION",
        payload: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name
          }
        }
      },
      window.location.origin
    );
  }

  return (
    <Card className="mx-auto max-w-3xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <PlugZap className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Chrome extension</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Connect your dashboard session
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            This page securely passes your current Supabase session to the local Chrome extension through the
            dashboard bridge content script. The MVP stores the session in Chrome storage and verifies it with Supabase.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              {status === "connected" ? (
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
              ) : (
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-white">{statusLabel[status]}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button disabled={status === "missing"} onClick={connectExtension} type="button">
              Connect extension
            </Button>
            <Button onClick={() => window.location.reload()} type="button" variant="secondary">
              Recheck bridge
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

const statusLabel: Record<BridgeStatus, string> = {
  checking: "Checking bridge",
  ready: "Extension detected",
  missing: "Extension not detected",
  connected: "Connected",
  error: "Connection issue"
};
