export default function Slide10WhyNow() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "10vh", left: "10vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", bottom: "10vh", right: "10vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.05, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8vh" }}>
        <div style={{ marginBottom: "5vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
            Why now
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "60vw", textWrap: "balance" }}>
            Three forces converging in <span style={{ color: "#4CAF50" }}>2026</span>.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw", width: "100%" }}>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ width: "3vw", height: "3vw", borderRadius: "0.6vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", textTransform: "uppercase" }}>Force 01</div>
            </div>
            <div style={{ fontSize: "1.7vw", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.15 }}>AI is finally good enough to read CVs</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>Modern language models understand work history at near-human accuracy — and at fractions of the cost of a recruiter.</div>
          </div>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ width: "3vw", height: "3vw", borderRadius: "0.6vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><polyline points="7 14 11 10 15 14 21 8" /></svg>
              </div>
              <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", textTransform: "uppercase" }}>Force 02</div>
            </div>
            <div style={{ fontSize: "1.7vw", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.15 }}>The labour market is restructuring</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>Hybrid work, salary transparency, and tighter hiring budgets all reward platforms that find genuine fit, not just volume.</div>
          </div>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ width: "3vw", height: "3vw", borderRadius: "0.6vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", textTransform: "uppercase" }}>Force 03</div>
            </div>
            <div style={{ fontSize: "1.7vw", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.15 }}>Trust in CVs is collapsing</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>AI-generated CVs and credential fraud have made verified candidate pools the only credible source of truth.</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>10 / 12</div>
    </div>
  );
}
