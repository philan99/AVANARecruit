import { useState } from "react";
import { Mail, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import logoUrl from "@assets/AVANA_Insights_Logo_1777405980691.png";
import { useRole } from "@/contexts/role-context";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type Screen = "login" | "forgot" | "forgotSent" | "verificationSent" | "unverified";

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { setRole, setUserEmail, setSessionToken, setCandidateProfileId, setCompanyProfileId, setCompanyUserId, setCompanyUserRole } = useRole();
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const apiBase = "/api";

  function reset() {
    setScreen("login");
    setEmail("");
    setPassword("");
    setForgotEmail("");
    setUnverifiedEmail("");
    setVerificationEmail("");
    setErrorMsg(null);
    setBusy(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Email and password are required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserEmail(email);
        if (data.sessionToken) setSessionToken(data.sessionToken);
        if (data.role === "admin") {
          setRole("admin");
        } else if (data.role === "candidate") {
          setCandidateProfileId(data.candidateId);
          setRole("candidate");
        } else if (data.role === "company") {
          setCompanyProfileId(data.companyId);
          if (data.companyUserId) setCompanyUserId(data.companyUserId);
          if (data.companyUserRole) setCompanyUserRole(data.companyUserRole);
          setRole("company");
        }
        reset();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.unverified) {
          setUnverifiedEmail(data.email || email);
          setScreen("unverified");
        } else {
          setErrorMsg(data.error || "Invalid email or password");
        }
      }
    } catch {
      setErrorMsg("Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) { setErrorMsg("Please enter your email"); return; }
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${apiBase}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.ok) {
        setScreen("forgotSent");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend(target: string) {
    setBusy(true);
    try {
      await fetch(`${apiBase}/verify-email/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });
      setVerificationEmail(target);
      setScreen("verificationSent");
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => { reset(); onClose(); }}
      data-testid="login-modal-overlay"
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl bg-white relative"
        onClick={(e) => e.stopPropagation()}
        data-testid="login-modal"
      >
        <button
          aria-label="Close"
          onClick={() => { reset(); onClose(); }}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          data-testid="login-close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="AVANA Insights" className="h-10 w-auto" />
          </div>

          {screen === "login" && (
            <>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: "#1a2035" }}>Welcome Back</h2>
              <p className="text-sm text-center mb-6" style={{ color: "#6b7280" }}>Sign in to your AVANA Insights account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    data-testid="login-email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{ borderColor: "#e5e7eb" }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      data-testid="login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {errorMsg && (
                  <div className="rounded-md p-3 text-xs" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }} data-testid="login-error">
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                  data-testid="login-submit"
                >
                  {busy ? "Signing in..." : "Sign In"}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { setScreen("forgot"); setErrorMsg(null); }} className="text-xs font-semibold hover:underline" style={{ color: "#4CAF50" }}>
                    Forgot password?
                  </button>
                </div>
              </form>
            </>
          )}

          {screen === "forgot" && (
            <>
              <button onClick={() => { setScreen("login"); setErrorMsg(null); }} className="flex items-center gap-1 text-xs font-medium mb-4" style={{ color: "#6b7280" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: "#1a2035" }}>Reset Password</h2>
              <p className="text-sm text-center mb-6" style={{ color: "#6b7280" }}>We'll email you a reset link</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="you@example.com"
                    data-testid="forgot-email"
                  />
                </div>
                {errorMsg && (
                  <div className="rounded-md p-3 text-xs" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>{errorMsg}</div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                  data-testid="forgot-submit"
                >
                  {busy ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {screen === "forgotSent" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                <Mail className="w-8 h-8" style={{ color: "#4CAF50" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Check Your Email</h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>If an account exists for <strong>{forgotEmail}</strong>, we've sent a password reset link.</p>
              <button onClick={() => { reset(); onClose(); }} className="w-full py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-all" style={{ backgroundColor: "#1a2035", color: "#fff" }}>
                Back to Sign In
              </button>
            </div>
          )}

          {screen === "verificationSent" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                <Mail className="w-8 h-8" style={{ color: "#4CAF50" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Check Your Email</h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>We've sent a verification link to <strong>{verificationEmail}</strong>. Click it to activate your account.</p>
              <button onClick={() => { setScreen("login"); }} className="w-full py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-all" style={{ backgroundColor: "#1a2035", color: "#fff" }}>
                Back to Sign In
              </button>
            </div>
          )}

          {screen === "unverified" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
                <Mail className="w-8 h-8" style={{ color: "#f59e0b" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Email Not Verified</h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>Your account <strong>{unverifiedEmail}</strong> hasn't been verified yet. Request a new verification email below.</p>
              <button
                onClick={() => handleResend(unverifiedEmail)}
                disabled={busy}
                className="w-full py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                {busy ? "Sending..." : "Resend Verification Email"}
              </button>
              <button onClick={() => { setScreen("login"); setUnverifiedEmail(""); }} className="w-full py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-all" style={{ backgroundColor: "#1a2035", color: "#fff" }}>
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
