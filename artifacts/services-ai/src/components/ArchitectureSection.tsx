import { motion } from "framer-motion";
import { BrainCircuit, Network, Shield } from "lucide-react";

export function ArchitectureSection() {
  const cards = [
    {
      title: "Domain-Trained Models",
      desc: "Our LLMs are fine-tuned on specialized corporate datasets. AVANA Recruit understands the nuanced difference between a 'Software Engineer' and a 'Systems Architect'.",
      icon: BrainCircuit
    },
    {
      title: "Weighted Graph Processing",
      desc: "Decisions are made by evaluating entities through multidimensional graphs, assigning precise weights to variables that matter most to your business objectives.",
      icon: Network
    },
    {
      title: "Enterprise Security",
      desc: "Data privacy isn't an afterthought. Your organizational data is siloed, encrypted in transit and at rest, and never used to train generalized public models.",
      icon: Shield
    }
  ];

  const stats = [
    { value: "10M+", label: "Data Points Analyzed" },
    { value: "60%", label: "Cost Reduction" },
    { value: "SOC2", label: "Compliant Infra" },
    { value: "24/7", label: "Model Uptime" }
  ];

  return (
    <>
      <section id="approach" className="py-24 bg-[#1a2035] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4CAF50]/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6 text-white">
              The AVANA Architecture
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              We don't build generic wrappers around APIs. We engineer vertical-specific data pipelines that yield deterministic results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center text-[#4CAF50] mb-6">
                  <card.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row — separate light section */}
      <section className="py-20 bg-[#f3f5f8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#1a2035] mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-[#4CAF50] uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
