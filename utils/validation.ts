import { SavedAircraft, Station, EnvelopePoint } from "../data/aircraft";

function isStation(obj: unknown): obj is Station {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Station).id === 'string' &&
    typeof (obj as Station).name === 'string' &&
    typeof (obj as Station).arm === 'number' &&
    typeof (obj as Station).maxWeight === 'number'
  );
}

function isEnvelopePoint(obj: unknown): obj is EnvelopePoint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as EnvelopePoint).cg === 'number' &&
    typeof (obj as EnvelopePoint).weight === 'number'
  );
}

export function validateImportedFleet(data: unknown): SavedAircraft[] {
  if (!Array.isArray(data)) {
    throw new Error("Imported data must be an array.");
  }

  return data.map((plane, index) => {
    if (typeof plane !== 'object' || plane === null) {
      throw new Error(`Item at index ${index} is not a valid object.`);
    }

    // Cast to Record<string, unknown> to safely access properties
    const p = plane as Record<string, unknown>;

    // Check required fields for SavedAircraft (which extends Aircraft)
    const requiredStringFields = ['id', 'make', 'model', 'registration'];
    for (const field of requiredStringFields) {
      if (typeof p[field] !== 'string') {
        throw new Error(`Item at index ${index} missing or invalid string field: ${field}`);
      }
    }

    const requiredNumberFields = ['emptyWeight', 'emptyArm'];
    for (const field of requiredNumberFields) {
      if (typeof p[field] !== 'number') {
        throw new Error(`Item at index ${index} missing or invalid number field: ${field}`);
      }
    }

    // Check specific literal
    if (p.isCustomPlane !== true) {
         throw new Error(`Item at index ${index} must have isCustomPlane: true`);
    }

    // Validate arrays
    if (!Array.isArray(p.stations) || !p.stations.every(isStation)) {
      throw new Error(`Item at index ${index} has invalid 'stations' array.`);
    }

    if (!Array.isArray(p.envelope) || !p.envelope.every(isEnvelopePoint)) {
      throw new Error(`Item at index ${index} has invalid 'envelope' array.`);
    }

    if (p.utilityEnvelope !== undefined) {
        if (!Array.isArray(p.utilityEnvelope) || !p.utilityEnvelope.every(isEnvelopePoint)) {
             throw new Error(`Item at index ${index} has invalid 'utilityEnvelope' array.`);
        }
    }

    if (p.savedArmOverrides !== undefined) {
        if (typeof p.savedArmOverrides !== 'object' || p.savedArmOverrides === null) {
            throw new Error(`Item at index ${index} has invalid 'savedArmOverrides'.`);
        }
        // check values are numbers
        const overrides = p.savedArmOverrides as Record<string, unknown>;
        for (const key in overrides) {
            if (typeof overrides[key] !== 'number') {
                 throw new Error(`Item at index ${index} has invalid value in 'savedArmOverrides' for key ${key}.`);
            }
        }
    }

    return plane as SavedAircraft;
  });
}
