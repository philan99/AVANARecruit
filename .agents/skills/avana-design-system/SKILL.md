---
name: avana-design-system
description: Apply the AVANA Recruit / TalentMatch look and feel to a React + Tailwind + shadcn/ui project, including the standard branded hero section. Use when the user asks for "the same design", "the AVANA design system", "the same colour palette", "match my other app's style", or wants to bootstrap a new project with the navy + green brand, Inter font, tight 0.25rem radius, and stark light / cream-on-navy dark themes. Also use when the user asks to add a hero / top banner / landing-style header section to any AVANA / TalentMatch page or wants a hero that "matches the homepage" / "matches the brand". Drops in a complete tailwind v4 theme (CSS variables for colours, sidebar, charts, fonts, radius, shadows), a shadcn `components.json`, the project's button/sidebar conventions (hover-elevate, primary-border buttons, navy sidebar with green accent), and the canonical dark-navy hero with green radial glows + green-emphasis headline + green primary / outline secondary CTA pair.
---

# AVANA Design System

A reusable design system extracted from the AVANA Recruit / TalentMatch web app. Use it to give a new React project the same visual identity in a single drop-in.

## What It Includes

- **Brand palette**
  - Primary green ~ `#4CAF50` (HSL `122 39% 49%`)
  - Sidebar navy ~ `#1a2035` (HSL `224 35% 16%`)
  - Stark off-white background `220 20% 97%`, deep navy text `224 35% 16%`
- **Dual themes**
  - Light: high-contrast / stark
  - Dark: cream-on-navy "terminal / cockpit" (cream `54 72% 91%` on navy `228 21% 15%`)
- **Typography**: Inter (sans), JetBrains Mono (mono), Georgia (serif)
- **Radius**: tight `0.25rem` base — `rounded-md` everywhere, no marshmallow corners
- **Charts**: 5 token chart palette (`--chart-1`…`--chart-5`) per theme
- **Sidebar tokens**: full set (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-ring`, …)
- **Auto-derived borders**: `--*-border` tokens use CSS relative-color syntax (`hsl(from … h s calc(l + var(--opaque-button-border-intensity)) / alpha)`) so primary/secondary/sidebar buttons always have a slightly darker (light mode) or lighter (dark mode) edge — no manual border-color tweaking
- **Hover/active elevation system**: `--elevate-1` / `--elevate-2` semi-transparent overlays so the same `hover-elevate active-elevate-2` utilities work on dark or light backgrounds

## Stack Assumptions

- React 18+, TypeScript
- Vite (the project uses `@tailwindcss/vite`)
- **Tailwind CSS v4** (uses `@theme inline` and `@import "tailwindcss"` — NOT v3 `tailwind.config.js`)
- shadcn/ui ("new-york" style, baseColor `neutral`)
- `@/*` path alias resolving to `src/*`

## Drop-in Procedure

Run from the target project root.

### 1. Install runtime dependencies

```bash
pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography tw-animate-css \
  class-variance-authority clsx tailwind-merge lucide-react \
  @radix-ui/react-slot
```

(Add other `@radix-ui/react-*` packages as you adopt more shadcn components.)

### 2. Wire Tailwind v4 into Vite

`vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

### 3. Copy the theme

Copy `reference/index.css` from this skill to `src/index.css` and import it from `src/main.tsx`:

```ts
import "./index.css";
```

This single file defines:
- The Tailwind v4 `@theme inline` mapping
- `:root` (light) and `.dark` token sets
- The `@layer base` reset (border-border on all, body uses sans + bg-background + text-foreground)
- Search input + contenteditable placeholder utilities

Do NOT also create a `tailwind.config.js`. v4 reads everything from CSS.

### 4. Copy the shadcn config

Copy `reference/components.json` to the project root. Then init or add components:

```bash
pnpm dlx shadcn@latest add button card input label dialog dropdown-menu
```

Components install into `src/components/ui/` and automatically pick up the CSS variables.

### 5. Apply the project's button conventions

Edit `src/components/ui/button.tsx` after shadcn creates it so variants match this project. The crucial deltas vs vanilla shadcn:

- Base classes append `hover-elevate active-elevate-2` (these are the elevation utilities driven by `--elevate-1` / `--elevate-2`).
- `default`: `bg-primary text-primary-foreground border border-primary-border` (note the explicit primary border, no hover override).
- `outline`: `border [border-color:var(--button-outline)] shadow-xs active:shadow-none` — inherits text colour, transparent on whatever surface it sits on.
- `secondary`: `border bg-secondary text-secondary-foreground border-secondary-border`.
- `ghost`: `border border-transparent` (no hover bg — relies on the elevate utility).
- Sizes are slightly taller: `default min-h-9`, `sm min-h-8`, `lg min-h-10`, `icon h-9 w-9`.

You only need the elevate utilities to actually do something visually — they are pure CSS classes you add to your global CSS:

```css
@layer utilities {
  .hover-elevate { position: relative; }
  .hover-elevate::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit;
    background: var(--elevate-1); opacity: 0; transition: opacity .15s;
    pointer-events: none;
  }
  .hover-elevate:hover::after { opacity: 1; }
  .active-elevate-2:active::after { background: var(--elevate-2); opacity: 1; }
}
```

### 6. Sidebar / header pattern

The signature look is a **navy sidebar with a green accent ring** plus a small uppercase mono "portal label" in the top-right:

```tsx
<header className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
  {/* logo + nav links use text-sidebar-foreground/70 with hover:bg-sidebar-accent */}
  <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 font-mono">
    {portalLabel}
  </span>
