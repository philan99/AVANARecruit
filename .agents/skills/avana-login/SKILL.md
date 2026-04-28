---
name: avana-login
description: Recreate the AVANA Recruit / TalentMatch login experience in any new web artifact in this monorepo. Use when the user asks for "the same login as AVANA Recruit", "the AVANA login modal", "the TalentMatch login", "Welcome Back modal", "matching login flow", or wants to add email/password sign-in (with Forgot Password and Email-Not-Verified screens) to a new artifact. Drops in the green-on-white modal, wires it to the existing /api/auth/login endpoint, reuses the shared user_sessions table, and hooks up the role context + 30-min inactivity timeout.
---

# AVANA Login Skill

Recreate the AVANA Recruit / TalentMatch login experience in a new web artifact in this monorepo (artifacts/<new-artifact>). The backend already exists in `@workspace/api-server` — this skill is mostly a UI + client-state copy job, plus a checklist for routing the new artifact through the existing auth API.

## What you're recreating

A modal-based login (no separate `/login` page):

1. **Trigger** — A "Sign In" button in the marketing nav / hero opens the modal (`setShowLogin(true)`).
2. **Welcome Back modal** — White card on dark backdrop, brand green primary button, eye toggle, "Forgot password?" link, "Sign up" footer link.
3. **Forgot password** — Same modal swaps to a "Reset Password" view that POSTs to `/api/password-reset` and shows a green confirmation.
4. **Email not verified** — If the API returns `403 { unverified: true, email }`, the modal closes and a full-page "Email Not Verified" card appears with a "Resend Verification Email" button.
5. **On success** — Stash `sessionToken`, role, and ids in `localStorage` via `RoleContext`, then navigate to `postLoginRedirect` (or `/`).
6. **Inactivity** — A `useInactivityTimeout` hook pings `/api/sessions/heartbeat` every 60 s and force-logs-out after 30 min idle.

## Backend — already exists, reuse it

These live in `@workspace/api-server` and `@workspace/db` and DO NOT need to be re-implemented:

