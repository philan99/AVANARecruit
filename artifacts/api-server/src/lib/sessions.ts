import { randomBytes } from "crypto";
import { db, userSessions } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export type SessionUserType = "candidate" | "company" | "admin";

export interface SessionRecord {
  id: number;
  token: string;
  userType: string;
  userId: number;
  lastActivityAt: Date;
  createdAt: Date;
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userType: SessionUserType, userId: number): Promise<string> {
  const token = generateToken();
  await db.insert(userSessions).values({
    token,
    userType,
    userId,
  });
  return token;
}

export async function validateAndTouch(token: string): Promise<SessionRecord | null> {
  if (!token || typeof token !== "string") return null;

  const [session] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.token, token));

  if (!session) return null;

  const lastActivityMs = session.lastActivityAt.getTime();
  const ageMs = Date.now() - lastActivityMs;

  if (ageMs > SESSION_IDLE_TIMEOUT_MS) {
    await db.delete(userSessions).where(eq(userSessions.token, token));
    return null;
  }

  const [updated] = await db
    .update(userSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(userSessions.token, token))
    .returning();

  return updated as SessionRecord;
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await db.delete(userSessions).where(eq(userSessions.token, token));
}

export async function purgeExpiredSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - SESSION_IDLE_TIMEOUT_MS);
  const deleted = await db
    .delete(userSessions)
    .where(lt(userSessions.lastActivityAt, cutoff))
    .returning({ id: userSessions.id });
  return deleted.length;
}
