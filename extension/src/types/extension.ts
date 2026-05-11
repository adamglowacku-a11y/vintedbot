export type AutomationModuleId =
  | "autoRefresh"
  | "bulkPriceEditing"
  | "autoMessaging"
  | "scheduler"
  | "queue"
  | "logging"
  | "antiSpam";

export type AutomationModuleStatus = "planned" | "ready" | "paused" | "disabled";
export type SupportedLocale = "pl" | "en" | "de";

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

export type ParsedListingStatus = "active" | "reserved" | "sold" | "hidden" | "unknown";

export type ParsedVintedListing = {
  id: string;
  title: string;
  priceText?: string;
  priceValue?: number;
  currency?: string;
  url: string;
  status: ParsedListingStatus;
  imageUrl?: string;
  hasRefreshButton: boolean;
  parsedAt: string;
  selectorVersion: string;
};

export type ParserHealthState = {
  status: "idle" | "scanning" | "healthy" | "degraded" | "error";
  lastRunAt?: string;
  lastSuccessAt?: string;
  listingsFound: number;
  retries: number;
  selectorVersion: string;
  error?: string;
  logs: ExtensionLog[];
};

export type ListingActionType = "refreshListing";
export type ListingActionStatus = "idle" | "queued" | "waiting" | "running" | "succeeded" | "failed" | "cancelled" | "cooldown";

export type ListingActionJob = {
  id: string;
  type: ListingActionType;
  listingId: string;
  listingTitle: string;
  listingUrl: string;
  status: ListingActionStatus;
  attempts: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export type ActionQueueState = {
  activeJob: ListingActionJob | null;
  pending: ListingActionJob[];
  history: ListingActionJob[];
  isProcessing: boolean;
  lastRefreshAt?: string;
  cooldownUntil?: string;
  cooldownSeconds: number;
};

export type SyncState = {
  status: "idle" | "syncing" | "synced" | "expired" | "error";
  lastSyncedAt?: string;
  lastHeartbeatAt?: string;
  error?: string;
};

export type ExtensionState = {
  isConnected: boolean;
  user: ExtensionUser | null;
  auth: SupabaseSessionSnapshot | null;
  vinted: VintedDetectionState;
  parsedListings: ParsedVintedListing[];
  parserHealth: ParserHealthState;
  actionQueue: ActionQueueState;
  locale: SupportedLocale;
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
  | { type: "PING" }
  | { type: "GET_STATE" }
  | { type: "CONNECT_SESSION"; payload: SupabaseSessionSnapshot }
  | { type: "DISCONNECT_SESSION" }
  | { type: "DASHBOARD_LOGOUT" }
  | { type: "VINTED_PAGE_STATUS"; payload: VintedDetectionState }
  | { type: "PARSER_RESULT"; payload: { listings: ParsedVintedListing[]; health: ParserHealthState } }
  | { type: "SET_LOCALE"; payload: { locale: SupportedLocale } }
  | { type: "REQUEST_REFRESH_LISTING"; payload: { listingId: string } }
  | { type: "CANCEL_ACTIVE_ACTION" }
  | { type: "SYNC_NOW" }
  | { type: "TOGGLE_AUTOMATION"; payload: { enabled: boolean } }
  | { type: "ADD_LOG"; payload: Omit<ExtensionLog, "id" | "createdAt"> };

export type VintedContentMessage =
  | { type: "EXECUTE_REFRESH_CLICK"; payload: { listingId: string; jobId: string; delayMs: number } }
  | { type: "SCAN_NOW" };

export type ExtensionResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};