</header>
```

Key choices to preserve the vibe:
- Active nav item: `bg-sidebar-accent text-sidebar-primary` (green text on slightly lighter navy)
- Inactive: `text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground`
- Tiny labels (10px), uppercase, `tracking-widest`, mono font for "section" / "portal" markers
- Email / secondary text at `text-sidebar-foreground/45` so it recedes

### 7. Dark mode

Toggle by adding/removing `dark` on `<html>` (or any ancestor — `@custom-variant dark (&:is(.dark *))` makes both work). Minimal toggle:

```ts
document.documentElement.classList.toggle("dark");
```

## Customising For a New Brand

Most projects only need to swap two HSL values to rebrand while keeping the same overall feel:

| Token             | Light value (current) | What to change to rebrand |
| ----------------- | --------------------- | ------------------------- |
| `--primary`       | `122 39% 49%`         | Your accent / CTA colour  |
| `--sidebar`       | `224 35% 16%`         | Your dark surface colour  |
| `--sidebar-primary` / `--ring` / `--sidebar-ring` | `122 39% 49%` | Match `--primary` |

Convert hex → HSL once and replace all occurrences in `:root`. The auto-derived `--*-border` tokens recompute from the new HSL automatically — you don't have to touch them.

For dark-mode rebrand, change `--background`, `--foreground`, `--primary` in `.dark`. The current dark theme uses cream-on-navy as a deliberate "terminal" aesthetic; if you want a more conventional dark theme, use a near-white `--foreground` (e.g. `210 40% 98%`) and a saturated `--primary`.

## Reference Files

- `reference/index.css` — full theme, ready to copy to `src/index.css`
- `reference/components.json` — shadcn/ui config, ready to copy to project root

## Sanity Check

After dropping in, the following should look correct without any further work:

- Default `<Button>` is solid green with white text and a slightly darker green outline
- `<Card>` is white in light mode, dark navy-grey in dark mode, with a subtle border
- Body text is deep navy on a near-white background
- A `bg-sidebar` element renders in brand navy with cream-ish text
- Focus rings show in the brand green

---

## Hero Section

Reproduces the hero from the public homepage (`artifacts/web/src/pages/role-select.tsx`, lines ~427–462). Use this whenever a page needs a dark, branded landing-style hero so every hero on the platform looks the same.

### Visual contract

| Layer | Token | Value |
|---|---|---|
| Section background | navy | `#1a2035` |
| Decorative glows | green radial gradients | `#4CAF50` at opacity `0.04` (top-right, 600px) + `0.03` (bottom-left, 400px) |
| Top padding | reserves space for fixed nav (when present) | `paddingTop: "72px"` |
| Vertical padding | section breathing room | `py-28 lg:py-40` |
| Content container | width + gutters | `max-w-7xl mx-auto px-6 lg:px-10` |
| Inner stack | width + alignment | `max-w-3xl mx-auto text-center` |
| Eyebrow | small green uppercase tagline | `text-xs font-semibold tracking-[0.2em] uppercase mb-6`, color `#4CAF50` |
| Headline (H1) | large white display heading | `text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6`, color `#ffffff` |
| Headline emphasis | inline green spans | `<span style={{ color: "#4CAF50" }}>…</span>` for 1–3 key phrases |
| Sub-paragraph | muted white intro copy | `text-lg leading-relaxed max-w-xl mx-auto mb-10`, color `rgba(255,255,255,0.55)` |
| CTA row | wraps, centered, 16px gap | `flex flex-wrap justify-center gap-4` |
| Primary CTA | filled green button | `px-8 py-3.5 text-sm font-semibold rounded-md`, bg `#4CAF50`, text `#fff`, `hover:opacity-90` |
| Secondary CTA | outline button on navy | `px-8 py-3.5 text-sm font-semibold rounded-md border`, border `rgba(255,255,255,0.2)`, text `#fff`, transparent bg, `hover:bg-white/5` |

