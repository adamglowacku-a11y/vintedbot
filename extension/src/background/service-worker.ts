import { addLog } from "@/lib/logger";
import { getRandomHumanDelay, isCooldownActive, REFRESH_SAFETY } from "@/actions/safety";
import { DEFAULT_STATE } from "@/lib/constants";
import { getExtensionState, resetExtensionState, setExtensionState, updateExtensionState } from "@/lib/storage";
import { isSessionExpiring, refreshSupabaseSession, verifySupabaseSession } from "@/lib/supabase-auth";
import type { ExtensionMessage, ExtensionResponse, ExtensionState, ListingActionJob, VintedContentMessage } from "@/types/extension";

const ACTION_ALARM_PREFIX = "vintedflow-action-";

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getExtensionState();
  await setExtensionState({
    ...DEFAULT_STATE,
    ...state
  });
  await chrome.sidePanel?.setPanelBehavior?.({
    openPanelOnActionClick: true
  });
  await addLog({ level: "info", message: "VintedFlow extension installed." });
});

chrome.alarms.create("vintedflow-session-sync", {
  periodInMinutes: 15
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "vintedflow-session-sync") {
    void syncSession();
    return;
  }

  if (alarm.name.startsWith(ACTION_ALARM_PREFIX)) {
    void executeActiveJob(0);
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

chrome.runtime.onMessageExternal.addListener((message: ExtensionMessage, sender, sendResponse) => {
  if (!isAllowedExternalOrigin(sender.origin ?? sender.url)) {
    sendResponse({
      ok: false,
      error: "Origin dashboardu nie jest dozwolony."
    });
    return false;
  }

  handleMessage(message)
    .then((response) => sendResponse(response))
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown external extension error."
      });
    });

  return true;
});

let actionTimer: ReturnType<typeof setTimeout> | undefined;

