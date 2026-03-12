import { createContext, useContext, useMemo, useState } from "react";

type CrowdLevel = "LOW" | "MEDIUM" | "HIGH";

export type DetectionEvent = {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  peopleCount: number;
  litterCount: number;
  crowdLevel: CrowdLevel;
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

