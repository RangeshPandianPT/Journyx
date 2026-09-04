import type { ProviderStatus } from "@/lib/domain/types";
import { routeDistanceKm } from "@/lib/data/reference";
import { createRng, intBetween } from "@/lib/utils/seeded-random";
import type { CabProvider, CabQuote } from "./types";

const STATUS: ProviderStatus = "DEMO_DATA";

/**
 * Map rendering needs a real provider key. Until one is configured the UI shows
 * "Map provider connection required" instead of a fabricated live map.
 */
const MAP_STATUS: ProviderStatus = "PROVIDER_CONNECTION_REQUIRED";

const VEHICLES: Array<{
  type: CabQuote["vehicleType"];
  description: string;
  capacity: number;
  perKm: number;
  base: number;
}> = [
  { type: "Mini", description: "Hatchback, compact luggage", capacity: 4, perKm: 13, base: 60 },
  { type: "Sedan", description: "Sedan with boot space", capacity: 4, perKm: 16, base: 80 },
  { type: "SUV", description: "6 seater, extra luggage", capacity: 6, perKm: 21, base: 110 },
  { type: "Premium", description: "Premium sedan, senior driver", capacity: 4, perKm: 26, base: 150 },
];

export const demoCabProvider: CabProvider = {
  id: "demo-cab",
  name: "Journyx Demo Cab Network",
  status: STATUS,
  mapStatus: MAP_STATUS,

  async getQuotes(input) {
    const rng = createRng(`cab|${input.pickup}|${input.drop}|${input.date}|${input.time}`);
    const isIntercity = input.pickup.trim().toLowerCase() !== input.drop.trim().toLowerCase();
    const distanceKm = isIntercity
      ? routeDistanceKm(input.pickup, input.drop)
      : intBetween(rng, 4, 24);

    const data: CabQuote[] = VEHICLES.filter((v) => v.capacity >= input.passengers).map(
      (v, i) => ({
        id: `cab_${v.type.toLowerCase()}_${input.date}_${i}`,
        vehicleType: v.type,
        description: v.description,
        capacity: v.capacity,
        estimatedFare: Math.round((v.base + distanceKm * v.perKm) / 10) * 10,
        distanceKm,
        etaMinutes: intBetween(rng, 3, 14),
        providerName: demoCabProvider.name,
        status: STATUS,
      }),
    );

    return { status: STATUS, providerName: demoCabProvider.name, data };
  },
};
