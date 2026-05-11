import { updateParserDebugOverlay } from "@/parser/debug-overlay";
import { parseListingsWithDiagnostics } from "@/parser/listing-parser";
import { SELECTOR_VERSION } from "@/parser/selectors";
import type { ExtensionLog, ExtensionMessage, ParserHealthState } from "@/types/extension";

type ParserObserverOptions = {
  retryLimit?: number;
  debounceMs?: number;
};

export function startParserObserver({ retryLimit = 4, debounceMs = 650 }: ParserObserverOptions = {}) {
  let retryCount = 0;
  let timer: number | undefined;
  let lastSignature = "";
  let mutationCount = 0;

  async function runParser(reason: string) {
    try {
      const result = parseListingsWithDiagnostics();
      const listings = result.listings;
      const signature = listings.map((listing) => listing.id).join("|");
      const log = createLog("info", `Parser run completed: ${listings.length} listings.`, {
        reason,
        scanDurationMs: result.health.scanDurationMs ?? 0,
        anchorsFound: result.health.domHealth?.anchorsFound ?? 0,
        mutationCount
      });
      const health: ParserHealthState = {
        status: listings.length > 0 ? "healthy" : retryCount >= retryLimit ? "degraded" : "scanning",
        ...result.health,
        retries: retryCount,
        selectorVersion: SELECTOR_VERSION,
        logs: [log]
      };

      updateParserDebugOverlay(health);

      if (signature === lastSignature && reason !== "manual") {
        return;
      }

      lastSignature = signature;

      await safeRuntimeSend({
        type: "PARSER_RESULT",
        payload: {
          listings,
          health
        }
      });

      if (listings.length === 0 && retryCount < retryLimit) {
        retryCount += 1;
        window.setTimeout(() => {
          void runParser("retry");
        }, 900 * retryCount + Math.min(2500, document.body.innerText.length / 20));
      } else {
        retryCount = 0;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parser error.";
      await safeRuntimeSend({
        type: "PARSER_RESULT",
        payload: {
          listings: [],
          health: {
            status: "error",
            lastRunAt: new Date().toISOString(),
            listingsFound: 0,
            retries: retryCount,
            selectorVersion: SELECTOR_VERSION,
            error: message,
            logs: [createLog("error", message, { reason })]
          }
        }
      });
    }
  }

  function schedule(reason: string) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void runParser(reason);
    }, debounceMs);
  }

  const observer = new MutationObserver(() => {
    mutationCount += 1;
    schedule("dom-mutation");
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("focus", () => schedule("focus"));
  window.addEventListener("scroll", () => schedule("scroll-lazy-load"), { passive: true });
  window.addEventListener("popstate", () => schedule("navigation"));
  schedule("initial");
  [400, 1200, 2500, 5000, 8500].forEach((delay) => {
    window.setTimeout(() => schedule(`delayed-hydration-${delay}`), delay);
  });

  return {
    stop() {
      observer.disconnect();
      window.clearTimeout(timer);
    },
    scanNow() {
      void runParser("manual");
    },
    schedule
  };
}

export type ParserObserverController = ReturnType<typeof startParserObserver>;

async function safeRuntimeSend(message: ExtensionMessage) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    console.warn(
      "[VintedFlow parser runtime]",
      error instanceof Error ? error.message : "Parser nie połączył się z service workerem."
    );
  }
}

function createLog(
  level: ExtensionLog["level"],
  message: string,
  context?: ExtensionLog["context"]
): ExtensionLog {
  return {
    id: crypto.randomUUID(),
    level,
    message,
    createdAt: new Date().toISOString(),
    context
  };
}
