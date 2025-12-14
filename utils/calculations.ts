// src/utils/calculations.ts
import { EnvelopePoint } from "../data/aircraft";

export function isPointInPolygon(point: { cg: number, weight: number }, vs: EnvelopePoint[]) {
  const x = point.cg, y = point.weight;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].cg, yi = vs[i].weight;
      const xj = vs[j].cg, yj = vs[j].weight;
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }
  return inside;
}

export function getCGLimitsAtWeight(weight: number, envelope: EnvelopePoint[]): { minCG: number, maxCG: number } | null {
  const intersections: number[] = [];
  
  for (let i = 0; i < envelope.length; i++) {
    const p1 = envelope[i];
    const p2 = envelope[(i + 1) % envelope.length];

    if ((p1.weight <= weight && p2.weight > weight) || (p1.weight > weight && p2.weight <= weight)) {
       if (p1.weight !== p2.weight) {
          const cg = p1.cg + (weight - p1.weight) * (p2.cg - p1.cg) / (p2.weight - p1.weight);
          intersections.push(cg);
       }
    }
  }

  if (intersections.length < 2) return null;
  return {
    minCG: Math.min(...intersections),
    maxCG: Math.max(...intersections)
  };
}