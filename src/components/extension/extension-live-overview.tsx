"use client";

import { AlertCircle, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExtensionStateResponse = {
  ok: boolean;
  data?: {
    isConnected: boolean;
    parsedListings: Array<{
      id: string;
      title: string;
      hasRefreshButton: boolean;
      parsedAt: string;
    }>;
    parserHealth: {
      status: "idle" | "scanning" | "healthy" | "degraded" | "error";
      listingsFound: number;
      lastRunAt?: string;
      scanDurationMs?: number;
      error?: string;
    };
    actionQueue: {
      activeJob: {
        listingTitle: string;
        status: string;
        error?: string;
      } | null;
      cooldownUntil?: string;
      history: Array<{
        id: string;
        listingTitle: string;
        status: string;
        completedAt?: string;
        error?: string;
      }>;
    };
    sync: {
      status: string;
      lastSyncedAt?: string;
      error?: string;
    };
    vinted: {
      isOnVinted: boolean;
      hostname?: string;
    };
  };
  error?: string;
};

export function ExtensionLiveOverview() {
  const [state, setState] = useState<ExtensionStateResponse["data"] | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "missing" | "error">("checking");
  const [message, setMessage] = useState("Sprawdzam realny stan rozszerzenia...");

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

    const timeout = window.setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === "checking") {
          setMessage("Nie wykryto rozszerzenia. Otwórz Vinted w tej samej przeglądarce i załaduj extension/dist.");
          return "missing";
        }

        return currentStatus;
      });
    }, 2200);

    const interval = window.setInterval(requestState, 7000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  function requestState() {
    window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
  }

  function manualScan() {
    setMessage("Uruchamiam ręczne skanowanie Vinted...");
    window.postMessage({ source: "vintedflow-dashboard", type: "MANUAL_SCAN" }, window.location.origin);
  }

  function handleResponse(response?: ExtensionStateResponse) {
    if (!response?.ok) {
      setStatus("error");
      setMessage(response?.error ?? "Nie udało się pobrać realnego stanu rozszerzenia.");
      return;
    }

    setState(response.data ?? null);
    setStatus("ready");
    setMessage("Dashboard pokazuje realny stan rozszerzenia, parsera i kolejki odświeżania.");
  }

  const refreshableListings = state?.parsedListings.filter((listing) => listing.hasRefreshButton).length ?? 0;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            {status === "ready" ? <CheckCircle2 className="mt-1 size-5 text-primary" /> : <AlertCircle className="mt-1 size-5 text-amber-300" />}
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Realne dane z rozszerzenia</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={requestState} size="sm" type="button" variant="secondary">
              <RefreshCw className="size-4" />
              Odśwież status
            </Button>
            <Button onClick={manualScan} size="sm" type="button">
              Skanuj Vinted
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LiveMetric
          icon={ShieldCheck}
          label="Połączenie"
          tone={state?.isConnected ? "success" : "warning"}
          value={state?.isConnected ? "Połączono" : "Rozłączono"}
        />
        <LiveMetric
          icon={RefreshCw}
          label="Aktywne oferty"
          tone={(state?.parsedListings.length ?? 0) > 0 ? "success" : "muted"}
          value={String(state?.parsedListings.length ?? 0)}
        />
        <LiveMetric
          icon={CheckCircle2}
          label="Można odświeżyć"
          tone={refreshableListings > 0 ? "success" : "muted"}
          value={String(refreshableListings)}
        />
        <LiveMetric
          icon={Clock3}
          label="Kolejka"
          tone={state?.actionQueue.activeJob ? "warning" : "muted"}
          value={state?.actionQueue.activeJob?.status ?? "Brak akcji"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Stan parsera i Vinted</h2>
            <Badge variant={state?.parserHealth.status === "healthy" ? "success" : "muted"}>
              {state?.parserHealth.status ?? "brak danych"}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Vinted" value={state?.vinted.isOnVinted ? state.vinted.hostname ?? "wykryto" : "nie wykryto"} />
            <InfoTile label="Ostatni skan" value={formatDate(state?.parserHealth.lastRunAt)} />
            <InfoTile label="Czas skanu" value={`${state?.parserHealth.scanDurationMs ?? 0} ms`} />
            <InfoTile label="Sync" value={state?.sync.status ?? "brak"} />
          </div>
          {state?.parserHealth.error || state?.sync.error ? (
            <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
              {state.parserHealth.error ?? state.sync.error}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Historia odświeżeń</h2>
          <div className="mt-5 space-y-3">
            {state?.actionQueue.history.length ? (
              state.actionQueue.history.slice(0, 5).map((job) => (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={job.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">{job.listingTitle}</p>
                    <Badge variant={job.status === "succeeded" ? "success" : job.status === "failed" ? "warning" : "muted"}>{job.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(job.completedAt)}</p>
                  {job.error ? <p className="mt-2 text-xs text-amber-200">{job.error}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Brak historii. Po kliknięciu „Odśwież tę ofertę” na stronie ofert pojawią się tutaj realne wyniki akcji.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LiveMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  tone: "success" | "warning" | "muted";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <Badge variant={tone}>{label}</Badge>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
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
