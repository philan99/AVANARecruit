import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Feature {
  title: string;
  description: string;
}

interface ProductSectionProps {
  id: string;
  eyebrow: string;
  badge?: "LIVE" | "COMING SOON";
  heading: string;
  sub: string;
  features: Feature[];
  ctaText?: string;
  ctaHref?: string;
  footerText?: string;
  reversed?: boolean;
  children: React.ReactNode; // For the custom side panel
}

export function ProductSection({
  id,
  eyebrow,
  badge,
  heading,
  sub,
  features,
  ctaText,
  ctaHref,
  footerText,
  reversed = false,
  children
}: ProductSectionProps) {
  const isDark = reversed; // Alternate dark/light sections
  const bgClass = isDark ? "bg-[#1a2035]" : "bg-background";
  const textClass = isDark ? "text-white" : "text-foreground";
  const subClass = isDark ? "text-white/60" : "text-muted-foreground";

  return (
    <section id={id} className={`py-24 lg:py-32 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Content Column */}
          <motion.div 
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={reversed ? "lg:order-2" : "lg:order-1"}
          >
            <div className="flex items-center gap-3 mb-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
                {eyebrow}
              </p>
              {badge && (
                <Badge variant="outline" className={`text-[10px] ${isDark ? 'border-white/20 text-white/80' : ''}`}>
                  {badge}
                </Badge>
              )}
            </div>

            <h2 className={`text-3xl lg:text-[40px] font-bold leading-tight mb-6 ${textClass}`}>
              {heading}
            </h2>
            
            <p className={`text-lg leading-relaxed mb-10 ${subClass}`}>
              {sub}
            </p>

            <div className="space-y-8 mb-10">
              {features.map((feature, i) => (
                <div key={i}>
                  <h4 className={`text-base font-semibold mb-2 ${textClass}`}>{feature.title}</h4>
                  <p className={`text-sm ${subClass}`}>{feature.description}</p>
                </div>
              ))}
            </div>

            {ctaText && ctaHref && (
              <a 
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 text-sm font-semibold rounded-md transition-all hover:opacity-90 bg-primary text-primary-foreground"
              >
                {ctaText}
              </a>
            )}

            {footerText && (
              <p className="text-sm font-medium text-primary mt-4">
                {footerText}
              </p>
            )}
          </motion.div>

          {/* Visual Column */}
          <motion.div 
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={reversed ? "lg:order-1" : "lg:order-2"}
          >
            {children}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
