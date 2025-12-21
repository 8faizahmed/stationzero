import { validateImportedFleet } from '../utils/validation';

// Mock console.error to keep output clean
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('validateImportedFleet', () => {
  const validPlane = {
    id: "test-plane",
    make: "Test",
    model: "Plane",
    registration: "N12345",
    emptyWeight: 1000,
    emptyArm: 50,
    isCustomPlane: true,
    stations: [
      { id: "pilot", name: "Pilot", arm: 40, maxWeight: 200 }
    ],
    envelope: [
      { cg: 40, weight: 1000 },
      { cg: 60, weight: 1000 }
    ]
  };

  it('should accept valid fleet data', () => {
    const data = [validPlane];
    const result = validateImportedFleet(data);
    expect(result).toEqual(data);
  });

  it('should reject non-array input', () => {
    expect(() => validateImportedFleet({})).toThrow("Imported data must be an array.");
    expect(() => validateImportedFleet(null)).toThrow("Imported data must be an array.");
  });

  it('should reject invalid objects in array', () => {
    expect(() => validateImportedFleet([null])).toThrow("Item at index 0 is not a valid object.");
    expect(() => validateImportedFleet(["string"])).toThrow("Item at index 0 is not a valid object.");
  });

  it('should reject missing required string fields', () => {
    const invalid = { ...validPlane, make: 123 };
    expect(() => validateImportedFleet([invalid])).toThrow("Item at index 0 missing or invalid string field: make");
  });

  it('should reject missing required number fields', () => {
    const invalid = { ...validPlane, emptyWeight: "heavy" };
    expect(() => validateImportedFleet([invalid])).toThrow("Item at index 0 missing or invalid number field: emptyWeight");
  });

  it('should reject missing isCustomPlane: true', () => {
    const invalid = { ...validPlane, isCustomPlane: false };
    expect(() => validateImportedFleet([invalid])).toThrow("Item at index 0 must have isCustomPlane: true");

    // Create copy without using 'as any' since Jest transformer might not support it fully or parsing issue
    const missing = Object.assign({}, validPlane);
    // @ts-expect-error - testing missing required property
    delete missing.isCustomPlane;
    expect(() => validateImportedFleet([missing])).toThrow("Item at index 0 must have isCustomPlane: true");
  });

  it('should reject invalid stations array', () => {
    const invalid = { ...validPlane, stations: "not-an-array" };
    expect(() => validateImportedFleet([invalid])).toThrow("Item at index 0 has invalid 'stations' array.");

    const invalidItem = { ...validPlane, stations: [{ id: "pilot" }] }; // Missing fields
    expect(() => validateImportedFleet([invalidItem])).toThrow("Item at index 0 has invalid 'stations' array.");
  });

  it('should reject invalid envelope array', () => {
    // validateImportedFleet checks isEnvelopePoint for every item. Empty array passes every().
    // That's fine for the validation function logic (a plane could theoretically have no envelope defined yet if that was allowed by type, but Aircraft interface implies it exists. The check ensures if it exists it matches structure).

    const invalidItem = { ...validPlane, envelope: [{ cg: "fwd" }] };
    expect(() => validateImportedFleet([invalidItem])).toThrow("Item at index 0 has invalid 'envelope' array.");
  });

  it('should reject invalid savedArmOverrides', () => {
    const invalid = { ...validPlane, savedArmOverrides: { "pilot": "heavy" } };
    expect(() => validateImportedFleet([invalid])).toThrow("Item at index 0 has invalid value in 'savedArmOverrides' for key pilot.");
  });
});
