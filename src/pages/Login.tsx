import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Sparkles, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const reduceMotion = useReducedMotion();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first");
      return;
    }
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    setResendLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email resent. Please check your inbox.");
      setShowResend(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    setShowResend(false);
    const result = await login(email, password);
    
    if (!result.success) {
      setLoading(false);
      toast.error(result.error || "Login failed");
      if (result.error?.toLowerCase().includes("email not confirmed") || result.error?.toLowerCase().includes("verify")) {
        setShowResend(true);
      }
      return;
    }

    // Access the user from store state directly (already set by login function)
    const profile = useAuthStore.getState().user;

    if (profile?.role === "superadmin") {
      setLoading(false);
      toast.success("Welcome, Super Admin!");
      navigate("/dashboard/admin");
      return;
    }

    setLoading(false);
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#040406] text-white selection:bg-primary/30 selection:text-white">
      {/* Left panel - PREMIUM DARK AESTHETIC */}
      <div className="relative hidden lg:flex overflow-hidden bg-black/40 p-16 items-center">
        <style>{`
          .gradient-glow-1 { background: radial-gradient(circle, #f25f30 0%, transparent 70%); }
          .gradient-glow-2 { background: radial-gradient(circle, #0079FF 0%, transparent 70%); }
          .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); }
        `}</style>
        
        <div className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] gradient-glow-1 opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] gradient-glow-2 opacity-15 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-10 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/5 group-hover:scale-110 transition-transform duration-500">
               <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground leading-none">
               BIOTRA
            </span>
          </Link>

          <h2 className="text-[56px] font-black leading-[0.9] mb-6 tracking-tighter">
            Build your <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">high-performance</span>
            <br /> identity hub.
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-md font-medium leading-relaxed">
            The professional standard for digital orchestration. Every link, every product, one workspace.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-[32px] glass-card p-6 group hover:border-primary/30 transition-all duration-500">
              <Users className="w-6 h-6 mb-3 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Scale</p>
              <p className="text-[15px] font-black text-foreground">52k Active</p>
            </div>
            <div className="rounded-[32px] glass-card p-6 group hover:border-blue-500/30 transition-all duration-500">
              <TrendingUp className="w-6 h-6 mb-3 text-blue-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Impact</p>
              <p className="text-[15px] font-black text-foreground">Real-time</p>
            </div>
            <div className="rounded-[32px] glass-card p-6 group hover:border-purple-500/30 transition-all duration-500">
              <CheckCircle2 className="w-6 h-6 mb-3 text-purple-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Verify</p>
              <p className="text-[15px] font-black text-foreground">Production</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-8 sm:p-20 relative overflow-hidden bg-[#040406]">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] gradient-glow-2 opacity-[0.05] pointer-events-none" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-black tracking-tighter">BIOTRA</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-[40px] font-black tracking-tighter text-foreground leading-none">Welcome back</h1>
            <p className="text-muted-foreground font-medium text-[15px]">Sign in to manage your digital hub.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Email Orchestrator</Label>
              <Input
                id="email"
                type="email"
                placeholder="architect@biotra.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-white/[0.03] border-white/10 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white/[0.05] focus:border-primary/40 focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Access Key</Label>
                <Link to="/forgot-password" title="Recover Access" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors">
                  Recovery
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/[0.03] border-white/10 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white/[0.05] focus:border-primary/40 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide access key" : "Show access key"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 text-base font-black rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ring-4 ring-primary/5" disabled={loading}>
              {loading ? "Authenticating..." : "Establish Connection"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
            {showResend && (
               <Button type="button" variant="outline" className="w-full h-14 rounded-2xl mt-2 font-black border-dashed border-red-500/30 text-red-500 hover:bg-red-500/5 transition-all text-[12px] uppercase tracking-widest" onClick={handleResend} disabled={resendLoading}>
                   {resendLoading ? "Retransmitting..." : "Resend Verification Key"}
               </Button>
            )}
          </form>

          <p className="text-center text-[13px] font-bold text-muted-foreground pt-4">
            New to Biotra?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2 decoration-primary/20">
              Apply for access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

