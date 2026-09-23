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
  UserCircle,
  Smartphone,
  Wallet,
  Lock,
  ChevronRight
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

type BookingStep = "seats" | "payment" | "confirmation";

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
  const [selectedPayment, setSelectedPayment] = useState<string>("UPI");

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

  const handleProceedToPayment = () => {
    navigate({
      to: "/book/$tripId",
      params: { tripId },
      search: { step: "payment" },
    });
  };

  const handlePayment = (e?: any) => {
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
      passengerName: "Mugul",
      passengerAge: "28",
      gender: "Male",
      passengerPhone: "+919876543210",
      passengerEmail: "mugul@example.com"
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

  const steps = ["Seats", "Payment", "Confirmation"];
  const stepIndex = step === "seats" ? 0 : step === "payment" ? 1 : 2;

  const totalAmount = selectedSeats.length * trip.price + selectedSeats.length * 50;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* ── HEADER & STEPPER ────────────────────────────────────────────── */}
      {step !== "confirmation" && (
        <header className="bg-white px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (step === "seats") navigate({ to: "/search", search: { from: "Chennai", to: "Bangalore", date: new Date().toISOString().split("T")[0], passengers: 1 } });
                else if (step === "payment") navigate({ to: "/book/$tripId", params: { tripId }, search: { step: "seats" } });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {step === "payment" ? (
              <h1 className="font-display font-bold text-lg">Payment</h1>
            ) : (
              <h1 className="font-display font-bold text-lg">{trip.operator}</h1>
            )}
            <div className="w-10 flex items-center justify-end">
              {step === "payment" && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure
                </div>
              )}
            </div>
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
                      className={`text-[9px] sm:text-[10px] mt-2 font-medium tracking-wide uppercase transition-colors ${
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
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-32 overflow-x-hidden">
            {trip.id.startsWith("train") ? (
              <div className="p-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-slate-300 bg-green-200" /> Lower Berth</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-slate-300 bg-sky-200" /> Upper Berth</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-slate-300 bg-teal-600" /> Selected</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-slate-300 bg-slate-100" /> Booked</div>
              </div>
            ) : trip.id.startsWith("flight") ? (
              <div className="p-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-sky-200" /> Standard</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-green-500" /> Exit row</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-teal-600" /> Selected</div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200" /> Unavailable</div>
              </div>
            ) : (
              <div className="p-4 flex items-center justify-between text-sm text-slate-500 bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" /> Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-teal-600 bg-teal-50" /> Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-slate-200 bg-slate-100" /> Booked</div>
              </div>
            )}

            {trip.id.startsWith("train") ? (
              <div className="mt-8 mx-auto w-full max-w-[340px]">
                <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                   Class : <span className="text-slate-800">First AC</span> &nbsp;&nbsp; Coach Type : <span className="text-slate-800">A</span>
                </div>
                <div className="bg-white border-[3px] border-slate-400 rounded-sm p-1 sm:p-2 shadow-xl shadow-slate-200/50 relative">
                  
                  {/* Top Toilets */}
                  <div className="flex justify-between border-b-[3px] border-slate-400 pb-2 mb-0 relative bg-white">
                    <div className="w-16 h-10 border-2 border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-500 m-1">Toilet</div>
                    <div className="w-16 h-10 border-2 border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-500 m-1">Toilet</div>
                    
                    {/* Top Connectors (bumpers) */}
                    <div className="absolute -top-3 sm:-top-4 left-1/4 w-8 h-2 sm:h-2 bg-slate-500 rounded-t-sm" />
                    <div className="absolute -top-3 sm:-top-4 right-1/4 w-8 h-2 sm:h-2 bg-slate-500 rounded-t-sm" />
                  </div>
                  
                  {/* Cabins */}
                  <div className="border-l-[6px] border-slate-400 pl-2 sm:pl-3 relative bg-white border-b-[3px] border-slate-300 pb-0">
                    <TrainCabin label="A" rows={2} startId={1} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="B" rows={1} startId={5} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="C" rows={2} startId={7} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="D" rows={1} startId={11} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="E" rows={1} startId={13} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="F" rows={2} startId={15} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                    <TrainCabin label="G" rows={1} startId={19} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
                  </div>

                  {/* Bottom Toilets */}
                  <div className="flex justify-between pt-2 mt-0 relative bg-white">
                    <div className="w-16 h-10 border-2 border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-500 m-1">Toilet</div>
                    <div className="w-16 h-10 border-2 border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-500 m-1">Toilet</div>
                    
                    {/* Bottom Connectors (bumpers) */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/4 w-8 h-2 sm:h-2 bg-slate-500 rounded-b-sm" />
                    <div className="absolute -bottom-3 sm:-bottom-4 right-1/4 w-8 h-2 sm:h-2 bg-slate-500 rounded-b-sm" />
                  </div>
                  
                </div>
              </div>
            ) : trip.id.startsWith("flight") ? (
              <div className="mt-8 mx-auto w-full max-w-[340px] relative">
                {/* Airplane Body */}
                <div className="bg-white rounded-[60px] rounded-t-[120px] rounded-b-[80px] p-3 sm:p-5 shadow-xl shadow-slate-200/50 border border-slate-200 relative z-10 mx-4 sm:mx-6 mb-8">
                  {/* Airplane Wings (Decorative) */}
                  <div className="absolute top-[30%] bottom-[40%] -left-8 sm:-left-12 w-8 sm:w-12 bg-sky-200/40 -z-10" style={{ clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 70%)' }}></div>
                  <div className="absolute top-[30%] bottom-[40%] -right-8 sm:-right-12 w-8 sm:w-12 bg-sky-200/40 -z-10" style={{ clipPath: 'polygon(0 0, 100% 30%, 100% 70%, 0 100%)' }}></div>
                  
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 mt-6 border-b-2 border-slate-100 pb-6">
                    Cockpit
                  </div>
                  
                  <div className="grid grid-cols-[16px_repeat(3,auto)_28px_repeat(3,auto)_16px] sm:grid-cols-[20px_repeat(3,auto)_32px_repeat(3,auto)_20px] gap-y-1 justify-center items-center">
                    {Array.from({ length: 22 }).map((_, rowIdx) => {
                      const rowNum = rowIdx + 1;
                      const isExit = rowNum === 9 || rowNum === 10;
                      
                      return (
                        <React.Fragment key={rowNum}>
                          <div className="flex items-center justify-center">
                            {isExit && <div className="text-[6px] sm:text-[8px] text-white bg-green-500 px-1 py-0.5 rounded font-bold -rotate-90 whitespace-nowrap">EXIT</div>}
                          </div>
                          
                          <FlightSeat id={`${rowNum}A`} letter="A" selected={selectedSeats.includes(`${rowNum}A`)} onClick={() => handleSeatClick(`${rowNum}A`)} occupied={rowIdx === 2 || rowIdx === 5} isExit={isExit} />
                          <FlightSeat id={`${rowNum}B`} letter="B" selected={selectedSeats.includes(`${rowNum}B`)} onClick={() => handleSeatClick(`${rowNum}B`)} occupied={rowIdx === 2 || rowIdx === 15} isExit={isExit} />
                          <FlightSeat id={`${rowNum}C`} letter="C" selected={selectedSeats.includes(`${rowNum}C`)} onClick={() => handleSeatClick(`${rowNum}C`)} occupied={rowIdx === 8} isExit={isExit} />
                          
                          <div className="text-center font-bold text-slate-300 text-[10px] sm:text-xs w-6 sm:w-8">
                            {rowNum}
                          </div>
                          
                          <FlightSeat id={`${rowNum}D`} letter="D" selected={selectedSeats.includes(`${rowNum}D`)} onClick={() => handleSeatClick(`${rowNum}D`)} occupied={rowIdx === 6 || rowIdx === 18} isExit={isExit} />
                          <FlightSeat id={`${rowNum}E`} letter="E" selected={selectedSeats.includes(`${rowNum}E`)} onClick={() => handleSeatClick(`${rowNum}E`)} occupied={rowIdx === 1} isExit={isExit} />
                          <FlightSeat id={`${rowNum}F`} letter="F" selected={selectedSeats.includes(`${rowNum}F`)} onClick={() => handleSeatClick(`${rowNum}F`)} occupied={rowIdx === 20} isExit={isExit} />

                          <div className="flex items-center justify-center">
                            {isExit && <div className="text-[6px] sm:text-[8px] text-white bg-green-500 px-1 py-0.5 rounded font-bold rotate-90 whitespace-nowrap">EXIT</div>}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="mt-10 pt-6 border-t-2 border-slate-100 flex justify-center gap-8 sm:gap-12 mb-4">
                     <div className="w-8 h-10 border-2 border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                       <User className="w-4 h-4" />
                       <span className="text-[8px] font-bold mt-0.5">WC</span>
                     </div>
                     <div className="w-8 h-10 border-2 border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                       <User className="w-4 h-4" />
                       <span className="text-[8px] font-bold mt-0.5">WC</span>
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 mx-auto w-[320px] relative pb-8">
                {/* Bus Front Curve */}
                <div className="absolute -top-6 left-0 right-0 h-16 bg-slate-100 rounded-t-[100px] border-t-[4px] border-x-[4px] border-slate-300 -z-10" />
                
                <div className="bg-slate-50/90 backdrop-blur-md rounded-3xl p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border-[4px] border-slate-300 relative mx-auto">
                  
                  {/* Dashboard / Front Area */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-[3px] border-slate-200 relative">
                     <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-200/50 px-2 py-1 rounded">Entry</div>
                     <div className="w-10 h-10 rounded-full border-[3px] border-slate-300 bg-white flex items-center justify-center text-slate-400 shadow-inner relative">
                       {/* Steering Wheel */}
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                         <circle cx="12" cy="12" r="10"/>
                         <circle cx="12" cy="12" r="3"/>
                         <path d="M12 2v7M12 15v7M3.5 8.5l5.5 3.5M20.5 8.5l-5.5 3.5" />
                       </svg>
                       <span className="absolute -bottom-5 text-[8px] font-bold text-slate-400 uppercase tracking-wider">Driver</span>
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
              </div>
            )}
            
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
                   onClick={handleProceedToPayment}
                 >
                   Book Now <CheckCircle2 className="ml-2 w-5 h-5" />
                 </Button>
               </div>
            </div>
          </div>
        )}



        {/* ── Step 2: Payment ─────────────────────────────────────────── */}
        {step === "payment" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-32 px-4 pt-6">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL PAYABLE</p>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">₹{totalAmount}</h2>
              <p className="text-xs text-slate-500 mt-2">
                {selectedSeats.length} seats &middot; Chennai &rarr; Bangalore &middot; {new Date(trip.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </p>
            </div>

            <h3 className="text-sm font-bold text-slate-800 mb-3">Choose a payment method</h3>
            
            <div className="space-y-3 mb-8">
              {/* UPI */}
              <label className={`block flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === "UPI" ? "border-slate-800 ring-1 ring-slate-800 bg-white" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${selectedPayment === "UPI" ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-600"}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">UPI</p>
                  <p className="text-xs text-slate-500 mt-0.5">Pay via Google Pay / PhonePe / Paytm</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === "UPI" ? "border-[#1E3A8A] bg-[#1E3A8A]" : "border-slate-300"}`}>
                  {selectedPayment === "UPI" && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="radio" name="payment" value="UPI" checked={selectedPayment === "UPI"} onChange={() => setSelectedPayment("UPI")} className="sr-only" />
              </label>

              {/* Card */}
              <label className={`block flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === "Card" ? "border-slate-800 ring-1 ring-slate-800 bg-white" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${selectedPayment === "Card" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Card</p>
                  <p className="text-xs text-slate-500 mt-0.5">Credit, debit, prepaid</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === "Card" ? "border-slate-800 bg-slate-800" : "border-slate-300"}`}>
                  {selectedPayment === "Card" && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="radio" name="payment" value="Card" checked={selectedPayment === "Card"} onChange={() => setSelectedPayment("Card")} className="sr-only" />
              </label>

              {/* Wallet */}
              <label className={`block flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === "Wallet" ? "border-slate-800 ring-1 ring-slate-800 bg-white" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${selectedPayment === "Wallet" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Wallet</p>
                  <p className="text-xs text-slate-500 mt-0.5">₹350 balance - save ₹50 with WALLETBOOST</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === "Wallet" ? "border-slate-800 bg-slate-800" : "border-slate-300"}`}>
                  {selectedPayment === "Wallet" && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="radio" name="payment" value="Wallet" checked={selectedPayment === "Wallet"} onChange={() => setSelectedPayment("Wallet")} className="sr-only" />
              </label>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Why we ask</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Payments are PCI-DSS encrypted end to end. Your bank statement will show "ROADRAILS". Refunds reach your account in 3-5 business days.
              </p>
            </div>

            {/* Sticky Bottom Bar for Payment */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
               <div className="max-w-xl mx-auto flex items-center justify-between">
                 <Button
                   size="lg"
                   className="rounded-xl w-full h-14 text-lg shadow-lg active:scale-95 transition-all bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold flex items-center justify-center"
                   onClick={handlePayment}
                 >
                   Pay ₹{totalAmount} via {selectedPayment} <ChevronRight className="ml-2 w-5 h-5" />
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
                 <p className="font-semibold text-slate-900">Mugul</p>
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
  const isAvailable = !occupied && !selected;
  
  // Richer colors for the new "wow" UI
  const strokeColor = occupied ? "#cbd5e1" : selected ? "#0f766e" : "#94a3b8";
  const fillColor = occupied ? "#f8fafc" : selected ? "#14b8a6" : "#ffffff";
  const accentColor = occupied ? "#e2e8f0" : selected ? "#0d9488" : "#f1f5f9";
  const textColor = occupied ? "#94a3b8" : selected ? "#ffffff" : "#64748b";

  return (
    <button
      onClick={!occupied ? onClick : undefined}
      disabled={occupied}
      className={`relative w-full aspect-[36/44] flex items-center justify-center group
        ${occupied ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110 active:scale-95"}
        focus:outline-none transition-all duration-300 ease-out min-w-[32px]`}
      title={occupied ? "Occupied" : `Seat ${id}`}
      type="button"
      aria-label={occupied ? `Seat ${id} occupied` : `Select Seat ${id}`}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${selected ? 'drop-shadow-md' : 'drop-shadow-sm'}`}>
        {/* Main Cushion */}
        <rect x="4" y="8" width="28" height="32" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Headrest */}
        <path d="M10 4C10 2.34315 11.3431 1 13 1H23C24.6569 1 26 2.34315 26 4V9H10V4Z" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Left Armrest */}
        <rect x="1" y="14" width="5" height="18" rx="2.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Right Armrest */}
        <rect x="30" y="14" width="5" height="18" rx="2.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Seat details/contours */}
        <line x1="8" y1="32" x2="28" y2="32" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
      <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold ${textColor} leading-none pointer-events-none mt-1`}>
        {id}
      </span>
    </button>
  );
}

// ── Flight Seat Component ───────────────────────────────────────────────────
function FlightSeat({
  id,
  letter,
  selected,
  occupied,
  isExit,
  onClick,
}: {
  id: string;
  letter: string;
  selected?: boolean;
  occupied?: boolean;
  isExit?: boolean;
  onClick?: () => void;
}) {
  const bgColor = occupied ? "bg-slate-100" : selected ? "bg-teal-600" : isExit ? "bg-green-500" : "bg-sky-200";
  const hoverColor = occupied ? "" : selected ? "hover:bg-teal-700" : isExit ? "hover:bg-green-600" : "hover:bg-sky-300";
  const textColor = occupied ? "text-slate-300" : selected || isExit ? "text-white" : "text-sky-800";
  const borderColor = occupied ? "border-slate-200" : "border-transparent";
  const cursor = occupied ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105 active:scale-95";

  return (
    <button
      onClick={!occupied ? onClick : undefined}
      disabled={occupied}
      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded sm:rounded-md flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all border ${bgColor} ${hoverColor} ${textColor} ${borderColor} ${cursor} m-[2px]`}
      title={occupied ? "Occupied" : `Seat ${id}`}
      type="button"
    >
      {letter}
    </button>
  );
}

