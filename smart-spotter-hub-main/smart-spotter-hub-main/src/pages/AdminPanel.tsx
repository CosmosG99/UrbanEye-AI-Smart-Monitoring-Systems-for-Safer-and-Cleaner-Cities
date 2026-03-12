import { Camera, MapPin, Settings, Upload, Bell, Save } from "lucide-react";
import { locations } from "@/data/mockData";
import { useState } from "react";

export default function AdminPanel() {
  const [threshold, setThreshold] = useState(80);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage cameras, locations, and alert thresholds</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Management */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Camera Feeds</h3>
          </div>
          <div className="space-y-3">
            {["Marina Beach - North", "Marina Beach - South", "Fort St. George", "Kapaleeshwarar Temple", "Elliot's Beach", "VGP Universal Kingdom"].map((cam, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm text-foreground">{cam}</span>
                </div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-sm">
              <Upload className="w-4 h-4" />
              Add Camera Feed
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* Alert Threshold */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-warning" />
              <h3 className="font-display font-semibold text-foreground">Alert Threshold</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Crowd capacity threshold</span>
                  <span className="font-semibold text-foreground">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>50%</span>
                  <span>95%</span>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>

          {/* Managed Locations */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-info" />
              <h3 className="font-display font-semibold text-foreground">Managed Locations</h3>
            </div>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-foreground">{loc.name}</span>
                  <span className="text-xs text-muted-foreground">Cap: {loc.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
