import { ArrowRight, CheckCircle2, Briefcase, Target, ShieldCheck } from "lucide-react";

export function Welcome() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1a2035] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4CAF50] rounded-md flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-white font-semibold tracking-tight">AVANA Recruit</span>
          </div>
          <span className="text-xs text-slate-300">Step 1 of 9</span>
        </div>

        <div className="h-1 bg-slate-100">
          <div className="h-1 bg-[#4CAF50]" style={{ width: "11%" }} />
        </div>

        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-[#4CAF50]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a2035] mb-2">Welcome to AVANA Recruit, Sarah</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Let's get your profile set up so we can match you with the right roles. It takes about 5 minutes — and we'll save your progress as you go.
          </p>
        </div>

        <div className="px-8 pb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Briefcase className="w-5 h-5 text-[#4CAF50] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1a2035]">Build a profile that gets noticed</p>
              <p className="text-xs text-slate-600">Upload your CV and we'll auto-fill the rest.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Target className="w-5 h-5 text-[#4CAF50] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1a2035]">Get matched to jobs that fit</p>
              <p className="text-xs text-slate-600">Our AI ranks roles by your skills, experience and location.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-[#4CAF50] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1a2035]">Stand out with verifications</p>
              <p className="text-xs text-slate-600">Adding 3+ references can boost your match score by 30%.</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 flex items-center justify-between">
          <button className="text-sm text-slate-500 hover:text-slate-700">Skip for now</button>
          <button className="bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
            Let's get started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
