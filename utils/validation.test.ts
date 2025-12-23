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
    registration: 'N12345',
    isCustomPlane: true,
    stations: [
      { id: 'seat1', name: 'Pilot', arm: 40, maxWeight: 200 }
    ],
    envelope: [
      { cg: 30, weight: 800 },
      { cg: 60, weight: 1200 }
    ]
  };

  it('should validate a correct fleet array', () => {
    const fleet = [validAircraft];
    expect(validateImportedFleet(fleet)).toEqual(fleet);
  });

  it('should return null for non-array input', () => {
    expect(validateImportedFleet({} as any)).toBeNull();
    expect(validateImportedFleet("string" as any)).toBeNull();
    expect(validateImportedFleet(123 as any)).toBeNull();
  });

  it('should return null if an item is missing required fields', () => {
    const invalidPlane = { ...validAircraft, registration: undefined };
    expect(validateImportedFleet([invalidPlane])).toBeNull();
  });

  it('should return null if stations are invalid', () => {
    const invalidPlane = {
      ...validAircraft,
      stations: [{ id: 'seat1', name: 'Pilot', arm: 'invalid' }] // arm is string
    };
    expect(validateImportedFleet([invalidPlane])).toBeNull();
  });

  it('should return null if envelope is invalid', () => {
    const invalidPlane = {
        ...validAircraft,
        envelope: "not-an-array"
    };
    expect(validateImportedFleet([invalidPlane])).toBeNull();
  });

  it('should validate with optional fields', () => {
    const planeWithOptional = {
        ...validAircraft,
        utilityEnvelope: [{ cg: 30, weight: 800 }],
        savedArmOverrides: { seat1: 41 }
    };
    expect(validateImportedFleet([planeWithOptional])).toEqual([planeWithOptional]);
  });

  it('should return null for malformed arm overrides', () => {
     const invalidPlane = {
        ...validAircraft,
        savedArmOverrides: { seat1: "should-be-number" }
    };
    expect(validateImportedFleet([invalidPlane])).toBeNull();
  });
});
