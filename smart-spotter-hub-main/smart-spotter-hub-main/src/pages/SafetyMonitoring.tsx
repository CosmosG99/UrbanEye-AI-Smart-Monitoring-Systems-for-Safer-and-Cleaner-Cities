import { Shield, Droplets, AlertTriangle, CheckCircle } from "lucide-react";
import { locations } from "@/data/mockData";
import StatCard from "@/components/StatCard";

export default function SafetyMonitoring() {
  const avgCleanliness = Math.round(locations.reduce((s, l) => s + l.cleanlinessScore, 0) / locations.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Safety & Cleanliness</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered environmental and safety monitoring</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Cleanliness" value={`${avgCleanliness}%`} icon={Droplets} iconColor="text-info" />
        <StatCard title="Safety Incidents" value="2" change="Today" changeType="neutral" icon={AlertTriangle} iconColor="text-warning" />
        <StatCard title="Zones Monitored" value="12" icon={Shield} iconColor="text-success" />
        <StatCard title="Compliance Rate" value="96%" icon={CheckCircle} iconColor="text-success" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-foreground">{loc.name}</h3>
                <p className="text-xs text-muted-foreground">{loc.type}</p>
              </div>
              <div className={`text-lg font-display font-bold ${loc.cleanlinessScore >= 85 ? "text-success" : loc.cleanlinessScore >= 70 ? "text-warning" : "text-destructive"}`}>
                {loc.cleanlinessScore}
              </div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${loc.cleanlinessScore >= 85 ? "bg-success" : loc.cleanlinessScore >= 70 ? "bg-warning" : "bg-destructive"}`}
                style={{ width: `${loc.cleanlinessScore}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cleanliness Score</p>
          </div>
        ))}
      </div>
    </div>
  );
}
