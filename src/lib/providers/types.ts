import type {
  Booking,
  BookingStatus,
  ProviderStatus,
  SeatMap,
  TransportType,
  Trip,
} from "@/lib/domain/types";

/**
 * Provider adapter contracts.
 *
 * Every provider — demo or live — implements the same surface, so the service
 * layer never needs to know which upstream is answering. To connect a real
 * operator API later, implement one of these interfaces and register it in
 * `src/lib/providers/registry.ts`.
 */

export interface TripSearchQuery {
  from: string;
  to: string;
  date: string; // yyyy-MM-dd
  passengers: number;
}

export interface ProviderResult<T> {
  status: ProviderStatus;
  providerName: string;
  data: T;
  message?: string;
}

export interface BaseProvider {
  id: string;
  name: string;
  transportType: TransportType;
  status: ProviderStatus;
  searchTrips(query: TripSearchQuery): Promise<ProviderResult<Trip[]>>;
  getTripDetails(tripId: string): Promise<ProviderResult<Trip | null>>;
  getSeatMap(tripId: string): Promise<ProviderResult<SeatMap | null>>;
  reserveSeat(
    tripId: string,
    seatLabels: string[],
  ): Promise<ProviderResult<{ held: string[]; rejected: string[] }>>;
  createBooking(booking: Booking): Promise<ProviderResult<{ reference: string }>>;
  cancelBooking(bookingId: string): Promise<ProviderResult<{ cancelled: boolean }>>;
  getBookingStatus(bookingId: string): Promise<ProviderResult<{ status: BookingStatus }>>;
}

export type BusProvider = BaseProvider;
export type TrainProvider = BaseProvider;

export interface CabQuote {
  id: string;
  vehicleType: "Mini" | "Sedan" | "SUV" | "Premium";
  description: string;
  capacity: number;
  estimatedFare: number;
  distanceKm: number;
  etaMinutes: number;
  providerName: string;
  status: ProviderStatus;
}

export interface CabProvider {
  id: string;
  name: string;
  status: ProviderStatus;
  mapStatus: ProviderStatus;
  getQuotes(input: {
    pickup: string;
    drop: string;
    date: string;
    time: string;
    passengers: number;
  }): Promise<ProviderResult<CabQuote[]>>;
}

export interface MetroLeg {
  line: string;
  fromStation: string;
  toStation: string;
  stops: string[];
  minutes: number;
}

export interface MetroRoute {
  id: string;
  legs: MetroLeg[];
  interchanges: string[];
  totalMinutes: number;
  fare: number;
  stationCount: number;
  status: ProviderStatus;
}

export interface MetroProvider {
  id: string;
  name: string;
  status: ProviderStatus;
  planRoute(input: {
    from: string;
    to: string;
  }): Promise<ProviderResult<MetroRoute | null>>;
}
