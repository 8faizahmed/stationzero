import { SavedAircraft, Station, EnvelopePoint } from "../data/aircraft";

/**
 * Validates that the input data matches the Station interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateStation(data: any): data is Station {
  if (typeof data !== 'object' || data === null) return false;

  if (typeof data.id !== 'string') return false;
  if (typeof data.name !== 'string') return false;
  if (typeof data.arm !== 'number') return false;
  if (typeof data.maxWeight !== 'number') return false;

  return true;
}

/**
 * Validates that the input data matches the EnvelopePoint interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateEnvelopePoint(data: any): data is EnvelopePoint {
  if (typeof data !== 'object' || data === null) return false;

  if (typeof data.cg !== 'number') return false;
  if (typeof data.weight !== 'number') return false;

  return true;
}

/**
 * Validates that the input data matches the SavedAircraft interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateSavedAircraft(data: any): data is SavedAircraft {
  if (typeof data !== 'object' || data === null) return false;

  // Check required string fields
  const stringFields = ['id', 'make', 'model', 'registration'];
  for (const field of stringFields) {
    if (typeof data[field] !== 'string') return false;
  }

  // Check required number fields
  const numberFields = ['emptyWeight', 'emptyArm'];
  for (const field of numberFields) {
    if (typeof data[field] !== 'number') return false;
  }

  // Check isCustomPlane flag (must be true for SavedAircraft)
  if (data.isCustomPlane !== true) return false;

  // Check arrays
  if (!Array.isArray(data.stations)) return false;
  if (!Array.isArray(data.envelope)) return false;

  // Optional: utilityEnvelope
  if (data.utilityEnvelope !== undefined && !Array.isArray(data.utilityEnvelope)) return false;

  // Validate stations
  for (const s of data.stations) {
    if (!validateStation(s)) return false;
  }

  // Validate envelope
  for (const pt of data.envelope) {
    if (!validateEnvelopePoint(pt)) return false;
  }

  // Validate utilityEnvelope if present
  if (data.utilityEnvelope) {
    for (const pt of data.utilityEnvelope) {
      if (!validateEnvelopePoint(pt)) return false;
    }
  }

  // Validate savedArmOverrides if present
  if (data.savedArmOverrides !== undefined) {
    if (typeof data.savedArmOverrides !== 'object' || data.savedArmOverrides === null) return false;
    for (const key in data.savedArmOverrides) {
      if (typeof data.savedArmOverrides[key] !== 'number') return false;
    }
  }

  return true;
}

/**
 * Validates and casts the input data to SavedAircraft[]
 * Throws an error if validation fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateSavedFleet(data: any): SavedAircraft[] {
  if (!Array.isArray(data)) {
    throw new Error("The file format is incorrect (expected a list of aircraft).");
  }

  return data.map((item, index) => {
    if (!validateSavedAircraft(item)) {
      throw new Error(`Aircraft #${index + 1} (${item?.registration || 'Unknown Registration'}) is missing required data or has invalid values.`);
    }
    return item;
  });
}
