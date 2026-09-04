import type {
  Booking,
  ProviderStatus,
  Seat,
  SeatMap,
  StopPoint,
  TrainClassAvailability,
  Trip,
} from "@/lib/domain/types";
import { TRAIN_NAMES, cityLabel, routeDistanceKm } from "@/lib/data/reference";
import { createRng, intBetween, pick } from "@/lib/utils/seeded-random";
import type { ProviderResult, TrainProvider, TripSearchQuery } from "./types";

const STATUS: ProviderStatus = "DEMO_DATA";

const CLASS_MULTIPLIER: Record<string, number> = {
  "1A": 4.2,
  "2A": 2.6,
  "3A": 1.8,
  SL: 0.9,
  CC: 1.4,
};

const CLASS_LABEL: Record<string, string> = {
  "1A": "AC First Class",
  "2A": "AC 2 Tier",
  "3A": "AC 3 Tier",
  SL: "Sleeper",
  CC: "Chair Car",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function addMinutesISO(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function timeOf(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function tripId(from: string, to: string, date: string, index: number) {
  return `train_${from.toLowerCase()}_${to.toLowerCase()}_${date}_${index}`;
}

function parse(id: string) {
  const p = id.split("_");
  if (p.length !== 5 || p[0] !== "train") return null;
  return { from: p[1]!, to: p[2]!, date: p[3]!, index: Number(p[4]) };
}

function build(from: string, to: string, date: string, index: number): Trip {
  const rng = createRng(`train|${from}|${to}|${date}|${index}`);
  const train = TRAIN_NAMES[index % TRAIN_NAMES.length]!;
  const distance = routeDistanceKm(from, to);
  const departHour = (6 + index * 3) % 24;
  const departureISO = `${date}T${pad(departHour)}:${pad(pick(rng, [0, 15, 25, 40]))}:00.000Z`;
  const durationMinutes = Math.round((distance / (58 + rng() * 14)) * 60);
  const arrivalISO = addMinutesISO(departureISO, durationMinutes);
  const sleeperFare = Math.round((distance * 0.9 + 60) / 5) * 5;

  const classes: TrainClassAvailability[] = (
    index % 3 === 0 ? ["CC", "2A", "1A"] : ["SL", "3A", "2A", "1A"]
  ).map((code) => {
    const available = intBetween(rng, 0, 68);
    return {
      code: code as TrainClassAvailability["code"],
      label: CLASS_LABEL[code]!,
      fare: Math.round((sleeperFare * CLASS_MULTIPLIER[code]!) / 5) * 5,
      available,
      status: available > 12 ? "AVAILABLE" : available > 0 ? "RAC" : "WAITLIST",
    };
  });

  const junctionFrom: StopPoint = {
    id: `tbp_${index}`,
    name: `${from} Central`,
    landmark: `Platform ${intBetween(rng, 1, 11)}`,
    time: timeOf(departureISO),
  };
  const junctionTo: StopPoint = {
    id: `tdp_${index}`,
    name: `${to} Junction`,
    landmark: `Platform ${intBetween(rng, 1, 9)}`,
    time: timeOf(arrivalISO),
  };

  return {
    id: tripId(from, to, date, index),
    transportType: "train",
    providerId: "demo-train",
    providerName: "Indian Railways (demo inventory)",
    providerStatus: STATUS,
    vehicleNumber: train.number,
    vehicleLabel: train.name,
    fromCityId: from,
    toCityId: to,
    departureISO,
    arrivalISO,
    durationMinutes,
    baseFare: classes[0]!.fare,
    seatsAvailable: classes.reduce((sum, c) => sum + c.available, 0),
    totalSeats: 320,
    rating: Math.round((3.8 + rng() * 0.9) * 10) / 10,
    ratingCount: intBetween(rng, 200, 3000),
    amenities: ["Pantry car", "Charging point", "Bedroll on request"],
    boardingPoints: [junctionFrom],
    droppingPoints: [junctionTo],
    farePolicy: {
      refundable: true,
      tiers: [
        { beforeHours: 48, refundPercent: 90 },
        { beforeHours: 12, refundPercent: 65 },
        { beforeHours: 4, refundPercent: 40 },
        { beforeHours: 0, refundPercent: 0 },
      ],
    },
    instructions: [
      "Carry the original ID proof used during booking.",
      "Reach the platform at least 20 minutes before departure.",
      "Coach position is displayed on the station indicator board.",
    ],
    meta: {
      ac: true,
      sleeper: true,
      trainNumber: train.number,
      classes,
    },
  };
}

function buildBerthMap(trip: Trip, classCode: string): SeatMap {
  const rng = createRng(`berths|${trip.id}|${classCode}`);
  const chairCar = classCode === "CC";
  const perBay = chairCar ? 4 : 8;
  const bays = 8;
  const seats: Seat[] = [];
  const fare =
    trip.meta.classes?.find((c) => c.code === classCode)?.fare ?? trip.baseFare;

  for (let bay = 0; bay < bays; bay += 1) {
    for (let i = 0; i < perBay; i += 1) {
      const number = bay * perBay + i + 1;
      const berth: Seat["berth"] = chairCar
        ? "seater"
        : i === 0
          ? "lower"
          : i === 1
            ? "middle"
            : i === 2
              ? "upper"
              : i === 3
                ? "lower"
                : i === 4
                  ? "middle"
                  : i === 5
                    ? "upper"
                    : i === 6
                      ? "side-lower"
                      : "side-upper";
      seats.push({
        id: `${trip.id}_${classCode}_${number}`,
        label: `${number}`,
        deck: "lower",
        row: bay + 1,
        column: i + 1,
        berth,
        window: chairCar ? i === 0 || i === perBay - 1 : berth.startsWith("side"),
        price: fare,
        occupied: rng() < 0.42,
        premium: !chairCar && berth === "lower",
        womenOnly: false,
      });
    }
  }

  return {
    tripId: trip.id,
    providerStatus: STATUS,
    layout: "train",
    columnsPerDeck: perBay,
    aisleAfterColumn: chairCar ? 2 : 6,
    decks: ["lower"],
    seats,
  };
}

export const demoTrainProvider: TrainProvider & {
  getBerthMap(tripId: string, classCode: string): Promise<ProviderResult<SeatMap | null>>;
} = {
  id: "demo-train",
  name: "Journyx Demo Rail Inventory",
  transportType: "train",
  status: STATUS,

  async searchTrips(query: TripSearchQuery) {
    const from = cityLabel(query.from);
    const to = cityLabel(query.to);
    const rng = createRng(`tcount|${from}|${to}|${query.date}`);
    const count = intBetween(rng, 4, 6);
    const data = Array.from({ length: count }, (_, i) =>
      build(from, to, query.date, i),
    ).sort((a, b) => a.departureISO.localeCompare(b.departureISO));
    return { status: STATUS, providerName: demoTrainProvider.name, data };
  },

  async getTripDetails(id: string) {
    const parsed = parse(id);
    if (!parsed || Number.isNaN(parsed.index)) {
      return { status: STATUS, providerName: demoTrainProvider.name, data: null };
    }
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: build(cityLabel(parsed.from), cityLabel(parsed.to), parsed.date, parsed.index),
    };
  },

  async getSeatMap(id: string) {
    const details = await demoTrainProvider.getTripDetails(id);
    if (!details.data) {
      return { status: STATUS, providerName: demoTrainProvider.name, data: null };
    }
    const code = details.data.meta.classes?.[0]?.code ?? "SL";
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: buildBerthMap(details.data, code),
    };
  },

  async getBerthMap(id: string, classCode: string) {
    const details = await demoTrainProvider.getTripDetails(id);
    if (!details.data) {
      return { status: STATUS, providerName: demoTrainProvider.name, data: null };
    }
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: buildBerthMap(details.data, classCode),
    };
  },

  async reserveSeat(id: string, seatLabels: string[]) {
    const map = await demoTrainProvider.getSeatMap(id);
    const held: string[] = [];
    const rejected: string[] = [];
    for (const label of seatLabels) {
      const seat = map.data?.seats.find((s) => s.label === label);
      if (!seat || seat.occupied) rejected.push(label);
      else held.push(label);
    }
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: { held, rejected },
    };
  },

  async createBooking(booking: Booking) {
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: { reference: booking.reference },
    };
  },

  async cancelBooking() {
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: { cancelled: true },
    };
  },

  async getBookingStatus() {
    return {
      status: STATUS,
      providerName: demoTrainProvider.name,
      data: { status: "CONFIRMED" as const },
    };
  },
};
