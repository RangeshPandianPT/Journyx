import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getTripById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Check,
  Armchair,
  MapPin,
  ShieldCheck,
  ReceiptText,
  Bus,
  UserCircle
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type BookingStep = "seats" | "booking" | "confirmation";

export const Route = createFileRoute("/book/$tripId")({
  component: BookingFlow,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      step: (search["step"] as BookingStep) ?? ("seats" as BookingStep),
      bookingId: search["bookingId"] as string | undefined,
    };
  },
});

function BookingFlow() {
  const { tripId } = Route.useParams();
  const routeSearch = Route.useSearch();
  const step = routeSearch["step"] as BookingStep;
  const bookingId = routeSearch["bookingId"] as string | undefined;
  const navigate = useNavigate();
  const trip = getTripById(tripId);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [validationError, setValidationError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <Bus className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Trip Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          We couldn't find the trip you're looking for. It may have departed or been cancelled.
        </p>
        <Button
          size="lg"
          className="rounded-full shadow-lg active:scale-95 transition-all w-full max-w-sm"
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

  const proceedToBooking = () => {
    if (selectedSeats.length > 0) {
      navigate({
        from: Route.fullPath,
        search: { step: "booking" as BookingStep, bookingId: undefined },
      });
    }
  };

  const completeBooking = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (!passengerName.trim()) {
      setValidationError("Please enter the passenger's full name.");
      return;
    }

    const ageNum = parseInt(passengerAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setValidationError("Please enter a valid age.");
      return;
    }

    const phoneRegex = /^(?:\+91[-\s]?)?[6-9]\d{9}$/;
    if (!phoneRegex.test(passengerPhone.trim())) {
      setValidationError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(passengerEmail.trim())) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setValidationError("");
    const newBookingId = `JNX-${Math.floor(Math.random() * 1000000)}`;
    const newBooking = {
      id: newBookingId,
      operator: trip.operator,
      from: "Chennai",
      to: "Bangalore",
      date: trip.departureTime,
      status: "Upcoming",
      amount: selectedSeats.length * trip.price + selectedSeats.length * 50,
      seats: selectedSeats.join(", "),
      isDemo: true,
      passengerName,
      passengerAge,
      gender,
      passengerPhone,
      passengerEmail
    };

    const existing = JSON.parse(localStorage.getItem("journyx_bookings") || "[]");
    localStorage.setItem("journyx_bookings", JSON.stringify([newBooking, ...existing]));

    setShowSuccessDialog(true);
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    setSelectedSeats([]);
    setPassengerName("");
    setPassengerAge("");
    setPassengerPhone("");
    setPassengerEmail("");
    setGender("Male");

    navigate({
      to: "/my-bookings",
    });
  };

  const steps = ["Seats", "Booking"];
  const stepIndex = step === "seats" ? 0 : step === "booking" ? 1 : 2;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* ── HEADER & STEPPER ────────────────────────────────────────────── */}
      {step !== "confirmation" && (
        <header className="bg-white px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (step === "seats") navigate({ to: "/search", search: { from: "Chennai", to: "Bangalore", date: new Date().toISOString().split("T")[0], passengers: 1 } });
                if (step === "booking") navigate({ from: Route.fullPath, search: { step: "seats" as BookingStep, bookingId: undefined } });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg">{trip.operator}</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            {steps.map((label, i) => {
              const isActive = stepIndex === i;
              const isDone = stepIndex > i;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isDone
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                          : isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-110"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-2 font-medium tracking-wide uppercase transition-colors ${
                        isActive ? "text-slate-900" : isDone ? "text-teal-600" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 rounded-full mb-5 transition-colors ${
                        isDone ? "bg-teal-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </header>
      )}

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto">
        
        {/* ── Step 1: Seat Selection ──────────────────────────────────── */}
        {step === "seats" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
            <div className="p-4 flex items-center justify-between text-sm text-slate-500 bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" /> Available</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-teal-600 bg-teal-50" /> Selected</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-slate-200 bg-slate-100" /> Booked</div>
            </div>

            <div className="mt-6 mx-auto w-[280px] bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1 rounded-full font-semibold tracking-widest uppercase">
                Lower Deck
              </div>
              
              <div className="flex justify-end mb-6 pb-4 border-b border-dashed border-slate-200">
                 <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                 </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 9 }).map((_, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    <Seat id={`A${rowIdx + 1}`} selected={selectedSeats.includes(`A${rowIdx + 1}`)} onClick={() => handleSeatClick(`A${rowIdx + 1}`)} occupied={rowIdx === 2 || rowIdx === 5 || rowIdx === 8} />
                    <Seat id={`B${rowIdx + 1}`} selected={selectedSeats.includes(`B${rowIdx + 1}`)} onClick={() => handleSeatClick(`B${rowIdx + 1}`)} occupied={rowIdx === 2 || rowIdx === 7} />
                    <div className="col-span-1" />
                    <Seat id={`C${rowIdx + 1}`} selected={selectedSeats.includes(`C${rowIdx + 1}`)} onClick={() => handleSeatClick(`C${rowIdx + 1}`)} occupied={rowIdx === 8} />
                    <Seat id={`D${rowIdx + 1}`} selected={selectedSeats.includes(`D${rowIdx + 1}`)} onClick={() => handleSeatClick(`D${rowIdx + 1}`)} occupied={rowIdx === 6 || rowIdx === 8} />
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Sticky Bottom Bar for Seats */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
               <div className="max-w-xl mx-auto flex items-center justify-between">
                 <div>
                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                     {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''} Selected
                   </p>
                   <p className="text-xl font-bold text-slate-900">
                     ₹{selectedSeats.length * trip.price}
                   </p>
                 </div>
                 <Button
                   size="lg"
                   className="rounded-full px-8 shadow-lg active:scale-95 transition-all bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                   disabled={selectedSeats.length === 0}
                   onClick={proceedToBooking}
                 >
                   Continue <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
               </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Booking Details & Review ────────────────────────── */}
        {step === "booking" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-4 pb-40">
            
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6 flex items-start gap-4">
              <div className="bg-teal-100 p-2 rounded-full text-teal-700 mt-1">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Selected Seats</h3>
                <p className="text-teal-700 font-medium text-lg mt-0.5">{selectedSeats.join(", ")}</p>
              </div>
            </div>

            <form onSubmit={completeBooking} noValidate className="space-y-6 relative z-30">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-slate-400" /> Primary Passenger
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Enter exactly as on ID"
                        autoComplete="name"
                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-[16px] focus-visible:ring-teal-600 focus-visible:ring-offset-0 scroll-mt-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Age</Label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={passengerAge}
                          onChange={(e) => setPassengerAge(e.target.value)}
                          placeholder="Years"
                          autoComplete="off"
                          className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-[16px] focus-visible:ring-teal-600 focus-visible:ring-offset-0 scroll-mt-40"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Gender</Label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-base px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-600 transition-shadow"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-400" /> Contact Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="tel"
                        inputMode="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 Mobile Number"
                        autoComplete="tel"
                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-[16px] focus-visible:ring-teal-600 focus-visible:ring-offset-0 scroll-mt-40"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="email"
                        inputMode="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="Tickets will be sent here"
                        autoComplete="email"
                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-[16px] focus-visible:ring-teal-600 focus-visible:ring-offset-0 scroll-mt-40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-slate-400" /> Fare Breakdown
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Fare ({selectedSeats.length} × ₹{trip.price})</span>
                    <span className="font-medium text-slate-900">₹{selectedSeats.length * trip.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & Platform Fees</span>
                    <span className="font-medium text-slate-900">₹{selectedSeats.length * 50}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Amount Payable</p>
                    <p className="text-2xl font-bold text-teal-700">₹{selectedSeats.length * trip.price + selectedSeats.length * 50}</p>
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="animate-in slide-in-from-bottom-2 bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>{validationError}</p>
                </div>
              )}

              {/* Sticky Bottom Bar for Pay */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
                 <div className="max-w-xl mx-auto flex gap-3">
                   <Button
                     type="submit"
                     size="lg"
                     className="h-14 flex-1 rounded-2xl shadow-lg active:scale-95 transition-all bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2"
                   >
                     Confirm & Pay Securely <CreditCard className="w-5 h-5" />
                   </Button>
                 </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 4: Confirmation ────────────────────────────────────── */}
        {step === "confirmation" && (
          <div className="animate-in zoom-in-95 fade-in duration-500 p-6 pt-12 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-12 h-12 text-green-600 relative z-10" />
            </div>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-500 mb-8">Your tickets have been sent to your email.</p>
            
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl w-full p-6 text-left mb-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
                   <p className="font-mono font-bold text-lg text-slate-800 bg-slate-100 px-3 py-1 rounded-lg inline-block">{bookingId}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Paid</p>
                   <p className="font-bold text-xl text-teal-700">₹{selectedSeats.length * trip.price + selectedSeats.length * 50}</p>
                 </div>
               </div>
               
               <div className="flex items-center justify-between py-4 border-y border-dashed border-slate-200">
                 <div>
                   <p className="font-bold text-lg">Chennai</p>
                   <p className="text-sm text-slate-500">{trip.departureTime}</p>
                 </div>
                 <ArrowRight className="text-slate-300 w-6 h-6" />
                 <div className="text-right">
                   <p className="font-bold text-lg">Bangalore</p>
                   <p className="text-sm text-slate-500">{trip.arrivalTime}</p>
                 </div>
               </div>
               
               <div className="pt-4 mt-2">
                 <p className="font-semibold text-slate-900">{passengerName}</p>
                 <p className="text-sm text-slate-500">Seats: {selectedSeats.join(", ")}</p>
               </div>
            </div>

            <div className="w-full space-y-3">
              <Button asChild className="w-full h-14 rounded-full text-lg shadow-lg active:scale-95 transition-all bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                <Link to="/my-bookings">View Tickets</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full h-14 rounded-full text-slate-600 font-semibold hover:bg-slate-100">
                <Link to="/">Book Another Trip</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <AlertDialog open={showSuccessDialog} onOpenChange={handleCloseDialog}>
        <AlertDialogContent className="rounded-3xl max-w-sm w-[90vw] mx-auto p-6 gap-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-8 h-8 text-green-600 relative z-10" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-bold font-display text-slate-900 mb-2">
                Booking Confirmed!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500">
                Your ticket has been booked successfully and the details have been sent to your email.
              </AlertDialogDescription>
            </div>
          </div>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleCloseDialog} className="w-full h-14 rounded-full text-lg shadow-lg active:scale-95 transition-all bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              View in My Bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Seat Component ──────────────────────────────────────────────────────────
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
  const strokeColor = occupied ? "#cbd5e1" : selected ? "#0d9488" : "#94a3b8";
  const fillColor = occupied ? "#f1f5f9" : selected ? "#ccfbf1" : "#ffffff";
  const dotColor = occupied ? "#ef4444" : selected ? "#14b8a6" : "transparent";

  return (
    <button
      onClick={!occupied ? onClick : undefined}
      disabled={occupied}
      className={`relative w-full aspect-[36/44] flex items-center justify-center group
        ${occupied ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105 active:scale-95"}
        focus:outline-none transition-transform min-w-[32px]`}
      title={occupied ? "Occupied" : `Seat ${id}`}
      type="button"
      aria-label={occupied ? `Seat ${id} occupied` : `Select Seat ${id}`}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="28" height="34" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="8" y="1" width="20" height="6" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="1" y="12" width="4" height="20" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="31" y="12" width="4" height="20" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {(selected || occupied) && <circle cx="18" cy="24" r="5" fill={dotColor} />}
      </svg>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold text-slate-500 leading-none pointer-events-none">
        {id}
      </span>
    </button>
  );
}