### Drop-in component

Copy this verbatim and only change the **eyebrow text, headline, emphasis spans, sub-paragraph, button labels, and click handlers**. Do not change colours, sizes, spacing, or structure.

```tsx
<section className="relative" style={{ backgroundColor: "#1a2035", paddingTop: "72px" }}>
  {/* Decorative green radial glows — keep as-is */}
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
    <div className="max-w-3xl mx-auto text-center">
      {/* Eyebrow */}
      <p
        className="text-xs font-semibold tracking-[0.2em] uppercase mb-6"
        style={{ color: "#4CAF50" }}
      >
        EYEBROW TAGLINE
      </p>

      {/* Headline — use <span style={{ color: "#4CAF50" }}> for emphasis */}
      <h1
        className="text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6"
        style={{ color: "#ffffff" }}
      >
        Plain words and <span style={{ color: "#4CAF50" }}>green emphasis</span>
        <br />on the <span style={{ color: "#4CAF50" }}>second line</span>.
      </h1>

      {/* Sub-paragraph */}
      <p
        className="text-lg leading-relaxed max-w-xl mx-auto mb-10"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        One or two sentences explaining the value proposition. Keep it under ~40 words so it stays one paragraph at desktop width.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => {/* primary action */}}
          className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90"
          style={{ backgroundColor: "#4CAF50", color: "#fff" }}
        >
          Primary CTA
        </button>
        <button
          onClick={() => {/* secondary action */}}
          className="px-8 py-3.5 text-sm font-semibold rounded-md border transition-all cursor-pointer hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", backgroundColor: "transparent" }}
        >
          Secondary CTA
        </button>
      </div>
    </div>
  </div>
</section>
```

### Content rules

- **Eyebrow**: 2–5 words, sentence-case in source but rendered uppercase via `uppercase`. Examples: "AI-Powered Recruitment Platform", "For Hiring Teams", "Candidate Workspace".
- **Headline**: 6–12 words across two lines (use `<br />`). Wrap **1–3 key phrases** in `<span style={{ color: "#4CAF50" }}>…</span>` for green emphasis. Keep the trailing punctuation (period) for a confident finish.
- **Sub-paragraph**: ≤ 40 words. Single sentence preferred. No bold, no links — keep visual density low.
- **CTAs**: Always two — green primary + outline secondary. If only one action makes sense, drop the secondary rather than centring a single button alone (still works, but pair is the standard).

### When the page has no top nav

If the hero is on a page **without** the fixed `<MarketingNav />` (72px tall), remove both `paddingTop: "72px"` declarations (on the `<section>` and on the inner `<div className="absolute inset-0 …">`) so the hero starts flush at the top.

### What NOT to change

These are intentional and load-bearing for brand consistency:

- Navy background `#1a2035` and green accent `#4CAF50` — use these literal hex codes, not Tailwind colour utilities.
- The two radial-gradient glows (size, position, opacity).
- `max-w-3xl` on the inner stack — this caps headline line length at the readable sweet spot.
- `text-xs` eyebrow with `tracking-[0.2em]` — narrower tracking looks generic.
- `leading-[1.08]` on the headline — tighter than Tailwind's default keeps the two lines feeling like one statement.
- `rgba(255,255,255,0.55)` on the sub-paragraph — using `text-white/60` produces a slightly different value and breaks visual match with the homepage.

### Section eyebrows below the hero

The eyebrow + green-uppercase pattern repeats above every section heading on the homepage. If you're building a full landing page (not just the hero), follow the same `text-xs font-semibold tracking-[0.2em] uppercase` eyebrow above section H2s of `text-3xl lg:text-[40px] font-bold leading-tight` for consistency.
