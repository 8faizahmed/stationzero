import { SavedAircraft, Station, EnvelopePoint } from "../data/aircraft";

function isStation(obj: unknown): obj is Station {
  if (typeof obj !== "object" || obj === null) return false;
  const station = obj as Record<string, unknown>;
  return (
    typeof station.id === "string" &&
    typeof station.name === "string" &&
    typeof station.arm === "number" &&
    typeof station.maxWeight === "number"
  );
}

function isEnvelopePoint(obj: unknown): obj is EnvelopePoint {
  if (typeof obj !== "object" || obj === null) return false;
  const point = obj as Record<string, unknown>;
  return (
    typeof point.cg === "number" &&
    typeof point.weight === "number"
  );
}

export function isValidSavedAircraft(obj: unknown): obj is SavedAircraft {
  if (typeof obj !== "object" || obj === null) return false;

  // Type assertion to access properties safely for checking
  const candidate = obj as Record<string, unknown>;

  // Check required base Aircraft properties
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.make !== "string" ||
    typeof candidate.model !== "string" ||
    typeof candidate.emptyWeight !== "number" ||
    typeof candidate.emptyArm !== "number" ||
    !Array.isArray(candidate.stations) ||
    !Array.isArray(candidate.envelope)
  ) {
    return false;
  }

  // Check SavedAircraft specific properties
  if (
    typeof candidate.registration !== "string" ||
    candidate.isCustomPlane !== true
  ) {
    return false;
  }

  // Validate stations
  if (!candidate.stations.every(isStation)) return false;

  // Validate envelope
  if (!candidate.envelope.every(isEnvelopePoint)) return false;

  // Validate utilityEnvelope if present
  if (candidate.utilityEnvelope !== undefined) {
    if (!Array.isArray(candidate.utilityEnvelope) || !candidate.utilityEnvelope.every(isEnvelopePoint)) {
      return false;
    }
  }

  // Validate savedArmOverrides if present
  if (candidate.savedArmOverrides !== undefined) {
    if (typeof candidate.savedArmOverrides !== "object" || candidate.savedArmOverrides === null) {
      return false;
    }
    // Check if values are numbers
    const overrides = candidate.savedArmOverrides as Record<string, unknown>;
    for (const key in overrides) {
        if (typeof overrides[key] !== "number") return false;
    }
  }

  return true;
}

export function validateFleet(data: unknown): SavedAircraft[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(isValidSavedAircraft);
}
