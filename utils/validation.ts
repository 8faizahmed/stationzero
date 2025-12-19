import { SavedAircraft, Station, EnvelopePoint } from "../data/aircraft";

function isStation(obj: unknown): obj is Station {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.arm === 'number' &&
    typeof record.maxWeight === 'number'
  );
}

function isEnvelopePoint(obj: unknown): obj is EnvelopePoint {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.cg === 'number' &&
    typeof record.weight === 'number'
  );
}

export function isValidSavedAircraft(obj: unknown): obj is SavedAircraft {
  if (typeof obj !== 'object' || obj === null) return false;

  // Cast to Record to access properties safely
  const record = obj as Record<string, unknown>;

  const hasBasicProps =
    typeof record.id === 'string' &&
    typeof record.make === 'string' &&
    typeof record.model === 'string' &&
    typeof record.emptyWeight === 'number' &&
    typeof record.emptyArm === 'number' &&
    typeof record.registration === 'string' &&
    record.isCustomPlane === true;

  if (!hasBasicProps) return false;

  if (!Array.isArray(record.stations) || !record.stations.every(isStation)) return false;
  if (!Array.isArray(record.envelope) || !record.envelope.every(isEnvelopePoint)) return false;

  if (record.utilityEnvelope !== undefined) {
      if (!Array.isArray(record.utilityEnvelope) || !record.utilityEnvelope.every(isEnvelopePoint)) return false;
  }

  // Optional savedArmOverrides validation
  if (record.savedArmOverrides !== undefined) {
    if (typeof record.savedArmOverrides !== 'object' || record.savedArmOverrides === null) return false;
    const overrides = record.savedArmOverrides as Record<string, unknown>;
    for (const key in overrides) {
        if (typeof overrides[key] !== 'number') return false;
    }
  }

  return true;
}

export function validateFleet(data: unknown): SavedAircraft[] {
  if (!Array.isArray(data)) return [];
  // Return only valid aircraft objects from the array
  return data.filter(isValidSavedAircraft);
}
