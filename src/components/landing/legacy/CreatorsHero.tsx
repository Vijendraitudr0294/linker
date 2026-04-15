import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Instagram, Twitter, Youtube, Twitch } from "lucide-react";

const CreatorsHero = () => {
  const title = "BUILT FOR";
  const highlight = "EVERY ONE.";
  const description = "Home chefs in India. Makeup artists in Mexico. Gamers in Japan. Creators in Ghana. ONE platform. ONE link. YOUR audience.";
  const ctaLabel = "JOIN FREE";
  const ctaHref = "/register";

  const rolePills = [
    { label: "🏡 Real Estate", bg: "#FDE047" },
    { label: "🛍️ Shop", bg: "#4ADE80" },
    { label: "🎥 Creator", bg: "#38BDF8" },
    { label: "🍽️ Restaurant", bg: "#FBCFE8" },
    { label: "📸 Photo", bg: "#C084FC" },
    { label: "🎮 Gaming", bg: "#FB923C" },
  ];

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        height: "100vh",
        maxHeight: "100dvh",
        backgroundColor: "#F3F4F6",
        paddingTop: "80px",
      }}
    >
      {/* Main grid */}
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-3 sm:gap-4">

          {/* Badges */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <div style={{
              padding: "6px 16px", backgroundColor: "#4ADE80",
              border: "3px solid black", borderRadius: "9999px",
              boxShadow: "3px 3px 0 0 black", fontSize: "10px", fontWeight: 900,
              letterSpacing: "0.16em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <Users size={12} /> 50K+ CREATORS
            </div>
            <div style={{
              padding: "6px 16px", backgroundColor: "#FBCFE8",
              border: "3px solid black", borderRadius: "9999px",
              boxShadow: "3px 3px 0 0 black", fontSize: "10px", fontWeight: 900,
              letterSpacing: "0.16em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              🌍 WORLDWIDE
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black uppercase text-black m-0 leading-[0.9] tracking-[-0.03em]">
              {title}
            </h1>
            <motion.div
              animate={{ backgroundColor: ["#FBCFE8", "#FDE047", "#4ADE80", "#FBCFE8"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                display: "inline-block", marginTop: "8px",
                padding: "2px 12px", border: "4px solid black",
                boxShadow: "6px 6px 0 0 black", transform: "rotate(-1.5deg)",
              }}
            >
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black uppercase text-black leading-[0.9] tracking-[-0.03em] whitespace-nowrap">
                {highlight}
              </span>
            </motion.div>
          </div>

          {/* Body */}
          <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.04em] leading-relaxed text-black max-w-[400px] m-0">
            {description}
          </p>

          {/* Creator role pills */}
          <div className="flex gap-[6px] flex-wrap items-center">
            {rolePills.map(p => (
              <div key={p.label} style={{
                padding: "4px 12px", backgroundColor: p.bg,
                border: "2px solid black", borderRadius: "9999px",
                fontSize: "9px", fontWeight: 900,
                letterSpacing: "0.08em", textTransform: "uppercase",
                boxShadow: "2px 2px 0 0 black",
              }}>
                {p.label}
              </div>
            ))}
          </div>

          {/* Quote */}
          <p className="text-[10px] font-black tracking-[0.16em] uppercase italic text-[#22C55E] m-0">
            "FROM ANY COUNTRY. ANY CRAFT. ANY DREAM."
          </p>

          {/* CTA */}
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center gap-2 h-12 md:h-14 px-7 md:px-10 bg-[#4ADE80] text-black border-[3px] border-black rounded-full shadow-[6px_6px_0_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] text-[13px] md:text-[15px] font-black tracking-[0.12em] uppercase no-underline transition-all duration-150 self-start"
          >
            {ctaLabel} <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative w-full max-w-[440px] mx-auto lg:max-w-none hidden md:block">

          {/* Live badge */}
          <div className="absolute -top-2 right-4 lg:right-8 z-40 flex items-center gap-2 bg-white border-3 border-black rounded-full px-3 py-1 shadow-[3px_3px_0_0_black]"
            style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", border: "3px solid black" }}>
            <span style={{ width: "7px", height: "7px", backgroundColor: "#22C55E", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            🌍 GLOBAL COMMUNITY
          </div>

          {/* Main Card */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundColor: "white", border: "6px solid black",
              borderRadius: "32px", boxShadow: "12px 12px 0 0 black",
              padding: "16px 20px 20px",
              display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative", overflow: "visible", marginTop: "12px",
            }}
          >
            {/* Grid pattern */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "32px", overflow: "hidden",
              backgroundImage: "linear-gradient(90deg,#000 1px,transparent 1px),linear-gradient(#000 1px,transparent 1px)",
              backgroundSize: "18px 18px", opacity: 0.03, pointerEvents: "none",
            }} />

            {/* Memphis shapes */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", top: "-22px", left: "-18px",
                width: "56px", height: "56px", backgroundColor: "#FF80BF",
                clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                border: "3px solid black", zIndex: 35,
              }}
            />
            <div style={{
              position: "absolute", top: "-14px", right: "32px",
              width: "40px", height: "40px", backgroundColor: "#4ADE80",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "3px solid black", transform: "rotate(22deg)", zIndex: 35,
            }} />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", top: "60px", right: "-20px",
                width: "30px", height: "60px", backgroundColor: "#FDE047",
                border: "3px solid black", zIndex: 35,
                clipPath: "polygon(65% 0%,100% 0%,45% 50%,95% 50%,5% 100%,55% 52%,10% 52%)",
              }}
            />

            {/* Card title */}
            <div style={{ textAlign: "center", position: "relative", zIndex: 20, marginBottom: "8px", width: "100%" }}>
              <p style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, color: "#000", margin: 0 }}>CREATORS</p>
              <p style={{ fontSize: "7px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", margin: "2px 0 0" }}>FROM EVERY CORNER OF THE WORLD</p>
              <p style={{ fontSize: "7px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#22C55E", margin: "1px 0 0" }}>POWERED BY BIOTRA</p>
            </div>

            {/* Image container */}
            <div style={{
              width: "100%",
              border: "4px solid black", borderRadius: "16px",
              overflow: "hidden", position: "relative", zIndex: 20,
              boxShadow: "4px 4px 0 0 rgba(0,0,0,0.1)",
              backgroundColor: "white",
            }} className="h-[180px] lg:h-[220px]">
              {/* Floating Social Icons */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "12px", left: "16px", zIndex: 25,
                  width: "30px", height: "30px", backgroundColor: "#FBCFE8",
                  border: "2px solid black", borderRadius: "8px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(-12deg)",
                }}
              >
                <Instagram size={15} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "36px", left: "64px", zIndex: 25,
                  width: "26px", height: "26px", backgroundColor: "#FDE047",
                  border: "2px solid black", borderRadius: "6px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(8deg)",
                }}
              >
                <Youtube size={13} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "16px", right: "20px", zIndex: 25,
                  width: "30px", height: "30px", backgroundColor: "#38BDF8",
                  border: "2px solid black", borderRadius: "8px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(15deg)",
                }}
              >
                <Twitter size={15} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "40px", right: "64px", zIndex: 25,
                  width: "24px", height: "24px", backgroundColor: "#4ADE80",
                  border: "2px solid black", borderRadius: "6px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(-10deg)",
                }}
              >
                <Twitch size={12} color="black" />
              </motion.div>

              <img
                src="/creators-group.png"
                alt="Diverse creators using Biotra"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />

              {/* Country flag bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: "black", borderTop: "2px solid #4ADE80",
                padding: "5px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ color: "white", fontSize: "9px", fontWeight: 900, letterSpacing: "0.1em" }}>🇮🇳 🇬🇭 🇲🇽 🇯🇵</span>
                <span style={{ color: "#4ADE80", fontSize: "8px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>✦ BIOTRA.CC</span>
              </div>
            </div>

            {/* Card bottom */}
            <div style={{
              textAlign: "center", marginTop: "10px", position: "relative", zIndex: 20,
              width: "100%", paddingTop: "8px", borderTop: "2px solid rgba(0,0,0,0.07)",
            }}>
              <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, fontStyle: "italic", color: "#000", margin: 0 }}>
                ONE PLATFORM.
              </p>
              <p style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", marginTop: "3px", lineHeight: 1.4 }}>
                Every creator. Every country. Every dream.<br />Your link in bio, powered by Biotra.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CreatorsHero;
