"use client";

import { Aircraft } from "../data/aircraft";
import WBGraph from "./WBGraph"; 

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
  stations: StationData[]; 
  
  // Fuel Data
  fuelArm: number;
  taxiFuelWeight: number;
  tripFuelWeight: number;

  // Totals
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
  pilotName,
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
    <div className="hidden print:block p-8 font-sans text-black bg-white w-full max-w-[8.5in] mx-auto text-sm print:p-0 print:max-w-none">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Weight & Balance</h1>
            <p className="text-sm opacity-60">Manifest Report</p>
         </div>
         <div className="text-right">
            <h2 className="text-xl font-bold">{plane.model}</h2>
            <p className="font-mono text-lg">{pilotName || "Unknown Reg"}</p>
            <p className="text-xs opacity-50 mt-1">{date}</p>
         </div>
      </div>

      {/* 2. LOADING TABLE */}
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
            {/* BASIC EMPTY WEIGHT */}
            <tr className="border-b border-gray-200">
              <td className="py-2 pl-2">Basic Empty Weight</td>
              <td className="py-2 text-right">{emptyWeight.toFixed(1)}</td>
              <td className="py-2 text-right text-gray-500">{emptyArm.toFixed(2)}</td>
              <td className="py-2 text-right">{emptyMoment.toFixed(0)}</td>
            </tr>

            {/* STATIONS */}
            {stations.map((s) => (
              <tr key={s.id} className="border-b border-gray-200">
                <td className="py-2 pl-2">{s.name}</td>
                <td className="py-2 text-right">{s.weight > 0 ? s.weight.toFixed(1) : "-"}</td>
                <td className="py-2 text-right text-gray-500">{s.arm.toFixed(2)}</td>
                <td className="py-2 text-right">{s.weight > 0 ? s.moment.toFixed(0) : "-"}</td>
              </tr>
            ))}

            {/* RAMP CONDITION */}
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
              <td className="py-2 pl-2">RAMP WEIGHT</td>
              <td className="py-2 text-right">{rampWeight.toFixed(1)}</td>
              <td className="py-2 text-right italic font-normal">{(rampMoment/rampWeight || 0).toFixed(2)}</td>
              <td className="py-2 text-right">{rampMoment.toFixed(0)}</td>
            </tr>

            {/* TAXI */}
            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-2 pl-4">- Taxi Fuel</td>
              <td className="py-2 text-right">-{taxiFuelWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{fuelArm.toFixed(2)}</td>
              <td className="py-2 text-right">-{taxiMoment.toFixed(0)}</td>
            </tr>

            {/* TAKEOFF */}
            <tr className="bg-gray-200 font-bold border-t border-black text-base">
              <td className="py-3 pl-2">TAKEOFF CONDITION</td>
              <td className="py-3 text-right">{takeoffWeight.toFixed(1)}</td>
              <td className="py-3 text-right">{takeoffCG.toFixed(2)}</td>
              <td className="py-3 text-right">{takeoffMoment.toFixed(0)}</td>
            </tr>

            {/* TRIP BURN */}
            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-2 pl-4">- Trip Fuel</td>
              <td className="py-2 text-right">-{tripFuelWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{fuelArm.toFixed(2)}</td>
              <td className="py-2 text-right">-{tripMoment.toFixed(0)}</td>
            </tr>

            {/* LANDING */}
            <tr className="bg-gray-100 font-bold border-t border-black">
              <td className="py-2 pl-2">LANDING WEIGHT</td>
              <td className="py-2 text-right">{landingWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{landingCG.toFixed(2)}</td>
              <td className="py-2 text-right">{landingMoment.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. GRAPH & STATUS */}
      {/* Changed: 'print:block' removes the grid constraint. 'print:hidden' on graph removes the empty box. */}
      <div className="grid grid-cols-2 gap-8 mb-8 break-inside-avoid print:block">
         
         {/* Graph - Hidden in print to avoid empty box issues */}
         <div className="border border-gray-300 rounded-lg p-2 h-64 print:hidden">
            <WBGraph 
                envelope={plane.envelope} 
                takeoffWeight={takeoffWeight} 
                takeoffCG={takeoffCG} 
                landingWeight={landingWeight} 
                landingCG={landingCG} 
                isDark={false} 
            />
         </div>

         {/* Status Boxes - Full width in print, side-by-side grid */}
         <div className="flex flex-col justify-center gap-4 print:grid print:grid-cols-2 print:gap-4 print:mt-4">
            <div className={`p-4 rounded border-l-4 ${isTakeoffSafe ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}>
                <h3 className="font-bold text-sm uppercase opacity-70 mb-1 print:text-xs">Takeoff Status</h3>
                <div className="text-2xl font-black print:text-xl">{isTakeoffSafe ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}</div>
            </div>
            <div className={`p-4 rounded border-l-4 ${isLandingSafe ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}>
                <h3 className="font-bold text-sm uppercase opacity-70 mb-1 print:text-xs">Landing Status</h3>
                <div className="text-2xl font-black print:text-xl">{isLandingSafe ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}</div>
            </div>
         </div>
      </div>

      {/* 4. COMPLIANCE SECTION */}
      <div className="border-t-2 border-black pt-4 break-inside-avoid">
        <p className="text-sm italic mb-12">
          I certify that this aircraft is loaded within the weight and balance limits prescribed by the Pilot's Operating Handbook (POH).
        </p>

        <div className="flex justify-between gap-8">
          <div className="flex-1 border-t border-black pt-2">
            <p className="text-xs uppercase font-bold">Pilot in Command (Signature)</p>
          </div>
          <div className="w-32 border-t border-black pt-2">
            <p className="text-xs uppercase font-bold">Date</p>
          </div>
        </div>
      </div>

      {/* 5. SPACER */}
      <div className="h-32 w-full print:block hidden"></div>

      {/* 6. FIXED SAFETY FOOTER */}
      <div className="mt-12 border-t-2 border-gray-800 pt-6 break-inside-avoid print:fixed print:bottom-0 print:left-0 print:w-full print:px-8 print:pb-8 print:bg-white">
        <div className="flex gap-4">
          <div className="text-4xl">⚠️</div>
          <div>
            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">
              Not for Navigation / Official Use
            </h4>
            <p className="text-[10px] text-gray-600 leading-relaxed text-justify">
              This weight and balance calculation is generated by a supplemental software aid. 
              The Pilot in Command (PIC) remains solely responsible for verifying that the aircraft is loaded within the limits specified in the official Pilot's Operating Handbook (POH) and current Weight & Balance data sheet for <strong>{plane.model}</strong>. 
              Ensure all inputs (weights, arms, fuel density) match actual flight conditions.
            </p>
          </div>
        </div>
        
        <div className="text-right mt-2 text-[9px] text-gray-400 font-mono uppercase">
          Generated: {new Date().toLocaleString()}
        </div>
      </div>

    </div> 
  );
}