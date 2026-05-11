import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_URL } from "@/lib/constants";
import { moduleRegistry } from "@/modules/registry";
import type { ExtensionMessage, ExtensionResponse, ExtensionState } from "@/types/extension";

function sendExtensionMessage<T>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  return chrome.runtime.sendMessage(message);
}

export function PopupApp() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshState() {
    setError(null);
    const response = await sendExtensionMessage<ExtensionState>({ type: "GET_STATE" });

    if (!response.ok || !response.data) {
      setError(response.error ?? "Could not load extension state.");
      setIsLoading(false);
      return;
    }

    setState(response.data);
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
    const response = await sendExtensionMessage<ExtensionState>({ type: "SYNC_NOW" });
    setState(response.data ?? null);
    setError(response.error ?? null);
    setIsLoading(false);
  }

  async function handleToggleAutomation() {
    if (!state) {
      return;
    }

    const response = await sendExtensionMessage<ExtensionState>({
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
    await chrome.tabs.create({
      url: `${DASHBOARD_URL}/extension/connect`
    });
  }

  async function disconnect() {
    const response = await sendExtensionMessage<ExtensionState>({ type: "DISCONNECT_SESSION" });
    if (response.data) {
      setState(response.data);
    }
  }

  return (
    <main className="popup-shell">
      <section className="hero-card">
        <div className="brand-row">
          <div className="brand-mark">VF</div>
          <div>
            <p className="eyebrow">VintedFlow</p>
            <h1>Seller control center</h1>
          </div>
        </div>

        <div className={state?.isConnected ? "status-pill connected" : "status-pill"}>
          {state?.isConnected ? "Connected to dashboard" : "Not connected"}
        </div>
      </section>

      {isLoading ? <div className="panel muted">Loading extension state...</div> : null}
      {error ? <div className="panel error">{error}</div> : null}

      <section className="panel">
        <p className="section-title">User session</p>
        {state?.user ? (
          <div className="user-row">
            <div className="avatar">{(state.user.name ?? state.user.email ?? "VF").slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="primary-text">{state.user.name ?? "Vinted seller"}</p>
              <p className="secondary-text">{state.user.email ?? state.user.id}</p>
            </div>
          </div>
        ) : (
          <p className="secondary-text">Connect from the dashboard to synchronize your Supabase session.</p>
        )}
      </section>

      <section className="grid">
        <StatusCard label="Vinted page" value={state?.vinted.isOnVinted ? "Detected" : "Not detected"} tone={state?.vinted.isOnVinted ? "good" : "idle"} />
        <StatusCard label="Sync state" value={state?.sync.status ?? "idle"} tone={state?.sync.status === "error" ? "bad" : "good"} />
        <StatusCard label="Automation" value={state?.automationEnabled ? "Monitoring" : "Paused"} tone={state?.automationEnabled ? "good" : "idle"} />
        <StatusCard label="Modules ready" value={`${readyModules.length}/7`} tone="good" />
      </section>

      <section className="panel">
        <p className="section-title">Quick actions</p>
        <div className="actions">
          <button className="button primary" onClick={openDashboard} type="button">
            Connect dashboard
          </button>
          <button className="button" disabled={!state?.isConnected} onClick={handleSync} type="button">
            Sync now
          </button>
          <button className="button" onClick={handleToggleAutomation} type="button">
            {state?.automationEnabled ? "Pause monitoring" : "Enable monitoring"}
          </button>
          <button className="button danger" disabled={!state?.isConnected} onClick={disconnect} type="button">
            Disconnect
          </button>
        </div>
      </section>

      <section className="panel">
        <p className="section-title">Future modules</p>
        <div className="module-list">
          {moduleRegistry.map((module) => (
            <div className="module-row" key={module.id}>
              <div>
                <p className="primary-text">{module.label}</p>
                <p className="secondary-text">{module.description}</p>
              </div>
              <span className="module-badge">{state?.modules[module.id] ?? "planned"}</span>
            </div>
          ))}
        </div>
      </section>

      <footer>
        Safe MVP: no aggressive automation is executed.
      </footer>
    </main>
  );
}

function StatusCard({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" | "idle" }) {
  return (
    <div className="status-card">
      <p>{label}</p>
      <span className={tone}>{value}</span>
    </div>
  );
}
