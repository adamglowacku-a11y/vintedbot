import { Bot, Pause, Play, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsRow } from "@/components/dashboard/shared/settings-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { automationQueues, scheduleOptions } from "@/lib/dashboard-data";

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
        description="Konfiguruj harmonogram odświeżania, opóźnienia, kolejki i bezpieczne limity działań."
        eyebrow="Silnik workflow"
        title="Automatyzacje"
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Ustawienia odświeżania</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="refresh-window">Okno odświeżania</Label>
              <Input id="refresh-window" defaultValue="09:00 - 22:30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay">Losowe opóźnienie</Label>
              <Input id="delay" defaultValue="45-75 minut" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily-limit">Dzienny limit akcji</Label>
              <Input id="daily-limit" defaultValue="320" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retry-limit">Limit ponowień</Label>
              <Input id="retry-limit" defaultValue="3 próby" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            {scheduleOptions.map((option) => (
              <SettingsRow
                description="Synchronizowane z rozszerzeniem przed wykonaniem kolejki."
                key={option.label}
                title={option.label}
                value={option.value}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Zarządzanie kolejką</h2>
              <p className="mt-1 text-sm text-muted-foreground">Stan kolejki przygotowany dla workerów rozszerzenia.</p>
            </div>
            <Button size="sm" type="button" variant="secondary">
              <Pause className="size-4" />
              Pauzuj wszystko
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {automationQueues.map((queue) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={queue.name}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{queue.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{queue.count} akcji oczekuje</p>
                  </div>
                  <Badge variant={queue.status === "Running" ? "success" : "warning"}>{queue.status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{queue.window}</span>
                  <Button size="sm" type="button" variant="ghost">
                    <Play className="size-4" />
                    Uruchom
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Limity i bezpieczeństwo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Zabezpieczenia chroniące konto przed agresywnym zachowaniem.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Losowe opóźnienia jak u człowieka", "Ręczna akceptacja powyżej 80 zł", "Pauza po powtarzających się błędach"].map((item) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item}>
              <Badge variant="success">Włączone</Badge>
              <p className="mt-3 text-sm font-medium text-white">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
