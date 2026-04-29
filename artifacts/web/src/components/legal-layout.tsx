import logoUrl from "@assets/GREEN_Color_logo_-_no_background_1777318447100.png";

const NAVY = "#1a2035";

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ffffff" }}>
      <LegalHeader />
      <main className="flex-1">{children}</main>
      <LegalFooter />
    </div>
  );
}

function LegalHeader() {
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== "undefined") {
      window.location.href = "/services-ai/";
    }
  };

  return (
    <header
      className="sticky top-0 z-30"
      style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="inline-flex items-center" aria-label="AVANA" data-testid="legal-logo">
          <img src={logoUrl} alt="AVANA" className="h-7 object-contain block" />
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "#ffffff" }}
          data-testid="legal-back"
        >
          ← Back
        </button>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer
      className="relative"
      style={{ backgroundColor: NAVY, color: "rgba(255,255,255,0.7)" }}
      data-testid="legal-footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} AVANA Services Limited. Company Number: 15268633
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Registered Office: 85 Great Portland Street, London, W1W 7LT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/terms"
              className="text-[11px] transition-colors hover:text-white/70"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Terms &amp; Conditions
            </a>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <a
              href="/privacy-policy"
              className="text-[11px] transition-colors hover:text-white/70"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
