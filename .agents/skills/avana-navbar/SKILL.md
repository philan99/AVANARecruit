---
name: avana-navbar
description: Build the canonical AVANA top navbar (fixed, dark navy #1A2035, green #4CAF50 logo accent + green CTA, mobile drawer). Use when the user asks for "the AVANA navbar", "the same navbar as AVANA Recruit / Services / Insights", "matching header / top bar", "site header that matches the brand", or wants to add a marketing-style navbar to a new artifact in this monorepo. Drops in a Wouter-aware SiteHeader component with logo (PNG + ".ai" suffix variant), centered nav links, right-side green primary CTA, scroll-aware blur, mobile hamburger drawer, and the project's standard data-testids. Two variants are supported: `services-ai` style (transparent → blurred on scroll, scroll-to-anchor links, single CTA) and `recruit` style (always-on dark, absolutely-centered nav, Sign In + Get Started pair, optional active-route prop). Do NOT use this skill for the logged-in `artifacts/web` app shell (that uses sidebar + role-based dropdown — see `artifacts/web/src/components/layout.tsx`).
---

# AVANA Navbar

The shared marketing-site navbar pattern used across `artifacts/services-ai`, `artifacts/web` (marketing pages), and any new public-facing AVANA artifact. Fixed-position, dark navy `#1A2035`, green `#4CAF50` accents, mobile drawer.

## When to Use This Skill

- User asks for an "AVANA navbar", "matching header", "same nav as Recruit/Services", or "site header that matches the brand".
- User is bootstrapping a new public-facing artifact in this monorepo and needs the brand top bar.
- User wants to swap out an off-brand header in an AVANA artifact.

## When NOT to Use

- Logged-in app shells (e.g. `artifacts/web/src/components/layout.tsx`) — they use a sidebar-style top bar with role-based items, profile dropdown, and sign-out dialog. Modify that file directly.
- The Insights authenticated app (uses `InsightsSidebar`, not a top navbar).

## Design Tokens (mandatory)

| Token | Value | Use |
|---|---|---|
| Navy | `#1A2035` | Background of header + mobile drawer |
| Green | `#4CAF50` | Logo `.ai` suffix, primary CTA, `Get Started` |
| Green hover | `#43a047` | Primary CTA hover |
| White / 80% | `#FFFFFF` / `text-white/80` | Default link colour |
| White / 10% | `border-white/10` | Mobile drawer divider |

Always pin the dark surface inline with the literal hex (`bg-[#1A2035]` or `style={{ backgroundColor: "#1A2035" }}`) — do **not** rely on `bg-background` / theme variables here, because this header sits over hero sections in both light and dark surfaces and must stay navy.

## Two Variants

Pick the variant that matches the artifact's nav model:

### Variant A — `services-ai` style (single CTA, scroll-to-anchor)

Use when the page is a long single-page marketing site with section anchors (`#services`, `#faq`, `#pricing`).

- Transparent over hero → adds `bg-[#1A2035]/95 backdrop-blur-md` after `scrollY > 20`.
- Logo on the left (PNG + absolutely-positioned green `.ai` suffix).
- Inline-flex nav in the centre-right (Portfolio / FAQ / Contact Us).
- Single green `Partner With Us` CTA on the right.
- Mobile hamburger expands a stacked drawer with the same items + full-width CTA.

Reference implementation: `artifacts/services-ai/src/components/SiteHeader.tsx`.

### Variant B — `recruit` style (Sign In + Get Started pair, route-aware)

Use when the artifact has multiple top-level marketing routes (`/pricing`, `/how-it-works`, `/contact-us`) and a separate sign-in flow.

- Always-on dark navy with `backdrop-filter: blur(12px)` and `rgba(26,32,53,0.97)` background.
- Absolutely-centered nav links (`absolute left-1/2 -translate-x-1/2`) so the logo and CTAs anchor the edges.
- `active` prop highlights the current route in solid white.
- Sign In (text link) + Get Started (green, with `ArrowRight` icon) on the right.
- Each link supports an optional callback prop (`onPricing`, `onSignIn`, `onGetStarted`) for in-page handlers; falls back to `<a href>` navigation otherwise.

Reference implementation: `artifacts/web/src/components/marketing-nav.tsx`.

## Drop-in Procedure

### 1. Confirm prerequisites in the target artifact

The artifact must already have:

- Wouter (`useLocation`, `Link`) — every artifact in this monorepo uses it.
- `lucide-react` (for `Menu`, `X`, `ArrowRight`).
- shadcn `Button` at `@/components/ui/button` (Variant A only — Variant B uses raw buttons).
- A logo PNG in `attached_assets/` and the `@assets/*` Vite alias (already configured in every artifact).
- Tailwind v4 with the standard AVANA tokens. If missing, run the `avana-design-system` skill first.

### 2. Choose the variant and copy the file

Variant A → save as `src/components/SiteHeader.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/<LOGO_FILE>.png"; // green-on-transparent variant

interface SiteHeaderProps {
  /** Wouter base path for cross-artifact links, e.g. "/services-ai". Empty for root-mounted artifacts. */
  basePath?: string;
}

export function SiteHeader({ basePath = "" }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
      window.scrollTo({ top: 0 });
    }
  };

  const scrollToId = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnchorClick = (id: string) => (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (location === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${
        isScrolled ? "bg-[#1A2035]/95 backdrop-blur-md" : "bg-[#1A2035]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <a
          href={`${basePath}/`}
          onClick={handleLogoClick}
          aria-label="AVANA — Home"
          className="cursor-pointer inline-block"
          data-testid="site-logo"
        >
          <div className="relative inline-block">
            <img src={logoUrl} alt="AVANA" className="h-10 object-contain block" />
            <span className="absolute bottom-[1px] -right-[14px] text-[#4CAF50] text-sm tracking-tight leading-none">
              .ai
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href={`${basePath}/#services`}
            onClick={handleAnchorClick("services")}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Portfolio
          </a>
          <button
            onClick={() => scrollToId("faq")}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            FAQ
          </button>
          <a
            href={`${basePath}/contact-us`}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Contact Us
          </a>
        </nav>

        <div className="hidden md:block">
          <a href={`${basePath}/contact-us`}>
            <Button className="bg-[#4CAF50] text-white hover:bg-[#43a047] font-semibold rounded-md px-6 transition-all border-none no-default-hover-elevate">
              Partner With Us
            </Button>
          </a>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#1A2035] border-b border-white/10 p-6 flex flex-col gap-4 shadow-xl">
          <a
            href={`${basePath}/#services`}
            onClick={handleAnchorClick("services")}
            className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5"
          >
            Portfolio
          </a>
          <button
            onClick={() => scrollToId("faq")}
            className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5"
          >
            FAQ
          </button>
          <a
            href={`${basePath}/contact-us`}
            className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5"
          >
            Contact Us
          </a>
          <a href={`${basePath}/contact-us`} className="block mt-4">
            <Button className="w-full bg-[#4CAF50] text-white hover:bg-[#43a047] font-semibold rounded-md border-none">
              Partner With Us
            </Button>
          </a>
        </div>
      )}
    </header>
  );
}
```

Variant B → save as `src/components/MarketingNav.tsx`:

```tsx
import { useState } from "react";
import type { MouseEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu, X } from "lucide-react";
import logoUrl from "@assets/<LOGO_FILE>.png";

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
    `block w-full text-left px-4 py-3 text-base font-medium rounded-md ${
      active === target ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/5"
    } transition-colors cursor-pointer`;

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
      style={{ backgroundColor: "rgba(26, 32, 53, 0.97)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
        </a>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {onPricing ? (
            <a href="#pricing" onClick={(e) => { e.preventDefault(); onPricing(); }} className={linkClass("pricing")}>
              Pricing
            </a>
          ) : (
            <a href="/#pricing" className={linkClass("pricing")}>Pricing</a>
          )}
          <Link href="/how-it-works" className={linkClass("how-it-works")}>How it Works</Link>
          <Link href="/contact-us" className={linkClass("contact-us")}>Contact Us</Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {onSignIn ? (
            <button onClick={onSignIn} className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          ) : (
            <a href="/#login" className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer">
              Sign In
            </a>
          )}
          {onGetStarted ? (
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer inline-flex items-center"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
            </button>
          ) : (
            <a
              href="/#signup"
              className="px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer inline-flex items-center"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
            </a>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
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
            {/* Mirror the desktop links here using mobileLinkClass(...) — each link must call setMobileOpen(false) on click. */}
          </div>
        </div>
      )}
    </nav>
  );
}
```

### 3. Mount it

Marketing layout (Variant A):

```tsx
// src/pages/Home.tsx (and every other public page)
<>
  <SiteHeader />
  <main>{/* hero must add top padding equal to header height (~72px) */}</main>
  <SiteFooter />
