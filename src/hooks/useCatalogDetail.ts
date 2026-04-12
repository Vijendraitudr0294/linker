import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCheckoutStepLabels, resolveItemCtaLabel } from "@/lib/commerceConfig";
import { parseCatalogCategory } from "@/lib/catalogCategory";
import { useRazorpay } from "@/hooks/useRazorpay";
import { usePaymentStore } from "@/stores/paymentStore";
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
} from "@/components/public/catalog/CatalogDetailUtils";

export const useCatalogDetail = ({ item, profileUserId, settings }: any) => {
  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [step, setStep] = useState<StepKey>("review");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { initiatePayment } = useRazorpay();
  const { settings: paymentSettings, fetchSettings: fetchPaymentSettings } = usePaymentStore();

  useEffect(() => {
    fetchPaymentSettings();
  }, [fetchPaymentSettings]);

  const parsedCategory = useMemo(() => parseCatalogCategory(item.category), [item.category]);
  const categoryLabel = parsedCategory.subcategory ? `${parsedCategory.primary} / ${parsedCategory.subcategory}` : parsedCategory.primary;

  const media = useMemo(() => {
    let items = (item.media && item.media.length > 0) ? [...item.media] : [];
    
    // If no media but external URL is a video, use it
    const externalVideoUrl = toEmbedVideoUrl(item.external_url || "");
    const isHtmlEmbed = isEmbedCode(item.external_url || "");

    if ((externalVideoUrl || isHtmlEmbed) && !items.some(m => m.type === "video")) {
      items.unshift({ type: "video" as const, url: item.external_url || "" });
    }

    if (items.length === 0 && item.image_url) {
      items.push({ type: "image" as const, url: item.image_url });
    } else if (items.length === 0 && item.external_url) {
      const ytThumb = getYouTubeThumbnail(item.external_url);
      if (ytThumb) {
        items.push({ type: "image" as const, url: ytThumb });
      }
    }
    
    return items;
  }, [item.image_url, item.media, item.external_url]);

  const activeMedia = media[activeMediaIndex];
  const activeEmbedUrl = activeMedia ? toEmbedVideoUrl(activeMedia.url) : null;
  const activeVideoMode = !activeMedia
    ? "none"
    : activeEmbedUrl
    ? "embed"
    : isEmbedCode(activeMedia.url)
    ? "html"
    : isDirectVideoFile(activeMedia.url)
    ? "file"
    : activeMedia.type === "video"
    ? "external"
    : "none";
  const activeIsVideo = activeVideoMode !== "none";

  useEffect(() => {
    if (media.length > 1) {
      const interval = setInterval(() => {
        setActiveMediaIndex((i) => (i + 1) % media.length);
      }, 3200);
      return () => clearInterval(interval);
    }
  }, [media.length]);

  useEffect(() => {
    if (activeMediaIndex >= media.length && media.length > 0) {
      setActiveMediaIndex(0);
    }
  }, [activeMediaIndex, media.length]);

  const isContent = CONTENT_TYPES.has(item.item_type);
  const isReel = item.item_type === "reel";
  const isMusic = item.item_type === "music";

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

      // Designer Fix: Financial Stream Orchestration
      const rzpKey = paymentSettings?.razorpay_key_id || settings?.razorpay_key_id;
      
      if (rzpKey && unitPrice > 0) {
        initiatePayment({
          key: rzpKey,
          amount: subtotal * 100, // Razorpay uses paisa/cents
          currency: paymentSettings?.currency || "INR",
          name: "Biotra Checkout",
          description: `Order ${orderRef} - ${item.title}`,
          prefill: { name, email, contact: phone },
          handler: async (response: any) => {
            console.log("💰 Payment Success:", response.razorpay_payment_id);
            
            // Mark order as paid
            await supabase
              .from("catalog_orders")
              .update({ 
                status: "paid", 
                payment_id: response.razorpay_payment_id 
              })
              .eq("id", orderData.id);

            // Record transaction
            await supabase.from("user_activity_logs").insert({
              user_id: profileUserId,
              action: "sale",
              metadata: { 
                item_id: item.id, 
                amount: subtotal, 
                payment_id: response.razorpay_payment_id 
              }
            });

            setStep("success");
          }
        });
      } else {
        // Fallback: Lead Generation Mode
        setStep("success");
      }

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
    } catch (err) {
      console.error(err);
      toast.error(`Failed to place ${flowLabel.toLowerCase()}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
