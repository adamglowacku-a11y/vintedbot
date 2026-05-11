import { PageHeader } from "@/components/dashboard/page-header";
import { ExtensionLiveOverview } from "@/components/extension/extension-live-overview";

export default function DashboardOverviewPage() {
  return (
    <>
      <PageHeader
        description="Monitoruj realny stan rozszerzenia Chrome, parsera Vinted, ofert i kolejki odświeżania. Usunąłem metryki demo, żeby dashboard nie pokazywał fikcyjnych wyników."
        eyebrow="Dashboard"
        title="Przegląd"
      />

      <ExtensionLiveOverview />
    </>
  );
}
