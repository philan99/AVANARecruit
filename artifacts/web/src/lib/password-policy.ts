export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  id: string;
  label: string;
  test: (pw: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
  { id: "lower", label: "One lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "number", label: "One number (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { id: "special", label: "One special character (!@#$…)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function validatePassword(pw: string): { ok: boolean; failed: PasswordRule[] } {
  const failed = PASSWORD_RULES.filter((r) => !r.test(pw));
  return { ok: failed.length === 0, failed };
}

export function passwordStrengthScore(pw: string): number {
  if (!pw) return 0;
  return PASSWORD_RULES.filter((r) => r.test(pw)).length;
}
