import { MessageSquareText, ShieldAlert, TimerReset } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsRow } from "@/components/dashboard/shared/settings-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { messageTemplates } from "@/lib/dashboard-data";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        action={
          <Button type="button">
            <MessageSquareText className="size-4" />
            Nowy szablon
          </Button>
        }
        description="Twórz szablony odpowiedzi, ustawiaj automatyczne wiadomości i chroń konto cooldownami."
        eyebrow="Automatyzacja inboxa"
        title="Wiadomości"
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Szablony wiadomości</h2>
          <div className="mt-5 space-y-3">
            {messageTemplates.map((template) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={template.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.usage} · cooldown {template.cooldown}
                    </p>
                  </div>
                  <Badge variant={template.enabled ? "success" : "muted"}>
                    {template.enabled ? "Włączony" : "Wstrzymany"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Textarea defaultValue="Cześć! Dzięki za zainteresowanie. Mogę wysłać przedmiot jutro i dorzucić rabat, jeśli dodasz coś jeszcze do zestawu." />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Ustawienia auto-odpowiedzi</h2>
          <div className="mt-4 space-y-1">
            <SettingsRow
              badge="AI gotowe"
              description="Sugeruje odpowiedzi na podstawie oferty i intencji kupującego."
              title="Odpowiedzi kontekstowe"
              value="Włączone"
            />
            <SettingsRow
              description="Wymaga akceptacji dla wiadomości ze zmianą ceny powyżej progu."
              title="Próg akceptacji"
              value="15 zł+"
            />
            <SettingsRow
              description="Nie wysyła więcej niż jednej automatycznej wiadomości do kupującego w czasie cooldownu."
              title="Cooldown kupującego"
              value="45 min"
            />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <TimerReset className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Timery cooldown</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Kolejkuj wiadomości z losowym opóźnieniem, godzinami ciszy i limitami per kupujący.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Ochrona przed spamem</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Wykrywaj powtarzalne treści, blokowane frazy, błędy wysyłki i nienaturalne tempo wiadomości.
          </p>
        </Card>
      </div>
    </>
  );
}
