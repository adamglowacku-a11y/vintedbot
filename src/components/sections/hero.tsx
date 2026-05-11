import { ArrowRight, MonitorSmartphone, ShieldCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { stats } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:pb-28 sm:pt-44">
      <div className="surface-grid absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-muted-foreground backdrop-blur">
            <MonitorSmartphone className="size-4 text-primary" />
            Rozszerzenie Chrome i dashboard oparty o Supabase
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
            Automatyzuj sprzedaż na Vinted z premium centrum kontroli.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            VintedFlow pomaga sprzedawcom odświeżać oferty, pisać wiadomości, kontrolować ceny i śledzić asortyment z dashboardu połączonego z rozszerzeniem.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Zacznij automatyzować
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="#preview" size="lg" variant="secondary">
              Zobacz dashboard
            </ButtonLink>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4" key={stat.label}>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel relative rounded-[2rem] p-4 animate-fade-up [animation-delay:160ms]">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#080b16] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stan automatyzacji</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">98.7%</p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Live
              </div>
            </div>
            <div className="space-y-3">
              {["Odśwież zaległe oferty", "Sugeruj oferty zestawów", "Optymalizuj opisy"].map((item, index) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  key={item}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{index + 12} reguł</span>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="h-32 rounded-xl bg-[linear-gradient(135deg,rgba(45,212,191,0.38),rgba(167,139,250,0.28)_45%,rgba(255,255,255,0.04))]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
