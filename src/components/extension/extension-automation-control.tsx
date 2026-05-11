"use client";

import { Bot, Pause, Play, RefreshCw, ShieldCheck, TimerReset, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExtensionAutomationState = {
  isConnected: boolean;
  automationEnabled: boolean;
  parsedListings: Array<{
    id: string;
    title: string;
    status: string;
    hasRefreshButton: boolean;
  }>;
  actionQueue: {
    activeJob: {
      listingTitle: string;
      status: string;
      scheduledFor?: string;
      error?: string;
    } | null;
    pending: Array<{ id: string; listingTitle: string; status: string }>;
    history: Array<{ id: string; listingTitle: string; status: string; completedAt?: string; error?: string }>;
    cooldownUntil?: string;
    cooldownSeconds: number;
  };
  modules: Record<string, string>;
  logs: Array<{
    id: string;
    level: string;
    message: string;
    createdAt: string;
  }>;
};

type ExtensionStateResponse = {
  ok: boolean;
  data?: ExtensionAutomationState;
  error?: string;
};

export function ExtensionAutomationControl() {
  const [state, setState] = useState<ExtensionAutomationState | null>(null);
  const [message, setMessage] = useState("Sprawdzam rozszerzenie i realną kolejkę akcji...");
  const [isBusy, setIsBusy] = useState(false);

  function requestState() {
    window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
  }

  function handleResponse(response?: ExtensionStateResponse) {
    setIsBusy(false);

    if (!response?.ok) {
      setMessage(response?.error ?? "Nie udało się odczytać stanu rozszerzenia.");
      return;
    }

    setState(response.data ?? null);
    setMessage("Sterowanie działa na realnym stanie rozszerzenia Chrome, bez danych demo.");
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.source !== "vintedflow-extension") {
        return;
      }

      if (event.data.type === "EXTENSION_READY" || event.data.type === "EXTENSION_STATE") {
        handleResponse(event.data.payload);
      }
    }

    window.addEventListener("message", handleMessage);
    requestState();
    const interval = window.setInterval(requestState, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(interval);
    };
  }, []);

  function sendAction(type: string, payload?: unknown) {
    setIsBusy(true);
    window.postMessage(
      {
        source: "vintedflow-dashboard",
        type,
        payload
      },
      window.location.origin
    );
  }

  function toggleMonitoring() {
    sendAction("TOGGLE_AUTOMATION", {
      enabled: !state?.automationEnabled
    });
  }

  function refreshFirstListing() {
    const listing = state?.parsedListings.find((item) => item.status === "active" && item.hasRefreshButton) ?? state?.parsedListings.find((item) => item.hasRefreshButton);

    if (!listing) {
      setMessage("Brak aktywnej oferty z wykrytym przyciskiem odświeżania. Otwórz profil Vinted i kliknij Skanuj DOM.");
      return;
    }

    sendAction("REQUEST_REFRESH_LISTING", { listingId: listing.id });
  }

  const refreshableCount = state?.parsedListings.filter((listing) => listing.hasRefreshButton).length ?? 0;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <Bot className="mt-1 size-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Realne sterowanie rozszerzeniem</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isBusy} onClick={toggleMonitoring} type="button" variant={state?.automationEnabled ? "secondary" : "primary"}>
              {state?.automationEnabled ? <Pause className="size-4" /> : <Play className="size-4" />}
              {state?.automationEnabled ? "Wyłącz monitoring" : "Włącz monitoring"}
            </Button>
            <Button disabled={isBusy} onClick={() => sendAction("MANUAL_SCAN")} type="button" variant="secondary">
              <RefreshCw className="size-4" />
              Skanuj DOM
            </Button>
            <Button disabled={isBusy || refreshableCount === 0} onClick={refreshFirstListing} type="button" variant="secondary">
              Odśwież 1 ofertę
            </Button>
            <Button disabled={isBusy || !state?.actionQueue.activeJob} onClick={() => sendAction("CANCEL_ACTIVE_ACTION")} type="button" variant="ghost">
              <XCircle className="size-4" />
              Anuluj
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard label="Połączenie" value={state?.isConnected ? "Połączono" : "Rozłączono"} active={Boolean(state?.isConnected)} />
        <StatusCard label="Monitoring" value={state?.automationEnabled ? "Włączony" : "Wyłączony"} active={Boolean(state?.automationEnabled)} />
        <StatusCard label="Oferty do odświeżenia" value={String(refreshableCount)} active={refreshableCount > 0} />
        <StatusCard label="Cooldown" value={formatCooldown(state?.actionQueue.cooldownUntil)} active={Boolean(state?.actionQueue.cooldownUntil)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Kolejka odświeżania</h2>
            <Badge variant={state?.actionQueue.activeJob ? "warning" : "muted"}>{state?.actionQueue.activeJob ? "Aktywna" : "Pusta"}</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {state?.actionQueue.activeJob ? (
              <QueueRow
                detail={state.actionQueue.activeJob.scheduledFor ? `Zaplanowano: ${formatDate(state.actionQueue.activeJob.scheduledFor)}` : state.actionQueue.activeJob.error}
                status={state.actionQueue.activeJob.status}
                title={state.actionQueue.activeJob.listingTitle}
              />
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">Brak aktywnej akcji. Kliknij „Odśwież 1 ofertę”, gdy parser wykryje przycisk odświeżania.</p>
            )}
            {state?.actionQueue.pending.map((job) => (
              <QueueRow detail="Oczekuje na wykonanie" key={job.id} status={job.status} title={job.listingTitle} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Bezpieczeństwo</h2>
          </div>
          <div className="mt-5 grid gap-3">
            <SafetyItem label="Kolejka wykonuje tylko jedną akcję naraz" ready />
            <SafetyItem label="Losowe opóźnienia jak u człowieka" ready />
            <SafetyItem label="Cooldown po odświeżeniu" ready />
            <SafetyItem label="Płatności i pakiety" ready={false} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <TimerReset className="size-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Realne logi rozszerzenia</h2>
        </div>
        <div className="mt-5 space-y-3">
          {state?.logs.length ? (
            state.logs.slice(0, 8).map((log) => (
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={log.id}>
                <div>
                  <p className="text-sm font-medium text-white">{log.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                </div>
                <Badge variant={log.level === "error" ? "warning" : log.level === "warning" ? "warning" : "muted"}>{log.level}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Brak logów. Uruchom skanowanie albo odświeżenie oferty.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatusCard({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      <Badge className="mt-4" variant={active ? "success" : "muted"}>
        {active ? "Aktywne" : "Oczekuje"}
      </Badge>
    </Card>
  );
}

function QueueRow({ title, status, detail }: { title: string; status: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">{title}</p>
        <Badge variant={status === "failed" ? "warning" : status === "succeeded" ? "success" : "muted"}>{status}</Badge>
      </div>
      {detail ? <p className="mt-2 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function SafetyItem({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-sm text-white">{label}</span>
      <Badge variant={ready ? "success" : "muted"}>{ready ? "Działa" : "Później"}</Badge>
    </div>
  );
}

function formatCooldown(value?: string) {
  if (!value) {
    return "Brak";
  }

  const seconds = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
  return seconds > 0 ? `${seconds}s` : "Brak";
}

function formatDate(value?: string) {
  if (!value) {
    return "brak";
  }

  return new Intl.DateTimeFormat("pl", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
