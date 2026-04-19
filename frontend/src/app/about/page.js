"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Custom Cursor (Trail Line) ───────────────────────────────────────────────
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
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(99,102,241,0.25)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      const head = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(99,102,241,0.25)";
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

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }} />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      background: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid transparent",
      boxShadow: scrolled ? "0 4px 32px rgba(99,102,241,0.08)" : "none",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["About Us", "/about"], ["About Project", "/project"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: "0.875rem", fontWeight: label === "About Us" ? 700 : 500, color: label === "About Us" ? "#6366f1" : "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", borderBottom: label === "About Us" ? "2px solid #6366f1" : "none", paddingBottom: 2 }}>{label}</Link>
          ))}
        </div>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>🤖</div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Healthcare</span>
        </Link>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          {[["Home", "/"], ["Chatbot", "/chat"], ["Sign In", "/signin"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}>{label}</Link>
          ))}
          <Link href="/signup" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "8px 20px", borderRadius: 100, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Team member card ─────────────────────────────────────────────────────────
function TeamCard({ name, role, bio, avatar, photo, linkedin, email, skills, delay }) {
  const [ref, visible] = useReveal(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        border: hovered ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.1)",
        borderRadius: 24,
        padding: "2.25rem",
        transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)",
        transform: visible ? (hovered ? "translateY(-8px)" : "translateY(0)") : "translateY(36px)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? "0 24px 48px rgba(99,102,241,0.18)" : "0 2px 16px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hover glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 120, height: 120,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }} />

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {photo ? (
          <img src={photo} alt={name} style={{
            width: 64, height: 64, borderRadius: 18,
            objectFit: "cover",
            boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
            transition: "transform 0.3s ease",
            transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",
          }} />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0,
            boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
            transition: "transform 0.3s ease",
            transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",
          }}>{avatar}</div>
        )}
        <div>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#1e1b4b", letterSpacing: "-0.02em", marginBottom: 3 }}>{name}</h3>
          <span style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600,
            color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "3px 10px",
            borderRadius: 100, letterSpacing: "0.04em",
          }}>{role}</span>
        </div>
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.7, marginBottom: "1rem" }}>{bio}</p>

      {(linkedin || email) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.25rem" }}>
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 700,
              color: "#2563eb", textDecoration: "none", padding: "7px 12px",
              border: "1px solid rgba(37,99,235,0.16)", borderRadius: 999,
            }}>LinkedIn</a>
          )}
          {email && (
            <a href={`mailto:${email}`} style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 700,
              color: "#111827", textDecoration: "none", padding: "7px 12px",
              background: "rgba(243,244,246,0.9)", borderRadius: 999,
            }}>{email}</a>
          )}
        </div>
      )}

      {/* Skill tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {skills.map((s) => (
          <span key={s} style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 600,
            color: "#4f46e5", background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.18)",
            padding: "4px 12px", borderRadius: 100,
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Skill bar ────────────────────────────────────────────────────────────────
function SkillBar({ label, pct, icon, delay }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div ref={ref} style={{ marginBottom: "1.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-20px)", transition: `all 0.6s ease ${delay}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#1e1b4b", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#6366f1" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100,
          background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
          width: visible ? `${pct}%` : "0%",
          transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay + 200}ms`,
          boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
        }} />
      </div>
    </div>
  );
}

// ─── Value card ───────────────────────────────────────────────────────────────
function ValueCard({ icon, title, desc, delay }) {
  const [ref, visible] = useReveal(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.8)",
        border: "1px solid rgba(99,102,241,0.12)",
        borderRadius: 20, padding: "1.75rem",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: visible ? (hovered ? "translateY(-5px) scale(1.02)" : "translateY(0)") : "translateY(28px)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? "0 20px 40px rgba(99,102,241,0.3)" : "0 2px 12px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: "1rem" }}>{icon}</div>
      <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: hovered ? "#fff" : "#1e1b4b", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>{title}</h4>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: hovered ? "rgba(255,255,255,0.85)" : "#6b7280", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

// ─── Main About Us Page ───────────────────────────────────────────────────────
export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  const team = [
    {
      name: "Zarar Ahmad",
      role: "AI / ML Engineer",
      avatar: "🧠",
      photo: "/assets/team/zarar.png",
      linkedin: "https://www.linkedin.com/in/zarar-ahmad-8129b0270/",
      email: "zararahmad92727@gmail.com",
      bio: "Built the full project and led end-to-end development, including the RAG pipeline, model fine-tuning, and system architecture.",
      skills: ["Next.js", "RAG", "OpenCV", "Python", "Computer Vision", "NLP"],
    },
    {
      name: "Umer Aziz",
      role: "Full Stack Developer",
      avatar: "💻",
      photo: "/assets/team/umer.jpeg",
      linkedin: "https://www.linkedin.com/in/umeraziz",
      email: "umer.aziz@example.com",
      bio: "Wrote the project literature review and helped integrate frontend/backend components to align implementation with research findings.",
      skills: ["ServiceNow", "Leadership", "Next.js", "FastAPI", "System Design"],
    },
    {
      name: "Fahad",
      role: "OCR & Vision Engineer",
      avatar: "👁️",
      photo: "/assets/team/fahad.png",
      linkedin: "https://www.linkedin.com/in/fahad",
      email: "fahad@example.com",
      bio: "Wrote the project introduction and thesis structure while building the OCR pipeline to connect the research narrative with the implementation.",
      skills: ["Frontend", "Next.js", "Model Training", "Machine Learning", "Python"],
    },
    // {
    //   name: "Fatima Noor",
    //   role: "UX / Product Designer",
    //   avatar: "🎨",
    //   bio: "Designs every pixel with empathy for patients. Ensures the interface is intuitive for users of all technical backgrounds.",
    //   skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    // },
  ];

  const skills = [
    { label: "Natural Language Processing", pct: 95, icon: "🗣️" },
    { label: "Retrieval Augmented Generation", pct: 90, icon: "🔍" },
    { label: "OCR & Computer Vision", pct: 85, icon: "📋" },
    { label: "Full Stack Development", pct: 92, icon: "⚙️" },
    { label: "Multilingual AI", pct: 88, icon: "🌐" },
    { label: "Healthcare Domain Knowledge", pct: 80, icon: "🏥" },
  ];

  const values = [
    { icon: "❤️", title: "Patient First", desc: "Every decision is made with the patient's wellbeing as the north star." },
    { icon: "🔬", title: "Research Driven", desc: "Grounded in peer-reviewed medical literature, not guesswork." },
    { icon: "🌍", title: "Inclusive Access", desc: "30+ languages so no patient is left behind due to language barriers." },
    { icon: "🔒", title: "Privacy Sacred", desc: "Zero data retention. Your health data belongs to you alone." },
    { icon: "⚡", title: "Always Available", desc: "24/7 uptime because health concerns don't follow office hours." },
    { icon: "🤝", title: "Human + AI", desc: "AI handles the first layer; real doctors are one tap away." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none; }
        body { background: #f8f7ff; overflow-x: hidden; }

        @keyframes float {
          from { transform: translateY(0); }
          to   { transform: translateY(-16px); }
        }
        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
      `}</style>

      <CustomCursor />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "72vh",
        paddingTop: 68,
        background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 55%,#faf5ff 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
      }}>
        {/* Blobs */}
        <div style={{ position: "absolute", top: "5%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-8%", width: 440, height: 440, background: "radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", animation: "blob 11s ease-in-out 2s infinite", pointerEvents: "none" }} />

        {/* Rotating ring */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 600, height: 600,
          marginTop: -300, marginLeft: -300,
          border: "1px dashed rgba(99,102,241,0.15)",
          borderRadius: "50%",
          animation: "spin 30s linear infinite",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem", width: "100%", position: "relative" }}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 100, padding: "6px 18px", marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.6s ease",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: "pulse 2s infinite", display: "inline-block" }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Meet The Team</span>
            </div>

            <h1 style={{
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800,
              fontSize: "clamp(2.6rem,5vw,4rem)",
              lineHeight: 1.05, letterSpacing: "-0.035em",
              color: "#1e1b4b", marginBottom: "1.5rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(24px)",
              transition: "all 0.7s ease 0.1s",
            }}>
              Built by people who{" "}
              <span style={{
                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto", animation: "shimmer 3s linear infinite",
              }}>care about health</span>
            </h1>

            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "1.1rem", lineHeight: 1.75,
              color: "#6b7280", maxWidth: 560, margin: "0 auto 2.5rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(20px)",
              transition: "all 0.7s ease 0.2s",
            }}>
              We are a multidisciplinary team of AI engineers, healthcare technologists, and designers united by one mission — making quality health guidance accessible to everyone, everywhere.
            </p>

            {/* Stats row */}
            <div style={{
              display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.7s ease 0.3s",
            }}>
              {[["3", "Team Members"], ["3+", "Years Experience"], ["50k+", "Users Helped"]].map(([val, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "2rem", color: "#6366f1", letterSpacing: "-0.03em", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "#9ca3af", fontWeight: 500, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM CARDS ── */}
      <section style={{ background: "linear-gradient(180deg,#eef2ff 0%,#f8f7ff 100%)", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#1e1b4b", letterSpacing: "-0.03em" }}>
              The{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>people</span>
              {" "}behind the AI
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.75rem" }}>
            {team.map((member, i) => (
              <TeamCard key={member.name} {...member} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section style={{ background: "#fff", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          {/* Left text */}
          <div>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Our Expertise</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "1.25rem", lineHeight: 1.15 }}>
              Cutting-edge skills,{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>real-world impact</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", lineHeight: 1.75, marginBottom: "2rem" }}>
              Our team combines deep expertise in AI research, software engineering, and healthcare to build something that genuinely helps people. Every percentage point here represents months of research, iteration, and refinement.
            </p>
            <Link href="/project" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", textDecoration: "none",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.9rem",
              padding: "12px 28px", borderRadius: 100,
              boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
            }}>See the project →</Link>
          </div>

          {/* Right bars */}
          <div>
            {skills.map((s, i) => (
              <SkillBar key={s.label} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION BANNER ── */}
      <section style={{ padding: "6rem 2rem", background: "linear-gradient(180deg,#f8f7ff 0%,#eef2ff 100%)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)",
            borderRadius: 28, padding: "5rem 4rem",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center",
            position: "relative", overflow: "hidden",
            boxShadow: "0 40px 80px rgba(30,27,75,0.35)",
          }}>
            {/* BG decoration */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(139,92,246,0.1)", pointerEvents: "none" }} />

            <div style={{ position: "relative" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "1.25rem" }}>Our Mission</span>
              <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.8rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.5rem" }}>
                Healthcare guidance shouldn't be a privilege.
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
                We built this because millions of people search symptoms online and get unreliable results. Our AI delivers medically grounded answers — free, instant, and in your language.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
              {[
                ["🎯", "Clear, actionable health guidance"],
                ["🌐", "Available in 30+ languages"],
                ["📋", "Reads prescriptions via OCR"],
                // ["👨‍⚕️", "Connects to real doctors when needed"],
                ["🔒", "Zero data retention policy"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: "#fff", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
              What we{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>stand for</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>
              These aren't just words on a wall — they're the principles we debate, defend, and design around every single day.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.25rem" }}>
            {values.map((v, i) => (
              <ValueCard key={v.title} {...v} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 2rem", background: "#f8f7ff" }}>
        <div style={{
          maxWidth: 760, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)",
          borderRadius: 28, padding: "4rem 3rem",
          boxShadow: "0 32px 80px rgba(99,102,241,0.35)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: "1rem", position: "relative" }}>
            Ready to try what we built?
          </h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: "2rem", lineHeight: 1.7, position: "relative" }}>
            Jump into the chatbot and experience AI-powered healthcare guidance for yourself.
          </p>
          <Link href="/chat" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#6366f1", textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem",
            padding: "14px 32px", borderRadius: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            position: "relative",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
          >
            <span>Start Chatting</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1e1b4b", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Healthcare</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem" }}>
            {[["About", "/about"], ["Project", "/project"], ["Chat", "/chat"], ["Sign In", "/signin"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a5b4fc"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>{label}</Link>
            ))}
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>© 2026 AI Healthcare · Built with ❤️ & AI</div>
        </div>
      </footer>
    </>
  );
}