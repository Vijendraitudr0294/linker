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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { usePlatformStore } from "@/stores/platformStore";
import { getCheckoutStepLabels, resolveItemCtaLabel, type CheckoutStepKey } from "@/lib/commerceConfig";

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

type StepKey = CheckoutStepKey;

const SERVICE_TYPES = new Set(["service", "car", "boat"]);

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone number is required").max(20),
  notes: z.string().trim().max(500, "Note is too long").optional(),
});

const stepHeadings: Record<StepKey, { title: string; subtitle: string }> = {
  review: { title: "Review Item", subtitle: "Confirm quantity and pricing" },
  details: { title: "Customer Details", subtitle: "Tell us where to send confirmation" },
  payment: { title: "Secure Payment", subtitle: "Verify summary and place your order" },
  success: { title: "Confirmed", subtitle: "Your request has been submitted" },
};

const CatalogItemDetail = ({
  item,
  profileUserId,
  textColor,
  buttonBg,
  buttonText,
  onClose,
  cardBg,
}: CatalogItemDetailProps) => {
  const settings = usePlatformStore((s) => s.settings);
  const initialized = usePlatformStore((s) => s.initialized);
  const fetchSettings = usePlatformStore((s) => s.fetchSettings);
  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [step, setStep] = useState<StepKey>("review");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const media = item.media && item.media.length > 0 ? item.media : item.image_url ? [{ type: "image" as const, url: item.image_url }] : [];

  useEffect(() => {
    if (media.length > 1) {
      const interval = setInterval(() => {
        setActiveMediaIndex((i) => (i + 1) % media.length);
      }, 3200);
      return () => clearInterval(interval);
    }
  }, [media.length]);

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

  const isService = SERVICE_TYPES.has(item.item_type);
  const flowLabel = isService ? "Booking" : "Order";
  const itemLabel = isService ? "Service" : "Product";
  const checkoutStepLabels = getCheckoutStepLabels(settings);
  const primaryCtaLabel = resolveItemCtaLabel(item.item_type, settings, isService ? "Book Now" : "Buy Now");
  const steps: { key: StepKey; label: string }[] = [
    { key: "review", label: checkoutStepLabels.review },
    { key: "details", label: checkoutStepLabels.details },
    { key: "payment", label: checkoutStepLabels.payment },
    { key: "success", label: checkoutStepLabels.success },
  ];
  const unitPrice = item.price ?? 0;
  const subtotal = unitPrice * quantity;
  const stepIndex = steps.findIndex((s) => s.key === step);
  const orderRef = useMemo(() => `#LV-${item.id.slice(0, 5).toUpperCase()}-${Date.now().toString().slice(-4)}`, [item.id]);
  const activeHeading = {
    title: steps[stepIndex]?.label || stepHeadings[step].title,
    subtitle: stepHeadings[step].subtitle,
  };

  const goToPayment = () => {
    const result = customerSchema.safeParse({ name, email, phone, notes });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setStep("payment");
  };

  const placeOrder = async () => {
    setIsSubmitting(true);
    try {
      const { data: orderData, error } = await supabase
        .from("catalog_orders")
        .insert({
          item_id: item.id,
          profile_user_id: profileUserId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          notes: notes.trim() || null,
          quantity,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: profileUserId,
        type: "order",
        title: `New ${flowLabel}`,
        message: `${name} placed a ${flowLabel.toLowerCase()} for ${item.title}.`,
        read: false,
      });

      const notify = await supabase.functions.invoke("order-notify", {
        body: { order_id: orderData.id },
      });
      if (notify.error) {
        toast.warning(`${flowLabel} placed, but email notification failed.`);
      }

      setStep("success");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to place ${flowLabel.toLowerCase()}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
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
              {item.category}
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-white/20"
                style={{ borderColor: `${textColor}22`, backgroundColor: `${textColor}05`, color: textColor }}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-white/20"
                style={{ borderColor: `${textColor}22`, backgroundColor: `${textColor}05`, color: textColor }}
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-white/20"
                style={{ borderColor: `${textColor}22`, backgroundColor: `${textColor}05`, color: textColor }}
              />
            </div>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 w-4 h-4 opacity-50" />
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

            <div className="mb-3.5">
              <p className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-60" style={{ color: textColor }}>
                {activeHeading.title}
              </p>
              <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                {activeHeading.subtitle}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="md:flex-1">
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-1 md:order-2 p-3 sm:p-4 md:p-5 bg-muted/20 border-b md:border-b-0 md:border-l border-border/10 min-w-0 md:h-full md:flex md:flex-col">
            <div className="relative w-full h-[220px] sm:h-[270px] md:h-[360px] rounded-2xl bg-muted overflow-hidden group/media shrink-0 border" style={{ borderColor: `${textColor}1A` }}>
              <AnimatePresence mode="wait">
                {media.length > 0 ? (
                  <motion.div key={activeMediaIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                    {media[activeMediaIndex].type === "video" ||
                    media[activeMediaIndex].url.includes("youtube.com") ||
                    media[activeMediaIndex].url.includes("vimeo.com") ? (
                      <div className="w-full h-full">
                        {media[activeMediaIndex].url.includes("youtube.com") || media[activeMediaIndex].url.includes("vimeo.com") ? (
                          <iframe
                            src={media[activeMediaIndex].url.includes("youtube.com") ? media[activeMediaIndex].url.replace("watch?v=", "embed/") : media[activeMediaIndex].url}
                            className="w-full h-full border-none"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        ) : (
                          <video src={media[activeMediaIndex].url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <img src={media[activeMediaIndex].url} className="w-full h-full object-cover" alt="" />
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
                {item.category}
              </p>
              <h4 className="text-lg sm:text-xl font-extrabold leading-snug" style={{ color: textColor }}>
                {item.title}
              </h4>
              <p className="text-sm opacity-75 line-clamp-2" style={{ color: textColor }}>
                {item.description || `Complete ${flowLabel.toLowerCase()} details and confirm securely in the next steps.`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-65" style={{ color: textColor }}>
                  {activeMediaIndex + 1} / {Math.max(media.length, 1)} media
                </span>
                <span className="text-2xl font-extrabold" style={{ color: buttonBg }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
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
