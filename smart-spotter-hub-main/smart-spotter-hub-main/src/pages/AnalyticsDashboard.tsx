import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, Clock, Activity } from "lucide-react";
import { monthlyData } from "@/data/mockData";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useDetections } from "@/context/DetectionContext";

const pieData = [
  { name: "Beach", value: 45 },
  { name: "Temple", value: 20 },
  { name: "Museum", value: 10 },
  { name: "Monument", value: 15 },
  { name: "Park", value: 10 },
];

const COLORS = ["hsl(174 72% 46%)", "hsl(210 100% 56%)", "hsl(38 92% 50%)", "hsl(152 69% 41%)", "hsl(280 65% 60%)"];

export default function AnalyticsDashboard() {
  const { events } = useDetections();

  const [summary, setSummary] = useState<{
    date: string;
    totalPeople: number;
    totalLitter: number;
    totalDetections: number;
    avgVisitorsPerDetection: number;
    cleanlinessScore: number;
    peakHour: number | null;
  } | null>(null);

  const [hourly, setHourly] = useState<
    { hour: number; totalPeople: number; totalLitter: number; detections: number }[]
  >([]);

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
            totalPeople: data.totalPeople ?? 0,
            totalLitter: data.totalLitter ?? 0,
            totalDetections: data.totalDetections ?? 0,
            avgVisitorsPerDetection: data.avgVisitorsPerDetection ?? 0,
            cleanlinessScore: data.cleanlinessScore ?? 100,
            peakHour: data.peakHour ?? null,
          });
          setHourly(
            Array.isArray(data.hourly)
              ? data.hourly.map((h: any) => ({
                  hour: h._id,
                  totalPeople: h.totalPeople ?? 0,
                  totalLitter: h.totalLitter ?? 0,
                  detections: h.detections ?? 0,
                }))
              : []
          );
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

  const totalPeople = summary?.totalPeople ?? events.reduce((s, e) => s + e.peopleCount, 0);
  const totalLitter = summary?.totalLitter ?? events.reduce((s, e) => s + e.litterCount, 0);

  const densityImpact = totalPeople > 0 ? Math.min(90, 40 + Math.log10(totalPeople + 1) * 20) : 40;

  const avgVisitors = summary?.avgVisitorsPerDetection
    ? Math.round(summary.avgVisitorsPerDetection)
    : totalPeople && events.length
      ? Math.round(totalPeople / events.length)
      : 0;

  const hourlyDensity = useMemo(
    () =>
      hourly.map((h) => ({
        hourLabel: `${h.hour}:00`,
        avgDensity:
          totalPeople > 0
            ? Math.min(100, (h.totalPeople / Math.max(1, totalPeople)) * 100)
            : 0,
      })),
    [hourly, totalPeople]
  );

  const peakHourLabel = useMemo(() => {
    if (summary?.peakHour == null) return "—";
    const hour = summary.peakHour;
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12} ${period}`;
  }, [summary?.peakHour]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive tourism analytics and insights</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Visitors (today)" value={String(totalPeople)} changeType="neutral" icon={Users} />
        <StatCard title="Avg Visitors / detection" value={String(avgVisitors)} icon={TrendingUp} />
        <StatCard title="Peak Hour (today)" value={peakHourLabel} icon={Clock} iconColor="text-warning" />
        <StatCard title="Avg Density" value={`${Math.round(densityImpact)}%`} icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Monthly Visitor Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={11} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: 8, color: "hsl(210 40% 93%)" }} />
                <Bar dataKey="visitors" fill="hsl(174 72% 46%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Distribution */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Visitor Distribution by Type</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: 8, color: "hsl(210 40% 93%)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly density (live from DB) */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Today&apos;s Crowd Density by Hour</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyDensity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
              <XAxis dataKey="hourLabel" stroke="hsl(215 20% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: 8, color: "hsl(210 40% 93%)" }} />
              <Line type="monotone" dataKey="avgDensity" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ fill: "hsl(38 92% 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
