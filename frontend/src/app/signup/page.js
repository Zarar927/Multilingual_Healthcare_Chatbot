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
          {navLink("/signin", "Sign In")}
          <Link href="/signup" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "8px 20px", borderRadius: 100, boxShadow: "0 4px 14px rgba(99,102,241,0.5)", outline: "2px solid rgba(165,180,252,0.6)", outlineOffset: 2 }}>Sign Up</Link>
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
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af" }}>Sign Up</span>
      </div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, type = "text", value, onChange, placeholder, icon, error, rightElement, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem", letterSpacing: "0.01em" }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: focused ? "#fff" : "rgba(249,250,251,0.9)",
        border: `1.5px solid ${error ? "#ef4444" : focused ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
        borderRadius: 14, padding: "0 14px",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: focused ? "0 0 0 4px rgba(99,102,241,0.1)" : error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
      }}>
        <span style={{ fontSize: 16, opacity: focused ? 1 : 0.5, transition: "opacity 0.2s", flexShrink: 0 }}>{icon}</span>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "#1e1b4b", padding: "12px 0", cursor: "none" }}
        />
        {rightElement}
      </div>
      {error && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.73rem", color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><span>⚠</span>{error}</p>}
      {hint && !error && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.73rem", color: "#9ca3af", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── Password Strength Meter ──────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8, marginBottom: "0.5rem" }}>
      {/* Strength bars */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i < score ? colors[score] : "rgba(99,102,241,0.1)", transition: "background 0.3s ease" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {checks.map(({ label, pass }) => (
            <span key={label} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: pass ? "#10b981" : "#9ca3af", display: "flex", alignItems: "center", gap: 3, transition: "color 0.3s" }}>
              <span style={{ fontSize: 10 }}>{pass ? "✓" : "○"}</span>{label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 700, color: colors[score] }}>{labels[score]}</span>
        )}
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, active, done }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: done ? "linear-gradient(135deg,#10b981,#059669)" : active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(99,102,241,0.1)",
        border: `2px solid ${done ? "#10b981" : active ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: active ? "0 4px 14px rgba(99,102,241,0.35)" : done ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
      }}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 700, color: active ? "#fff" : "rgba(99,102,241,0.5)" }}>{n}</span>
        }
      </div>
    </div>
  );
}

