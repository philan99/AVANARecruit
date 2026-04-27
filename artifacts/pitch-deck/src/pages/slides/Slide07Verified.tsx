export default function Slide07Verified() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "20vh", left: "10vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.08, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", width: "82vw", margin: "0 auto", height: "100vh", alignItems: "center", gap: "5vw", paddingTop: "8vh" }}>
        <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: "3vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", alignSelf: "flex-start" }}>
            Our differentiator
          </div>
          <h2 style={{ fontSize: "4.2vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", textWrap: "balance" }}>
            Every candidate is <span style={{ color: "#4CAF50" }}>verified</span>.
          </h2>
          <p style={{ fontSize: "1.4vw", fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, maxWidth: "38vw", margin: 0, textWrap: "pretty" }}>
            Job boards optimise for volume. We optimise for trust. Before any candidate appears in any shortlist, we confirm the things employers care about most.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", marginTop: "2vh" }}>
            <div style={{ display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
              <div style={{ width: "2.4vw", height: "2.4vw", borderRadius: "0.5vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="1.3vw" height="1.3vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.3vw", fontWeight: 600, marginBottom: "0.4vh" }}>Identity &amp; right-to-work</div>
                <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>UK Home Office digital checks completed at sign-up.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
              <div style={{ width: "2.4vw", height: "2.4vw", borderRadius: "0.5vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="1.3vw" height="1.3vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.3vw", fontWeight: 600, marginBottom: "0.4vh" }}>Education &amp; certifications</div>
                <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Degrees, professional bodies, and licences confirmed at source.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
              <div style={{ width: "2.4vw", height: "2.4vw", borderRadius: "0.5vw", backgroundColor: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="1.3vw" height="1.3vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.3vw", fontWeight: 600, marginBottom: "0.4vh" }}>Employment history</div>
                <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Previous employers and dates corroborated before any role is matched.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 0.9, height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "26vw", height: "26vw", borderRadius: "50%", background: "radial-gradient(circle at center, rgba(76,175,80,0.25) 0%, rgba(76,175,80,0.05) 60%, transparent 80%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ width: "16vw", height: "16vw", borderRadius: "50%", backgroundColor: "#232C47", border: "1px solid rgba(76,175,80,0.4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4vh 8vh rgba(0,0,0,0.4)" }}>
              <svg width="8vw" height="8vw" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>07 / 12</div>
    </div>
  );
}
