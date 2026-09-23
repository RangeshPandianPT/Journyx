import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/")(({
  component: Index,
}));

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
  "Kochi",
];

const quickSuggestions = [
  { from: "Chennai", to: "Bangalore" },
  { from: "Chennai", to: "Pondicherry" },
  { from: "Chennai", to: "Coimbatore" },
  { from: "Bangalore", to: "Chennai" },
  { from: "Chennai", to: "Madurai" },
];

const todayStr = () => new Date().toISOString().split("T")[0];

function NativeSelect({
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  options,
  className,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  options: string[];
  className?: string;
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
        <Icon className="h-5 w-5" />
      </div>
      {/* Native <select> — works perfectly on all mobile WebViews without any freeze.
          Radix UI Select uses a Portal which can trap pointer events in Capacitor WebView. */}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-16 w-full pl-12 pr-4 rounded-xl border border-border",
          "bg-surface-muted hover:bg-surface focus:bg-surface",
          "transition-colors text-base font-medium shadow-none",
          "appearance-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "cursor-pointer",
          !value && "text-muted-foreground"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"bus" | "train" | "flight">("bus");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(todayStr());
  const [passengers, setPassengers] = useState("1");

  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    navigate({
      to: "/search",
      search: { from, to, date, passengers: Number(passengers), type: activeTab },
    });
  };

  const fillQuickSuggestion = (suggestion: { from: string; to: string }) => {
    setFrom(suggestion.from);
    setTo(suggestion.to);
    setDate(todayStr());
  };

  const tabs = [
    { value: "bus", label: "Bus", icon: Bus },
    { value: "train", label: "Train", icon: Train },
    { value: "flight", label: "Aeroplane", icon: Plane },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-background" />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[10%] -right-[10%] w-[40%] h-[50%] rounded-full bg-teal-500/10 blur-[100px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_100%)]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="container-page flex flex-col items-center text-center space-y-6"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-3xl"
            >
              Where are you going?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light"
            >
              Find the right transport, choose your seat, and book your journey
              in minutes.
            </motion.p>

            {/* Search Module */}
            <div className="w-full max-w-5xl mt-8">
              {/* Animated Vehicle Hero */}
              <div className="flex justify-center h-32 items-center overflow-hidden mb-4 relative">
                <AnimatePresence mode="wait">
                  {activeTab === "bus" && (
                    <motion.div
                      key="bus"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="text-primary flex flex-col items-center"
                    >
                      <Bus className="w-20 h-20 sm:w-24 sm:h-24" />
                      <motion.div 
                        className="h-1.5 w-32 bg-primary/20 rounded-full mt-2" 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      />
                    </motion.div>
                  )}
                  {activeTab === "train" && (
                    <motion.div
                      key="train"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="text-primary flex flex-col items-center"
                    >
                      <Train className="w-20 h-20 sm:w-24 sm:h-24" />
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className="h-1.5 w-6 bg-primary/20 rounded-full" 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "flight" && (
                    <motion.div
                      key="flight"
                      initial={{ y: 50, scale: 0.8, opacity: 0, rotate: -15 }}
                      animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ y: -50, scale: 0.8, opacity: 0, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="text-primary flex flex-col items-center"
                    >
                      <Plane className="w-20 h-20 sm:w-24 sm:h-24" />
                      <motion.div 
                        className="h-1.5 w-24 bg-primary/20 rounded-full mt-2" 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tab Selector — using plain buttons with framer-motion enhancements */}
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 p-1 bg-surface-muted border border-border shadow-soft rounded-xl w-full max-w-md relative">
                  {tabs.map(({ value, label, icon: Icon }) => {
                    const isActive = activeTab === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setActiveTab(value)}
                        className={cn(
                          "relative z-10 flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-medium text-sm transition-all duration-300",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-lg shadow-md -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <AnimatePresence mode="popLayout">
                          {isActive ? (
                            <motion.div
                              key="icon-active"
                              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                              animate={{ scale: 1, opacity: 1, rotate: 0 }}
                              exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </AnimatePresence>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Card className="border-border/50 shadow-raise overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl ring-1 ring-black/5">
                  <CardContent className="p-4 sm:p-5">
                    <form
                    onSubmit={handleSearch}
                    className="flex flex-col lg:flex-row items-stretch gap-2"
                  >
                    {/* From & To with Swap */}
                    <div className="flex flex-col sm:flex-row w-full lg:w-2/5 gap-2 relative">
                      <NativeSelect
                        name="from"
                        value={from}
                        onChange={setFrom}
                        placeholder="From"
                        icon={MapPin}
                        options={CITIES}
                      />

                      {/* Swap Button — desktop (absolute center) */}
                      <button
                        type="button"
                        onClick={swapCities}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-surface-muted active:scale-95 transition-all cursor-pointer text-primary"
                        title="Swap cities"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </button>

                      <NativeSelect
                        name="to"
                        value={to}
                        onChange={setTo}
                        placeholder="To"
                        icon={MapPin}
                        options={CITIES}
                      />
                    </div>

                    {/* Swap Button — mobile only */}
                    <button
                      type="button"
                      onClick={swapCities}
                      className="sm:hidden self-center flex h-9 items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-muted hover:bg-surface text-sm font-medium text-muted-foreground active:scale-95 transition-all"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Swap
                    </button>

                    {/* Date — using native <input type="date"> instead of
                        Radix Popover+Calendar. Radix Popover uses a Portal which
                        captures pointer events in Capacitor WebView and never
                        releases them, freezing the entire UI. */}
                    <div className="relative w-full lg:w-1/4">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <input
                        type="date"
                        name="date"
                        value={date}
                        min={todayStr()}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className={cn(
                          "h-16 w-full pl-12 pr-4 rounded-xl border border-border",
                          "bg-surface-muted hover:bg-surface focus:bg-surface",
                          "transition-colors text-base font-medium shadow-none",
                          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "cursor-pointer [color-scheme:light]"
                        )}
                      />
                    </div>

                    {/* Passengers */}
                    <div className="relative w-full lg:w-[170px]">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <User className="h-5 w-5" />
                      </div>
                      <select
                        name="passengers"
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        className={cn(
                          "h-16 w-full pl-12 pr-4 rounded-xl border border-border",
                          "bg-surface-muted hover:bg-surface focus:bg-surface",
                          "transition-colors text-base font-medium shadow-none",
                          "appearance-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "cursor-pointer"
                        )}
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
                    <div className="w-full lg:w-auto lg:ml-2">
                      <Button
                        type="submit"
                        disabled={!from || !to || !date}
                        className="w-full lg:w-[140px] h-16 rounded-xl text-lg shadow-md font-semibold gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <Search className="h-5 w-5" />
                        <span>Search</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              </motion.div>

              {/* Quick Suggestions */}
              <div className="mt-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Popular Routes
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickSuggestions.map((route, i) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                      whileHover={{ scale: 1.05, borderColor: "var(--color-primary)" }}
                      whileTap={{ scale: 0.95 }}
                      key={i}
                      type="button"
                      onClick={() => fillQuickSuggestion(route)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white/80 backdrop-blur-md hover:bg-white transition-colors text-sm font-medium shadow-sm group hover:shadow-md"
                    >
                      <span>{route.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>{route.to}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Section */}
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
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/50 shadow-soft"
                >
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

      {/* Footer */}
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
