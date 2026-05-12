import { parseListingsWithDiagnostics } from "@/parser/listing-parser";
import { SELECTOR_VERSION } from "@/parser/selectors";
import type { ExtensionLog, ExtensionMessage, ExtensionState, ParserHealthState } from "@/types/extension";

const STATE_STORAGE_KEY = "vintedflow:state";

type ParserObserverOptions = {
  retryLimit?: number;
  debounceMs?: number;
};

export type ParserScanResult = {
  listings: ReturnType<typeof parseListingsWithDiagnostics>["listings"];
  health: ParserHealthState;
};

export function startParserObserver({ retryLimit = 4, debounceMs = 650 }: ParserObserverOptions = {}) {
  let retryCount = 0;
  let timer: number | undefined;
  let lastSignature = "";
  let mutationCount = 0;

  async function runParser(reason: string): Promise<ParserScanResult | undefined> {
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

      if (signature === lastSignature && reason !== "manual") {
        return { listings, health };
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

      return { listings, health };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parser error.";
      const health: ParserHealthState = {
        status: "error",
        lastRunAt: new Date().toISOString(),
        listingsFound: 0,
        retries: retryCount,
        selectorVersion: SELECTOR_VERSION,
        error: message,
        logs: [createLog("error", message, { reason })]
      };
      await safeRuntimeSend({
        type: "PARSER_RESULT",
        payload: {
          listings: [],
          health
        }
      });
      return { listings: [], health };
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
      return runParser("manual");
    },
    schedule
  };
}

export type ParserObserverController = ReturnType<typeof startParserObserver>;

async function safeRuntimeSend(message: ExtensionMessage) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await sendRuntimeMessage(message);

    if (response.ok) {
      return;
    }

    if (attempt === 2) {
      await persistParserResultFallback(message);
      console.warn("[VintedFlow parser runtime]", response.error ?? "Parser nie połączył się z service workerem.");
      return;
    }

    await wait(180 + attempt * 320);
  }
}

function sendRuntimeMessage(message: ExtensionMessage): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve({ ok: false, error: "Service worker parser timeout." });
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
        error: error instanceof Error ? error.message : "Nie udało się wysłać wyniku parsera."
      });
    }
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function persistParserResultFallback(message: ExtensionMessage) {
  if (message.type !== "PARSER_RESULT") {
    return;
  }

  const currentState = await readStoredState();
  const nextState: ExtensionState = {
    ...currentState,
    parsedListings: message.payload.listings,
    parserHealth: {
      ...message.payload.health,
      logs: [...message.payload.health.logs, ...currentState.parserHealth.logs].slice(0, 60)
    },
    logs: [...message.payload.health.logs, ...currentState.logs].slice(0, 80)
  };

  await writeStoredState(nextState);
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
    relistDrafts: state?.relistDrafts ?? fallback.relistDrafts,
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
    relistDrafts: [],
    parserHealth: {
      status: "idle",
      listingsFound: 0,
      retries: 0,
      selectorVersion: SELECTOR_VERSION,
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
