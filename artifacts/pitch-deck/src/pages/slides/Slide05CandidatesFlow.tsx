export default function Slide05CandidatesFlow() {
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
            How it works · For candidates
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "60vw", textWrap: "balance" }}>
            From CV to first interview <span style={{ color: "rgba(255,255,255,0.5)" }}>in days, not months.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw", width: "100%" }}>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", position: "relative" }}>
            <div style={{ fontSize: "5vw", fontWeight: 800, color: "rgba(76,175,80,0.25)", lineHeight: 1, letterSpacing: "-0.04em" }}>01</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, marginTop: "2vh", marginBottom: "1.5vh" }}>Sign up &amp; verify</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>Confirm right-to-work, ID, and contact details once. Re-used across every match.</div>
          </div>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", position: "relative" }}>
            <div style={{ fontSize: "5vw", fontWeight: 800, color: "rgba(76,175,80,0.25)", lineHeight: 1, letterSpacing: "-0.04em" }}>02</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, marginTop: "2vh", marginBottom: "1.5vh" }}>Upload your CV</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>We extract skills, experience, and education automatically. You stay in control of every line.</div>
          </div>
          <div style={{ padding: "4vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", position: "relative" }}>
            <div style={{ fontSize: "5vw", fontWeight: 800, color: "rgba(76,175,80,0.25)", lineHeight: 1, letterSpacing: "-0.04em" }}>03</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, marginTop: "2vh", marginBottom: "1.5vh" }}>Get matched</div>
            <div style={{ fontSize: "1.05vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>Roles ranked by genuine fit, with a transparent score. No more shouting into the void.</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>05 / 12</div>
    </div>
  );
}
