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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await sendRuntimeMessage(message);

    if (response.ok) {
      return;
    }

    if (attempt === 2) {
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
