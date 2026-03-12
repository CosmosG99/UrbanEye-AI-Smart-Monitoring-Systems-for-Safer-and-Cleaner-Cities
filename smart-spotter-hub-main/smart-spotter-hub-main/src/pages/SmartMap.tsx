import { MapPin, Navigation, Clock, Star, Filter } from "lucide-react";
import { locations } from "@/data/mockData";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import { useState } from "react";

export default function SmartMap() {
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const filtered = filter === "all" ? locations : locations.filter((l) => l.crowdLevel === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Smart Tourist Map</h1>
        <p className="text-sm text-muted-foreground mt-1">Find the best time and place to visit with AI recommendations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="relative h-[500px] bg-secondary/30 flex items-center justify-center">
            {/* Simulated map grid */}
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute inset-0 p-8">
              {locations.map((loc, i) => {
                const positions = [
                  { top: "15%", left: "60%" },
                  { top: "25%", left: "75%" },
                  { top: "45%", left: "50%" },
                  { top: "35%", left: "35%" },
                  { top: "70%", left: "55%" },
                  { top: "80%", left: "40%" },
                ];
                const pos = positions[i];
                const sizeClass = loc.crowdLevel === "high" ? "w-5 h-5" : loc.crowdLevel === "medium" ? "w-4 h-4" : "w-3 h-3";
                const colorClass = loc.crowdLevel === "high" ? "bg-destructive" : loc.crowdLevel === "medium" ? "bg-warning" : "bg-success";

                return (
                  <div
                    key={loc.id}
                    className="absolute group cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <div className={`${sizeClass} ${colorClass} rounded-full animate-pulse-glow relative`}>
                      <div className={`absolute inset-0 ${colorClass} rounded-full animate-ping opacity-30`} />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-10">
                      <p className="text-xs font-medium text-foreground">{loc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{loc.currentCount} visitors</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="z-10 text-center">
              <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Interactive Map View</p>
              <p className="text-xs text-muted-foreground mt-1">Hover dots to see location details</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Filter */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by Crowd Level</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "low", "medium", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Location List */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-display font-semibold text-foreground">Locations</h3>
            {filtered.map((loc) => (
              <div key={loc.id} className="p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{loc.name}</p>
                  <CrowdLevelBadge level={loc.crowdLevel} />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3 h-3" />
                    <span>{loc.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Best: {loc.bestTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3" />
                    <span>Cleanliness: {loc.cleanlinessScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
