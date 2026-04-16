import { useState } from "react";
import { Send, Building2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";

export default function PortalContactUs() {
  const { toast } = useToast();
  const { role, userEmail } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactType = role === "company" ? "company" : "candidate";
  const [form, setForm] = useState({
    name: "",
    email: userEmail || "",
    subject: "",
    message: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setForm({ name: "", email: userEmail || "", subject: "", message: "", company: "" });
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Have a question or need help? Send us a message and we'll get back to you shortly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="rounded-xl p-8 bg-card border">
            <h2 className="text-lg font-semibold mb-1 text-foreground">Send us a message</h2>
            <p className="text-sm mb-6 text-muted-foreground">Fill out the form below and we'll get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {contactType === "company" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Name <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="Your company name"
                    value={form.company}
                    onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject <span className="text-destructive">*</span></label>
                <Input
                  placeholder="What is this about?"
                  value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message <span className="text-destructive">*</span></label>
                <textarea
                  placeholder="Tell us more about your enquiry..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background border-input"
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
          <div className="rounded-xl p-6 bg-card border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1 text-foreground">Email</h3>
                <a href="mailto:enquiries@avanarecruit.ai" className="text-sm hover:underline" style={{ color: "#4CAF50" }}>enquiries@avanarecruit.ai</a>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-card border">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                <Building2 className="w-5 h-5" style={{ color: "#4CAF50" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1 text-foreground">Office</h3>
                <p className="text-sm text-muted-foreground">85 Great Portland Street, London, W1W 7LT</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border">
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
  );
}