</>
```

The header is `position: fixed`, so the first section of the page must include `pt-20 md:pt-24` (or the equivalent of the header's `py-4 + content height`) to avoid being hidden under it.

Multi-page marketing site (Variant B):

```tsx
// src/pages/Pricing.tsx
<MarketingNav active="pricing" onSignIn={openLoginModal} onGetStarted={openSignupModal} />
```

## Cross-Artifact Linking

When a navbar in artifact A links to a page hosted by artifact B (e.g. AVANA Services → AVANA Insights), use a plain `<a href="/insights/...">` — do **not** use Wouter's `<Link>` (it stays inside the current artifact's router). Each artifact is mounted under a path prefix by the shared proxy.

For *internal* links inside the same artifact, prefer Wouter `<Link>` so navigation stays SPA. Anchor links inside the same page (`#faq`, `#services`) should use `scrollIntoView({ behavior: "smooth" })` rather than relying on browser hash navigation, because the fixed header would otherwise hide the section heading.

## Required `data-testid`s

Every navbar must expose these for the testing skill:

- `data-testid="site-logo"` on the logo `<a>`.
- `data-testid="nav-<slug>"` on each desktop link (e.g. `nav-portfolio`, `nav-pricing`, `nav-faq`, `nav-contact-us`).
- `data-testid="nav-cta"` on the right-side primary CTA.
- `data-testid="mobile-menu-toggle"` on the hamburger button.
- `data-testid="mobile-menu"` on the mobile drawer container when open.

