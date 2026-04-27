export default function Slide09Market() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "-15vh", right: "-10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.07, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8vh" }}>
        <div style={{ marginBottom: "5vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
            Market opportunity
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "70vw", textWrap: "balance" }}>
            A <span style={{ color: "#4CAF50" }}>£43B</span> UK recruitment market — ready for AI.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.8vw", width: "100%", marginBottom: "3vh" }}>
          <div style={{ padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>UK recruitment industry</div>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.03em" }}>£43B</div>
            <div style={{ marginTop: "1.5vh", fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Annual spend across permanent and contract placements.</div>
          </div>
          <div style={{ padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>UK active job seekers</div>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.03em" }}>9.2M</div>
            <div style={{ marginTop: "1.5vh", fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>People in or open to a new role at any given moment.</div>
          </div>
          <div style={{ padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>UK hiring organisations</div>
            <div style={{ fontSize: "4vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.03em" }}>1.4M</div>
            <div style={{ marginTop: "1.5vh", fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Employers actively hiring across SME and enterprise tiers.</div>
          </div>
        </div>

        <div style={{ padding: "2.5vh 2vw", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1vw", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2vw" }}>
          <div>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.6vh" }}>Initial wedge: UK knowledge-work hiring</div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Tech, finance, life sciences and professional services — where verification, fit, and speed all matter most.</div>
          </div>
          <div style={{ fontSize: "2.6vw", fontWeight: 800, color: "#4CAF50", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>£11B SAM</div>
        </div>

        <div style={{ marginTop: "2vh", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>Figures are illustrative estimates based on REC and ONS market data, 2024–25.</div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>09 / 12</div>
    </div>
  );
}
