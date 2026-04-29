import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { FAQSection } from "@/components/FAQSection";
import { ContactSection } from "@/components/ContactSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SiteHeader />
      
      {/* Hero */}
      <section className="relative" style={{ backgroundColor: "#1a2035", paddingTop: "72px" }}>
        <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: "72px" }}>
          <div
            className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-28 lg:py-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: "#4CAF50" }}
            >
              STRATEGIC AI SERVICES PARTNER
            </p>

            <h1
              className="text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6"
              style={{ color: "#ffffff" }}
            >
              Building <span style={{ color: "#4CAF50" }}>Vertical AI</span> for the
              <br /><span style={{ color: "#4CAF50" }}>Modern Enterprise</span>.
            </h1>

            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              AVANA Services designs and ships enterprise-grade AI products that solve mission-critical operational challenges — from talent acquisition and workforce onboarding to knowledge management and decision intelligence.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/services-ai/our-portfolio"
                className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90 inline-block"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                data-testid="hero-explore-portfolio"
              >
                Explore Our Portfolio →
              </a>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-sm font-semibold rounded-md border transition-all cursor-pointer hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", backgroundColor: "transparent" }}
              >
                Partner With Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <PortfolioGrid />

      <ArchitectureSection />
      
      <FAQSection />

      <ContactSection />

      <SiteFooter />
    </div>
  );
}
