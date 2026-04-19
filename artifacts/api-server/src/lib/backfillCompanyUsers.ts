import { db, companyProfiles, companyUsers } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function backfillCompanyUsers(): Promise<void> {
  try {
    const result = await db.execute(sql`
      INSERT INTO company_users (
        company_profile_id,
        email,
        password,
        name,
        role,
        verified,
        created_at,
        updated_at
      )
      SELECT
        cp.id,
        cp.email,
        cp.password,
        NULL::text,
        'owner',
        COALESCE(cp.verified, false),
        COALESCE(cp.created_at, now()),
        COALESCE(cp.updated_at, now())
      FROM ${companyProfiles} cp
      WHERE cp.email IS NOT NULL
        AND cp.password IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM ${companyUsers} cu
          WHERE cu.company_profile_id = cp.id
        )
        AND NOT EXISTS (
          SELECT 1 FROM ${companyUsers} cu2
          WHERE lower(cu2.email) = lower(cp.email)
        )
      RETURNING id
    `);

    const inserted = Array.isArray((result as { rows?: unknown[] }).rows)
      ? (result as { rows: unknown[] }).rows.length
      : 0;

    if (inserted > 0) {
      logger.info({ inserted }, "Backfilled company_users from company_profiles");
    }

    const cleanup = await db.execute(sql`
      UPDATE ${companyUsers} cu
      SET name = NULL, updated_at = now()
      FROM ${companyProfiles} cp
      WHERE cu.company_profile_id = cp.id
        AND cu.invited_at IS NULL
        AND cu.role = 'owner'
        AND cu.name IS NOT NULL
        AND cu.name = cp.name
      RETURNING cu.id
    `);

    const cleaned = Array.isArray((cleanup as { rows?: unknown[] }).rows)
      ? (cleanup as { rows: unknown[] }).rows.length
      : 0;

    if (cleaned > 0) {
      logger.info({ cleaned }, "Cleared company-name-as-person-name on backfilled owners");
    }
  } catch (err) {
    logger.error({ err }, "company_users backfill failed");
  }
}
