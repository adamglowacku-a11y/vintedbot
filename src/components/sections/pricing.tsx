import { Check } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionEyebrow, SectionLead, SectionTitle } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/lib/site";

export function Pricing() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <SectionTitle>Simple plans for sellers growing from side hustle to studio.</SectionTitle>
          <SectionLead className="mx-auto">
            Start lean, then unlock advanced automations when your catalog and message volume grow.
          </SectionLead>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              className={cn(
                "relative flex flex-col p-6",
                plan.featured && "border-primary/40 bg-primary/[0.08] shadow-glow"
              )}
              key={plan.name}
            >
              {plan.featured ? (
                <div className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              ) : null}
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{plan.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.06em] text-white">{plan.price}</span>
                  <span className="pb-2 text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-3 text-sm text-muted-foreground" key={feature}>
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink className="mt-8 w-full" href="/register" variant={plan.featured ? "primary" : "secondary"}>
                {plan.cta}
              </ButtonLink>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
