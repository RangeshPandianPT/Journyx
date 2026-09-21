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

export const generateMockTrips = (from: string, to: string, date: string, type: string = "bus"): BusTrip[] => {
  if (type === "train") {
    return [
      {
        id: "train-1",
        operator: "Indian Railways",
        departureTime: "06:00",
        arrivalTime: "11:30",
        duration: "5h 30m",
        busType: "Vande Bharat Express",
        isAC: true,
        isSleeper: false,
        price: 1540,
        availableSeats: 45,
        totalSeats: 300,
        boardingPoints: [`${from} Central`],
        droppingPoints: [`${to} City`],
        rating: 4.8,
        isLive: false,
      },
      {
        id: "train-2",
        operator: "Indian Railways",
        departureTime: "22:15",
        arrivalTime: "05:00",
        duration: "6h 45m",
        busType: "Shatabdi Express",
        isAC: true,
        isSleeper: true,
        price: 980,
        availableSeats: 12,
        totalSeats: 150,
        boardingPoints: [`${from} Egmore`],
        droppingPoints: [`${to} Cantonment`],
        rating: 4.5,
        isLive: false,
      },
      {
        id: "train-3",
        operator: "Indian Railways",
        departureTime: "23:30",
        arrivalTime: "07:15",
        duration: "7h 45m",
        busType: "Mail/Express",
        isAC: false,
        isSleeper: true,
        price: 450,
        availableSeats: 120,
        totalSeats: 500,
        boardingPoints: [`${from} Central`],
        droppingPoints: [`${to} Junction`],
        rating: 3.9,
        isLive: false,
      },
    ];
  }

  if (type === "flight") {
    return [
      {
        id: "flight-1",
        operator: "IndiGo",
        departureTime: "08:15",
        arrivalTime: "09:30",
        duration: "1h 15m",
        busType: "Economy",
        isAC: true,
        isSleeper: false,
        price: 3200,
        availableSeats: 15,
        totalSeats: 180,
        boardingPoints: [`${from} Airport`],
        droppingPoints: [`${to} Airport`],
        rating: 4.2,
        isLive: false,
      },
      {
        id: "flight-2",
        operator: "Air India",
        departureTime: "14:00",
        arrivalTime: "15:20",
        duration: "1h 20m",
        busType: "Business",
        isAC: true,
        isSleeper: false,
        price: 8500,
        availableSeats: 4,
        totalSeats: 20,
        boardingPoints: [`${from} Airport`],
        droppingPoints: [`${to} Airport`],
        rating: 4.6,
        isLive: false,
      },
      {
        id: "flight-3",
        operator: "SpiceJet",
        departureTime: "20:45",
        arrivalTime: "21:55",
        duration: "1h 10m",
        busType: "Economy",
        isAC: true,
        isSleeper: false,
        price: 2900,
        availableSeats: 42,
        totalSeats: 189,
        boardingPoints: [`${from} Airport`],
        droppingPoints: [`${to} Airport`],
        rating: 3.8,
        isLive: false,
      },
    ];
  }

  // Default to Bus
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
  // Try finding in all types since we just use id
  const from = "Chennai";
  const to = "Bangalore";
  const date = new Date().toISOString();
  
  const allTrips = [
    ...generateMockTrips(from, to, date, "bus"),
    ...generateMockTrips(from, to, date, "train"),
    ...generateMockTrips(from, to, date, "flight")
  ];
  return allTrips.find(t => t.id === id);
};
