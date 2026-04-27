export default function Slide03Solution() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "-20vh", right: "-10vw", width: "50vw", height: "50vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.08, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", width: "82vw", margin: "0 auto", height: "100vh", alignItems: "center", gap: "5vw", paddingTop: "8vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", alignSelf: "flex-start" }}>
            The Solution
          </div>

          <h2 style={{ fontSize: "4vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", textWrap: "balance" }}>
            Six dimensions of fit. <span style={{ color: "rgba(255,255,255,0.5)" }}>One AI engine.</span>
          </h2>

          <p style={{ fontSize: "1.4vw", fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, maxWidth: "36vw", margin: 0, textWrap: "pretty" }}>
            Keyword search misses the human signal. AVANA Recruit's matching engine reads CVs, role requirements, and candidate preferences — then scores fit on the dimensions that actually predict a successful hire.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", marginTop: "1vh" }}>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", flexShrink: 0 }}>
                <svg width="1.4vw" height="1.4vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.2vw", fontWeight: 600, marginBottom: "0.4vh" }}>Reads the whole picture</div>
                <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Skills, history, preferences, credentials, geography, education — scored together.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", flexShrink: 0 }}>
                <svg width="1.4vw" height="1.4vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.2vw", fontWeight: 600, marginBottom: "0.4vh" }}>Explains every match</div>
                <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Each match comes with a per-dimension score and rationale — no black boxes.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", flexShrink: 0 }}>
                <svg width="1.4vw" height="1.4vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.2vw", fontWeight: 600, marginBottom: "0.4vh" }}>Verified by default</div>
                <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Right-to-work, education, and employment history checked before any match is shown.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", height: "85%", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", boxShadow: "0 2vh 5vh rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "1.2vw 1.5vw", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "1vw", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Senior Backend Engineer · London</div>
              <div style={{ fontSize: "0.85vw", color: "#4CAF50", fontWeight: 600, padding: "0.4vh 0.8vw", border: "1px solid rgba(76,175,80,0.4)", borderRadius: "0.4vw" }}>94% match</div>
            </div>
            <div style={{ padding: "2vw", flex: 1, display: "flex", flexDirection: "column", gap: "1.6vh" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Skills</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>96%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "96%", backgroundColor: "#4CAF50" }} /></div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw", marginTop: "0.5vh" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Experience</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>92%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "92%", backgroundColor: "#4CAF50" }} /></div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw", marginTop: "0.5vh" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Preferences</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>89%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "89%", backgroundColor: "#4CAF50" }} /></div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw", marginTop: "0.5vh" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Credentials</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>100%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "100%", backgroundColor: "#4CAF50" }} /></div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw", marginTop: "0.5vh" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Location</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>95%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "95%", backgroundColor: "#4CAF50" }} /></div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.95vw", marginTop: "0.5vh" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Education</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>91%</span>
              </div>
              <div style={{ height: "0.6vh", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.3vw", overflow: "hidden" }}><div style={{ height: "100%", width: "91%", backgroundColor: "#4CAF50" }} /></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>03 / 12</div>
    </div>
  );
}
