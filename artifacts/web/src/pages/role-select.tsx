import { useState } from "react";
import { Building2, UserCircle, TerminalSquare, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole, type UserRole } from "@/contexts/role-context";

export default function RoleSelect() {
  const { setRole } = useRole();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      setRole(selected);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-3">
            <TerminalSquare className="w-9 h-9 text-primary mr-2" />
            <span className="font-mono font-bold text-2xl tracking-tight text-foreground">
              AVANA <span className="text-primary">TALENT</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Card className="bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelected("company")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                      selected === "company"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Company
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected("candidate")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                      selected === "candidate"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    Candidate
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selected}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Don't have an account?{" "}
                <span className="text-primary font-medium cursor-pointer hover:underline">
                  Sign up
                </span>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          AI-powered talent matching that connects the right people with the right opportunities.
        </p>
      </div>
    </div>
  );
}
