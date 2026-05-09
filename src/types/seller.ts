export type SellerPlan = "starter" | "growth" | "studio";

export type AutomationStatus = "active" | "paused" | "needs_review";

export type ListingWorkflow = {
  id: string;
  name: string;
  status: AutomationStatus;
  listingsCount: number;
  lastRunAt: string;
};

export type SellerWorkspace = {
  id: string;
  name: string;
  plan: SellerPlan;
  workflows: ListingWorkflow[];
};
