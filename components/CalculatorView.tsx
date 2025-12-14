"use client";

import React, { useState } from 'react';
import StationRow from "./StationRow";
import WBGraph from "./WBGraph";

interface CalculatorProps {
  plane: any;
  weights: any;
  armOverrides: any;
  customStations: any[];
  fuel: { taxi: number; trip: number; burn: number };
  toggles: { moments: boolean; info: boolean; flightPlan: boolean };
  category: 'normal' | 'utility';
  isDark: boolean;
  useGallons: boolean;
  results: {
    rampWeight: number;
    takeoffWeight: number;
    takeoffMoment: number;
    takeoffCG: number;
    landingWeight: number;
    landingCG: number;
    isTakeoffSafe: boolean;
    isLandingSafe: boolean;
    takeoffIssue: string | null;
    landingIssue: string | null;
    isGo: boolean;
    enduranceHours: number;
    enduranceMinutes: number;
    activeEnvelope: any[];
    maxGross: number;
  };
  customEmptyWeight: number;
  customEmptyArm: number;
  setCustomEmptyWeight: (val: number) => void;
  setCustomEmptyArm: (val: number) => void;
  setWeights: (w: any) => void;
  setArmOverrides: (a: any) => void;
  setCategory: (c: 'normal' | 'utility') => void;
  setFuel: (f: any) => void;
  setToggles: (t: any) => void;
  setUseGallons: (val: boolean) => void;
  onUpdateCustom: (id: string, field: string, val: any) => void;
  onDeleteCustom: (id: string) => void;
  onAddCustom: () => void;
  onBack: () => void;
}

