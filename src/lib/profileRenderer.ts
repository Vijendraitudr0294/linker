/**
 * SHARED PROFILE RENDERING UTILITIES
 * ===================================
 * This file is the SINGLE SOURCE OF TRUTH for how profiles are rendered.
 * Both ProfilePreview.tsx (dashboard) and PublicProfile.tsx (public URL) MUST
 * use these functions to ensure pixel-perfect visual parity.
 *
 * DO NOT duplicate this logic. If you need to change how a profile looks,
 * change it HERE and both views will update automatically.
 */

import type React from "react";

// ── Types ──

export interface ProfilePalette {
  cardBg: string;
  cardText: string;
  cardSub: string;
  cardBorder: string;
  btnBg: string;
  btnText: string;
  isDark: boolean;
}

export type ButtonStyleType = "rounded" | "pill" | "square" | "outline" | "shadow";

export interface ProfileAppearance {
  background_color: string;
  card_color: string;
  text_color: string;
  button_style: ButtonStyleType;
  button_bg: string;
  button_text: string;
  gradient_from?: string | null;
  gradient_to?: string | null;
  font_family: string;
  show_avatar: boolean;
  background_image?: string;
  background_overlay?: string;
  animated_gradient?: string;
  animation_class?: string;
  layout_type?: string;
  card_style?: string;
  theme_id?: string;
}

// ── Palette ──

export function computePalette(appearance: ProfileAppearance): ProfilePalette {
  const cardBg = appearance.card_color;
  // Designer Fix: Always ensure card text is readable against the card background
  const cardText = getContrastColor(cardBg);
  const cardSub = `${cardText}aa`;
  
  // Smarter border: Use high contrast if it's a brutalism/minimal theme
  const themeId = (appearance.theme_id || "").toLowerCase();
  const isBrutalism = appearance.layout_type === "brutalism" || 
                     themeId.includes("brutal") || 
                     themeId.includes("poster") || 
                     themeId.includes("retro");
  const cardBorder = isBrutalism ? "#000000" : `${cardText}30`; 
  
  const btnBg = appearance.button_bg;
  // Designer Fix: Always ensure button text is readable against the button background
  const btnText = getContrastColor(btnBg);
  const isDark = getContrastColor(appearance.background_color) === "#ffffff";
  return { cardBg, cardText, cardSub, cardBorder, btnBg, btnText, isDark };
}

// ── Background Style ──

