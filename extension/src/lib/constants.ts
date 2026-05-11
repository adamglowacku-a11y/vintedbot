import type { ExtensionState } from "@/types/extension";

export const STORAGE_KEYS = {
  state: "vintedflow:state"
} as const;

export const DASHBOARD_ORIGINS = ["https://vintly.live", "http://localhost:3000"];

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
