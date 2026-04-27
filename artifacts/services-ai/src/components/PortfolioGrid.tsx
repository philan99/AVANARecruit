import { motion } from "framer-motion";
import { ArrowRight, Users, FileText, BarChart3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const portfolioItems = [
  {
    id: "recruit",
    status: "LIVE",
    title: "AVANA Recruit",
    subtitle: "AI-Powered Talent Matching",
    description: "Matches candidates and companies across six weighted dimensions with verified credentials and bias-free screening.",
    icon: Users,
    href: "#recruit"
  },
  {
    id: "onboard",
    status: "COMING SOON",
    title: "AVANA Onboard",
    subtitle: "AI-Powered Employee Onboarding",
    description: "Picks up the moment a candidate is hired — automating documents, training and 30/60/90-day check-ins.",
    icon: ShieldCheck,
    href: "#onboard"
  },
  {
    id: "docs",
    status: "COMING SOON",
    title: "AVANA Docs",
    subtitle: "AI Document & Knowledge Assistant",
    description: "Upload contracts, policies or job specs and ask questions in plain English. Talk to your documents.",
    icon: FileText,
    href: "#docs"
  },
  {
    id: "insights",
    status: "LIVE",
    title: "AVANA Insights",
    subtitle: "AI Data Consolidation Platform",
    description: "Connect any data source and query unified, AI-cleaned data in plain English. No SQL required.",
    icon: BarChart3,
    href: "#insights"
  }
];

export function PortfolioGrid() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6 text-foreground">
            The AVANA Portfolio
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A suite of enterprise-grade AI products engineered to streamline mission-critical operations — from talent acquisition and workforce onboarding to knowledge management and strategic decision intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block group relative bg-card border border-card-border p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <item.icon size={24} />
                </div>
                <Badge variant={item.status === "LIVE" ? "default" : "secondary"} className={item.status === "LIVE" ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-muted text-muted-foreground hover:bg-muted"}>
                  {item.status}
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm font-medium text-primary mb-4">{item.subtitle}</p>
              
              <p className="text-muted-foreground mb-8">
                {item.description}
              </p>

              <div className="flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Explore platform <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
