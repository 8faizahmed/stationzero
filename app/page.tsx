"use client";

import { useState, useEffect } from "react";
import { aircraftList, Aircraft } from "../data/aircraft";
import WBGraph from "../components/WBGraph";

interface CustomStation {
  id: string;
  name: string;
  weight: number;
  arm: number;
}

export default function Home() {
  const [selectedPlane, setSelectedPlane] = useState<Aircraft | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [useGallons, setUseGallons] = useState(true);
  const [category, setCategory] = useState<'normal' | 'utility'>('normal');

  // Configuration States
  const [customEmptyWeight, setCustomEmptyWeight] = useState(0);
  const [customEmptyArm, setCustomEmptyArm] = useState(0);
  
  // View Toggles
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showFlightPlan, setShowFlightPlan] = useState(false); // NEW: Flight Planning Toggle

  // Flight Planning Data
  const [taxiFuel, setTaxiFuel] = useState(1.5); // Default 1.5 gal taxi
  const [tripFuel, setTripFuel] = useState(0);

  // Overrides & Custom Data
  const [armOverrides, setArmOverrides] = useState<Record<string, number>>({});
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);

  useEffect(() => {
    if (selectedPlane) {
      setCategory('normal');
      setCustomEmptyWeight(selectedPlane.emptyWeight);
      setCustomEmptyArm(selectedPlane.emptyArm);
      setWeights({});
      setArmOverrides({});
      setCustomStations([]);
      setTaxiFuel(1.5); // Reset taxi to reasonable default
      setTripFuel(0);
    }
  }, [selectedPlane]);

  const handleWeightChange = (stationId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights((prev) => ({ ...prev, [stationId]: numValue }));
  };

  const handleArmOverride = (stationId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    setArmOverrides((prev) => ({ ...prev, [stationId]: numValue }));
  };

  const addCustomStation = () => {
    const newStation: CustomStation = {
      id: `custom-${Date.now()}`,
      name: "New Item",
      weight: 0,
      arm: 0, 
    };
    setCustomStations([...customStations, newStation]);
  };

  const updateCustomStation = (id: string, field: keyof CustomStation, value: string | number) => {
    setCustomStations(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeCustomStation = (id: string) => {
    setCustomStations(prev => prev.filter(s => s.id !== id));
  };

  // --- CALCULATION LOGIC ---
  
  // 1. Calculate Ramp Condition (Everything Loaded)
  let rampWeight = customEmptyWeight;
  let rampMoment = customEmptyWeight * customEmptyArm;
  let fuelArm = 0; // We need to find the fuel arm to calculate burn

  const activeEnvelope = (category === 'utility' && selectedPlane?.utilityEnvelope) 
    ? selectedPlane.utilityEnvelope 
    : selectedPlane?.envelope || [];

  if (selectedPlane) {
    // Standard Stations
    selectedPlane.stations.forEach((station) => {
      let weight = weights[station.id] || 0;
      const isFuel = station.id.toLowerCase().includes("fuel");
      
      if (isFuel) {
        if (useGallons) weight = weight * 6;
        // Capture the effective fuel arm for burn calculations later
        fuelArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
      }

      const effectiveArm = armOverrides[station.id] !== undefined 
        ? armOverrides[station.id] 
        : station.arm;

      rampWeight += weight;
      rampMoment += weight * effectiveArm;
    });

    // Custom Stations
    customStations.forEach((station) => {
      rampWeight += station.weight;
      rampMoment += station.weight * station.arm;
    });
  }

  // 2. Calculate Takeoff Condition (Ramp - Taxi Burn)
  const taxiWeight = taxiFuel * 6; // Assume taxi input is always gallons
  const takeoffWeight = rampWeight - taxiWeight;
  const takeoffMoment = rampMoment - (taxiWeight * fuelArm);
  const takeoffCG = takeoffMoment / (takeoffWeight || 1);

  // 3. Calculate Landing Condition (Takeoff - Trip Fuel)
  // Only valid if we have enabled flight planning and entered a trip fuel
  let landingWeight = 0;
  let landingCG = 0;
  
  if (showFlightPlan && tripFuel > 0) {
    const tripWeight = tripFuel * 6;
    landingWeight = takeoffWeight - tripWeight;
    const landingMoment = takeoffMoment - (tripWeight * fuelArm);
    landingCG = landingMoment / (landingWeight || 1);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">W&B Calculator</h1>
        </div>

        {!selectedPlane ? (
          // --- AIRCRAFT LIST ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aircraftList.map((plane) => (
              <button
                key={plane.id}
                onClick={() => setSelectedPlane(plane)}
                className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
              >
                <h2 className="font-bold text-lg group-hover:text-blue-600">{plane.model}</h2>
                <p className="text-gray-400 text-sm">{plane.make}</p>
                {plane.utilityEnvelope && (
                  <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Utility Cat. Available
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          // --- CALCULATOR VIEW ---
          <div className="flex flex-col gap-6">
            
            {/* 1. TOP NAV & TITLE */}
            <div>
              <button 
                onClick={() => setSelectedPlane(null)}
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600 mb-2"
              >
                ← Back to aircraft list
              </button>
              <h2 className="text-3xl font-bold text-gray-900">{selectedPlane.model}</h2>
            </div>

            {/* 2. CONTROL DECK */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap items-center gap-3">
                 <button 
                    onClick={() => setShowMoments(!showMoments)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${showMoments ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    <span>Show Moments</span>
                    <div className={`w-2 h-2 rounded-full ${showMoments ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </button>

                  <button 
                    onClick={() => setShowInfoCard(!showInfoCard)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${showInfoCard ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    <span>Std Weights</span>
                    <div className={`w-2 h-2 rounded-full ${showInfoCard ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </button>

                  {/* NEW: Flight Plan Toggle */}
                  <button 
                    onClick={() => setShowFlightPlan(!showFlightPlan)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${showFlightPlan ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  >
                    <span>Flight Plan</span>
                    <div className={`w-2 h-2 rounded-full ${showFlightPlan ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </button>
              </div>
            </div>

            {/* 3. MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            
              {/* LEFT COLUMN: Inputs */}
              <div className="md:col-span-5 space-y-4">
                
                {/* Standard Weights Card */}
                {showInfoCard && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm animate-fade-in">
                     {/* ... (Standard Weights Content Same as Before) ... */}
                     <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-blue-900">Standard Pax Weights</h3>
                      <button onClick={() => setShowInfoCard(false)} className="text-blue-400 hover:text-blue-700">×</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="font-semibold text-gray-500">Pax</div>
                      <div className="font-semibold text-gray-500">Summer</div>
                      <div className="font-semibold text-gray-500">Winter</div>
                      <div className="text-left">Male</div><div className="bg-white rounded border border-blue-100">200</div><div className="bg-white rounded border border-blue-100">206</div>
                      <div className="text-left">Female</div><div className="bg-white rounded border border-blue-100">165</div><div className="bg-white rounded border border-blue-100">171</div>
                      <div className="text-left">Child</div><div className="bg-white rounded border border-blue-100">75</div><div className="bg-white rounded border border-blue-100">75</div>
                    </div>
                  </div>
                )}

                {/* Basic Empty Weight Config */}
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aircraft Specific Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Basic Empty Weight</label>
                      <input 
                        type="number" 
                        value={customEmptyWeight || ""}
                        onChange={(e) => setCustomEmptyWeight(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Empty CG (Arm)</label>
                      <input 
                        type="number" 
                        value={customEmptyArm || ""}
                        onChange={(e) => setCustomEmptyArm(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    
                    {/* STANDARD STATIONS */}
                    {selectedPlane.stations.map((station) => {
                      const isFuel = station.id.toLowerCase().includes("fuel");
                      const currentArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
                      const weight = weights[station.id] || 0;
                      const displayWeight = (isFuel && useGallons) ? weight * 6 : weight;
                      const currentMoment = displayWeight * currentArm;

                      return (
                        <div key={station.id}>
                          <div className="flex items-center justify-between p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <label htmlFor={station.id} className="text-sm font-medium text-gray-700">
                                  {station.name}
                                </label>
                                {isFuel && (
                                  <button
                                    onClick={() => setUseGallons(!useGallons)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                  >
                                    {useGallons ? "LBS" : "GALS"}
                                  </button>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                                <div className="flex items-center gap-1">
                                  <span>Arm:</span>
                                  <input 
                                    type="number" 
                                    value={currentArm}
                                    onChange={(e) => handleArmOverride(station.id, e.target.value)}
                                    className="w-10 bg-transparent border-b border-gray-300 text-center text-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                  />
                                </div>
                                {showMoments && (
                                  <span className="text-blue-600 font-medium bg-blue-50 px-1.5 rounded">
                                    Mom: {currentMoment.toFixed(0)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                id={station.id}
                                placeholder="0"
                                className="w-24 p-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={weights[station.id] || ""}
                                onChange={(e) => handleWeightChange(station.id, e.target.value)}
                              />
                              <span className="text-xs text-gray-400 font-medium w-6">
                                {isFuel && useGallons ? "Gals" : "Lbs"}
                              </span>
                            </div>
                          </div>

                          {/* NEW: FLIGHT PLANNING SUB-INPUTS (Only for Fuel Station) */}
                          {isFuel && showFlightPlan && (
                            <div className="bg-blue-50/50 border-t border-b border-blue-100 px-4 py-3 grid grid-cols-2 gap-4 animate-fade-in">
                              
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Taxi Fuel</label>
                                <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2">
                                  <input 
                                    type="number"
                                    value={taxiFuel}
                                    onChange={(e) => setTaxiFuel(parseFloat(e.target.value) || 0)}
                                    className="w-full py-1.5 text-sm text-gray-700 focus:outline-none"
                                    placeholder="1.5"
                                  />
                                  <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Flight Burn</label>
                                <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2">
                                  <input 
                                    type="number"
                                    value={tripFuel || ""}
                                    onChange={(e) => setTripFuel(parseFloat(e.target.value) || 0)}
                                    className="w-full py-1.5 text-sm text-gray-700 focus:outline-none"
                                    placeholder="0"
                                  />
                                  <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* CUSTOM STATIONS */}
                    {customStations.map((station) => (
                       /* ... (Custom Station Code Same as Before) ... */
                       <div key={station.id} className="flex items-center justify-between p-4 border-t border-gray-100 group relative bg-orange-50/50">
                        <button 
                          onClick={() => removeCustomStation(station.id)}
                          className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="flex-1 pr-4">
                          <input 
                            type="text" 
                            placeholder="Item Name"
                            value={station.name}
                            onChange={(e) => updateCustomStation(station.id, 'name', e.target.value)}
                            className="text-sm font-medium text-gray-700 bg-transparent border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none w-full mb-1 transition-colors"
                          />
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <span>Arm:</span>
                              <input 
                                type="number" 
                                value={station.arm}
                                onChange={(e) => updateCustomStation(station.id, 'arm', parseFloat(e.target.value) || 0)}
                                className="w-10 bg-white border border-gray-300 rounded px-1 text-center text-gray-600 focus:outline-none focus:border-orange-500"
                              />
                            </div>
                            {showMoments && (
                                <span className="text-orange-600 font-medium bg-orange-100/50 px-1.5 rounded">
                                  Mom: {(station.weight * station.arm).toFixed(0)}
                                </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            placeholder="0"
                            className="w-24 p-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                            value={station.weight || ""}
                            onChange={(e) => updateCustomStation(station.id, 'weight', parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-gray-400 font-medium w-6">Lbs</span>
                        </div>
                      </div>
                    ))}

                  </div>
                  
                  {/* Add Button */}
                  <div className="p-2 bg-gray-50 border-t border-gray-100">
                    <button 
                      onClick={addCustomStation}
                      className="w-full py-2 text-xs font-bold text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all"
                    >
                      + Add Custom Item
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Graph */}
              <div className="md:col-span-7 flex flex-col gap-4 sticky top-8">
                
                {/* Graph Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Envelope Graph</h3>
                    {selectedPlane.utilityEnvelope && (
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setCategory('normal')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${category === 'normal' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}
                        >
                          Normal
                        </button>
                        <button
                          onClick={() => setCategory('utility')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${category === 'utility' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}
                        >
                          Utility
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0">
                    <WBGraph 
                      envelope={activeEnvelope} 
                      takeoffWeight={takeoffWeight}
                      takeoffCG={takeoffCG}
                      landingWeight={landingWeight}
                      landingCG={landingCG}
                    />
                  </div>
                </div>

                {/* RESULTS CARD */}
                <div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
                    takeoffWeight > Math.max(...activeEnvelope.map(p => p.weight)) 
                    ? 'bg-red-600 text-white' 
                    : 'bg-blue-900 text-white'
                  }`}>
                  
                  <div className="grid grid-cols-2 gap-8 relative">
                    {/* TAKEOFF DATA */}
                    <div>
                      <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">Takeoff Weight</span>
                      <span className="text-3xl font-bold">{takeoffWeight.toFixed(1)} <span className="text-base font-normal opacity-70">lbs</span></span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">Takeoff CG</span>
                      <span className="text-3xl font-bold">{takeoffCG.toFixed(2)} <span className="text-base font-normal opacity-70">in</span></span>
                    </div>

                    {/* LANDING DATA (Only if enabled) */}
                    {showFlightPlan && tripFuel > 0 && (
                      <>
                         <div className="pt-4 border-t border-white/20 mt-2 col-span-2 grid grid-cols-2 gap-8">
                            <div>
                              <span className="text-green-300 text-xs uppercase tracking-wider block mb-1">Landing Weight</span>
                              <span className="text-xl font-bold text-green-100">{landingWeight.toFixed(1)} <span className="text-sm font-normal opacity-70">lbs</span></span>
                            </div>
                            <div>
                              <span className="text-green-300 text-xs uppercase tracking-wider block mb-1">Landing CG</span>
                              <span className="text-xl font-bold text-green-100">{landingCG.toFixed(2)} <span className="text-sm font-normal opacity-70">in</span></span>
                            </div>
                         </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}