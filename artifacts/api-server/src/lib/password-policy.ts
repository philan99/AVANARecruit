export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(pw: unknown): { ok: boolean; error?: string } {
  if (typeof pw !== "string") return { ok: false, error: "Password is required" };
  if (pw.length < PASSWORD_MIN_LENGTH) return { ok: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  if (!/[a-z]/.test(pw)) return { ok: false, error: "Password must include a lowercase letter" };
  if (!/[A-Z]/.test(pw)) return { ok: false, error: "Password must include an uppercase letter" };
  if (!/[0-9]/.test(pw)) return { ok: false, error: "Password must include a number" };
  if (!/[^A-Za-z0-9]/.test(pw)) return { ok: false, error: "Password must include a special character" };
  return { ok: true };
}
