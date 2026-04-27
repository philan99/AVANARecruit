import { motion } from "framer-motion";

export function MatchReportPanel() {
  const scores = [
    { label: "Experience", weight: "25%", score: 85 },
    { label: "Skills", weight: "25%", score: 92 },
    { label: "Preferences", weight: "15%", score: 88 },
    { label: "Verification", weight: "15%", score: 75 },
    { label: "Location", weight: "10%", score: 95 },
    { label: "Education", weight: "10%", score: 78 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-sm">
      <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">AI Match Report</div>
        <div className="text-xs font-medium text-slate-700">Sample candidate analysis</div>
      </div>
      
      <div className="p-6 space-y-5">
        {scores.map((item, i) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700">{item.label} <span className="text-slate-400 font-normal">({item.weight})</span></span>
              <span className="font-bold text-slate-900">{item.score}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${item.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                className="h-full bg-[#4CAF50] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium block mb-0.5">Overall Score</span>
          <span className="text-2xl font-bold text-slate-900">86%</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1">Status</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#4CAF50]/10 text-[#4CAF50]">
            Highly Recommended
          </span>
        </div>
      </div>
    </div>
  );
}
