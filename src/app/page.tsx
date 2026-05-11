import { ArrowRight, Bot, Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="surface-grid absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <section className="glass-panel relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] p-8 text-center sm:p-12 lg:p-16">
        <div className="absolute inset-x-20 -top-32 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-glow">
            <Bot className="size-8" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-muted-foreground">
            <Clock3 className="size-4 text-primary" />
            VintedFlow is cooking
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
            Trwają prace nad botem, który przejmie kontrolę nad chaosem sprzedaży.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Budujemy automatyzację dla sprzedawców Vinted: dashboard, rozszerzenie Chrome, inteligentne wiadomości,
            odświeżanie ofert i bezpieczne limity działania.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Dashboard SaaS", icon: Sparkles },
              { label: "Rozszerzenie Chrome", icon: ShieldCheck },
              { label: "Automatyzacje", icon: Bot }
            ].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item.label}>
                <item.icon className="mx-auto size-5 text-primary" />
                <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <ButtonLink href="/login" size="lg" variant="secondary">
              Panel dla zespołu
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
