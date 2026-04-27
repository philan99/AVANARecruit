---
name: avana-hero
description: Build a consistent AVANA Recruit / TalentMatch hero section — dark navy background with green radial glows, green uppercase eyebrow, large white headline with green emphasis spans, muted sub-paragraph, and a green primary + outline secondary CTA pair. Use when the user asks to add a hero, top banner, or landing-style header section to any page in the AVANA / TalentMatch web app, or asks to make a hero "match the homepage" / "match the brand". Also use when scaffolding a new marketing or onboarding page that needs a top hero.
---

# AVANA Hero Section

Reproduces the hero from the public homepage (`artifacts/web/src/pages/role-select.tsx`, lines ~427–462). Use this whenever a page needs a dark, branded landing-style hero so every hero on the platform looks the same.

## Visual contract

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

## Drop-in component

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

## Content rules

- **Eyebrow**: 2–5 words, sentence-case in source but rendered uppercase via `uppercase`. Examples: "AI-Powered Recruitment Platform", "For Hiring Teams", "Candidate Workspace".
- **Headline**: 6–12 words across two lines (use `<br />`). Wrap **1–3 key phrases** in `<span style={{ color: "#4CAF50" }}>…</span>` for green emphasis. Keep the trailing punctuation (period) for a confident finish.
- **Sub-paragraph**: ≤ 40 words. Single sentence preferred. No bold, no links — keep visual density low.
- **CTAs**: Always two — green primary + outline secondary. If only one action makes sense, drop the secondary rather than centring a single button alone (still works, but pair is the standard).

## When the page has no top nav

If the hero is on a page **without** the fixed `<MarketingNav />` (72px tall), remove both `paddingTop: "72px"` declarations (on the `<section>` and on the inner `<div className="absolute inset-0 …">`) so the hero starts flush at the top.

## Variants — what NOT to change

These are intentional and load-bearing for brand consistency:

- Navy background `#1a2035` and green accent `#4CAF50` — use these literal hex codes, not Tailwind colour utilities.
- The two radial-gradient glows (size, position, opacity).
- `max-w-3xl` on the inner stack — this caps headline line length at the readable sweet spot.
- `text-xs` eyebrow with `tracking-[0.2em]` — narrower tracking looks generic.
- `leading-[1.08]` on the headline — tighter than Tailwind's default keeps the two lines feeling like one statement.
- `rgba(255,255,255,0.55)` on the sub-paragraph — using `text-white/60` produces a slightly different value and breaks visual match with the homepage.

## Related

- The eyebrow + green-uppercase pattern repeats above every section heading on the homepage. If you're building a full landing page (not just the hero), follow the same `text-xs font-semibold tracking-[0.2em] uppercase` eyebrow above section H2s of `text-3xl lg:text-[40px] font-bold leading-tight` for consistency.
- For deeper brand tokens (button hover-elevate, sidebar, full Tailwind v4 theme), see the `avana-design-system` skill.
