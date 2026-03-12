import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PublicCartFooterProps {
  buttonBg: string;
  buttonText: string;
  onCheckout: () => void;
}

const PublicCartFooter = ({ buttonBg, buttonText, onCheckout }: PublicCartFooterProps) => {
  const { totalItems, totalPrice } = useCartStore();
  const count = totalItems();
  const total = totalPrice();
  const [hideForModal, setHideForModal] = useState(false);

  useEffect(() => {
    const handleModalState = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      setHideForModal(Boolean(customEvent.detail?.open));
    };
    window.addEventListener("catalog-modal-state", handleModalState as EventListener);
    return () => {
      window.removeEventListener("catalog-modal-state", handleModalState as EventListener);
    };
  }, []);

  if (count === 0 || hideForModal) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-[520px]"
    >
      <div 
        className="bg-background/90 backdrop-blur-2xl border border-border/50 rounded-[18px] p-3 shadow-2xl flex items-center justify-between gap-3"
        style={{ boxShadow: `0 20px 50px -12px ${buttonBg}20` }}
      >
        <div className="flex items-center gap-3 pl-1">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
            >
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-background"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {count}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Cart</span>
            <span className="text-lg font-black leading-none">${total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          className="h-11 px-5 sm:px-6 rounded-xl font-black uppercase tracking-[0.14em] text-xs sm:text-sm group transition-all hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: "#ffffff", color: "#111111" }}
        >
          Review & Pay
          <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PublicCartFooter;

