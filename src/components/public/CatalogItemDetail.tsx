import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Mail,
  Phone,
  StickyNote,
  Loader2,
  Play,
  ExternalLink,
  Video,
  Newspaper,
  Music,
  MessageSquare,
  Clapperboard,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { usePlatformStore } from "@/stores/platformStore";
import { getCheckoutStepLabels, resolveItemCtaLabel, type CheckoutStepKey } from "@/lib/commerceConfig";
import { parseCatalogCategory } from "@/lib/catalogCategory";

interface ItemVariant {
  label: string;
  options: string[];
}

interface CatalogItemData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  variants?: ItemVariant[];
  track_inventory?: boolean;
  stock_quantity?: number | null;
  duration?: string;
  schedule?: string;
  location?: string;
  media?: { type: "image" | "video"; url: string }[];
}

interface CatalogItemDetailProps {
  item: CatalogItemData;
  profileUserId: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  buttonStyle: string;
  hasPhoto: boolean;
  onClose: () => void;
  onTrackClick: (itemId: string) => void;
  upiId?: string;
  cardBg?: string;
}

import { 
  StepKey, 
  SERVICE_TYPES, 
  CONTENT_TYPES, 
  customerSchema, 
  stepHeadings, 
  toEmbedVideoUrl, 
  isEmbedCode, 
  getYouTubeThumbnail, 
  isDirectVideoFile 
} from "./catalog/CatalogDetailUtils";
import { useCatalogDetail } from "@/hooks/useCatalogDetail";

