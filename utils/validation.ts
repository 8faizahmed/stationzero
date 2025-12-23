import { SavedAircraft, Station, EnvelopePoint } from "../data/aircraft";

/**
 * Validates that the input data matches the SavedAircraft structure.
 * Returns the valid SavedAircraft[] or null if invalid.
 */
export function validateImportedFleet(data: any): SavedAircraft[] | null {
  if (!Array.isArray(data)) {
    return null;
  }

  for (const item of data) {
    if (!validateSavedAircraft(item)) {
      return null;
    }
  }

  return data as SavedAircraft[];
}

function validateSavedAircraft(item: any): boolean {
  if (typeof item !== "object" || item === null) return false;

  // Check required primitive fields
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
  if (!Array.isArray(item.stations)) return false;
  for (const station of item.stations) {
    if (!validateStation(station)) return false;
  }

  // Check envelope
  if (!Array.isArray(item.envelope)) return false;
  for (const point of item.envelope) {
    if (!validateEnvelopePoint(point)) return false;
  }

  // Check utilityEnvelope (optional)
  if (item.utilityEnvelope !== undefined) {
    if (!Array.isArray(item.utilityEnvelope)) return false;
    for (const point of item.utilityEnvelope) {
        if (!validateEnvelopePoint(point)) return false;
    }
  }

  // Check savedArmOverrides (optional)
  if (item.savedArmOverrides !== undefined) {
    if (typeof item.savedArmOverrides !== "object" || item.savedArmOverrides === null) return false;
    for (const key in item.savedArmOverrides) {
        if (typeof item.savedArmOverrides[key] !== "number") return false;
    }
  }

  return true;
}

function validateStation(station: any): boolean {
  if (typeof station !== "object" || station === null) return false;
  return (
    typeof station.id === "string" &&
    typeof station.name === "string" &&
    typeof station.arm === "number" &&
    typeof station.maxWeight === "number"
  );
}

function validateEnvelopePoint(point: any): boolean {
  if (typeof point !== "object" || point === null) return false;
  return (
    typeof point.cg === "number" &&
    typeof point.weight === "number"
  );
}
