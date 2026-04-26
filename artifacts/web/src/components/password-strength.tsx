import { Check, X } from "lucide-react";
import { PASSWORD_RULES, passwordStrengthScore } from "@/lib/password-policy";

interface Props {
  password: string;
  className?: string;
}

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = ["#9ca3af", "#ef4444", "#f59e0b", "#eab308", "#84cc16", "#4CAF50"];

export function PasswordStrength({ password, className = "" }: Props) {
  const score = passwordStrengthScore(password);
  const pct = (score / PASSWORD_RULES.length) * 100;
  return (
    <div className={`space-y-2 ${className}`}>
      {password && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: STRENGTH_COLORS[score] }}
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: STRENGTH_COLORS[score] }}>
            {STRENGTH_LABELS[score]}
          </span>
        </div>
      )}
      {!password && (
        <p className="text-[11px] font-medium text-muted-foreground">Your password must include:</p>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-1.5 text-[11px]">
              {passed ? (
                <Check className="w-3 h-3 shrink-0" style={{ color: "#4CAF50" }} />
              ) : (
                <X className="w-3 h-3 shrink-0 text-muted-foreground" />
              )}
              <span className={passed ? "text-foreground" : "text-muted-foreground"}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
