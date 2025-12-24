import { SavedAircraft } from "../data/aircraft";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateImportedFleet(data: any): data is SavedAircraft[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    // Required fields check
    const requiredFields: (keyof SavedAircraft)[] = [
      "id",
      "make",
      "model",
      "emptyWeight",
      "emptyArm",
      "stations",
      "envelope",
      "registration",
      "isCustomPlane",
    ];

    for (const field of requiredFields) {
      if (!(field in item)) {
        return false;
      }
    }

    // Type checks
    if (
      typeof item.id !== "string" ||
      typeof item.make !== "string" ||
      typeof item.model !== "string" ||
      typeof item.emptyWeight !== "number" ||
      typeof item.emptyArm !== "number" ||
      typeof item.registration !== "string" ||
      item.isCustomPlane !== true
    ) {
      return false;
    }

    // Check stations
    if (!Array.isArray(item.stations)) {
      return false;
    }
    for (const station of item.stations) {
      if (
        typeof station !== "object" ||
        station === null ||
        typeof station.id !== "string" ||
        typeof station.name !== "string" ||
        typeof station.arm !== "number" ||
        typeof station.maxWeight !== "number"
      ) {
        return false;
      }
    }

    // Check envelope
    if (!Array.isArray(item.envelope)) {
      return false;
    }
    for (const point of item.envelope) {
      if (
        typeof point !== "object" ||
        point === null ||
        typeof point.cg !== "number" ||
        typeof point.weight !== "number"
      ) {
        return false;
      }
    }

    // Check utilityEnvelope if present
    if (item.utilityEnvelope !== undefined) {
      if (!Array.isArray(item.utilityEnvelope)) {
        return false;
      }
      for (const point of item.utilityEnvelope) {
        if (
          typeof point !== "object" ||
          point === null ||
          typeof point.cg !== "number" ||
          typeof point.weight !== "number"
        ) {
          return false;
        }
      }
    }

    // Check savedArmOverrides if present
    if (item.savedArmOverrides !== undefined) {
      if (typeof item.savedArmOverrides !== "object" || item.savedArmOverrides === null) {
        return false;
      }
      for (const key in item.savedArmOverrides) {
        if (typeof item.savedArmOverrides[key] !== "number") {
          return false;
        }
      }
    }

    return true;
  });
}
