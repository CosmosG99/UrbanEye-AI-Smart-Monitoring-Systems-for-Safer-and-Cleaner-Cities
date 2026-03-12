import { Link } from "react-router-dom";
import { Eye, BarChart3, Map, Shield, ArrowRight, Activity, Users, Camera } from "lucide-react";
import heroImage from "@/assets/hero-city.jpg";

const features = [
  { icon: Camera, title: "Live Monitoring", desc: "YOLO-powered real-time crowd detection from camera feeds" },
  { icon: BarChart3, title: "AI Predictions", desc: "ML models predicting crowd density using historical data" },
  { icon: Map, title: "Smart Tourism Map", desc: "Interactive map with crowd indicators and route suggestions" },
  { icon: Shield, title: "Safety & Cleanliness", desc: "AI detection of safety risks and environmental issues" },
];

const stats = [
  { value: "6", label: "Active Cameras" },
  { value: "24/7", label: "Monitoring" },
  { value: "95%", label: "Detection Accuracy" },
  { value: "< 2s", label: "Response Time" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">UrbanEye</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#tech" className="hover:text-foreground transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImage} alt="Smart city AI monitoring" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Activity className="w-3 h-3" />
              AI-Powered Smart City Platform
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Smarter Cities,{" "}
              <span className="gradient-text">Safer Tourism</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl leading-relaxed">
              UrbanEye uses AI and Computer Vision to detect, monitor, and predict crowd levels at tourist locations — 
              helping authorities manage flow and visitors discover less crowded spots.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-primary"
              >
                View Live Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                Explore Smart Tourism
                <Map className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-6 text-center">
              <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground">Intelligent Monitoring Features</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Comprehensive AI-powered tools for safer, cleaner, and better-managed tourist destinations.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section id="tech" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-destructive mb-3">The Problem</h3>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Overcrowding Threatens Tourism</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tourist destinations face traffic congestion, safety risks, environmental damage, and poor visitor experiences.
              Authorities lack intelligent systems to monitor and predict crowd levels in real time.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-success mb-3">Our Solution</h3>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">AI-Powered Crowd Intelligence</h2>
            <p className="text-muted-foreground leading-relaxed">
              UrbanEye combines YOLO-based computer vision with predictive ML models to provide real-time crowd monitoring,
              density predictions, and smart recommendations for both authorities and tourists.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-foreground">Ready to Monitor Smarter?</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Explore the live dashboard and see AI-powered crowd monitoring in action.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-primary"
            >
              Log in
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 UrbanEye — AI for Smart Communities & Governance</p>
          <p>Built for Hackathon Demo</p>
        </div>
      </footer>
    </div>
  );
}
