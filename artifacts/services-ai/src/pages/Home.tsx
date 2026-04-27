import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { ProductSection } from "@/components/ProductSection";
import { MatchReportPanel } from "@/components/MatchReportPanel";
import { OnboardingTimelinePanel } from "@/components/OnboardingTimelinePanel";
import { DocsChatPanel } from "@/components/DocsChatPanel";
import { InsightsPanel } from "@/components/InsightsPanel";
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
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Explore Our Portfolio →
              </button>
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

      {/* AVANA Recruit */}
      <ProductSection
        id="recruit"
        eyebrow="AVANA RECRUIT"
        heading="Your Strategic Partner in Talent Acquisition"
        sub="Whether you're looking to hire top talent or find your next career move, AVANA Recruit's AI engine works for both sides of the recruitment equation."
        features={[
          { title: "For Companies", description: "Post jobs, receive AI-ranked candidate matches, and manage your recruitment pipeline from a single dashboard." },
          { title: "For Candidates", description: "Create your profile, browse opportunities, and see how well you match against each role with detailed AI scoring." },
          { title: "Secure & Private", description: "Your data is protected with enterprise-grade security. We never share your information without consent." }
        ]}
        ctaText="Visit AVANA Recruit"
        ctaHref="https://avanarecruit.ai/"
        reversed={false}
      >
        <MatchReportPanel />
      </ProductSection>

      {/* AVANA Onboard */}
      <ProductSection
        id="onboard"
        eyebrow="AVANA ONBOARD"
        badge="COMING SOON"
        heading="From hired to productive — automatically."
        sub="A one-click handoff from AVANA Recruit's Hired stage triggers a fully personalised onboarding journey — built around the new hire's role, skills profile, and six match dimension scores."
        features={[
          { title: "One-click handoff", description: "Triggered automatically from AVANA Recruit's Hired pipeline stage." },
          { title: "Personalised 30/60/90 plans", description: "AI-generated onboarding tailored to each new hire's profile." },
          { title: "Digital document pack", description: "Contracts, policies and HMRC forms — sent and e-signed in-platform." },
          { title: "AI sentiment analysis", description: "Flags at-risk new hires early based on check-in patterns." }
        ]}
        footerText="Visit avanaonboard.ai"
        reversed={true}
      >
        <OnboardingTimelinePanel />
      </ProductSection>

      {/* AVANA Docs */}
      <ProductSection
        id="docs"
        eyebrow="AVANA DOCS"
        badge="COMING SOON"
        heading="Talk to your documents."
        sub="Upload PDFs, contracts, job specs, manuals or HR policies and ask questions in plain English. The intelligence layer that sits on top of every document your business depends on — no technical skill required."
        features={[
          { title: "Drag-and-drop upload", description: "PDF, DOCX and TXT supported out of the box." },
          { title: "Conversational interface", description: "Ask in plain English and receive instant, sourced answers." },
          { title: "Side-by-side comparison", description: "Compare offers, contracts or policies dimension by dimension." },
          { title: "Auto-summary & key points", description: "AI-highlighted insights and annotations on every document." }
        ]}
        footerText="Visit avanadocs.ai"
        reversed={false}
      >
        <DocsChatPanel />
      </ProductSection>

      {/* AVANA Insights */}
      <ProductSection
        id="insights"
        eyebrow="AVANA INSIGHTS"
        badge="LIVE"
        heading="Unify any business data — no SQL required."
        sub="Industry-agnostic data consolidation. Ingest from spreadsheets, CRMs, databases and SaaS tools, and let AI clean, unify, and surface answers across your entire business in plain English."
        features={[
          { title: "Pre-built connectors", description: "Sheets, HubSpot, Salesforce, Xero, Shopify, PostgreSQL & more." },
          { title: "AI-powered cleaning", description: "Auto-detect duplicates, fill gaps and flag anomalies across sources." },
          { title: "Natural language querying", description: "Ask 'top revenue sources last quarter?' — no SQL required." },
          { title: "Data lineage tracking", description: "Always know exactly where each data point originated." }
        ]}
        ctaText="Visit AVANA Insights"
        ctaHref="https://avana-insights.replit.app/"
        reversed={true}
      >
        <InsightsPanel />
      </ProductSection>

      <ArchitectureSection />
      
      <FAQSection />

      <ContactSection />

      <SiteFooter />
    </div>
  );
}
