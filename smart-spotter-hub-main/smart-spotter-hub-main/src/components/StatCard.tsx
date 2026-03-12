import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <div className="glass-card p-5 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeType === "positive" ? "text-success" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
