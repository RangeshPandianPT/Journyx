import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { generateMockTrips } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  BusFront,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  component: SearchResults,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search["from"] as string) || "Chennai",
      to: (search["to"] as string) || "Bangalore",
      date: (search["date"] as string) || new Date().toISOString().split("T")[0],
      passengers: Number(search["passengers"]) || 1,
    };
  },
});

function SearchResults() {
  const search = Route.useSearch();
  const from: string = String(search["from"] ?? "Chennai");
  const to: string = String(search["to"] ?? "Bangalore");
  const date: string = String(search["date"] ?? new Date().toISOString().split("T")[0]);
  const passengers: number = Number(search["passengers"] ?? 1);
  const trips = generateMockTrips(from, to, date);
  const navigate = useNavigate();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === "cheapest") return a.price - b.price;
    if (sortBy === "fastest") {
      // Parse "7h 15m" -> 435 mins
      const toMins = (d: string) => {
        const parts = d.match(/\d+/g) ?? [];
        const h = parseInt(parts[0] ?? "0");
        const m = parseInt(parts[1] ?? "0");
        return h * 60 + m;
      };
      return toMins(a.duration) - toMins(b.duration);
    }
    if (sortBy === "earliest") return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-24">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span>{from}</span>
            <ArrowRight className="h-5 w-5 opacity-70" />
            <span>{to}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-4 text-sm opacity-90 bg-primary-foreground/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{passengers} Pax</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white text-sm font-medium"
              onClick={() => navigate({ to: "/" })}
            >
              Modify
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page mt-6 flex flex-col lg:flex-row gap-6">
        {/* ── Desktop Sidebar Filters ─────────────────────── */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4 hidden lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Filters</h2>
            <button className="text-xs text-primary font-medium hover:underline">
              Clear All
            </button>
          </div>
          <FilterPanel />
        </aside>

        {/* ── Mobile Filter Sheet ──────────────────────────── */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            />
            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-raise animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full hover:bg-surface-muted text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel />
              <Button
                className="w-full mt-6"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────── */}
        <div className="flex-1 space-y-3">
          {/* Results header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold">
              {sortedTrips.length} Buses Found
            </h2>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-surface-muted active:scale-95 transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-medium text-foreground outline-none cursor-pointer p-1 rounded hover:bg-surface-muted transition-colors"
                >
                  <option value="recommended">Recommended</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="fastest">Fastest</option>
                  <option value="earliest">Earliest</option>
                </select>
              </div>
            </div>
          </div>

          {sortedTrips.map((trip) => (
            <Card
              key={trip.id}
              className="border-border shadow-soft hover:shadow-raise transition-all rounded-xl bg-card overflow-hidden group"
            >
              <CardContent className="p-0">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                  {/* Left: Operator & Timing */}
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base">{trip.operator}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                          <BusFront className="h-3.5 w-3.5" />
                          {trip.busType} • {trip.isAC ? "A/C" : "Non A/C"}{" "}
                          {trip.isSleeper ? "Sleeper" : "Seater"}
                        </p>
                      </div>
                      {!trip.isLive && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200 flex-shrink-0">
                          Demo
                        </span>
                      )}
                    </div>

                    {/* Timing row */}
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[56px]">
                        <p className="font-display text-xl font-bold">
                          {trip.departureTime}
                        </p>
                        <p className="text-xs text-muted-foreground">{from}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {trip.duration}
                        </span>
                        <div className="w-full relative flex items-center">
                          <div className="w-full h-[2px] bg-border-strong rounded-full" />
                          <ArrowRight className="absolute right-0 h-3 w-3 text-border-strong" />
                        </div>
                      </div>
                      <div className="text-center min-w-[56px]">
                        <p className="font-display text-xl font-bold">
                          {trip.arrivalTime}
                        </p>
                        <p className="text-xs text-muted-foreground">{to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between sm:w-[180px] border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4 gap-3">
                    <div>
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-semibold mb-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{trip.rating} ★</span>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-muted-foreground">
                          From
                        </p>
                        <p className="font-display text-2xl font-bold text-price">
                          ₹{trip.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-muted-foreground">
                        {trip.availableSeats} seats left
                      </p>
                      {/* Full-width tappable button — important for mobile touch targets */}
                      <Button
                        className="font-semibold shadow-sm group-hover:bg-primary/90 active:scale-95 transition-all"
                        asChild
                      >
                        <Link
                          to="/book/$tripId"
                          params={{ tripId: trip.id }}
                          search={{ step: "seats", bookingId: undefined }}
                        >
                          Select Seats
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPanel() {
  return (
    <Card className="border-border shadow-soft rounded-xl bg-card overflow-hidden">
      <CardContent className="p-5 space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Bus Type
          </h3>
          <div className="space-y-2.5">
            {[
              { id: "ac", label: "AC", defaultChecked: true },
              { id: "non-ac", label: "Non-AC", defaultChecked: false },
              { id: "sleeper", label: "Sleeper", defaultChecked: true },
              { id: "seater", label: "Seater", defaultChecked: false },
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox id={item.id} defaultChecked={item.defaultChecked} />
                <Label htmlFor={item.id} className="font-normal cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-3">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Departure Time
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Before 6 AM",
              "6 AM – 12 PM",
              "12 PM – 6 PM",
              "After 6 PM",
            ].map((slot) => (
              <button
                key={slot}
                type="button"
                className="h-11 flex items-center justify-center rounded-lg border border-border text-xs font-medium hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
