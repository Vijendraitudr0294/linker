import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Gamepad2, Brush, Video, ArrowUpRight, Users, Instagram, Twitter, Youtube, Twitch } from "lucide-react";

const CreatorsHero = () => {
  return (
    <section
      className="relative overflow-hidden min-h-[100vh] flex items-center pt-32 pb-16 lg:pt-20 lg:pb-0"
      style={{
        backgroundColor: "#F3F4F6",
      }}
    >
      {/* Floating Chef icon - left side, pushed down to avoid text */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden xl:flex absolute z-30"
        style={{ top: "80px", left: "8vw" }}
      >
        <div style={{
          width: "48px", height: "48px", backgroundColor: "#FDE047",
          border: "4px solid black", borderRadius: "14px",
          boxShadow: "4px 4px 0 0 black",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(12deg)",
        }}>
          <ChefHat size={22} color="black" />
        </div>
      </motion.div>

      {/* Floating Gamepad icon - bottom left */}
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden xl:flex absolute z-30"
        style={{ bottom: "80px", left: "12vw" }}
      >
        <div style={{
          width: "48px", height: "48px", backgroundColor: "#38BDF8",
          border: "4px solid black", borderRadius: "14px",
          boxShadow: "4px 4px 0 0 black",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-12deg)",
        }}>
          <Gamepad2 size={22} color="black" />
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Badges */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              padding: "8px 20px", backgroundColor: "#4ADE80",
              border: "4px solid black", borderRadius: "9999px",
              boxShadow: "4px 4px 0 0 black", fontSize: "11px", fontWeight: 900,
              letterSpacing: "0.18em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Users size={13} /> 50K+ CREATORS
            </div>
            <div style={{
              padding: "8px 20px", backgroundColor: "#FBCFE8",
              border: "4px solid black", borderRadius: "9999px",
              boxShadow: "4px 4px 0 0 black", fontSize: "11px", fontWeight: 900,
              letterSpacing: "0.18em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              🌍 WORLDWIDE
            </div>
          </div>

          {/* Headline */}
          <div>
            <h2 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-[88px] font-black uppercase text-black m-0 leading-[0.88] tracking-[-0.03em]"
            >
              BUILT FOR
            </h2>
            <motion.div
              animate={{ backgroundColor: ["#FBCFE8", "#FDE047", "#4ADE80", "#FBCFE8"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                display: "inline-block", marginTop: "10px",
                padding: "4px 14px", border: "4px solid black",
                boxShadow: "8px 8px 0 0 black", transform: "rotate(-1.5deg)",
              }}
            >
              <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[88px] font-black uppercase text-black leading-[0.88] tracking-[-0.03em] whitespace-nowrap">
                EVERY ONE.
              </span>
            </motion.div>
          </div>

          {/* Body */}
          <p style={{
            fontSize: "13px", fontWeight: 900, letterSpacing: "0.06em",
            lineHeight: 1.6, textTransform: "uppercase", color: "#000",
            maxWidth: "420px", margin: 0,
          }}>
            Home chefs in India. Makeup artists in Mexico. Gamers in Japan. Creators in Ghana. ONE platform. ONE link. YOUR audience.
          </p>

          {/* Creator role pills row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { label: "🏡 Real Estate",    bg: "#FDE047" },
              { label: "🛍️ Shop / Seller",  bg: "#4ADE80" },
              { label: "🎥 Creator",        bg: "#38BDF8" },
              { label: "🍽️ Restaurant",    bg: "#FBCFE8" },
              { label: "📸 Photographer",   bg: "#C084FC" },
              { label: "🎮 Gaming",         bg: "#FB923C" },
            ].map(p => (
              <div key={p.label} style={{
                padding: "5px 14px", backgroundColor: p.bg,
                border: "3px solid black", borderRadius: "9999px",
                fontSize: "10px", fontWeight: 900,
                letterSpacing: "0.1em", textTransform: "uppercase",
                boxShadow: "3px 3px 0 0 black",
              }}>
                {p.label}
              </div>
            ))}
            <Link to="/features" style={{
              padding: "5px 14px", backgroundColor: "white",
              border: "3px dashed black", borderRadius: "9999px",
              fontSize: "10px", fontWeight: 900, color: "black",
              letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none"
            }} className="hover:bg-gray-100 transition-colors">
              EXPLORE MORE →
            </Link>
          </div>

          {/* Quote */}
          <p style={{
            fontSize: "11px", fontWeight: 900, letterSpacing: "0.18em",
            textTransform: "uppercase", fontStyle: "italic",
            color: "#22C55E", margin: 0,
          }}>
            "FROM ANY COUNTRY. ANY CRAFT. ANY DREAM."
          </p>

          {/* CTA */}
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-[10px] h-14 md:h-[72px] px-8 md:px-[52px] bg-[#4ADE80] text-black border-4 border-black rounded-full shadow-[8px_8px_0_0_black] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-[15px] md:text-[17px] font-black tracking-[0.14em] uppercase no-underline transition-all duration-150 self-start"
          >
            JOIN FREE <ArrowUpRight size={20} />
          </Link>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="relative pt-4 lg:pt-16 w-full max-w-[500px] mx-auto lg:max-w-none">
          
          {/* Live badge */}
          <div className="absolute top-0 right-4 lg:right-12 z-40 flex items-center gap-2 bg-white border-4 border-black rounded-full px-4 py-1.5 shadow-[4px_4px_0_0_black]"
            style={{
              fontSize: "10px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase"
            }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "#22C55E", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            🌍 GLOBAL COMMUNITY
          </div>

          {/* Main Card — identical structure to hero */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundColor: "white", border: "8px solid black",
              borderRadius: "40px", boxShadow: "16px 16px 0 0 black",
              padding: "20px 24px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative", overflow: "visible", marginTop: "16px",
            }}
          >
            {/* Grid pattern */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "40px", overflow: "hidden",
              backgroundImage: "linear-gradient(90deg,#000 1px,transparent 1px),linear-gradient(#000 1px,transparent 1px)",
              backgroundSize: "18px 18px", opacity: 0.04, pointerEvents: "none",
            }} />

            {/* Memphis shapes — identical to hero */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", top: "-28px", left: "-22px",
                width: "72px", height: "72px", backgroundColor: "#FF80BF",
                clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                border: "4px solid black", zIndex: 35,
              }}
            />
            <div style={{
              position: "absolute", top: "-18px", right: "36px",
              width: "52px", height: "52px", backgroundColor: "#4ADE80",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black", transform: "rotate(22deg)", zIndex: 35,
            }} />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", top: "70px", right: "-26px",
                width: "38px", height: "78px", backgroundColor: "#FDE047",
                border: "4px solid black", zIndex: 35,
                clipPath: "polygon(65% 0%,100% 0%,45% 50%,95% 50%,5% 100%,55% 52%,10% 52%)",
              }}
            />
            <div style={{
              position: "absolute", bottom: "90px", left: "-18px",
              width: "48px", height: "48px", backgroundColor: "#FBCFE8",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black", transform: "rotate(-18deg)", zIndex: 35,
            }} />
            <div style={{
              position: "absolute", bottom: "-14px", right: "56px",
              width: "48px", height: "48px", backgroundColor: "#4ADE80",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black", transform: "rotate(55deg)", zIndex: 35,
            }} />
            <div style={{ position: "absolute", top: "150px", left: "-10px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "black", zIndex: 35 }} />
            <div style={{ position: "absolute", top: "28px", right: "110px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FDE047", border: "2px solid black", zIndex: 35 }} />
            <div style={{ position: "absolute", bottom: "44px", right: "16px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "white", border: "2px solid black", zIndex: 35 }} />
            <div style={{ position: "absolute", bottom: "66px", left: "40px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "black", zIndex: 35 }} />

            {/* Card top title */}
            <div style={{ textAlign: "center", position: "relative", zIndex: 20, marginBottom: "10px", width: "100%" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, color: "#000" }}>CREATORS</p>
              <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555" }}>FROM EVERY CORNER OF THE WORLD</p>
              <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#22C55E" }}>POWERED BY BIOTRA</p>
            </div>

            {/* Creators group image */}
            <div style={{
              width: "100%",
              border: "5px solid black", borderRadius: "20px",
              overflow: "hidden", position: "relative", zIndex: 20,
              boxShadow: "5px 5px 0 0 rgba(0,0,0,0.1)",
              backgroundColor: "white",
            }} className="mt-2 h-[200px] sm:h-[260px]">
              {/* Floating Social Icons inside image */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "16px", left: "20px", zIndex: 25,
                  width: "36px", height: "36px", backgroundColor: "#FBCFE8",
                  border: "3px solid black", borderRadius: "10px",
                  boxShadow: "3px 3px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(-12deg)",
                }}
              >
                <Instagram size={18} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "44px", left: "80px", zIndex: 25,
                  width: "32px", height: "32px", backgroundColor: "#FDE047",
                  border: "3px solid black", borderRadius: "8px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(8deg)",
                }}
              >
                <Youtube size={16} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "20px", right: "24px", zIndex: 25,
                  width: "36px", height: "36px", backgroundColor: "#38BDF8",
                  border: "3px solid black", borderRadius: "10px",
                  boxShadow: "3px 3px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(15deg)",
                }}
              >
                <Twitter size={18} color="black" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: "50px", right: "80px", zIndex: 25,
                  width: "28px", height: "28px", backgroundColor: "#4ADE80",
                  border: "3px solid black", borderRadius: "8px",
                  boxShadow: "2px 2px 0 0 black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(-10deg)",
                }}
              >
                <Twitch size={14} color="black" />
              </motion.div>

              <img
                src="/creators-group.png"
                alt="Diverse creators using Biotra"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
              {/* Country flag overlay bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: "black", borderTop: "3px solid #4ADE80",
                padding: "6px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ color: "white", fontSize: "10px", fontWeight: 900, letterSpacing: "0.12em" }}>🇮🇳 🇬🇭 🇲🇽 🇯🇵</span>
                <span style={{ color: "#4ADE80", fontSize: "9px", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>✦ BIOTRA.CC</span>
              </div>
            </div>

            {/* Card bottom — replaces "100% OWNERSHIP" */}
            <div style={{
              textAlign: "center", marginTop: "12px", position: "relative", zIndex: 20,
              width: "100%", paddingTop: "10px", borderTop: "2px solid rgba(0,0,0,0.07)",
            }}>
              <p style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, fontStyle: "italic", color: "#000" }}>
                ONE PLATFORM.
              </p>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginTop: "4px", lineHeight: 1.5 }}>
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
