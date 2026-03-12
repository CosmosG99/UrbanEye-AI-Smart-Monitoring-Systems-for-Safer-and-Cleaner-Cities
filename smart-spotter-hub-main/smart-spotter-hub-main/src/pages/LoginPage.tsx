import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Eye, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    return (fromEnv || "http://localhost:5000").replace(/\/$/, "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast("Missing details", { description: "Please enter both email and password." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      // Store token for later API calls (simple demo)
      if (data.token) {
        localStorage.setItem("urbaneye_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("urbaneye_user", JSON.stringify(data.user));
      }

      toast("Welcome back 👋", {
        description: `Logged in as ${data.user?.name || data.user?.email || email}`,
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast("Login failed", {
        description: err?.message || "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_#22d3ee_0,_transparent_50%),_radial-gradient(circle_at_bottom,_#6366f1_0,_transparent_55%)]" />
        <div className="relative max-w-md px-10 py-12 glass-card border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">UrbanEye</p>
              <p className="text-sm text-muted-foreground">AI Smart Monitoring Platform</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Monitor{" "}
            <span className="text-primary font-semibold">
              crowds, litter and safety risks
            </span>{" "}
            in real-time across your city.
          </p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live YOLO-based detection from camera feeds
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              AI-powered crowd predictions and peak hours
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Safety & cleanliness scoring for every zone
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 lg:hidden mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">UrbanEye</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground text-center">Sign in to UrbanEye</h1>
            <p className="text-sm text-muted-foreground text-center">
              Access the live monitoring and analytics dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 border border-border/70">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              New to UrbanEye?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </form>

          <p className="text-[11px] text-muted-foreground text-center">
            By continuing you agree to the demo terms for this hackathon prototype.
          </p>
        </div>
      </div>
    </div>
  );
}

