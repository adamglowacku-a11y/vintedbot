import type { ExtensionMessage, ExtensionResponse, ExtensionState, SupabaseSessionSnapshot } from "@/types/extension";

const DASHBOARD_ORIGINS = [
  "https://vintly.live",
  "https://www.vintly.live",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

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
  const response = await sendRuntimeMessageWithRetry({ type: "PING" });

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
  const response = await sendRuntimeMessageWithRetry(message);

  window.postMessage(
    {
      source: "vintedflow-extension",
      type,
      payload: response
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
    }, 2500);

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
