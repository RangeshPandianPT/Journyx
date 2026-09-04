import type { Booking, FarePolicy, FareBreakdown } from "@/lib/domain/types";

export const CONVENIENCE_FEE_PER_SEAT = 25;
export const TAX_RATE = 0.05;

/** Pure fare maths — shared by review, payment, ticket and admin views. */
export function computeFare(seatPrices: number[]): FareBreakdown {
  const seatFare = seatPrices.reduce((sum, p) => sum + p, 0);
  const convenienceFee = CONVENIENCE_FEE_PER_SEAT * Math.max(1, seatPrices.length);
  const taxes = Math.round(seatFare * TAX_RATE);
  return {
    baseFare: seatPrices[0] ?? 0,
    seatFare,
    taxes,
    convenienceFee,
    total: seatFare + taxes + convenienceFee,
  };
}

export function refundPercentFor(
  policy: FarePolicy,
  departureISO: string,
  nowISO = new Date().toISOString(),
): number {
  if (!policy.refundable) return 0;
  const hoursLeft =
    (new Date(departureISO).getTime() - new Date(nowISO).getTime()) / 3_600_000;
  const tiers = [...policy.tiers].sort((a, b) => b.beforeHours - a.beforeHours);
  for (const tier of tiers) {
    if (hoursLeft >= tier.beforeHours) return tier.refundPercent;
  }
  return 0;
}

export function computeRefund(booking: Booking, nowISO = new Date().toISOString()) {
  const percent = refundPercentFor(
    booking.trip.farePolicy,
    booking.trip.departureISO,
    nowISO,
  );
  const amount = Math.round((booking.fare.total * percent) / 100);
  return { refundPercent: percent, refundAmount: amount };
}

export function formatMoney(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function formatDayDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function todayISODate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
