export default function Slide02Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "-15vh", left: "-10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.05, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8vh" }}>
        <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", alignSelf: "flex-start", marginBottom: "3vh" }}>
          The Problem
        </div>

        <h2 style={{ fontSize: "4vw", fontWeight: 800, margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: "70vw", textWrap: "balance" }}>
          UK hiring is slow, expensive, and <span style={{ color: "rgba(255,255,255,0.5)" }}>miscalibrated.</span>
        </h2>

        <p style={{ fontSize: "1.5vw", fontWeight: 300, color: "rgba(255,255,255,0.7)", maxWidth: "60vw", margin: "0 0 6vh 0", lineHeight: 1.55, textWrap: "pretty" }}>
          Both sides of the market are wasting time. Candidates send hundreds of applications into a void. Employers pay for noise and still miss the right people.
        </p>

        <div style={{ display: "flex", gap: "2vw", width: "100%" }}>
          <div style={{ flex: 1, padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>42<span style={{ fontSize: "1.8vw", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginLeft: "0.4vw" }}>days</span></div>
            <div style={{ fontSize: "1.05vw", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: "1.5vh", lineHeight: 1.4 }}>Average time to fill a UK role — and rising every year.</div>
          </div>
          <div style={{ flex: 1, padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>£4.5k<span style={{ fontSize: "1.5vw", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginLeft: "0.4vw" }}>per hire</span></div>
            <div style={{ fontSize: "1.05vw", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: "1.5vh", lineHeight: 1.4 }}>Direct cost-per-hire before recruiter fees and lost productivity.</div>
          </div>
          <div style={{ flex: 1, padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>89%<span style={{ fontSize: "1.5vw", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginLeft: "0.4vw" }}>ignored</span></div>
            <div style={{ fontSize: "1.05vw", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: "1.5vh", lineHeight: 1.4 }}>Of CVs are never read by a human at the company they were sent to.</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>02 / 12</div>
    </div>
  );
}
