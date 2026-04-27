export default function Slide12Closing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A2035", fontFamily: "'Inter', sans-serif", color: "#FFFFFF" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.1, filter: "blur(15vw)" }} />
      <div style={{ position: "absolute", bottom: "-20vh", right: "-10vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#4CAF50", opacity: 0.08, filter: "blur(8vw)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "1vw", zIndex: 10 }}>
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4CAF50", borderRadius: "0.4vw", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2vw", color: "#1A2035" }}>A</div>
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>AVANA Recruit</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.5)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", padding: "0.8vh 1.6vw", backgroundColor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: "2vw", color: "#4CAF50", fontSize: "1vw", fontWeight: 600, marginBottom: "4vh", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Thank you
        </div>

        <h2 style={{ fontSize: "6.5vw", fontWeight: 800, margin: "0 0 2.5vh 0", lineHeight: 1.05, letterSpacing: "-0.04em", maxWidth: "75vw", textWrap: "balance" }}>
          Hiring, finally <span style={{ color: "#4CAF50" }}>matched</span>.
        </h2>

        <p style={{ fontSize: "1.6vw", fontWeight: 300, color: "rgba(255,255,255,0.72)", margin: "0 0 6vh 0", lineHeight: 1.5, maxWidth: "55vw", textWrap: "pretty" }}>
          AVANA Recruit. Verified candidates, six-dimension AI matching, UK-first.
        </p>

        <div style={{ display: "flex", gap: "4vw", padding: "2.5vh 3vw", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5vh" }}>
            <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Web</div>
            <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>avanarecruit.co.uk</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5vh" }}>
            <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Email</div>
            <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>hello@avanarecruit.co.uk</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5vh" }}>
            <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Based in</div>
            <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>London, UK</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em" }}>AVANA RECRUIT · LONDON</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>12 / 12</div>
    </div>
  );
}
