"use client";

import { AlertCircle, CheckCircle2, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ParsedListing = {
  id: string;
  title: string;
  priceText?: string;
  url: string;
  status: "active" | "reserved" | "sold" | "hidden" | "unknown";
  imageUrl?: string;
  hasRefreshButton: boolean;
  parsedAt: string;
};

type ParserHealth = {
  status: "idle" | "scanning" | "healthy" | "degraded" | "error";
  listingsFound: number;
  retries: number;
  lastRunAt?: string;
  scanDurationMs?: number;
  selectorCounters?: Record<string, number>;
  domHealth?: {
    anchorsFound: number;
    imageCardsFound: number;
    visibleCandidates: number;
    documentReadyState?: string;
    bodyTextLength: number;
  };
  error?: string;
};

type ExtensionStateResponse = {
  ok: boolean;
  data?: {
    isConnected: boolean;
    parsedListings: ParsedListing[];
    parserHealth: ParserHealth;
    actionQueue: {
      activeJob: {
        id: string;
        listingId: string;
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
    vinted: {
      isOnVinted: boolean;
      hostname?: string;
    };
  };
  error?: string;
};

export function ParsedListingsPanel() {
  const [status, setStatus] = useState<"checking" | "ready" | "missing" | "error">("checking");
  const [extensionState, setExtensionState] = useState<ExtensionStateResponse["data"] | null>(null);
  const [message, setMessage] = useState("Sprawdzam połączenie z rozszerzeniem...");
  const [relistDraft, setRelistDraft] = useState<ParsedListing | null>(null);

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
          setMessage("Nie wykryto rozszerzenia. Załaduj extension/dist w Chrome i odśwież stronę.");
          return "missing";
        }

        return currentStatus;
      });
    }, 1800);

    const interval = window.setInterval(requestState, 6000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  function requestState() {
    window.postMessage({ source: "vintedflow-dashboard", type: "GET_EXTENSION_STATE" }, window.location.origin);
  }

  function requestRefresh(listingId: string) {
    window.postMessage(
      {
        source: "vintedflow-dashboard",
        type: "REQUEST_REFRESH_LISTING",
        payload: { listingId }
      },
      window.location.origin
    );
  }

  function cancelAction() {
    window.postMessage({ source: "vintedflow-dashboard", type: "CANCEL_ACTIVE_ACTION" }, window.location.origin);
  }

  function manualScan() {
    window.postMessage({ source: "vintedflow-dashboard", type: "MANUAL_SCAN" }, window.location.origin);
  }

  async function prepareRelistDraft(listing: ParsedListing) {
    setRelistDraft(listing);
    const draftText = [
      "Draft ponownego wystawienia VintedFlow",
      `Tytuł: ${listing.title}`,
      `Cena: ${listing.priceText ?? "uzupełnij ręcznie"}`,
      `Link źródłowy: ${listing.url}`,
      "",
      "Checklist:",
      "1. Sprawdź zdjęcia i opis.",
      "2. Usuń starą ofertę ręcznie, jeśli chcesz ją zastąpić.",
      "3. Wklej dane do nowego formularza Vinted.",
      "4. Opublikuj ręcznie po sprawdzeniu zgodności z Vinted."
    ].join("\n");

    await navigator.clipboard?.writeText(draftText);
    setMessage("Przygotowano draft i skopiowano dane do schowka. Otwórz formularz Vinted i wklej dane ręcznie.");
  }

  function handleResponse(response?: ExtensionStateResponse) {
    if (!response?.ok) {
      setStatus("error");
      setMessage(response?.error ?? "Nie udało się pobrać danych z rozszerzenia.");
      return;
    }

    setStatus("ready");
    setExtensionState(response.data ?? null);
    setMessage("Rozszerzenie online. Dane ofert są pobierane tylko z DOM strony Vinted.");
  }

  const listings = extensionState?.parsedListings ?? [];
  const health = extensionState?.parserHealth;

  return (
    <Card className="mb-4 overflow-hidden p-0">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {status === "ready" ? <CheckCircle2 className="size-5 text-primary" /> : <AlertCircle className="size-5 text-amber-300" />}
            <h2 className="text-lg font-semibold text-white">Oferty wykryte przez rozszerzenie</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={health?.status === "healthy" ? "success" : health?.status === "error" ? "warning" : "muted"}>
            Parser: {health?.status ?? "brak danych"}
          </Badge>
          <Badge variant={extensionState?.vinted.isOnVinted ? "success" : "muted"}>
            Vinted: {extensionState?.vinted.isOnVinted ? "wykryto" : "oczekuje"}
          </Badge>
          <Badge variant={extensionState?.actionQueue.activeJob ? "warning" : "muted"}>
            Akcja: {extensionState?.actionQueue.activeJob?.status ?? "brak"}
          </Badge>
          <Button onClick={requestState} size="sm" type="button" variant="secondary">
            <RefreshCw className="size-4" />
            Odśwież
          </Button>
          <Button onClick={manualScan} size="sm" type="button" variant="secondary">
            Skanuj DOM
          </Button>
          <Button disabled={!extensionState?.actionQueue.activeJob} onClick={cancelAction} size="sm" type="button" variant="ghost">
            Anuluj akcję
          </Button>
        </div>
      </div>

      {extensionState?.actionQueue.activeJob || extensionState?.actionQueue.cooldownUntil ? (
        <div className="border-b border-white/10 p-5 text-sm text-muted-foreground">
          {extensionState.actionQueue.activeJob ? (
            <span>
              Trwa akcja: {extensionState.actionQueue.activeJob.status} · {extensionState.actionQueue.activeJob.listingTitle}
            </span>
          ) : (
            <span>Cooldown odświeżania: {formatCooldown(extensionState.actionQueue.cooldownUntil)}</span>
          )}
        </div>
      ) : null}

      {health ? (
        <div className="grid gap-3 border-b border-white/10 p-5 text-sm text-muted-foreground md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Czas skanu</p>
            <p className="mt-1 font-semibold text-white">{health.scanDurationMs ?? 0} ms</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Linki ofert</p>
            <p className="mt-1 font-semibold text-white">{health.domHealth?.anchorsFound ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Widoczne karty</p>
            <p className="mt-1 font-semibold text-white">{health.domHealth?.visibleCandidates ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Karty z obrazami</p>
            <p className="mt-1 font-semibold text-white">{health.domHealth?.imageCardsFound ?? 0}</p>
          </div>
          <div className="md:col-span-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Najlepsze selektory</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(health.selectorCounters ?? {})
                .filter(([, count]) => count > 0)
                .slice(0, 8)
                .map(([selector, count]) => (
                  <Badge key={selector} variant="muted">
                    {selector}: {count}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      ) : null}

      {relistDraft ? (
        <div className="border-b border-white/10 bg-primary/[0.04] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              {relistDraft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Remote Vinted thumbnails come from extension parser.
                <img alt="" className="size-16 rounded-2xl object-cover" src={relistDraft.imageUrl} />
              ) : (
                <div className="size-16 rounded-2xl bg-primary/10" />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Asystent ponownego wystawienia</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{relistDraft.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{relistDraft.priceText ?? "Cena do uzupełnienia ręcznie"}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  To jest bezpieczny draft. VintedFlow nie usuwa i nie publikuje ogłoszenia automatycznie. Skopiowane dane
                  możesz wkleić do oficjalnego formularza Vinted i zatwierdzić ręcznie.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void prepareRelistDraft(relistDraft)} size="sm" type="button" variant="secondary">
                <Copy className="size-4" />
                Kopiuj draft
              </Button>
              <ButtonLink href="https://www.vinted.pl/items/new" size="sm" target="_blank" variant="secondary">
                <ExternalLink className="size-4" />
                Otwórz formularz Vinted
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}

      {listings.length ? (
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <a
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-primary/30 hover:bg-primary/10"
              href={listing.url}
              key={listing.id}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex gap-3">
                {listing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Remote Vinted thumbnails come from the extension parser, not Next image config.
                  <img alt="" className="size-16 rounded-2xl object-cover" src={listing.imageUrl} />
                ) : (
                  <div className="size-16 rounded-2xl bg-primary/10" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{listing.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{listing.priceText ?? "Brak ceny"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={listing.status === "active" ? "success" : "muted"}>{listing.status}</Badge>
                    <Badge variant={listing.hasRefreshButton ? "default" : "muted"}>
                      Odświeżanie: {listing.hasRefreshButton ? "tak" : "nie"}
                    </Badge>
                  </div>
                  <button
                    className="mt-3 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!listing.hasRefreshButton || Boolean(extensionState?.actionQueue.activeJob) || isCooldownActive(extensionState?.actionQueue.cooldownUntil)}
                    onClick={(event) => {
                      event.preventDefault();
                      requestRefresh(listing.id);
                    }}
                    type="button"
                  >
                    Odśwież tę ofertę
                  </button>
                  <button
                    className="ml-2 mt-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                    onClick={(event) => {
                      event.preventDefault();
                      void prepareRelistDraft(listing);
                    }}
                    type="button"
                  >
                    Przygotuj draft
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-5 text-sm leading-6 text-muted-foreground">
          Brak sparsowanych ofert. Otwórz stronę Vinted z listą ofert w tej samej przeglądarce i poczekaj na synchronizację.
        </div>
      )}
    </Card>
  );
}

function isCooldownActive(value?: string) {
  return Boolean(value && new Date(value).getTime() > Date.now());
}

function formatCooldown(value?: string) {
  if (!value) {
    return "0s";
  }

  const seconds = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
  return `${seconds}s`;
}
