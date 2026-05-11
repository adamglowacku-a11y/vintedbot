import { Download, Filter, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ParsedListingsPanel } from "@/components/extension/parsed-listings-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listings } from "@/lib/dashboard-data";

function getBadgeVariant(status: string) {
  if (status === "Active" || status === "Boosted") {
    return "success";
  }

  if (status === "Needs refresh") {
    return "warning";
  }

  return "muted";
}

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        action={
          <div className="flex gap-2">
            <Button type="button" variant="secondary">
              <Filter className="size-4" />
              Filtr
            </Button>
            <Button type="button">
              <RefreshCw className="size-4" />
              Odświeżenie zbiorcze
            </Button>
          </div>
        }
        description="Bezpieczny podgląd ofert z dashboardu oraz read-only parsera Vinted w rozszerzeniu Chrome."
        eyebrow="Katalog"
        title="Oferty"
      />

      <ParsedListingsPanel />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Przykładowy katalog sprzedawcy</h2>
            <p className="mt-1 text-sm text-muted-foreground">Dane demo dashboardu. Realne odczyty z Vinted są powyżej.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="button" variant="secondary">
              Zaznacz wybrane
            </Button>
            <Button size="sm" type="button" variant="secondary">
              <Download className="size-4" />
              Eksport
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4">
                  <input className="size-4 rounded border-white/10 bg-white/[0.04]" type="checkbox" />
                </th>
                <th className="px-5 py-4">Oferta</th>
                <th className="px-5 py-4">Cena</th>
                <th className="px-5 py-4">Wyświetlenia</th>
                <th className="px-5 py-4">Zapisania</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {listings.map((listing) => (
                <tr className="text-sm" key={listing.sku}>
                  <td className="px-5 py-4">
                    <input className="size-4 rounded border-white/10 bg-white/[0.04]" type="checkbox" />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{listing.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{listing.sku}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{listing.price}</td>
                  <td className="px-5 py-4 text-muted-foreground">{listing.views}</td>
                  <td className="px-5 py-4 text-muted-foreground">{listing.saves}</td>
                  <td className="px-5 py-4">
                    <Badge variant={getBadgeVariant(listing.status)}>{listing.status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Button size="sm" type="button" variant="ghost">
                      Podgląd
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
