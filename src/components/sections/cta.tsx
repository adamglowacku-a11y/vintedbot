import { ArrowRight, MonitorSmartphone } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="cta">
      <div className="glass-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-8 text-center sm:p-14">
        <div className="absolute inset-x-16 -top-32 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MonitorSmartphone className="size-6" />
          </div>
          <h2 className="text-balance text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
            Uruchom automatyzację Vinted z dashboardem, którego naprawdę chce się używać.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Połącz Supabase Auth, zdarzenia rozszerzenia, płatności i workflow sprzedawcy w jednym produkcie SaaS.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Zacznij budować
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="#features" size="lg" variant="secondary">
              Poznaj funkcje
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
