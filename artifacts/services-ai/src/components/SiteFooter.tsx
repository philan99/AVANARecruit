import logoUrl from "@assets/GREEN_Color_logo_-_no_background_1777318447100.png";

const NAVY = "#1a2035";
const GREEN = "#4CAF50";

export function SiteFooter() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: NAVY, color: "rgba(255,255,255,0.7)" }}
      data-testid="brand-footer"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block mb-5"
              aria-label="Back to top"
            >
              <span className="relative inline-block">
                <img
                  src={logoUrl}
                  alt="AVANA Services"
                  className="h-14 object-contain block"
                />
                <span
                  className="absolute bottom-[3px] -right-[22px] text-sm tracking-tight leading-none font-medium"
                  style={{ color: GREEN }}
                >
                  .ai
                </span>
              </span>
            </button>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              AI-native services for modern teams — recruit faster, onboard smarter, and turn your documentation into answers.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="/services-ai/our-portfolio#recruit">Recruit</FooterLink></li>
              <li><FooterLink href="/services-ai/our-portfolio#onboard">Onboard</FooterLink></li>
              <li><FooterLink href="/services-ai/our-portfolio#docs">Docs Chat</FooterLink></li>
              <li><FooterLink href="/services-ai/our-portfolio#insights">Insights</FooterLink></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              AVANA Suite
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="https://avanarecruit.ai/">AVANA Recruit</FooterLink></li>
              <li><FooterLink href="/services-ai/our-portfolio#onboard">AVANA Onboard</FooterLink></li>
              <li><FooterLink href="/services-ai/our-portfolio#docs">AVANA Docs</FooterLink></li>
              <li><FooterLink href="https://avana-talent-match.replit.app/insights/">AVANA Insights</FooterLink></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              Get Started
            </h4>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              Want to see AVANA Services AI in action? Get in touch and we'll set up a tailored walkthrough.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all"
              style={{ backgroundColor: GREEN, color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              data-testid="footer-contact"
            >
              Contact Us
            </a>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="space-y-1">
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} AVANA Services Limited. Company Number: 15268633
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Registered Office: 85 Great Portland Street, London, W1W 7LT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/services-ai/terms"
              className="text-[11px] transition-colors hover:text-white/50"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Terms &amp; Conditions
            </a>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a
              href="/services-ai/privacy-policy"
              className="text-[11px] transition-colors hover:text-white/50"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="transition-colors"
      style={{ color: "rgba(255,255,255,0.6)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
    >
      {children}
    </a>
  );
}
