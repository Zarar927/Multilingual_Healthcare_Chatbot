"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Custom Cursor ────────────────────────────────────────────────────────────
const TRAIL_LENGTH = 20;
function CustomCursor() {
  const canvasRef = useRef(null);
  const points = useRef([]);
  const mouse = useRef({ x: -200, y: -200 });
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points.current.push({ x: mouse.current.x, y: mouse.current.y });
      if (points.current.length > TRAIL_LENGTH) points.current.shift();
      const pts = points.current;
      if (pts.length < 2) { animRef.current = requestAnimationFrame(draw); return; }
      for (let i = 1; i < pts.length; i++) {
        const t = i / pts.length;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = `rgba(99,102,241,${t * 0.85})`;
        ctx.lineWidth = t * 6;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(99,102,241,0.25)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      const head = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1"; ctx.shadowBlur = 8; ctx.shadowColor = "rgba(99,102,241,0.25)";
      ctx.fill();
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }} />;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const navLink = (href, label) => {
    const isActive = pathname === href;
    return (
      <Link key={label} href={href} style={{ fontSize: "0.875rem", fontWeight: isActive ? 700 : 500, color: isActive ? "#6366f1" : "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent", padding: "4px 0", transition: "color 0.2s" }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#6366f1"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#374151"; }}
      >{label}</Link>
    );
  };
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s ease", background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.1)", boxShadow: scrolled ? "0 4px 24px rgba(99,102,241,0.08)" : "none" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", fontWeight: 500, color: "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", padding: "4px 0", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Home
          </Link>
          {navLink("/about", "About Us")}
          {navLink("/project", "About Project")}
        </div>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>🤖</div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Healthcare</span>
        </Link>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          {navLink("/chat", "Chatbot")}
          <Link href="/signin" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6366f1", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", borderBottom: "2px solid #6366f1", padding: "4px 0" }}>Sign In</Link>
          <Link href="/signup" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "8px 20px", borderRadius: 100, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)"; }}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Back Breadcrumb ──────────────────────────────────────────────────────────
