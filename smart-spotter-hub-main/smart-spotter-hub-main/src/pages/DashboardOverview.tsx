import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, Eye, MapPin, AlertTriangle, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import { locations, weeklyTrends, alerts } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardOverview() {

  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [hourlyVisitors, setHourlyVisitors] = useState<{ label: string; visitors: number }[]>([]);

  const apiBaseUrl = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    return (fromEnv || "http://localhost:5000").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/analytics/summary`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const totalPeople = Number(data.totalPeople ?? 0);
        setTotalVisitors(totalPeople);

        if (Array.isArray(data.hourly)) {
          setHourlyVisitors(
            data.hourly.map((h: any) => ({
              label: `${h._id}:00`,
              visitors: Number(h.totalPeople ?? 0),
            }))
          );
        }
      } catch {
        // fall back to mock data
      }
    }

    loadSummary();
    const id = window.setInterval(loadSummary, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [apiBaseUrl]);

  const weeklyChartData = hourlyVisitors.length
    ? hourlyVisitors
    : weeklyTrends.map((d) => ({ label: d.day, visitors: d.visitors }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time smart tourism monitoring across all locations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visitors (today)"
          value={totalVisitors != null ? totalVisitors.toLocaleString() : "5,390"}
          change="+12% from yesterday"
          changeType="positive"
          icon={Users}
        />
        <StatCard title="Avg Density" value="62%" change="Medium level" changeType="neutral" icon={Activity} />
        <StatCard title="Active Cameras" value="6" icon={Eye} iconColor="text-success" />
        <StatCard title="Active Alerts" value={alerts.filter(a => !a.resolved).length} icon={AlertTriangle} iconColor="text-warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Visitor Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Visitor Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                <XAxis dataKey="label" stroke="hsl(215 20% 55%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: 8, color: "hsl(210 40% 93%)" }}
                />
                <Bar dataKey="visitors" fill="hsl(174 72% 46%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Locations */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Location Status</h3>
          <div className="space-y-3">
            {locations.slice(0, 5).map((loc) => (
              <div key={loc.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{loc.name}</span>
                </div>
                <CrowdLevelBadge level={loc.crowdLevel} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.resolved ? "bg-secondary/30" : "bg-secondary/50 border border-border"}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-warning" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="text-sm text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.locationName} • {alert.timestamp}</p>
              </div>
              {alert.resolved && <span className="text-[10px] text-success uppercase font-semibold shrink-0">Resolved</span>}
              
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
