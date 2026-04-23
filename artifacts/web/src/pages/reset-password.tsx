import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { validatePassword } from "@/lib/password-policy";
import { PasswordStrength } from "@/components/password-strength";

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Invalid reset link", variant: "destructive" });
      return;
    }
    {
      const { ok, failed } = validatePassword(password);
      if (!ok) {
        toast({ title: "Password doesn't meet requirements", description: failed[0].label, variant: "destructive" });
        return;
      }
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      setSuccess(true);
    } catch (err: any) {
      toast({ title: err.message || "Failed to reset password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a2035" }}>
        <div className="w-full max-w-md mx-4 rounded-xl shadow-2xl p-8" style={{ backgroundColor: "#ffffff" }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a2035" }}>Invalid Link</h2>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>This password reset link is invalid or has expired.</p>
          <button
            onClick={() => setLocation("/")}
            className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: "#4CAF50", color: "#fff" }}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a2035" }}>
      <div className="w-full max-w-md mx-4 rounded-xl shadow-2xl p-8" style={{ backgroundColor: "#ffffff" }}>
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto" style={{ color: "#4CAF50" }} />
            <h2 className="text-2xl font-bold" style={{ color: "#1a2035" }}>Password Reset</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
              onClick={() => setLocation("/")}
              className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-6 h-6" style={{ color: "#4CAF50" }} />
                <h2 className="text-2xl font-bold" style={{ color: "#1a2035" }}>Set New Password</h2>
              </div>
              <p className="text-sm" style={{ color: "#6b7280" }}>Enter your new password below</p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium" style={{ color: "#1a2035" }}>New Password</label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showNewPassword ? "Hide password" : "Show password"}>
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium" style={{ color: "#1a2035" }}>Confirm Password</label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showConfirmPassword ? "Hide password" : "Show password"}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
