import { ArrowRight, ArrowLeft, Sparkles, X, Plus, FileText, TrendingUp } from "lucide-react";

const cvSuggested = ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "GraphQL", "Docker"];
const popular = ["Python", "Kubernetes", "Next.js", "REST APIs", "CI/CD", "Tailwind"];

export function Skills() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1a2035] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4CAF50] rounded-md flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-white font-semibold tracking-tight">AVANA Recruit</span>
          </div>
          <span className="text-xs text-slate-300">Step 4 of 9</span>
        </div>

        <div className="h-1 bg-slate-100">
          <div className="h-1 bg-[#4CAF50]" style={{ width: "44%" }} />
        </div>

        <div className="px-8 pt-7 pb-3">
          <h1 className="text-xl font-bold text-[#1a2035] mb-1">What are your top skills?</h1>
          <p className="text-sm text-slate-600">Skills make up 35% of your match score — the biggest factor.</p>
        </div>

        <div className="px-8 pb-3">
          <div className="flex items-center gap-2 p-2.5 bg-[#4CAF50]/10 border border-[#4CAF50]/30 rounded-lg">
            <Sparkles className="w-4 h-4 text-[#4CAF50] shrink-0" />
            <p className="text-xs text-[#1a2035]">
              <span className="font-semibold">Pulled from your CV.</span> Confirm or remove any that aren't right.
            </p>
          </div>
        </div>

        <div className="px-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">From your CV</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvSuggested.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-[#4CAF50] text-white text-sm px-3 py-1.5 rounded-full">
                {s}
                <X className="w-3.5 h-3.5 opacity-80 hover:opacity-100 cursor-pointer" />
              </span>
            ))}
          </div>
        </div>

        <div className="px-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Popular in your field</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popular.map((s) => (
              <button key={s} className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 hover:border-[#4CAF50] hover:text-[#4CAF50] text-sm px-3 py-1.5 rounded-full transition-colors">
                <Plus className="w-3.5 h-3.5" /> {s}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 pb-5">
          <input
            type="text"
            placeholder="Add a custom skill..."
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
          />
        </div>

        <div className="px-8 pb-6 flex items-center justify-between">
          <button className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-500 hover:text-slate-700">Skip</button>
            <button className="bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
