import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { isAdminRole } from "@/lib/authRoles";
import { beginOAuthSignIn, getDefaultOAuthRedirectUrl, getOAuthErrorMessage } from "@/lib/oauth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first");
      return;
    }
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const url = await beginOAuthSignIn({
        authClient: supabase.auth,
        provider: "google",
        redirectTo: getDefaultOAuthRedirectUrl(),
      });
      window.location.assign(url);
    } catch (err: any) {
      toast.error(getOAuthErrorMessage("Google", err));
      setLoading(false);
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
    try {
      const result = await login(trimmedEmail, password);

      if (!result.success) {
        setLoading(false);
        toast.error(result.error || "Login failed");
        if (result.error?.toLowerCase().includes("email not confirmed") || result.error?.toLowerCase().includes("verify")) {
          setShowResend(true);
        }
        return;
      }

      const profile = useAuthStore.getState().user;

      if (isAdminRole(profile?.role)) {
        setLoading(false);
        toast.success("Welcome back!");
        navigate("/dashboard/admin");
        return;
      }

      setLoading(false);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      toast.error("An unexpected error occurred during login");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen grid lg:grid-cols-2 overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#F0F2F5] text-black selection:bg-emerald-400 selection:text-black font-sans antialiased">
      <div className="relative hidden lg:flex flex-col bg-white border-r-8 border-black p-8 xl:p-12 justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-400 border-4 border-black rounded-[8px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
          <span className="text-2xl font-[1000] tracking-tighter leading-none uppercase italic">BIOTRA</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ rotate: -2, x: -10 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black rounded-[8px] text-[10px] font-black uppercase tracking-widest mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-3 h-3" /> Safe Login
          </motion.div>

          <h2 className="text-5xl xl:text-6xl font-[1000] leading-[0.9] tracking-tighter mb-8 uppercase italic">
            Grow <br />
            your <span className="bg-emerald-400 px-4 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">Page.</span>
          </h2>

          <div className="space-y-5 max-w-md">
            <div className="flex items-start gap-5 p-5 bg-white border-4 border-black rounded-[16px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <div className="w-14 h-14 bg-pink-400 border-4 border-black rounded-[12px] flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <ShieldCheck className="w-8 h-8 text-black stroke-[3]" />
              </div>
              <div>
                <p className="font-[1000] text-sm uppercase tracking-widest mb-2">Secure Account</p>
                <p className="text-xs font-black text-black/50 uppercase leading-snug">Your login and data are protected.</p>
              </div>
            </div>
            <div className="flex items-start gap-5 p-5 bg-white border-4 border-black rounded-[16px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <div className="w-14 h-14 bg-emerald-400 border-4 border-black rounded-[12px] flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Zap className="w-8 h-8 text-black stroke-[3]" />
              </div>
              <div>
                <p className="font-[1000] text-sm uppercase tracking-widest mb-2">Fast Updates</p>
                <p className="text-xs font-black text-black/50 uppercase leading-snug">Changes appear quickly on your page.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 opacity-30 font-[1000] text-[10px] tracking-[0.5em] uppercase">
          Biotra v1.0.0
        </div>
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-[1000] tracking-tighter text-black leading-[0.95] uppercase italic">Welcome Back</h1>
            <p className="text-xs font-[1000] text-black/40 uppercase tracking-[0.12em] leading-relaxed">Sign in to your account.</p>
          </div>

          <div className="space-y-4">
            <Button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="w-full h-14 bg-white text-black border-4 border-black rounded-[12px] font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center justify-center gap-3"
              disabled={loading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-black/10"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-black/20">or email</span>
              <div className="flex-grow border-t-2 border-black/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Email</Label>
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

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Password</Label>
                  <Link to="/forgot-password" title="Recover Access" className="text-[9px] font-black uppercase tracking-widest text-black/20 hover:text-black">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 rounded-[12px] bg-white border-4 border-black px-6 text-sm font-black transition-all focus:bg-emerald-50 focus:border-emerald-400 focus:ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
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

              <Button type="submit" className="w-full h-14 text-base font-black rounded-[12px] bg-black text-white border-4 border-black shadow-[8px_8px_0_0_rgba(16,185,129,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:scale-[0.98] transition-all uppercase tracking-widest" disabled={loading}>
                {loading ? "SIGNING IN..." : "SIGN IN"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2 stroke-[3]" />}
              </Button>

              {showResend && (
                <Button type="button" className="w-full h-12 rounded-[12px] border-4 border-black bg-white font-black text-black hover:bg-emerald-50 transition-all text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]" onClick={handleResend} disabled={resendLoading}>
                  {resendLoading ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
                </Button>
              )}
            </form>
          </div>

          <p className="text-center text-xs font-black uppercase tracking-widest text-black/40">
            NEW HERE?{" "}
            <Link to="/register" className="text-emerald-500 hover:underline decoration-4">
              CREATE ACCOUNT
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
