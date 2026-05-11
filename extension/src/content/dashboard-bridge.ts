import { DASHBOARD_ORIGINS } from "@/lib/constants";
import type { ExtensionMessage, SupabaseSessionSnapshot } from "@/types/extension";

type DashboardBridgeMessage =
  | {
      source: "vintedflow-dashboard";
      type: "CONNECT_EXTENSION";
      payload: SupabaseSessionSnapshot;
    }
  | {
      source: "vintedflow-dashboard";
      type: "CHECK_EXTENSION";
    };

window.postMessage(
  {
    source: "vintedflow-extension",
    type: "EXTENSION_READY"
  },
  window.location.origin
);

window.addEventListener("message", (event: MessageEvent<DashboardBridgeMessage>) => {
  if (!DASHBOARD_ORIGINS.includes(event.origin)) {
    return;
  }

  if (event.data?.source !== "vintedflow-dashboard") {
    return;
  }

  if (event.data.type === "CHECK_EXTENSION") {
    window.postMessage(
      {
        source: "vintedflow-extension",
        type: "EXTENSION_READY"
      },
      event.origin
    );
    return;
  }

  if (event.data.type === "CONNECT_EXTENSION") {
    const message: ExtensionMessage = {
      type: "CONNECT_SESSION",
      payload: event.data.payload
    };

    chrome.runtime.sendMessage(message, (response) => {
      window.postMessage(
        {
          source: "vintedflow-extension",
          type: "CONNECT_EXTENSION_RESULT",
          payload: response
        },
        event.origin
      );
    });
  }
});
