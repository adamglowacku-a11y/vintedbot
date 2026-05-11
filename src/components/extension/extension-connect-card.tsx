"use client";

import { AlertCircle, CheckCircle2, Loader2, PlugZap, RefreshCw, ShieldCheck, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type BridgeStatus = "checking" | "ready" | "missing" | "connected" | "expired" | "error";

type ExtensionBridgeResponse = {
  ok: boolean;
  data?: {
    isConnected: boolean;
    user: {
      id: string;
      email?: string;
      name?: string;
    } | null;
    sync: {
      status: "idle" | "syncing" | "synced" | "expired" | "error";
      lastSyncedAt?: string;
      lastHeartbeatAt?: string;
      error?: string;
    };
    vinted: {
      isOnVinted: boolean;
      hostname?: string;
      detectedAt?: string;
    };
  };
  error?: string;
};

type Toast = {
  id: string;
  tone: "success" | "error" | "info";
  message: string;
};

export function ExtensionConnectCard() {
  const [status, setStatus] = useState<BridgeStatus>("checking");
  const [message, setMessage] = useState("Sprawdzam połączenie z rozszerzeniem...");
  const [extensionState, setExtensionState] = useState<ExtensionBridgeResponse["data"] | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectAttemptRef = useRef(0);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.source !== "vintedflow-extension") {
        return;
      }

      if (event.data.type === "EXTENSION_READY") {
        handleBridgeResponse(event.data.payload, "Rozszerzenie wykryte. Możesz połączyć sesję dashboardu.");
      }

      if (event.data.type === "CONNECT_EXTENSION_RESULT") {
        connectAttemptRef.current = 0;
        setIsConnecting(false);
        handleBridgeResponse(event.data.payload, "Rozszerzenie połączone z sesją Supabase.");
        pushToast(event.data.payload?.ok ? "success" : "error", event.data.payload?.ok ? "Rozszerzenie połączone." : "Połączenie nieudane.");
      }

      if (event.data.type === "EXTENSION_STATE") {
        handleBridgeResponse(event.data.payload, "Status rozszerzenia odświeżony.");
      }
    }

    window.addEventListener("message", handleMessage);
    const checkBridge = () => {
      window.postMessage({ source: "vintedflow-dashboard", type: "CHECK_EXTENSION" }, window.location.origin);
      window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
    };
    const retryTimers = [0, 500, 1500, 3000].map((delay) => window.setTimeout(checkBridge, delay));

    const timeout = window.setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === "checking") {
          setMessage("Nie wykryto rozszerzenia. Przeładuj rozszerzenie w chrome://extensions i odśwież tę stronę.");
          return "missing";
        }

        return currentStatus;
      });
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function handleBridgeResponse(response: ExtensionBridgeResponse | undefined, fallbackMessage: string) {
    if (!response?.ok) {
      setStatus("error");
      setMessage(response?.error ?? "Bridge rozszerzenia zwrócił błąd.");
      return;
    }

    setExtensionState(response.data ?? null);

    if (response.data?.sync.status === "expired") {
      setStatus("expired");
      setMessage(response.data.sync.error ?? "Sesja rozszerzenia wygasła. Połącz ponownie, aby kontynuować.");
      return;
    }

    if (response.data?.isConnected) {
      setStatus("connected");
      setMessage("Rozszerzenie jest online i zalogowane sesją dashboardu.");
      return;
    }

    setStatus("ready");
    setMessage(fallbackMessage);
  }

  function pushToast(tone: Toast["tone"], toastMessage: string) {
    const toast = {
      id: crypto.randomUUID(),
      tone,
      message: toastMessage
    };

    setToasts((currentToasts) => [toast, ...currentToasts].slice(0, 3));
    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((currentToast) => currentToast.id !== toast.id));
    }, 4200);
  }

  async function connectExtension() {
    setIsConnecting(true);
    const attemptId = Date.now();
    connectAttemptRef.current = attemptId;
    setStatus("checking");
    setMessage("Przygotowuję sesję Supabase dla rozszerzenia...");

    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error || !session) {
      setIsConnecting(false);
      setStatus("error");
      setMessage(error?.message ?? "Nie znaleziono aktywnej sesji dashboardu. Zaloguj się ponownie.");
      pushToast("error", "Nie znaleziono aktywnej sesji dashboardu.");
      return;
    }

    const payload = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name
      }
    };
    const sendConnectRequest = () => {
      window.postMessage(
        {
          source: "vintedflow-dashboard",
          type: "CONNECT_EXTENSION",
          payload
        },
        window.location.origin
      );
    };

    [0, 700, 1800].forEach((delay) => window.setTimeout(sendConnectRequest, delay));
    window.setTimeout(() => {
      if (connectAttemptRef.current !== attemptId) {
        return;
      }

      connectAttemptRef.current = 0;
      setIsConnecting(false);
      setStatus("error");
      setMessage("Nie otrzymano potwierdzenia połączenia. Odśwież stronę i spróbuj ponownie.");
      pushToast("error", "Brak potwierdzenia z rozszerzenia.");
    }, 6500);
  }

  function refreshStatus() {
    setStatus("checking");
    setMessage("Odświeżam status rozszerzenia...");
    window.postMessage({ source: "vintedflow-dashboard", type: "CHECK_EXTENSION" }, window.location.origin);
    window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
    window.postMessage({ source: "vintedflow-dashboard", type: "SYNC_EXTENSION" }, window.location.origin);
    pushToast("info", "Odświeżam synchronizację rozszerzenia.");
  }

  function disconnectExtension() {
    window.postMessage({ source: "vintedflow-dashboard", type: "DISCONNECT_EXTENSION" }, window.location.origin);
    pushToast("info", "Wysłano prośbę o rozłączenie rozszerzenia.");
  }

  return (
    <Card className="relative mx-auto max-w-4xl overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute right-10 top-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            className="rounded-2xl border border-white/10 bg-background/90 px-4 py-3 text-sm text-white shadow-glow backdrop-blur-xl"
            key={toast.id}
          >
            <span className={toast.tone === "error" ? "text-red-300" : toast.tone === "success" ? "text-primary" : "text-muted-foreground"}>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <PlugZap className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Rozszerzenie Chrome</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Połącz sesję dashboardu
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Ta strona bezpiecznie przekazuje aktualną sesję Supabase do lokalnego rozszerzenia Chrome przez bridge
            dashboardu. Sesja jest zapisywana w Chrome storage i weryfikowana z Supabase.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <StatusTile label="Bridge" value={statusLabel[status]} active={status !== "missing" && status !== "error"} />
            <StatusTile
              label="Auth"
              value={extensionState?.isConnected ? "Zalogowano" : "Nie połączono"}
              active={Boolean(extensionState?.isConnected)}
            />
            <StatusTile
              label="Vinted"
              value={extensionState?.vinted.isOnVinted ? "Wykryto" : "Oczekuje"}
              active={Boolean(extensionState?.vinted.isOnVinted)}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              {status === "checking" || isConnecting ? (
                <Loader2 className="mt-0.5 size-5 animate-spin text-primary" />
              ) : status === "connected" ? (
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
              ) : status === "error" || status === "expired" ? (
                <AlertCircle className="mt-0.5 size-5 text-red-300" />
              ) : (
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-white">{statusLabel[status]}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
              </div>
            </div>
          </div>

          {extensionState?.user ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{extensionState.user.name ?? "Połączony sprzedawca"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{extensionState.user.email ?? extensionState.user.id}</p>
                </div>
                <Badge variant="success">Rozszerzenie online</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="text-xs text-muted-foreground">
                  Ostatnia synchronizacja: {formatDate(extensionState.sync.lastSyncedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Heartbeat: {formatDate(extensionState.sync.lastHeartbeatAt)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button disabled={status === "missing" || isConnecting} onClick={connectExtension} type="button">
              {isConnecting ? "Łączenie..." : status === "expired" ? "Połącz ponownie" : "Połącz rozszerzenie"}
            </Button>
            <Button onClick={refreshStatus} type="button" variant="secondary">
              <RefreshCw className="size-4" />
              Synchronizuj
            </Button>
            <Button disabled={!extensionState?.isConnected} onClick={disconnectExtension} type="button" variant="ghost">
              Rozłącz
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

const statusLabel: Record<BridgeStatus, string> = {
  checking: "Sprawdzanie bridge",
  ready: "Rozszerzenie wykryte",
  missing: "Nie wykryto rozszerzenia",
  connected: "Połączono",
  expired: "Sesja wygasła",
  error: "Problem z połączeniem"
};

function StatusTile({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <Wifi className={active ? "size-4 text-primary" : "size-4 text-muted-foreground"} />
      </div>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "jeszcze brak";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}
