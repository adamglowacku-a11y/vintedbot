import { DASHBOARD_URL } from "@/lib/constants";
import type { ExtensionMessage, ExtensionResponse, ExtensionState } from "@/types/extension";

type WidgetController = {
  scanNow: () => void;
  schedule: (reason: string) => void;
};

const WIDGET_ID = "vintedflow-page-widget";
const PROFILE_PATH_PATTERN = /\/(member|members|profile)\//i;

export function mountVintedFlowWidget(controller: WidgetController) {
  if (document.getElementById(WIDGET_ID)) {
    return;
  }

  const root = document.createElement("div");
  root.id = WIDGET_ID;
  root.innerHTML = createWidgetMarkup();
  document.documentElement.appendChild(root);
  injectWidgetStyles();

  const launcher = root.querySelector<HTMLButtonElement>("[data-vf-launcher]");
  const panel = root.querySelector<HTMLElement>("[data-vf-panel]");
  const close = root.querySelector<HTMLButtonElement>("[data-vf-close]");
  const scan = root.querySelector<HTMLButtonElement>("[data-vf-scan]");
  const connect = root.querySelector<HTMLButtonElement>("[data-vf-connect]");

  launcher?.addEventListener("click", () => {
    panel?.classList.toggle("is-open");
    void refreshWidgetState(root);
  });

  close?.addEventListener("click", () => {
    panel?.classList.remove("is-open");
  });

  scan?.addEventListener("click", () => {
    controller.scanNow();
    controller.schedule("widget-manual-scan");
    window.setTimeout(() => void refreshWidgetState(root), 900);
  });

  connect?.addEventListener("click", () => {
    window.open(`${DASHBOARD_URL}/extension/connect`, "_blank", "noopener,noreferrer");
  });

  window.setInterval(() => {
    updateVisibility(root);
    void refreshWidgetState(root);
  }, 3500);

  updateVisibility(root);
  void refreshWidgetState(root);
}

function updateVisibility(root: HTMLElement) {
  root.dataset.visible = PROFILE_PATH_PATTERN.test(window.location.pathname) ? "true" : "false";
}

async function refreshWidgetState(root: HTMLElement) {
  const response = await sendWidgetMessage({ type: "GET_STATE" });
  const state = response.data;

  setText(root, "vf-status", state?.isConnected ? "Połączono" : "Nie połączono");
  setText(root, "vf-listings", String(state?.parsedListings.length ?? 0));
  setText(root, "vf-parser", state?.parserHealth.status ?? "idle");
  setText(root, "vf-vinted", state?.vinted.isOnVinted ? "Wykryto" : "Oczekuje");
  setText(root, "vf-sync", state?.sync.status ?? "idle");
}

function setText(root: HTMLElement, key: string, value: string) {
  const element = root.querySelector(`[data-${key}]`);

  if (element) {
    element.textContent = value;
  }
}

function sendWidgetMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response: ExtensionResponse<ExtensionState> | undefined) => {
        const runtimeError = chrome.runtime.lastError;

        if (runtimeError) {
          resolve({ ok: false, error: runtimeError.message });
          return;
        }

        resolve(response ?? { ok: false, error: "Brak odpowiedzi service workera." });
      });
    } catch (error) {
      resolve({
        ok: false,
        error: error instanceof Error ? error.message : "Nie udało się połączyć z rozszerzeniem."
      });
    }
  });
}

function createWidgetMarkup() {
  return `
    <button aria-label="Otwórz VintedFlow" class="vf-launcher" data-vf-launcher type="button">
      ${logoSvg()}
    </button>
    <section aria-label="VintedFlow" class="vf-panel" data-vf-panel>
      <div class="vf-panel-header">
        <div class="vf-logo">${logoSvg()}</div>
        <div>
          <p>VintedFlow</p>
          <strong>Panel profilu</strong>
        </div>
        <button aria-label="Zamknij" data-vf-close type="button">×</button>
      </div>
      <div class="vf-grid">
        <span>Status <strong data-vf-status>...</strong></span>
        <span>Vinted <strong data-vf-vinted>...</strong></span>
        <span>Oferty <strong data-vf-listings>0</strong></span>
        <span>Parser <strong data-vf-parser>idle</strong></span>
      </div>
      <p class="vf-muted">Panel zostaje na stronie profilu i nie zamyka się przy pracy z kartą Vinted.</p>
      <div class="vf-actions">
        <button data-vf-scan type="button">Skanuj profil</button>
        <button data-vf-connect type="button">Połącz dashboard</button>
      </div>
      <p class="vf-sync">Sync: <strong data-vf-sync>idle</strong></p>
    </section>
  `;
}

