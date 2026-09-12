import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getTripById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import React, { useState, useEffect } from "react";

type BookingStep = "seats" | "passenger" | "review" | "confirmation";

export const Route = createFileRoute("/book/$tripId")({
  component: BookingFlow,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      step: (search["step"] as BookingStep) ?? ("seats" as BookingStep),
      bookingId: search["bookingId"] as string | undefined,
    };
  },
});

// Store booking state in a module-level ref so it survives URL-driven re-renders.
// React state resets if the component unmounts; using a ref bag avoids that.
const bookingState = {
  selectedSeats: [] as string[],
  passengerName: "",
  passengerAge: "",
  passengerPhone: "",
  passengerEmail: "",
  gender: "Male",
};

function BookingFlow() {
  const { tripId } = Route.useParams();
  const routeSearch = Route.useSearch();
  const step = routeSearch["step"] as BookingStep;
  const bookingId = routeSearch["bookingId"] as string | undefined;
  const navigate = useNavigate();
  const trip = getTripById(tripId);

  // All state kept at this level so it is preserved across step URL changes.
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    bookingState.selectedSeats
  );
  const [passengerName, setPassengerName] = useState(bookingState.passengerName);
  const [passengerAge, setPassengerAge] = useState(bookingState.passengerAge);
  const [passengerPhone, setPassengerPhone] = useState(bookingState.passengerPhone);
  const [passengerEmail, setPassengerEmail] = useState(bookingState.passengerEmail);
  const [gender, setGender] = useState(bookingState.gender);
  const [validationError, setValidationError] = useState("");

  // Persist to module-level so values survive remounts
  useEffect(() => {
    bookingState.selectedSeats = selectedSeats;
  }, [selectedSeats]);
  useEffect(() => {
    bookingState.passengerName = passengerName;
    bookingState.passengerAge = passengerAge;
    bookingState.passengerPhone = passengerPhone;
    bookingState.passengerEmail = passengerEmail;
    bookingState.gender = gender;
  }, [passengerName, passengerAge, passengerPhone, passengerEmail, gender]);

  // ── Scroll to top on every step change ─────────────────────────────────────
  // Without this, on mobile the user stays at their previous scroll position
  // after tapping "Continue", which makes the app look frozen.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          Trip not found
        </p>
        <Button
          onClick={() =>
            navigate({
              to: "/search",
              search: { from: "Chennai", to: "Bangalore", date: new Date().toISOString().split("T")[0], passengers: 1 },
            })
          }
        >
          Back to Search
        </Button>
      </div>
    );
  }

  const handleSeatClick = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const proceedToPassenger = () => {
    if (selectedSeats.length > 0) {
      navigate({
        from: Route.fullPath,
        search: { step: "passenger" as BookingStep, bookingId: undefined },
      });
    }
  };

  const proceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    handleContinueToReview();
  };

  const handleContinueToReview = () => {
    if (!passengerName || !passengerAge || !passengerPhone || !passengerEmail) {
      setValidationError("Please fill in all required fields.");
      return;
    }
    setValidationError("");
    navigate({
      from: Route.fullPath,
      search: { step: "review" as BookingStep, bookingId: undefined },
    });
  };

  const completeBooking = () => {
    const newBookingId = `JNX-${Math.floor(Math.random() * 1000000)}`;
    const newBooking = {
      id: newBookingId,
      operator: trip.operator,
      from: "Chennai",
      to: "Bangalore",
      date: trip.departureTime,
      status: "Upcoming",
      amount:
        selectedSeats.length * trip.price + selectedSeats.length * 50,
      seats: selectedSeats.join(", "),
      isDemo: true,
    };

    // Save to localStorage for "My Bookings" page
    const existing = JSON.parse(
      localStorage.getItem("journyx_bookings") || "[]"
    );
    localStorage.setItem(
      "journyx_bookings",
      JSON.stringify([newBooking, ...existing])
    );

    // Reset module-level state for next booking
    bookingState.selectedSeats = [];
    bookingState.passengerName = "";
    bookingState.passengerAge = "";
    bookingState.passengerPhone = "";
    bookingState.passengerEmail = "";

    navigate({
      from: Route.fullPath,
      search: { step: "confirmation" as BookingStep, bookingId: newBookingId },
    });
  };

  const stepIndex =
    step === "seats" ? 0 : step === "passenger" ? 1 : step === "review" ? 2 : 3;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Progress Steps */}
      <div className="bg-card border-b border-border py-4 sticky top-16 z-40">
        <div className="container-page flex items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm font-medium overflow-x-auto">
          {["Seats", "Passenger", "Review"].map((label, i) => {
            const isActive = stepIndex === i;
            const isDone = stepIndex > i;
            return (
              <React.Fragment key={label}>
                {i > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={
                    isDone
                      ? "text-green-600 font-semibold"
                      : isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }
                >
                  {i + 1}. {label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="container-page mt-6 max-w-4xl">
        {/* ── Step 1: Seat Selection ──────────────────────────────────────── */}
        {step === "seats" && (
          <div className="max-w-2xl mx-auto md:max-w-4xl">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() =>
                navigate({
                  to: "/search",
                  search: { from: "Chennai", to: "Bangalore", date: new Date().toISOString().split("T")[0], passengers: 1 },
                })
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Seat Map */}
              <div className="md:col-span-2 space-y-4">
                <Card className="border-border shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center text-base">
                      <span>Select your seats</span>
                      {!trip.isLive && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                          Demo Data
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
                        Available
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border-2 border-teal-600 bg-teal-50" />
                        Selected
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border-2 border-slate-200 bg-slate-100" />
                        Occupied
                      </div>
                    </div>

                    {/* Bus Layout — responsive grid with max-width */}
                    <div className="w-full max-w-[300px] mx-auto border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                      {/* Driver section */}
                      <div className="p-3 border-b border-border bg-surface flex justify-between items-center">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Lower Deck
                        </span>
                        <div className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center bg-surface-muted text-muted-foreground">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                      </div>

                      {/* Seat grid: 4 seats + 1 aisle column = 5 columns */}
                      <div className="p-4 grid grid-cols-5 gap-2">
                        {Array.from({ length: 10 }).map((_, rowIdx) => (
                          <React.Fragment key={rowIdx}>
                            <Seat
                              id={`A${rowIdx + 1}`}
                              selected={selectedSeats.includes(`A${rowIdx + 1}`)}
                              onClick={() => handleSeatClick(`A${rowIdx + 1}`)}
                              occupied={
                                rowIdx === 2 || rowIdx === 5 || rowIdx === 9
                              }
                            />
                            <Seat
                              id={`B${rowIdx + 1}`}
                              selected={selectedSeats.includes(`B${rowIdx + 1}`)}
                              onClick={() => handleSeatClick(`B${rowIdx + 1}`)}
                              occupied={rowIdx === 2 || rowIdx === 9}
                            />
                            {/* Aisle spacer */}
                            <div className="col-span-1" />
                            <Seat
                              id={`C${rowIdx + 1}`}
                              selected={selectedSeats.includes(`C${rowIdx + 1}`)}
                              onClick={() => handleSeatClick(`C${rowIdx + 1}`)}
                              occupied={rowIdx === 9}
                            />
                            <Seat
                              id={`D${rowIdx + 1}`}
                              selected={selectedSeats.includes(`D${rowIdx + 1}`)}
                              onClick={() => handleSeatClick(`D${rowIdx + 1}`)}
                              occupied={rowIdx === 8 || rowIdx === 9}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trip Summary Sidebar */}
              <div className="space-y-4">
                <Card className="border-border shadow-soft md:sticky md:top-36">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Trip Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-bold">{trip.operator}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.departureTime} → {trip.arrivalTime}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {trip.busType} •{" "}
                        {trip.isAC ? "A/C" : "Non A/C"} •{" "}
                        {trip.isSleeper ? "Sleeper" : "Seater"}
                      </p>
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Seats Selected
                        </span>
                        <span className="font-medium text-right max-w-[120px] break-words">
                          {selectedSeats.length > 0
                            ? selectedSeats.join(", ")
                            : "None"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Price / seat
                        </span>
                        <span>₹{trip.price}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total Fare</span>
                        <span className="text-price">
                          ₹{selectedSeats.length * trip.price}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full active:scale-[0.98] transition-all"
                      disabled={selectedSeats.length === 0}
                      onClick={proceedToPassenger}
                    >
                      Continue
                    </Button>
                    {selectedSeats.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground">
                        Tap a seat above to select
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Passenger Details ───────────────────────────────────── */}
        {step === "passenger" && (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() =>
                navigate({ from: Route.fullPath, search: { step: "seats" as BookingStep, bookingId: undefined } })
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seats
            </Button>

            <Card className="border-border shadow-soft">
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Seats:{" "}
                  <span className="font-medium text-foreground">
                    {selectedSeats.join(", ")}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={proceedToReview}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      inputMode="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter full name"
                      autoComplete="off"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={120}
                        value={passengerAge}
                        onChange={(e) => setPassengerAge(e.target.value)}
                        placeholder="Age"
                        autoComplete="off"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      autoComplete="off"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="off"
                      className="h-12 text-base"
                    />
                  </div>

                  {validationError && (
                    <p className="text-sm text-destructive font-medium text-center">{validationError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base active:scale-[0.98] transition-all"
                  >
                    Continue to Review
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Step 3: Review ──────────────────────────────────────────────── */}
        {step === "review" && (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() =>
                navigate({ from: Route.fullPath, search: { step: "passenger" as BookingStep, bookingId: undefined } })
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Edit Details
            </Button>

            <Card className="border-border shadow-soft mb-5">
              <CardHeader>
                <CardTitle>Review Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Trip Info */}
                <div className="flex justify-between bg-surface-muted p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-bold text-lg">{trip.operator}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.busType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{trip.departureTime}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.arrivalTime}
                    </p>
                  </div>
                </div>

                {/* Passenger Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">
                      Passenger
                    </p>
                    <p className="font-semibold">
                      {passengerName} ({passengerAge}, {gender})
                    </p>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Seats</p>
                    <p className="font-semibold">{selectedSeats.join(", ")}</p>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Phone</p>
                    <p className="font-semibold">{passengerPhone}</p>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Email</p>
                    <p className="font-semibold break-all">{passengerEmail}</p>
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Base Fare ({selectedSeats.length} seat
                      {selectedSeats.length > 1 ? "s" : ""})
                    </span>
                    <span>₹{selectedSeats.length * trip.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span>₹{selectedSeats.length * 50}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-price border-t border-border pt-3 mt-2">
                    <span>Total Amount</span>
                    <span>
                      ₹
                      {selectedSeats.length * trip.price +
                        selectedSeats.length * 50}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold active:scale-[0.98] transition-all"
                  onClick={completeBooking}
                >
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Step 4: Confirmation ────────────────────────────────────────── */}
        {step === "confirmation" && (
          <div className="max-w-xl mx-auto text-center mt-8">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your demo booking was created successfully.
            </p>
            <p className="text-sm font-mono bg-surface-muted px-3 py-1 rounded-lg inline-block mb-8 border border-border">
              {bookingId}
            </p>

            <Card className="border-border shadow-soft text-left mb-8">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Passenger</p>
                    <p className="font-bold">{passengerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {passengerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="font-bold">{selectedSeats.join(", ")}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-base">Chennai</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.departureTime}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground h-5 w-5" />
                  <div className="text-right">
                    <p className="font-bold text-base">Bangalore</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.arrivalTime}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Total Paid
                  </span>
                  <span className="text-price font-bold text-lg">
                    ₹
                    {selectedSeats.length * trip.price +
                      selectedSeats.length * 50}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild className="active:scale-95 transition-all">
                <Link to="/my-bookings">View My Bookings</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="active:scale-95 transition-all"
              >
                <Link to="/">Book Another</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Seat Component ──────────────────────────────────────────────────────────
// Uses min-w to ensure touch target is never too small on small screens.
function Seat({
  id,
  selected,
  occupied,
  onClick,
}: {
  id: string;
  selected?: boolean;
  occupied?: boolean;
  onClick?: () => void;
}) {
  const strokeColor = occupied ? "#cbd5e1" : selected ? "#0f766e" : "#94a3b8";
  const fillColor = occupied ? "#e2e8f0" : selected ? "#f0fdfa" : "#ffffff";
  const dotColor = occupied ? "#ef4444" : selected ? "#10b981" : "transparent";

  return (
    <button
      onClick={!occupied ? onClick : undefined}
      disabled={occupied}
      className={`relative w-full aspect-[36/44] flex items-center justify-center group
        ${occupied ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-105 active:scale-95"}
        focus:outline-none transition-transform min-w-[32px]`}
      title={occupied ? "Occupied" : `Seat ${id}`}
      type="button"
      aria-label={occupied ? `Seat ${id} occupied` : `Select Seat ${id}`}
      aria-pressed={selected}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 36 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform"
      >
        {/* Main Seat Body */}
        <rect
          x="4"
          y="6"
          width="28"
          height="34"
          rx="3"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Headrest */}
        <rect
          x="8"
          y="1"
          width="20"
          height="6"
          rx="2"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Left Armrest */}
        <rect
          x="1"
          y="12"
          width="4"
          height="20"
          rx="1.5"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Right Armrest */}
        <rect
          x="31"
          y="12"
          width="4"
          height="20"
          rx="1.5"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Status Dot */}
        {(selected || occupied) && (
          <circle cx="18" cy="24" r="5" fill={dotColor} />
        )}
      </svg>
      {/* Seat label */}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold text-muted-foreground leading-none pointer-events-none">
        {id}
      </span>
    </button>
  );
}
