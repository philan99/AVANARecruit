export default function Slide04SixDimensions() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "10vh", left: "20vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", bottom: "10vh", right: "10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.04, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8vh" }}>
        <div style={{ marginBottom: "5vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
            The Six Dimensions
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "60vw", textWrap: "balance" }}>
            What we measure when we say <span style={{ color: "#4CAF50" }}>match</span>.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5vw", width: "100%" }}>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>01 — SKILLS</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>Demonstrated, not declared</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Skills extracted from real work history — weighted by recency and depth.</div>
          </div>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>02 — EXPERIENCE</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>Career arc, not just years</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Seniority, scope, industry shifts, and trajectory all factored in.</div>
          </div>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>03 — PREFERENCES</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>What candidates want next</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Remote, hybrid, salary band, team size, and travel — captured up front.</div>
          </div>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>04 — CREDENTIALS</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>Verified before they're shown</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Right-to-work, certifications, and licences confirmed at source.</div>
          </div>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>05 — LOCATION</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>UK-aware geography</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Commutability, hub clusters, and willingness to relocate — by postcode.</div>
          </div>
          <div style={{ padding: "3vh 1.8vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#4CAF50", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>06 — EDUCATION</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, marginBottom: "1vh" }}>Signal without snobbery</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Qualifications scored against role requirements — not prestige rankings.</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>04 / 12</div>
    </div>
  );
}