Add these whenever you customize a copied template.

## Common Pitfalls

- **Hard-coded `/services-ai/` paths leaking into a new artifact.** Always parameterize cross-artifact paths via the `basePath` prop or a constant. Otherwise the new artifact's nav will jump the user back to AVANA Services on every click.
- **Forgetting top padding on the first page section.** The header is fixed; the hero will render *under* it unless you add `pt-20` (or matching) to the first section. Symptoms: clipped headline, logo overlapping hero text.
- **Using `bg-background` instead of the literal navy.** Theme tokens flip between light/dark; the header must stay navy regardless.
- **Wrapping cross-artifact links in `<Link>`.** Wouter intercepts and stays in the current artifact's router — the user sees a 404 inside the wrong app.
- **Skipping the mobile drawer.** Every AVANA navbar ships with the hamburger drawer; do not delete it just because the desktop view works.
- **Two CTAs in Variant A.** Variant A has exactly one right-side CTA (`Partner With Us`). If the artifact needs Sign In + Get Started, switch to Variant B instead of bolting on a second button.

## Reference Files

- Variant A live source: `artifacts/services-ai/src/components/SiteHeader.tsx`
- Variant B live source: `artifacts/web/src/components/marketing-nav.tsx`
- Logged-in app shell (do NOT use this skill for it): `artifacts/web/src/components/layout.tsx`
- Brand tokens: see the `avana-design-system` skill at `.agents/skills/avana-design-system/SKILL.md`.
