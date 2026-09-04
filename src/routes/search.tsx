import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { generateMockTrips } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, User, Search, Clock, ShieldCheck, BusFront, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  component: SearchResults,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      from: (search.from as string) || "Chennai",
      to: (search.to as string) || "Bangalore",
      date: (search.date as string) || new Date().toISOString().split("T")[0],
      passengers: Number(search.passengers) || 1,
    };
  },
});

function SearchResults() {
  const { from, to, date, passengers } = Route.useSearch();
  const trips = generateMockTrips(from, to, date);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-20">
      {/* Top modification bar */}
      <div className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-lg font-medium">
            <span>{from}</span>
            <ArrowRight className="h-5 w-5 opacity-70" />
            <span>{to}</span>
          </div>
          <div className="flex items-center gap-6 text-sm opacity-90 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{passengers} Passenger(s)</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white" onClick={() => navigate({ to: "/" })}>
              Modify
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page mt-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <button className="text-sm text-primary font-medium hover:underline">Clear All</button>
          </div>

          <Card className="border-border shadow-soft rounded-xl bg-card overflow-hidden">
            <CardContent className="p-5 space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Bus Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ac" defaultChecked />
                    <Label htmlFor="ac" className="font-normal cursor-pointer">AC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="non-ac" />
                    <Label htmlFor="non-ac" className="font-normal cursor-pointer">Non-AC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sleeper" defaultChecked />
                    <Label htmlFor="sleeper" className="font-normal cursor-pointer">Sleeper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="seater" />
                    <Label htmlFor="seater" className="font-normal cursor-pointer">Seater</Label>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Departure Time</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs justify-center items-center font-normal hover:border-primary hover:bg-primary/5">
                    <span>Before 6 AM</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs justify-center items-center font-normal hover:border-primary hover:bg-primary/5">
                    <span>6 AM - 12 PM</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs justify-center items-center font-normal hover:border-primary hover:bg-primary/5">
                    <span>12 PM - 6 PM</span>
                  </Button>
                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs justify-center items-center font-normal border-primary bg-primary/5">
                    <span>After 6 PM</span>
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">{trips.length} Buses Found</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <select className="bg-transparent font-medium text-foreground outline-none cursor-pointer p-1 rounded hover:bg-surface-muted transition-colors">
                <option>Recommended</option>
                <option>Cheapest</option>
                <option>Fastest</option>
                <option>Earliest Departure</option>
              </select>
            </div>
          </div>

          {trips.map(trip => (
            <Card key={trip.id} className="border-border shadow-soft hover:shadow-raise transition-all rounded-xl bg-card overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6">
                  
                  {/* Left Column: Operator & Timing */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{trip.operator}</h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <BusFront className="h-4 w-4" />
                          {trip.busType} • {trip.isAC ? "A/C" : "Non A/C"} {trip.isSleeper ? "Sleeper" : "Seater"}
                        </p>
                      </div>
                      {!trip.isLive && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                          Demo Data
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold">{trip.departureTime}</p>
                        <p className="text-xs text-muted-foreground mt-1">Chennai</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">{trip.duration}</span>
                        <div className="w-full relative flex items-center justify-center">
                          <div className="absolute w-full h-[2px] bg-border-strong top-1/2 -translate-y-1/2 rounded-full"></div>
                          <div className="relative z-10 w-2 h-2 rounded-full bg-border-strong"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold">{trip.arrivalTime}</p>
                        <p className="text-xs text-muted-foreground mt-1 text-right">Bangalore</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Price & Action */}
                  <div className="lg:w-[220px] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                    <div className="flex items-start justify-between lg:flex-col lg:items-end gap-2">
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{trip.rating} ★</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Starting from</p>
                        <p className="font-display text-3xl font-bold text-price">₹{trip.price}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-2">
                      <p className="text-xs text-center text-muted-foreground font-medium">
                        {trip.availableSeats} Seats available
                      </p>
                      <Button className="w-full font-semibold shadow-md group-hover:bg-primary/90" asChild>
                        <Link to={`/book/${trip.id}`} search={{ step: "seats" }}>
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
