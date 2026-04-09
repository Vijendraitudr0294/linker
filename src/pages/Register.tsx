import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Sparkles, Zap, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const result = await register(trimmedName, trimmedEmail, password);
    setLoading(false);

    if (result.success) {
      toast.success("Account created! Welcome to BIOTRA.");
      navigate("/welcome");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen grid lg:grid-cols-2 overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#F0F2F5] text-black selection:bg-pink-400 selection:text-black font-sans antialiased">
      <div className="relative hidden lg:flex flex-col bg-white border-r-8 border-black p-8 xl:p-12 justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-400 border-4 border-black rounded-[8px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
          <span className="text-2xl font-[1000] tracking-tighter leading-none uppercase italic">BIOTRA</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ rotate: 2, scale: 0.9 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-400 border-2 border-black rounded-[8px] text-[10px] font-black uppercase tracking-widest mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-3 h-3" /> New Account
          </motion.div>

          <h2 className="text-5xl xl:text-6xl font-[1000] leading-[0.9] tracking-tighter mb-8 uppercase italic">
            Create <br />
            your <span className="bg-yellow-400 px-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">Profile.</span>
          </h2>

          <div className="grid grid-cols-2 gap-5 max-w-lg">
            <div className="p-5 bg-white border-4 border-black rounded-[16px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col gap-4">
              <div className="w-12 h-12 bg-emerald-400 border-4 border-black rounded-[12px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Globe className="w-7 h-7 text-black stroke-[3]" />
              </div>
              <p className="font-[1000] text-xs uppercase tracking-tight leading-snug text-black">No platform fee on your sales</p>
            </div>
            <div className="p-5 bg-white border-4 border-black rounded-[16px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col gap-4">
              <div className="w-12 h-12 bg-pink-400 border-4 border-black rounded-[12px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Heart className="w-7 h-7 text-black stroke-[3]" />
              </div>
              <p className="font-[1000] text-xs uppercase tracking-tight leading-snug text-black">Customize your page style</p>
            </div>
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

          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-[1000] tracking-tighter text-black leading-[0.95] uppercase italic">Create Account</h1>
            <p className="text-xs font-[1000] text-black/40 uppercase tracking-[0.12em] leading-relaxed">Set up your page in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 rounded-[12px] bg-white border-4 border-black px-6 text-sm font-black transition-all focus:bg-pink-50 focus:border-pink-400 focus:ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-[12px] bg-white border-4 border-black px-6 text-sm font-black transition-all focus:bg-pink-50 focus:border-pink-400 focus:ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-[12px] bg-white border-4 border-black px-6 text-sm font-black transition-all focus:bg-pink-50 focus:border-pink-400 focus:ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[3]" /> : <Eye className="w-5 h-5 stroke-[3]" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-black rounded-[12px] bg-black text-white border-4 border-black shadow-[8px_8px_0_0_rgba(236,72,153,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:scale-[0.98] transition-all uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2 stroke-[3]" />}
            </Button>
          </form>

          <p className="text-center text-xs font-black uppercase tracking-widest text-black/40">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/login" className="text-pink-500 hover:underline decoration-4 text-[11px]">
              SIGN IN
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
