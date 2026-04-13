import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    fetch(`${apiBase}/verify-email/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
      <div className="w-full max-w-md mx-4 rounded-xl shadow-lg p-8" style={{ backgroundColor: "#fff" }}>
        {status === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: "#4CAF50" }} />
            <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Verifying your email...</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
              <CheckCircle className="w-8 h-8" style={{ color: "#4CAF50" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Email Verified!</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>{message}</p>
            <button
              onClick={() => setLocation("/")}
              className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#fef2f2" }}>
              <XCircle className="w-8 h-8" style={{ color: "#ef4444" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Verification Failed</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>{message}</p>
            <button
              onClick={() => setLocation("/")}
              className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all"
              style={{ backgroundColor: "#1a2035", color: "#fff" }}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
