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
- **Skill matching** (40% weight): Fuzzy matching using Levenshtein similarity
- **Experience matching** (25% weight): Compares candidate years vs job level requirements
- **Education matching** (15% weight): Parses education levels from requirements text
- **Location matching** (20% weight): Handles remote, exact match, and partial matches

### Role-Based Portal
Users select their role on first visit: **Company**, **Candidate**, or **Admin**. The selection is stored in localStorage and determines which portal (routes + sidebar navigation) is shown. Admin login requires server-side credential verification (email/password checked against ADMIN_EMAIL and ADMIN_PASSWORD env vars).

### Pages — Company Portal
- `/` — Company dashboard with recruitment pipeline stats, skill demand chart, recent matches, top candidates
- `/jobs` — Job listings with search/filter, create new
- `/jobs/:id` — Job detail, run AI matching, view match results
- `/candidates` — Candidate listings with search/filter, create new
- `/candidates/:id` — Candidate detail, view match history
- `/matches` — All match results management
- `/company-profile` — Company profile with logo upload (object storage)

### Pages — Candidate Portal
- `/` — Candidate dashboard with personalized job match overview
- `/profile` — Create/select/view candidate profile
- `/my-matches` — View AI-generated job matches with detailed scoring breakdown
- `/browse-jobs` — Browse all open positions
- `/jobs/:id` — Job detail (read-only view)

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

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI specification (source of truth for API contracts)
- `lib/db/src/schema/` — Database schema (jobs.ts, candidates.ts, matches.ts, companyProfiles.ts)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/matching.ts` — AI matching engine
- `artifacts/web/src/` — React frontend
- `artifacts/web/src/contexts/role-context.tsx` — Role selection context (company/candidate) with localStorage persistence
- `artifacts/web/src/pages/role-select.tsx` — Role selection landing page

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
