import bcrypt from "bcryptjs";
import { and, desc, eq, lt } from "drizzle-orm";
import { db, passwordHistoryTable } from "@workspace/db";

export type PasswordHistoryAccountType = "candidate" | "company_user" | "admin";

export const PASSWORD_HISTORY_LIMIT = 5;

export const PASSWORD_REUSE_ERROR = `New password must not match any of your last ${PASSWORD_HISTORY_LIMIT} passwords`;

export async function isPasswordReused(
  accountType: PasswordHistoryAccountType,
  accountId: number,
  newPassword: string,
  alsoCompareHashes: (string | null | undefined)[] = [],
): Promise<boolean> {
  for (const h of alsoCompareHashes) {
    if (h && (await bcrypt.compare(newPassword, h))) return true;
  }

  const rows = await db
    .select({ passwordHash: passwordHistoryTable.passwordHash })
    .from(passwordHistoryTable)
    .where(
      and(
        eq(passwordHistoryTable.accountType, accountType),
        eq(passwordHistoryTable.accountId, accountId),
      ),
    )
    .orderBy(desc(passwordHistoryTable.createdAt))
    .limit(PASSWORD_HISTORY_LIMIT);

  for (const row of rows) {
    if (await bcrypt.compare(newPassword, row.passwordHash)) return true;
  }
  return false;
}

export async function recordPasswordHistory(
  accountType: PasswordHistoryAccountType,
  accountId: number,
  passwordHash: string,
): Promise<void> {
  await db.insert(passwordHistoryTable).values({
    accountType,
    accountId,
    passwordHash,
  });

  // Prune anything older than the most recent PASSWORD_HISTORY_LIMIT entries.
  const keep = await db
    .select({ id: passwordHistoryTable.id })
    .from(passwordHistoryTable)
    .where(
      and(
        eq(passwordHistoryTable.accountType, accountType),
        eq(passwordHistoryTable.accountId, accountId),
      ),
    )
    .orderBy(desc(passwordHistoryTable.createdAt))
    .limit(PASSWORD_HISTORY_LIMIT);

  if (keep.length === PASSWORD_HISTORY_LIMIT) {
    const minId = keep[keep.length - 1].id;
    await db
      .delete(passwordHistoryTable)
      .where(
        and(
          eq(passwordHistoryTable.accountType, accountType),
          eq(passwordHistoryTable.accountId, accountId),
          lt(passwordHistoryTable.id, minId),
        ),
      );
  }
}
