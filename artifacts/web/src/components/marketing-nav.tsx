import { useState } from "react";
import type { MouseEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu, X } from "lucide-react";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";

type Active = "home" | "pricing" | "how-it-works" | "contact-us" | null;

interface MarketingNavProps {
  active?: Active;
  onSignIn?: () => void;
  onGetStarted?: () => void;
  onPricing?: () => void;
}

export function MarketingNav({ active = null, onSignIn, onGetStarted, onPricing }: MarketingNavProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const linkClass = (target: Active) =>
    `text-sm font-medium ${active === target ? "text-white" : "text-white/70"} hover:text-white transition-colors cursor-pointer`;
  const mobileLinkClass = (target: Active) =>
    `block w-full text-left px-4 py-3 text-base font-medium rounded-md ${active === target ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/5"} transition-colors cursor-pointer`;

  const handleLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(26, 32, 53, 0.97)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
          <span className="text-sm font-semibold leading-none -ml-2 self-end pb-0.5" style={{ color: "#4CAF50" }}>.ai</span>
        </a>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {onPricing ? (
            <a
              href="#pricing"
              onClick={(e) => { e.preventDefault(); onPricing(); }}
              className={linkClass("pricing")}
            >
              Pricing
            </a>
          ) : (
            <a href="/#pricing" className={linkClass("pricing")}>Pricing</a>
          )}
          <Link href="/how-it-works" className={linkClass("how-it-works")}>
            How it Works
          </Link>
          <Link href="/contact-us" className={linkClass("contact-us")}>
            Contact Us
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {onSignIn ? (
            <button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <a
              href="/#login"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </a>
          )}
          {onGetStarted ? (
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer inline-flex items-center"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
            </button>
          ) : (
            <a
              href="/#signup"
              className="px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer inline-flex items-center"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
            </a>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ backgroundColor: "rgba(26, 32, 53, 0.98)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="px-4 py-3 space-y-1">
            {onPricing ? (
              <a
                href="#pricing"
                onClick={(e) => { e.preventDefault(); setMobileOpen(false); onPricing(); }}
                className={mobileLinkClass("pricing")}
              >
                Pricing
              </a>
            ) : (
              <a href="/#pricing" onClick={() => setMobileOpen(false)} className={mobileLinkClass("pricing")}>Pricing</a>
            )}
            <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className={mobileLinkClass("how-it-works")}>
              How it Works
            </Link>
            <Link href="/contact-us" onClick={() => setMobileOpen(false)} className={mobileLinkClass("contact-us")}>
              Contact Us
            </Link>

            <div className="h-px bg-white/10 my-2" />

            {onSignIn ? (
              <button
                onClick={() => { setMobileOpen(false); onSignIn(); }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <a
                href="/#login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              >
                Sign In
              </a>
            )}
            {onGetStarted ? (
              <button
                onClick={() => { setMobileOpen(false); onGetStarted(); }}
                className="w-full px-4 py-3 text-base font-medium rounded-md transition-all cursor-pointer inline-flex items-center justify-center"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </button>
            ) : (
              <a
                href="/#signup"
                onClick={() => setMobileOpen(false)}
                className="w-full px-4 py-3 text-base font-medium rounded-md transition-all cursor-pointer inline-flex items-center justify-center"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
