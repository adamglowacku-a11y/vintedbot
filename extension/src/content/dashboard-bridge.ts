import type { ExtensionMessage, ExtensionResponse, ExtensionState, SupabaseSessionSnapshot } from "@/types/extension";

const DASHBOARD_ORIGINS = [
  "https://vintly.live",
  "https://www.vintly.live",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const STATE_STORAGE_KEY = "vintedflow:state";

type DashboardBridgeMessage =
  | {
      source: "vintedflow-dashboard";
      type: "CONNECT_EXTENSION";
      payload: SupabaseSessionSnapshot;
    }
  | {
      source: "vintedflow-dashboard";
      type: "REQUEST_REFRESH_LISTING";
      payload: { listingId: string };
    }
  | {
      source: "vintedflow-dashboard";
      type: "TOGGLE_AUTOMATION";
      payload: { enabled: boolean };
    }
  | {
      source: "vintedflow-dashboard";
      type:
        | "CHECK_EXTENSION"
        | "GET_EXTENSION_STATE"
        | "SYNC_EXTENSION"
        | "MANUAL_SCAN"
        | "DISCONNECT_EXTENSION"
        | "DASHBOARD_LOGOUT"
        | "CANCEL_ACTIVE_ACTION";
    };

void emitReady(window.location.origin);

window.addEventListener("message", (event: MessageEvent<DashboardBridgeMessage>) => {
  if (!isAllowedDashboardOrigin(event.origin)) {
    return;
  }

  if (event.data?.source !== "vintedflow-dashboard") {
    return;
  }

  if (event.data.type === "CHECK_EXTENSION") {
    void emitReady(event.origin);
    return;
  }

  if (event.data.type === "CONNECT_EXTENSION") {
    void forwardToExtension(
      {
        type: "CONNECT_SESSION",
        payload: event.data.payload
      },
      "CONNECT_EXTENSION_RESULT",
      event.origin
    );
    return;
  }

  if (event.data.type === "GET_EXTENSION_STATE") {
    void forwardToExtension({ type: "GET_STATE" }, "EXTENSION_STATE", event.origin);
    return;
  }

  if (event.data.type === "SYNC_EXTENSION") {
    void forwardToExtension({ type: "SYNC_NOW" }, "EXTENSION_STATE", event.origin);
    return;
  }

  if (event.data.type === "MANUAL_SCAN") {
    void forwardToExtension({ type: "MANUAL_SCAN" }, "EXTENSION_STATE", event.origin);
    return;
  }

  if (event.data.type === "REQUEST_REFRESH_LISTING") {
    void forwardToExtension(
      {
        type: "REQUEST_REFRESH_LISTING",
        payload: event.data.payload
      },
      "EXTENSION_STATE",
      event.origin
    );
    return;
  }

  if (event.data.type === "TOGGLE_AUTOMATION") {
    void forwardToExtension(
      {
        type: "TOGGLE_AUTOMATION",
        payload: event.data.payload
      },
      "EXTENSION_STATE",
      event.origin
    );
    return;
  }

  if (event.data.type === "CANCEL_ACTIVE_ACTION") {
    void forwardToExtension({ type: "CANCEL_ACTIVE_ACTION" }, "EXTENSION_STATE", event.origin);
    return;
  }

  if (event.data.type === "DISCONNECT_EXTENSION") {
    void forwardToExtension({ type: "DISCONNECT_SESSION" }, "EXTENSION_STATE", event.origin);
    return;
  }

  if (event.data.type === "DASHBOARD_LOGOUT") {
    void forwardToExtension({ type: "DASHBOARD_LOGOUT" }, "EXTENSION_STATE", event.origin);
  }
});

function isAllowedDashboardOrigin(origin: string) {
  if (DASHBOARD_ORIGINS.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "vintly.live" ||
      url.hostname === "www.vintly.live" ||
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

async function emitReady(origin: string) {
  const response = await getStoredStateResponse();

  window.postMessage(
    {
      source: "vintedflow-extension",
      type: "EXTENSION_READY",
      payload: response
    },
    origin
  );
}

async function forwardToExtension(message: ExtensionMessage, type: string, origin: string) {
  if (message.type === "GET_STATE" || message.type === "PING") {
    postExtensionResponse(type, await getStoredStateResponse(), origin);
    void refreshRuntimeState(type, origin);
    return;
  }

  const response = await sendRuntimeMessageWithRetry(message);

  if (response.ok) {
    postExtensionResponse(type, response, origin);
    return;
  }

  if (message.type === "CONNECT_SESSION") {
    postExtensionResponse(type, await connectSessionInStorage(message.payload), origin);
    return;
  }

  if (message.type === "DISCONNECT_SESSION" || message.type === "DASHBOARD_LOGOUT") {
    postExtensionResponse(type, await disconnectSessionInStorage(), origin);
    return;
  }

  postExtensionResponse(type, response, origin);
}

async function refreshRuntimeState(type: string, origin: string) {
  const response = await sendRuntimeMessage({ type: "GET_STATE" });

  if (response.ok) {
    postExtensionResponse(type, response, origin);
  }
}

function postExtensionResponse(type: string, payload: ExtensionResponse<ExtensionState>, origin: string) {
  window.postMessage(
    {
      source: "vintedflow-extension",
      type,
      payload
    },
    origin
  );
}

async function sendRuntimeMessageWithRetry(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  let response: ExtensionResponse<ExtensionState> = {
    ok: false,
    error: "Extension service worker did not respond."
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await sendRuntimeMessage(message);

    if (response.ok) {
      return response;
    }

    await wait(200 + attempt * 350);
  }

  return response;
}

function sendRuntimeMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve({
        ok: false,
        error: "Extension service worker response timed out."
      });
    }, 6500);

    chrome.runtime.sendMessage(message, (response: ExtensionResponse<ExtensionState> | undefined) => {
      const runtimeError = chrome.runtime.lastError;
      window.clearTimeout(timeout);

      if (runtimeError) {
        resolve({
          ok: false,
          error: runtimeError.message
        });
        return;
      }

      resolve(
        response ?? {
          ok: false,
          error: "Extension service worker did not respond."
        }
      );
    });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getStoredStateResponse(): Promise<ExtensionResponse<ExtensionState>> {
  const state = await readStoredState();

  return {
    ok: true,
    data: state
  };
}

async function connectSessionInStorage(session: SupabaseSessionSnapshot): Promise<ExtensionResponse<ExtensionState>> {
  const currentState = await readStoredState();
  const nextState: ExtensionState = {
    ...currentState,
    isConnected: true,
    auth: session,
    user: session.user,
    sync: {
      status: "synced",
      lastSyncedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString()
    },
    logs: [
      {
        id: crypto.randomUUID(),
        level: "info" as const,
        message: "Dashboard session connected through content bridge fallback.",
        createdAt: new Date().toISOString()
      },
      ...currentState.logs
    ].slice(0, 80)
  };

  await writeStoredState(nextState);
  return {
    ok: true,
    data: nextState
  };
}

async function disconnectSessionInStorage(): Promise<ExtensionResponse<ExtensionState>> {
  const currentState = await readStoredState();
  const nextState: ExtensionState = {
    ...getDefaultBridgeState(),
    locale: currentState.locale,
    parsedListings: currentState.parsedListings,
    parserHealth: currentState.parserHealth,
    vinted: currentState.vinted,
    logs: [
      {
        id: crypto.randomUUID(),
        level: "info" as const,
        message: "Dashboard session disconnected through content bridge fallback.",
        createdAt: new Date().toISOString()
      },
      ...currentState.logs
    ].slice(0, 80)
  };

  await writeStoredState(nextState);
  return {
    ok: true,
    data: nextState
  };
}

function readStoredState(): Promise<ExtensionState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STATE_STORAGE_KEY, (result) => {
      const runtimeError = chrome.runtime.lastError;

      if (runtimeError) {
        resolve(getDefaultBridgeState());
        return;
      }

      resolve(normalizeBridgeState(result[STATE_STORAGE_KEY] as Partial<ExtensionState> | undefined));
    });
  });
}

function writeStoredState(state: ExtensionState) {
  return chrome.storage.local.set({
    [STATE_STORAGE_KEY]: state
  });
}

function normalizeBridgeState(state?: Partial<ExtensionState>): ExtensionState {
  const fallback = getDefaultBridgeState();

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

function getDefaultBridgeState(): ExtensionState {
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
      status: "idle",
      lastHeartbeatAt: new Date().toISOString()
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