export default function CalculatorView({
  plane, weights, armOverrides, customStations, fuel, toggles, category, isDark, useGallons, results,
  customEmptyWeight, customEmptyArm, setCustomEmptyWeight, setCustomEmptyArm,
  setWeights, setArmOverrides, setCategory, setFuel, setToggles, setUseGallons,
  onUpdateCustom, onDeleteCustom, onAddCustom, onBack
}: CalculatorProps) {

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { 
    takeoffWeight, takeoffCG, landingWeight, landingCG, 
    isTakeoffSafe, isLandingSafe, takeoffIssue, landingIssue, isGo,
    enduranceHours, enduranceMinutes, activeEnvelope, maxGross 
  } = results;

  const loadPercentage = Math.min((takeoffWeight / maxGross) * 100, 100);

  // --- DYNAMIC FUEL CONSTANTS ---
  const FUEL_DENSITY = 6;
  
  // FIX: Find the fuel station from the plane data to get the TRUE max weight
  const fuelStation = plane.stations.find((s: any) => s.id.toLowerCase().includes('fuel'));
  
  // Calculate Max Gallons dynamically. Default to 53 if not found.
  // maxWeight (lbs) / 6 = maxGallons
  const MAX_GAL = fuelStation && fuelStation.maxWeight 
      ? fuelStation.maxWeight / FUEL_DENSITY 
      : 53;

  // Tabs is usually ~65-70% of max fuel, or hardcoded for specific models if you have that data.
  // For now, we scale it relative to the tank size (e.g. 172S is 53gal -> 35gal tabs).
  const TABS_GAL = Math.round(MAX_GAL * 0.66); 

  // Visual limits for the slider based on the dynamic MAX_GAL
  const maxFuelDisplay = useGallons ? MAX_GAL : (MAX_GAL * FUEL_DENSITY);
  const tabsFuelDisplay = useGallons ? TABS_GAL : (TABS_GAL * FUEL_DENSITY);
  const unitLabel = useGallons ? 'gal' : 'lbs';
  const stepVal = useGallons ? 0.5 : 1;

  // --- HANDLERS ---

  // 1. Toggle Handler
  const handleToggleUnit = (stationId: string, currentVal: number) => {
    let newVal = currentVal;
    
    if (useGallons) {
       // Switching Gals -> Lbs
       newVal = currentVal * FUEL_DENSITY;
    } else {
       // Switching Lbs -> Gals
       newVal = currentVal / FUEL_DENSITY;
    }
    
    setWeights({ ...weights, [stationId]: newVal });
    setUseGallons(!useGallons);
  };

  // 2. Input Handlers
  const handleInput = (id: string, val: number) => {
    setWeights({...weights, [id]: val});
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition-colors">
            ← Back to hangar
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{plane.model}</h2>
            {plane.registration && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-md tracking-wide">
                {plane.registration}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                 <button onClick={() => setToggles({...toggles, moments: !toggles.moments})} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${toggles.moments ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}>
                    Moments
                 </button>
                 <button onClick={() => setToggles({...toggles, flightPlan: !toggles.flightPlan})} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${toggles.flightPlan ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}>
                    Flight Plan
                 </button>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm transition-all text-xs">
                <span>🖨️ Print</span>
            </button>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Inputs (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CONFIG ACCORDION */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <button 
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                <span>⚙️ Aircraft Configuration</span>
                <span className="font-normal text-gray-400 text-xs ml-2 hidden sm:inline-block">
                    BEW: {customEmptyWeight} lbs • Arm: {customEmptyArm}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                 {'isCustomPlane' in plane && (
                  <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800 uppercase font-bold tracking-wider">
                    Auto-Saved
                  </span>
                )}
                <span className={`text-gray-400 transform transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>
            
            {isConfigOpen && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down bg-white dark:bg-gray-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Basic Empty Weight</label>
                  <input 
                    type="number" 
                    value={customEmptyWeight || ""}
                    onChange={(e) => setCustomEmptyWeight(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Empty CG (Arm)</label>
                  <input 
                    type="number" 
                    value={customEmptyArm || ""}
                    onChange={(e) => setCustomEmptyArm(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* LOAD MANIFEST */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                ⚖️ Load Manifest
                </h2>
                <button onClick={() => setToggles({...toggles, info: !toggles.info})} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {toggles.info ? 'Hide Std Weights' : 'Show Std Weights'}
                </button>
            </div>

            {toggles.info && (
                <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 border-b border-blue-100 dark:border-blue-800 grid grid-cols-3 gap-4 text-xs animate-fade-in">
                    <div>
                        <span className="block font-bold text-blue-900 dark:text-blue-200">Standard Male</span>
                        <span className="text-blue-700 dark:text-blue-300">Summer: 200 • Winter: 206</span>
                    </div>
                    <div>
                        <span className="block font-bold text-blue-900 dark:text-blue-200">Standard Female</span>
                        <span className="text-blue-700 dark:text-blue-300">Summer: 165 • Winter: 171</span>
                    </div>
                </div>
            )}

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {plane.stations.map((station: any) => {
                const isFuel = station.id.toLowerCase().includes("fuel");
                const currentWeight = weights[station.id] || 0;
                
                return (
                  <div key={station.id} className={isFuel ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}>
                    <StationRow 
                      id={station.id} 
                      name={station.name} 
                      weight={currentWeight} // Pass state directly (Active Unit)
                      arm={armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm}
                      isFuel={isFuel} 
                      useGallons={useGallons} 
                      showMoments={toggles.moments}
                      
                      // Input: Save directly to state.
                      onWeightChange={(val) => handleInput(station.id, parseFloat(val) || 0)}
                      onArmChange={(val) => { const v = parseFloat(val); if(!isNaN(v)) setArmOverrides({...armOverrides, [station.id]: v}); }}
                      
                      // Toggle: Triggers conversion logic
                      onToggleUnit={() => handleToggleUnit(station.id, currentWeight)}
                    />
                    
                    {isFuel && (
                      <div className="px-4 pb-4 animate-fade-in">
                         {/* SLIDER CONTROLS */}
                         <div className="mb-4 px-2">
                             <input 
                               type="range"
                               min="0"
                               max={maxFuelDisplay} 
                               step={stepVal}
                               value={currentWeight} 
                               onChange={(e) => {
                                   handleInput(station.id, parseFloat(e.target.value));
                               }}
                               className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                             />
                             <div className="flex justify-between text-[10px] text-blue-400 dark:text-blue-300 font-bold uppercase mt-1 px-1">
                                <span>Empty</span>
                                <span>Tabs ({tabsFuelDisplay}{unitLabel})</span>
                                <span>Full ({maxFuelDisplay}{unitLabel})</span>
                             </div>
                         </div>

                         {/* FLIGHT PLAN */}
                         {toggles.flightPlan && (
                            <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-xl p-3 grid grid-cols-2 gap-4 shadow-sm items-stretch">
                                {/* Left Column: Taxi & Burn */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Taxi Fuel</label>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 mt-1 focus-within:ring-2 focus-within:ring-blue-500">
                                            <input type="number" value={fuel.taxi} onChange={(e) => setFuel({...fuel, taxi: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm font-mono bg-transparent focus:outline-none dark:text-white" />
                                            <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Cruise Burn</label>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 mt-1 focus-within:ring-2 focus-within:ring-blue-500">
                                            <input type="number" value={fuel.burn || ""} onChange={(e) => setFuel({...fuel, burn: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm font-mono bg-transparent focus:outline-none dark:text-white" placeholder="0" />
                                            <span className="text-[10px] text-gray-400 font-medium">GPH</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Right Column: Trip & Endurance */}
                                <div className="flex flex-col justify-between space-y-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Flight Burn</label>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 mt-1 focus-within:ring-2 focus-within:ring-blue-500">
                                            <input type="number" value={fuel.trip || ""} onChange={(e) => setFuel({...fuel, trip: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm font-mono bg-transparent focus:outline-none dark:text-white" placeholder="0" />
                                            <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-2 text-white text-center flex flex-col justify-center shadow-sm h-full">
                                        <span className="text-[9px] uppercase font-bold opacity-80">Total Endurance</span>
                                        {fuel.burn > 0 && results.activeEnvelope ? (
                                            <span className="text-xl font-bold leading-none mt-1">{enduranceHours}h <span className="text-sm font-normal opacity-80">{enduranceMinutes}m</span></span>
                                        ) : <span className="text-sm opacity-60 mt-1">-- h -- m</span>}
                                    </div>
                                </div>
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {customStations.map((s) => (
                <StationRow key={s.id} id={s.id} name={s.name} weight={s.weight} arm={s.arm} isCustom={true} useGallons={false} showMoments={toggles.moments}
                  onWeightChange={(val) => onUpdateCustom(s.id, 'weight', parseFloat(val)||0)}
                  onArmChange={(val) => onUpdateCustom(s.id, 'arm', parseFloat(val)||0)}
                  onNameChange={(val) => onUpdateCustom(s.id, 'name', val)}
                  onDelete={() => onDeleteCustom(s.id)}
                />
              ))}
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              <button onClick={onAddCustom} className="w-full py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                 <span>+ Add Custom Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
          
          {/* STATUS BOARD */}
          <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${isGo ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'bg-red-600 text-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Flight Status</span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black tracking-tight">{isGo ? "GO" : "NO GO"}</span>
                  {isGo && (
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${category === 'normal' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                          {category} Cat
                      </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{takeoffWeight.toFixed(0)}</div>
                <div className="text-xs font-bold opacity-70">LBS (Max {maxGross})</div>
              </div>
            </div>
            
            {/* Weight Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${loadPercentage > 100 ? 'bg-red-500' : 'bg-green-400'}`} 
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] opacity-60 font-mono mb-6">
              <span>0%</span>
              <span>100% MTOW</span>
            </div>

            {/* Detailed Checks */}
            <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${isTakeoffSafe ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 animate-pulse'}`}></div>
                         <span className="text-sm font-bold opacity-90">Takeoff CG</span>
                    </div>
                    <span className="font-mono font-bold text-sm">{takeoffCG.toFixed(1)}"</span>
                </div>
                {takeoffIssue && <div className="text-[10px] font-bold bg-black/20 p-2 rounded text-red-200 border border-red-400/30">{takeoffIssue}</div>}

                {toggles.flightPlan && (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${isLandingSafe ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 animate-pulse'}`}></div>
                                <span className="text-sm font-bold opacity-90">Landing CG</span>
                            </div>
                            {fuel.trip > 0 ? (
                                <span className="font-mono font-bold text-sm">{landingCG.toFixed(1)}"</span>
                            ) : <span className="text-xs opacity-50 italic">--</span>}
                        </div>
                        {landingIssue && <div className="text-[10px] font-bold bg-black/20 p-2 rounded text-red-200 border border-red-400/30">{landingIssue}</div>}
                    </>
                )}
            </div>
          </div>

          {/* GRAPH CARD */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px] flex flex-col">
            <div className="flex items-center justify-between px-2 pt-2 mb-2">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">CG Envelope</h3>
              {plane.utilityEnvelope && (
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                  <button onClick={() => setCategory('normal')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${category === 'normal' ? 'bg-white dark:bg-gray-700 shadow text-blue-800 dark:text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>Normal</button>
                  <button onClick={() => setCategory('utility')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${category === 'utility' ? 'bg-white dark:bg-gray-700 shadow text-blue-800 dark:text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>Utility</button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 relative">
              <WBGraph envelope={activeEnvelope} takeoffWeight={takeoffWeight} takeoffCG={takeoffCG} landingWeight={landingWeight} landingCG={landingCG} isDark={isDark} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}