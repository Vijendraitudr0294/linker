import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Twitter, Sparkles, Zap } from "lucide-react";

const BiotraCCHero = () => {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: "#F3F4F6",
        height: "100vh",
        paddingTop: "80px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Floating Instagram pill - top left area */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "130px",
          left: "calc(50% - 560px)",
          zIndex: 30,
        }}
      >
        <div style={{
          width: "48px",
          height: "48px",
          backgroundColor: "#FBCFE8",
          border: "4px solid black",
          borderRadius: "14px",
          boxShadow: "4px 4px 0 0 black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(12deg)",
        }}>
          <Instagram size={22} color="black" />
        </div>
      </motion.div>

      {/* Floating Twitter pill - mid left */}
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "38%",
          left: "calc(50% - 580px)",
          zIndex: 30,
        }}
      >
        <div style={{
          width: "48px",
          height: "48px",
          backgroundColor: "#38BDF8",
          border: "4px solid black",
          borderRadius: "14px",
          boxShadow: "4px 4px 0 0 black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(-12deg)",
        }}>
          <Twitter size={22} color="black" />
        </div>
      </motion.div>

      {/* Main grid */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        alignItems: "center",
        position: "relative",
        zIndex: 10,
        width: "100%",
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Badge row */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              padding: "8px 20px",
              backgroundColor: "#4ADE80",
              border: "4px solid black",
              borderRadius: "9999px",
              boxShadow: "4px 4px 0 0 black",
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <Sparkles size={13} /> REAL STORIES: TESSA
            </div>
            <div style={{
              padding: "8px 20px",
              backgroundColor: "#FBCFE8",
              border: "4px solid black",
              borderRadius: "9999px",
              boxShadow: "4px 4px 0 0 black",
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <Zap size={13} /> AI POWERED
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{
              fontSize: "clamp(56px, 7vw, 88px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.88,
              textTransform: "uppercase",
              color: "#000",
              margin: 0,
            }}>
              ONE LINK FOR
            </h1>
            <motion.div
              animate={{ backgroundColor: ["#FBCFE8", "#FDE047", "#4ADE80", "#FBCFE8"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "4px 14px",
                border: "4px solid black",
                boxShadow: "8px 8px 0 0 black",
                transform: "rotate(-1.5deg)",
              }}
            >
              <span style={{
                fontSize: "clamp(56px, 7vw, 88px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.88,
                textTransform: "uppercase",
                color: "#000",
              }}>
                EVERYTHING.
              </span>
            </motion.div>
          </div>

          {/* Body */}
          <p style={{
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "0.06em",
            lineHeight: 1.6,
            textTransform: "uppercase",
            color: "#000",
            maxWidth: "360px",
            margin: 0,
          }}>
            Stop using links you don't own. Biotra gives you a page that you control. It's your brand. It's your money. One link, all your stuff.
          </p>

          {/* Quote */}
          <p style={{
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontStyle: "italic",
            color: "#22C55E",
            margin: 0,
          }}>
            "EASY TO START. IMPOSSIBLE TO IGNORE."
          </p>

          {/* CTA */}
          <Link
            to="/auth"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "72px",
              padding: "0 52px",
              backgroundColor: "#4ADE80",
              color: "#000",
              border: "4px solid black",
              borderRadius: "9999px",
              boxShadow: "8px 8px 0 0 black",
              fontSize: "17px",
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              alignSelf: "flex-start",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translate(4px,4px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translate(0,0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "8px 8px 0 0 black";
            }}
          >
            GET STARTED FREE
          </Link>
        </div>

        {/* ── RIGHT COLUMN: Overflowing Card ── */}
        <div style={{ position: "relative", paddingTop: "16px" }}>

          {/* TESSA LIVE NOW badge */}
          <div style={{
            position: "absolute",
            top: "0px",
            right: "48px",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "white",
            border: "4px solid black",
            borderRadius: "9999px",
            padding: "6px 16px",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            boxShadow: "4px 4px 0 0 black",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#22C55E",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
            }} />
            (•) TESSA LIVE NOW
          </div>

          {/* Main Card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundColor: "white",
              border: "8px solid black",
              borderRadius: "40px",
              boxShadow: "16px 16px 0 0 black",
              padding: "20px 24px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "visible",
              marginTop: "16px",
            }}
          >
            {/* Grid background pattern */}
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: "40px",
              overflow: "hidden",
              backgroundImage: "linear-gradient(90deg,#000 1px,transparent 1px),linear-gradient(#000 1px,transparent 1px)",
              backgroundSize: "18px 18px",
              opacity: 0.04,
              pointerEvents: "none",
            }} />

            {/* ═══ MEMPHIS SHAPES ═══ */}

            {/* Pink 10-point star - top left */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                top: "-28px",
                left: "-22px",
                width: "72px",
                height: "72px",
                backgroundColor: "#FF80BF",
                clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                border: "4px solid black",
                zIndex: 35,
              }}
            />

            {/* Green upward triangle / arrow - top right */}
            <div style={{
              position: "absolute",
              top: "-18px",
              right: "36px",
              width: "52px",
              height: "52px",
              backgroundColor: "#4ADE80",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black",
              transform: "rotate(22deg)",
              zIndex: 35,
            }} />

            {/* Yellow Lightning bolt - right side */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "70px",
                right: "-26px",
                width: "38px",
                height: "78px",
                backgroundColor: "#FDE047",
                border: "4px solid black",
                zIndex: 35,
                clipPath: "polygon(65% 0%,100% 0%,45% 50%,95% 50%,5% 100%,55% 52%,10% 52%)",
              }}
            />

            {/* Pink triangle - bottom left */}
            <div style={{
              position: "absolute",
              bottom: "90px",
              left: "-18px",
              width: "48px",
              height: "48px",
              backgroundColor: "#FBCFE8",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black",
              transform: "rotate(-18deg)",
              zIndex: 35,
            }} />

            {/* Green triangle - bottom right */}
            <div style={{
              position: "absolute",
              bottom: "-14px",
              right: "56px",
              width: "48px",
              height: "48px",
              backgroundColor: "#4ADE80",
              clipPath: "polygon(50% 0%,0% 100%,100% 100%)",
              border: "4px solid black",
              transform: "rotate(55deg)",
              zIndex: 35,
            }} />

            {/* Dots */}
            <div style={{ position: "absolute", top: "150px", left: "-10px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "black", zIndex: 35 }} />
            <div style={{ position: "absolute", top: "28px", right: "110px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FDE047", border: "2px solid black", zIndex: 35 }} />
            <div style={{ position: "absolute", bottom: "44px", right: "16px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "white", border: "2px solid black", zIndex: 35 }} />
            <div style={{ position: "absolute", bottom: "66px", left: "40px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "black", zIndex: 35 }} />

            {/* ═══ CARD CONTENT ═══ */}

            {/* Card top title */}
            <div style={{ textAlign: "center", position: "relative", zIndex: 20, marginBottom: "10px", width: "100%" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, color: "#000" }}>BIOTRA</p>
              <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555" }}>UNLEASH YOUR BRAND</p>
              <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#22C55E" }}>YOUR LINK IN BIO</p>
            </div>

            {/* Phone mockup */}
            <div style={{
              width: "200px",
              height: "310px",
              backgroundColor: "white",
              border: "5px solid black",
              borderRadius: "28px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "5px 5px 0 0 rgba(0,0,0,0.1)",
              position: "relative",
              zIndex: 20,
            }}>

              {/* Header bar with profile */}
              <div style={{ backgroundColor: "#4ADE80", padding: "8px 12px", borderBottom: "3px solid black", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#FBCFE8", border: "2px solid black", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", lineHeight: 1 }}>@joshua.creator</p>
                  <p style={{ fontSize: "6px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" }}>BIOTRA.co</p>
                </div>
              </div>

              {/* Link buttons */}
              <div style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "5px", backgroundColor: "#F3F4F6" }}>
                {[
                  { label: "Latest Reels",  bg: "#FBCFE8" },
                  { label: "Merch Store",   bg: "#FDE047" },
                  { label: "New Podcast",   bg: "#4ADE80" },
                  { label: "Newsletter",    bg: "#FBCFE8" },
                  { label: "Support Me",    bg: "#FDE047" },
                ].map((b, i) => (
                  <div key={i} style={{
                    flex: 1,
                    backgroundColor: b.bg,
                    border: "2px solid black",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "7px",
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    boxShadow: "2px 2px 0 0 black",
                  }}>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Card bottom */}
            <div style={{ textAlign: "center", marginTop: "12px", position: "relative", zIndex: 20, width: "100%", paddingTop: "10px", borderTop: "2px solid rgba(0,0,0,0.07)" }}>
              <p style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1, fontStyle: "italic", color: "#000" }}>100% OWNERSHIP</p>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginTop: "4px", lineHeight: 1.5 }}>
                Take control of your audience and revenue.<br />Build your link today with BIOTRA.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BiotraCCHero;
