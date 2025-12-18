import { Aircraft, SavedAircraft } from "../data/aircraft";

/**
 * Validates if the input is a valid SavedAircraft object.
 */
function isValidSavedAircraft(obj: any): obj is SavedAircraft {
  if (typeof obj !== 'object' || obj === null) return false;

  // Check required string fields
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.model !== 'string') return false;
  // registration is optional in base Aircraft but usually present in SavedAircraft
  if (obj.registration !== undefined && typeof obj.registration !== 'string') return false;

  // Check required number fields
  if (typeof obj.emptyWeight !== 'number' || !Number.isFinite(obj.emptyWeight)) return false;
  if (typeof obj.emptyArm !== 'number' || !Number.isFinite(obj.emptyArm)) return false;

  // Check stations array
  if (!Array.isArray(obj.stations)) return false;
  for (const station of obj.stations) {
    if (typeof station !== 'object' || station === null) return false;
    if (typeof station.id !== 'string') return false;
    if (typeof station.name !== 'string') return false;
    if (typeof station.arm !== 'number' || !Number.isFinite(station.arm)) return false;
  }

  // Check envelope array
  if (!Array.isArray(obj.envelope)) return false;
  for (const point of obj.envelope) {
    if (typeof point !== 'object' || point === null) return false;
    if (typeof point.cg !== 'number' || !Number.isFinite(point.cg)) return false;
    if (typeof point.weight !== 'number' || !Number.isFinite(point.weight)) return false;
  }

  // Check optional fields if present
  if (obj.isCustomPlane !== undefined && typeof obj.isCustomPlane !== 'boolean') return false;

  if (obj.savedArmOverrides !== undefined) {
    if (typeof obj.savedArmOverrides !== 'object' || obj.savedArmOverrides === null) return false;
    for (const key in obj.savedArmOverrides) {
        if (typeof obj.savedArmOverrides[key] !== 'number' || !Number.isFinite(obj.savedArmOverrides[key])) return false;
    }
  }

  return true;
}

/**
 * Validates if the input is an array of SavedAircraft objects.
 * Use this when loading fleet data from LocalStorage or file import.
 */
export function validateFleetData(data: any): SavedAircraft[] | null {
  if (!Array.isArray(data)) return null;

  // Filter out any invalid aircraft objects to ensure robustness
  // Or return null if strictly enforcing integrity.
  // Defense in depth: Let's clean the data by filtering valid items only.
  const validFleet = data.filter(isValidSavedAircraft);

  // If the array was not empty but no valid items found, it might be the wrong format completely.
  if (data.length > 0 && validFleet.length === 0) return null;

  return validFleet;
}
