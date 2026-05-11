import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_URL, DEFAULT_STATE } from "@/lib/constants";
import { languageLabels, messages } from "@/lib/i18n";
import { moduleRegistry } from "@/modules/registry";
import { sendPopupMessage } from "@/popup/safe-runtime";
import type { ExtensionState, SupportedLocale } from "@/types/extension";

export function PopupApp() {
  const [state, setState] = useState<ExtensionState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = state.locale ?? "pl";
  const t = messages[locale];

  async function refreshState() {
    setError(null);
    const response = await sendPopupMessage({ type: "GET_STATE" });

    setState(response.data ?? DEFAULT_STATE);
    setError(response.ok ? null : (response.error ?? "Nie udało się załadować stanu rozszerzenia."));
    setIsLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshState();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const readyModules = useMemo(() => {
    if (!state) {
      return [];
    }

    return moduleRegistry.filter((module) => state.modules[module.id] === "ready");
  }, [state]);

  async function handleSync() {
    setIsLoading(true);
    const response = await sendPopupMessage({ type: "SYNC_NOW" });
    setState(response.data ?? DEFAULT_STATE);
    setError(response.error ?? null);
    setIsLoading(false);
  }

  async function handleToggleAutomation() {
    if (!state) {
      return;
    }

    const response = await sendPopupMessage({
      type: "TOGGLE_AUTOMATION",
      payload: {
        enabled: !state.automationEnabled
      }
    });

    if (response.data) {
      setState(response.data);
    }
  }

  async function openDashboard() {
    try {
      await chrome.tabs.create({
        url: `${DASHBOARD_URL}/extension/connect`
      });
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Nie udało się otworzyć dashboardu.");
    }
  }

  async function disconnect() {
    const response = await sendPopupMessage({ type: "DISCONNECT_SESSION" });
    if (response.data) {
      setState(response.data);
    }
  }

  async function requestRefresh(listingId: string) {
    setIsLoading(true);
    const response = await sendPopupMessage({
      type: "REQUEST_REFRESH_LISTING",
      payload: { listingId }
    });
    setState(response.data ?? state);
    setError(response.error ?? null);
    setIsLoading(false);
  }

  async function cancelAction() {
    const response = await sendPopupMessage({ type: "CANCEL_ACTIVE_ACTION" });
    if (response.data) {
      setState(response.data);
    }
  }

  async function manualScan() {
    setIsLoading(true);
    const response = await sendPopupMessage({ type: "MANUAL_SCAN" });
    if (response.data) {
      setState(response.data);
    }
    setError(response.error ?? null);
    setIsLoading(false);
  }

  async function changeLocale(nextLocale: SupportedLocale) {
    const response = await sendPopupMessage({
      type: "SET_LOCALE",
      payload: {
        locale: nextLocale
      }
    });

    if (response.data) {
      setState(response.data);
    }
  }

  return (
    <main className="popup-shell">
      <section className="hero-card">
        <div className="brand-row">
          <div className="brand-mark">
            <LogoMark />
          </div>
          <div>
            <p className="eyebrow">VintedFlow</p>
            <h1>{t.title}</h1>
          </div>
        </div>

        <div className={state?.isConnected ? "status-pill connected" : "status-pill"}>
          {state?.isConnected ? t.connected : t.notConnected}
        </div>
      </section>

      {isLoading ? (
        <div className="panel muted">
          <p>{t.loading}</p>
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}
      {error ? <div className="panel error">{error}</div> : null}

      <section className="panel">
        <div className="section-header">
          <p className="section-title">{t.session}</p>
          <label className="locale-picker">
            {t.language}
            <select onChange={(event) => void changeLocale(event.target.value as SupportedLocale)} value={locale}>
              {Object.entries(languageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {state?.user ? (
          <div className="user-row">
            <div className="avatar">{(state.user.name ?? state.user.email ?? "VF").slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="primary-text">{state.user.name ?? "Vinted seller"}</p>
              <p className="secondary-text">{state.user.email ?? state.user.id}</p>
            </div>
          </div>
        ) : (
          <p className="secondary-text">{t.connectHint}</p>
        )}
      </section>

      <section className="grid">
        <StatusCard label={t.vintedPage} value={state?.vinted.isOnVinted ? t.detected : t.notDetected} tone={state?.vinted.isOnVinted ? "good" : "idle"} />
        <StatusCard
          label={t.syncState}
          value={state?.sync.status ?? "idle"}
          tone={state?.sync.status === "error" || state?.sync.status === "expired" ? "bad" : "good"}
        />
        <StatusCard
          label={t.parserHealth}
          value={state?.parserHealth.status ?? "idle"}
          tone={state?.parserHealth.status === "error" ? "bad" : state?.parserHealth.status === "healthy" ? "good" : "idle"}
        />
        <StatusCard label={t.parsedListings} value={`${state?.parsedListings.length ?? 0}`} tone="good" />
      </section>

      <section className="panel">
        <div className="section-header">
          <p className="section-title">{t.actionStatus}</p>
          {state?.actionQueue.activeJob ? (
            <button className="mini-button" onClick={cancelAction} type="button">
              {t.cancel}
            </button>
          ) : null}
        </div>
        <p className="secondary-text">
          {state?.actionQueue.activeJob
            ? `${state.actionQueue.activeJob.status}: ${state.actionQueue.activeJob.listingTitle}`
            : state?.actionQueue.cooldownUntil
              ? `${t.cooldown}: ${formatCooldown(state.actionQueue.cooldownUntil)}`
              : "Brak aktywnej akcji."}
        </p>
      </section>

      <section className="panel">
        <p className="section-title">{t.quickActions}</p>
        <div className="actions">
          <button className="button primary" onClick={openDashboard} type="button">
            {t.connectDashboard}
          </button>
          <button className="button" disabled={!state?.isConnected} onClick={handleSync} type="button">
            {t.syncNow}
          </button>
          <button className="button" onClick={manualScan} type="button">
            Skanuj DOM
          </button>
          <button className="button" onClick={handleToggleAutomation} type="button">
            {state?.automationEnabled ? t.paused : t.monitoring}
          </button>
          <button className="button danger" disabled={!state?.isConnected} onClick={disconnect} type="button">
            {t.disconnect}
          </button>
        </div>
      </section>

      <section className="panel">
        <p className="section-title">{t.parsedListings}</p>
        {state?.parsedListings.length ? (
          <div className="listing-list">
            {state.parsedListings.slice(0, 6).map((listing) => (
              <div className="listing-row" key={listing.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Extension popup cannot use Next Image; these are remote Vinted thumbnails. */}
                {listing.imageUrl ? <img alt="" src={listing.imageUrl} /> : <div className="listing-placeholder" />}
                <div>
                  <p className="primary-text">{listing.title}</p>
                  <p className="secondary-text">
                    {t.price}: {listing.priceText ?? "-"} · {t.status}: {listing.status}
                  </p>
                  <p className="secondary-text">
                    ID {listing.id} · {t.refreshButton}: {listing.hasRefreshButton ? t.yes : t.no}
                  </p>
                  <button
                    className="mini-button"
                    disabled={!listing.hasRefreshButton || Boolean(state.actionQueue.activeJob) || isCooldownActive(state.actionQueue.cooldownUntil)}
                    onClick={() => void requestRefresh(listing.id)}
                    type="button"
                  >
                    {t.refreshOne}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="secondary-text">{t.noListings}</p>
        )}
      </section>

      <section className="panel">
        <p className="section-title">{t.parserHealth}</p>
        <div className="diagnostics-grid">
          <span>czas: {state.parserHealth.scanDurationMs ?? 0}ms</span>
          <span>linki: {state.parserHealth.domHealth?.anchorsFound ?? 0}</span>
          <span>widoczne: {state.parserHealth.domHealth?.visibleCandidates ?? 0}</span>
          <span>obrazy: {state.parserHealth.domHealth?.imageCardsFound ?? 0}</span>
        </div>
        <div className="selector-counters">
          {Object.entries(state.parserHealth.selectorCounters ?? {})
            .filter(([, count]) => count > 0)
            .slice(0, 4)
            .map(([selector, count]) => (
              <p className="secondary-text" key={selector}>
                {selector}: {count}
              </p>
            ))}
        </div>
        <div className="module-list">
          {state?.parserHealth.logs.slice(0, 3).map((log) => (
            <div className="module-row" key={log.id}>
              <div>
                <p className="primary-text">{log.message}</p>
                <p className="secondary-text">{new Date(log.createdAt).toLocaleTimeString()}</p>
              </div>
              <span className="module-badge">{log.level}</span>
            </div>
          ))}
        </div>
      </section>

      <footer>
        {t.readOnly} · {readyModules.length}/7
      </footer>
    </main>
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

function StatusCard({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" | "idle" }) {
  return (
    <div className="status-card">
      <p>{label}</p>
      <span className={tone}>{value}</span>
    </div>
  );
}

function LogoMark() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path
        d="M16 3.5c1.5 6.1 4.4 9 10.5 10.5-6.1 1.5-9 4.4-10.5 10.5C14.5 18.4 11.6 15.5 5.5 14 11.6 12.5 14.5 9.6 16 3.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.7"
      />
      <path
        d="M24.5 4.5c.7 2.8 2.1 4.2 5 5-2.9.8-4.3 2.2-5 5-.8-2.8-2.2-4.2-5-5 2.8-.8 4.2-2.2 5-5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
