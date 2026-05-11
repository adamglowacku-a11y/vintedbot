import { addLog } from "@/lib/logger";
import { DEFAULT_STATE } from "@/lib/constants";
import { getExtensionState, resetExtensionState, setExtensionState, updateExtensionState } from "@/lib/storage";
import { verifySupabaseSession } from "@/lib/supabase-auth";
import type { ExtensionMessage, ExtensionResponse, ExtensionState } from "@/types/extension";

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getExtensionState();
  await setExtensionState({
    ...DEFAULT_STATE,
    ...state
  });
  await addLog({ level: "info", message: "VintedFlow extension installed." });
});

chrome.alarms.create("vintedflow-session-sync", {
  periodInMinutes: 15
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "vintedflow-session-sync") {
    void syncSession();
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then((response) => sendResponse(response))
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown extension error."
      });
    });

  return true;
});

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  switch (message.type) {
    case "GET_STATE": {
      return {
        ok: true,
        data: await getExtensionState()
      };
    }

    case "CONNECT_SESSION": {
      const verification = await verifySupabaseSession(message.payload);

      if (!verification.ok || !verification.user) {
        await addLog({ level: "error", message: verification.error ?? "Failed to connect dashboard session." });
        return {
          ok: false,
          error: verification.error
        };
      }

      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        isConnected: true,
        auth: {
          ...message.payload,
          user: verification.user
        },
        user: verification.user,
        sync: {
          status: "synced",
          lastSyncedAt: new Date().toISOString()
        }
      }));

      await addLog({ level: "info", message: "Dashboard session connected to extension." });
      return { ok: true, data: state };
    }

    case "DISCONNECT_SESSION": {
      const state = await resetExtensionState();
      await addLog({ level: "info", message: "Dashboard session disconnected." });
      return { ok: true, data: state };
    }

    case "VINTED_PAGE_STATUS": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        vinted: message.payload
      }));

      return { ok: true, data: state };
    }

    case "SYNC_NOW": {
      const state = await syncSession();
      return { ok: true, data: state };
    }

    case "TOGGLE_AUTOMATION": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        automationEnabled: message.payload.enabled
      }));

      await addLog({
        level: "info",
        message: message.payload.enabled ? "Automation monitoring enabled." : "Automation monitoring paused."
      });

      return { ok: true, data: state };
    }

    case "ADD_LOG": {
      await addLog(message.payload);
      return { ok: true, data: await getExtensionState() };
    }
  }
}

async function syncSession() {
  const state = await getExtensionState();

  if (!state.auth) {
    return state;
  }

  await updateExtensionState((currentState) => ({
    ...currentState,
    sync: {
      status: "syncing",
      lastSyncedAt: currentState.sync.lastSyncedAt
    }
  }));

  const verification = await verifySupabaseSession(state.auth);

  if (!verification.ok || !verification.user) {
    const nextState = await updateExtensionState((currentState) => ({
      ...currentState,
      sync: {
        status: "error",
        lastSyncedAt: currentState.sync.lastSyncedAt,
        error: verification.error
      }
    }));
    await addLog({ level: "warning", message: verification.error ?? "Session sync failed." });
    return nextState;
  }

  const nextState = await updateExtensionState((currentState) => ({
    ...currentState,
    isConnected: true,
    user: verification.user,
    sync: {
      status: "synced",
      lastSyncedAt: new Date().toISOString()
    }
  }));

  await addLog({ level: "info", message: "Session synced with Supabase." });
  return nextState;
}