- `POST /api/auth/login` — `artifacts/api-server/src/routes/auth.ts`
  - Body: `{ email, password }`
  - 200: `{ success, role: "admin"|"candidate"|"company", sessionToken, name, ...ids }`
  - 401: `{ error }`
  - 403: `{ error, unverified: true, email }` (when account exists but isn't verified)
- `POST /api/sessions/heartbeat` — touches `lastActivityAt`, returns 401 when expired
- `POST /api/sessions/logout` — deletes the session row
- `POST /api/password-reset` (request link) and `POST /api/password-reset/confirm` (live in `routes/passwordReset.ts`)
- `POST /api/verify-email/resend`
- Schema: `lib/db/src/schema/userSessions.ts` (table `user_sessions`, 30 min idle TTL)
- Helper: `artifacts/api-server/src/lib/sessions.ts` exports `createSession`, `validateAndTouch`, `deleteSession`

A new artifact reaches these by going through the shared proxy at `${BASE_URL}api/...` — no extra wiring needed (see `pnpm-workspace` skill for proxy rules).

## Files you DO need to copy / port

For the new artifact (`artifacts/<new>/src`), copy and lightly adapt:

| Source (artifacts/web) | Destination | Purpose |
| --- | --- | --- |
| `src/contexts/role-context.tsx` | `src/contexts/role-context.tsx` | Holds role + sessionToken + ids in `localStorage` |
| `src/hooks/use-inactivity-timeout.ts` | `src/hooks/use-inactivity-timeout.ts` | 30-min idle logout + heartbeat |
| `src/components/inactivity-warning.tsx` | `src/components/inactivity-warning.tsx` | "You'll be signed out in 60 s" dialog |
| Login modal block from `src/pages/role-select.tsx` (lines ~851–991) and `handleLogin` / `handleForgotPassword` (lines ~150–300) | New `src/components/login-modal.tsx` | The actual UI |
| Verification screens from `role-select.tsx` (lines ~347–416) | New `src/components/verification-screens.tsx` | "Check your email" + "Email not verified" |

If the new artifact will share **the same user database** (one cross-artifact account), keep the `localStorage` keys identical (`avanatalent_role`, `avanatalent_session_token`, etc.). If it should be a separate auth realm, change the prefix (e.g. `avanaservices_*`) so the two artifacts don't share sessions.

## Brand & styling (must match)

- Apply the `avana-design-system` skill first if the new artifact doesn't already use it.
- Hard-coded inline styles (these are intentional in the existing modal — match them exactly):
  - Primary green: `#4CAF50`, hover `#43a047`
  - Navy: `#1A2035`
  - Modal backdrop: `rgba(26, 32, 53, 0.7)` + `backdropFilter: "blur(4px)"`
  - Input bg: `#f9fafb`, border: `#e5e7eb`
  - Card: `#ffffff`, `rounded-xl`, `shadow-2xl`, `max-w-md`, `p-8`
  - Z-index: `z-[100]`
- Icons from `lucide-react`: `LogIn`, `Eye`, `EyeOff`, `Mail`.
- Form inputs use the shadcn `Input` component (`@/components/ui/input`).

## Step-by-step for a new artifact

1. **Scaffold the artifact** (use the `artifacts` skill — usually a React + Vite web artifact).
2. **Install peer deps the modal needs** (most are already in catalog: `lucide-react`, `wouter`, `sonner` or `@/hooks/use-toast`).
3. **Apply `avana-design-system`** — this gives you Tailwind v4 tokens, shadcn `Input`, and the navy/green palette.
4. **Copy the four files in the table above** into the new artifact's `src/`. Search/replace any `@assets/...` logo import to point at the new artifact's logo.
5. **Wrap the app in `<RoleProvider>`** in `App.tsx` (mirror `artifacts/web/src/App.tsx`).
6. **Render `<LoginModal />` and `<InactivityWarning />`** at the app root (the modal stays unmounted until `showLogin`; the warning watches for the timeout).
7. **Trigger from a nav button** — `<button onClick={() => setShowLogin(true)}>Sign In</button>`.
8. **Verify the proxy path** — `${import.meta.env.BASE_URL}api/auth/login` must resolve through the shared proxy. The `BASE_URL` is automatically set by Vite per artifact base path; do not hard-code `/api`.
9. **Test end-to-end** with the testing skill: open modal, log in with a known candidate, confirm redirect, refresh page (should stay signed in via `localStorage`), wait or force the inactivity dialog.

## Critical gotchas

- **Always read `BASE_URL` for the API path.** The pattern used everywhere in artifacts/web:
  ```ts
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  ```
  Never write `/api/...` directly — that breaks when the artifact is mounted at a sub-path.
- **postLoginRedirect** — the existing flow stashes the deep-linked path in `sessionStorage.postLoginRedirect` before opening the modal, then `setLocation(redirectTo)` after success. Keep this if the new artifact has deep-linkable internal pages.
- **Hash triggers** — `#login` and `#signup` in the URL auto-open the modal (see `useEffect` at the top of `role-select.tsx`). Re-implement this for parity if you want email/marketing links to deep-link into the modal.
- **Logout** — call both `clearRole()` (clears localStorage) and `POST /api/sessions/logout` (revokes the server session). The inactivity hook already does this.
- **Don't introduce Clerk or Replit Auth** unless the user explicitly asks. The existing system is custom bcrypt + a `user_sessions` table, and the auth route already supports admin / candidate / company in one endpoint.
- **Session token transport** — the existing app stores the token in `localStorage` and sends it in the request body for `heartbeat`/`logout`. Most data routes rely on user IDs in `RoleContext`, not on the token (this is a simple session model, not bearer auth). Keep this pattern for consistency unless the user wants to harden it.

## When the new artifact should NOT share the AVANA login

If the user wants a standalone product with its own auth (e.g. marketing-only AVANA Services site shouldn't sign people in to TalentMatch), do not apply this skill. Either skip auth entirely or build a fresh flow — the visual style can still be reused via `avana-design-system`.