const CatalogItemDetail = ({
  item,
  profileUserId,
  textColor,
  buttonBg,
  buttonText,
  onClose,
  cardBg,
}: CatalogItemDetailProps) => {
  const initialized = usePlatformStore((s) => s.initialized);
  const fetchSettings = usePlatformStore((s) => s.fetchSettings);
  const settings = usePlatformStore((s) => s.settings);

  const {
    quantity, setQuantity,
    activeMediaIndex, setActiveMediaIndex,
    step, setStep,
    name, setName,
    email, setEmail,
    phone, setPhone,
    notes, setNotes,
    isSubmitting,
    categoryLabel,
    media,
    activeMedia,
    activeEmbedUrl,
    activeVideoMode,
    activeIsVideo,
    isContent,
    isReel,
    isMusic,
    isService,
    flowLabel,
    itemLabel,
    primaryCtaLabel,
    steps,
    unitPrice,
    subtotal,
    stepIndex,
    orderRef,
    activeHeading,
    goToPayment,
    placeOrder
  } = useCatalogDetail({ item, profileUserId, settings });

  useEffect(() => {
    if (!initialized) {
      void fetchSettings();
    }
  }, [fetchSettings, initialized]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    window.dispatchEvent(new CustomEvent("catalog-modal-state", { detail: { open: true } }));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.dispatchEvent(new CustomEvent("catalog-modal-state", { detail: { open: false } }));
    };
  }, []);

  const renderStepContent = () => {
    if (isContent) {
      const typeMeta =
        item.item_type === "video" || item.item_type === "reel"
          ? { label: "Watch Now", icon: Play }
          : item.item_type === "article" || item.item_type === "blog"
          ? { label: "Read Article", icon: Newspaper }
          : item.item_type === "music"
          ? { label: "Listen Now", icon: Music }
          : { label: "View Post", icon: ExternalLink };
      const TypeIcon = typeMeta.icon;

      return (
        <div className="space-y-5">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
              style={{ backgroundColor: `${buttonBg}12`, color: buttonBg }}
            >
              <TypeIcon className="w-3 h-3" />
              {item.item_type}
            </div>
            <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight" style={{ color: textColor }}>
              {item.title}
            </h2>
            <p className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-50" style={{ color: textColor }}>
              {categoryLabel}
            </p>
          </div>

          <div className="space-y-4">
            {item.description && (
              <p className="text-sm md:text-base leading-relaxed opacity-80 whitespace-pre-wrap" style={{ color: textColor }}>
                {item.description}
              </p>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold border opacity-60"
                    style={{ borderColor: `${textColor}20`, color: textColor }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Play className="w-5 h-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Content Mode Active</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>{isReel ? "Watching" : isMusic ? "Listening" : "Viewing"} Mode</p>
              </div>
            </div>

            {item.external_url && (
              <Button
                className="w-full h-12 rounded-xl font-black uppercase tracking-[0.12em] shadow-xl group"
                style={{ backgroundColor: buttonBg, color: buttonText }}
                onClick={() => window.open(item.external_url, "_blank")}
              >
                {typeMeta.label}
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            )}
            
            <div className="flex items-center justify-center gap-4 opacity-40">
               <div className="h-[1px] flex-1 bg-current" />
               <span className="text-[10px] font-black uppercase tracking-widest">Share this {item.item_type}</span>
               <div className="h-[1px] flex-1 bg-current" />
            </div>
          </div>
        </div>
      );
    }

    if (step === "review") {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ backgroundColor: `${buttonBg}12`, color: buttonBg }}>
              {itemLabel}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold leading-tight tracking-[0.2px]" style={{ color: textColor }}>
              {item.title}
            </h2>
            <p className="text-[11px] uppercase tracking-[0.14em] opacity-55" style={{ color: textColor }}>
              {categoryLabel}
            </p>
            {item.description && (
              <p className="text-sm leading-relaxed opacity-80" style={{ color: textColor }}>
                {item.description}
              </p>
            )}
          </div>

          <div className="rounded-xl border p-3 space-y-2.5" style={{ borderColor: `${textColor}18`, backgroundColor: `${textColor}05` }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-60" style={{ color: textColor }}>
                Quantity
              </span>
              <div className="flex items-center gap-3 rounded-xl p-1.5 border" style={{ borderColor: `${textColor}1F`, backgroundColor: `${textColor}08` }}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center text-lg font-extrabold">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(99, q + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between opacity-70" style={{ color: textColor }}>
                <span>Unit price</span>
                <span>${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between opacity-70" style={{ color: textColor }}>
                <span>Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg pt-1" style={{ color: buttonBg }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={() => setStep("details")}>
            {primaryCtaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      );
    }

    if (step === "details") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-80 transition-opacity" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border backdrop-blur-xl text-sm outline-none focus:ring-1 focus:ring-current/20 font-bold transition-all shadow-sm"
                style={{ borderColor: `${textColor}1A`, backgroundColor: `${textColor}04`, color: textColor }}
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-80 transition-opacity" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border backdrop-blur-xl text-sm outline-none focus:ring-1 focus:ring-current/20 font-bold transition-all shadow-sm"
                style={{ borderColor: `${textColor}1A`, backgroundColor: `${textColor}04`, color: textColor }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-80 transition-opacity" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border backdrop-blur-xl text-sm outline-none focus:ring-1 focus:ring-current/20 font-bold transition-all shadow-sm"
                style={{ borderColor: `${textColor}1A`, backgroundColor: `${textColor}04`, color: textColor }}
              />
            </div>
            <div className="relative group">
              <StickyNote className="absolute left-4 top-3 w-4 h-4 opacity-40 group-focus-within:opacity-80 transition-opacity" />
              <textarea
                placeholder="Note (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="w-full min-h-[70px] md:min-h-[64px] pl-10 pr-3 py-2.5 rounded-xl border text-sm outline-none resize-none focus:ring-2 focus:ring-white/20"
                style={{ borderColor: `${textColor}22`, backgroundColor: `${textColor}05`, color: textColor }}
              />
              <div className="text-right text-[10px] opacity-50 mt-1" style={{ color: textColor }}>
                {notes.length}/500
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-3 text-sm" style={{ borderColor: `${textColor}18`, backgroundColor: `${textColor}05`, color: textColor }}>
            <div className="flex justify-between opacity-70">
              <span className="pr-4">{item.title}</span>
              <span>x{quantity}</span>
            </div>
            <div className="flex justify-between font-extrabold mt-1" style={{ color: buttonBg }}>
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button variant="outline" className="h-11 rounded-xl font-bold uppercase tracking-[0.12em] border" onClick={() => setStep("review")} style={{ borderColor: `${textColor}25` }}>
              Back
            </Button>
            <Button className="h-11 rounded-xl font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={goToPayment}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (step === "payment") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] opacity-70" style={{ color: textColor }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Encrypted Checkout
          </div>

          <div className="rounded-xl border p-3 space-y-2 text-sm" style={{ borderColor: `${textColor}18`, backgroundColor: `${textColor}05`, color: textColor }}>
            <div className="flex justify-between gap-3 opacity-70">
              <span>Item</span>
              <span className="text-right max-w-[60%] truncate">{item.title}</span>
            </div>
            <div className="flex justify-between gap-3 opacity-70">
              <span>Quantity</span>
              <span className="text-right">{quantity}</span>
            </div>
            <div className="flex justify-between gap-3 opacity-70">
              <span>Customer</span>
              <span className="text-right max-w-[60%] truncate">{name}</span>
            </div>
            <div className="flex justify-between gap-3 opacity-70">
              <span>Email</span>
              <span className="text-right max-w-[60%] truncate">{email}</span>
            </div>
            <div className="flex justify-between font-extrabold text-lg pt-1" style={{ color: buttonBg }}>
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button variant="outline" className="h-11 rounded-xl font-bold uppercase tracking-[0.12em] border" onClick={() => setStep("details")} style={{ borderColor: `${textColor}25` }}>
              Back
            </Button>
            <Button disabled={isSubmitting} className="h-11 rounded-xl font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={placeOrder}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${primaryCtaLabel}`}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/15">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: textColor }}>
          {flowLabel} Confirmed
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Your {flowLabel.toLowerCase()} has been received. Confirmation emails have been sent.
        </p>
        <div className="rounded-xl border p-3 text-left text-sm" style={{ borderColor: `${textColor}18`, backgroundColor: `${textColor}05`, color: textColor }}>
          <div className="flex justify-between opacity-70">
            <span>Reference</span>
            <span className="font-bold">{orderRef}</span>
          </div>
          <div className="flex justify-between opacity-70 mt-1">
            <span>Total</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={onClose}>
          Done
        </Button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/72 backdrop-blur-md" />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(96vw,1140px)] max-h-[92vh] overflow-y-auto overflow-x-hidden md:h-[min(88vh,720px)] md:max-h-[min(88vh,720px)] md:overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] md:rounded-[2.2rem] shadow-2xl"
        style={{
          backgroundColor: cardBg || "#ffffff",
          border: `1px solid ${textColor}15`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg"
          style={{ backgroundColor: `${buttonBg}20`, color: textColor }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:h-full">
          <div className="order-2 md:order-1 p-4 sm:p-5 md:p-6 border-t md:border-t-0 md:border-r border-border/10 min-w-0 md:h-full md:flex md:flex-col">
            {!isContent && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 rounded-xl p-1 border" style={{ borderColor: `${textColor}1A`, backgroundColor: `${textColor}06` }}>
                  {steps.map((s, i) => {
                    const active = i <= stepIndex;
                    return (
                      <div
                        key={s.key}
                        className={cn(
                          "h-7 flex-1 min-w-0 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center transition-all",
                          active ? "opacity-100" : "opacity-45"
                        )}
                        style={{
                          backgroundColor: active ? `${buttonBg}16` : `${textColor}10`,
                          color: active ? buttonBg : textColor,
                        }}
                      >
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isContent && (
              <div className="mb-3.5">
                <p className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-60" style={{ color: textColor }}>
                  {activeHeading.title}
                </p>
                <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                  {activeHeading.subtitle}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="md:flex-1">
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-1 md:order-2 p-3 sm:p-4 md:p-5 bg-muted/20 border-b md:border-b-0 md:border-l border-border/10 min-w-0 md:h-full md:flex md:flex-col overflow-y-auto">
            <div className={cn("relative w-full rounded-2xl bg-muted overflow-hidden group/media shrink-0 border shadow-2xl transition-all duration-500", 
              isReel ? "aspect-[9/16] h-[min(65vh,520px)] mx-auto" : "h-[220px] sm:h-[270px] md:h-[360px]")} 
              style={{ borderColor: `${textColor}1A` }}>
              <AnimatePresence mode="wait">
                {media.length > 0 ? (
                  <motion.div key={activeMediaIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                                        {activeIsVideo ? (
                      <div className="w-full h-full">
                        {activeVideoMode === "embed" ? (
                          <iframe
                            src={activeEmbedUrl || undefined}
                            className="w-full h-full border-none"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        ) : activeVideoMode === "file" ? (
                          <video src={activeMedia?.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center" style={{ color: textColor }}>
                            <p className="text-xs opacity-80">Preview not supported for this video URL.</p>
                            <a
                              href={activeMedia?.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-bold"
                              style={{ backgroundColor: buttonBg, color: buttonText }}
                            >
                              Open Video
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <img src={activeMedia?.url} className="w-full h-full object-cover" alt="" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-black/30 via-black/15 to-transparent flex items-end p-4">
                      <p className="text-sm font-semibold opacity-85" style={{ color: textColor }}>
                        Media preview unavailable
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {media.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2 opacity-0 group-hover/media:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveMediaIndex((i) => (i - 1 + media.length) % media.length)}
                      className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 opacity-0 group-hover/media:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveMediaIndex((i) => (i + 1) % media.length)}
                      className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
            </div>

            <div className="mt-3.5 space-y-1.5 md:flex-1">
              <p className="text-xs uppercase tracking-[0.12em] opacity-60" style={{ color: textColor }}>
                {categoryLabel}
              </p>
              <h4 className="text-lg sm:text-xl font-extrabold leading-snug" style={{ color: textColor }}>
                {item.title}
              </h4>
              <p className="text-sm opacity-75 line-clamp-2" style={{ color: textColor }}>
                {item.description || (isContent ? `Explore this ${item.item_type} content.` : `Complete ${flowLabel.toLowerCase()} details and confirm securely in the next steps.`)}
              </p>
              {!isContent && (
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-65" style={{ color: textColor }}>
                    {activeMediaIndex + 1} / {Math.max(media.length, 1)} media
                  </span>
                  <span className="text-2xl font-extrabold" style={{ color: buttonBg }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {media.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {media.map((m, i) => (
                  <button
                    key={`thumb-${i}`}
                    onClick={() => setActiveMediaIndex(i)}
                    className={cn(
                      "w-16 h-11 rounded-lg border overflow-hidden shrink-0 transition-all",
                      activeMediaIndex === i ? "border-white ring-1 ring-white/60" : "border-white/30 opacity-80 hover:opacity-100"
                    )}
                  >
                    {m.type === "image" ? (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/60 text-white text-[10px] font-bold grid place-items-center">VIDEO</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CatalogItemDetail;
