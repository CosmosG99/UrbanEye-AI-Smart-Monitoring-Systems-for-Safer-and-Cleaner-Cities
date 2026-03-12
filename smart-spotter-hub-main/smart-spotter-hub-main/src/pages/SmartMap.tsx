import { Navigation, Clock, Star, Filter } from "lucide-react";
import { locations } from "@/data/mockData";
import CrowdLevelBadge from "@/components/CrowdLevelBadge";
import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

export default function SmartMap() {
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const filtered =
    filter === "all"
      ? locations
      : locations.filter((l) => l.crowdLevel === filter);

  const [userLocation, setUserLocation] = useState<any>(null);
  const [center, setCenter] = useState({
    lat: locations[0].lat,
    lng: locations[0].lng,
  });

  const searchBoxRef = useRef<any>(null);

  // Live location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        setCenter(userPos);
      });
    }
  }, []);

  // Search place
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) return;

    const place = places[0];
    const loc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setCenter(loc);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Smart Tourist Map
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find the best time and place to visit with AI recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAP */}
        <div className="lg:col-span-2 glass-card overflow-hidden p-4">
          <LoadScript
            googleMapsApiKey="AIzaSyAJjWNzXnZT25l1fGtV8uPu3FWkYkB8lpM"
            libraries={["places"]}
          >
            {/* Search Box */}
            <StandaloneSearchBox
              onLoad={(ref) => (searchBoxRef.current = ref)}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                type="text"
                placeholder="Search a place..."
                className="w-full p-2 border rounded mb-2"
              />
            </StandaloneSearchBox>

            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
            >
              {/* Location markers */}
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={{
                    lat: loc.lat,
                    lng: loc.lng,
                  }}
                />
              ))}

              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {/* Filter */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Filter by Crowd Level
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "low", "medium", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Location List */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-display font-semibold text-foreground">
              Locations
            </h3>

            {filtered.map((loc) => (
              <div
                key={loc.id}
                className="p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {loc.name}
                  </p>
                  <CrowdLevelBadge level={loc.crowdLevel} />
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3 h-3" />
                    <span>{loc.type}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Best: {loc.bestTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3" />
                    <span>Cleanliness: {loc.cleanlinessScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}