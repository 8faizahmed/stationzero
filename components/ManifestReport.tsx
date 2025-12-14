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
  emptyWeight: number;
  emptyArm: number;
  stations: StationData[]; 
  fuelArm: number;
  taxiFuelWeight: number;
  tripFuelWeight: number;
  rampWeight: number;
  rampMoment: number;
  takeoffWeight: number;
  takeoffMoment: number;
  landingWeight: number;
  landingMoment: number;
  takeoffCG: number;
  landingCG: number;
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
    <div className="hidden print:block p-8 font-sans text-black bg-white w-full max-w-[8.5in] mx-auto text-sm print:text-xs print:p-6 print:max-w-none">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
         <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Weight & Balance</h1>
            <p className="text-xs opacity-60">Manifest Report</p>
         </div>
         <div className="text-right">
            <h2 className="text-lg font-bold">{plane.model}</h2>
            <p className="font-mono text-base">{pilotName || "Unknown Reg"}</p>
            <p className="text-[10px] opacity-50">{date}</p>
         </div>
      </div>

      {/* 2. LOADING TABLE */}
      <div className="mb-4">
        <h3 className="font-bold border-b border-black mb-1 uppercase text-[10px] tracking-wider">Loading Schedule</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-1 w-1/2">Item</th>
              <th className="py-1 text-right">Weight</th>
              <th className="py-1 text-right">Arm</th>
              <th className="py-1 text-right">Moment</th>
            </tr>
          </thead>
          <tbody className="leading-tight">
            <tr className="border-b border-gray-200">
              <td className="py-1 pl-2">Basic Empty Weight</td>
              <td className="py-1 text-right">{emptyWeight.toFixed(1)}</td>
              <td className="py-1 text-right text-gray-500">{emptyArm.toFixed(2)}</td>
              <td className="py-1 text-right">{emptyMoment.toFixed(0)}</td>
            </tr>

            {stations.map((s) => (
              <tr key={s.id} className="border-b border-gray-200">
                <td className="py-1 pl-2">{s.name}</td>
                <td className="py-1 text-right">{s.weight > 0 ? s.weight.toFixed(1) : "-"}</td>
                <td className="py-1 text-right text-gray-500">{s.arm.toFixed(2)}</td>
                <td className="py-1 text-right">{s.weight > 0 ? s.moment.toFixed(0) : "-"}</td>
              </tr>
            ))}

            <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
              <td className="py-1 pl-2">RAMP WEIGHT</td>
              <td className="py-1 text-right">{rampWeight.toFixed(1)}</td>
              <td className="py-1 text-right italic font-normal">{(rampMoment/rampWeight || 0).toFixed(2)}</td>
              <td className="py-1 text-right">{rampMoment.toFixed(0)}</td>
            </tr>

            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-1 pl-4">- Taxi Fuel</td>
              <td className="py-1 text-right">-{taxiFuelWeight.toFixed(1)}</td>
              <td className="py-1 text-right">{fuelArm.toFixed(2)}</td>
              <td className="py-1 text-right">-{taxiMoment.toFixed(0)}</td>
            </tr>

            <tr className="bg-gray-200 font-bold border-t border-black text-sm">
              <td className="py-2 pl-2">TAKEOFF CONDITION</td>
              <td className="py-2 text-right">{takeoffWeight.toFixed(1)}</td>
              <td className="py-2 text-right">{takeoffCG.toFixed(2)}</td>
              <td className="py-2 text-right">{takeoffMoment.toFixed(0)}</td>
            </tr>

            <tr className="border-b border-gray-200 text-gray-600 italic">
              <td className="py-1 pl-4">- Trip Fuel</td>
              <td className="py-1 text-right">-{tripFuelWeight.toFixed(1)}</td>
              <td className="py-1 text-right">{fuelArm.toFixed(2)}</td>
              <td className="py-1 text-right">-{tripMoment.toFixed(0)}</td>
            </tr>

            <tr className="bg-gray-100 font-bold border-t border-black">
              <td className="py-1 pl-2">LANDING WEIGHT</td>
              <td className="py-1 text-right">{landingWeight.toFixed(1)}</td>
              <td className="py-1 text-right">{landingCG.toFixed(2)}</td>
              <td className="py-1 text-right">{landingMoment.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. STATUS SECTION */}
      <div className="mb-6 break-inside-avoid">
        {/* Status Boxes: Side-by-side grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded border-l-4 ${isTakeoffSafe ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}>
                <h3 className="font-bold text-[10px] uppercase opacity-70 mb-1">Takeoff Status</h3>
                <div className="text-lg font-black">{isTakeoffSafe ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}</div>
            </div>
            <div className={`p-3 rounded border-l-4 ${isLandingSafe ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}>
                <h3 className="font-bold text-[10px] uppercase opacity-70 mb-1">Landing Status</h3>
                <div className="text-lg font-black">{isLandingSafe ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}</div>
            </div>
        </div>
      </div>

      {/* 4. COMPLIANCE & VERIFICATION SECTION */}
      <div className="border-t-2 border-black pt-4 break-inside-avoid">
        
        {/* POH VERIFICATION CHECK */}
        <div className="flex items-start gap-2 mb-6">
          <div className="w-4 h-4 border border-black flex-shrink-0 mt-0.5"></div>
          <p className="text-xs leading-tight">
            I have verified that the calculated Center of Gravity (CG) and Weight fall within the approved envelope limits as depicted in the official <strong>Pilot's Operating Handbook (POH)</strong>.
          </p>
        </div>

        <p className="text-xs italic mb-8">
          I certify that this aircraft is loaded within the weight and balance limits prescribed by the Pilot's Operating Handbook (POH).
        </p>

        <div className="flex justify-between gap-8 mt-8">
          <div className="flex-1 border-t border-black pt-1">
            <p className="text-[10px] uppercase font-bold">Pilot in Command (Signature)</p>
          </div>
          <div className="w-32 border-t border-black pt-1">
            <p className="text-[10px] uppercase font-bold">Date</p>
          </div>
        </div>
      </div>

      {/* 5. FOOTER */}
      <div className="mt-8 border-t-2 border-gray-800 pt-4 break-inside-avoid">
        <div className="flex gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest mb-1">
              Not for Navigation / Official Use
            </h4>
            <p className="text-[9px] text-gray-600 leading-relaxed text-justify">
              This weight and balance calculation is generated by a supplemental software aid. 
              The Pilot in Command (PIC) remains solely responsible for verifying that the aircraft is loaded within the limits specified in the official Pilot's Operating Handbook (POH) and current Weight & Balance data sheet for <strong>{plane.model}</strong>. 
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