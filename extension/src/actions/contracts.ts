import type { ParsedVintedListing } from "@/types/extension";

export type PlannedActionType = "refreshListing" | "editPrice" | "sendMessage" | "scheduleTask";

export type PlannedActionContext = {
  listing: ParsedVintedListing;
  requestedBy: "dashboard" | "popup" | "scheduler";
  createdAt: string;
};

export type PlannedAction = {
  id: string;
  type: PlannedActionType;
  context: PlannedActionContext;
  status: "draft" | "requiresApproval" | "blocked";
};

export function createReadOnlyActionDraft(type: PlannedActionType, listing: ParsedVintedListing): PlannedAction {
  return {
    id: crypto.randomUUID(),
    type,
    context: {
      listing,
      requestedBy: "dashboard",
      createdAt: new Date().toISOString()
    },
    status: "requiresApproval"
  };
}
