import { useMemo, useState } from "react";
import { Flag, MapPin, AlertTriangle, Trash2, UserX, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type SafetyType = "crime" | "litter";

export default function SafetyReport() {
  const [type, setType] = useState<SafetyType>("crime");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);

  const apiBaseUrl = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    return (fromEnv || "http://localhost:5000").replace(/\/$/, "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location || !description) {
      toast("Missing details", { description: "Please provide both location and description." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/safety-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, location, description, severity }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit report");
      }
      toast("Report submitted", {
        description: "Your safety report has been logged for this location.",
      });
      setDescription("");
      setLocation("");
      setSeverity("medium");
      setType("crime");
    } catch (err: any) {
      toast("Could not submit report", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            Safety Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log incidents where people are involved in crimes or littering, along with precise location details.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="glass-card p-6 lg:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Incident type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("crime")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                    type === "crime"
                      ? "bg-destructive/10 border-destructive/60 text-destructive"
                      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  Suspected crime
                </button>
                <button
                  type="button"
                  onClick={() => setType("litter")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                    type === "litter"
                      ? "bg-amber-500/10 border-amber-400 text-amber-300"
                      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Littering / trash
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Severity
              </label>
              <div className="flex gap-2">
                {["low", "medium", "high"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl as any)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      severity === lvl
                        ? lvl === "high"
                          ? "bg-destructive/15 border-destructive/60 text-destructive"
                          : lvl === "medium"
                            ? "bg-amber-500/10 border-amber-400 text-amber-300"
                            : "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                        : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Location / camera
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Eg. Marina Beach – North gate near camera 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              What happened?
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg bg-background/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 px-3 py-2.5 resize-none"
              placeholder="Describe the incident, people involved, and any relevant details for authorities."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting report...
              </>
            ) : (
              <>
                Submit report
                <Flag className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            When to use this tab
          </h3>
          <p className="text-sm text-muted-foreground">
            Use the Safety Report tab when a human operator or on-ground staff notices behaviour that the AI
            system alone might not fully capture — like suspicious groups, theft, vandalism or excessive littering.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• People committing or attempting a crime in the camera view.</li>
            <li>• Repeated littering or dumping of trash at a hotspot.</li>
            <li>• Any incident that should be escalated to city authorities.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            All reports are stored with type, severity and location so they can be correlated with AI detections and alerts.
          </p>
        </div>
      </div>
    </div>
  );
}

