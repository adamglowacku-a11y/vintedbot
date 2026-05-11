import { DEFAULT_STATE, STORAGE_KEYS } from "@/lib/constants";
import type { ExtensionState } from "@/types/extension";

export async function getExtensionState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.state);
  return normalizeExtensionState(result[STORAGE_KEYS.state] as Partial<ExtensionState> | undefined);
}

export async function setExtensionState(state: ExtensionState) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.state]: state
  });
}

export async function updateExtensionState(
  updater: (state: ExtensionState) => ExtensionState | Promise<ExtensionState>
) {
  const currentState = await getExtensionState();
  const nextState = await updater(currentState);
  await setExtensionState(nextState);
  return nextState;
}

export async function resetExtensionState() {
  await setExtensionState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

export function normalizeExtensionState(state?: Partial<ExtensionState>): ExtensionState {
  return {
    ...DEFAULT_STATE,
    ...state,
    vinted: {
      ...DEFAULT_STATE.vinted,
      ...state?.vinted
    },
    sync: {
      ...DEFAULT_STATE.sync,
      ...state?.sync
    },
    parserHealth: {
      ...DEFAULT_STATE.parserHealth,
      ...state?.parserHealth,
      logs: state?.parserHealth?.logs ?? DEFAULT_STATE.parserHealth.logs
    },
    actionQueue: {
      ...DEFAULT_STATE.actionQueue,
      ...state?.actionQueue,
      pending: state?.actionQueue?.pending ?? DEFAULT_STATE.actionQueue.pending,
      history: state?.actionQueue?.history ?? DEFAULT_STATE.actionQueue.history
    },
    modules: {
      ...DEFAULT_STATE.modules,
      ...state?.modules
    },
    parsedListings: state?.parsedListings ?? DEFAULT_STATE.parsedListings,
    logs: state?.logs ?? DEFAULT_STATE.logs,
    locale: state?.locale ?? DEFAULT_STATE.locale
  };
}
