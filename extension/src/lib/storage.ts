import { DEFAULT_STATE, STORAGE_KEYS } from "@/lib/constants";
import type { ExtensionState } from "@/types/extension";

export async function getExtensionState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.state);
  return {
    ...DEFAULT_STATE,
    ...(result[STORAGE_KEYS.state] as Partial<ExtensionState> | undefined)
  };
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
