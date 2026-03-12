import { Link, useNavigate } from "react-router-dom";
import { useMemo, useMemo as useReactMemo, useState } from "react";
import { Eye, Lock, Mail, User, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = useReactMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const passwordValid =
    passwordChecks.length && passwordChecks.upper && passwordChecks.lower && passwordChecks.digit && passwordChecks.special;

  const apiBaseUrl = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    return (fromEnv || "http://localhost:5000").replace(/\/$/, "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Missing details", { description: "Please fill in all required fields." });
      return;
    }
    if (!passwordValid) {
      toast("Weak password", {
        description: "Use at least 8 chars with upper, lower, number and symbol.",
      });
      return;
    }
    if (password !== confirm) {
      toast("Passwords do not match", { description: "Check your password and confirmation." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Signup failed");
      }

      if (data.token) {
        localStorage.setItem("urbaneye_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("urbaneye_user", JSON.stringify(data.user));
      }

      toast("Account created 🎉", {
        description: `Welcome, ${data.user?.name || name}! Redirecting to dashboard...`,
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast("Signup failed", {
        description: err?.message || "Please try again with a different email.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_#22d3ee_0,_transparent_50%),_radial-gradient(circle_at_bottom,_#a855f7_0,_transparent_55%)]" />
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
            Create an{" "}
            <span className="text-primary font-semibold">
              operator account
            </span>{" "}
            to manage live monitoring and analytics for your city.
          </p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Secure, hashed credentials stored in MongoDB
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Role-ready for command center operators
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Optimized for hackathon demo flows
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
            <h1 className="font-display text-3xl font-bold text-foreground text-center">Create your account</h1>
            <p className="text-sm text-muted-foreground text-center">
              Sign up to access the live UrbanEye dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 border border-border/70">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="Alex Operator"
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirm password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="rounded-lg bg-secondary/40 border border-border/60 px-3 py-2.5 space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Password requirements
              </p>
              {[
                { key: "length", label: "At least 8 characters" },
                { key: "upper", label: "One uppercase letter (A–Z)" },
                { key: "lower", label: "One lowercase letter (a–z)" },
                { key: "digit", label: "One number (0–9)" },
                { key: "special", label: "One symbol (!@#$...)" },
              ].map((rule) => {
                const ok = (passwordChecks as any)[rule.key];
                const Icon = ok ? CheckCircle2 : XCircle;
                return (
                  <div key={rule.key} className="flex items-center gap-2 text-[11px]">
                    <Icon className={`w-3.5 h-3.5 ${ok ? "text-emerald-400" : "text-muted-foreground"}`} />
                    <span className={ok ? "text-emerald-200" : "text-muted-foreground"}>{rule.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </form>

          <p className="text-[11px] text-muted-foreground text-center">
            Passwords are hashed before being stored in MongoDB for this demo.
          </p>
        </div>
      </div>
    </div>
  );
}

