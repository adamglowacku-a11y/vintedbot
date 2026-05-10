import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CTA } from "@/components/sections/cta";
import { DashboardPreview } from "@/components/sections/dashboard-preview";
import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DashboardPreview />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