// ── Train Components ────────────────────────────────────────────────────────

function TrainBerth({
  id,
  type,
  selected,
  occupied,
  onClick,
}: {
  id: string;
  type: "L" | "U";
  selected?: boolean;
  occupied?: boolean;
  onClick?: () => void;
}) {
  const isLower = type === "L";
  const defaultBg = isLower ? "bg-green-200" : "bg-sky-200";
  const defaultHover = isLower ? "hover:bg-green-300" : "hover:bg-sky-300";
  const defaultText = isLower ? "text-green-800" : "text-sky-800";
  
  const bgColor = occupied ? "bg-slate-100" : selected ? "bg-teal-600" : defaultBg;
  const hoverColor = occupied ? "" : selected ? "hover:bg-teal-700" : defaultHover;
  const textColor = occupied ? "text-slate-300" : selected ? "text-white" : defaultText;
  const borderColor = occupied ? "border-slate-200" : "border-slate-300";
  const cursor = occupied ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105 active:scale-95";

  return (
    <button
      onClick={!occupied ? onClick : undefined}
      disabled={occupied}
      className={`relative w-12 sm:w-16 h-6 sm:h-8 rounded-sm flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all border ${bgColor} ${hoverColor} ${textColor} ${borderColor} ${cursor} z-20`}
      title={occupied ? "Occupied" : `Berth ${id}`}
      type="button"
    >
      {type}
    </button>
  );
}

