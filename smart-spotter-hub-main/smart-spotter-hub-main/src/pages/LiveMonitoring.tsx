import { useState, useEffect } from "react";
import { Camera, Users, Activity, Maximize2 } from "lucide-react";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import cameraFeed from "@/assets/camera-feed.jpg";

const cameras = [
  { id: 1, name: "Marina Beach - North", count: 847, level: "high" as const, fps: 30 },
  { id: 2, name: "Marina Beach - South", count: 623, level: "high" as const, fps: 28 },
  { id: 3, name: "Fort St. George - Main", count: 312, level: "medium" as const, fps: 30 },
  { id: 4, name: "Kapaleeshwarar Temple", count: 145, level: "low" as const, fps: 25 },
  { id: 5, name: "Elliot's Beach", count: 389, level: "medium" as const, fps: 30 },
  { id: 6, name: "VGP Universal Kingdom", count: 756, level: "high" as const, fps: 27 },
];

export default function LiveMonitoring() {
  const [activeCamera, setActiveCamera] = useState(0);
  const [liveCount, setLiveCount] = useState(cameras[0].count);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeCamera]);

  const cam = cameras[activeCamera];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Live Crowd Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">YOLO-based real-time detection across camera feeds</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="relative">
            <img src={cameraFeed} alt="Live camera feed with AI detection" className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 scan-line pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-semibold text-foreground">LIVE</span>
              <span className="text-xs text-muted-foreground">• {cam.name}</span>
            </div>
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="text-xs text-muted-foreground">{cam.fps} FPS</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Detected People</p>
                <p className="text-2xl font-display font-bold text-primary">{liveCount}</p>
              </div>
              <CrowdLevelBadge level={cam.level} size="md" />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{cam.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">YOLO v8 Active</span>
              </div>
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Camera List */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Camera Feeds</h3>
          {cameras.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setActiveCamera(i); setLiveCount(c.count); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${i === activeCamera ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{c.count}</span>
                  <CrowdLevelBadge level={c.level} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
