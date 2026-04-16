import { CheckCircle2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

const completed = [
  "Welcome",
  "CV uploaded",
  "Basics confirmed",
  "Skills added (8)",
  "Education added",
  "Job preferences set",
  "Job alerts on",
];
const pending = ["Add references", "Add 2 more verifications"];

export function AllSet() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1a2035] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4CAF50] rounded-md flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-white font-semibold tracking-tight">AVANA Recruit</span>
          </div>
          <span className="text-xs text-slate-300">Step 9 of 9</span>
        </div>

        <div className="h-1 bg-slate-100">
          <div className="h-1 bg-[#4CAF50]" style={{ width: "100%" }} />
        </div>

        <div className="px-8 pt-7 pb-5 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a2035] mb-1">You're all set, Sarah</h1>
          <p className="text-sm text-slate-600">Your profile is ready. Here's what we found for you.</p>
        </div>

        <div className="px-8 pb-5">
          <div className="bg-gradient-to-br from-[#1a2035] to-[#252d4a] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wide text-slate-300">Profile completeness</span>
              <span className="text-xs text-slate-300">82%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-2 bg-[#4CAF50] rounded-full" style={{ width: "82%" }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">17 jobs</div>
                <div className="text-xs text-slate-300">matched and waiting</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#4CAF50]">94%</div>
                <div className="text-xs text-slate-300">top match score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Completed</p>
          <div className="space-y-1.5">
            {completed.map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 mt-3">Boost your score later</p>
          <div className="space-y-1.5">
            {pending.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                {p}
                <button className="ml-auto text-xs text-[#4CAF50] hover:underline">Do now</button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-7">
          <button className="w-full bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold text-sm px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Sparkles className="w-4 h-4" /> View my matches <ArrowRight className="w-4 h-4" />
          </button>
          <button className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 py-2">
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
