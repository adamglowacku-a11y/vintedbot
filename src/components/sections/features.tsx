import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEyebrow, SectionLead, SectionTitle } from "@/components/ui/typography";
import { features } from "@/lib/site";

export function Features() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <SectionEyebrow>Automation toolkit</SectionEyebrow>
          <SectionTitle>Everything sellers need to move faster without losing control.</SectionTitle>
          <SectionLead>
            Connect your browser session, configure seller-safe workflows, and manage every automation from one modern dashboard.
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