function isAllowedExternalOrigin(value?: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "vintly.live" ||
      url.hostname === "www.vintly.live" ||
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse<ExtensionState>> {
  await recoverDueAction();

  switch (message.type) {
    case "PING": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        sync: {
          ...currentState.sync,
          lastHeartbeatAt: new Date().toISOString()
        }
      }));

      return {
        ok: true,
        data: state
      };
    }

    case "GET_STATE": {
      const state = await getExtensionState();

      if (state.auth && isSessionExpiring(state.auth, 0)) {
        return {
          ok: true,
          data: await syncSession()
        };
      }

      return {
        ok: true,
        data: state
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

    case "DASHBOARD_LOGOUT": {
      const state = await resetExtensionState();
      await addLog({ level: "info", message: "Dashboard logout synced to extension." });
      return { ok: true, data: state };
    }

    case "VINTED_PAGE_STATUS": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        vinted: message.payload
      }));

      return { ok: true, data: state };
    }

    case "PARSER_RESULT": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        parsedListings: message.payload.listings,
        parserHealth: {
          ...message.payload.health,
          logs: [...message.payload.health.logs, ...currentState.parserHealth.logs].slice(0, 60)
        },
        logs: [...message.payload.health.logs, ...currentState.logs].slice(0, 80)
      }));

      return { ok: true, data: state };
    }

    case "SET_LOCALE": {
      const state = await updateExtensionState((currentState) => ({
        ...currentState,
        locale: message.payload.locale
      }));

      await addLog({ level: "info", message: `Locale changed to ${message.payload.locale}.` });
      return { ok: true, data: state };
    }

    case "REQUEST_REFRESH_LISTING": {
      const state = await enqueueRefreshJob(message.payload.listingId);
      void processQueue();
      return { ok: true, data: state };
    }

    case "CANCEL_ACTIVE_ACTION": {
      const state = await cancelActiveAction();
      return { ok: true, data: state };
    }

    case "MANUAL_SCAN": {
      const result = await sendManualScanToVintedTab();
      await addLog({
        level: result.ok ? "info" : "warning",
        message: result.ok ? "Ręczne skanowanie Vinted uruchomione." : `Ręczne skanowanie nieudane: ${result.error}`
      });
      return { ok: true, data: await getExtensionState() };
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

async function enqueueRefreshJob(listingId: string) {
  const state = await getExtensionState();
  const listing = state.parsedListings.find((item) => item.id === listingId);

  if (!listing) {
    throw new Error("Nie znaleziono oferty w aktualnie sparsowanych danych.");
  }

  if (!listing.hasRefreshButton) {
    throw new Error("Parser nie wykrył przycisku odświeżania dla tej oferty.");
  }

  if (state.actionQueue.activeJob || state.actionQueue.pending.length > 0) {
    throw new Error("Jedna akcja jest już w toku. Poczekaj na zakończenie lub anuluj ją.");
  }

  if (isCooldownActive(state.actionQueue.cooldownUntil)) {
    throw new Error("Cooldown odświeżania jest aktywny. Spróbuj ponownie za chwilę.");
  }

  const now = new Date().toISOString();
  const job: ListingActionJob = {
    id: crypto.randomUUID(),
    type: "refreshListing",
    listingId,
    listingTitle: listing.title,
    listingUrl: listing.url,
    status: "queued",
    attempts: 0,
    maxRetries: REFRESH_SAFETY.retryLimit,
    createdAt: now,
    updatedAt: now
  };

  const nextState = await updateExtensionState((currentState) => ({
    ...currentState,
    actionQueue: {
      ...currentState.actionQueue,
      pending: [job],
      isProcessing: true
    }
  }));

  await addLog({
    level: "info",
    message: `Dodano odświeżanie oferty do kolejki: ${listing.title}.`,
    context: { listingId }
  });

  return nextState;
}

async function processQueue() {
  const state = await getExtensionState();

  if (state.actionQueue.activeJob || state.actionQueue.pending.length === 0) {
    return;
  }

  if (isCooldownActive(state.actionQueue.cooldownUntil)) {
    await updateExtensionState((currentState) => ({
      ...currentState,
      actionQueue: {
        ...currentState.actionQueue,
        isProcessing: false
      }
    }));
    return;
  }

  const [job] = state.actionQueue.pending;
  const delayMs = getRandomHumanDelay();
  const scheduledFor = new Date(Date.now() + delayMs).toISOString();

  await updateExtensionState((currentState) => ({
    ...currentState,
    actionQueue: {
      ...currentState.actionQueue,
      activeJob: {
        ...job,
        status: "waiting",
        scheduledFor,
        updatedAt: new Date().toISOString()
      },
      pending: currentState.actionQueue.pending.slice(1),
      isProcessing: true
    }
  }));

  await scheduleActionAlarm(job.id, scheduledFor);
}

async function executeActiveJob(delayMs: number) {
  const state = await getExtensionState();
  const job = state.actionQueue.activeJob;

  if (!job || job.status === "cancelled") {
    return;
  }

  const runningJob: ListingActionJob = {
    ...job,
    attempts: job.attempts + 1,
    status: "running",
    startedAt: job.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await updateExtensionState((currentState) => ({
    ...currentState,
    actionQueue: {
      ...currentState.actionQueue,
      activeJob: runningJob
    }
  }));

  const result = await sendRefreshToVintedTab(runningJob, delayMs);

  if (!result.ok && runningJob.attempts <= runningJob.maxRetries) {
    await addLog({
      level: "warning",
      message: `Odświeżenie nieudane, ponawiam próbę ${runningJob.attempts}/${runningJob.maxRetries}.`,
      context: { listingId: runningJob.listingId }
    });

    await updateExtensionState((currentState) => ({
      ...currentState,
      actionQueue: {
        ...currentState.actionQueue,
        activeJob: {
          ...runningJob,
          status: "waiting",
          scheduledFor: new Date(Date.now() + REFRESH_SAFETY.retryBackoffMs + getRandomHumanDelay()).toISOString(),
          error: result.error,
          updatedAt: new Date().toISOString()
        }
      }
    }));

    const nextState = await getExtensionState();
    await scheduleActionAlarm(runningJob.id, nextState.actionQueue.activeJob?.scheduledFor ?? new Date(Date.now() + REFRESH_SAFETY.retryBackoffMs).toISOString());
    return;
  }

  const completedAt = new Date().toISOString();
  const completedJob: ListingActionJob = {
    ...runningJob,
    status: result.ok ? "succeeded" : "failed",
    completedAt,
    updatedAt: completedAt,
    error: result.error
  };
  const cooldownUntil = result.ok ? new Date(Date.now() + REFRESH_SAFETY.cooldownMs).toISOString() : state.actionQueue.cooldownUntil;

  const nextState = await updateExtensionState((currentState) => ({
    ...currentState,
    actionQueue: {
      ...currentState.actionQueue,
      activeJob: null,
      isProcessing: false,
      lastRefreshAt: result.ok ? completedAt : currentState.actionQueue.lastRefreshAt,
      cooldownUntil,
      history: [completedJob, ...currentState.actionQueue.history].slice(0, 40)
    }
  }));

  await addLog({
    level: result.ok ? "info" : "error",
    message: result.ok ? `Odświeżono ofertę: ${completedJob.listingTitle}.` : `Odświeżenie nieudane: ${result.error}`,
    context: { listingId: completedJob.listingId }
  });

  return nextState;
}

async function sendRefreshToVintedTab(job: ListingActionJob, delayMs: number): Promise<{ ok: boolean; error?: string }> {
  const tabs = await getVintedTabs();
  const tab = tabs.find((candidate) => candidate.url && (candidate.url.includes(job.listingId) || candidate.url.includes("vinted"))) ?? tabs[0];

  if (!tab?.id) {
    return {
      ok: false,
      error: "Nie znaleziono aktywnej karty Vinted z załadowanym content script."
    };
  }

  const message: VintedContentMessage = {
    type: "EXECUTE_REFRESH_CLICK",
    payload: {
      listingId: job.listingId,
      jobId: job.id,
      delayMs
    }
  };

  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Content script Vinted nie odpowiedział."
    };
  }
}

