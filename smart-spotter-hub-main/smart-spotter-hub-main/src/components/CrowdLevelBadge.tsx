interface CrowdLevelBadgeProps {
  level: "low" | "medium" | "high";
  size?: "sm" | "md";
}

export default function CrowdLevelBadge({ level, size = "sm" }: CrowdLevelBadgeProps) {
  const config = {
    low: { label: "Low", bg: "bg-success/15", text: "text-success", dot: "bg-success" },
    medium: { label: "Medium", bg: "bg-warning/15", text: "text-warning", dot: "bg-warning" },
    high: { label: "High", bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
  };

  const c = config[level];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${c.bg} ${c.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  );
}
