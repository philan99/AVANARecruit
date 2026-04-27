---
name: avana-design-system
description: Apply the AVANA Recruit / TalentMatch look and feel to a React + Tailwind + shadcn/ui project. Use when the user asks for "the same design", "the AVANA design system", "the same colour palette", "match my other app's style", or wants to bootstrap a new project with the navy + green brand, Inter font, tight 0.25rem radius, and stark light / cream-on-navy dark themes. Drops in a complete tailwind v4 theme (CSS variables for colours, sidebar, charts, fonts, radius, shadows), a shadcn `components.json`, and the project's button/sidebar conventions (hover-elevate, primary-border buttons, navy sidebar with green accent).
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
