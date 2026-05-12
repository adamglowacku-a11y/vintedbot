import type { ExtensionMessage, ExtensionState, VintedDetectionState } from "@/types/extension";
import { startParserObserver } from "@/parser/observer";
import { executeRefreshClick } from "@/content/refresh-executor";
import type { VintedContentMessage } from "@/types/extension";
import { mountVintedFlowWidget } from "@/content/vinted-widget";

const VINTED_HOST_PATTERN = /(^|\.)vinted\.(com|pl|fr|de|it|es|nl|be|co\.uk)$/i;
const STATE_STORAGE_KEY = "vintedflow:state";

function getDetectionState(): VintedDetectionState {
  return {
    isOnVinted: VINTED_HOST_PATTERN.test(window.location.hostname),
    url: window.location.href,
    hostname: window.location.hostname,
    detectedAt: new Date().toISOString()
  };
}

async function publishDetectionState() {
  const message: ExtensionMessage = {
    type: "VINTED_PAGE_STATUS",
    payload: getDetectionState()
  };

  await safeRuntimeSend(message);
}

void publishDetectionState();
const parserObserver = startParserObserver();
mountVintedFlowWidget(parserObserver);

let lastUrl = window.location.href;

const observer = new MutationObserver(() => {
  if (window.location.href === lastUrl) {
    return;
  }

  lastUrl = window.location.href;
  void publishDetectionState();
  parserObserver.scanNow();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

window.addEventListener("focus", () => {
  void publishDetectionState();
  parserObserver.schedule("focus-rescan");
});

chrome.runtime.onMessage.addListener((message: VintedContentMessage, _sender, sendResponse) => {
  if (message.type === "SCAN_NOW") {
    parserObserver
      .scanNow()
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Nie udało się przeskanować strony Vinted."
        });
      });
    return true;
  }

  if (message.type === "EXECUTE_REFRESH_CLICK") {
    executeRefreshClick(message.payload.listingId, message.payload.delayMs)
      .then((result) => {
        parserObserver.scanNow();
        sendResponse(result);
      })
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Nieznany błąd odświeżania."
        });
      });

    return true;
  }

  return false;
});

async function safeRuntimeSend(message: ExtensionMessage) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await sendRuntimeMessage(message);

    if (response.ok) {
      return;
    }

    if (attempt === 2) {
      await persistContentMessageFallback(message);
      console.warn("[VintedFlow content runtime]", response.error ?? "Nie udało się wysłać wiadomości do service workera.");
      return;
    }

    await wait(180 + attempt * 320);
  }
}

function sendRuntimeMessage(message: ExtensionMessage): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve({ ok: false, error: "Service worker content timeout." });
    }, 6500);

    try {
      chrome.runtime.sendMessage(message, (response: { ok?: boolean; error?: string } | undefined) => {
        const runtimeError = chrome.runtime.lastError;
        window.clearTimeout(timeout);

        if (runtimeError) {
          resolve({ ok: false, error: runtimeError.message });
          return;
        }

        resolve({ ok: response?.ok !== false, error: response?.error });
      });
    } catch (error) {
      window.clearTimeout(timeout);
      resolve({
        ok: false,
        error: error instanceof Error ? error.message : "Nie udało się wysłać statusu Vinted."
      });
    }
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function persistContentMessageFallback(message: ExtensionMessage) {
  if (message.type !== "VINTED_PAGE_STATUS") {
    return;
  }

  const currentState = await readStoredState();
  await writeStoredState({
    ...currentState,
    vinted: message.payload
  });
}

function readStoredState(): Promise<ExtensionState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STATE_STORAGE_KEY, (result) => {
      resolve(normalizeStoredState(result[STATE_STORAGE_KEY] as Partial<ExtensionState> | undefined));
    });
  });
}

function writeStoredState(state: ExtensionState) {
  return chrome.storage.local.set({
    [STATE_STORAGE_KEY]: state
  });
}

function normalizeStoredState(state?: Partial<ExtensionState>): ExtensionState {
  const fallback = getDefaultContentState();

  return {
    ...fallback,
    ...state,
    vinted: {
      ...fallback.vinted,
      ...state?.vinted
    },
    parserHealth: {
      ...fallback.parserHealth,
      ...state?.parserHealth,
      logs: state?.parserHealth?.logs ?? fallback.parserHealth.logs
    },
    actionQueue: {
      ...fallback.actionQueue,
      ...state?.actionQueue,
      pending: state?.actionQueue?.pending ?? fallback.actionQueue.pending,
      history: state?.actionQueue?.history ?? fallback.actionQueue.history
    },
    sync: {
      ...fallback.sync,
      ...state?.sync
    },
    modules: {
      ...fallback.modules,
      ...state?.modules
    },
    parsedListings: state?.parsedListings ?? fallback.parsedListings,
    logs: state?.logs ?? fallback.logs,
    locale: state?.locale ?? fallback.locale
  };
}

function getDefaultContentState(): ExtensionState {
  return {
    isConnected: false,
    user: null,
    auth: null,
    vinted: {
      isOnVinted: false
    },
    parsedListings: [],
    parserHealth: {
      status: "idle",
      listingsFound: 0,
      retries: 0,
      selectorVersion: "vinted-card-parser@2",
      selectorCounters: {},
      domHealth: {
        anchorsFound: 0,
        imageCardsFound: 0,
        visibleCandidates: 0,
        bodyTextLength: 0
      },
      logs: []
    },
    actionQueue: {
      activeJob: null,
      pending: [],
      history: [],
      isProcessing: false,
      cooldownSeconds: 90
    },
    locale: "pl",
    sync: {
      status: "idle"
    },
    automationEnabled: false,
    modules: {
      autoRefresh: "planned",
      bulkPriceEditing: "planned",
      autoMessaging: "planned",
      scheduler: "ready",
      queue: "ready",
      logging: "ready",
      antiSpam: "ready"
    },
    logs: []
  };
}
