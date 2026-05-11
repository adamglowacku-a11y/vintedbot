import type { ExtensionMessage, VintedDetectionState } from "@/types/extension";

const VINTED_HOST_PATTERN = /(^|\.)vinted\.(com|pl|fr|de)$/i;

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

  await chrome.runtime.sendMessage(message);
}

void publishDetectionState();

let lastUrl = window.location.href;

const observer = new MutationObserver(() => {
  if (window.location.href === lastUrl) {
    return;
  }

  lastUrl = window.location.href;
  void publishDetectionState();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

window.addEventListener("focus", () => {
  void publishDetectionState();
});
