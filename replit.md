# Avana Talent - AI Job Matching Platform

## Overview

AI-powered recruitment platform that matches job descriptions with candidate profiles. Uses algorithmic matching based on skills, experience, education, and location to generate match scores and assessments.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: wouter (frontend)
- **State management**: TanStack React Query

## Architecture

### Data Models
- **Jobs**: Job descriptions with title, company, companyProfileId (FK to company_profiles), location, skills, experience level, salary range, status
- **Candidates**: Candidate profiles with name, skills, experience years, education, location, status, profileImage (object storage path), cvFile (object storage path), cvFileName
- **Matches**: AI-generated match results with overall score, skill/experience/education/location sub-scores, assessment text
- **Company Profiles**: Company information with name, industry, website, location, description, logo (via object storage), size, founded year

### AI Matching Engine
Located at `artifacts/api-server/src/lib/matching.ts`. Computes match scores based on:
- **Skill matching** (35% weight): Fuzzy matching using Levenshtein similarity
- **Experience matching** (20% weight): Compares total years AND role-relevant years (work-history entries whose title overlaps the job title or whose description mentions a required skill) against the job level. If the candidate has work history but **none of it is role-relevant (relevantYears = 0)**, the experience score is hard-capped at 25/100 (set to `min(25, totalYearsScore × 0.20)`) so unrelated tenure cannot carry this element. The assessment text also explicitly calls this out.
- **Education matching** (10% weight): Parses education levels from requirements text
- **Location matching** (15% weight): Distance-based using haversine over UK postcode lat/lng. Score = clamp(100 − 50×d/radius, 0, 100). Remote workplace = 100. Falls back to text match if either side lacks coords. Per-candidate `maxRadiusMiles` (default 25) configurable in onboarding/profile. Job alerts have their own center postcode + radius (hard filter for alert dispatch).
- **Verification matching** (20% weight): Based on number of verified credentials (0=0%, 1=50%, 2=65%, 3=80%, 4=90%, 5+=100%)

### Role-Based Portal
Users select their role on first visit: **Company**, **Candidate**, or **Admin**. The selection is stored in localStorage and determines which portal (routes + sidebar navigation) is shown. Admin login requires server-side credential verification (email/password checked against ADMIN_EMAIL and ADMIN_PASSWORD env vars).

### Pages — Company Portal
- `/` — Company dashboard with recruitment pipeline stats, skill demand chart, recent matches, top candidates
- `/jobs` — Job listings with search/filter, create new
- `/jobs/:id` — Job detail, run AI matching, view match results
- `/candidates` — Candidate listings with search/filter, create new
- `/candidates/:id` — Candidate detail, view match history
- `/matches` — All match results management. Includes a "Run match diagnostic" button (Match Insights) that opens a dialog letting the company pick any of their jobs and any matched candidate to see a detailed breakdown of why they scored as they did. Uses `GET /api/matches/diagnostic?jobId&candidateId&companyProfileId`, gated to the requesting company's own jobs and to candidates with an existing match record. The company-facing version hides raw weight percentages and contribution maths in favour of "Importance: High/Medium/Low" badges (≥0.20 → High, ≥0.13 → Medium, else Low). Shared component: `artifacts/web/src/components/match-diagnostic-panel.tsx`.
- Candidate Match Diagnostic — the same Match Insights dialog is exposed to candidates via `GET /api/matches/candidate-diagnostic?candidateId&jobId` (gated by an existing match record for that pair). Entry points: a "Run match diagnostic" button on every match card (both card and list views) on `/my-matches`, and a "Run match diagnostic" button inside the AI Match Score sidebar card on the candidate `/jobs/:id` view. Both entry points pre-select the candidate + job and use the reusable `MatchDiagnosticDialog` (`artifacts/web/src/components/match-diagnostic-dialog.tsx`), which auto-fetches when opened and renders the shared `MatchDiagnosticPanel`. The sanitization helper `buildSoftenedDiagnostic` in `artifacts/api-server/src/routes/matches.ts` is shared between the company and candidate endpoints to keep payload shape (and the strip of weights/contributionScore) identical.
- `/pipeline` — Kanban-style hiring pipeline with drag-and-drop (stages: Applied → Shortlisted → Screened → Interviewed → Offered → Hired)
- `/company-profile` — Company profile with logo upload (object storage)