function TrainCabin({
  label,
  rows,
  selectedSeats,
  handleSeatClick,
  startId,
}: {
  label: string;
  rows: number;
  selectedSeats: string[];
  handleSeatClick: (id: string) => void;
  startId: number;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-t-[3px] border-slate-300 relative">
       <div className="flex flex-col gap-1 z-10 bg-white pr-4">
         {Array.from({ length: rows }).map((_, i) => {
           const lId = `L${startId + i * 2}`;
           const uId = `U${startId + i * 2 + 1}`;
           return (
             <div key={i} className="flex items-center gap-0">
               <TrainBerth id={lId} type="L" selected={selectedSeats.includes(lId)} onClick={() => handleSeatClick(lId)} occupied={(startId + i*2) % 5 === 0} />
               <TrainBerth id={uId} type="U" selected={selectedSeats.includes(uId)} onClick={() => handleSeatClick(uId)} occupied={(startId + i*2 + 1) % 7 === 0} />
             </div>
           );
         })}
       </div>
       
       <div className="flex-shrink-0 pr-4 sm:pr-8 z-10">
         <div className="w-6 h-6 sm:w-8 sm:h-8 border-[1.5px] border-green-500 text-green-700 rounded bg-white flex items-center justify-center font-bold text-xs sm:text-sm relative">
           <div className="absolute inset-y-0 -left-1 w-2 border-l border-y border-green-500 rounded-l-full bg-white z-0"></div>
           <div className="absolute inset-y-0 -right-1 w-2 border-r border-y border-green-500 rounded-r-full bg-white z-0"></div>
           <span className="relative z-10">{label}</span>
         </div>
       </div>
    </div>
  );
}

