import type { City } from "@/lib/domain/types";

export const CITIES: City[] = [
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "bangalore", name: "Bangalore", state: "Karnataka" },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu" },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu" },
  { id: "pondicherry", name: "Pondicherry", state: "Puducherry" },
  { id: "trichy", name: "Trichy", state: "Tamil Nadu" },
  { id: "salem", name: "Salem", state: "Tamil Nadu" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "kochi", name: "Kochi", state: "Kerala" },
  { id: "mysore", name: "Mysore", state: "Karnataka" },
  { id: "tirupati", name: "Tirupati", state: "Andhra Pradesh" },
  { id: "vellore", name: "Vellore", state: "Tamil Nadu" },
];

export function cityByName(name: string): City | undefined {
  const key = name.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === key || c.id === key);
}

export function cityLabel(idOrName: string): string {
  return cityByName(idOrName)?.name ?? idOrName;
}

/** Approximate road distances in km, used for demo fare and duration modelling. */
const DISTANCES: Record<string, number> = {
  "chennai-bangalore": 350,
  "chennai-pondicherry": 160,
  "chennai-coimbatore": 505,
  "chennai-madurai": 460,
  "chennai-trichy": 330,
  "chennai-salem": 340,
  "chennai-hyderabad": 630,
  "chennai-kochi": 690,
  "chennai-tirupati": 135,
  "chennai-vellore": 140,
  "bangalore-coimbatore": 365,
  "bangalore-mysore": 145,
  "bangalore-madurai": 435,
  "bangalore-hyderabad": 570,
  "coimbatore-madurai": 215,
  "coimbatore-kochi": 190,
  "madurai-trichy": 130,
};

export function routeDistanceKm(from: string, to: string): number {
  const a = cityByName(from)?.id ?? from.toLowerCase();
  const b = cityByName(to)?.id ?? to.toLowerCase();
  return DISTANCES[`${a}-${b}`] ?? DISTANCES[`${b}-${a}`] ?? 320;
}

export const POPULAR_ROUTES = [
  { from: "Chennai", to: "Bangalore", fromPrice: 899 },
  { from: "Chennai", to: "Pondicherry", fromPrice: 349 },
  { from: "Chennai", to: "Coimbatore", fromPrice: 1049 },
  { from: "Bangalore", to: "Chennai", fromPrice: 899 },
  { from: "Chennai", to: "Madurai", fromPrice: 949 },
  { from: "Bangalore", to: "Mysore", fromPrice: 399 },
];

export const BUS_OPERATORS = [
  { id: "vrl", name: "VRL Travels", rating: 4.4 },
  { id: "srs", name: "SRS Travels", rating: 4.1 },
  { id: "kpn", name: "KPN Travels", rating: 3.9 },
  { id: "parveen", name: "Parveen Travels", rating: 4.2 },
  { id: "orange", name: "Orange Tours", rating: 4.5 },
  { id: "yolobus", name: "Yolo Bus", rating: 4.3 },
  { id: "intrcity", name: "IntrCity SmartBus", rating: 4.0 },
  { id: "setc", name: "SETC Express", rating: 3.7 },
];

export const AMENITIES = [
  "Charging point",
  "Water bottle",
  "Blanket",
  "Reading light",
  "Live tracking",
  "CCTV",
  "Emergency exit",
  "Wi-Fi",
];

export const TRAIN_NAMES = [
  { number: "12007", name: "Shatabdi Express" },
  { number: "12609", name: "Bangalore Express" },
  { number: "12639", name: "Brindavan Express" },
  { number: "22625", name: "Double Decker Express" },
  { number: "16057", name: "Sapthagiri Express" },
  { number: "12675", name: "Kovai Express" },
];

export const METRO_STATIONS = [
  "Airport",
  "Meenambakkam",
  "Guindy",
  "Saidapet",
  "Nandanam",
  "Teynampet",
  "AG-DMS",
  "Thousand Lights",
  "LIC",
  "Government Estate",
  "Chennai Central",
  "High Court",
  "Egmore",
  "Nehru Park",
  "Kilpauk",
  "Pachaiyappa's College",
  "Shenoy Nagar",
  "Anna Nagar Tower",
  "Thirumangalam",
  "Koyambedu",
  "Vadapalani",
  "Ashok Nagar",
  "Alandur",
  "St. Thomas Mount",
];

export const METRO_INTERCHANGES = ["Alandur", "Chennai Central", "Koyambedu"];
