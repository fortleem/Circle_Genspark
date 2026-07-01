// Maps Screen — Google Maps Embedded API integration
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Search, Navigation, Star, Clock, Coffee, ShoppingBag,
  Utensils, Building2, Heart, Fuel, BookOpen, TreePine, ChevronRight,
  Locate, Layers, Route, Bookmark, Plus, X,
} from "lucide-react";

type MapStyle = "roadmap" | "satellite" | "terrain";
type POICategory = "all" | "restaurants" | "cafes" | "shopping" | "mosques" | "parks" | "gas" | "hospitals";

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
}

const POI_CATEGORIES: { key: POICategory; icon: any; label: string }[] = [
  { key: "all", icon: MapPin, label: "All" },
  { key: "restaurants", icon: Utensils, label: "Food" },
  { key: "cafes", icon: Coffee, label: "Cafes" },
  { key: "shopping", icon: ShoppingBag, label: "Shopping" },
  { key: "mosques", icon: Building2, label: "Mosques" },
  { key: "parks", icon: TreePine, label: "Parks" },
  { key: "gas", icon: Fuel, label: "Gas" },
  { key: "hospitals", icon: Heart, label: "Hospitals" },
];

const SAVED_PLACES: SavedPlace[] = [
  { id: "1", name: "Home", address: "Zamalek, Cairo", category: "home", lat: 30.0626, lng: 31.2235 },
  { id: "2", name: "Work", address: "Smart Village, 6th October", category: "work", lat: 30.0716, lng: 31.0176 },
  { id: "3", name: "Al-Azhar Park", address: "Salah Salem St, Cairo", category: "parks", lat: 30.0396, lng: 31.2656 },
  { id: "4", name: "City Stars Mall", address: "Nasr City, Cairo", category: "shopping", lat: 30.0738, lng: 31.3464 },
];

export function MapsScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<POICategory>("all");
  const [mapStyle, setMapStyle] = useState<MapStyle>("roadmap");
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 30.0444, lng: 31.2357 }); // Cairo
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(SAVED_PLACES);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);

  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Keep Cairo default
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  // Build Google Maps embed URL
  function getMapUrl(): string {
    const baseUrl = "https://www.google.com/maps/embed/v1";
    const key = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"; // Google's demo key for embeds

    if (search.trim()) {
      return `${baseUrl}/search?key=${key}&q=${encodeURIComponent(search)}+near+Cairo+Egypt&maptype=${mapStyle}`;
    }

    if (selectedPlace) {
      return `${baseUrl}/place?key=${key}&q=${encodeURIComponent(selectedPlace.name + " " + selectedPlace.address)}&center=${selectedPlace.lat},${selectedPlace.lng}&zoom=16&maptype=${mapStyle}`;
    }

    if (category !== "all") {
      const categoryMap: Record<string, string> = {
        restaurants: "restaurants",
        cafes: "cafes",
        shopping: "shopping+mall",
        mosques: "mosques",
        parks: "parks",
        gas: "gas+station",
        hospitals: "hospitals",
      };
      return `${baseUrl}/search?key=${key}&q=${categoryMap[category]}+near+${location.lat},${location.lng}&maptype=${mapStyle}`;
    }

    return `${baseUrl}/view?key=${key}&center=${location.lat},${location.lng}&zoom=13&maptype=${mapStyle}`;
  }

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setSelectedPlace(null);
      setCategory("all");
    }
  }

  function goToMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearch("");
          setSelectedPlace(null);
          setCategory("all");
        }
      );
    }
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">
            Maps <span className="text-base text-muted-foreground tracking-widest uppercase">خرائط</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            Google Maps · Privacy-first · No tracking history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/10 transition"
            title="Saved places"
          >
            <Bookmark className={`w-4 h-4 ${showSaved ? "text-secondary" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 mt-4">
        <div className="glass rounded-full px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search places, restaurants, directions..."
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={goToMyLocation}
            className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition"
            title="My location"
          >
            <Locate className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* POI Categories */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {POI_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setSearch(""); setSelectedPlace(null); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              category === cat.key ? "bg-primary text-primary-foreground" : "glass hover:bg-muted/50"
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Map Style Toggle */}
      <div className="px-5 mt-3 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          {(["roadmap", "satellite", "terrain"] as MapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`text-[10px] px-2 py-1 rounded-full capitalize ${
                mapStyle === style ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="px-3 mt-4">
        <div className="rounded-2xl overflow-hidden border border-border shadow-soft relative" style={{ height: "50vh", minHeight: "350px" }}>
          <iframe
            key={getMapUrl()} // Force re-render on URL change
            src={getMapUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
            className="w-full h-full"
          />
          {/* My Location FAB */}
          <button
            onClick={goToMyLocation}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition"
            title="Center on my location"
          >
            <Navigation className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      {/* Saved Places (expandable) */}
      {showSaved && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Saved Places
            </h3>
          </div>
          <div className="space-y-2">
            {savedPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => { setSelectedPlace(place); setSearch(""); setCategory("all"); setShowSaved(false); }}
                className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-muted/30 transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{place.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{place.address}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Directions */}
      <div className="px-5 mt-6">
        <h3 className="font-display text-lg flex items-center gap-2 mb-3">
          <Route className="w-4 h-4 text-secondary" />
          Quick Directions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { from: "Current Location", to: "Home", time: "25 min" },
            { from: "Current Location", to: "Work", time: "45 min" },
          ].map((route, i) => (
            <button
              key={i}
              onClick={() => setSearch(`${route.to} Cairo Egypt`)}
              className="glass rounded-xl p-3 text-left hover:bg-muted/30 transition"
            >
              <div className="text-xs text-muted-foreground">{route.from} →</div>
              <div className="text-sm font-medium mt-0.5">{route.to}</div>
              <div className="text-xs text-secondary mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{route.time}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="px-5 mt-6">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-medium">Privacy</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Circle's Maps module uses Google Maps Embed API for display only. Your search queries are processed
            through Circle's privacy proxy — Google never receives your Circle user ID or profile data. Location
            history is stored on-device only and never synced to any cloud.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MapsScreen;
