import { alerts as mockAlerts } from "@/data/mockData";
import { Bell, AlertTriangle, Shield, Trash2, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useDetections } from "@/context/DetectionContext";

export default function AlertsPage() {
  const { events } = useDetections();
  const [items, setItems] = useState(mockAlerts);

  const liveAlerts = useMemo(
    () =>
      events.slice(0, 20).map((e) => ({
        id: e.id,
        type: e.litterCount >= 1 ? "cleanliness" : "crowd" as const,
        severity: e.crowdLevel === "HIGH" || e.litterCount >= 3 ? "high" as const : e.crowdLevel === "MEDIUM" ? "medium" as const : "low" as const,
        message:
          e.litterCount >= 1
            ? `${e.litterCount} litter item(s) detected at ${e.cameraName}`
            : `Crowd level ${e.crowdLevel} at ${e.cameraName}`,
        locationName: e.cameraName,
        timestamp: new Date(e.timestamp).toLocaleTimeString(),
        resolved: false,
      })),
    [events]
  );

  const allAlerts = [...liveAlerts, ...items];

  const resolve = (id: string) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  const typeIcon = { crowd: AlertTriangle, safety: Shield, cleanliness: Trash2 };
  const severityColor = { low: "text-muted-foreground", medium: "text-warning", high: "text-destructive" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time alerts when crowd levels exceed safety thresholds</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10">
          <Bell className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-warning">{allAlerts.filter((a) => !a.resolved).length} Active</span>
        </div>
      </div>

      <div className="space-y-3">
        {allAlerts.map((alert) => {
          const Icon = typeIcon[alert.type];
          return (
            <div key={alert.id} className={`glass-card p-4 flex items-start gap-4 transition-opacity ${alert.resolved ? "opacity-50" : ""}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.severity === "high" ? "bg-destructive/15" : alert.severity === "medium" ? "bg-warning/15" : "bg-secondary"}`}>
                <Icon className={`w-5 h-5 ${severityColor[alert.severity]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${severityColor[alert.severity]}`}>{alert.severity} • {alert.type}</span>
                </div>
                <p className="text-sm text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.locationName} • {alert.timestamp}</p>
              </div>
              {!alert.resolved ? (
                <button onClick={() => resolve(alert.id)} className="shrink-0 px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-semibold hover:bg-success/25 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="shrink-0 text-[10px] text-success font-semibold uppercase">Resolved</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
