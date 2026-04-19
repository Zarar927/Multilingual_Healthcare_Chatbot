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
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", background: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid transparent", boxShadow: scrolled ? "0 4px 32px rgba(99,102,241,0.08)" : "none" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["About Us", "/about"], ["About Project", "/project"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: "0.875rem", fontWeight: label === "About Project" ? 700 : 500, color: label === "About Project" ? "#6366f1" : "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", borderBottom: label === "About Project" ? "2px solid #6366f1" : "none", paddingBottom: 2 }}>{label}</Link>
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

// ─── Tech card ────────────────────────────────────────────────────────────────
function TechCard({ icon, name, category, desc, color, delay }) {
  const [ref, visible] = useReveal(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fff" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: hovered ? `1px solid ${color}55` : "1px solid rgba(99,102,241,0.1)",
        borderRadius: 20, padding: "1.75rem",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: visible ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(32px)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? `0 20px 40px ${color}22` : "0 2px 12px rgba(0,0,0,0.04)",
        position: "relative", overflow: "hidden",
      }}>
      {/* color strip top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: "20px 20px 0 0", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ fontSize: 36, marginBottom: "1rem", transition: "transform 0.3s ease", transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)" }}>{icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
        <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#1e1b4b", letterSpacing: "-0.01em" }}>{name}</h3>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", fontWeight: 600, color, background: `${color}18`, padding: "2px 10px", borderRadius: 100, border: `1px solid ${color}33` }}>{category}</span>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.87rem", color: "#6b7280", lineHeight: 1.68 }}>{desc}</p>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ icon, title, desc, tags, reverse, delay }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div ref={ref} style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center",
      marginBottom: "5rem",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : `translateX(${reverse ? 40 : -40}px)`,
      transition: `all 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {/* Visual side */}
      {!reverse && (
        <div style={{
          background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.15)", borderRadius: 24,
          padding: "3rem", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", minHeight: 260,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
          <div style={{ fontSize: 72, marginBottom: "1rem", filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.3))" }}>{icon}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {tags.map((t) => (
              <span key={t} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "4px 12px", borderRadius: 100 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {/* Text side */}
      <div>
        <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,2.5vw,2rem)", color: "#1e1b4b", letterSpacing: "-0.025em", marginBottom: "1rem", lineHeight: 1.2 }}>{title}</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", lineHeight: 1.78, marginBottom: "1.5rem" }}>{desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map((t) => (
            <span key={t} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#4f46e5", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)", padding: "5px 14px", borderRadius: 100 }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Visual side (reverse) */}
      {reverse && (
        <div style={{
          background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.15)", borderRadius: 24,
          padding: "3rem", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", minHeight: 260,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(139,92,246,0.08)" }} />
          <div style={{ fontSize: 72, marginBottom: "1rem", filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.3))" }}>{icon}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {tags.map((t) => (
              <span key={t} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "4px 12px", borderRadius: 100 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Timeline step ────────────────────────────────────────────────────────────
function TimelineStep({ step, title, desc, icon, isLast, delay }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div ref={ref} style={{
      display: "flex", gap: "1.75rem", alignItems: "flex-start",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(28px)",
      transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {/* Left: number + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, boxShadow: "0 6px 20px rgba(99,102,241,0.38)",
          fontFamily: "'DM Sans',sans-serif", fontWeight: 800, color: "#fff",
          flexShrink: 0,
        }}>{icon}</div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 48, background: "linear-gradient(180deg,rgba(99,102,241,0.4),rgba(99,102,241,0.05))", margin: "8px 0" }} />}
      </div>
      {/* Right: content */}
      <div style={{ paddingBottom: isLast ? 0 : "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.6rem" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(99,102,241,0.08)", padding: "3px 10px", borderRadius: 100 }}>Step {step}</span>
        </div>
        <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#1e1b4b", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{title}</h4>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  const techs = [
    { icon: "🦜", name: "LangChain", category: "AI Framework", desc: "Orchestrates the entire RAG pipeline — from document ingestion to context-aware response generation.", color: "#10b981" },
    { icon: "🧠", name: "OpenAI / LLM", category: "Language Model", desc: "Powers natural language understanding and response generation with state-of-the-art transformer models.", color: "#6366f1" },
    { icon: "🗄️", name: "ChromaDB", category: "Vector Store", desc: "Stores and retrieves medical knowledge embeddings with millisecond semantic search at scale.", color: "#f59e0b" },
    { icon: "⚡", name: "FastAPI", category: "Backend", desc: "Async Python backend serving all AI endpoints with sub-100ms response times and auto-generated docs.", color: "#ef4444" },
    { icon: "🔮", name: "Next.js 14", category: "Frontend", desc: "App Router-based React framework delivering server components, fast routing, and optimal performance.", color: "#000000" },
    { icon: "👁️", name: "Tesseract OCR", category: "Vision", desc: "Extracts structured text from prescription images with 95%+ accuracy across 50+ fonts.", color: "#8b5cf6" },
    { icon: "🌐", name: "Helsinki NLP", category: "Translation", desc: "Open-source multilingual translation models enabling support for 30+ languages seamlessly.", color: "#06b6d4" },
    { icon: "🐘", name: "PostgreSQL", category: "Database", desc: "Stores user sessions, chat history, and anonymized interaction logs with full ACID compliance.", color: "#3b82f6" },
  ];

  const features = [
    {
      icon: "🔍",
      title: "Retrieval Augmented Generation (RAG)",
      desc: "Instead of relying purely on model weights, our system retrieves relevant chunks from a curated medical knowledge base before generating any response. This grounds every answer in verified information — not hallucinations. Documents are chunked, embedded, and stored in ChromaDB for semantic retrieval.",
      tags: ["LangChain", "ChromaDB", "Embeddings", "FAISS", "HuggingFace"],
      reverse: false,
    },
    {
      icon: "📋",
      title: "Prescription OCR Pipeline",
      desc: "Users can upload a photo of any prescription — handwritten or printed — and our vision pipeline preprocesses the image, runs Tesseract OCR, extracts medication names, dosages, and instructions, then passes them through the LLM for a human-readable explanation.",
      tags: ["Tesseract", "OpenCV", "Image Pre-processing", "LLM Parsing"],
      reverse: true,
    },
    {
      icon: "🌐",
      title: "Multilingual NLP Engine",
      desc: "Patients communicate in their native language. Our pipeline auto-detects the input language, translates to English for medical processing using Helsinki-NLP models, generates the response, then translates back — all within a single round-trip with no degradation in medical accuracy.",
      tags: ["Helsinki-NLP", "Language Detection", "Translation", "30+ Languages"],
      reverse: false,
    },
    {
      icon: "👨‍⚕️",
      title: "Smart Doctor Referral System",
      desc: "When the AI detects symptoms that require professional attention — based on urgency classifiers trained on triage data — it surfaces verified doctor profiles and enables one-tap appointment booking. AI handles triage; humans handle treatment.",
      tags: ["Urgency Classification", "Doctor API", "Geolocation", "Booking"],
      reverse: true,
    },
  ];

  const timeline = [
    { icon: "✍️", title: "User Inputs Query", desc: "The user types a health question, speaks via voice input, or uploads a prescription image through the chat interface." },
    { icon: "🔎", title: "Language Detection & Translation", desc: "The NLP module detects the input language. If non-English, Helsinki-NLP translates the query to English for downstream processing." },
    { icon: "🧩", title: "RAG Retrieval", desc: "The query is embedded and matched against ChromaDB's medical knowledge base. Top-k semantically relevant chunks are retrieved." },
    { icon: "🤖", title: "LLM Response Generation", desc: "The language model receives the query + retrieved context and generates a grounded, medically informed response." },
    { icon: "🌍", title: "Translation & Delivery", desc: "The response is translated back to the user's original language and streamed to the chat UI in real time." },
    { icon: "📊", title: "Urgency Classification", desc: "In parallel, an urgency classifier scores the query. If high-risk symptoms are detected, a doctor referral card is surfaced." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none; }
        body { background: #f8f7ff; overflow-x: hidden; }

        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); }
          50%      { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <CustomCursor />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "80vh", paddingTop: 68,
        background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 55%,#faf5ff 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "8%", left: "-8%", width: 480, height: 480, background: "radial-gradient(circle,rgba(99,102,241,0.11) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0%", right: "-6%", width: 520, height: 520, background: "radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", animation: "blob 12s ease-in-out 2s infinite", pointerEvents: "none" }} />

        {/* Rotating rings */}
        {[600, 420].map((size, i) => (
          <div key={size} style={{
            position: "absolute", top: "50%", left: "50%",
            width: size, height: size,
            marginTop: -size / 2, marginLeft: -size / 2,
            border: `1px ${i === 0 ? "dashed" : "solid"} rgba(99,102,241,${i === 0 ? 0.12 : 0.06})`,
            borderRadius: "50%",
            animation: `spin ${i === 0 ? 28 : 20}s linear ${i === 0 ? "" : "reverse"} infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Floating tech badges */}
        {[
          { text: "RAG Pipeline", top: "22%", left: "6%", delay: 0 },
          { text: "FastAPI", top: "18%", right: "7%", delay: 1 },
          { text: "LangChain", bottom: "28%", left: "4%", delay: 0.6 },
          { text: "OCR Vision", bottom: "22%", right: "5%", delay: 1.4 },
        ].map(({ text, delay, ...pos }) => (
          <div key={text} style={{
            position: "absolute", ...pos,
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(99,102,241,0.18)", borderRadius: 100,
            padding: "7px 16px",
            fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", fontWeight: 500, color: "#6366f1",
            boxShadow: "0 4px 16px rgba(99,102,241,0.12)",
            animation: `float 3.5s ease-in-out ${delay}s infinite alternate`,
            pointerEvents: "none",
          }}>{text}</div>
        ))}

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem", width: "100%", position: "relative" }}>
          <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 100, padding: "6px 18px", marginBottom: "1.75rem",
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.6s ease",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: "pulse 2s infinite", display: "inline-block" }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Project Overview</span>
            </div>

            <h1 style={{
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800,
              fontSize: "clamp(2.6rem,5.5vw,4.2rem)",
              lineHeight: 1.05, letterSpacing: "-0.035em",
              color: "#1e1b4b", marginBottom: "1.5rem",
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(24px)",
              transition: "all 0.7s ease 0.1s",
            }}>
              The AI that understands{" "}
              <span style={{
                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto", animation: "shimmer 3s linear infinite",
              }}>your health</span>
            </h1>

            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "1.1rem", lineHeight: 1.78,
              color: "#6b7280", maxWidth: 600, margin: "0 auto 2.5rem",
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(20px)",
              transition: "all 0.7s ease 0.2s",
            }}>
              A full-stack AI healthcare chatbot combining RAG, NLP, OCR and multilingual support — built to deliver medically grounded answers to anyone, anywhere, in any language.
            </p>

            {/* Tech pill stack */}
            <div style={{
              display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10,
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.7s ease 0.3s",
            }}>
              {["RAG", "LangChain", "FastAPI", "Next.js", "OCR", "30+ Languages", "ChromaDB", "PostgreSQL"].map((t) => (
                <span key={t} style={{
                  fontFamily: "'DM Mono',monospace", fontSize: "0.75rem", fontWeight: 500,
                  color: "#4f46e5", background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)", padding: "6px 14px", borderRadius: 100,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES ── */}
      <section style={{ background: "#fff", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Core Features</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#1e1b4b", letterSpacing: "-0.03em" }}>
              What the chatbot{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually does</span>
            </h2>
          </div>
          {features.map((f, i) => (
            <FeatureRow key={f.title} {...f} delay={0} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (TIMELINE) ── */}
      <section style={{ background: "linear-gradient(180deg,#f8f7ff 0%,#eef2ff 100%)", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Architecture</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "1.25rem", lineHeight: 1.15 }}>
              How a query travels through the{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>system</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", lineHeight: 1.78, marginBottom: "2rem" }}>
              Every user query goes through a multi-stage pipeline designed for accuracy, safety, and speed. From input to response in under 2 seconds.
            </p>
            {/* Architecture mini diagram */}
            <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 16, padding: "1.5rem", fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: "#4f46e5", lineHeight: 2 }}>
              <div>User Input</div>
              <div style={{ paddingLeft: "1rem", color: "#8b5cf6" }}>→ Language Detection</div>
              <div style={{ paddingLeft: "2rem", color: "#6366f1" }}>→ Translation (if needed)</div>
              <div style={{ paddingLeft: "3rem", color: "#4f46e5" }}>→ Embedding + RAG Retrieval</div>
              <div style={{ paddingLeft: "4rem", color: "#4338ca" }}>→ LLM Generation</div>
              <div style={{ paddingLeft: "3rem", color: "#4f46e5" }}>→ Urgency Classifier</div>
              <div style={{ paddingLeft: "2rem", color: "#6366f1" }}>→ Translate Back</div>
              <div style={{ paddingLeft: "1rem", color: "#8b5cf6" }}>→ Stream to UI</div>
            </div>
          </div>

          {/* Right timeline */}
          <div>
            {timeline.map((step, i) => (
              <TimelineStep key={step.title} step={i + 1} {...step} isLast={i === timeline.length - 1} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ background: "#fff", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tech Stack</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
              Built with the{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>right tools</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>
              Every technology in this stack was chosen deliberately — for performance, reliability, and best-in-class AI capabilities.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem" }}>
            {techs.map((t, i) => (
              <TechCard key={t.name} {...t} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 50%,rgba(255,255,255,0.1) 0%,transparent 50%), radial-gradient(circle at 85% 50%,rgba(255,255,255,0.05) 0%,transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", position: "relative" }}>
          {[
            { val: "< 2s", label: "Avg. Response Time" },
            { val: "95%+", label: "OCR Accuracy" },
            { val: "30+", label: "Languages Supported" },
            { val: "99.9%", label: "Uptime SLA" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.4rem" }}>{val}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHALLENGES ── */}
      <section style={{ background: "linear-gradient(180deg,#f8f7ff 0%,#fff 100%)", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
              Problems we{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>solved</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "#6b7280", maxWidth: 500, margin: "0 auto" }}>
              Building an AI healthcare chatbot meant confronting hard problems that required real engineering solutions.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
            {[
              { problem: "Hallucination", solution: "RAG grounding", icon: "🚫", desc: "LLMs hallucinate medical facts. We solve this by always grounding answers in retrieved, verified medical documents — never relying on model memory alone.", color: "#ef4444" },
              { problem: "Language Barriers", solution: "Multilingual NLP", icon: "🌐", desc: "Patients don't all speak English. Our pipeline detects language, translates for processing, then delivers the response back in the original language.", color: "#06b6d4" },
              { problem: "Unreadable Prescriptions", solution: "OCR + Vision", icon: "📋", desc: "Handwritten prescriptions are notoriously difficult to read. Our image preprocessing + Tesseract pipeline achieves 95%+ extraction accuracy.", color: "#8b5cf6" },
              { problem: "Delayed Triage", solution: "Urgency Classifier", icon: "⚠️", desc: "Some symptoms need immediate attention. Our urgency classifier runs in parallel and surfaces emergency warnings before the main response is even streamed.", color: "#f59e0b" },
              { problem: "Privacy Risk", solution: "Zero Retention", icon: "🔒", desc: "Medical queries are deeply personal. We architect for zero data retention — no conversation is stored after the session ends, period.", color: "#10b981" },
              { problem: "Slow Responses", solution: "Async FastAPI", icon: "⚡", desc: "Healthcare users can't wait 10 seconds. Our async FastAPI backend with streaming responses delivers the first token in under 500ms.", color: "#6366f1" },
            ].map(({ problem, solution, icon, desc, color }, i) => {
              const [ref, visible] = useReveal(0.1);
              const [hovered, setHovered] = useState(false);
              return (
                <div key={problem} ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                  style={{
                    background: hovered ? "#fff" : "rgba(255,255,255,0.7)",
                    border: hovered ? `1px solid ${color}44` : "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 20, padding: "1.75rem",
                    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                    transform: visible ? (hovered ? "translateY(-5px)" : "none") : "translateY(28px)",
                    opacity: visible ? 1 : 0,
                    transitionDelay: `${i * 80}ms`,
                    boxShadow: hovered ? `0 16px 36px ${color}18` : "0 2px 10px rgba(0,0,0,0.04)",
                    position: "relative", overflow: "hidden",
                  }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "20px 20px 0 0", opacity: hovered ? 1 : 0.4, transition: "opacity 0.3s" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ fontSize: 32 }}>{icon}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Problem</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#1e1b4b" }}>{problem}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>→ {solution}</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.87rem", color: "#6b7280", lineHeight: 1.68 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 2rem", background: "#f8f7ff" }}>
        <div style={{
          maxWidth: 860, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)",
          borderRadius: 28, padding: "4.5rem 3rem",
          boxShadow: "0 40px 80px rgba(30,27,75,0.4)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(99,102,241,0.2)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(139,92,246,0.15)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 48, marginBottom: "1.25rem" }}>🚀</div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              See it in action
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.75)", marginBottom: "2.25rem", maxWidth: 480, margin: "0 auto 2.25rem", lineHeight: 1.75 }}>
              Stop reading about it. Experience the chatbot yourself — ask about symptoms, upload a prescription, or chat in your language.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/chat" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem",
                padding: "14px 32px", borderRadius: 100,
                boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                Launch Chatbot →
              </Link>
              <Link href="/about" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.1)", color: "#fff",
                textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.95rem",
                padding: "14px 32px", borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                Meet the Team
              </Link>
            </div>
          </div>
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
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>© 2025 AI Healthcare · Built with ❤️ & AI</div>
        </div>
      </footer>
    </>
  );
}