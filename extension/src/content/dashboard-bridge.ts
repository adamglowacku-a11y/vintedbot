import { DASHBOARD_ORIGINS } from "@/lib/constants";
import type { ExtensionMessage, ExtensionResponse, ExtensionState, SupabaseSessionSnapshot } from "@/types/extension";

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
      type:
        | "CHECK_EXTENSION"
        | "GET_EXTENSION_STATE"
        | "SYNC_EXTENSION"
        | "DISCONNECT_EXTENSION"
        | "DASHBOARD_LOGOUT"
        | "CANCEL_ACTIVE_ACTION";
    };

void emitReady(window.location.origin);

window.addEventListener("message", (event: MessageEvent<DashboardBridgeMessage>) => {
  if (!DASHBOARD_ORIGINS.includes(event.origin)) {
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

async function emitReady(origin: string) {
  const response = await sendRuntimeMessage({ type: "PING" });

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
  const response = await sendRuntimeMessage(message);

  window.postMessage(
    {
      source: "vintedflow-extension",
      type,
      payload: response
    },
    origin
  );
}

function sendRuntimeMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: ExtensionResponse<ExtensionState> | undefined) => {
      const runtimeError = chrome.runtime.lastError;

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