function BackBreadcrumb() {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "fixed", top: 68, left: 0, right: 0, zIndex: 99, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(99,102,241,0.08)", padding: "0 2rem", animation: "breadcrumbSlide 0.4s ease both" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: 38, display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: hovered ? "rgba(99,102,241,0.13)" : "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 14px 3px 8px", textDecoration: "none", transition: "all 0.25s ease", transform: hovered ? "translateX(-2px)" : "translateX(0)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: hovered ? "translateX(-2px)" : "translateX(0)" }}><polyline points="15 18 9 12 15 6" /></svg>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1" }}>Back to Home</span>
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af" }}>Sign In</span>
      </div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, type, value, onChange, placeholder, icon, error, rightElement }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "0.45rem", letterSpacing: "0.01em" }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: focused ? "#fff" : "rgba(249,250,251,0.8)",
        border: `1.5px solid ${error ? "#ef4444" : focused ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
        borderRadius: 14, padding: "0 14px",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: focused ? `0 0 0 4px rgba(99,102,241,0.1)` : error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
      }}>
        <span style={{ fontSize: 17, opacity: focused ? 1 : 0.5, transition: "opacity 0.2s", flexShrink: 0 }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", color: "#1e1b4b",
            padding: "13px 0", cursor: "none",
          }}
        />
        {rightElement}
      </div>
      {error && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><span>⚠</span>{error}</p>}
    </div>
  );
}

// ─── Main Sign In Page ────────────────────────────────────────────────────────
export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
  };

  const eyeIcon = (
    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "none", padding: 4, display: "flex", alignItems: "center", color: "#9ca3af", transition: "color 0.2s" }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
      onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
      {showPassword
        ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
        : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      }
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none; }
        body { background: #f8f7ff; overflow-x: hidden; min-height: 100vh; }

        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes float {
          from { transform: translateY(0) rotate(0deg); }
          to   { transform: translateY(-16px) rotate(4deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.88) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes breadcrumbSlide {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0); opacity:0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity:1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 50; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        input::placeholder { color: #c4c9d4; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 50px white inset; }
      `}</style>

      <CustomCursor />
      <Navbar />
      <BackBreadcrumb />

      <div style={{
        minHeight: "100vh",
        paddingTop: 106,
        paddingBottom: "3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 55%,#faf5ff 100%)",
      }}>

        {/* ── Background blobs ── */}
        <div style={{ position: "absolute", top: "5%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", animation: "blob 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-8%", width: 460, height: 460, background: "radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", animation: "blob 12s ease-in-out 2s infinite", pointerEvents: "none" }} />

        {/* ── Floating decorations ── */}
        {[
          { top: "18%", left: "7%", text: "🔒", size: 44, delay: 0 },
          { top: "25%", right: "6%", text: "🤖", size: 40, delay: 0.8 },
          { bottom: "25%", left: "5%", text: "💊", size: 36, delay: 0.4 },
          { bottom: "20%", right: "7%", text: "❤️", size: 38, delay: 1.2 },
        ].map(({ text, size, delay, ...pos }) => (
          <div key={text} style={{
            position: "absolute", ...pos,
            width: size + 16, height: size + 16,
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)",
            borderRadius: 14, border: "1px solid rgba(99,102,241,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.55, boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
            animation: `float 3.5s ease-in-out ${delay}s infinite alternate`,
            pointerEvents: "none",
          }}>{text}</div>
        ))}

        {/* ── Two-column layout ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          maxWidth: 960,
          width: "100%",
          margin: "0 2rem",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.08)",
          animation: mounted ? "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>

          {/* ── LEFT PANEL — Brand side ── */}
          <div style={{
            background: "linear-gradient(160deg,#6366f1 0%,#8b5cf6 60%,#4f46e5 100%)",
            padding: "3.5rem 3rem",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            {/* BG decoration circles */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -80, left: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "45%", left: "40%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            {/* Top — logo */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>🤖</div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#fff", letterSpacing: "-0.02em" }}>AI Healthcare</span>
              </div>

              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,2.5vw,2.2rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1rem" }}>
                Welcome back to your health companion
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.72 }}>
                Sign in to continue getting AI-powered health guidance, view your chat history, and access personalized insights.
              </p>
            </div>

            {/* Middle — feature list */}
            <div style={{ margin: "2rem 0" }}>
              {[
                { icon: "🧠", text: "RAG-powered medical answers" },
                { icon: "📋", text: "Prescription OCR & analysis" },
                { icon: "🌐", text: "Multilingual support — 30+ languages" },
                { icon: "🔒", text: "Zero data retention policy" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.9rem" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Bottom — testimonial */}
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "1.25rem 1.5rem", border: "1px solid rgba(255,255,255,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, marginBottom: "0.75rem", fontStyle: "italic" }}>
                "This chatbot explained my prescription better than any pharmacist I've visited. Absolutely incredible."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>Sarah M.</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>Verified User</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map((s) => <span key={s} style={{ fontSize: 12, color: "#fbbf24" }}>★</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — Form ── */}
          <div style={{ background: "#fff", padding: "3.5rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {success ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
                  animation: "successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "checkDraw 0.5s ease 0.3s both" }} />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#1e1b4b", marginBottom: "0.6rem", letterSpacing: "-0.02em" }}>You're signed in!</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", color: "#6b7280", marginBottom: "2rem", lineHeight: 1.65 }}>
                  Welcome back. Redirecting you to the chatbot...
                </p>
                <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.92rem", padding: "13px 28px", borderRadius: 100, boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
                  Go to Chatbot →
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>Sign in</h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "#6b7280" }}>
                    Don't have an account?{" "}
                    <Link href="/signup" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                      Create one free
                    </Link>
                  </p>
                </div>

                {/* Google SSO button */}
                <button style={{
                  width: "100%", background: "#fff", border: "1.5px solid rgba(99,102,241,0.2)",
                  borderRadius: 14, padding: "12px 20px", marginBottom: "1.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#374151",
                  cursor: "none", transition: "all 0.25s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.12)" }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>or sign in with email</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.12)" }} />
                </div>

                {/* Email */}
                <InputField
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  icon="✉️"
                  error={errors.email}
                />

                {/* Password */}
                <InputField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  icon="🔑"
                  error={errors.password}
                  rightElement={eyeIcon}
                />

                {/* Remember + Forgot */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", marginTop: "-0.25rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "none" }}>
                    <div onClick={() => setRememberMe(!rememberMe)} style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: rememberMe ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff",
                      border: `1.5px solid ${rememberMe ? "#6366f1" : "rgba(99,102,241,0.3)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease", flexShrink: 0,
                    }}>
                      {rememberMe && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "#6b7280" }}>Remember me</span>
                  </label>
                  <Link href="#" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#6366f1", textDecoration: "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading} style={{
                  width: "100%", border: "none", borderRadius: 14,
                  background: loading ? "rgba(99,102,241,0.6)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
                  fontSize: "0.95rem", padding: "14px", cursor: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.38)",
                  transition: "all 0.25s ease",
                  transform: loading ? "none" : "translateY(0)",
                }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.5)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 24px rgba(99,102,241,0.38)"; }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Signing you in...
                    </>
                  ) : (
                    <>Sign In →</>
                  )}
                </button>

                {/* Sign up link */}
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "#9ca3af", textAlign: "center", marginTop: "1.5rem" }}>
                  New to AI Healthcare?{" "}
                  <Link href="/signup" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                    Create a free account
                  </Link>
                </p>

                {/* Security note */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "1.25rem", padding: "10px", background: "rgba(99,102,241,0.04)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.08)" }}>
                  <span style={{ fontSize: 13 }}>🔒</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#9ca3af" }}>256-bit SSL encrypted · Zero data retention · HIPAA compliant</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}