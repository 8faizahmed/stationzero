"use client";

import StationRow from "./StationRow";
import WBGraph from "./WBGraph";

interface CalculatorProps {
  plane: any;
  // DATA PROPS (Received from parent)
  weights: any;
  armOverrides: any;
  customStations: any[];
  fuel: { taxi: number; trip: number; burn: number };
  toggles: { moments: boolean; info: boolean; flightPlan: boolean };
  category: 'normal' | 'utility';
  isDark: boolean;
  useGallons: boolean; // <--- NEW PROP
  
  // CALCULATED RESULTS (Received from parent)
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

  // CONFIG PROPS
  customEmptyWeight: number;
  customEmptyArm: number;
  setCustomEmptyWeight: (val: number) => void;
  setCustomEmptyArm: (val: number) => void;

  // ACTIONS
  setWeights: (w: any) => void;
  setArmOverrides: (a: any) => void;
  setCategory: (c: 'normal' | 'utility') => void;
  setFuel: (f: any) => void;
  setToggles: (t: any) => void;
  setUseGallons: (val: boolean) => void; // <--- NEW PROP
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

  // Destructure results for easier reading
  const { 
    takeoffWeight, takeoffCG, landingWeight, landingCG, 
    isTakeoffSafe, isLandingSafe, takeoffIssue, landingIssue, isGo,
    enduranceHours, enduranceMinutes, activeEnvelope, maxGross 
  } = results;

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <button onClick={onBack} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 mb-2">← Back to hangar</button>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plane.model}</h2>
             {plane.registration && <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-mono font-bold px-2 py-1 rounded">{plane.registration}</span>}
           </div>
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg> Print Report
           </button>
        </div>
      </div>

      {/* TOGGLES */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap items-center gap-3">
           <button onClick={() => setToggles({...toggles, moments: !toggles.moments})} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${toggles.moments ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
              <span>Show Moments</span><div className={`w-2 h-2 rounded-full ${toggles.moments ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}></div>
            </button>
            <button onClick={() => setToggles({...toggles, info: !toggles.info})} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${toggles.info ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
              <span>Std Weights</span><div className={`w-2 h-2 rounded-full ${toggles.info ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}></div>
            </button>
            <button onClick={() => setToggles({...toggles, flightPlan: !toggles.flightPlan})} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${toggles.flightPlan ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
              <span>Flight Plan</span><div className={`w-2 h-2 rounded-full ${toggles.flightPlan ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}></div>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="md:col-span-5 space-y-4">
          
          {/* STD WEIGHTS CARD */}
          {toggles.info && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-blue-900 dark:text-blue-300">Standard Pax Weights</h3>
                <button onClick={() => setToggles({...toggles, info: false})} className="text-blue-400 hover:text-blue-700">×</button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="font-semibold text-gray-500 dark:text-gray-400">Pax</div><div className="font-semibold text-gray-500 dark:text-gray-400">Summer</div><div className="font-semibold text-gray-500 dark:text-gray-400">Winter</div>
                <div className="text-left text-gray-700 dark:text-gray-300">Male</div><div className="bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900 dark:text-gray-300">200</div><div className="bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900 dark:text-gray-300">206</div>
                <div className="text-left text-gray-700 dark:text-gray-300">Female</div><div className="bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900 dark:text-gray-300">165</div><div className="bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900 dark:text-gray-300">171</div>
              </div>
            </div>
          )}

          {/* CONFIG CARD */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {'isCustomPlane' in plane ? `Config for ${plane.registration}` : 'Generic Config'}
               </h3>
               {'isCustomPlane' in plane && (
                 <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">Auto-Saving</span>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Basic Empty Weight</label>
                <input 
                  type="number" 
                  value={customEmptyWeight || ""}
                  onChange={(e) => setCustomEmptyWeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Empty CG (Arm)</label>
                <input 
                  type="number" 
                  value={customEmptyArm || ""}
                  onChange={(e) => setCustomEmptyArm(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STATION ROWS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {plane.stations.map((station: any) => {
                const isFuel = station.id.toLowerCase().includes("fuel");
                return (
                  <div key={station.id}>
                    <StationRow 
                      id={station.id} name={station.name} weight={weights[station.id] || 0}
                      arm={armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm}
                      isFuel={isFuel} 
                      useGallons={useGallons} 
                      showMoments={toggles.moments}
                      onWeightChange={(val) => setWeights({...weights, [station.id]: parseFloat(val) || 0})}
                      onArmChange={(val) => { const v = parseFloat(val); if(!isNaN(v)) setArmOverrides({...armOverrides, [station.id]: v}); }}
                      onToggleUnit={() => setUseGallons(!useGallons)} 
                    />
                    {isFuel && toggles.flightPlan && (
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 border-t border-b border-blue-100 dark:border-blue-900 px-4 py-3 grid grid-cols-2 gap-4 animate-fade-in">
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Taxi Fuel</label>
                              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 rounded-lg px-2">
                                <input type="number" value={fuel.taxi} onChange={(e) => setFuel({...fuel, taxi: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none" />
                                <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Cruise Burn</label>
                              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 rounded-lg px-2">
                                <input type="number" value={fuel.burn || ""} onChange={(e) => setFuel({...fuel, burn: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none" placeholder="0" />
                                <span className="text-[10px] text-gray-400 font-medium">GPH</span>
                              </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">Flight Burn</label>
                              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 rounded-lg px-2">
                                <input type="number" value={fuel.trip || ""} onChange={(e) => setFuel({...fuel, trip: parseFloat(e.target.value)||0})} className="w-full py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none" placeholder="0" />
                                <span className="text-[10px] text-gray-400 font-medium">GAL</span>
                              </div>
                            </div>
                            <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-2 text-white text-center flex flex-col justify-center h-[54px]">
                                <span className="text-[10px] uppercase font-bold opacity-80">Endurance</span>
                                {fuel.burn > 0 && results.activeEnvelope ? (
                                    <span className="text-xl font-bold leading-none">{enduranceHours}h <span className="text-sm font-normal opacity-80">{enduranceMinutes}m</span></span>
                                ) : <span className="text-sm opacity-60">-- h -- m</span>}
                            </div>
                        </div>
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
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              <button onClick={onAddCustom} className="w-full py-2 text-xs font-bold text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all">+ Add Custom Item</button>
            </div>
          </div>
        </div>

        {/* GRAPH & STATUS */}
        <div className="md:col-span-7 flex flex-col gap-4 sticky top-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Envelope Graph</h3>
              {plane.utilityEnvelope && (
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                  <button onClick={() => setCategory('normal')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${category === 'normal' ? 'bg-white dark:bg-gray-700 shadow text-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>Normal</button>
                  <button onClick={() => setCategory('utility')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${category === 'utility' ? 'bg-white dark:bg-gray-700 shadow text-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>Utility</button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <WBGraph envelope={activeEnvelope} takeoffWeight={takeoffWeight} takeoffCG={takeoffCG} landingWeight={landingWeight} landingCG={landingCG} isDark={isDark} />
            </div>
          </div>

          {/* STATUS BOARD */}
          <div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${isGo ? 'bg-gray-900 dark:bg-gray-800 text-white' : 'bg-red-600 text-white'}`}>
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">Flight Status</h3>
                <div className="text-3xl font-black tracking-tight">{isGo ? "GO" : "NO-GO"}</div>
              </div>
              <div className="text-right">
                 <div className="text-xs font-bold uppercase tracking-widest opacity-70">Category</div>
                 <div className="text-xl font-bold">{category === 'normal' ? 'Normal' : 'Utility'}</div>
              </div>
            </div>
            <div className={`grid ${toggles.flightPlan ? 'grid-cols-2' : 'grid-cols-1'} gap-x-8 gap-y-6`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${isTakeoffSafe ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
                  <span className="text-xs font-bold uppercase opacity-80">Takeoff</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="opacity-70">Weight</span><span className="font-mono font-bold">{takeoffWeight.toFixed(0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="opacity-70">CG</span><span className="font-mono font-bold">{takeoffCG.toFixed(1)}"</span></div>
                </div>
                {takeoffIssue && <div className="mt-2 text-[10px] font-bold bg-black/20 p-2 rounded text-red-200 border border-red-400/30">{takeoffIssue}</div>}
              </div>
              {toggles.flightPlan && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${isLandingSafe ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
                    <span className="text-xs font-bold uppercase opacity-80">Landing</span>
                  </div>
                  {fuel.trip > 0 ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm"><span className="opacity-70">Weight</span><span className="font-mono font-bold">{landingWeight.toFixed(0)}</span></div>
                        <div className="flex justify-between text-sm"><span className="opacity-70">CG</span><span className="font-mono font-bold">{landingCG.toFixed(1)}"</span></div>
                      </div>
                      {landingIssue && <div className="mt-2 text-[10px] font-bold bg-black/20 p-2 rounded text-red-200 border border-red-400/30">{landingIssue}</div>}
                    </>
                  ) : <div className="text-xs opacity-50 italic mt-2">Enter flight fuel to see landing stats.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}