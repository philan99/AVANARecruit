import { useState } from "react";
import { Sparkles, Info, X, Plus, Wand2 } from "lucide-react";

const SUGGESTED_TRAITS = [
  "Self-starter",
  "Detail-oriented",
  "Collaborative",
  "Customer-facing",
  "Calm under pressure",
  "Strategic thinker",
  "Builder / 0-to-1",
  "Process-driven",
  "Curious learner",
  "Analytical",
  "Creative problem-solver",
  "Mentor / coach",
];

export function JobFormSection() {
  const [selected, setSelected] = useState<string[]>([
    "Self-starter",
    "Customer-facing",
    "Calm under pressure",
  ]);
  const [note, setNote] = useState(
    "Someone who's comfortable owning ambiguous problems end-to-end and enjoys talking directly to customers — we're a small team and you'll need to wear several hats."
  );
  const [includeInScore, setIncludeInScore] = useState(true);

  const toggle = (t: string) => {
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : prev.length >= 5 ? prev : [...prev, t]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6 font-sans antialiased">
      <div className="max-w-[640px] mx-auto bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_20px_-8px_rgba(26,32,53,0.08)] overflow-hidden">
        {/* Section header */}
        <div className="px-7 pt-7 pb-5 border-b border-[#f1f2f4]">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-[17px] font-bold text-[#1a2035]">Ideal Candidate</h2>
              <span
                className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(76,175,80,0.1)", color: "#4CAF50" }}
              >
                Optional
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#9ca3af] mt-2">Step 6 of 7</span>
          </div>
          <p className="text-[13px] leading-relaxed text-[#6b7280]">
            Beyond skills and experience — describe the kind of person who'd thrive in this role.
            We'll use this as a soft signal in matching, not a hard filter.
          </p>
        </div>

        {/* Working style traits */}
        <div className="px-7 pt-6 pb-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-[#1a2035]">
              Working style{" "}
              <span className="text-[#9ca3af] font-normal">
                · pick up to 5 ({selected.length}/5)
              </span>
            </label>
            <button className="text-[11px] font-medium text-[#4CAF50] hover:underline flex items-center gap-1">
              <Wand2 className="w-3 h-3" /> Suggest from job description
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TRAITS.map((trait) => {
              const isSelected = selected.includes(trait);
              const disabled = !isSelected && selected.length >= 5;
              return (
                <button
                  key={trait}
                  onClick={() => toggle(trait)}
                  disabled={disabled}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    isSelected
                      ? "text-white shadow-sm"
                      : disabled
                      ? "bg-[#f3f4f6] text-[#c0c4cc] cursor-not-allowed"
                      : "bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#4CAF50] hover:text-[#4CAF50]"
                  }`}
                  style={
                    isSelected
                      ? { background: "linear-gradient(135deg, #1a2035 0%, #2c3454 100%)" }
                      : undefined
                  }
                >
                  {isSelected ? <X className="w-3 h-3 opacity-70" /> : <Plus className="w-3 h-3 opacity-60" />}
                  {trait}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free-text note */}
        <div className="px-7 pb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-semibold text-[#1a2035]">
              Why this role suits them{" "}
              <span className="text-[#9ca3af] font-normal">· optional, 1–2 sentences</span>
            </label>
            <span className={`text-[11px] font-mono ${note.length > 280 ? "text-[#dc2626]" : "text-[#9ca3af]"}`}>
              {note.length}/300
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder="e.g. Someone energised by ambiguity who enjoys building from a blank page…"
            rows={3}
            className="w-full text-[13px] leading-relaxed p-3 rounded-lg border border-[#e5e7eb] resize-none focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/15 text-[#1a2035] placeholder:text-[#c0c4cc]"
          />
          <div className="mt-2 flex items-start gap-1.5">
            <Info className="w-3 h-3 text-[#9ca3af] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed text-[#9ca3af]">
              We'll automatically flag wording that could introduce bias (age, gender, background)
              and suggest neutral alternatives before you publish.
            </p>
          </div>
        </div>

        {/* Scoring toggle */}
        <div className="mx-7 mb-6 rounded-xl p-4" style={{ backgroundColor: "#f8f9fb", border: "1px solid #eef0f3" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-[#1a2035] mb-0.5">
                Use as a scoring signal
              </div>
              <p className="text-[11px] leading-relaxed text-[#6b7280]">
                Adds a 10% "Fit" dimension to the overall match score. Turn off to keep this section
                as candidate-facing context only.
              </p>
            </div>
            <button
              onClick={() => setIncludeInScore(!includeInScore)}
              className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors mt-0.5"
              style={{ backgroundColor: includeInScore ? "#4CAF50" : "#d1d5db" }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: includeInScore ? "translateX(18px)" : "translateX(2px)", marginTop: "2px" }}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-7 py-4 border-t border-[#f1f2f4] flex items-center justify-between bg-[#fafbfc]">
          <button className="text-[13px] font-medium text-[#6b7280] hover:text-[#1a2035]">← Back</button>
          <div className="flex items-center gap-2">
            <button className="text-[13px] font-medium text-[#6b7280] hover:text-[#1a2035] px-3 py-2">
              Skip for now
            </button>
            <button
              className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
