import type { ExtensionState } from "@/types/extension";

export const STORAGE_KEYS = {
  state: "vintedflow:state"
} as const;

export const DASHBOARD_ORIGINS = [
  "https://vintly.live",
  "https://www.vintly.live",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? "https://vintly.live";

export const DEFAULT_STATE: ExtensionState = {
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
    selectorVersion: "vinted-card-parser@2",
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
