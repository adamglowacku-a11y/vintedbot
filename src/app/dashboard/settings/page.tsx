import { KeyRound, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { settingsGroups } from "@/lib/dashboard-data";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        action={<Button type="button">Zapisz zmiany</Button>}
        description="Zarządzaj kontem, subskrypcją, synchronizacją rozszerzenia, API i bezpieczeństwem."
        eyebrow="Workspace"
        title="Ustawienia"
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Ustawienia konta</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">Nazwa workspace</Label>
              <Input id="workspace" defaultValue="Studio Vinted Adama" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email powiadomień</Label>
              <Input id="email" defaultValue="sprzedawca@example.com" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Subskrypcja</h2>
              <p className="mt-1 text-sm text-muted-foreground">Podsumowanie płatności przygotowane pod Stripe.</p>
            </div>
            <Badge variant="success">Growth</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["49 zł / mies.", "Nielimitowane oferty", "Odnowienie 9 czerwca"].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white" key={item}>
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card className="p-5" key={group.title}>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{group.title}</h2>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item}>
                  <span className="text-sm text-white">{item}</span>
                  <Button size="sm" type="button" variant="ghost">
                    Zarządzaj
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Dostęp API</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Miejsce na klucze API, sekrety webhooków i tokeny parowania rozszerzenia.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Bezpieczeństwo</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Śledź sesje, OAuth, logi audytu i akceptacje automatyzacji na poziomie konta.
          </p>
        </Card>
      </div>
    </>
  );
}