// ─── Main Sign Up Page ────────────────────────────────────────────────────────
export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", phone: "", agree: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.agree) errs.agree = "You must accept the terms to continue";
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{ background: "none", border: "none", cursor: "none", padding: 4, display: "flex", alignItems: "center", color: "#9ca3af", transition: "color 0.2s" }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
      onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
      {show
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      }
    </button>
  );

  const stepLabels = ["Personal Info", "Security", "Done"];

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
          to   { transform: translateY(-14px) rotate(5deg); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.9) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes breadcrumbSlide {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideLeft {
          from { opacity:0; transform:translateX(-32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
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
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(-80px) rotate(360deg); opacity:0; }
        }
        input::placeholder { color: #c4c9d4; }
      `}</style>

      <CustomCursor />
      <Navbar />
      <BackBreadcrumb />

      <div style={{
        minHeight: "100vh", paddingTop: 106, paddingBottom: "3rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 55%,#faf5ff 100%)",
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "3%", left: "-8%", width: 480, height: 480, background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", animation: "blob 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "3%", right: "-8%", width: 440, height: 440, background: "radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", animation: "blob 12s ease-in-out 2s infinite", pointerEvents: "none" }} />

        {/* Floating decorations */}
        {[
          { top: "16%", left: "5%", text: "✨", delay: 0 },
          { top: "22%", right: "5%", text: "🏥", delay: 0.8 },
          { bottom: "22%", left: "4%", text: "🧬", delay: 0.4 },
          { bottom: "18%", right: "5%", text: "💙", delay: 1.2 },
        ].map(({ text, delay, ...pos }) => (
          <div key={text} style={{
            position: "absolute", ...pos,
            width: 52, height: 52,
            background: "rgba(255,255,255,0.82)", backdropFilter: "blur(10px)",
            borderRadius: 14, border: "1px solid rgba(99,102,241,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
            animation: `float 3.5s ease-in-out ${delay}s infinite alternate`,
            pointerEvents: "none",
          }}>{text}</div>
        ))}

        {/* ── Main card ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
          maxWidth: 980, width: "100%", margin: "0 2rem",
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.08)",
          animation: mounted ? "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            background: "linear-gradient(160deg,#4f46e5 0%,#6366f1 40%,#8b5cf6 100%)",
            padding: "3.5rem 3rem", display: "flex", flexDirection: "column",
            justifyContent: "space-between", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "42%", right: "10%", width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            {/* Logo */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.25rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>🤖</div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#fff", letterSpacing: "-0.02em" }}>AI Healthcare</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", borderRadius: 100, padding: "5px 14px", marginBottom: "1.25rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.06em" }}>FREE FOREVER · NO CREDIT CARD</span>
              </div>

              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,2.2vw,2rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.18, marginBottom: "1rem" }}>
                Join 50,000+ people taking control of their health
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.72, marginBottom: "2rem" }}>
                Get instant AI-powered health guidance, prescription analysis, and multilingual support — all in one place.
              </p>

              {/* What you get */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { icon: "🧠", title: "RAG-Powered Answers", sub: "Grounded in verified medical knowledge" },
                  { icon: "📋", title: "Prescription OCR", sub: "Upload & understand any prescription" },
                  { icon: "🌐", title: "30+ Languages", sub: "Ask in your native language" },
                  { icon: "👨‍⚕️", title: "Doctor Referrals", sub: "Connect to verified professionals" },
                ].map(({ icon, title, sub }) => (
                  <div key={title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{title}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.74rem", color: "rgba(255,255,255,0.6)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom — social proof */}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: -6, marginBottom: "0.6rem" }}>
                {["👩", "👨", "🧑", "👩‍⚕️", "👨‍⚕️"].map((e, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${240 + i * 20},60%,65%)`, border: "2px solid rgba(99,102,241,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginLeft: i === 0 ? 0 : -8 }}>{e}</div>
                ))}
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginLeft: 10 }}>+49,995 members</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map((s) => <span key={s} style={{ fontSize: 14, color: "#fbbf24" }}>★</span>)}
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginLeft: 6 }}>4.9 / 5 rating</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — Form ── */}
          <div style={{ background: "#fff", padding: "3rem 3rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {success ? (
              /* ── Success ── */
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                {/* Confetti dots */}
                {["#6366f1","#8b5cf6","#10b981","#f59e0b","#ec4899"].map((c, i) => (
                  <div key={i} style={{ position: "absolute", left: `${45 + (i - 2) * 8}%`, top: "38%", width: 8, height: 8, borderRadius: "50%", background: c, animation: `confetti 0.8s ease ${i * 0.1}s both`, pointerEvents: "none" }} />
                ))}
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 10px 32px rgba(99,102,241,0.42)", animation: "successPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "checkDraw 0.5s ease 0.35s both" }} />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#1e1b4b", marginBottom: "0.5rem", letterSpacing: "-0.025em" }}>Account created! 🎉</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", color: "#6b7280", marginBottom: "0.5rem", lineHeight: 1.65 }}>
                  Welcome to AI Healthcare, <strong style={{ color: "#1e1b4b" }}>{form.firstName}</strong>!
                </p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "2rem" }}>
                  A verification email has been sent to <strong style={{ color: "#6366f1" }}>{form.email}</strong>
                </p>
                <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px", borderRadius: 100, boxShadow: "0 8px 24px rgba(99,102,241,0.42)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.55)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.42)"; }}>
                  Start Chatting →
                </Link>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#9ca3af", marginTop: "1.5rem" }}>
                  Already have an account?{" "}
                  <Link href="/signin" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Sign in instead</Link>
                </p>
              </div>
            ) : (
              <>
                {/* ── Step indicator ── */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
                  {stepLabels.map((label, i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <StepDot n={i + 1} active={step === i + 1} done={step > i + 1 || (i === 2 && success)} />
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", fontWeight: 600, color: step === i + 1 ? "#6366f1" : step > i + 1 ? "#10b981" : "#9ca3af", whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: step > i + 1 ? "linear-gradient(90deg,#10b981,#6366f1)" : "rgba(99,102,241,0.1)", margin: "0 8px 16px", borderRadius: 100, transition: "background 0.5s ease" }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <div style={{ animation: "slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.3rem" }}>Create your account</h2>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#6b7280" }}>
                        Already have one?{" "}
                        <Link href="/signin" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>Sign in</Link>
                      </p>
                    </div>

                    {/* Google SSO */}
                    <button style={{ width: "100%", background: "#fff", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "12px 20px", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 600, color: "#374151", cursor: "none", transition: "all 0.25s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign up with Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.1)" }} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500 }}>or fill in your details</span>
                      <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.1)" }} />
                    </div>

                    {/* Name row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <InputField label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="John" icon="👤" error={errors.firstName} />
                      <InputField label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Doe" icon="👤" error={errors.lastName} />
                    </div>

                    <InputField label="Email address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" icon="✉️" error={errors.email} />
                    <InputField label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} placeholder="+92 300 0000000" icon="📱" hint="Used for appointment reminders only" />

                    <button onClick={handleNext} style={{ width: "100%", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "14px", cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(99,102,241,0.38)", transition: "all 0.25s ease", marginTop: "0.25rem" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.5)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.38)"; }}>
                      Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <div style={{ animation: "slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
                    <div style={{ marginBottom: "1.75rem" }}>
                      <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.3rem" }}>Secure your account</h2>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#6b7280" }}>Choose a strong password for <strong style={{ color: "#6366f1" }}>{form.email}</strong></p>
                    </div>

                    <InputField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={form.password} onChange={set("password")}
                      placeholder="Create a strong password"
                      icon="🔑" error={errors.password}
                      rightElement={eyeBtn(showPassword, () => setShowPassword(!showPassword))}
                    />
                    <PasswordStrength password={form.password} />

                    <div style={{ marginTop: "0.75rem" }}>
                      <InputField
                        label="Confirm Password"
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword} onChange={set("confirmPassword")}
                        placeholder="Repeat your password"
                        icon="🔒" error={errors.confirmPassword}
                        rightElement={eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))}
                      />
                    </div>

                    {/* Terms checkbox */}
                    <div style={{ marginBottom: "1.5rem", marginTop: "0.25rem" }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "none" }}>
                        <div onClick={() => setForm({ ...form, agree: !form.agree })} style={{ width: 20, height: 20, borderRadius: 6, marginTop: 1, background: form.agree ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff", border: `1.5px solid ${form.agree ? "#6366f1" : errors.agree ? "#ef4444" : "rgba(99,102,241,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", flexShrink: 0, boxShadow: form.agree ? "0 2px 8px rgba(99,102,241,0.3)" : "none" }}>
                          {form.agree && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.55 }}>
                          I agree to the{" "}
                          <Link href="#" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Terms of Service</Link>
                          {" "}and{" "}
                          <Link href="#" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>
                          . I understand this service provides informational guidance only.
                        </span>
                      </label>
                      {errors.agree && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.73rem", color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><span>⚠</span>{errors.agree}</p>}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { setStep(1); setErrors({}); }} style={{ flex: "0 0 auto", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: 14, background: "transparent", color: "#6366f1", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.9rem", padding: "13px 18px", cursor: "none", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                        ← Back
                      </button>
                      <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, border: "none", borderRadius: 14, background: loading ? "rgba(99,102,241,0.55)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "13px", cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.38)", transition: "all 0.25s ease" }}
                        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.5)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 24px rgba(99,102,241,0.38)"; }}>
                        {loading
                          ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating account...</>
                          : <>Create Account 🎉</>
                        }
                      </button>
                    </div>

                    {/* Security badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "1.25rem", padding: "10px", background: "rgba(99,102,241,0.04)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.08)" }}>
                      <span style={{ fontSize: 12 }}>🔒</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "#9ca3af" }}>256-bit SSL · Zero data retention · HIPAA compliant</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}