import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Users, Activity, Maximize2 } from "lucide-react";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import { useDetections } from "@/context/DetectionContext";

const cameras = [
  { id: 1, name: "Marina Beach - North", count: 847, level: "high" as const, fps: 30 },
  { id: 2, name: "Marina Beach - South", count: 623, level: "high" as const, fps: 28 },
  { id: 3, name: "Fort St. George - Main", count: 312, level: "medium" as const, fps: 30 },
  { id: 4, name: "Kapaleeshwarar Temple", count: 145, level: "low" as const, fps: 25 },
  { id: 5, name: "Elliot's Beach", count: 389, level: "medium" as const, fps: 30 },
  { id: 6, name: "VGP Universal Kingdom", count: 756, level: "high" as const, fps: 27 },
];

type CrowdLevelUi = "low" | "medium" | "high";

export default function LiveMonitoring() {
  const { pushEvent } = useDetections();
  const [activeCamera, setActiveCamera] = useState(0);
  const [peopleCount, setPeopleCount] = useState<number>(0);
  const [litterCount, setLitterCount] = useState<number>(0);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevelUi>("low");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const apiBaseUrl = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    return (fromEnv || "http://localhost:5000").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      try {
        setError("");
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        // Some browsers will render a black frame until metadata is available.
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          if (video.readyState >= 1) return done();
          video.onloadedmetadata = () => done();
        });
        await video.play();
        setIsRunning(true);
      } catch (e: any) {
        setError(e?.message || "Could not access camera");
        setIsRunning(false);
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [activeCamera]);

  const cam = cameras[activeCamera];

  useEffect(() => {
    if (!isRunning) return;

    let timer: number | undefined;
    let aborted = false;

    async function tick() {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        const w = 640;
        const h = 360;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);

        const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);
        const res = await fetch(`${apiBaseUrl}/api/detect/frame`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, cameraId: String(cam.id), cameraName: cam.name }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Detection failed");

        const p = Number(data?.peopleCount ?? 0);
        const l = Number(data?.litterCount ?? 0);
        const levelRaw = String(data?.crowdLevel ?? "LOW").toUpperCase();
        const suspiciousActivity = Boolean(data?.suspiciousActivity ?? false);
        const hypermovement = Boolean(data?.hypermovement ?? false);

        const uiLevel: CrowdLevelUi = levelRaw === "HIGH" ? "high" : levelRaw === "MEDIUM" ? "medium" : "low";

        setPeopleCount(p);
        setLitterCount(l);
        setCrowdLevel(uiLevel);

        // Push event into global store (triggers global toasts)
        pushEvent({
          cameraId: String(cam.id),
          cameraName: cam.name,
          peopleCount: p,
          litterCount: l,
          crowdLevel: levelRaw as any,
          suspiciousActivity,
          hypermovement,
        });

        setError("");
      } catch (e: any) {
        setError(e?.message || "Detection error");
      } finally {
        if (!aborted) timer = window.setTimeout(tick, 2000);
      }
    }

    timer = window.setTimeout(tick, 750);
    return () => {
      aborted = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [apiBaseUrl, cam.id, cam.name, isRunning]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Live Crowd Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">YOLO-based real-time detection across camera feeds</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 scan-line pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-semibold text-foreground">LIVE</span>
              <span className="text-xs text-muted-foreground">• {cam.name}</span>
            </div>
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="text-xs text-muted-foreground">{cam.fps} FPS</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Detected People</p>
                <p className="text-2xl font-display font-bold text-primary">{peopleCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Litter: {litterCount}</p>
              </div>
              <CrowdLevelBadge level={crowdLevel} size="md" />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{cam.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">{error ? `Model error: ${error}` : "YOLO v8 Active"}</span>
              </div>
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Camera List */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Camera Feeds</h3>
          {cameras.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setActiveCamera(i); setPeopleCount(0); setLitterCount(0); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${i === activeCamera ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Live</span>
                  <CrowdLevelBadge level={i === activeCamera ? crowdLevel : c.level} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
