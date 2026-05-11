import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEyebrow, SectionLead, SectionTitle } from "@/components/ui/typography";
import { features } from "@/lib/site";

export function Features() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <SectionEyebrow>Zestaw automatyzacji</SectionEyebrow>
          <SectionTitle>Wszystko, czego sprzedawca potrzebuje, aby działać szybciej i bezpiecznie.</SectionTitle>
          <SectionLead>
            Połącz sesję przeglądarki, ustaw bezpieczne workflow i zarządzaj automatyzacją z jednego dashboardu.
          </SectionLead>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
