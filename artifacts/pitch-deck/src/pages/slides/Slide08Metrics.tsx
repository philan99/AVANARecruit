export default function Slide08Metrics() {
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

      <div style={{ position: "relative", zIndex: 10, width: "82vw", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "8vh" }}>
        <div style={{ textAlign: "center", marginBottom: "5vh" }}>
          <div style={{ display: "inline-block", padding: "0.6vh 1.2vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "0.9vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
            Early results
          </div>
          <h2 style={{ fontSize: "3.6vw", fontWeight: 800, margin: "0 0 1.5vh 0", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "60vw", textWrap: "balance" }}>
            Built to perform from <span style={{ color: "#4CAF50" }}>day one</span>.
          </h2>
          <p style={{ fontSize: "1.2vw", fontWeight: 300, color: "rgba(255,255,255,0.6)", maxWidth: "50vw", margin: "0 auto", lineHeight: 1.5, textWrap: "pretty" }}>
            Pilot programmes with UK employers across tech, finance, and life sciences are already producing measurable, repeatable outcomes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2vw", width: "100%", justifyContent: "center", marginBottom: "4vh" }}>
          <div style={{ width: "22vw", padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2vh 4vh rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>Time to first interview</div>
            <div style={{ fontSize: "4.5vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>48hr</div>
            <div style={{ marginTop: "2vh", padding: "0.5vh 1vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.8)" }}>vs. 21-day industry average</div>
          </div>
          <div style={{ width: "22vw", padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2vh 4vh rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>Match accuracy</div>
            <div style={{ fontSize: "4.5vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>92%</div>
            <div style={{ marginTop: "2vh", padding: "0.5vh 1vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.8)" }}>employer-rated relevance</div>
          </div>
          <div style={{ width: "22vw", padding: "3vh 2vw", backgroundColor: "#232C47", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2vh 4vh rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1vh" }}>Cost per hire</div>
            <div style={{ fontSize: "4.5vw", fontWeight: 800, color: "#4CAF50", lineHeight: 1, letterSpacing: "-0.03em" }}>−68%</div>
            <div style={{ marginTop: "2vh", padding: "0.5vh 1vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.8)" }}>vs. agency-led process</div>
          </div>
        </div>

        <div style={{ width: "70vw", height: "20vh", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1vw", padding: "1.5vw 2vw", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1vw" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "5vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W1</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "7vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W2</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "6vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W3</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "8.5vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W4</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "10vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W5</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "9vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W6</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "12vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W7</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "11vh", backgroundColor: "rgba(76,175,80,0.3)", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W8</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
            <div style={{ width: "100%", height: "14vh", backgroundColor: "#4CAF50", borderRadius: "0.3vw" }} />
            <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.35)" }}>W9</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>08 / 12</div>
    </div>
  );
}
