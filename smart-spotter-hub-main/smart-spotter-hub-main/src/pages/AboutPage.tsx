import { Eye, Brain, BarChart3, Camera, Mail } from "lucide-react";
import { teamMembers } from "@/data/mockData";

const techStack = [
  { category: "Frontend", items: ["React", "TailwindCSS", "Recharts"] },
  { category: "AI / ML", items: ["YOLOv8", "TensorFlow", "Scikit-learn", "OpenCV"] },
  { category: "Backend", items: ["Node.js", "FastAPI", "MongoDB"] },
  { category: "APIs", items: ["Google Maps API", "Google Places API"] },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">About UrbanEye</h1>
        <p className="text-sm text-muted-foreground mt-1">AI for Smart Communities & Governance</p>
      </div>

      {/* Concept */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">The UrbanEye Concept</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          UrbanEye is a smart tourism monitoring platform that uses Artificial Intelligence and Computer Vision to detect,
          monitor, and predict crowd levels at tourist destinations. Our system helps city authorities manage tourist flow
          while enabling visitors to make informed decisions about when and where to visit.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-foreground text-sm">Computer Vision</h4>
            <p className="text-xs text-muted-foreground mt-1">YOLOv8 for real-time person detection and counting</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Brain className="w-8 h-8 text-info mx-auto mb-2" />
            <h4 className="font-semibold text-foreground text-sm">Machine Learning</h4>
            <p className="text-xs text-muted-foreground mt-1">LSTM models for crowd prediction using historical data</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <BarChart3 className="w-8 h-8 text-success mx-auto mb-2" />
            <h4 className="font-semibold text-foreground text-sm">Smart Analytics</h4>
            <p className="text-xs text-muted-foreground mt-1">Real-time dashboards and actionable insights</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((ts) => (
            <div key={ts.category}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{ts.category}</h4>
              <div className="space-y-1.5">
                {ts.items.map((item) => (
                  <div key={item} className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-foreground">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((m) => (
            <div key={m.name} className="p-4 rounded-xl bg-secondary/50 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <span className="font-display font-bold text-primary">{m.avatar}</span>
              </div>
              <h4 className="font-medium text-foreground text-sm">{m.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Contact</h2>
        <div className="flex flex-wrap gap-4">
          <a href="#" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-primary/10 transition-colors">
            <Mail className="w-4 h-4" /> waylenbarreto@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
