import { Sparkles, Check, Quote } from "lucide-react";

const TRAITS = [
  { label: "Self-starter", match: true },
  { label: "Customer-facing", match: true },
  { label: "Calm under pressure", match: false },
];

export function CandidateDisplay() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6 font-sans antialiased flex items-center justify-center">
      <div className="w-full max-w-[480px] space-y-4">
        {/* Main panel */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_20px_-8px_rgba(26,32,53,0.08)] overflow-hidden">
          {/* Accent bar */}
          <div className="h-1" style={{ background: "linear-gradient(90deg, #4CAF50 0%, #6dcf72 100%)" }} />

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#4CAF50]">
                What we're looking for
              </span>
            </div>
            <h3 className="text-[18px] font-bold leading-snug text-[#1a2035]">
              The kind of person who'd thrive in this role
            </h3>
          </div>

          {/* Working style traits */}
          <div className="px-6 pb-5">
            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9ca3af] mb-2.5">
              Working style
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRAITS.map((t) => (
                <span
                  key={t.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${
                    t.match
                      ? "text-white"
                      : "bg-white text-[#374151] border border-[#e5e7eb]"
                  }`}
                  style={
                    t.match
                      ? { background: "linear-gradient(135deg, #1a2035 0%, #2c3454 100%)" }
                      : undefined
                  }
                >
                  {t.match && <Check className="w-3 h-3" style={{ color: "#4CAF50" }} />}
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Quote / company note */}
          <div className="mx-6 mb-6 rounded-xl p-4 relative" style={{ backgroundColor: "#f8f9fb", border: "1px solid #eef0f3" }}>
            <Quote className="absolute top-3 left-3 w-4 h-4 text-[#4CAF50] opacity-30" />
            <p className="text-[13px] leading-relaxed text-[#374151] pl-6 italic">
              "Someone who's comfortable owning ambiguous problems end-to-end and enjoys talking
              directly to customers — we're a small team and you'll need to wear several hats."
            </p>
            <div className="text-[10px] text-[#9ca3af] mt-2 pl-6">— from the hiring team at Northwind Labs</div>
          </div>
        </div>

        {/* Inline match-score impact */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}
          >
            67%
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-[#1a2035] mb-0.5">
              Fit signal · 2 of 3 traits match
            </div>
            <div className="h-1.5 rounded-full bg-[#eef0f3] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "67%", background: "linear-gradient(90deg, #4CAF50 0%, #6dcf72 100%)" }} />
            </div>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9ca3af]">
            10% wt
          </span>
        </div>
      </div>
    </div>
  );
}
