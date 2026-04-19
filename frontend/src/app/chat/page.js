"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";

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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }} />;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, transition: "all 0.4s ease", background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.1)", boxShadow: scrolled ? "0 4px 24px rgba(99,102,241,0.08)" : "none" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          {[["About Us", "/about"], ["About Project", "/project"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: "0.85rem", fontWeight: 500, color: "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}>{label}</Link>
          ))}
        </div>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 3px 10px rgba(99,102,241,0.35)" }}>🤖</div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Healthcare</span>
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {[["Sign In", "/signin"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: "0.85rem", fontWeight: 500, color: "#374151", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#374151"}>{label}</Link>
          ))}
          <Link href="/signup" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "7px 18px", borderRadius: 100, boxShadow: "0 3px 12px rgba(99,102,241,0.35)" }}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

// ─── PDF Generator ───────────────────────────────────────────────────────────
function generatePDF(messages) {
  const content = messages
    .filter((m) => m.role !== "system")
    .map((m) => `[${m.role === "user" ? "You" : "AI Assistant"}]\n${m.text}\n`)
    .join("\n---\n\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AI Healthcare Chat Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; color: #1e1b4b; line-height: 1.7; padding: 0 20px; }
    .header { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; }
    .header h1 { margin: 0 0 8px; font-size: 24px; }
    .header p { margin: 0; opacity: 0.85; font-size: 14px; }
    .message { margin-bottom: 20px; padding: 16px 20px; border-radius: 12px; }
    .user { background: #eef2ff; border-left: 4px solid #6366f1; }
    .bot { background: #f8f7ff; border-left: 4px solid #8b5cf6; }
    .role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; color: #6366f1; }
    .text { font-size: 15px; color: #374151; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
    .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Healthcare Chat Report</h1>
    <p>Generated on ${new Date().toLocaleString()} · AI Healthcare Assistant</p>
  </div>
  ${messages.filter((m) => m.role !== "system").map((m) => `
    <div class="message ${m.role === "user" ? "user" : "bot"}">
      <div class="role">${m.role === "user" ? "You" : "AI Assistant"}</div>
      <div class="text">${m.text.replace(/\n/g, "<br/>")}</div>
    </div>
  `).join("")}
  <div class="footer">
    <p>⚠️ This AI-generated report is for informational purposes only. Always consult a qualified healthcare professional for medical advice.</p>
    <p>AI Healthcare · Powered by RAG + NLP</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `healthcare-chat-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onDownloadPDF, allMessages }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 10,
      marginBottom: "1.25rem",
      animation: "msgSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: isUser ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: `0 3px 10px rgba(99,102,241,0.3)`,
      }}>
        {isUser ? "👤" : "🤖"}
      </div>

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* Image preview if any */}
        {msg.image && (
          <div style={{ marginBottom: 8, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(99,102,241,0.2)" }}>
            <img src={msg.image} alt="uploaded" style={{ maxWidth: 220, maxHeight: 160, display: "block", objectFit: "cover" }} />
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: isUser
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "rgba(255,255,255,0.95)",
          color: isUser ? "#fff" : "#1e1b4b",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          fontSize: "0.92rem",
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1.65,
          boxShadow: isUser
            ? "0 6px 20px rgba(99,102,241,0.3)"
            : "0 2px 16px rgba(0,0,0,0.08)",
          border: isUser ? "none" : "1px solid rgba(99,102,241,0.1)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.urgent && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
              <span>⚠️</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#dc2626" }}>URGENT — Please seek immediate medical attention</span>
            </div>
          )}
          {msg.text}
        </div>

        {/* Action bar for bot messages */}
        {!isUser && msg.text && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "#9ca3af" }}>
              {msg.time}
            </span>
            <button onClick={copyText} title="Copy" style={{
              background: "none", border: "none", padding: "3px 8px", borderRadius: 6,
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 600,
              color: copied ? "#10b981" : "#6366f1",
              background: "rgba(99,102,241,0.07)", cursor: "none",
              transition: "all 0.2s ease",
            }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={() => onDownloadPDF(allMessages)} title="Download PDF" style={{
              background: "rgba(99,102,241,0.07)", border: "none", padding: "3px 10px", borderRadius: 6,
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", fontWeight: 600,
              color: "#6366f1", cursor: "none", display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.2s ease",
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.07)"}
            >
              📄 Download PDF
            </button>
          </div>
        )}

        {/* Timestamp for user */}
        {isUser && (
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }}>{msg.time}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Chatbot Page ────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: "bot", text: "Hello! I'm your AI Health Assistant 👋\n\nI can help you with:\n• Symptom analysis & guidance\n• Prescription reading (upload an image)\n• Medication information\n• Doctor referrals\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);

  // Voice recognition
  const toggleRecording = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // Image upload
  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  // Send message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !uploadedImage) return;
    if (loading) return;

    const userMsg = {
      id: Date.now(), role: "user",
      text: text || (uploadedImage ? "📋 I've uploaded a prescription image for analysis." : ""),
      image: imagePreview || null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const imageFile = uploadedImage;
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);

    // Simulate API call — replace with your actual FastAPI endpoint
    try {
      let botReply = "";
      let isUrgent = false;

      if (imageFile && !text) {
        // Handle image upload
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await axios.post('http://localhost:8000/upload_prescription', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        botReply = uploadResponse.data.message;
      } else {
        // Handle text query
        const response = await axios.post('http://localhost:8000/ask', { query: text });
        botReply = response.data.response;
        // Check for urgent keywords in the response or query
        const urgentKeywords = ["chest pain", "can't breathe", "heart attack", "stroke", "unconscious", "severe bleeding"];
        isUrgent = urgentKeywords.some((kw) => text.toLowerCase().includes(kw));
      }

      const botMsg = {
        id: Date.now() + 1, role: "bot", text: botReply,
        urgent: isUrgent,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "bot",
        text: "Sorry, I'm having trouble connecting to the server. Please check if the backend is running and try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: "bot",
      text: "Chat cleared. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const quickPrompts = [
    "I have a headache and fever",
    "Explain my blood pressure reading",
    "What are symptoms of diabetes?",
    "I feel chest tightness",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none; }
        body { background: #f0f0ff; overflow: hidden; height: 100vh; }

        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30%          { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes msgSlideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.96); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        textarea { resize: none; outline: none; }
        textarea::placeholder { color: #9ca3af; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>

      <CustomCursor />
      <Navbar />

      {/* ── Full-height layout ── */}
      <div style={{
        display: "flex",
        height: "100vh",
        paddingTop: 60,
        background: "linear-gradient(160deg,#f8f7ff 0%,#eef2ff 60%,#faf5ff 100%)",
      }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: 260, flexShrink: 0,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(99,102,241,0.1)",
          display: "flex", flexDirection: "column",
          padding: "1.25rem",
          gap: "1rem",
          overflowY: "auto",
        }}>
          {/* New chat button */}
          <button onClick={clearChat} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", borderRadius: 12, padding: "11px 16px",
            color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
            fontSize: "0.88rem", cursor: "none", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}
          >
            <span style={{ fontSize: 18 }}>✏️</span> New Chat
          </button>

          {/* Home button */}
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: "0.75rem",
            width: "100%",
            padding: "11px 16px",
            borderRadius: 12,
            border: "1px solid rgba(99,102,241,0.25)",
            background: "#fff",
            color: "#4f46e5",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 3px 12px rgba(99,102,241,0.12)",
          }}>
            <span style={{ fontSize: 18 }}>🏠</span> Home
          </Link>

          {/* Quick prompts */}
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>Quick Prompts</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => setInput(p)} style={{
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
                  borderRadius: 10, padding: "9px 12px", textAlign: "left",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#4f46e5",
                  cursor: "none", transition: "all 0.2s ease", lineHeight: 1.45,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; }}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div style={{ marginTop: "auto" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Capabilities</p>
            {[
              ["🧠", "RAG-Powered Answers"],
              ["📋", "Prescription OCR"],
              ["🌐", "30+ Languages"],
              ["👨‍⚕️", "Doctor Referral"],
              ["📄", "PDF Export"],
            ].map(([icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#dc2626", lineHeight: 1.55, fontWeight: 500 }}>
              ⚠️ For informational use only. Always consult a qualified doctor for medical advice.
            </p>
          </div>
        </div>

        {/* ── MAIN CHAT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Chat header */}
          <div style={{
            padding: "1rem 1.75rem",
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>🤖</div>
              <div>
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#1e1b4b", letterSpacing: "-0.02em" }}>AI Health Assistant</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#6b7280" }}>Online · RAG + NLP Powered</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => generatePDF(messages)} title="Download full chat as PDF" style={{
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "8px 16px", cursor: "none",
                fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#6366f1",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
              >
                📄 Export Chat
              </button>
              <button onClick={clearChat} style={{
                background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 10, padding: "8px 14px", cursor: "none",
                fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#dc2626",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.13)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              flex: 1, overflowY: "auto",
              padding: "1.75rem",
              display: "flex", flexDirection: "column",
              background: dragOver ? "rgba(99,102,241,0.03)" : "transparent",
              border: dragOver ? "2px dashed rgba(99,102,241,0.3)" : "2px dashed transparent",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            {dragOver && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(99,102,241,0.05)", zIndex: 10, borderRadius: 12,
                animation: "fadeIn 0.2s ease",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: "#6366f1", fontSize: "1rem" }}>Drop prescription image here</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onDownloadPDF={generatePDF} allMessages={messages} />
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: "1.25rem", animation: "msgSlideIn 0.3s ease" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div style={{
            padding: "1rem 1.75rem 1.5rem",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(99,102,241,0.08)",
          }}>
            {/* Image preview */}
            {imagePreview && (
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10, background: "rgba(99,102,241,0.06)", borderRadius: 12, padding: "8px 12px", border: "1px solid rgba(99,102,241,0.15)", animation: "fadeIn 0.25s ease" }}>
                <img src={imagePreview} alt="preview" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(99,102,241,0.2)" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#4f46e5" }}>📋 Prescription image ready for analysis</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#9ca3af" }}>Add a note or send directly</p>
                </div>
                <button onClick={() => { setUploadedImage(null); setImagePreview(null); }} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "none", color: "#dc2626" }}>✕</button>
              </div>
            )}

            {/* Input box */}
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10,
              background: "#fff", border: "1.5px solid rgba(99,102,241,0.2)",
              borderRadius: 16, padding: "10px 10px 10px 16px",
              boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
              onFocus={() => { }}
            >
              {/* Left actions */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", paddingBottom: 2 }}>
                {/* Image upload */}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files[0])} />
                <button onClick={() => fileInputRef.current?.click()} title="Upload prescription image" style={{
                  width: 36, height: 36, borderRadius: 10, border: "none", cursor: "none",
                  background: imagePreview ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.18)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = imagePreview ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)"}
                >📎</button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms or ask a health question... (Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem",
                  color: "#1e1b4b", lineHeight: 1.6,
                  maxHeight: 140, overflowY: "auto",
                  cursor: "none",
                }}
              />

              {/* Right actions */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", paddingBottom: 2 }}>
                {/* Voice button */}
                <button onClick={toggleRecording} title={isRecording ? "Stop recording" : "Voice input"} style={{
                  width: 36, height: 36, borderRadius: 10, border: "none", cursor: "none",
                  background: isRecording ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                  animation: isRecording ? "pulse 1.5s infinite" : "none",
                  transition: "all 0.2s ease",
                }}>
                  {isRecording ? "⏹️" : "🎙️"}
                </button>

                {/* Send button */}
                <button onClick={sendMessage} disabled={loading || (!input.trim() && !uploadedImage)} style={{
                  width: 36, height: 36, borderRadius: 10, border: "none", cursor: "none",
                  background: (input.trim() || uploadedImage) && !loading
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "rgba(156,163,175,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  boxShadow: (input.trim() || uploadedImage) && !loading ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
                  transition: "all 0.25s ease",
                  transform: (input.trim() || uploadedImage) && !loading ? "scale(1)" : "scale(0.95)",
                }}>
                  {loading
                    ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <span style={{ color: (input.trim() || uploadedImage) ? "#fff" : "#9ca3af" }}>➤</span>
                  }
                </button>
              </div>
            </div>

            {/* Bottom hint */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "#9ca3af" }}>
                📎 Upload prescription · 🎙️ Voice input · <kbd style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: "0.68rem" }}>Enter</kbd> to send
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "#9ca3af" }}>
                {input.length > 0 ? `${input.length} chars` : "Powered by RAG + NLP"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}