import { motion } from "framer-motion";
import { Database, Search, Zap, ArrowRight, Table2 } from "lucide-react";

export function InsightsPanel() {
  return (
    <div className="bg-[#111827] rounded-xl shadow-2xl border border-white/10 overflow-hidden text-sm">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white/70">
          <Database size={16} className="text-[#4CAF50]" />
          <span className="font-medium">Query Engine</span>
        </div>
        <div className="font-mono text-[10px] tracking-wider text-white/40 uppercase">
          Latency: 2.4s
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-wider text-white/50 uppercase mb-2">Connected Sources (6 Synced)</div>
          <div className="flex flex-wrap gap-2">
            {['HubSpot', 'Xero', 'Shopify', 'Sheets', 'Postgres', 'Stripe'].map(source => (
              <span key={source} className="inline-flex items-center px-2 py-1 rounded bg-white/5 text-white/80 text-xs border border-white/10">
                {source}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] tracking-wider text-white/50 uppercase mb-2">Your Question</div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white flex items-start gap-3">
            <Search size={16} className="text-[#4CAF50] shrink-0 mt-0.5" />
            <span className="leading-relaxed">"What were my top 3 revenue sources last quarter?"</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="font-mono text-[10px] tracking-wider text-white/50 uppercase mb-2 flex items-center gap-2">
            <Zap size={12} className="text-[#4CAF50]" />
            Generated Result
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium flex items-center gap-2"><Table2 size={14} className="text-slate-400" /> Direct Sales</span>
                <span className="font-bold text-slate-900">£128,000</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium flex items-center gap-2"><Table2 size={14} className="text-slate-400" /> Shopify Storefront</span>
                <span className="font-bold text-slate-900">£94,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium flex items-center gap-2"><Table2 size={14} className="text-slate-400" /> Partner Channel</span>
                <span className="font-bold text-slate-900">£55,000</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Lineage:</span>
              <span className="text-slate-700">HubSpot</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Xero</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Shopify</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
