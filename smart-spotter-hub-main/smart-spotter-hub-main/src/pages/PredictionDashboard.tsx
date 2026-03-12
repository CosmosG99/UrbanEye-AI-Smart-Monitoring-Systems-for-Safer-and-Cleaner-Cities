import { useEffect, useMemo, useState } from "react";
import { locations, hourlyPredictions } from "@/data/mockData";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { Brain, TrendingUp, Clock, Target } from "lucide-react";
import StatCard from "@/components/StatCard";

type AnalyticsSummary = {
  date: string;
  peakHour: number | null;
  predictedMax: number;
  modelAccuracyPercent: number | null;
};

export default function PredictionDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

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
        if (!cancelled) {
          setSummary({
            date: data.date,
            peakHour: data.peakHour ?? null,
            predictedMax: data.predictedMax ?? 0,
            modelAccuracyPercent: data.modelAccuracyPercent ?? null,
          });
        }
      } catch {
        // ignore – keep mock metrics if backend not available
      }
    }

    loadSummary();
    const id = window.setInterval(loadSummary, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [apiBaseUrl]);

  const peakHourLabel = useMemo(() => {
    if (summary?.peakHour == null) return "—";
    const hour = summary.peakHour;
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12} ${period}`;
  }, [summary?.peakHour]);

  const modelAccuracyLabel =
    summary?.modelAccuracyPercent != null ? `${summary.modelAccuracyPercent.toFixed(1)}%` : "—";

  const predictedMaxLabel = summary?.predictedMax ? summary.predictedMax.toLocaleString() : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Crowd Predictions</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-based crowd level forecasting for tourist locations</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Model Accuracy" value={modelAccuracyLabel} changeType="positive" icon={Target} />
        <StatCard title="Peak Hour Today" value={peakHourLabel} icon={Clock} iconColor="text-warning" />
        <StatCard title="Predicted Max (today)" value={predictedMaxLabel} icon={TrendingUp} />
        <StatCard title="AI Model" value="LSTM v3" icon={Brain} iconColor="text-info" />
      </div>

      {/* Hourly Prediction Chart */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Hourly Crowd Prediction — Marina Beach</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyPredictions}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174 72% 46%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174 72% 46%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210 100% 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210 100% 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
              <XAxis dataKey="hour" stroke="hsl(215 20% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: 8, color: "hsl(210 40% 93%)" }} />
              <Legend />
              <Area type="monotone" dataKey="predicted" stroke="hsl(174 72% 46%)" fill="url(#predGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" stroke="hsl(210 100% 56%)" fill="url(#actGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap-style location predictions */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Location Crowd Heatmap</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const pct = Math.round((loc.currentCount / loc.capacity) * 100);
            return (
              <div key={loc.id} className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.type}</p>
                  </div>
                  <CrowdLevelBadge level={loc.crowdLevel} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{loc.currentCount} / {loc.capacity}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 75 ? "bg-destructive" : pct > 50 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Best time: {loc.bestTime}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
