import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getTripById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
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

  const completeBooking = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();

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
      passengerName: "John Doe",
      passengerAge: "28",
      gender: "Male",
      passengerPhone: "+919876543210",
      passengerEmail: "john.doe@example.com"
    };

    try {
      let existing = [];
      const stored = localStorage.getItem("journyx_bookings");
      if (stored) {
        try {
          existing = JSON.parse(stored);
          if (!Array.isArray(existing)) existing = [];
        } catch (parseErr) {
          existing = [];
        }
      }
      localStorage.setItem("journyx_bookings", JSON.stringify([newBooking, ...existing]));
    } catch (err) {
      console.error("Local storage error:", err);
    }

    navigate({
      to: "/book/$tripId",
      params: { tripId },
      search: { step: "confirmation", bookingId: newBookingId },
    });
  };

  const steps = ["Seats", "Confirmation"];
  const stepIndex = step === "seats" ? 0 : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* ── HEADER & STEPPER ────────────────────────────────────────────── */}
      {step !== "confirmation" && (
        <header className="bg-white px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (step === "seats") navigate({ to: "/search", search: { from: "Chennai", to: "Bangalore", date: new Date().toISOString().split("T")[0], passengers: 1 } });
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
      <div className="w-full max-w-xl mx-auto">
        
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
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
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
                   onClick={completeBooking}
                 >
                   Book Now <CheckCircle2 className="ml-2 w-5 h-5" />
                 </Button>
               </div>
            </div>
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
                 <p className="font-semibold text-slate-900">John Doe</p>
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
      </div>
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
