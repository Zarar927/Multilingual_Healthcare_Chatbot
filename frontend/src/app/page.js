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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
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
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }}
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        background: scrolled
          ? "rgba(255,255,255,0.85)"
          : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 32px rgba(99,102,241,0.08)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2rem",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left nav */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["About Us", "About Project"].map((label, i) => (
            <Link
              key={label}
              href={i === 0 ? "/about" : "/project"}
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
                letterSpacing: "0.01em",
                fontFamily: "'DM Sans', sans-serif",
                position: "relative",
                padding: "4px 0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#374151";
              }}
            >
              {label}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 0,
                  height: "1.5px",
                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  transition: "width 0.3s ease",
                }}
              />
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            🤖
          </div>
          <span
            style={{
              fontFamily: "'Clash Display', 'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            AI Healthcare
          </span>
        </Link>

        {/* Right nav */}
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <Link
            href="/chat"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#374151",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
          >
            Chatbot
          </Link>
          <Link
            href="/signin"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#374151",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              padding: "8px 20px",
              borderRadius: 100,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)";
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))"
          : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: hovered ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.1)",
        borderRadius: 20,
        padding: "2rem",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: visible
          ? hovered ? "translateY(-6px)" : "translateY(0)"
          : "translateY(28px)",
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        boxShadow: hovered
          ? "0 20px 40px rgba(99,102,241,0.15)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          marginBottom: "1.25rem",
          boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "'Clash Display','DM Sans',sans-serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#1e1b4b",
          marginBottom: "0.6rem",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "0.9rem",
          color: "#6b7280",
          lineHeight: 1.65,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ x, y, size, duration, delay, opacity }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        opacity,
        animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const particles = [
    { x: 8, y: 20, size: 8, duration: 4, delay: 0, opacity: 0.15 },
    { x: 92, y: 15, size: 12, duration: 5, delay: 1, opacity: 0.1 },
    { x: 15, y: 70, size: 6, duration: 3.5, delay: 0.5, opacity: 0.12 },
    { x: 85, y: 65, size: 10, duration: 4.5, delay: 1.5, opacity: 0.08 },
    { x: 50, y: 8, size: 5, duration: 3, delay: 2, opacity: 0.1 },
    { x: 3, y: 45, size: 7, duration: 6, delay: 0.8, opacity: 0.09 },
    { x: 97, y: 40, size: 9, duration: 4.2, delay: 1.2, opacity: 0.11 },
  ];

  const features = [
    {
      icon: "🧠",
      title: "RAG-Powered Intelligence",
      desc: "Retrieval-augmented generation ensures answers grounded in verified medical knowledge, not hallucinations.",
    },
    {
      icon: "🌐",
      title: "Multilingual Support",
      desc: "Communicate in your native language. Our NLP engine understands 30+ languages with clinical accuracy.",
    },
    {
      icon: "📋",
      title: "Prescription OCR",
      desc: "Upload a photo of your prescription and our OCR engine extracts and explains medication details instantly.",
    },
    {
      icon: "⚡",
      title: "Instant Responses",
      desc: "Powered by FastAPI on the backend, get sub-second responses to complex health queries around the clock.",
    },
    // {
    //   icon: "🔒",
    //   title: "HIPAA-Grade Privacy",
    //   desc: "Your health data stays yours. End-to-end encryption and zero data retention policies protect every query.",
    // },
    // {
    //   icon: "👨‍⚕️",
    //   title: "Doctor Referral",
    //   desc: "When AI isn't enough, we connect you to verified healthcare professionals in your area seamlessly.",
    // },
  ];

  const stats = [
    { value: 98, suffix: "%", label: "Accuracy Rate" },
    { value: 30, suffix: "+", label: "Languages" },
    { value: 50, suffix: "k+", label: "Queries Resolved" },
    { value: 24, suffix: "/7", label: "Availability" },
  ];

  return (
    <>
      <CustomCursor />

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none; }
        body { background: #f8f7ff; overflow-x: hidden; }

        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-18px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: translateY(0) rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 0 16px rgba(99,102,241,0); }
        }
        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes typing {
          0%,100% { opacity:1; }
          50%      { opacity:0; }
        }
        .btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff; text-decoration:none;
          font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.95rem;
          padding:14px 32px; border-radius:100px;
          box-shadow:0 8px 24px rgba(99,102,241,0.38);
          transition:transform 0.25s cubic-bezier(0.16,1,0.3,1),
                     box-shadow 0.25s cubic-bezier(0.16,1,0.3,1);
          border:none; cursor:pointer; letter-spacing:0.01em;
        }
        .btn-primary:hover {
          transform:translateY(-3px) scale(1.02);
          box-shadow:0 14px 32px rgba(99,102,241,0.5);
        }
        .btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(99,102,241,0.07); color:#6366f1;
          text-decoration:none;
          font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.95rem;
          padding:14px 32px; border-radius:100px;
          border:1.5px solid rgba(99,102,241,0.25);
          transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
          cursor:pointer; letter-spacing:0.01em;
        }
        .btn-secondary:hover {
          background:rgba(99,102,241,0.12);
          border-color:rgba(99,102,241,0.5);
          transform:translateY(-2px);
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          paddingTop: 68,
          background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 50%,#faf5ff 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "-8%",
            width: 480,
            height: 480,
            background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",
            animation: "blob 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-5%",
            width: 560,
            height: 560,
            background: "radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)",
            animation: "blob 10s ease-in-out 2s infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 700,
            height: 700,
            background: "radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "4rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left col */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(40px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#6366f1",
                  animation: "pulse-glow 2s infinite",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#6366f1",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                HEALTH · AI · INNOVATION
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.4rem,4.5vw,3.6rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#1e1b4b",
                marginBottom: "1.5rem",
              }}
            >
              Transforming{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% auto",
                  animation: "shimmer 3s linear infinite",
                }}
              >
                Healthcare
              </span>
              <br />
              with AI
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "#6b7280",
                marginBottom: "2.25rem",
                maxWidth: 480,
              }}
            >
              An intelligent chatbot powered by{" "}
              <strong style={{ color: "#4f46e5", fontWeight: 600 }}>RAG</strong>,{" "}
              <strong style={{ color: "#4f46e5", fontWeight: 600 }}>NLP</strong> and{" "}
              <strong style={{ color: "#4f46e5", fontWeight: 600 }}>OCR</strong> — 
              handling multilingual health queries, reading prescriptions, and 
              connecting patients with verified professionals. Available 24/7, 
              in any language.
            </p>

            {/* Typing indicator preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.8)",
                borderRadius: 12,
                padding: "10px 16px",
                marginBottom: "2rem",
                border: "1px solid rgba(99,102,241,0.12)",
                width: "fit-content",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                🤖
              </div>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.85rem",
                  color: "#374151",
                }}
              >
                "I have a headache and slight fever..."
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  background: "#6366f1",
                  borderRadius: 1,
                  animation: "typing 1s step-end infinite",
                }}
              />
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/chat" className="btn-primary">
                <span>Start Chat</span>
                <span>→</span>
              </Link>
              <Link href="/project" className="btn-secondary">
                <span>How it works</span>
              </Link>
            </div>
          </div>

          {/* Right col — visual */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateX(40px) scale(0.96)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Outer glow ring */}
            <div
              style={{
                position: "absolute",
                inset: -24,
                borderRadius: "50%",
                background:
                  "conic-gradient(from 0deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15),rgba(99,102,241,0.2))",
                animation: "spin-slow 12s linear infinite",
                filter: "blur(20px)",
              }}
            />

            {/* Main card */}
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                borderRadius: 28,
                padding: "2rem",
                boxShadow:
                  "0 32px 80px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.1)",
                width: "100%",
                maxWidth: 420,
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid rgba(99,102,241,0.1)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                  }}
                >
                  🤖
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1e1b4b",
                    }}
                  >
                    AI Health Assistant
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                      }}
                    >
                      Online · Always available
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              {[
                {
                  role: "bot",
                  msg: "Hello! I'm your AI health assistant. How can I help you today?",
                },
                {
                  role: "user",
                  msg: "I have chest pain and shortness of breath.",
                },
                {
                  role: "bot",
                  msg: "These symptoms need immediate attention. Please call emergency services or visit the nearest ER now. Do not drive yourself.",
                  urgent: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: item.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "0.85rem",
                    animation: `fadeSlideUp 0.5s ease ${0.4 + i * 0.15}s both`,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      background:
                        item.role === "user"
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : item.urgent
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(243,244,246,0.9)",
                      color:
                        item.role === "user" ? "#fff" : item.urgent ? "#dc2626" : "#374151",
                      borderRadius:
                        item.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      padding: "10px 14px",
                      fontSize: "0.82rem",
                      fontFamily: "'DM Sans',sans-serif",
                      lineHeight: 1.55,
                      border: item.urgent ? "1px solid rgba(239,68,68,0.2)" : "none",
                      boxShadow:
                        item.role === "user"
                          ? "0 4px 12px rgba(99,102,241,0.3)"
                          : "none",
                    }}
                  >
                    {item.urgent && (
                      <span style={{ marginRight: 4 }}>⚠️</span>
                    )}
                    {item.msg}
                  </div>
                </div>
              ))}

              {/* Input area */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: "1rem",
                  background: "rgba(243,244,246,0.8)",
                  borderRadius: 100,
                  padding: "8px 8px 8px 16px",
                  border: "1.5px solid rgba(99,102,241,0.15)",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.82rem",
                    color: "#9ca3af",
                  }}
                >
                  Ask me about symptoms...
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    🎙️
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      boxShadow: "0 3px 10px rgba(99,102,241,0.4)",
                    }}
                  >
                    ➤
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -16,
                background: "#fff",
                borderRadius: 14,
                padding: "8px 12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                animation: "float 3s ease-in-out infinite alternate",
                border: "1px solid rgba(99,102,241,0.1)",
              }}
            >
              <span style={{ fontSize: 18 }}>🌐</span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1e1b4b",
                }}
              >
                30+ Languages
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -12,
                left: -20,
                background: "#fff",
                borderRadius: 14,
                padding: "8px 12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                animation: "float 4s ease-in-out 1s infinite alternate",
                border: "1px solid rgba(99,102,241,0.1)",
              }}
            >
              <span style={{ fontSize: 18 }}>📋</span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1e1b4b",
                }}
              >
                OCR Prescriptions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
          padding: "4rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%,rgba(255,255,255,0.1) 0%,transparent 50%), radial-gradient(circle at 80% 50%,rgba(255,255,255,0.05) 0%,transparent 50%)",
          }}
        />
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "2rem",
            position: "relative",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem,4vw,3rem)",
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          background: "linear-gradient(180deg,#f8f7ff 0%,#eef2ff 100%)",
          padding: "7rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 100,
                padding: "5px 16px",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6366f1",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                CAPABILITIES
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                color: "#1e1b4b",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}
            >
              Everything you need,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                in one place
              </span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "1rem",
                color: "#6b7280",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Built with state-of-the-art AI technologies to deliver accurate,
              compassionate healthcare guidance whenever you need it.
            </p>
          </div>

          {/* Feature grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map((f, i) => (
              <FeatureCard
                key={i}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#fff", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                color: "#1e1b4b",
                letterSpacing: "-0.03em",
                marginBottom: "0.75rem",
              }}
            >
              How it{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                works
              </span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "1rem",
                color: "#6b7280",
              }}
            >
              Three simple steps to better health guidance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "2rem",
              position: "relative",
            }}
          >
            {/* connector line */}
            <div
              style={{
                position: "absolute",
                top: 40,
                left: "16.5%",
                right: "16.5%",
                height: 2,
                background:
                  "linear-gradient(90deg,transparent,rgba(99,102,241,0.3),rgba(99,102,241,0.3),transparent)",
                zIndex: 0,
              }}
            />

            {[
              {
                step: "01",
                icon: "✍️",
                title: "Describe Symptoms",
                desc: "Type, speak, or upload a prescription photo. Our OCR reads it instantly.",
              },
              {
                step: "02",
                icon: "🔍",
                title: "AI Analysis",
                desc: "RAG retrieves verified medical data. NLP understands your language and context.",
              },
              {
                step: "03",
                icon: "💊",
                title: "Get Guidance",
                desc: "Receive clear advice, medication info, or a referral to a real doctor near you.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
                  textAlign: "center",
                  padding: "2rem 1.5rem",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: 32,
                    boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                    position: "relative",
                  }}
                >
                  {item.icon}
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #6366f1",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      color: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: "#1e1b4b",
                    marginBottom: "0.6rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    lineHeight: 1.65,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "5rem 2rem", background: "#f8f7ff" }}>
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#a78bfa 100%)",
            borderRadius: 28,
            padding: "4rem 3rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(99,102,241,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <h2
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,3vw,2.4rem)",
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
              position: "relative",
            }}
          >
            Your health questions deserve real answers.
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "2rem",
              maxWidth: 480,
              margin: "0 auto 2rem",
              lineHeight: 1.7,
              position: "relative",
            }}
          >
            Start chatting with our AI health assistant now — no sign-up required
            for your first session.
          </p>
          <Link
            href="/chat"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#6366f1",
              textDecoration: "none",
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              padding: "14px 32px",
              borderRadius: 100,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
          >
            <span>Start for free</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#1e1b4b",
          padding: "3rem 2rem",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Healthcare
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.85rem",
            }}
          >
            {[
              ["About", "/about"],
              ["Project", "/project"],
              ["Chat", "/chat"],
              ["Sign In", "/signin"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                style={{
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a5b4fc")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                }
              >
                {label}
              </Link>
            ))}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            © 2026 AI Healthcare · Built with ❤️ &amp; AI
          </div>
        </div>
      </footer>
    </>
  );
}