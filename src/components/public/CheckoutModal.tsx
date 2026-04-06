import { useMemo, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { 
  X, ShoppingBag, Plus, Minus, Trash2, 
  ArrowRight, CreditCard, ShieldCheck, Check,
  Loader2, Mail, Phone, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUserId: string;
  buttonBg: string;
  buttonText: string;
  cardBg?: string;
}

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone number is required").max(20),
  notes: z.string().trim().max(500, "Note is too long").optional(),
});

const SERVICE_TYPES = new Set(["service", "car", "boat"]);

const CheckoutModal = ({ 
  isOpen, onClose, profileUserId, buttonBg, buttonText, cardBg 
}: CheckoutModalProps) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const [step, setStep] = useState<"cart" | "info" | "payment" | "success">("cart");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = totalPrice();
  const hasServiceItems = useMemo(() => items.some((i) => SERVICE_TYPES.has(i.item_type || "")), [items]);
  const flowLabel = hasServiceItems ? "Booking" : "Order";

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === "cart") setStep("info");
    else if (step === "info") {
      const result = customerSchema.safeParse({ name, email, phone, notes });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
      setStep("payment");
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      // Create orders for each item (or a combined one if schema allows, but currently it's per item)
      // Actually, let's create a combined notification but separate order rows if needed, 
      // or we can just loop through items.
      
      const notifyPromises: Promise<unknown>[] = [];
      for (const item of items) {
        const { data: orderData, error } = await supabase.from("catalog_orders").insert({
          item_id: item.id,
          profile_user_id: profileUserId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || "",
          notes: notes.trim() || null,
          quantity: item.quantity,
          status: "pending",
        }).select("id").single();

        if (error) throw error;

        // Trigger notification
        notifyPromises.push(supabase.functions.invoke("order-notify", {
          body: { order_id: orderData.id }
        }));
      }

      // Notify owner
      await supabase.from("notifications").insert({
        user_id: profileUserId,
        type: "order",
        title: `New ${flowLabel}`,
        message: `${name} placed a ${flowLabel.toLowerCase()} for ${totalItems()} item(s).`,
        read: false
      });

      const notifyResults = await Promise.allSettled(notifyPromises);
      const emailFailed = notifyResults.some((r) => r.status === "rejected");
      if (emailFailed) {
        toast.warning(`${flowLabel} saved, but one or more emails failed to send.`);
      }

      setStep("success");
      clearCart();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to process ${flowLabel.toLowerCase()}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col"
        style={{ backgroundColor: cardBg || "#ffffff" }}
      >
        {/* Header with Tabs: RESPONSIVE FIX */}
        <div className="border-b border-border/10">
          <div className="flex items-center justify-between pt-6 px-6 sm:pt-8 sm:px-8 pb-4">
             <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Checkout</h2>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 transition-all touch-manipulation">
               <X className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
          
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-1 -webkit-overflow-scrolling-touch">
            {[
              { id: 'cart', label: 'Review' },
              { id: 'info', label: 'Details' },
              { id: 'payment', label: 'Payment' },
              { id: 'success', label: 'Success' }
            ].map((t) => (
              <div 
                key={t.id} 
                className={cn(
                  "flex-shrink-0 px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] border-b-2 transition-all",
                  step === t.id ? "opacity-100" : "opacity-30",
                  "min-[480px]:flex-1 text-center"
                )}
                style={{ borderBottomColor: step === t.id ? buttonBg : 'transparent' }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === "cart" && (
              <motion.div 
                key="cart"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-muted/30 border border-border/5 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
                      <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm uppercase tracking-tight truncate">{item.title}</h4>
                        <button onClick={() => removeItem(item.id)} className="p-1 text-destructive/40 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-end justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[clamp(0.82rem,2vw,0.9rem)] font-medium opacity-60"> {/* RESPONSIVE FIX */}
                            <span>${(item.price || 0).toFixed(2)}</span>
                            <span>×</span>
                            <span>{item.quantity}</span>
                          </div>
                          <p className="text-[clamp(0.95rem,2.5vw,1.1rem)] font-bold" style={{ color: buttonBg }}>${((item.price || 0) * item.quantity).toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-2 bg-background rounded-full p-1 border border-border/10 shrink-0"> {/* RESPONSIVE FIX: Quantity controls */}
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-11 h-11 flex items-center justify-center hover:bg-muted rounded-full transition-all touch-manipulation"><Minus className="w-4 h-4" /></button>
                          <span className="text-[clamp(1rem,3vw,1.2rem)] font-black min-w-[32px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-muted rounded-full transition-all touch-manipulation"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === "info" && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 py-4"
              >
                <div className="space-y-5">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input 
                      type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-16 pl-12 pr-6 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 transition-all outline-none font-bold min-h-[44px]"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input 
                      type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-16 pl-12 pr-6 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 transition-all outline-none font-bold min-h-[44px]"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input 
                      type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-16 pl-12 pr-6 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 transition-all outline-none font-bold min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest opacity-60 ml-1">Note (optional)</Label>
                    <textarea
                      placeholder="Any request, preferred time, delivery note..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      className="w-full min-h-[100px] p-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary/20 transition-all outline-none font-medium text-sm resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 text-center py-10"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black uppercase tracking-tighter mb-2">Secure Payment</h3> {/* RESPONSIVE FIX */}
                  <p className="opacity-40 text-xs font-bold uppercase tracking-widest">Complete your {flowLabel.toLowerCase()} of ${total.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-center gap-4 py-4 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Direct Checkout</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10 text-center py-12"
              >
                <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                  <Check className="w-16 h-16 text-green-500" />
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Confirmed!</h3>
                  <p className="opacity-60 text-lg font-medium max-w-[340px] mx-auto">Your {flowLabel.toLowerCase()} has been placed. The owner was notified.</p>
                </div>
                <Button className="w-full h-16 rounded-full font-black uppercase tracking-widest text-[clamp(0.75rem,2vw,0.85rem)]" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={onClose}> {/* RESPONSIVE FIX */}
                  Back to Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info/controls: RESPONSIVE FIX - Sticky */}
        {step !== "success" && (
          <div className="p-6 sm:p-8 border-t border-border/10 bg-muted/10 sticky bottom-0 z-10 space-y-5">
            <div className="space-y-3">
               <div className="flex justify-between items-center px-1 text-[clamp(0.82rem,2vw,0.9rem)] opacity-60 font-medium">
                 <span>Subtotal ({totalItems()} items)</span>
                 <span>${total.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center px-1">
                 <span className="text-sm font-black uppercase tracking-widest opacity-40">Total Amount</span>
                 <span className="text-[clamp(1.5rem,5vw,1.8rem)] font-black" style={{ color: buttonBg }}>${total.toFixed(2)}</span>
               </div>
            </div>
            
            <div className="flex gap-3">
              {step !== "cart" && (
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-16 flex-1 rounded-full font-black uppercase tracking-widest border-2 text-[clamp(0.75rem,2vw,0.85rem)]"
                  onClick={() => setStep(step === "info" ? "cart" : "info")}
                >
                  Back
                </Button>
              )}
              <Button
                disabled={isSubmitting}
                className="h-14 sm:h-16 flex-[2] rounded-full font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] text-[clamp(0.75rem,2vw,0.85rem)] p-[clamp(12px,3vw,16px)]" /* RESPONSIVE FIX */
                style={{ backgroundColor: buttonBg, color: buttonText }}
                onClick={step === "payment" ? handleConfirmOrder : handleNext}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {step === "payment" ? `Confirm ${flowLabel}` : "Continue"}
                    <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CheckoutModal;