function injectWidgetStyles() {
  if (document.getElementById("vintedflow-page-widget-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vintedflow-page-widget-styles";
  style.textContent = `
    #${WIDGET_ID}[data-visible="false"] { display: none; }
    #${WIDGET_ID}, #${WIDGET_ID} * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    #${WIDGET_ID} .vf-launcher {
      position: fixed; right: 18px; top: 42%; z-index: 2147483646; display: grid; width: 58px; height: 58px;
      place-items: center; border: 1px solid rgba(255,255,255,.55); border-radius: 999px; background: #27d2c4;
      color: white; cursor: pointer; box-shadow: 0 18px 60px rgba(0,0,0,.28), 0 0 0 8px rgba(39,210,196,.16);
    }
    #${WIDGET_ID} .vf-launcher svg { width: 31px; height: 31px; }
    #${WIDGET_ID} .vf-panel {
      position: fixed; right: 88px; top: 34%; z-index: 2147483646; width: 330px; padding: 16px; border: 1px solid rgba(255,255,255,.12);
      border-radius: 24px; background: linear-gradient(180deg, rgba(10,16,30,.96), rgba(6,10,20,.94)); color: #f8fafc;
      box-shadow: 0 24px 90px rgba(0,0,0,.4); backdrop-filter: blur(22px); opacity: 0; pointer-events: none; transform: translateX(12px) scale(.98);
      transition: opacity .18s ease, transform .18s ease;
    }
    #${WIDGET_ID} .vf-panel.is-open { opacity: 1; pointer-events: auto; transform: translateX(0) scale(1); }
    #${WIDGET_ID} .vf-panel-header { display: flex; align-items: center; gap: 11px; }
    #${WIDGET_ID} .vf-logo { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 999px; background: #27d2c4; color: white; }
    #${WIDGET_ID} .vf-logo svg { width: 24px; height: 24px; }
    #${WIDGET_ID} p { margin: 0; }
    #${WIDGET_ID} .vf-panel-header p { color: #2dd4bf; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    #${WIDGET_ID} .vf-panel-header strong { display: block; margin-top: 2px; color: white; font-size: 16px; }
    #${WIDGET_ID} [data-vf-close] { margin-left: auto; border: 0; background: transparent; color: #94a3b8; font-size: 24px; cursor: pointer; }
    #${WIDGET_ID} .vf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 14px; }
    #${WIDGET_ID} .vf-grid span { border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: rgba(255,255,255,.045); padding: 10px; color: #94a3b8; font-size: 11px; }
    #${WIDGET_ID} .vf-grid strong { display: block; margin-top: 5px; color: #f8fafc; font-size: 13px; }
    #${WIDGET_ID} .vf-muted { margin-top: 12px; color: #94a3b8; font-size: 12px; line-height: 1.55; }
    #${WIDGET_ID} .vf-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
    #${WIDGET_ID} .vf-actions button { min-height: 36px; border: 1px solid rgba(45,212,191,.22); border-radius: 999px; background: rgba(45,212,191,.12); color: #5eead4; cursor: pointer; font-size: 12px; font-weight: 800; }
    #${WIDGET_ID} .vf-actions button:first-child { background: #2dd4bf; color: #07111f; }
    #${WIDGET_ID} .vf-sync { margin-top: 10px; color: #64748b; font-size: 11px; }
  `;
  document.documentElement.appendChild(style);
}

function logoSvg() {
  return `
    <svg fill="none" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3.5c1.5 6.1 4.4 9 10.5 10.5-6.1 1.5-9 4.4-10.5 10.5C14.5 18.4 11.6 15.5 5.5 14 11.6 12.5 14.5 9.6 16 3.5Z" stroke="currentColor" stroke-width="2.7" stroke-linejoin="round"/>
      <path d="M24.5 4.5c.7 2.8 2.1 4.2 5 5-2.9.8-4.3 2.2-5 5-.8-2.8-2.2-4.2-5-5 2.8-.8 4.2-2.2 5-5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `;
}
