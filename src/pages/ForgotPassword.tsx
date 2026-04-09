import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPublicSiteUrl } from "@/lib/publicUrl";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    const publicSiteUrl = getPublicSiteUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${publicSiteUrl}/login`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to send reset link");
      return;
    }

    setSent(true);
    toast.success("Reset link sent. Check your email.");
  };

  return (
    <div className="min-h-screen lg:h-screen grid lg:grid-cols-2 overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#F0F2F5] text-black selection:bg-emerald-400 selection:text-black font-sans antialiased">
      <div className="relative hidden lg:flex flex-col bg-white border-r-8 border-black p-8 xl:p-12 justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-400 border-4 border-black rounded-[8px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
          <span className="text-2xl font-[1000] tracking-tighter leading-none uppercase italic">BIOTRA</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ rotate: -2, x: -10 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black rounded-[8px] text-[10px] font-black uppercase tracking-widest mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-3 h-3" /> Recover Access
          </motion.div>

          <h2 className="text-5xl xl:text-6xl font-[1000] leading-[0.9] tracking-tighter mb-8 uppercase italic">
            Reset <br />
            your <span className="bg-emerald-400 px-4 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">Password.</span>
          </h2>

          <div className="p-5 bg-white border-4 border-black rounded-[16px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">How it works</p>
            <p className="text-sm font-black leading-relaxed">Enter your email. We send a reset link. Open the link and set a new password.</p>
          </div>
        </div>

        <div className="relative z-10 opacity-30 font-[1000] text-[10px] tracking-[0.5em] uppercase">Biotra v1.0.0</div>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-[#F0F2F5]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm md:max-w-md lg:max-w-sm space-y-6 sm:space-y-8"
        >
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black border-2 border-black rounded-[8px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-2xl font-[1000] tracking-tighter uppercase italic">BIOTRA</span>
            </Link>
          </div>

          {!sent ? (
            <>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-[1000] tracking-tighter text-black leading-[0.95] uppercase italic">
                  Reset Password
                </h1>
                <p className="text-xs font-[1000] text-black/40 uppercase tracking-[0.12em] leading-relaxed">
                  Enter your email to get reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-[12px] bg-white border-4 border-black px-6 text-sm font-black transition-all focus:bg-emerald-50 focus:border-emerald-400 focus:ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-black rounded-[12px] bg-black text-white border-4 border-black shadow-[8px_8px_0_0_rgba(16,185,129,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:scale-[0.98] transition-all uppercase tracking-widest"
                  disabled={loading}
                >
                  {loading ? "SENDING..." : "SEND RESET LINK"}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-emerald-400 border-4 border-black rounded-[12px] flex items-center justify-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <Mail className="w-8 h-8 text-black stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-[1000] tracking-tighter uppercase italic">Check Email</h2>
                <p className="text-sm font-black text-black/60 leading-relaxed">
                  We sent reset link to <span className="text-black">{email}</span>.
                </p>
              </div>
            </div>
          )}

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