export function computeBgStyle(appearance: ProfileAppearance): React.CSSProperties {
  const style: React.CSSProperties = { 
    fontFamily: appearance.font_family,
    minHeight: '100%',
    width: '100%',
  };

  // Priority: Image > Animated Gradient > Static Gradient > Solid Color
  if (appearance.background_image) {
    const imageUrl = appearance.background_image;
    const overlay = appearance.background_overlay || "rgba(0,0,0,0.3)";
    style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url("${imageUrl}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    style.backgroundRepeat = "no-repeat";
    // Also set a fallback color to avoid white flashes
    style.backgroundColor = appearance.background_color || "#0f172a";
  } else if (appearance.animated_gradient) {
    style.background = appearance.animated_gradient;
  } else if (appearance.gradient_from && appearance.gradient_to) {
    style.background = `linear-gradient(135deg, ${appearance.gradient_from}, ${appearance.gradient_to})`;
  } else {
    style.backgroundColor = appearance.background_color;
  }

  return style;
}

// ── Link Button Styles ──

export function getLinkButtonClasses(buttonStyle: ButtonStyleType): string {
  switch (buttonStyle) {
    case "pill":
      return "rounded-full";
    case "square":
      return "rounded-none";
    default:
      // rounded, outline, shadow all use rounded corners
      return "rounded-2xl";
  }
}

// ── Card Styling Engine ──

export function getProfileCardStyle(
  appearance: ProfileAppearance, 
  palette: ProfilePalette, 
  isHover: boolean = false
): React.CSSProperties {
  const themeId = (appearance.theme_id || "").toLowerCase();
  const isBrutalism = appearance.layout_type === "brutalism" || 
                     themeId.includes("brutal") || 
                     themeId.includes("poster") || 
                     themeId.includes("retro");
  
  const cardStyle = appearance.card_style || "classic";
  const isDarkTheme = appearance.background_image || appearance.animated_gradient || themeId.includes("galaxy");
  const isLight = palette.cardBg === "#ffffff" || palette.cardBg === "rgba(255,255,255,1)";
  
  // Base style with premium bezier curve
  const style: React.CSSProperties = {
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  if (isBrutalism) {
    // Designer Fix: Adaptive Brutalism (Dark themes get dark brutalist cards)
    const isDarkBrutal = isDarkTheme && !isLight;
    style.backgroundColor = isDarkBrutal ? "#111111" : "#ffffff";
    style.color = isDarkBrutal ? "#ffffff" : "#000000";
    style.border = `4px solid ${isDarkBrutal ? "#ffffff" : "#000000"}`;
    style.borderRadius = "0px";
    style.boxShadow = isHover ? "none" : `8px 8px 0 0 ${isDarkBrutal ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)"}`;
    style.transform = isHover ? "translate(4px, 4px)" : "none";
    return style;
  }

  // Handle Glassmorphism & Luxe Themes
  if (cardStyle.includes("glass") || (isDarkTheme && isLight)) {
    const glassBg = isHover ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.08)";
    style.backgroundColor = glassBg;
    style.borderColor = "rgba(255, 255, 255, 0.15)";
    style.backdropFilter = "blur(24px) saturate(180%)";
    style.WebkitBackdropFilter = "blur(24px) saturate(180%)";
    
    // Designer Shadow Stack (Physical Depth)
    style.boxShadow = isHover 
      ? "0 20px 50px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)" 
      : "0 10px 30px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)";
  } else {
    // Classic/Solid Style
    style.backgroundColor = palette.cardBg;
    style.borderColor = palette.cardBorder;
    style.boxShadow = isHover 
      ? "0 15px 35px rgba(0,0,0,0.15)" 
      : "0 5px 15px rgba(0,0,0,0.08)";
  }

  if (isHover) {
    style.transform = "translateY(-4px)";
  }

  return style;
}

export function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith("#")) return "#ffffff";
  let r = 0, g = 0, b = 0;
  try {
    if (hexColor.length === 4) {
      r = parseInt(hexColor[1] + hexColor[1], 16);
      g = parseInt(hexColor[2] + hexColor[2], 16);
      b = parseInt(hexColor[3] + hexColor[3], 16);
    } else if (hexColor.length >= 7) {
      r = parseInt(hexColor.slice(1, 3), 16);
      g = parseInt(hexColor.slice(3, 5), 16);
      b = parseInt(hexColor.slice(5, 7), 16);
    }
  } catch {
    return "#ffffff";
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "#ffffff";
}

export function getLinkButtonStyle(
  buttonStyle: ButtonStyleType,
  btnBg: string,
  btnText: string,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  const isOutline = buttonStyle === "outline";
  const isShadow = buttonStyle === "shadow";
  const autoColor = getContrastColor(btnBg);

  return {
    backgroundColor: isOutline ? "transparent" : btnBg,
    color: isOutline ? btnBg : autoColor,
    boxShadow: isShadow
      ? `0 8px 24px -4px ${btnBg}60`
      : `0 6px 14px -3px ${btnBg}30`,
    border: isOutline ? `2px solid ${btnBg}` : "none",
    ...extra
  };
}

export function getLinkIconBgStyle(
  buttonStyle: ButtonStyleType,
  btnBg: string
): React.CSSProperties {
  const isOutline = buttonStyle === "outline";
  return {
    backgroundColor: isOutline ? `${btnBg}15` : "rgba(255,255,255,0.1)",
  };
}

// ── Footer Text Color ──

export function getFooterColor(appearance: ProfileAppearance): string {
  const hasAnimated = !!appearance.animated_gradient || !!appearance.animation_class;
  if (hasAnimated || appearance.background_image || appearance.gradient_from) {
    return "rgba(255,255,255,0.4)";
  }
  return `${appearance.text_color}60`;
}

export function getCardClasses(cardStyle: string = "classic", additional?: string): string {
  const isGlass = cardStyle === "glass";
  const isGlassPremium = cardStyle === "glass-premium";
  const isNeon = cardStyle === "neon";

  const classes = [
    "relative rounded-[18px] border transition-all duration-300",
    isGlass ? "glass-subtle backdrop-blur-md" : "",
    isGlassPremium ? "glass-premium" : "",
    isNeon ? "neon-border shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "",
    "hover:-translate-y-1 hover:shadow-2xl",
    additional || ""
  ].filter(Boolean).join(" ");

  return classes;
}
