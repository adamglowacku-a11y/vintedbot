import type { ExtensionMessage, VintedDetectionState } from "@/types/extension";
import { startParserObserver } from "@/parser/observer";
import { executeRefreshClick } from "@/content/refresh-executor";
import type { VintedContentMessage } from "@/types/extension";
import { mountVintedFlowWidget } from "@/content/vinted-widget";

const VINTED_HOST_PATTERN = /(^|\.)vinted\.(com|pl|fr|de|it|es|nl|be|co\.uk)$/i;

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
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    console.warn(
      "[VintedFlow content runtime]",
      error instanceof Error ? error.message : "Nie udało się wysłać wiadomości do service workera."
    );
  }
}
