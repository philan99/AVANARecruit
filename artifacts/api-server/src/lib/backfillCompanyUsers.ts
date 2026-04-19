import { db, companyUsers, jobsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function backfillCompanyUsers(): Promise<void> {
  try {
    // Backfill jobs.created_by_user_id from the company's owner user.
    // This runs once per environment after stage (c) deploy and is a no-op afterwards.
    const jobBackfill = await db.execute(sql`
      UPDATE ${jobsTable} j
      SET created_by_user_id = owner.id
      FROM (
        SELECT DISTINCT ON (company_profile_id) id, company_profile_id
        FROM ${companyUsers}
        ORDER BY company_profile_id,
                 CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
                 id
      ) owner
      WHERE j.company_profile_id = owner.company_profile_id
        AND j.created_by_user_id IS NULL
      RETURNING j.id
    `);

    const updated = Array.isArray((jobBackfill as { rows?: unknown[] }).rows)
      ? (jobBackfill as { rows: unknown[] }).rows.length
      : 0;

    if (updated > 0) {
      logger.info({ updated }, "Backfilled jobs.created_by_user_id with company owner");
    }
  } catch (err) {
    logger.error({ err }, "jobs.created_by_user_id backfill failed");
  }
}
