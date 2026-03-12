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
}

// ── Palette ──

export function computePalette(appearance: ProfileAppearance): ProfilePalette {
  const cardBg = appearance.card_color;
  const cardText = appearance.text_color;
  const cardSub = `${cardText}aa`;
  const cardBorder = `${cardText}15`;
  const btnBg = appearance.button_bg;
  const btnText = appearance.button_text;
  return { cardBg, cardText, cardSub, cardBorder, btnBg, btnText };
}

// ── Background Style ──

export function computeBgStyle(appearance: ProfileAppearance): React.CSSProperties {
  const style: React.CSSProperties = { fontFamily: appearance.font_family };

  if (appearance.animated_gradient) {
    style.background = appearance.animated_gradient;
  } else if (appearance.gradient_from && appearance.gradient_to) {
    style.background = `linear-gradient(135deg, ${appearance.gradient_from}, ${appearance.gradient_to})`;
  } else {
    style.backgroundColor = appearance.background_color;
  }

  // Always ensure a base color behind images/overlays if no gradient is present
  if (appearance.background_image && !appearance.animated_gradient && !appearance.gradient_from) {
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

export function getLinkButtonStyle(
  buttonStyle: ButtonStyleType,
  btnBg: string,
  btnText: string
): React.CSSProperties {
  const isOutline = buttonStyle === "outline";
  const isShadow = buttonStyle === "shadow";

  return {
    backgroundColor: isOutline ? "transparent" : btnBg,
    color: isOutline ? btnBg : btnText,
    boxShadow: isShadow
      ? `0 8px 24px -4px ${btnBg}60`
      : `0 6px 14px -3px ${btnBg}30`,
    border: isOutline ? `2px solid ${btnBg}` : "none",
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
