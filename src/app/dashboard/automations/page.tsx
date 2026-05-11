import { Bot } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ExtensionAutomationControl } from "@/components/extension/extension-automation-control";
import { Button } from "@/components/ui/button";

export default function AutomationsPage() {
  return (
    <>
      <PageHeader
        action={
          <Button type="button">
            <Bot className="size-4" />
            Nowy workflow
          </Button>
        }
        description="Steruj realnym monitoringiem, skanowaniem, kolejką i pojedynczym odświeżaniem przez rozszerzenie Chrome. Płatności zostawiamy na koniec."
        eyebrow="Silnik workflow"
        title="Automatyzacje"
      />

      <ExtensionAutomationControl />
    </>
  );
}
