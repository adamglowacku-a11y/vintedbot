export type AutomationModuleId =
  | "autoRefresh"
  | "bulkPriceEditing"
  | "autoMessaging"
  | "scheduler"
  | "queue"
  | "logging"
  | "antiSpam";

export type AutomationModuleStatus = "planned" | "ready" | "paused" | "disabled";

export type ExtensionUser = {
  id: string;
  email?: string;
  name?: string;
};

export type SupabaseSessionSnapshot = {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: ExtensionUser;
};

export type VintedDetectionState = {
  isOnVinted: boolean;
  url?: string;
  hostname?: string;
  detectedAt?: string;
};

export type SyncState = {
  status: "idle" | "syncing" | "synced" | "error";
  lastSyncedAt?: string;
  error?: string;
};

export type ExtensionState = {
  isConnected: boolean;
  user: ExtensionUser | null;
  auth: SupabaseSessionSnapshot | null;
  vinted: VintedDetectionState;
  sync: SyncState;
  automationEnabled: boolean;
  modules: Record<AutomationModuleId, AutomationModuleStatus>;
  logs: ExtensionLog[];
};

export type ExtensionLog = {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  createdAt: string;
  context?: Record<string, string | number | boolean>;
};

export type ExtensionMessage =
  | { type: "GET_STATE" }
  | { type: "CONNECT_SESSION"; payload: SupabaseSessionSnapshot }
  | { type: "DISCONNECT_SESSION" }
  | { type: "VINTED_PAGE_STATUS"; payload: VintedDetectionState }
  | { type: "SYNC_NOW" }
  | { type: "TOGGLE_AUTOMATION"; payload: { enabled: boolean } }
  | { type: "ADD_LOG"; payload: Omit<ExtensionLog, "id" | "createdAt"> };

export type ExtensionResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};
