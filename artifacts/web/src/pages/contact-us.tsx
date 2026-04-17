import { useState } from "react";
import { Send, Building2, Mail, ArrowRight } from "lucide-react";
import logoUrl from "@assets/AVANA_Recruit_1776280304155.png";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";

export default function ContactUs() {
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialType = params.get("type");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactType, setContactType] = useState<"company" | "candidate" | null>(
    initialType === "company" ? "company" : initialType === "candidate" ? "candidate" : null
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactType) {
      toast({ title: "Please select whether you are a Company or Candidate", variant: "destructive" });
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (contactType === "company" && !form.company.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    try {
      const res = await fetch(`${basePath}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, contactType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Failed to send message", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
      setForm({ name: "", email: "", subject: "", message: "", company: "" });
      setContactType(null);
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fb" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: "rgba(26, 32, 53, 0.97)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
          </Link>
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="/#pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              Pricing
            </a>
            <Link href="/how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              How it Works
            </Link>
            <Link href="/contact-us" className="text-sm font-medium text-white hover:text-white transition-colors cursor-pointer">
              Contact Us
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/#login"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="/#signup"
              className="px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer inline-flex items-center"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
            </a>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: "72px" }}>
        <section className="py-16 lg:py-24" style={{ backgroundColor: "#1a2035" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
              Contact Us
            </p>
            <h1 className="text-3xl lg:text-[48px] font-bold leading-tight mb-4" style={{ color: "#ffffff" }}>
              Get in Touch
            </h1>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Have a question or want to learn more about how AVANA Recruit can help? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Send us a message</h2>
                  <p className="text-sm mb-6" style={{ color: "#6b7280" }}>Fill out the form below and we'll get back to you shortly.</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: "#1a2035" }}>I am a <span style={{ color: "#ef4444" }}>*</span></label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactType"
                            checked={contactType === "company"}
                            onChange={() => setContactType("company")}
                            className="w-4 h-4 accent-[#4CAF50]"
                          />
                          <span className="text-sm" style={{ color: "#374151" }}>Company</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactType"
                            checked={contactType === "candidate"}
                            onChange={() => setContactType("candidate")}
                            className="w-4 h-4 accent-[#4CAF50]"
                          />
                          <span className="text-sm" style={{ color: "#374151" }}>Candidate</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <Input
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                          required
                        />
                      </div>
                    </div>

                    {contactType === "company" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Company Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <Input
                          placeholder="Your company name"
                          value={form.company}
                          onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                          style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
                      <Input
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                        style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Message <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea
                        placeholder="Tell us more about your enquiry..."
                        value={form.message}
                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                        rows={5}
                        className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0"
                        style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", focusRingColor: "#4CAF50" }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                      <Send className="w-4 h-4 mr-2 inline" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                      <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1" style={{ color: "#1a2035" }}>Email</h3>
                      <a href="mailto:enquiries@avanarecruit.ai" className="text-sm hover:underline" style={{ color: "#4CAF50" }}>enquiries@avanarecruit.ai</a>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                      <Building2 className="w-5 h-5" style={{ color: "#4CAF50" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1" style={{ color: "#1a2035" }}>Office</h3>
                      <p className="text-sm" style={{ color: "#6b7280" }}>85 Great Portland Street, London, W1W 7LT</p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.4!2d-0.1435!3d51.5205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761ad9a4e4b5e7%3A0x5f8d9c9e0b7e8a0a!2s85%20Great%20Portland%20St%2C%20London%20W1W%207LT%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="AVANA Recruit Office Location"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ backgroundColor: "#1a2035", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoUrl} alt="AVANA Recruit" className="h-6" />
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Terms & Conditions
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <Link href="/privacy-policy" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Privacy Policy
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                © 2026 AVANA Services Limited. Company Number: 15268633
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
