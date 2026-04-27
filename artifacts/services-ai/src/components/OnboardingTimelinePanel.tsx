import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export function OnboardingTimelinePanel() {
  const steps = [
    { day: "DAY 1", title: "Welcome pack & e-signed contract", done: true },
    { day: "WEEK 1", title: "Manager intros & tooling access", done: true },
    { day: "DAY 30", title: "Skills training based on match gaps", done: false },
    { day: "DAY 60", title: "Sentiment check-in survey", done: false },
    { day: "DAY 90", title: "Performance review & wrap-up", done: false },
  ];

  return (
    <div className="bg-[#111827] rounded-xl shadow-2xl border border-white/10 overflow-hidden text-sm">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-mono text-[10px] tracking-wider text-white/50 uppercase mb-1">NEW HIRE • #2204</div>
          <div className="font-medium text-white">Sarah Mitchell — UX Designer</div>
        </div>
        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#4CAF50]/20 text-[#4CAF50] uppercase tracking-wide">
          On Track
        </div>
      </div>
      
      <div className="p-6 relative">
        <div className="absolute top-8 bottom-8 left-[39px] w-px bg-white/10" />
        
        <div className="space-y-6 relative z-10">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
              className="flex items-start gap-4"
            >
              <div className="mt-0.5">
                {step.done ? (
                  <CheckCircle2 size={16} className="text-[#4CAF50] bg-[#111827]" />
                ) : (
                  <Circle size={16} className="text-white/20 bg-[#111827]" />
                )}
              </div>
              <div>
                <div className={`font-mono text-[10px] font-semibold mb-1 ${step.done ? 'text-[#4CAF50]' : 'text-white/40'}`}>
                  {step.day}
                </div>
                <div className={step.done ? 'text-white' : 'text-white/60'}>
                  {step.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider text-white/50 uppercase">SENTIMENT:</span>
          <span className="text-sm font-medium text-white">Positive · Engaged</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
        </div>
      </div>
    </div>
  );
}
