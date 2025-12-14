"use client";

import { Aircraft } from "../data/aircraft";

interface StationData {
  id: string;
  name: string;
  weight: number;
  arm: number;
  moment: number;
}

interface ManifestProps {
  plane: Aircraft;
  date: string;
  pilotName?: string;
  
  // Data for the Detailed Table
  emptyWeight: number;
  emptyArm: number;
  stations: StationData[]; // All loaded items (Standard + Custom)
  
  // Fuel Data
  fuelArm: number;
  taxiFuelWeight: number;
  tripFuelWeight: number;

  // Totals (Pre-calculated to ensure they match the app)
  rampWeight: number;
  rampMoment: number;
  takeoffWeight: number;
  takeoffMoment: number;
  landingWeight: number;
  landingMoment: number;
  
  // CGs
  takeoffCG: number;
  landingCG: number;
  
  // Safety
  isTakeoffSafe: boolean;
  isLandingSafe: boolean;
}

export default function ManifestReport({
  plane,
  date,
  emptyWeight,
  emptyArm,
  stations,
  fuelArm,
  taxiFuelWeight,
  tripFuelWeight,
  rampWeight,
  rampMoment,
  takeoffWeight,
  takeoffMoment,
  landingWeight,
  landingMoment,
  takeoffCG,
  landingCG,
  isTakeoffSafe,
  isLandingSafe
}: ManifestProps) {
  
  const emptyMoment = emptyWeight * emptyArm;
  const taxiMoment = taxiFuelWeight * fuelArm;
  const tripMoment = tripFuelWeight * fuelArm;

  return (
    <div className="hidden print:block p-8 font-serif text-black bg-white w-full max-w-4xl mx-auto text-sm">
      
      {/* HEADER */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">Weight & Balance Manifest</h1>
          <p className="text-xs mt-1 text-gray-500">Generated via WB Calculator</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{plane.model}</h2>
          <p className="">{date}</p>
        </div>
      </div>

      {/* DETAILED LOADING TABLE */}
      <div className="mb-8">
        <h3 className="font-bold border-b border-black mb-2 uppercase text-xs tracking-wider">Loading Schedule</h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 w-1/2">Item</th>
              <th className="py-2 text-right">Weight (lbs)</th>
              <th className="py-2 text-right">Arm (in)</th>
              <th className="py-2 text-right">Moment</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. BASIC EMPTY WEIGHT */}
            <tr className="border-b border-gray-200">
              <td className="py-2 pl-2">Basic Empty Weight</td>
              <td className="py-2 text-right">{emptyWeight.toFixed(1)}</td>
              <td className="py-2 text-right text-gray-500">{emptyArm.toFixed(1)}</td>
              <td className="py-2 text-right">{emptyMoment.toFixed(0)}</td>
            </tr>

            {/* 2. PAYLOAD STATIONS */}
            {stations.map((s) => (
              <tr key={s.id} className="border-b border-gray-200">
                <td className="py-2 pl-2">{s.name}</td>
                <td className="py-2 text-right">{s.weight > 0 ? s.weight.toFixed(1) : "-"}</td>
                <td className="py-2 text-right text-gray-500">{s.arm.toFixed(1)}</td>
                <td className="py-2 text-right">{s.weight > 0 ? s.moment.toFixed(0) : "-"}</td>
              </tr>
            ))}

            {/* 3. RAMP CONDITION (SUBTOTAL) */}
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
              <td className="py-2 pl-2">RAMP WEIGHT</td>
              <td className="py-2 text-right">{rampWeight.toFixed(1)}</td>
              <td className="py-2 text-right italic font-normal">{(rampMoment/rampWeight).toFixed(2)}</td>
              <td className="py-2 text-right">{rampMoment.toFixed(0)}</td>
            </tr>

            {/* 4. TAXI BURN */}
            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-2 pl-4">- Taxi Fuel</td>
              <td className="py-2 text-right">-{taxiFuelWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{fuelArm.toFixed(1)}</td>
              <td className="py-2 text-right">-{taxiMoment.toFixed(0)}</td>
            </tr>

            {/* 5. TAKEOFF CONDITION */}
            <tr className="bg-gray-200 font-bold border-t border-black">
              <td className="py-2 pl-2">TAKEOFF WEIGHT</td>
              <td className="py-2 text-right">{takeoffWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{takeoffCG.toFixed(2)}</td>
              <td className="py-2 text-right">{takeoffMoment.toFixed(0)}</td>
            </tr>

            {/* 6. FLIGHT BURN */}
            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-2 pl-4">- Trip Fuel</td>
              <td className="py-2 text-right">-{tripFuelWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{fuelArm.toFixed(1)}</td>
              <td className="py-2 text-right">-{tripMoment.toFixed(0)}</td>
            </tr>

            {/* 7. LANDING CONDITION */}
            <tr className="bg-gray-100 font-bold border-t border-black">
              <td className="py-2 pl-2">LANDING WEIGHT</td>
              <td className="py-2 text-right">{landingWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{landingCG.toFixed(2)}</td>
              <td className="py-2 text-right">{landingMoment.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SAFETY CHECK BOXES */}
      <div className="flex gap-8 mb-12">
        <div className={`flex-1 p-4 border-2 ${isTakeoffSafe ? 'border-gray-300' : 'border-black bg-red-50'}`}>
          <p className="text-xs font-bold uppercase mb-1">Takeoff Safety Check</p>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold">{isTakeoffSafe ? "WITHIN LIMITS" : "OUT OF LIMITS"}</span>
            <span className="text-xs">CG: {takeoffCG.toFixed(2)}"</span>
          </div>
        </div>
        <div className={`flex-1 p-4 border-2 ${isLandingSafe ? 'border-gray-300' : 'border-black bg-red-50'}`}>
          <p className="text-xs font-bold uppercase mb-1">Landing Safety Check</p>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold">{isLandingSafe ? "WITHIN LIMITS" : "OUT OF LIMITS"}</span>
            <span className="text-xs">CG: {landingCG.toFixed(2)}"</span>
          </div>
        </div>
      </div>

      {/* COMPLIANCE SECTION */}
      <div className="border-t-2 border-black pt-4">
        <p className="text-sm italic mb-8">
          I certify that this aircraft is loaded within the weight and balance limits prescribed by the Pilot's Operating Handbook (POH).
        </p>

        <div className="flex justify-between mt-16 gap-8">
          <div className="flex-1 border-t border-black pt-2">
            <p className="text-xs uppercase font-bold">Pilot in Command (Signature)</p>
          </div>
          <div className="w-32 border-t border-black pt-2">
            <p className="text-xs uppercase font-bold">Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}