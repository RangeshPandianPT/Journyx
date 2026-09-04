import type {
  Booking,
  BusClass,
  ProviderStatus,
  Seat,
  SeatMap,
  StopPoint,
  Trip,
} from "@/lib/domain/types";
import {
  AMENITIES,
  BUS_OPERATORS,
  cityLabel,
  routeDistanceKm,
} from "@/lib/data/reference";
import { createRng, intBetween, pick, sample } from "@/lib/utils/seeded-random";
import type { BusProvider, ProviderResult, TripSearchQuery } from "./types";

const STATUS: ProviderStatus = "DEMO_DATA";

const BOARDING_SPOTS = [
  { name: "Koyambedu (CMBT)", landmark: "Gate 3, Platform B" },
  { name: "Guindy", landmark: "Opposite Kathipara flyover" },
  { name: "Perungalathur", landmark: "Bypass service road" },
  { name: "Vadapalani", landmark: "Near Sivan temple" },
  { name: "Madhavaram", landmark: "Bus terminus bay 7" },
];

const DROPPING_SPOTS = [
  { name: "Madiwala", landmark: "Silk Board signal" },
  { name: "Majestic", landmark: "Kempegowda bus station" },
  { name: "Electronic City", landmark: "Toll gate" },
  { name: "Hebbal", landmark: "Flyover service lane" },
  { name: "Anand Rao Circle", landmark: "Near Sangam theatre" },
];

