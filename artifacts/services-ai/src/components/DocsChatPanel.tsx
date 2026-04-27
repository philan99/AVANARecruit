import { motion } from "framer-motion";
import { FileText, Send } from "lucide-react";

export function DocsChatPanel() {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-sm flex flex-col h-[400px]">
      <div className="bg-slate-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500">
          <FileText size={16} />
        </div>
        <div>
          <div className="font-medium text-slate-900">Employment_Contract_v3.pdf</div>
          <div className="text-xs text-slate-500">12 pages · Indexed</div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col justify-end space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="self-end max-w-[85%]"
        >
          <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] leading-relaxed">
            What's the notice period and is there a non-compete clause?
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="self-start max-w-[90%]"
        >
          <div className="bg-primary/10 border border-primary/20 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed">
            <p className="mb-2">The notice period is <strong>3 months</strong> for both parties.</p>
            <p>Yes — Section 11.2 contains a <strong>6-month non-compete clause</strong> covering direct competitors within the UK.</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary font-medium uppercase">Sourced:</span>
              <span className="text-[10px] bg-white border border-primary/20 text-primary px-1.5 py-0.5 rounded">Page 7</span>
              <span className="text-[10px] bg-white border border-primary/20 text-primary px-1.5 py-0.5 rounded">Page 9</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask another question…" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-slate-900"
            disabled
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
