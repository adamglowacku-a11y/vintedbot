import { ExtensionConnectCard } from "@/components/extension/extension-connect-card";

export default function ExtensionConnectPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="surface-grid absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <ExtensionConnectCard />
    </main>
  );
}
