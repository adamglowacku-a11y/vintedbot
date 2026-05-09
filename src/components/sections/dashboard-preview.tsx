import { BarChart3, Inbox, Settings2, ShoppingBag } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Sidebar } from "@/components/ui/sidebar";
import { SectionEyebrow, SectionLead, SectionTitle } from "@/components/ui/typography";
import { activity, dashboardMetrics } from "@/lib/site";

export function DashboardPreview() {
  return (
    <section className="px-4 py-section-sm sm:py-section" id="preview">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Dashboard preview</SectionEyebrow>
          <SectionTitle>Designed like a cockpit for high-volume Vinted sellers.</SectionTitle>
          <SectionLead className="mx-auto">
            Track workflows, revenue, buyer conversations, and listing health with a clean interface built for daily operations.
          </SectionLead>
        </div>

        <div className="glass-panel mt-12 overflow-hidden rounded-[2rem] p-3 sm:p-5">
          <div className="grid min-h-[620px] gap-4 rounded-[1.5rem] border border-white/10 bg-[#070a13] p-4 lg:grid-cols-[16rem_1fr]">
            <div className="hidden lg:block">
              <Sidebar
                items={[
                  { label: "Overview", icon: <BarChart3 className="size-4" />, active: true },
                  { label: "Listings", icon: <ShoppingBag className="size-4" /> },
                  { label: "Inbox", icon: <Inbox className="size-4" /> },
                  { label: "Workflows", icon: <Settings2 className="size-4" /> }
                ]}
                footer={
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-white">Extension online</p>
                    <p className="mt-1">Last sync 18 seconds ago</p>
                  </div>
                }
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {dashboardMetrics.map((metric) => (
                  <Card className="rounded-3xl p-5" key={metric.label}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                          {metric.value}
                        </p>
                      </div>
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <metric.icon className="size-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-primary">{metric.delta}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
                <Card className="min-h-[320px] p-5">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue and saves</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Automation lift</h3>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">+24.8%</span>
                  </div>
                  <div className="flex h-56 items-end gap-3">
                    {[42, 68, 52, 86, 74, 96, 82, 112, 104, 132, 118, 148].map((height, index) => (
                      <div className="flex flex-1 flex-col items-center gap-2" key={height + index}>
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-accent/45 to-primary"
                          style={{ height }}
                        />
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">Live activity</h3>
                  <div className="mt-6 space-y-3">
                    {activity.map((item) => (
                      <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={item.title}>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-primary">
                          <item.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-5 text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
