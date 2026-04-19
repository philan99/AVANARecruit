#!/usr/bin/env bash
# =============================================================================
# clone-prod-to-dev.sh
#
# Safely clones the PRODUCTION PostgreSQL database into the DEVELOPMENT
# database, then scrubs all personally identifiable information (PII).
#
# WHAT IT DOES:
#   1. Dumps row data (no schema) from $PROD_DATABASE_URL
#   2. TRUNCATEs every public table in $DATABASE_URL (dev)
#   3. Loads the prod data into dev
#   4. Runs an UPDATE pass that replaces real names, emails, phones,
#      passwords, CV file references and message content with fake values
#   5. Reminds you to disable outbound email in dev
#
# REQUIREMENTS:
#   - PROD_DATABASE_URL  set as a Replit Secret (the production DB URL)
#   - DATABASE_URL       already set (the dev DB URL — Replit provides this)
#   - pg_dump / psql 16  (already on PATH in this Replit environment)
#
# USAGE:
#   bash scripts/clone-prod-to-dev.sh
# =============================================================================

set -euo pipefail

YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  echo -e "${RED}ERROR:${NC} PROD_DATABASE_URL is not set."
  echo "Add it as a Replit Secret first (the production DB connection string)."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo -e "${RED}ERROR:${NC} DATABASE_URL (dev) is not set."
  exit 1
fi

if [[ "${PROD_DATABASE_URL}" == "${DATABASE_URL}" ]]; then
  echo -e "${RED}ERROR:${NC} PROD_DATABASE_URL and DATABASE_URL are identical."
  echo "Refusing to run — that would clone dev onto itself."
  exit 1
fi

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW} PROD -> DEV CLONE (with PII scrub)${NC}"
echo -e "${YELLOW}=========================================================${NC}"
echo
echo "This will:"
echo "  - WIPE every row in your DEV database"
echo "  - Replace it with PROD data"
echo "  - Scrub PII (names, emails, phones, passwords, CV files, messages)"
echo
echo "Source (PROD): ${PROD_DATABASE_URL%%\?*}"
echo "Target (DEV):  ${DATABASE_URL%%\?*}"
echo
read -r -p "Type CLONE to continue: " CONFIRM
if [[ "$CONFIRM" != "CLONE" ]]; then
  echo "Aborted."
  exit 1
fi

WORKDIR="$(mktemp -d)"
DUMP_FILE="$WORKDIR/prod_data.sql"
trap 'rm -rf "$WORKDIR"' EXIT

# -----------------------------------------------------------------------------
# 1. Dump PROD (data only, no schema, no owners, disable triggers)
# -----------------------------------------------------------------------------
echo
echo -e "${GREEN}[1/4]${NC} Dumping PROD data..."
pg_dump \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  --exclude-table-data='session' \
  --exclude-table-data='email_verifications' \
  --exclude-table-data='password_resets' \
  --exclude-table-data='verifications' \
  --file="$DUMP_FILE" \
  "$PROD_DATABASE_URL"

DUMP_BYTES=$(wc -c <"$DUMP_FILE")
echo "    wrote $DUMP_BYTES bytes to $DUMP_FILE"

# -----------------------------------------------------------------------------
# 2. Truncate DEV (every public table, restart identities, cascade FKs)
# -----------------------------------------------------------------------------
echo
echo -e "${GREEN}[2/4]${NC} Truncating DEV tables..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  stmt text;
BEGIN
  SELECT 'TRUNCATE TABLE '
         || string_agg(format('%I.%I', schemaname, tablename), ', ')
         || ' RESTART IDENTITY CASCADE'
    INTO stmt
    FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename NOT IN ('drizzle_migrations', '__drizzle_migrations');
  IF stmt IS NOT NULL THEN
    EXECUTE stmt;
  END IF;
END $$;
SQL

# -----------------------------------------------------------------------------
# 3. Restore PROD data into DEV
# -----------------------------------------------------------------------------
echo
echo -e "${GREEN}[3/4]${NC} Loading PROD data into DEV..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DUMP_FILE" >/dev/null

# -----------------------------------------------------------------------------
# 4. PII scrub
# -----------------------------------------------------------------------------
echo
echo -e "${GREEN}[4/4]${NC} Scrubbing PII..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

-- Candidates -----------------------------------------------------------------
UPDATE candidates SET
  name              = 'Test Candidate ' || id,
  email             = 'candidate' || id || '@example.test',
  phone             = NULL,
  password          = NULL,        -- forces password reset to log in
  summary           = '[redacted summary]',
  location          = 'London, UK',
  profile_image     = NULL,
  cv_file           = NULL,        -- prod object-storage paths won't resolve
  cv_file_name      = NULL,
  experience        = '[]'::jsonb, -- job history can contain employer/role detail
  education_details = NULL,
  linkedin_url      = NULL,
  facebook_url      = NULL,
  twitter_url       = NULL,
  portfolio_url     = NULL;

-- Company users (people who log in on behalf of a company) -------------------
UPDATE company_users SET
  name     = COALESCE('Test User ' || id, name),
  email    = 'companyuser' || id || '@example.test',
  password = NULL;

-- Outstanding invites contain real recipient emails -------------------------
UPDATE company_user_invites SET
  email           = 'invitee' || id || '@example.test',
  invited_by_name = NULL;

-- Admin accounts ------------------------------------------------------------
UPDATE admins SET
  name     = 'Test Admin ' || id,
  email    = 'admin' || id || '@example.test',
  password = '$2a$10$disabledhashdisabledhashdisabledhashdisabledhashdisabledh';

-- Contact + feature-request submissions ------------------------------------
UPDATE contact_submissions SET
  name    = 'Test Sender ' || id,
  email   = 'contact' || id || '@example.test',
  message = '[redacted message]';

-- Conversation messages can contain anything users typed --------------------
UPDATE messages SET content = '[redacted message]';

COMMIT;

-- Quick sanity output --------------------------------------------------------
SELECT 'candidates'           AS table, count(*) FROM candidates
UNION ALL SELECT 'company_users',         count(*) FROM company_users
UNION ALL SELECT 'company_user_invites',  count(*) FROM company_user_invites
UNION ALL SELECT 'company_profiles',      count(*) FROM company_profiles
UNION ALL SELECT 'jobs',                  count(*) FROM jobs
UNION ALL SELECT 'admins',                count(*) FROM admins
UNION ALL SELECT 'contact_submissions',   count(*) FROM contact_submissions
UNION ALL SELECT 'messages',              count(*) FROM messages;
SQL

echo
echo -e "${GREEN}Done.${NC}"
echo
echo "Reminders:"
echo "  - All candidate / company-user / admin passwords have been wiped."
echo "    Use the 'forgot password' flow in dev to set a new one, OR seed"
echo "    a known dev admin manually."
echo "  - CV files were nulled (prod object-storage paths don't resolve in dev)."
echo "  - Make sure RESEND_API_KEY is unset (or replaced with a dev key) in"
echo "    this environment before triggering anything that sends email."
