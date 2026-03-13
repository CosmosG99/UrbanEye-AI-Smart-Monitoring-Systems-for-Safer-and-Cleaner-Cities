import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";

type CrowdLevel = "LOW" | "MEDIUM" | "HIGH";

export type DetectionEvent = {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  peopleCount: number;
  litterCount: number;
  crowdLevel: CrowdLevel;
  suspiciousActivity?: boolean;
  hypermovement?: boolean;
};

type DetectionContextValue = {
  events: DetectionEvent[];
  pushEvent: (e: Omit<DetectionEvent, "id" | "timestamp">) => void;
};

const DetectionContext = createContext<DetectionContextValue | null>(null);

export function DetectionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<DetectionEvent[]>([]);

  const value = useMemo<DetectionContextValue>(
    () => ({
      events,
      pushEvent: (e) => {
        setEvents((prev) => {
          const next: DetectionEvent = {
            ...e,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
          };

          if (next.litterCount >= 1) {
            toast("Litter detected", {
              description: `${next.litterCount} item(s) detected at ${next.cameraName}`,
              position: "top-left",
            });
          }
          if (next.peopleCount >= 1 && next.crowdLevel !== "LOW") {
            toast("High crowd level", {
              description: `Crowd level ${next.crowdLevel} at ${next.cameraName}`,
              position: "top-left",
            });
          }

          if (next.hypermovement || next.suspiciousActivity) {
            toast("Security alert", {
              description: next.hypermovement
                ? `Hypermovement detected at ${next.cameraName}`
                : `Suspicious activity detected at ${next.cameraName}`,
              position: "top-left",
            });
          }

          return [next, ...prev].slice(0, 200);
        });
      },
    }),
    [events]
  );

  return <DetectionContext.Provider value={value}>{children}</DetectionContext.Provider>;
}

export function useDetections() {
  const ctx = useContext(DetectionContext);
  if (!ctx) throw new Error("useDetections must be used within DetectionProvider");
  return ctx;
}

