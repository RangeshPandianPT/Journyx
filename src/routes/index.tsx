import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bus,
  Train,
  Plane,
  MapPin,
  Calendar as CalendarIcon,
  User,
  Search,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [date, setDate] = useState<Date | undefined>();
  
  const CITIES = [
    "Chennai",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Delhi",
    "Pune",
    "Coimbatore",
    "Madurai",
    "Pondicherry",
    "Kochi"
  ];

  const quickSuggestions = [
    { from: "Chennai", to: "Bangalore" },
    { from: "Chennai", to: "Pondicherry" },
    { from: "Chennai", to: "Coimbatore" },
    { from: "Bangalore", to: "Chennai" },
    { from: "Chennai", to: "Madurai" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

          <div className="container-page flex flex-col items-center text-center space-y-6">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-3xl">
              Where are you going?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light">
              Find the right transport, choose your seat, and book your journey
              in minutes.
            </p>

            {/* Search Module */}
            <div className="w-full max-w-5xl mt-8">
              <Tabs defaultValue="bus" className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList className="grid w-full max-w-md grid-cols-3 h-14 p-1 bg-surface-muted border border-border shadow-soft rounded-xl">
                    <TabsTrigger
                      value="bus"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2"
                    >
                      <Bus className="h-4 w-4" />
                      <span className="hidden sm:inline">Bus</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="train"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2"
                    >
                      <Train className="h-4 w-4" />
                      <span className="hidden sm:inline">Train</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="flight"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-medium flex gap-2"
                    >
                      <Plane className="h-4 w-4" />
                      <span className="hidden sm:inline">Aeroplane</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="bus" className="mt-0 outline-none">
                  <Card className="border-border shadow-raise overflow-hidden bg-card rounded-2xl">
                    <CardContent className="p-2 sm:p-4">
                      <form action="/search" className="flex flex-col lg:flex-row items-center gap-2">
                        {/* From & To with Swap */}
                        <div className="flex flex-col sm:flex-row w-full lg:w-2/5 gap-2 relative group">
                          <div className="relative flex-1">
                            <Label htmlFor="from" className="sr-only">
                              Leaving from
                            </Label>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <Select name="from">
                              <SelectTrigger className="h-16 pl-12 rounded-xl border-border bg-surface-muted hover:bg-surface focus:bg-surface transition-colors text-base font-medium shadow-none w-full outline-none focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="From" />
                              </SelectTrigger>
                              <SelectContent>
                                {CITIES.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Swap Button */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-surface-muted transition-colors cursor-pointer text-primary">
                            <ArrowRightLeft className="h-4 w-4" />
                          </div>

                          <div className="relative flex-1">
                            <Label htmlFor="to" className="sr-only">
                              Going to
                            </Label>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <Select name="to">
                              <SelectTrigger className="h-16 pl-12 rounded-xl border-border bg-surface-muted hover:bg-surface focus:bg-surface transition-colors text-base font-medium shadow-none w-full outline-none focus:ring-0 focus:ring-offset-0 sm:pl-10">
                                <SelectValue placeholder="To" />
                              </SelectTrigger>
                              <SelectContent>
                                {CITIES.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="relative w-full lg:w-1/4">
                          <Label htmlFor="date" className="sr-only">
                            Travel Date
                          </Label>
                          <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-16 w-full justify-start text-left font-medium rounded-xl border-border bg-surface-muted hover:bg-surface transition-colors shadow-none text-base pl-4",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Passengers */}
                        <div className="relative w-full lg:w-1/4">
                          <Label htmlFor="passengers" className="sr-only">
                            Passengers
                          </Label>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <User className="h-5 w-5" />
                          </div>
                          <select
                            id="passengers"
                            name="passengers"
                            className="h-16 w-full pl-12 pr-4 rounded-xl border border-border bg-surface-muted hover:bg-surface focus:bg-surface transition-colors text-base font-medium shadow-none appearance-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer"
                          >
                            <option value="1">1 Passenger</option>
                            <option value="2">2 Passengers</option>
                            <option value="3">3 Passengers</option>
                            <option value="4">4 Passengers</option>
                            <option value="5">5 Passengers</option>
                            <option value="6">6+ Passengers</option>
                          </select>
                        </div>

                        {/* Search Button */}
                        <div className="w-full lg:w-auto mt-2 lg:mt-0 lg:ml-2">
                          <Button type="submit" className="w-full lg:w-[140px] h-16 rounded-xl text-lg shadow-md font-semibold gap-2">
                            <Search className="h-5 w-5" />
                            <span>Search</span>
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Placeholders for other tabs */}
                <TabsContent value="train" className="mt-0">
                  <Card className="border-border shadow-raise overflow-hidden bg-card rounded-2xl h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground font-medium">Train search coming soon...</p>
                  </Card>
                </TabsContent>
                <TabsContent value="flight" className="mt-0">
                  <Card className="border-border shadow-raise overflow-hidden bg-card rounded-2xl h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground font-medium">Aeroplane search coming soon...</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full max-w-5xl mt-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Popular Routes
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {quickSuggestions.map((route, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-primary hover:bg-surface transition-all text-sm font-medium shadow-sm group"
                  >
                    <span>{route.from}</span>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{route.to}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section Placeholder */}
        <section className="py-20 bg-surface border-t border-border">
          <div className="container-page">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Seamless Booking",
                  desc: "Find and book your transport in just a few clicks.",
                },
                {
                  title: "Live Seat Selection",
                  desc: "Choose exactly where you want to sit with real-time availability.",
                },
                {
                  title: "Secure Payments",
                  desc: "Fast, reliable, and completely secure transactions.",
                },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/50 shadow-soft">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container-page flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Journyx</span>
          </div>
          <p>© {new Date().getFullYear()} Journyx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
