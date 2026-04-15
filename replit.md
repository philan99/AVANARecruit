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
- **Experience matching** (20% weight): Compares candidate years vs job level requirements
- **Education matching** (10% weight): Parses education levels from requirements text
- **Location matching** (15% weight): Handles remote, exact match, and partial matches
- **Verification matching** (20% weight): Based on number of verified credentials (0=0%, 1=50%, 2=65%, 3=80%, 4=90%, 5+=100%)

### Role-Based Portal
Users select their role on first visit: **Company**, **Candidate**, or **Admin**. The selection is stored in localStorage and determines which portal (routes + sidebar navigation) is shown. Admin login requires server-side credential verification (email/password checked against ADMIN_EMAIL and ADMIN_PASSWORD env vars).

### Pages — Company Portal
- `/` — Company dashboard with recruitment pipeline stats, skill demand chart, recent matches, top candidates
- `/jobs` — Job listings with search/filter, create new
- `/jobs/:id` — Job detail, run AI matching, view match results
- `/candidates` — Candidate listings with search/filter, create new
- `/candidates/:id` — Candidate detail, view match history
- `/matches` — All match results management
- `/pipeline` — Kanban-style hiring pipeline with drag-and-drop (stages: Applied → Shortlisted → Screened → Interviewed → Offered → Hired)
- `/company-profile` — Company profile with logo upload (object storage)

### Pages — Candidate Portal
- `/` — Candidate dashboard with personalized job match overview, job alerts settings
- Company dashboard also includes candidate alerts settings (notified when new candidates register matching their jobs)
- `/profile` — Create/select/view candidate profile
- `/my-matches` — View AI-generated job matches with detailed scoring breakdown
- `/browse-jobs` — Browse all open positions
- `/browse-companies` — Browse all companies on the platform with search/filter (industry, location, size)
- `/browse-companies/:id` — Company detail with about section, stats, and open positions listing
- `/jobs/:id` — Job detail (read-only view)
- `/shortlisted` — Jobs where candidate has been shortlisted/hired

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

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
