import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { toast.error("Please enter your email"); return; }
    if (!password) { toast.error("Please enter your password"); return; }
    setLoading(true);
    const result = await login(trimmedEmail, password);
    if (!result.success) {
      setLoading(false);
      toast.error(result.error || "Login failed");
      return;
    }

    // Verify superadmin role
    const { data: { user } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
    if (user) {
      const profile = await fetchProfile(user.id);
      if (profile?.role !== "superadmin") {
        await useAuthStore.getState().logout();
        setLoading(false);
        toast.error("Access denied. Super Admin credentials required.");
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome back, Super Admin!");
    navigate("/dashboard/admin");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - admin branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-accent blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-heading font-bold text-white">LinkVertex</span>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Super Management</p>
            </div>
          </div>
          <h2 className="text-3xl font-heading font-semibold text-white mb-4">
            Platform Control Center
          </h2>
          <p className="text-slate-400 text-lg">
            Manage users, monitor analytics, and control platform settings from a single dashboard.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "User Management", desc: "Block, edit, manage roles" },
              { label: "Platform Settings", desc: "Features, notifications" },
              { label: "Analytics Overview", desc: "Views, clicks, orders" },
              { label: "Content Moderation", desc: "Review & manage content" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xl font-heading font-bold text-foreground">LinkVertex</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>
          </div>

          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">Admin Sign In</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter your admin credentials to access the control panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@linkvertex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying…" : "Access Control Panel"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">User login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
