/**
 * Core domain model.
 *
 * These types are intentionally normalized (ids referencing other entities)
 * so the same shapes map 1:1 onto relational tables when a real database is
 * connected later.
 */

export type TransportType = "bus" | "train" | "cab" | "metro";

export type ProviderStatus =
  | "LIVE"
  | "SANDBOX"
  | "DEMO_DATA"
  | "PROVIDER_CONNECTION_REQUIRED"
  | "UNAVAILABLE";

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface TransportProvider {
  id: string;
  name: string;
  transportType: TransportType;
  status: ProviderStatus;
  rating: number;
}

export interface StopPoint {
  id: string;
  name: string;
  landmark: string;
  time: string; // HH:mm
}

export interface RouteInfo {
  id: string;
  fromCityId: string;
  toCityId: string;
  distanceKm: number;
}

export type BusClass = "AC Sleeper" | "Non-AC Sleeper" | "AC Seater" | "Non-AC Seater";

export interface FarePolicy {
  refundable: boolean;
  /** Hours before departure -> percentage of fare refunded. */
  tiers: Array<{ beforeHours: number; refundPercent: number }>;
}

export interface Trip {
  id: string;
  transportType: TransportType;
  providerId: string;
  providerName: string;
  providerStatus: ProviderStatus;
  vehicleNumber: string;
  vehicleLabel: string; // "AC Sleeper (2+1)" or train name
  fromCityId: string;
  toCityId: string;
  departureISO: string;
  arrivalISO: string;
  durationMinutes: number;
  baseFare: number;
  seatsAvailable: number;
  totalSeats: number;
  rating: number;
  ratingCount: number;
  amenities: string[];
  boardingPoints: StopPoint[];
  droppingPoints: StopPoint[];
  farePolicy: FarePolicy;
  instructions: string[];
  meta: {
    ac: boolean;
    sleeper: boolean;
    busClass?: BusClass;
    trainNumber?: string;
    classes?: TrainClassAvailability[];
  };
}

export type TrainClassCode = "1A" | "2A" | "3A" | "SL" | "CC";

export interface TrainClassAvailability {
  code: TrainClassCode;
  label: string;
  fare: number;
  available: number;
  status: "AVAILABLE" | "RAC" | "WAITLIST";
}

export type SeatState = "available" | "occupied" | "selected";

export type BerthType =
  | "seater"
  | "upper"
  | "lower"
  | "middle"
  | "side-upper"
  | "side-lower";

export interface Seat {
  id: string;
  label: string;
  deck: "lower" | "upper";
  row: number;
  column: number;
  berth: BerthType;
  window: boolean;
  price: number;
  occupied: boolean;
  premium: boolean;
  womenOnly: boolean;
}

export interface SeatMap {
  tripId: string;
  providerStatus: ProviderStatus;
  layout: "sleeper" | "seater" | "train";
  columnsPerDeck: number;
  aisleAfterColumn: number;
  decks: Array<"lower" | "upper">;
  seats: Seat[];
}

export type Gender = "male" | "female" | "other";

export interface Passenger {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone?: string;
  email?: string;
  idType?: "aadhaar" | "passport" | "driving-licence" | "voter-id";
  idNumber?: string;
}

export interface PassengerBooking {
  id: string;
  passenger: Passenger;
  seatLabel: string;
  berth: BerthType;
  fare: number;
}

export interface FareBreakdown {
  baseFare: number;
  seatFare: number;
  taxes: number;
  convenienceFee: number;
  total: number;
}

export type PaymentMethod = "upi" | "card" | "netbanking" | "demo-balance";

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  environment: "SANDBOX";
  transactionId: string;
  createdAtISO: string;
}

export interface Cancellation {
  id: string;
  bookingId: string;
  reason: string;
  refundAmount: number;
  refundPercent: number;
  createdAtISO: string;
}

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  reference: string;
  transportType: TransportType;
  dataMode: "DEMO_DATA" | "LIVE" | "SANDBOX";
  trip: Trip;
  fromCity: string;
  toCity: string;
  boardingPoint: StopPoint;
  droppingPoint: StopPoint;
  passengers: PassengerBooking[];
  fare: FareBreakdown;
  status: BookingStatus;
  contact: { phone: string; email: string };
  createdAtISO: string;
  payment: Payment | null;
  cancellation: Cancellation | null;
  trainClass?: TrainClassCode;
}

export type NotificationKind =
  | "booking"
  | "payment"
  | "cancellation"
  | "reminder"
  | "provider"
  | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAtISO: string;
  read: boolean;
  bookingId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  preferences: {
    preferredTransport: TransportType;
    preferredSeat: "window" | "aisle" | "no-preference";
    preferAC: boolean;
  };
  notificationSettings: {
    bookingUpdates: boolean;
    tripReminders: boolean;
    offers: boolean;
  };
  savedPassengers: Passenger[];
}

export interface SupportMessage {
  id: string;
  author: "user" | "assistant";
  body: string;
  createdAtISO: string;
}

export interface SupportConversation {
  id: string;
  topic: string;
  messages: SupportMessage[];
  status: "open" | "closed";
}

export interface SearchHistoryEntry {
  id: string;
  transportType: TransportType;
  from: string;
  to: string;
  date: string;
  passengers: number;
  createdAtISO: string;
}

/** Draft carried across the booking flow (seat -> passengers -> review -> payment). */
export interface BookingDraft {
  tripId: string;
  transportType: TransportType;
  trip: Trip;
  seats: Array<{ label: string; berth: BerthType; price: number }>;
  boardingPointId: string;
  droppingPointId: string;
  passengers: Passenger[];
  contact: { phone: string; email: string };
  trainClass?: TrainClassCode;
  createdAtISO: string;
}
