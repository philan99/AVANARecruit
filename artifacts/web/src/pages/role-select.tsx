import { useState } from "react";
import { Building2, UserCircle, TerminalSquare, LogIn, Sparkles, Target, Users, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole, type UserRole } from "@/contexts/role-context";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function RoleSelect() {
  const { setRole } = useRole();
  const { toast } = useToast();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    if (selected === "admin") {
      if (!email || !password) {
        toast({ title: "Email and password are required", variant: "destructive" });
        return;
      }
      setIsLoading(true);
      try {
        const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
        const res = await fetch(`${basePath}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          setRole("admin");
        } else {
          toast({ title: "Invalid admin credentials", variant: "destructive" });
        }
      } catch {
        toast({ title: "Login failed", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else {
      setRole(selected);
    }
  };

  const highlights = [
    { icon: Sparkles, text: "AI-powered candidate matching" },
    { icon: Target, text: "Skills-based scoring engine" },
    { icon: Users, text: "Smart talent pipeline management" },
    { icon: BarChart3, text: "Real-time recruitment analytics" },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div>
          <div className="flex items-center mb-2">
            <TerminalSquare className="w-8 h-8 text-sidebar-primary mr-2" />
            <span className="font-mono font-bold text-xl tracking-tight text-sidebar-foreground">
              AVANA <span className="text-sidebar-primary">TALENT</span>
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-sidebar-foreground leading-tight mb-3">
              Connect the right talent<br />with the right opportunity.
            </h1>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-sm">
              Our AI matching engine analyzes skills, experience, education, and location to find the perfect fit — for companies and candidates alike.
            </p>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-sidebar-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-sidebar-foreground/40">
          Avana Talent Platform
        </p>
      </div>

      <div className="flex-1 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <TerminalSquare className="w-8 h-8 text-primary mr-2" />
            <span className="font-mono font-bold text-xl tracking-tight text-foreground">
              AVANA <span className="text-primary">TALENT</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">I am a</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelected("company")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                    selected === "company"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
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
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setSelected("admin")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                    selected === "admin"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
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
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selected || isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-medium cursor-pointer hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
