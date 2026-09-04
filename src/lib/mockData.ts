export interface BusTrip {
  id: string;
  operator: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busType: string;
  isAC: boolean;
  isSleeper: boolean;
  price: number;
  availableSeats: number;
  totalSeats: number;
  boardingPoints: string[];
  droppingPoints: string[];
  rating: number;
  isLive: boolean; // false = DEMO DATA
}

export const generateMockTrips = (from: string, to: string, date: string): BusTrip[] => {
  return [
    {
      id: "trip-1",
      operator: "VRL Travels",
      departureTime: "22:30",
      arrivalTime: "05:45",
      duration: "7h 15m",
      busType: "Volvo Multi-Axle",
      isAC: true,
      isSleeper: true,
      price: 1299,
      availableSeats: 27,
      totalSeats: 40,
      boardingPoints: ["Koyambedu", "Guindy", "Tambaram"],
      droppingPoints: ["Madiwala", "Silk Board", "Majestic"],
      rating: 4.5,
      isLive: false,
    },
    {
      id: "trip-2",
      operator: "IntrCity SmartBus",
      departureTime: "21:00",
      arrivalTime: "04:30",
      duration: "7h 30m",
      busType: "Scania Premium",
      isAC: true,
      isSleeper: true,
      price: 1450,
      availableSeats: 12,
      totalSeats: 36,
      boardingPoints: ["Koyambedu", "Porur"],
      droppingPoints: ["Electronic City", "Madiwala"],
      rating: 4.8,
      isLive: false,
    },
    {
      id: "trip-3",
      operator: "SRS Travels",
      departureTime: "23:15",
      arrivalTime: "06:30",
      duration: "7h 15m",
      busType: "Ashok Leyland",
      isAC: false,
      isSleeper: false,
      price: 650,
      availableSeats: 4,
      totalSeats: 50,
      boardingPoints: ["Central", "Egmore"],
      droppingPoints: ["Majestic", "Kalasipalyam"],
      rating: 3.9,
      isLive: false,
    },
    {
      id: "trip-4",
      operator: "Orange Tours",
      departureTime: "20:30",
      arrivalTime: "04:00",
      duration: "7h 30m",
      busType: "BharatBenz A/C Sleeper",
      isAC: true,
      isSleeper: true,
      price: 1100,
      availableSeats: 35,
      totalSeats: 40,
      boardingPoints: ["Koyambedu", "Ashok Pillar"],
      droppingPoints: ["Madiwala", "Kalayan Nagar"],
      rating: 4.2,
      isLive: false,
    },
  ];
};

export const getTripById = (id: string) => {
  const trips = generateMockTrips("Chennai", "Bangalore", new Date().toISOString());
  return trips.find(t => t.id === id);
};
