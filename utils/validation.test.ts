import { describe, it, expect } from 'vitest';
import { validateImportedFleet } from './validation';
import { SavedAircraft } from '../data/aircraft';

describe('validateImportedFleet', () => {
  const validAircraft: SavedAircraft = {
    id: 'test-plane',
    make: 'Test',
    model: 'Plane',
    emptyWeight: 1000,
    emptyArm: 50,
    stations: [
      { id: 'st1', name: 'Station 1', arm: 50, maxWeight: 200 }
    ],
    envelope: [
      { cg: 40, weight: 800 },
      { cg: 60, weight: 1200 }
    ],
    registration: 'N12345',
    isCustomPlane: true,
  };

  it('should return true for valid fleet data', () => {
    expect(validateImportedFleet([validAircraft])).toBe(true);
  });

  it('should return true for empty fleet', () => {
    expect(validateImportedFleet([])).toBe(true);
  });

  it('should return false if input is not an array', () => {
    expect(validateImportedFleet({})).toBe(false);
    expect(validateImportedFleet(null)).toBe(false);
    expect(validateImportedFleet('string')).toBe(false);
  });

  it('should return false if an item is missing required fields', () => {
    const invalidAircraft = { ...validAircraft };
    // @ts-expect-error Testing missing field
    delete invalidAircraft.id;
    expect(validateImportedFleet([invalidAircraft])).toBe(false);
  });

  it('should return false if an item has incorrect types', () => {
    const invalidAircraft = { ...validAircraft, emptyWeight: '1000' }; // string instead of number
    expect(validateImportedFleet([invalidAircraft])).toBe(false);
  });

  it('should return false if stations are invalid', () => {
    const invalidAircraft = {
      ...validAircraft,
      stations: [{ id: 'st1', name: 'Station 1', arm: '50', maxWeight: 200 }] // arm is string
    };
    expect(validateImportedFleet([invalidAircraft])).toBe(false);
  });

  it('should return false if envelope is invalid', () => {
    const invalidAircraft = {
      ...validAircraft,
      envelope: [{ cg: '40', weight: 800 }] // cg is string
    };
    expect(validateImportedFleet([invalidAircraft])).toBe(false);
  });

  it('should return false if isCustomPlane is not true', () => {
    const invalidAircraft = { ...validAircraft, isCustomPlane: false };
    expect(validateImportedFleet([invalidAircraft])).toBe(false);
  });
});
