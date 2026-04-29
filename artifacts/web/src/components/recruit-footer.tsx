import { Link } from "wouter";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";

const NAVY = "#1a2035";
const GREEN = "#4CAF50";

export function RecruitFooter() {
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
            <Link href="/" className="inline-block mb-5">
              <img src={logoUrl} alt="AVANA Recruit" className="h-7 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              AI-powered talent matching — match candidates and companies across six weighted dimensions, with verified credentials and bias-free screening.
            </p>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mt-6" style={{ color: GREEN }}>
              Part of the AVANA Suite
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterInternalLink href="/browse-jobs">Browse Jobs</FooterInternalLink></li>
              <li><FooterInternalLink href="/browse-companies">Browse Companies</FooterInternalLink></li>
              <li><FooterInternalLink href="/how-it-works">How It Works</FooterInternalLink></li>
              <li><FooterInternalLink href="/contact-us">Contact Us</FooterInternalLink></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              AVANA Suite
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterInternalLink href="/">AVANA Recruit</FooterInternalLink></li>
              <li><FooterExternalLink href="/services-ai/#onboard">AVANA Onboard</FooterExternalLink></li>
              <li><FooterExternalLink href="/services-ai/#docs">AVANA Docs</FooterExternalLink></li>
              <li><FooterExternalLink href="/insights/">AVANA Insights</FooterExternalLink></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              Get Started
            </h4>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              Whether you're hiring or looking for your next role, AVANA Recruit connects the right people in minutes.
            </p>
            <Link
              href="/role-select"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: GREEN, color: "#fff" }}
              data-testid="footer-get-started"
            >
              Get Started
            </Link>
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
              href="/terms"
              className="text-[11px] transition-colors hover:text-white/50"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Terms &amp; Conditions
            </a>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a
              href="/privacy-policy"
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

export function RecruitFooterCompact() {
  return (
    <footer
      className="relative"
      style={{ backgroundColor: NAVY, color: "rgba(255,255,255,0.7)" }}
      data-testid="brand-footer-compact"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/" className="inline-block shrink-0">
              <img src={logoUrl} alt="AVANA Recruit" className="h-5 w-auto" />
            </Link>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} AVANA Services Limited. Company Number: 15268633
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/terms"
              className="text-[11px] transition-colors hover:text-white/50"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Terms &amp; Conditions
            </a>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a
              href="/privacy-policy"
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

function FooterInternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="transition-colors hover:text-[#4CAF50]"
      style={{ color: "rgba(255,255,255,0.6)" }}
    >
      {children}
    </Link>
  );
}

function FooterExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-[#4CAF50]"
      style={{ color: "rgba(255,255,255,0.6)" }}
    >
      {children}
    </a>
  );
}