### Pages — Candidate Portal
- `/` — Candidate dashboard with personalized job match overview, job alerts settings
- Company dashboard also includes candidate alerts settings (notified when new candidates register matching their jobs)
- `/profile` — Create/select/view candidate profile (includes the editable "How AVANA Recruit describes you to employers" pitch card — two-paragraph recruiter brief covering identity + career progression and intent + motivation; rich-text/HTML field, edited via the shared `RichTextEditor` and rendered through `toSafePitchHtml` in `lib/recruiter-pitch-html.ts`. Server allowlist + sanitisation lives in `routes/recruiterPitch.ts:cleanPitchHtml`. Regenerate button is greyed out when the pitch is up-to-date — gated by comparing `recruiterPitchUpdatedAt` against `pitchInputsTouchedAt`, which is bumped by PATCH /candidates/:id when any pitch-relevant field changes and by parseCv after a fresh CV parse, but never by the recruiter-pitch endpoint itself)
- `/my-matches` — View AI-generated job matches with detailed scoring breakdown
- `/browse-jobs` — Browse all open positions
- `/browse-companies` — Browse all companies on the platform with search/filter (industry, location, size)
- `/browse-companies/:id` — Company detail with about section, stats, and open positions listing
- `/jobs/:id` — Job detail (read-only view)
- `/shortlisted` — Jobs where candidate has been shortlisted/hired
- `/cv-rewrite` — "Rewrite my CV" tool. Dedicated page (top-level nav, NOT linked from profile). Source = stored CV or fresh upload (PDF/.docx/.txt — uploaded files used for that session only). Inputs: target role/industry, tone (concise_impact / narrative / formal_corporate), length (similar / shorter / longer), emphasise, deemphasise. Optional Job Description tailoring (paste OR upload) — JD is ephemeral, never stored against the candidate. LLM rewrite uses openai gpt-4.1-mini via @workspace/integrations-openai-ai-server with a strict British-English system prompt that forbids fabrication. Output: in-page preview + download `.docx` (primary) or `.pdf`, plus opt-in "Replace my stored CV" button (overwrites `cvFile`/`cvFileName` with the chosen format and bumps `pitchInputsTouchedAt` so the recruiter pitch becomes regeneratable). Backend: `routes/cvRewrite.ts` with `POST /candidates/:id/cv-rewrite`, `/cv-rewrite/download`, `/cv-rewrite/replace`. Renderers: `lib/cvDoc.ts` (`renderCvToDocxBuffer` via `docx`, `renderCvToPdfBuffer` via `pdfkit`). Shared CV text extraction lives in `lib/cvText.ts` (used by both parseCv and cvRewrite). Server-side replace flow uses `ObjectStorageService.uploadBufferToPrivate` to write the generated buffer to private object storage. **Note**: `pdfkit`, `fontkit`, `brotli` are listed as `external` in `artifacts/api-server/build.mjs` so esbuild leaves them for Node to load at runtime from pnpm's `.pnpm/` store (their transitive `@swc/helpers` cjs require can't be resolved when bundled).

### Employment Verification
- Candidates can request employment verifications from the Profile page sidebar
- "Verify Me" button opens dialog to enter role, company, verifier name/email, optional message
- System sends branded email via Resend with a unique verification link
- Public verification page at `/verify/:token` allows verifiers to confirm or decline
- Verification status (Pending/Verified/Declined) shown on candidate profile
- Token is never exposed to candidates — only sent via email to the verifier
- Schema: `lib/db/src/schema/verifications.ts`
- API: `artifacts/api-server/src/routes/verifications.ts`
- Public page: `artifacts/web/src/pages/verify.tsx`

### Pages — Admin Portal
- `/` — Admin dashboard with platform KPIs (total companies, candidates, active candidates) and recent entries
- `/companies` — Full table of all company profiles
- `/candidates` — Full table of all candidate profiles
- `/matches` — All AI-generated job→candidate matches across every company; mirrors the company-portal `/matches` page (filters, expand/collapse, score breakdown) but read-only and shows the company on each job header. Linked from the "Total Matches" card on the admin dashboard.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

### AI Chatbot
- Floating chatbot widget available on all pages (bottom-right corner)
- Uses OpenAI via Replit AI Integrations (gpt-5-mini model)
- Context-aware based on login state:
  - **Not logged in**: General platform info, how it works, signup guidance
  - **Company user**: Help with posting jobs, finding candidates, match scores, recruitment pipeline
  - **Candidate user**: Help with profile, job search, match scores, applications
- API route: `artifacts/api-server/src/routes/chat.ts`
- Frontend component: `artifacts/web/src/components/chatbot.tsx`
- Streaming responses via SSE

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI specification (source of truth for API contracts)
- `lib/db/src/schema/` — Database schema (jobs.ts, candidates.ts, matches.ts, companyProfiles.ts)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/matching.ts` — AI matching engine
- `artifacts/web/src/` — React frontend
- `artifacts/web/src/contexts/role-context.tsx` — Role selection context (company/candidate) with localStorage persistence
- `artifacts/web/src/pages/role-select.tsx` — Role selection landing page
- `artifacts/pitch-deck/` — 12-slide investor/customer pitch deck artifact (slides kind, previewPath `/pitch-deck/`). AVANA-branded adaptation of the saas-product-launch template: navy `#1A2035` bg, green `#4CAF50` accents, Inter font, viewport-relative units. Slides live in `src/pages/slides/Slide01..12*.tsx`; manifest at `src/data/slides-manifest.json`; brand tokens in `src/index.css`.
- `artifacts/services-ai/` — public AVANA Services AI marketing site (react-vite kind, previewPath `/services-ai/`, slug `services-ai`). Single-page presentation site mirroring https://avana-services-ai.replit.app/. No backend, no auth, no DB; contact form is visual-only and toasts on submit. Brand: navy `#1A2035`, green `#4CAF50`, cream `#F5F0B0` "Partner With Us" pill, Inter font; logo `attached_assets/Color_logo_-_no_background_1777315495981.png` + `.ai` green suffix. Sections in `src/pages/Home.tsx` composing `SiteHeader`, `Hero` (in Home), `PortfolioGrid`, `ProductSection` × 4 with side panels (`MatchReportPanel`, `OnboardingTimelinePanel`, `DocsChatPanel`, `InsightsPanel`), `ArchitectureSection`, `FAQSection`, `ContactSection`, `SiteFooter`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
