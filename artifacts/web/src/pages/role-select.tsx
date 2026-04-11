import { Building2, UserCircle, TerminalSquare, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRole, type UserRole } from "@/contexts/role-context";

export default function RoleSelect() {
  const { setRole } = useRole();

  const roles: { value: UserRole; title: string; description: string; icon: typeof Building2; features: string[] }[] = [
    {
      value: "company",
      title: "I'm a Company",
      description: "Post jobs, find top talent, and manage your recruitment pipeline.",
      icon: Building2,
      features: ["Post and manage job listings", "Run AI candidate matching", "Review and shortlist candidates", "Track recruitment pipeline"],
    },
    {
      value: "candidate",
      title: "I'm a Candidate",
      description: "Create your profile, discover opportunities, and see how you match.",
      icon: UserCircle,
      features: ["Build your professional profile", "Browse open positions", "See AI-powered match scores", "Track your applications"],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <TerminalSquare className="w-10 h-10 text-primary mr-3" />
          <span className="font-mono font-bold text-3xl tracking-tight text-foreground">
            TALENT<span className="text-primary">MATCH</span>
          </span>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          AI-powered job matching that connects the right talent with the right opportunities.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-8">How would you like to use TalentMatch?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {roles.map((roleOption) => (
          <Card
            key={roleOption.value}
            className="bg-card hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => setRole(roleOption.value)}
          >
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                  <roleOption.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{roleOption.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{roleOption.description}</p>
              <ul className="space-y-2 mb-6">
                {roleOption.features.map((feature) => (
                  <li key={feature} className="text-sm text-muted-foreground flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
