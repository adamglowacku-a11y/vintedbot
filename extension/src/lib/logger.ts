import { updateExtensionState } from "@/lib/storage";
import type { ExtensionLog } from "@/types/extension";

export async function addLog(log: Omit<ExtensionLog, "id" | "createdAt">) {
  const entry: ExtensionLog = {
    ...log,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  await updateExtensionState((state) => ({
    ...state,
    logs: [entry, ...state.logs].slice(0, 80)
  }));

  return entry;
}
