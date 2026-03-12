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
      toast.success("Account created! Welcome to LinkVertex.");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-orange-500 via-primary to-amber-500 p-10 items-center">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_42%),radial-gradient(circle_at_86%_80%,#fef08a_0%,transparent_38%)]" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 w-full max-w-xl text-primary-foreground"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-5 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            LinkVertex
          </Link>

          <h2 className="text-4xl font-heading font-semibold leading-tight mb-4">
            Start sharing in minutes.
          </h2>
          <p className="text-primary-foreground/85 text-lg max-w-md">
            Build your page, add links, sell products, and turn attention into action.
          </p>
        </motion.div>
      </div>

      <div className="relative flex items-center justify-center p-5 sm:p-8 lg:p-8 bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.08),transparent_35%),radial-gradient(circle_at_90%_80%,hsl(var(--accent)/0.12),transparent_40%)]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="w-full max-w-sm space-y-5"
        >
          <div className="lg:hidden mb-2">
            <Link to="/" className="inline-flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xl font-heading font-bold">LinkVertex</span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-1 text-sm">Get started for free, no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 transition-all duration-200 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 transition-all duration-200 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 transition-all duration-200 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
