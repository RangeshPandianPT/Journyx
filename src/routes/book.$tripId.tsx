import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getTripById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import React, { useState } from "react";

export const Route = createFileRoute("/book/$tripId")({
  component: BookingFlow,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      step: (search.step as "seats" | "passenger" | "review" | "confirmation") || "seats",
      bookingId: search.bookingId as string | undefined,
    };
  },
});

function BookingFlow() {
  const { tripId } = Route.useParams();
  const { step, bookingId } = Route.useSearch();
  const navigate = useNavigate();
  const trip = getTripById(tripId);

  // State to hold booking data across steps
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");

  if (!trip) {
    return <div className="p-8 text-center">Trip not found</div>;
  }

  const handleSeatClick = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const proceedToPassenger = () => {
    if (selectedSeats.length > 0) {
      navigate({ search: { step: "passenger" } });
    }
  };

  const proceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengerName && passengerAge && passengerEmail) {
      navigate({ search: { step: "review" } });
    }
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
      amount: (selectedSeats.length * trip.price) + (selectedSeats.length * 50),
      seats: selectedSeats.join(", "),
      isDemo: true
    };
    
    // Save booking to localStorage for "My Bookings" page
    const existing = JSON.parse(localStorage.getItem("journyx_bookings") || "[]");
    localStorage.setItem("journyx_bookings", JSON.stringify([newBooking, ...existing]));
    
    navigate({ search: { step: "confirmation", bookingId: newBookingId } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-4">
        <div className="container-page flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-muted-foreground overflow-x-auto">
          <span className={step === "seats" ? "text-primary font-bold" : ""}>1. Seats</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step === "passenger" ? "text-primary font-bold" : ""}>2. Passenger</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step === "review" ? "text-primary font-bold" : ""}>3. Review</span>
        </div>
      </div>

      <div className="container-page mt-8 max-w-4xl">
        
        {step === "seats" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button variant="ghost" className="mb-4" onClick={() => navigate({ to: "/search" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card className="border-border shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Select your seats</span>
                      {!trip.isLive && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">Demo Data</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Realistic Bus Layout Simulation */}
                    <div className="w-full max-w-[320px] mx-auto border border-border rounded-lg bg-card shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-border bg-surface flex justify-between items-center">
                        <span className="text-sm font-semibold text-muted-foreground">Lower Deck</span>
                        <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center bg-surface-muted text-muted-foreground">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="3"/>
                            <line x1="12" y1="2" x2="12" y2="9"/>
                            <line x1="3.34" y1="17" x2="9.4" y2="13.5"/>
                            <line x1="20.66" y1="17" x2="14.6" y2="13.5"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="p-6 grid grid-cols-5 gap-3 gap-y-5">
                        {/* 10 rows of seats */}
                        {Array.from({ length: 10 }).map((_, rowIdx) => (
                          <React.Fragment key={rowIdx}>
                            <Seat id={`A${rowIdx + 1}`} selected={selectedSeats.includes(`A${rowIdx + 1}`)} onClick={() => handleSeatClick(`A${rowIdx + 1}`)} occupied={rowIdx === 2 || rowIdx === 5 || rowIdx === 9} />
                            <Seat id={`B${rowIdx + 1}`} selected={selectedSeats.includes(`B${rowIdx + 1}`)} onClick={() => handleSeatClick(`B${rowIdx + 1}`)} occupied={rowIdx === 2 || rowIdx === 9} />
                            <div className="col-span-1"></div> {/* Aisle */}
                            <Seat id={`C${rowIdx + 1}`} selected={selectedSeats.includes(`C${rowIdx + 1}`)} onClick={() => handleSeatClick(`C${rowIdx + 1}`)} occupied={rowIdx === 9} />
                            <Seat id={`D${rowIdx + 1}`} selected={selectedSeats.includes(`D${rowIdx + 1}`)} onClick={() => handleSeatClick(`D${rowIdx + 1}`)} occupied={rowIdx === 8 || rowIdx === 9} />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border shadow-soft sticky top-24">
                  <CardHeader>
                    <CardTitle>Trip Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-bold">{trip.operator}</p>
                      <p className="text-sm text-muted-foreground">{trip.departureTime} → {trip.arrivalTime}</p>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Seats Selected</span>
                        <span className="font-medium">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-4">
                        <span>Total Fare</span>
                        <span className="text-price">₹{selectedSeats.length * trip.price}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4" disabled={selectedSeats.length === 0} onClick={proceedToPassenger}>
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === "passenger" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => navigate({ search: { step: "seats" } })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seats
            </Button>
            
            <Card className="border-border shadow-soft">
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={proceedToReview} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required value={passengerName} onChange={e => setPassengerName(e.target.value)} placeholder="Enter full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" required value={passengerAge} onChange={e => setPassengerAge(e.target.value)} placeholder="Age" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select id="gender" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required value={passengerEmail} onChange={e => setPassengerEmail(e.target.value)} placeholder="Enter email for ticket" />
                  </div>
                  <Button type="submit" className="w-full">Continue to Review</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "review" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => navigate({ search: { step: "passenger" } })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Edit Details
            </Button>
            
            <Card className="border-border shadow-soft mb-6">
              <CardHeader>
                <CardTitle>Review Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between bg-surface-muted p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-bold text-lg">{trip.operator}</p>
                    <p className="text-sm text-muted-foreground">{trip.busType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{trip.departureTime}</p>
                    <p className="text-sm text-muted-foreground">Chennai</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Passenger</p>
                    <p className="font-medium">{passengerName} ({passengerAge})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{passengerEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Seats</p>
                    <p className="font-medium">{selectedSeats.join(", ")}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span>₹{selectedSeats.length * trip.price}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span>₹{selectedSeats.length * 50}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-price border-t border-border pt-4">
                    <span>Total Amount</span>
                    <span>₹{(selectedSeats.length * trip.price) + (selectedSeats.length * 50)}</span>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg" onClick={completeBooking}>Proceed to Confirm Booking</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "confirmation" && (
          <div className="animate-in zoom-in-95 duration-500 max-w-xl mx-auto text-center mt-12">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Your sandbox booking has been created successfully. Booking ID: {bookingId}</p>
            
            <Card className="border-border shadow-soft text-left mb-8">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Passenger</p>
                    <p className="font-bold">{passengerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-bold">{selectedSeats.join(", ")}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="font-bold text-lg">Chennai</p>
                    <p className="text-sm text-muted-foreground">{trip.departureTime}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-bold text-lg">Bangalore</p>
                    <p className="text-sm text-muted-foreground">{trip.arrivalTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/my-bookings">View Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Book Another</Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Seat component for the layout
function Seat({ id, selected, occupied, onClick }: { id: string; selected?: boolean; occupied?: boolean; onClick?: () => void }) {
  const strokeColor = occupied ? "#cbd5e1" : selected ? "#0f766e" : "#94a3b8";
  const fillColor = occupied ? "#e2e8f0" : "#ffffff";
  // Red dot for occupied, Green dot for selected
  const dotColor = occupied ? "#ef4444" : selected ? "#10b981" : "transparent"; 

  return (
    <button 
      onClick={!occupied ? onClick : undefined}
      className={`relative w-full aspect-[36/44] flex items-center justify-center group ${occupied ? "cursor-not-allowed opacity-80" : "cursor-pointer"} focus:outline-none`}
      title={occupied ? "Occupied" : `Select Seat ${id}`}
      type="button"
    >
      <svg width="100%" height="100%" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-[1.05]">
        {/* Main Seat Body */}
        <rect x="4" y="6" width="28" height="34" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5"/>
        {/* Headrest */}
        <rect x="8" y="1" width="20" height="6" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5"/>
        {/* Left Armrest */}
        <rect x="1" y="12" width="4" height="20" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5"/>
        {/* Right Armrest */}
        <rect x="31" y="12" width="4" height="20" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5"/>
        
        {/* Status Dot */}
        {(selected || occupied) && <circle cx="18" cy="24" r="5" fill={dotColor} />}
      </svg>
    </button>
  );
}
