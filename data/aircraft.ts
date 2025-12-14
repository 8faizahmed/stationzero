// src/data/aircraft.ts

export interface Station {
  id: string;
  name: string;
  arm: number;
  maxWeight: number;
}

export interface EnvelopePoint {
  cg: number;
  weight: number;
}

export interface Aircraft {
  id: string;
  make: string;
  model: string;
  emptyWeight: number;
  emptyArm: number;
  stations: Station[];
  envelope: EnvelopePoint[];
  utilityEnvelope?: EnvelopePoint[];
}

export interface SavedAircraft extends Aircraft {
  registration: string;
  isCustomPlane: true;
  savedArmOverrides?: Record<string, number>;
}

export const aircraftList: Aircraft[] = [
  // --- CESSNA 172S (Skyhawk SP) ---
  // Source: FAA TCDS 3A12 Rev 47 & 172S POH (Section 2)
  {
    id: "c172s",
    make: "Cessna",
    model: "172S Skyhawk SP",
    emptyWeight: 1663,
    emptyArm: 40.0,
    stations: [
      { id: "frontSeat", name: "Pilot & Front Pax", arm: 37.0, maxWeight: 500 },
      { id: "rearSeat", name: "Rear Passengers", arm: 73.0, maxWeight: 500 },
      { id: "fuel", name: "Fuel (56 gal)", arm: 48.0, maxWeight: 336 },
      { id: "baggage1", name: "Baggage Area 1", arm: 95.0, maxWeight: 120 },
      { id: "baggage2", name: "Baggage Area 2", arm: 123.0, maxWeight: 50 },
    ],
    // NORMAL CATEGORY (Max 2550 lbs)
    // CORRECTED: Forward limit is 41.0 at 2550, not 38.5
    envelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 2200 }, // The "knee" is at 2200 for the S model
      { cg: 41.0, weight: 2550 }, // Forward limit at Gross
      { cg: 47.3, weight: 2550 }, // Aft limit
      { cg: 47.3, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ],
    // UTILITY CATEGORY (Max 2200 lbs)
    utilityEnvelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 2200 },
      { cg: 40.5, weight: 2200 }, // Utility Aft Limit
      { cg: 40.5, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ]
  },

  // --- CESSNA 172N (Skyhawk II) ---
  // Source: FAA TCDS 3A12 Rev 47
  {
    id: "c172n",
    make: "Cessna",
    model: "172N Skyhawk",
    emptyWeight: 1419,
    emptyArm: 39.0,
    stations: [
      { id: "frontSeat", name: "Pilot & Front Pax", arm: 37.0, maxWeight: 400 },
      { id: "rearSeat", name: "Rear Passengers", arm: 73.0, maxWeight: 400 },
      { id: "fuel", name: "Fuel (40 gal)", arm: 48.0, maxWeight: 240 },
      { id: "baggage1", name: "Baggage Area 1", arm: 95.0, maxWeight: 120 },
      { id: "baggage2", name: "Baggage Area 2", arm: 123.0, maxWeight: 50 },
    ],
    // NORMAL CATEGORY (Max 2300 lbs)
    envelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 1950 },
      { cg: 38.5, weight: 2300 },
      { cg: 47.3, weight: 2300 },
      { cg: 47.3, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ],
    // UTILITY CATEGORY (Max 2000 lbs)
    utilityEnvelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 1950 },
      { cg: 35.5, weight: 2000 },
      { cg: 40.5, weight: 2000 },
      { cg: 40.5, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ]
  },

  // --- CESSNA 172M (1975 Model) ---
  // Source: 1975 C172M POH
  {
    id: "c172m",
    make: "Cessna",
    model: "172M Skyhawk",
    emptyWeight: 1350, 
    emptyArm: 39.0,
    stations: [
      { id: "frontSeat", name: "Pilot & Front Pax", arm: 37.0, maxWeight: 400 },
      { id: "rearSeat", name: "Rear Passengers", arm: 73.0, maxWeight: 400 },
      { id: "fuel", name: "Fuel (38 gal)", arm: 48.0, maxWeight: 228 }, 
      { id: "baggage1", name: "Baggage Area 1", arm: 95.0, maxWeight: 120 },
      { id: "baggage2", name: "Baggage Area 2", arm: 123.0, maxWeight: 50 },
    ],
    // NORMAL CATEGORY (Max 2300 lbs)
    envelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 1950 },
      { cg: 38.5, weight: 2300 },
      { cg: 47.3, weight: 2300 },
      { cg: 47.3, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ],
    // UTILITY CATEGORY (Max 2000 lbs)
    utilityEnvelope: [
      { cg: 35.0, weight: 1500 },
      { cg: 35.0, weight: 1950 },
      { cg: 35.5, weight: 2000 },
      { cg: 40.5, weight: 2000 },
      { cg: 40.5, weight: 1500 },
      { cg: 35.0, weight: 1500 },
    ]
  },

  // --- CESSNA 152 ---
  // Source: FAA TCDS 3A19 Rev 47
  {
    id: "c152",
    make: "Cessna",
    model: "152",
    emptyWeight: 1107,
    emptyArm: 30.0,
    stations: [
      { id: "frontSeat", name: "Pilot & Passenger", arm: 39.0, maxWeight: 400 },
      { id: "fuel", name: "Fuel (24.5 gal)", arm: 42.0, maxWeight: 147 },
      { id: "baggage1", name: "Baggage Area 1", arm: 64.0, maxWeight: 120 },
      { id: "baggage2", name: "Baggage Area 2", arm: 84.0, maxWeight: 40 },
    ],
    // NORMAL CATEGORY (Max 1670 lbs)
    envelope: [
      { cg: 31.0, weight: 1350 },
      { cg: 32.65, weight: 1670 },
      { cg: 36.5, weight: 1670 },
      { cg: 36.5, weight: 1350 },
      { cg: 31.0, weight: 1350 },
    ],
    // UTILITY CATEGORY (Max 1670 lbs - Same gross)
    utilityEnvelope: [
      { cg: 31.0, weight: 1350 },
      { cg: 32.65, weight: 1670 },
      { cg: 36.5, weight: 1670 },
      { cg: 36.5, weight: 1350 },
      { cg: 31.0, weight: 1350 },
    ]
  },

  // --- CESSNA 150M ---
  // Source: FAA TCDS 3A19 Rev 47
  {
    id: "c150m",
    make: "Cessna",
    model: "150M Commuter",
    emptyWeight: 1111,
    emptyArm: 33.0,
    stations: [
      { id: "frontSeat", name: "Pilot & Passenger", arm: 39.0, maxWeight: 400 },
      { id: "fuel", name: "Fuel (22.5 gal)", arm: 42.0, maxWeight: 135 },
      { id: "baggage1", name: "Baggage Area 1", arm: 64.0, maxWeight: 120 },
      { id: "baggage2", name: "Baggage Area 2", arm: 84.0, maxWeight: 40 },
    ],
    // CORRECTED: Forward limit is 32.9, not 32.8
    envelope: [
      { cg: 30.9, weight: 1100 },
      { cg: 31.5, weight: 1270 },
      { cg: 32.9, weight: 1600 }, 
      { cg: 37.5, weight: 1600 },
      { cg: 37.5, weight: 1100 },
      { cg: 30.9, weight: 1100 },
    ],
    utilityEnvelope: [
      { cg: 30.9, weight: 1100 },
      { cg: 31.5, weight: 1270 },
      { cg: 32.9, weight: 1600 },
      { cg: 37.5, weight: 1600 },
      { cg: 37.5, weight: 1100 },
      { cg: 30.9, weight: 1100 },
    ]
  },

  // --- PIPER ARCHER II (PA-28-181) ---
  // Source: FAA TCDS 2A13 Rev 50
  {
    id: "pa28-181",
    make: "Piper",
    model: "Archer II (PA-28-181)",
    emptyWeight: 1604,
    emptyArm: 87.9,
    stations: [
      { id: "frontSeat", name: "Pilot & Co-Pilot", arm: 80.5, maxWeight: 400 },
      { id: "rearSeat", name: "Rear Passengers", arm: 118.1, maxWeight: 400 },
      { id: "fuel", name: "Fuel (48 gal)", arm: 95.0, maxWeight: 288 },
      { id: "baggage", name: "Baggage Area", arm: 142.8, maxWeight: 200 },
    ],
    // NORMAL CATEGORY (Max 2550 lbs)
    envelope: [
      { cg: 82.0, weight: 1200 },
      { cg: 82.0, weight: 2050 },
      { cg: 88.6, weight: 2550 },
      { cg: 93.0, weight: 2550 },
      { cg: 93.0, weight: 1200 },
      { cg: 82.0, weight: 1200 },
    ],
    // UTILITY CATEGORY (Max 2130 lbs)
    // CORRECTED: Aft limit opened to 93.0 (TCDS allows same aft limit as Normal)
    utilityEnvelope: [
      { cg: 82.0, weight: 1200 },
      { cg: 82.0, weight: 2050 },
      { cg: 83.0, weight: 2130 }, // Forward-Top Corner
      { cg: 93.0, weight: 2130 }, // Aft-Top Corner
      { cg: 93.0, weight: 1200 },
      { cg: 82.0, weight: 1200 },
    ]
  },

  // --- DIAMOND DA40 STAR ---
  // Source: FAA TCDS A47CE Rev 10
  {
    id: "da40",
    make: "Diamond",
    model: "DA40 Star",
    emptyWeight: 1757,
    emptyArm: 96.7,
    stations: [
      { id: "frontSeat", name: "Pilot & Co-Pilot", arm: 90.6, maxWeight: 400 },
      { id: "rearSeat", name: "Rear Passengers", arm: 128.0, maxWeight: 350 },
      { id: "fuel", name: "Fuel (50 gal)", arm: 103.5, maxWeight: 300 },
      { id: "baggage", name: "Baggage", arm: 143.7, maxWeight: 66 },
    ],
    // NORMAL CATEGORY (Max 2646 lbs)
    envelope: [
      { cg: 94.5, weight: 1720 },
      { cg: 94.5, weight: 2161 },
      { cg: 97.6, weight: 2646 },
      { cg: 100.4, weight: 2646 },
      { cg: 100.4, weight: 1720 },
      { cg: 94.5, weight: 1720 },
    ],
    // UTILITY CATEGORY (Max 2161 lbs)
    utilityEnvelope: [
      { cg: 94.5, weight: 1720 },
      { cg: 94.5, weight: 2161 },
      { cg: 100.4, weight: 2161 },
      { cg: 100.4, weight: 1720 },
      { cg: 94.5, weight: 1720 },
    ]
  },
];