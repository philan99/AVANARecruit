import { useEffect } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { ContactSection } from "@/components/ContactSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function ContactUs() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SiteHeader />

      {/* Page Hero */}
      <section
        className="relative"
        style={{ backgroundColor: "#1a2035", paddingTop: "72px" }}
        data-testid="contact-hero"
      >
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

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
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
              CONTACT US
            </p>

            <h1
              className="text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6"
              style={{ color: "#ffffff" }}
            >
              Get in Touch
            </h1>

            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Have a question or want to learn more about how the AVANA Suite can help your organisation? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <ContactSection />

      <SiteFooter />
    </div>
  );
}
