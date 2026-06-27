import { useEffect, useRef, useState } from "react";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

// ── icons ──────────────────────────────────────────────────────────────────
function IconBrain() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  );
}
function IconMessages() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}
function IconChrome() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/>
    </svg>
  );
}

// ── useCountUp ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return val;
}

// ── Terminal ───────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Transcribing audio", delay: 400 },
  { label: "Identifying speakers", delay: 900 },
  { label: "Extracting action items", delay: 1500 },
  { label: "Generating summary", delay: 2200 },
];

function Terminal() {
  const [done, setDone] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    STEPS.forEach((s, i) => {
      setTimeout(() => setDone((d) => [...d, i]), s.delay + 600);
    });
    setTimeout(() => setReady(true), 3200);
  }, []);

  return (
    <div style={{ maxWidth: 880, margin: "3.5rem auto 0", padding: "0 1.5rem", animation: "fadeUp 0.7s 0.8s ease both", opacity: 0 }}>
      <div style={{ background: "#161616", border: "0.5px solid #2c2c2c", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "0.5px solid #1a1a1a", background: "#1a1a1a" }}>
          {["#3a3a3a","#333","#2a2a2a"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          <span style={{ fontSize: 11, color: "#666", marginLeft: 8, fontFamily: "monospace" }}>copilot — processing</span>
        </div>
        <div style={{ padding: "1.25rem 1.5rem", fontFamily: "monospace", fontSize: 12, lineHeight: 1.9 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, opacity: i === 0 || done.includes(i - 1) || i === 0 ? 1 : 0.15, transition: "opacity 0.4s" }}>
              <span style={{ color: "#2a2a2a" }}>›</span>
              <span style={{ color: done.includes(i) ? "#555" : "#333" }}>{s.label}</span>
              <span style={{ marginLeft: "auto", color: done.includes(i) ? "#555" : "#1e1e1e" }}>
                {done.includes(i) ? "done" : "—"}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", marginTop: 6 }}>
            <span style={{ color: "#2a2a2a" }}>$</span>
            <span style={{ color: "#3a3a3a", marginLeft: 8 }}>ready</span>
            {ready && <span style={{ display: "inline-block", width: 7, height: 13, background: "#444", marginLeft: 4, animation: "blink 1.1s step-end infinite", verticalAlign: "middle" }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FeatCard ───────────────────────────────────────────────────────────────
function FeatCard({ icon, title, desc, delay, badge }: { icon: React.ReactNode; title: string; desc: string; delay: number; badge?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        background: "#161616", padding: "1.75rem 1.5rem",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease, background 0.25s`,
        cursor: "default",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#1e1e1e")}
      onMouseLeave={e => (e.currentTarget.style.background = "#161616")}
    >
      <div style={{ width: 34, height: 34, border: "0.5px solid #2a2a2a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem", color: "#888" }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 500, color: "#999", marginBottom: 6 }}>
        {title}
        {badge && <span style={{ fontSize: 9, color: "#3a3a3a", border: "0.5px solid #222", borderRadius: 3, padding: "1px 5px", letterSpacing: "0.08em", marginLeft: 7 }}>NEW</span>}
      </h3>
      <p style={{ fontSize: 12, color: "#333", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

// ── Stats ──────────────────────────────────────────────────────────────────
function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const v1 = useCountUp(10, 1200, started);
  const v2 = useCountUp(98, 1400, started);

  return (
    <div ref={ref} style={{ maxWidth: 880, margin: "3rem auto", padding: "0 1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#222", border: "0.5px solid #222", borderRadius: 10, overflow: "hidden" }}>
        {[
          { n: `${v1}×`, l: "faster notes" },
          { n: `${v2}%`, l: "transcription accuracy" },
          { n: "0", l: "missed action items" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#161616", padding: "1.25rem 0.75rem", textAlign: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 500, color: "#888", display: "block" }}>{s.n}</span>
            <span style={{ fontSize: 11, color: "#555", marginTop: 3, display: "block" }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes orbFloat { 0%{opacity:0;transform:translateY(0)} 20%{opacity:1} 50%{transform:translateY(-30px)} 80%{opacity:1} 100%{opacity:0;transform:translateY(0)} }
        @keyframes pulseRing { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scan { 0%{top:-2px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100vh;opacity:0} }
        .lp-btn-main { padding:10px 24px; border-radius:7px; border:0.5px solid #3a3a3a; background:#161616; color:#d0d0d0; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .lp-btn-main:hover { border-color:#555; background:#1e1e1e; color:#eee; }
        .lp-btn-outline { padding:10px 22px; border-radius:7px; border:0.5px solid #1e1e1e; background:transparent; color:#3a3a3a; font-size:14px; cursor:pointer; transition:all 0.2s; }
        .lp-btn-outline:hover { color:#666; border-color:#2e2e2e; }
        .lp-nav-link { font-size:13px; color:#444; cursor:pointer; padding:5px 10px; border-radius:5px; transition:color 0.2s; }
        .lp-nav-link:hover { color:#999; }
        .lp-feat-grid > * + * { border-left: 0.5px solid #141414; }
        .lp-feat-grid > *:nth-child(3) { border-top:0.5px solid #141414; border-left:none; }
        .lp-feat-grid > *:nth-child(4) { border-top:0.5px solid #141414; }
        @media (max-width: 580px) {
          .lp-feat-grid { grid-template-columns:1fr !important; }
          .lp-feat-grid > * { border-left:none !important; border-top:0.5px solid #141414; }
          .lp-feat-grid > *:first-child { border-top:none; }
        }
      `}</style>

      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#111111", color: "#ffffff", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

        {/* Grid bg */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%,black 30%,transparent 100%)",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%,black 30%,transparent 100%)",
        }} />

        {/* Orbs */}
        {[
          { w:400, h:400, top:"-100px", left:"20%", delay:"0s" },
          { w:300, h:300, top:"30%", right:"10%", delay:"3s" },
          { w:250, h:250, bottom:"10%", left:"30%", delay:"5s" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "fixed", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
            width: o.w, height: o.h, background: "rgba(140,140,140,0.05)",
            top: o.top, left: (o as any).left, right: (o as any).right, bottom: (o as any).bottom,
            animation: `orbFloat 8s ${o.delay} ease-in-out infinite`, opacity: 0,
          }} />
        ))}

        {/* Scan line */}
        <div style={{
          position: "fixed", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
          pointerEvents: "none", zIndex: 1,
          animation: "scan 6s linear infinite",
        }} />

        {/* Nav */}
        <nav style={{
          position: "relative", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.1rem 2rem", borderBottom: "0.5px solid #2a2a2a",
          animation: "fadeDown 0.6s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 16, fontWeight: 500, color: "#ffffff" }}>
            <div style={{ width: 30, height: 30, border: "0.5px solid #333", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", color: "#999" }}>
              <IconBrain />
            </div>
            Co-pilot
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="lp-nav-link">Features</span>
            <span className="lp-nav-link">Pricing</span>
            <SignInButton mode="modal">
              <button style={{ fontSize: 13, color: "#bbb", border: "0.5px solid #2a2a2a", borderRadius: 6, padding: "6px 14px", background: "#111", cursor: "pointer" }}>
                Sign in
              </button>
            </SignInButton>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "5.5rem 2rem 3rem", maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", border: "0.5px solid #333", borderRadius: 20, background: "#1a1a1a", fontSize: 12, color: "#999", marginBottom: "2.2rem", animation: "fadeUp 0.7s 0.2s ease both", opacity: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#888", position: "relative" }}>
              <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "1px solid #666", animation: "pulseRing 2s ease infinite" }} />
            </div>
            AI-powered meeting intelligence
          </div>

          <h1 style={{ fontSize: "clamp(38px,7vw,66px)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: "1.3rem", animation: "fadeUp 0.7s 0.35s ease both", opacity: 0 }}>
            <span style={{ color: "#666666" }}>Stop taking</span><br />
            <span style={{ color: "#aaaaaa" }}>notes.</span> Start<br />
            understanding.
          </h1>

          <p style={{ fontSize: 15, color: "#888888", lineHeight: 1.75, maxWidth: 460, margin: "0 auto 2.5rem", animation: "fadeUp 0.7s 0.5s ease both", opacity: 0 }}>
            Upload recordings, get instant AI summaries, track action items, and chat with your entire meeting history.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.7s 0.65s ease both", opacity: 0 }}>
            <SignInButton mode="modal">
              <button className="lp-btn-main">Get started free</button>
            </SignInButton>
            <button className="lp-btn-outline">Watch demo</button>
          </div>
        </div>

        {/* Terminal */}
        <Terminal />

        {/* Features */}
        <div style={{ position: "relative", zIndex: 5, maxWidth: 890, margin: "4.5rem auto 0", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>Capabilities</span>
          </div>
          <div className="lp-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
            <FeatCard icon={<IconMic />} title="Record & upload" desc="Import any audio or video. Whisper-powered transcription with speaker detection." delay={0} />
            <FeatCard icon={<IconZap />} title="Smart summaries" desc="Instant meeting minutes and auto-extracted action items, assigned to your team." delay={100} />
            <FeatCard icon={<IconMessages />} title="Chat with history" desc="Ask anything about past decisions. RAG-powered search across all your meetings." delay={200} />
            <FeatCard icon={<IconChrome />} title="Browser extension" desc="Capture directly from Meet, Zoom & Teams. AI insights injected into your workflow." delay={300} badge />
          </div>
        </div>

        {/* Stats */}
        <Stats />

        {/* CTA bottom */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "2rem 2rem 5rem", animation: "fadeUp 0.7s 1s ease both", opacity: 0 }}>
          <SignInButton mode="modal">
            <button className="lp-btn-main" style={{ fontSize: 13, padding: "11px 28px" }}>Start for free</button>
          </SignInButton>
          <p style={{ fontSize: 12, color: "#2a2a2a", marginTop: 10 }}>No credit card required · Cancel anytime</p>
        </div>

        {/* Footer */}
        <footer style={{ position: "relative", zIndex: 5, borderTop: "0.5px solid #111", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "#222" }}>Co-pilot · 2026</p>
          <p style={{ fontSize: 12, color: "#222" }}>Built with Groq & Whisper</p>
        </footer>
      </div>
    </>
  );
}