const BUS_CLASSES: BusClass[] = [
  "AC Sleeper",
  "Non-AC Sleeper",
  "AC Seater",
  "Non-AC Seater",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function addMinutesISO(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function timeOfISO(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function buildTripId(from: string, to: string, date: string, index: number) {
  return `bus_${from.toLowerCase()}_${to.toLowerCase()}_${date}_${index}`;
}

function parseTripId(tripId: string) {
  const parts = tripId.split("_");
  if (parts.length !== 5 || parts[0] !== "bus") return null;
  return { from: parts[1]!, to: parts[2]!, date: parts[3]!, index: Number(parts[4]) };
}

function buildTrip(
  from: string,
  to: string,
  date: string,
  index: number,
  passengers: number,
): Trip {
  const rng = createRng(`${from}|${to}|${date}|${index}`);
  const operator = BUS_OPERATORS[index % BUS_OPERATORS.length]!;
  const distance = routeDistanceKm(from, to);
  const busClass = pick(rng, BUS_CLASSES);
  const ac = busClass.startsWith("AC");
  const sleeper = busClass.includes("Sleeper");

  const departHour = (17 + index * 2 + intBetween(rng, 0, 2)) % 24;
  const departMinute = pick(rng, [0, 10, 15, 30, 45]);
  const departureISO = `${date}T${pad(departHour)}:${pad(departMinute)}:00.000Z`;
  const speed = 42 + rng() * 12;
  const durationMinutes = Math.round((distance / speed) * 60) + intBetween(rng, 10, 45);
  const arrivalISO = addMinutesISO(departureISO, durationMinutes);

  const fareBase = Math.round(distance * (sleeper ? 3.1 : 2.4) * (ac ? 1.22 : 1));
  const baseFare = Math.round((fareBase + intBetween(rng, -60, 140)) / 10) * 10 + 9;

  const totalSeats = sleeper ? 30 : 40;
  const seatsAvailable = intBetween(rng, Math.max(passengers, 2), totalSeats - 4);

  const boardingPoints: StopPoint[] = sample(
    rng,
    BOARDING_SPOTS,
    intBetween(rng, 3, 4),
  ).map((spot, i) => ({
    id: `bp_${index}_${i}`,
    name: spot.name,
    landmark: spot.landmark,
    time: timeOfISO(addMinutesISO(departureISO, i * 20)),
  }));

  const droppingPoints: StopPoint[] = sample(
    rng,
    DROPPING_SPOTS,
    intBetween(rng, 3, 4),
  ).map((spot, i) => ({
    id: `dp_${index}_${i}`,
    name: spot.name,
    landmark: spot.landmark,
    time: timeOfISO(addMinutesISO(arrivalISO, i * 18)),
  }));

  const refundable = rng() > 0.25;

  return {
    id: buildTripId(from, to, date, index),
    transportType: "bus",
    providerId: operator.id,
    providerName: operator.name,
    providerStatus: STATUS,
    vehicleNumber: `TN ${intBetween(rng, 10, 99)} ${pick(rng, ["AB", "BX", "CJ", "DK"])} ${intBetween(rng, 1000, 9999)}`,
    vehicleLabel: `${busClass} (${sleeper ? "2+1" : "2+2"})`,
    fromCityId: from,
    toCityId: to,
    departureISO,
    arrivalISO,
    durationMinutes,
    baseFare,
    seatsAvailable,
    totalSeats,
    rating: Math.round((operator.rating + (rng() - 0.5) * 0.4) * 10) / 10,
    ratingCount: intBetween(rng, 120, 4200),
    amenities: sample(rng, AMENITIES, intBetween(rng, 3, 6)),
    boardingPoints,
    droppingPoints,
    farePolicy: {
      refundable,
      tiers: refundable
        ? [
            { beforeHours: 24, refundPercent: 90 },
            { beforeHours: 12, refundPercent: 70 },
            { beforeHours: 4, refundPercent: 50 },
            { beforeHours: 0, refundPercent: 0 },
          ]
        : [{ beforeHours: 0, refundPercent: 0 }],
    },
    instructions: [
      "Reach the boarding point 15 minutes before departure.",
      "Carry a government photo ID matching the passenger name.",
      "Operator contact details are shared on the ticket.",
    ],
    meta: { ac, sleeper, busClass },
  };
}

function buildSeatMap(trip: Trip): SeatMap {
  const rng = createRng(`seats|${trip.id}`);
  const sleeper = trip.meta.sleeper === true;
  const seats: Seat[] = [];
  const rows = sleeper ? 5 : 10;
  const columns = sleeper ? 3 : 4;
  const decks: Array<"lower" | "upper"> = sleeper ? ["lower", "upper"] : ["lower"];
  const occupancy = 1 - trip.seatsAvailable / trip.totalSeats;

  for (const deck of decks) {
    for (let row = 1; row <= rows; row += 1) {
      for (let col = 1; col <= columns; col += 1) {
        const prefix = sleeper ? (deck === "lower" ? "L" : "U") : "S";
        const label = `${prefix}${(row - 1) * columns + col}`;
        const window = col === 1 || col === columns;
        const premium = row <= 2 && window;
        const price =
          trip.baseFare + (premium ? 120 : 0) + (deck === "upper" ? -60 : 0);
        seats.push({
          id: `${trip.id}_${label}`,
          label,
          deck,
          row,
          column: col,
          berth: sleeper ? (deck === "upper" ? "upper" : "lower") : "seater",
          window,
          price,
          occupied: rng() < occupancy,
          premium,
          womenOnly: !sleeper && row === 3 && col <= 2,
        });
      }
    }
  }

  return {
    tripId: trip.id,
    providerStatus: STATUS,
    layout: sleeper ? "sleeper" : "seater",
    columnsPerDeck: columns,
    aisleAfterColumn: sleeper ? 2 : 2,
    decks,
    seats,
  };
}

export const demoBusProvider: BusProvider = {
  id: "demo-bus",
  name: "Journyx Demo Bus Network",
  transportType: "bus",
  status: STATUS,

  async searchTrips(query: TripSearchQuery): Promise<ProviderResult<Trip[]>> {
    const from = cityLabel(query.from);
    const to = cityLabel(query.to);
    const rng = createRng(`count|${from}|${to}|${query.date}`);
    const count = intBetween(rng, 8, 14);
    const trips = Array.from({ length: count }, (_, i) =>
      buildTrip(from, to, query.date, i, query.passengers),
    ).sort((a, b) => a.departureISO.localeCompare(b.departureISO));
    return { status: STATUS, providerName: demoBusProvider.name, data: trips };
  },

  async getTripDetails(tripId: string): Promise<ProviderResult<Trip | null>> {
    const parsed = parseTripId(tripId);
    if (!parsed || Number.isNaN(parsed.index)) {
      return { status: STATUS, providerName: demoBusProvider.name, data: null };
    }
    const trip = buildTrip(
      cityLabel(parsed.from),
      cityLabel(parsed.to),
      parsed.date,
      parsed.index,
      1,
    );
    return { status: STATUS, providerName: demoBusProvider.name, data: trip };
  },

  async getSeatMap(tripId: string): Promise<ProviderResult<SeatMap | null>> {
    const details = await demoBusProvider.getTripDetails(tripId);
    if (!details.data) {
      return { status: STATUS, providerName: demoBusProvider.name, data: null };
    }
    return {
      status: STATUS,
      providerName: demoBusProvider.name,
      data: buildSeatMap(details.data),
    };
  },

  async reserveSeat(tripId: string, seatLabels: string[]) {
    const map = await demoBusProvider.getSeatMap(tripId);
    const held: string[] = [];
    const rejected: string[] = [];
    for (const label of seatLabels) {
      const seat = map.data?.seats.find((s) => s.label === label);
      if (!seat || seat.occupied) rejected.push(label);
      else held.push(label);
    }
    return {
      status: STATUS,
      providerName: demoBusProvider.name,
      data: { held, rejected },
    };
  },

  async createBooking(booking: Booking) {
    return {
      status: STATUS,
      providerName: demoBusProvider.name,
      data: { reference: booking.reference },
    };
  },

  async cancelBooking() {
    return {
      status: STATUS,
      providerName: demoBusProvider.name,
      data: { cancelled: true },
    };
  },

  async getBookingStatus() {
    return {
      status: STATUS,
      providerName: demoBusProvider.name,
      data: { status: "CONFIRMED" as const },
    };
  },
};
