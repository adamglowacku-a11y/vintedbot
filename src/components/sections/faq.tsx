import { Plus } from "lucide-react";

import { SectionEyebrow, SectionLead, SectionTitle } from "@/components/ui/typography";
import { faqs } from "@/lib/site";

export function FAQ() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="faq">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionTitle>Questions sellers ask before automating.</SectionTitle>
          <SectionLead>
            Built for practical workflows, clear limits, and a reliable extension-to-dashboard connection.
          </SectionLead>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details className="group glass-panel rounded-3xl p-5" key={faq.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white">
                {faq.question}
                <Plus className="size-4 shrink-0 transition group-open:rotate-45" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
