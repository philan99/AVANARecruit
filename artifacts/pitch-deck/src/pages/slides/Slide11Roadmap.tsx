export default function Slide11Roadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "-15vh", right: "-10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.06, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8vh" }}>
        <div style={{ marginBottom: "5vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
            What's next
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "60vw", textWrap: "balance" }}>
            The 2026 roadmap.
          </h2>
        </div>

        <div style={{ position: "relative", paddingTop: "2vh" }}>
          <div style={{ position: "absolute", top: "5.5vh", left: "8%", right: "8%", height: "0.3vh", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", top: "5.5vh", left: "8%", width: "32%", height: "0.3vh", backgroundColor: "#4CAF50" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2vw", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ width: "2vw", height: "2vw", borderRadius: "50%", backgroundColor: "#4CAF50", border: "0.4vw solid #1A2035", boxShadow: "0 0 0 0.2vw rgba(76,175,80,0.5)", marginBottom: "3vh", marginLeft: "0vw" }} />
              <div style={{ fontSize: "1vw", color: "#4CAF50", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1vh" }}>Q1 — Live</div>
              <div style={{ fontSize: "1.4vw", fontWeight: 700, marginBottom: "1vh", lineHeight: 1.2 }}>UK pilot launch</div>
              <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Verified candidates, 6-dimension matching, AI-rewritten CVs.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ width: "2vw", height: "2vw", borderRadius: "50%", backgroundColor: "#4CAF50", border: "0.4vw solid #1A2035", boxShadow: "0 0 0 0.2vw rgba(76,175,80,0.5)", marginBottom: "3vh" }} />
              <div style={{ fontSize: "1vw", color: "#4CAF50", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1vh" }}>Q2 — Now</div>
              <div style={{ fontSize: "1.4vw", fontWeight: 700, marginBottom: "1vh", lineHeight: 1.2 }}>Employer dashboard</div>
              <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Self-serve role posting, AI shortlisting, and ATS integrations.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ width: "2vw", height: "2vw", borderRadius: "50%", backgroundColor: "#232C47", border: "0.4vw solid #1A2035", boxShadow: "0 0 0 0.2vw rgba(255,255,255,0.1)", marginBottom: "3vh" }} />
              <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1vh" }}>Q3</div>
              <div style={{ fontSize: "1.4vw", fontWeight: 700, marginBottom: "1vh", lineHeight: 1.2 }}>Interview agent</div>
              <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>AI-led structured screens that produce evidence packs, not transcripts.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ width: "2vw", height: "2vw", borderRadius: "50%", backgroundColor: "#232C47", border: "0.4vw solid #1A2035", boxShadow: "0 0 0 0.2vw rgba(255,255,255,0.1)", marginBottom: "3vh" }} />
              <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1vh" }}>Q4</div>
              <div style={{ fontSize: "1.4vw", fontWeight: 700, marginBottom: "1vh", lineHeight: 1.2 }}>EU expansion</div>
              <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Cross-border verification across Ireland, Netherlands, and Germany.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>11 / 12</div>
    </div>
  );
}
