import type {
  Booking,
  BookingDraft,
  Passenger,
  PassengerBooking,
  Payment,
  PaymentMethod,
  Trip,
} from "@/lib/domain/types";
import { computeFare, computeRefund } from "@/lib/services/fare";
import { bookingsRepo, newId, notificationsRepo } from "@/lib/storage/local-repo";

/** Booking service — the only place that turns a draft into a booking record. */

export function bookingReference(): string {
  return `JX${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now()
    .toString()
    .slice(-4)}`;
}

export function draftFromTrip(input: {
  trip: Trip;
  seats: BookingDraft["seats"];
  boardingPointId: string;
  droppingPointId: string;
  trainClass?: BookingDraft["trainClass"];
}): BookingDraft {
  return {
    tripId: input.trip.id,
    transportType: input.trip.transportType,
    trip: input.trip,
    seats: input.seats,
    boardingPointId: input.boardingPointId,
    droppingPointId: input.droppingPointId,
    passengers: [],
    contact: { phone: "", email: "" },
    ...(input.trainClass ? { trainClass: input.trainClass } : {}),
    createdAtISO: new Date().toISOString(),
  };
}

export function passengerBookings(draft: BookingDraft): PassengerBooking[] {
  return draft.seats.map((seat, i) => {
    const passenger: Passenger =
      draft.passengers[i] ??
      ({ id: newId("psg"), fullName: "Passenger", age: 30, gender: "other" } as Passenger);
    return {
      id: newId("pb"),
      passenger,
      seatLabel: seat.label,
      berth: seat.berth,
      fare: seat.price,
    };
  });
}

export function createBookingFromDraft(
  draft: BookingDraft,
  payment: {
    method: PaymentMethod;
    transactionId: string;
    status: "SUCCESS" | "FAILED";
  },
): Booking {
  const fare = computeFare(draft.seats.map((s) => s.price));
  const id = newId("bkg");
  const paymentRecord: Payment = {
    id: newId("pay"),
    bookingId: id,
    method: payment.method,
    amount: fare.total,
    status: payment.status,
    environment: "SANDBOX",
    transactionId: payment.transactionId,
    createdAtISO: new Date().toISOString(),
  };

  const boarding =
    draft.trip.boardingPoints.find((p) => p.id === draft.boardingPointId) ??
    draft.trip.boardingPoints[0]!;
  const dropping =
    draft.trip.droppingPoints.find((p) => p.id === draft.droppingPointId) ??
    draft.trip.droppingPoints[0]!;

  const booking: Booking = {
    id,
    reference: bookingReference(),
    transportType: draft.transportType,
    dataMode: "DEMO_DATA",
    trip: draft.trip,
    fromCity: draft.trip.fromCityId,
    toCity: draft.trip.toCityId,
    boardingPoint: boarding,
    droppingPoint: dropping,
    passengers: passengerBookings(draft),
    fare,
    status: "CONFIRMED",
    contact: draft.contact,
    createdAtISO: new Date().toISOString(),
    payment: paymentRecord,
    cancellation: null,
    ...(draft.trainClass ? { trainClass: draft.trainClass } : {}),
  };

  bookingsRepo.save(booking);
  notificationsRepo.push({
    kind: "booking",
    title: `Booking confirmed — ${booking.reference}`,
    body: `${booking.fromCity} → ${booking.toCity} with ${booking.trip.providerName}. Demo booking, sandbox payment.`,
    bookingId: booking.id,
  });
  notificationsRepo.push({
    kind: "payment",
    title: `Sandbox payment of ₹${fare.total.toLocaleString("en-IN")} succeeded`,
    body: `Transaction ${payment.transactionId}. No real money was charged.`,
    bookingId: booking.id,
  });
  notificationsRepo.push({
    kind: "reminder",
    title: "Trip reminder scheduled",
    body: `Your ${booking.fromCity} → ${booking.toCity} journey departs at ${new Date(
      booking.trip.departureISO,
    )
      .toISOString()
      .slice(11, 16)} on ${booking.trip.departureISO.slice(0, 10)}.`,
    bookingId: booking.id,
  });

  return booking;
}

export function cancelBooking(bookingId: string, reason: string): Booking | null {
  const booking = bookingsRepo.get(bookingId);
  if (!booking || booking.status !== "CONFIRMED") return null;
  const { refundAmount, refundPercent } = computeRefund(booking);
  const updated: Booking = {
    ...booking,
    status: "CANCELLED",
    cancellation: {
      id: newId("cnl"),
      bookingId: booking.id,
      reason,
      refundAmount,
      refundPercent,
      createdAtISO: new Date().toISOString(),
    },
  };
  bookingsRepo.save(updated);
  notificationsRepo.push({
    kind: "cancellation",
    title: `Booking ${booking.reference} cancelled`,
    body:
      refundAmount > 0
        ? `Demo refund of ₹${refundAmount.toLocaleString("en-IN")} (${refundPercent}%) recorded.`
        : "This fare was outside the refund window, so no refund was recorded.",
    bookingId: booking.id,
  });
  return updated;
}

export function bookingBucket(booking: Booking): "upcoming" | "completed" | "cancelled" {
  if (booking.status === "CANCELLED") return "cancelled";
  return new Date(booking.trip.arrivalISO).getTime() < Date.now() ? "completed" : "upcoming";
}

/** Downloadable artefacts — ticket text and calendar invite. */
export function ticketFileName(booking: Booking) {
  return `journyx-ticket-${booking.reference}.txt`;
}

export function ticketText(booking: Booking) {
  const lines = [
    "JOURNYX — DEMO TICKET (not valid for boarding)",
    "==============================================",
    `Booking reference : ${booking.reference}`,
    `Status            : ${booking.status}`,
    `Transport         : ${booking.transportType.toUpperCase()} — ${booking.trip.vehicleLabel}`,
    `Operator          : ${booking.trip.providerName}`,
    `Vehicle           : ${booking.trip.vehicleNumber}`,
    `Journey           : ${booking.fromCity} → ${booking.toCity}`,
    `Departure         : ${booking.trip.departureISO.replace("T", " ").slice(0, 16)}`,
    `Arrival           : ${booking.trip.arrivalISO.replace("T", " ").slice(0, 16)}`,
    `Boarding          : ${booking.boardingPoint.name} (${booking.boardingPoint.time})`,
    `Dropping          : ${booking.droppingPoint.name} (${booking.droppingPoint.time})`,
    "",
    "Passengers",
    ...booking.passengers.map(
      (p) =>
        `  • ${p.passenger.fullName}, ${p.passenger.age}/${p.passenger.gender[0]?.toUpperCase()} — seat ${p.seatLabel} (${p.berth})`,
    ),
    "",
    `Total paid        : ₹${booking.fare.total.toLocaleString("en-IN")} (SANDBOX)`,
    `Transaction       : ${booking.payment?.transactionId ?? "—"}`,
  ];
  return lines.join("\n");
}

export function calendarInvite(booking: Booking) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Journyx//Demo Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@journyx.demo`,
    `DTSTAMP:${stamp(booking.createdAtISO)}`,
    `DTSTART:${stamp(booking.trip.departureISO)}`,
    `DTEND:${stamp(booking.trip.arrivalISO)}`,
    `SUMMARY:${booking.fromCity} to ${booking.toCity} — ${booking.trip.providerName}`,
    `DESCRIPTION:Journyx demo booking ${booking.reference}. Seats ${booking.passengers
      .map((p) => p.seatLabel)
      .join(", ")}.`,
    `LOCATION:${booking.boardingPoint.name}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
