import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      toast.success("Account created! Welcome to BIOTRA.");
      navigate("/welcome");
    } else {
      toast.error(result.error || "Registration failed");
    }
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
            Join the <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">high-performance</span>
            <br /> movement.
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-md font-medium leading-relaxed">
            The platform built for creators who demand more from their digital real estate. Simple setup, limitless scale.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[32px] glass-card p-6 group hover:border-primary/30 transition-all duration-500">
              <Sparkles className="w-6 h-6 mb-3 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Impact</p>
              <p className="text-[15px] font-black text-foreground">Premium Design</p>
            </div>
            <div className="rounded-[32px] glass-card p-6 group hover:border-blue-500/30 transition-all duration-500">
              <Zap className="w-6 h-6 mb-3 text-blue-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Speed</p>
              <p className="text-[15px] font-black text-foreground">Instant Sync</p>
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
            <h1 className="text-[40px] font-black tracking-tighter text-foreground leading-none">Apply for access</h1>
            <p className="text-muted-foreground font-medium text-[15px]">Create your hub in less than 60 seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Creator Identity</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Biotra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 rounded-2xl bg-white/[0.03] border-white/10 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white/[0.05] focus:border-primary/40 focus:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Email Hub</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@vertex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-white/[0.03] border-white/10 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white/[0.05] focus:border-primary/40 focus:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Secure Key</Label>
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
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 text-base font-black rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4" disabled={loading}>
              {loading ? "Provisioning..." : "Initialize Hub"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-[13px] font-bold text-muted-foreground pt-4">
            Already a member?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2 decoration-primary/20">
              Enter terminal
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
