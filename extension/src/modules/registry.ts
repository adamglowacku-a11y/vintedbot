import type { AutomationModuleId } from "@/types/extension";

export type ExtensionModuleDefinition = {
  id: AutomationModuleId;
  label: string;
  description: string;
  aggressiveAutomation: boolean;
};

export const moduleRegistry: ExtensionModuleDefinition[] = [
  {
    id: "autoRefresh",
    label: "Auto refresh",
    description: "Future listing refresh workflow with rate limits and manual approval.",
    aggressiveAutomation: false
  },
  {
    id: "bulkPriceEditing",
    label: "Bulk price editing",
    description: "Future controlled price updates for selected listings.",
    aggressiveAutomation: false
  },
  {
    id: "autoMessaging",
    label: "Auto messaging",
    description: "Future template-based replies with cooldowns and anti-spam checks.",
    aggressiveAutomation: false
  },
  {
    id: "scheduler",
    label: "Scheduler",
    description: "Schedules safe tasks without executing aggressive actions.",
    aggressiveAutomation: false
  },
  {
    id: "queue",
    label: "Queue system",
    description: "Stores pending work items for future review and execution.",
    aggressiveAutomation: false
  },
  {
    id: "logging",
    label: "Logging",
    description: "Captures extension events for dashboard diagnostics.",
    aggressiveAutomation: false
  },
  {
    id: "antiSpam",
    label: "Anti-spam",
    description: "Central guardrail module for future message and action limits.",
    aggressiveAutomation: false
  }
];