async function sendManualScanToVintedTab(): Promise<{ ok: boolean; error?: string }> {
  const tabs = await getVintedTabs();
  const tab = tabs.find((candidate) => candidate.active) ?? tabs[0];

  if (!tab?.id) {
    return {
      ok: false,
      error: "Nie znaleziono otwartej karty Vinted."
    };
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "SCAN_NOW" } satisfies VintedContentMessage);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nie udało się uruchomić ręcznego skanowania."
    };
  }
}

async function getVintedTabs() {
  return chrome.tabs.query({
    url: [
      "https://*.vinted.com/*",
      "https://*.vinted.pl/*",
      "https://*.vinted.fr/*",
      "https://*.vinted.de/*",
      "https://*.vinted.it/*",
      "https://*.vinted.es/*",
      "https://*.vinted.nl/*",
      "https://*.vinted.be/*",
      "https://*.vinted.co.uk/*"
    ]
  });
}

async function cancelActiveAction() {
  if (actionTimer) {
    clearTimeout(actionTimer);
  }

  const state = await updateExtensionState((currentState) => {
    const activeJob = currentState.actionQueue.activeJob;
    const cancelledJob = activeJob
      ? {
          ...activeJob,
          status: "cancelled" as const,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          error: "Anulowano przez użytkownika."
        }
      : null;

    return {
      ...currentState,
      actionQueue: {
        ...currentState.actionQueue,
        activeJob: null,
        pending: [],
        isProcessing: false,
        history: cancelledJob ? [cancelledJob, ...currentState.actionQueue.history].slice(0, 40) : currentState.actionQueue.history
      }
    };
  });

  if (state.actionQueue.history[0]?.id) {
    await chrome.alarms.clear(`${ACTION_ALARM_PREFIX}${state.actionQueue.history[0].id}`);
  }

  await addLog({ level: "warning", message: "Anulowano aktywną akcję odświeżania." });
  return state;
}

async function scheduleActionAlarm(jobId: string, scheduledFor: string) {
  await chrome.alarms.clear(`${ACTION_ALARM_PREFIX}${jobId}`);
  await chrome.alarms.create(`${ACTION_ALARM_PREFIX}${jobId}`, {
    when: Math.max(Date.now() + 250, new Date(scheduledFor).getTime())
  });
}

async function recoverDueAction() {
  const state = await getExtensionState();
  const job = state.actionQueue.activeJob;

  if (!job || job.status !== "waiting" || !job.scheduledFor) {
    return;
  }

  if (new Date(job.scheduledFor).getTime() <= Date.now()) {
    void executeActiveJob(0);
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

  const sessionResult = isSessionExpiring(state.auth)
    ? await refreshSupabaseSession(state.auth)
    : { ok: true, session: state.auth, user: state.auth.user };

  if (!sessionResult.ok || !sessionResult.session || !sessionResult.user) {
    const nextState = await updateExtensionState((currentState) => ({
      ...currentState,
      isConnected: false,
      user: null,
      auth: null,
      automationEnabled: false,
      sync: {
        status: "expired",
        lastSyncedAt: currentState.sync.lastSyncedAt,
        lastHeartbeatAt: new Date().toISOString(),
        error: sessionResult.error
      }
    }));
    await addLog({ level: "warning", message: sessionResult.error ?? "Session expired." });
    return nextState;
  }

  const verification = await verifySupabaseSession(sessionResult.session);

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
    auth: {
      ...sessionResult.session,
      user: verification.user
    },
    sync: {
      status: "synced",
      lastSyncedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString()
    }
  }));

  await addLog({ level: "info", message: "Session synced with Supabase." });
  return nextState;
}
