import type { TransportType } from "@/lib/domain/types";
import { demoBusProvider } from "./demo-bus";
import { demoTrainProvider } from "./demo-train";
import { demoCabProvider } from "./demo-cab";
import { demoMetroProvider } from "./demo-metro";
import type { BaseProvider } from "./types";

/**
 * Provider registry.
 *
 * The service layer resolves providers through this registry only. To connect a
 * real operator API later, implement the matching interface in
 * `src/lib/providers/types.ts` and swap the entry below — no UI change needed.
 */
const seatedProviders: Record<"bus" | "train", BaseProvider> = {
  bus: demoBusProvider,
  train: demoTrainProvider,
};

export function getSeatedProvider(type: "bus" | "train"): BaseProvider {
  return seatedProviders[type];
}

export function getCabProvider() {
  return demoCabProvider;
}

export function getMetroProvider() {
  return demoMetroProvider;
}

export function getTrainProvider() {
  return demoTrainProvider;
}

export function providerStatusFor(type: TransportType) {
  switch (type) {
    case "bus":
      return demoBusProvider.status;
    case "train":
      return demoTrainProvider.status;
    case "cab":
      return demoCabProvider.status;
    case "metro":
      return demoMetroProvider.status;
  }
}

export const PROVIDER_DIRECTORY = [
  {
    id: demoBusProvider.id,
    name: demoBusProvider.name,
    transportType: "bus" as TransportType,
    status: demoBusProvider.status,
    note: "Deterministic demo inventory. Connect an operator aggregator for live seats.",
  },
  {
    id: demoTrainProvider.id,
    name: demoTrainProvider.name,
    transportType: "train" as TransportType,
    status: demoTrainProvider.status,
    note: "Demo rail inventory. Real railway inventory requires an authorised partner API.",
  },
  {
    id: demoCabProvider.id,
    name: demoCabProvider.name,
    transportType: "cab" as TransportType,
    status: demoCabProvider.status,
    note: "Fare estimates only. Map provider connection required for routing.",
  },
  {
    id: demoMetroProvider.id,
    name: demoMetroProvider.name,
    transportType: "metro" as TransportType,
    status: demoMetroProvider.status,
    note: "Static network graph. No live service status is claimed.",
  },
];
