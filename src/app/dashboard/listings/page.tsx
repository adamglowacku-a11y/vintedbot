import { RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ParsedListingsPanel } from "@/components/extension/parsed-listings-panel";
import { Button } from "@/components/ui/button";

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        action={
          <div className="flex gap-2">
            <Button disabled type="button" variant="secondary">
              <RefreshCw className="size-4" />
              Zbiorcze odświeżanie wkrótce
            </Button>
          </div>
        }
        description="Tutaj są tylko realne oferty wykryte przez rozszerzenie na Vinted. Usunąłem przykładowy katalog demo."
        eyebrow="Katalog"
        title="Oferty"
      />

      <ParsedListingsPanel />
    </>
  );
}
