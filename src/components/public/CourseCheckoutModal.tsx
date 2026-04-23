import { useState, useEffect } from "react";
import { X, PlayCircle, BookOpen, ShieldCheck, Loader2, GraduationCap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price: number;
}

interface CourseCheckoutModalProps {
  course: Course;
  profileUserId: string;
  onClose: () => void;
  textColor: string;
  cardBg: string;
  buttonBg: string;
  buttonText: string;
  isBrutalism?: boolean;
}

const CourseCheckoutModal = ({ course, profileUserId, onClose, textColor, cardBg, buttonBg, buttonText, isBrutalism = false }: CourseCheckoutModalProps) => {
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { initiatePayment } = useRazorpay();

  const handleCheckout = async () => {
    if (!name || !email) {
      toast.error("Please fill in your details");
      return;
    }
    setStep("payment");
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      // 1. Get Razorpay Key from creator settings
      const { data: settings } = await supabase
        .from("appearance_settings")
        .select("razorpay_key_id")
        .eq("user_id", profileUserId)
        .maybeSingle();

      const rzpKey = settings?.razorpay_key_id || "rzp_test_default_key"; // Fallback for demo

      initiatePayment({
        key: rzpKey,
        amount: course.price * 100,
        currency: "INR",
        name: course.title,
        description: `Enrollment for ${course.title}`,
        prefill: { name, email },
        handler: async (response: any) => {
          console.log("Course Payment Success:", response);
          
          // Record enrollment
          await supabase.from("course_enrollments").insert({
            course_id: course.id,
            creator_user_id: profileUserId,
            student_name: name,
            student_email: email,
            amount_paid: course.price,
            payment_id: response.razorpay_payment_id,
            status: "completed"
          });

          // Notify creator
          await supabase.from("notifications").insert({
            user_id: profileUserId,
            type: "order",
            title: "New Course Enrollment",
            message: `${name} enrolled in ${course.title}`,
            read: false
          });

          // Record transaction in activity log
          await supabase.from("user_activity_logs").insert({
            user_id: profileUserId,
            action: "sale",
            details: `Course Enrollment: ${course.title} by ${name}`,
            metadata: { 
              type: 'course',
              course_id: course.id, 
              amount: course.price, 
              payment_id: response.razorpay_payment_id 
            }
          });

          setStep("success");
          toast.success("Welcome to the course!");
        }
      });
    } catch (e) {
      toast.error("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-lg overflow-hidden flex flex-col",
          isBrutalism ? "border-4 border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)]" : "rounded-[40px] shadow-2xl"
        )}
        style={{ backgroundColor: cardBg }}
      >
        <div className="p-8 border-b-4 border-black flex items-center justify-between bg-purple-50/50">
           <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 flex items-center justify-center", isBrutalism ? "border-2 border-black" : "rounded-xl")}>
                 <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: textColor }}>Enroll Now</h2>
           </div>
           <button onClick={onClose} className={cn("w-10 h-10 flex items-center justify-center transition-all", isBrutalism ? "border-2 border-black hover:bg-black hover:text-white" : "rounded-full hover:bg-black/5")}>
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-8">
           {step === "details" && (
             <div className="space-y-6">
                <div className={cn("p-4 border-2 border-dashed", isBrutalism ? "border-black bg-black/5" : "rounded-2xl bg-white/50 border-black/10")}>
                   <h3 className="font-black uppercase text-sm mb-1">{course.title}</h3>
                   <p className="text-xs font-bold opacity-40">Complete your details to start learning.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Name</label>
                      <Input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className={cn(
                          "h-12 px-4 font-bold outline-none",
                          isBrutalism ? "border-2 border-black rounded-none" : "rounded-xl border-0 bg-muted"
                        )} 
                        placeholder="John Doe"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Address</label>
                      <Input 
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={cn(
                          "h-12 px-4 font-bold outline-none",
                          isBrutalism ? "border-2 border-black rounded-none" : "rounded-xl border-0 bg-muted"
                        )} 
                        placeholder="john@example.com"
                      />
                   </div>
                </div>

                <div className="pt-4">
                   <Button 
                    onClick={handleCheckout}
                    className={cn(
                      "w-full h-14 font-black uppercase tracking-widest transition-all",
                      isBrutalism ? "border-2 border-black shadow-[4px_4px_0_0_rgba(167,139,250,1)] rounded-none" : "rounded-2xl"
                    )}
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                   >
                      Next Step: Payment
                   </Button>
                </div>
             </div>
           )}

           {step === "payment" && (
             <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 border-dashed">
                   <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase">Secure Checkout</h3>
                   <p className="text-sm font-bold opacity-40">₹{course.price} • One-time Investment</p>
                </div>

                <div className="p-4 bg-black/5 rounded-2xl text-left border-2 border-black">
                   <div className="flex justify-between text-sm font-black uppercase tracking-tight">
                      <span>Total</span>
                      <span>₹{course.price}</span>
                   </div>
                </div>

                <div className="flex gap-4">
                   <Button 
                    onClick={() => setStep("details")}
                    variant="outline"
                    className="flex-1 h-14 border-2 border-black rounded-xl font-black uppercase"
                   >
                      Back
                   </Button>
                   <Button 
                    onClick={processPayment}
                    disabled={loading}
                    className="flex-2 h-14 bg-black text-white border-2 border-black rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(16,185,129,1)]"
                   >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay & Enroll"}
                   </Button>
                </div>
             </div>
           )}

           {step === "success" && (
             <div className="space-y-6 text-center py-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                   <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">Access Granted!</h3>
                   <p className="text-sm font-bold opacity-40 mt-2">Check your email for the course login link.</p>
                </div>
                <Button 
                  onClick={onClose}
                  className="w-full h-14 bg-black text-white border-2 border-black rounded-xl font-black uppercase tracking-widest"
                >
                  Start Learning
                </Button>
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseCheckoutModal;
