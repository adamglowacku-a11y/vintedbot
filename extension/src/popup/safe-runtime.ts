import { DEFAULT_STATE } from "@/lib/constants";
import { normalizeExtensionState } from "@/lib/storage";
import type { ExtensionMessage, ExtensionResponse, ExtensionState } from "@/types/extension";

const MESSAGE_TIMEOUT_MS = 2500;

export function sendPopupMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      resolve({
        ok: false,
        data: normalizeExtensionState(DEFAULT_STATE),
        error: "Chrome runtime API is unavailable."
      });
      return;
    }

    let settled = false;
    const timeout = window.setTimeout(() => {
      finish({
        ok: false,
        data: normalizeExtensionState(DEFAULT_STATE),
        error: "Service worker timeout. Otwórz ponownie popup albo przeładuj rozszerzenie."
      });
    }, MESSAGE_TIMEOUT_MS);

    function finish(response: ExtensionResponse<ExtensionState>) {
      if (settled) {
        return;
      }

      settled = true;
      if (timeout) {
        window.clearTimeout(timeout);
      }
      resolve(response);
    }

    try {
      chrome.runtime.sendMessage(message, (response: ExtensionResponse<ExtensionState> | undefined) => {
        const runtimeError = chrome.runtime.lastError;

        if (runtimeError) {
          console.warn("[VintedFlow popup runtime]", runtimeError.message);
          finish({
            ok: false,
            data: normalizeExtensionState(DEFAULT_STATE),
            error: runtimeError.message ?? "Nie udało się połączyć z service workerem."
          });
          return;
        }

        finish({
          ok: Boolean(response?.ok),
          data: normalizeExtensionState(response?.data ?? DEFAULT_STATE),
          error: response?.error
        });
      });
    } catch (error) {
      finish({
        ok: false,
        data: normalizeExtensionState(DEFAULT_STATE),
        error: error instanceof Error ? error.message : "Nieznany błąd komunikacji popupu."
      });
    }
  });
}
