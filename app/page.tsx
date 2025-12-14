"use client";

import { useState, useEffect, useRef } from "react";
import { aircraftList, Aircraft } from "../data/aircraft";
import ManifestReport from "../components/ManifestReport";
import HangarList from "../components/HangarList";
import SettingsModal from "../components/SettingsModal";
import CalculatorView from "../components/CalculatorView";
import AircraftForm from "../components/AircraftForm"; 
import { isPointInPolygon, getCGLimitsAtWeight } from "../utils/calculations"; // Ensure this is imported

// --- TYPES ---
export interface CustomStation {
  id: string;
  name: string;
  weight: number;
  arm: number;
}

export interface SavedAircraft extends Aircraft {
  registration: string;
  isCustomPlane: true;
  savedArmOverrides?: Record<string, number>;
}

export default function Home() {
  // --- STATE ---
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'calculator'>('list');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Data
  const [savedPlanes, setSavedPlanes] = useState<SavedAircraft[]>([]);
  const [selectedPlane, setSelectedPlane] = useState<Aircraft | SavedAircraft | null>(null);
  const [planeToEdit, setPlaneToEdit] = useState<Aircraft | SavedAircraft | null>(null); 

  // Calculator State
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<'normal' | 'utility'>('normal');
  const [fuel, setFuel] = useState({ taxi: 1.5, trip: 0, burn: 0 });
  const [toggles, setToggles] = useState({ moments: false, info: false, flightPlan: false });
  const [armOverrides, setArmOverrides] = useState<Record<string, number>>({});
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);
  const [useGallons, setUseGallons] = useState(true); // <--- LIFTED STATE

  // Config State
  const [customEmptyWeight, setCustomEmptyWeight] = useState(0);
  const [customEmptyArm, setCustomEmptyArm] = useState(0);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadedFleet = localStorage.getItem("wb_saved_fleet");
    if (loadedFleet) {
      try { setSavedPlanes(JSON.parse(loadedFleet)); } catch (e) { console.error(e); }
    }
    const savedTheme = localStorage.getItem("wb_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wb_theme", "light");
    }
  };

  // --- EXPORT / IMPORT HANDLERS ---
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlanes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wb_fleet_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setSavedPlanes(json);
          localStorage.setItem("wb_saved_fleet", JSON.stringify(json));
          alert("Fleet imported successfully!");
          setShowSettings(false);
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };

  // --- NAVIGATION HANDLERS ---
  const handleSelectPlane = (plane: Aircraft | SavedAircraft) => {
    setSelectedPlane(plane);
    setCategory('normal');
    setWeights({});
    
    if ('savedArmOverrides' in plane && plane.savedArmOverrides) {
      setArmOverrides(plane.savedArmOverrides);
    } else {
      setArmOverrides({});
    }

    setCustomStations([]);
    setFuel({ taxi: 1.5, trip: 0, burn: 0 });
    setCustomEmptyWeight(plane.emptyWeight);
    setCustomEmptyArm(plane.emptyArm);
    setView('calculator');
  };

  const handleSavePlane = (newPlane: SavedAircraft) => {
    let updatedFleet;
    const existingIndex = savedPlanes.findIndex(p => p.id === newPlane.id);
    
    if (existingIndex >= 0) {
        updatedFleet = [...savedPlanes];
        updatedFleet[existingIndex] = newPlane;
    } else {
        updatedFleet = [...savedPlanes, newPlane];
    }
    
    setSavedPlanes(updatedFleet);
    localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
    
    if (view === 'create') {
        handleSelectPlane(newPlane);
    } else {
        setView('list');
    }
    setPlaneToEdit(null);
  };

  const handleDeletePlane = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this aircraft?")) {
      const updatedFleet = savedPlanes.filter(p => p.id !== id);
      setSavedPlanes(updatedFleet);
      localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
    }
  };

  // Auto-Save Overrides
  useEffect(() => {
    if (view === 'calculator' && selectedPlane && 'isCustomPlane' in selectedPlane) {
      const updatedFleet = savedPlanes.map(p => {
        if (p.id === selectedPlane.id) {
          return { 
            ...p, 
            emptyWeight: customEmptyWeight, 
            emptyArm: customEmptyArm,
            savedArmOverrides: armOverrides
          };
        }
        return p;
      });
      if (JSON.stringify(updatedFleet) !== localStorage.getItem("wb_saved_fleet")) {
         localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
      }
    }
  }, [customEmptyWeight, customEmptyArm, armOverrides, selectedPlane, savedPlanes, view]);

  // --- CORE CALCULATION LOGIC (HOISTED UP) ---
  let results = {
    rampWeight: 0, takeoffWeight: 0, takeoffMoment: 0, takeoffCG: 0,
    landingWeight: 0, landingCG: 0,
    isTakeoffSafe: true, isLandingSafe: true,
    takeoffIssue: null as string | null, landingIssue: null as string | null,
    isGo: true, enduranceHours: 0, enduranceMinutes: 0,
    activeEnvelope: [] as any[], maxGross: 0,
    fuelArm: 0
  };

  if (selectedPlane) {
    let rampWeight = customEmptyWeight;
    let rampMoment = customEmptyWeight * customEmptyArm;
    let fuelArm = 0;
    let totalFuelWeight = 0;

    selectedPlane.stations.forEach((station: any) => {
      let w = weights[station.id] || 0;
      const isFuel = station.id.toLowerCase().includes("fuel");
      if (isFuel) {
        if (useGallons) w = w * 6;
        totalFuelWeight = w;
        fuelArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
      }
      const arm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
      rampWeight += w;
      rampMoment += w * arm;
    });

    customStations.forEach((s) => {
      rampWeight += s.weight;
      rampMoment += s.weight * s.arm;
    });

    const taxiWeight = fuel.taxi * 6;
    const takeoffWeight = rampWeight - taxiWeight;
    const takeoffMoment = rampMoment - (taxiWeight * fuelArm);
    const takeoffCG = takeoffMoment / (takeoffWeight || 1);

    let landingWeight = takeoffWeight;
    let landingCG = takeoffCG;

    if (fuel.trip > 0) {
      const tripWeight = fuel.trip * 6;
      landingWeight = takeoffWeight - tripWeight;
      const landingMoment = takeoffMoment - (tripWeight * fuelArm);
      landingCG = landingMoment / (landingWeight || 1);
    }

    const usableTakeoffFuelGal = (totalFuelWeight - taxiWeight) / 6;
    let enduranceHours = 0;
    let enduranceMinutes = 0;
    if (fuel.burn > 0 && usableTakeoffFuelGal > 0) {
        const totalHours = usableTakeoffFuelGal / fuel.burn;
        enduranceHours = Math.floor(totalHours);
        enduranceMinutes = Math.floor((totalHours - enduranceHours) * 60);
    }

    const activeEnvelope = (category === 'utility' && selectedPlane.utilityEnvelope) ? selectedPlane.utilityEnvelope : selectedPlane.envelope;
    const maxGross = Math.max(...activeEnvelope.map((p: any) => p.weight));
    const isTakeoffInside = isPointInPolygon({ cg: takeoffCG, weight: takeoffWeight }, activeEnvelope);
    const isLandingInside = isPointInPolygon({ cg: landingCG, weight: landingWeight }, activeEnvelope);
    
    const takeoffLimits = getCGLimitsAtWeight(takeoffWeight, activeEnvelope);
    const landingLimits = getCGLimitsAtWeight(landingWeight, activeEnvelope);

    const getFailureReason = (weight: number, cg: number, limits: {minCG: number, maxCG: number} | null) => {
      if (weight > maxGross) return `Over Max Gross (${(weight - maxGross).toFixed(0)} lbs)`;
      if (!limits) return "Outside Envelope";
      if (cg < limits.minCG) return `Fwd Limit Exceeded by ${(limits.minCG - cg).toFixed(1)}"`;
      if (cg > limits.maxCG) return `Aft Limit Exceeded by ${(cg - limits.maxCG).toFixed(1)}"`;
      return "Outside Envelope";
    };

    results = {
      rampWeight, takeoffWeight, takeoffMoment, takeoffCG,
      landingWeight, landingCG,
      isTakeoffSafe: isTakeoffInside, isLandingSafe: isLandingInside,
      takeoffIssue: !isTakeoffInside ? getFailureReason(takeoffWeight, takeoffCG, takeoffLimits) : null,
      landingIssue: !isLandingInside ? getFailureReason(landingWeight, landingCG, landingLimits) : null,
      isGo: isTakeoffInside && (toggles.flightPlan ? isLandingInside : true),
      enduranceHours, enduranceMinutes,
      activeEnvelope, maxGross, fuelArm
    };
  }

  // --- RENDER ---
  return (
    <>
      <main className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 print:hidden`}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">W&B Calculator</h1>
            <div className="flex items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                {isDarkMode ? "🌙" : "☀️"}
              </button>
              {view === 'list' && (
                <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                  ⚙️
                </button>
              )}
            </div>
          </div>

          {view === 'list' && (
            <HangarList 
              savedPlanes={savedPlanes} 
              templates={aircraftList} 
              
              // 1. Click Card Body -> Open Calculator (Quick Mode)
              onSelect={handleSelectPlane}
              
              // 2. Click "+" Icon -> Open Create Form for that specific plane
              onAddToFleet={(template) => {
                  setPlaneToEdit(template);
                  setView('create');
              }}
              
              // 3. Click top "+ Add Aircraft" -> Defaults to first plane (C172S) and opens form
              onAdd={() => {
                  setPlaneToEdit(aircraftList[0]);
                  setView('create');
              }}
              
              onEdit={(e, plane) => { 
                  e.stopPropagation(); 
                  setPlaneToEdit(plane); 
                  setView('edit'); 
              }}
              
              onDelete={handleDeletePlane}
            />
          )}

          {(view === 'create' || view === 'edit') && planeToEdit && (
             <AircraftForm 
                template={planeToEdit}
                isEditMode={view === 'edit'}
                onSave={handleSavePlane}
                onCancel={() => {
                    setView('list');
                    setPlaneToEdit(null);
                }}
             />
          )}

          {view === 'calculator' && selectedPlane && (
            <CalculatorView 
                plane={selectedPlane}
                weights={weights}
                armOverrides={armOverrides}
                customStations={customStations}
                fuel={fuel}
                toggles={toggles}
                category={category}
                isDark={isDarkMode}
                useGallons={useGallons} // <--- PASSED PROP
                results={results} // <--- PASSED CALCULATED RESULTS
                
                customEmptyWeight={customEmptyWeight}
                customEmptyArm={customEmptyArm}
                setCustomEmptyWeight={setCustomEmptyWeight}
                setCustomEmptyArm={setCustomEmptyArm}
                
                setWeights={setWeights}
                setArmOverrides={setArmOverrides}
                setCategory={setCategory}
                setFuel={setFuel}
                setToggles={setToggles}
                setUseGallons={setUseGallons} // <--- PASSED SETTER
                onUpdateCustom={(id, f, v) => setCustomStations(customStations.map(s => s.id === id ? { ...s, [f]: v } : s))}
                onDeleteCustom={(id) => setCustomStations(customStations.filter(s => s.id !== id))}
                onAddCustom={() => setCustomStations([...customStations, { id: `c-${Date.now()}`, name: "Item", weight: 0, arm: 0 }])}
                onBack={() => setView('list')}
            />
          )}
        </div>
      </main>

      {/* REPORT (NOW RECEIVES CORRECT NUMBERS) */}
      {selectedPlane && (
        <div className="hidden print:block">
            <ManifestReport 
                plane={selectedPlane}
                date={new Date().toLocaleDateString()}
                pilotName={'registration' in selectedPlane ? selectedPlane.registration : undefined}
                emptyWeight={customEmptyWeight}
                emptyArm={customEmptyArm}
                fuelArm={results.fuelArm}
                stations={selectedPlane.stations.map(s => ({
                    id: s.id, name: s.name, weight: weights[s.id]||0, arm: armOverrides[s.id]??s.arm, moment: (weights[s.id]||0)*(armOverrides[s.id]??s.arm)
                }))}
                taxiFuelWeight={fuel.taxi*6}
                tripFuelWeight={fuel.trip*6}
                rampWeight={results.rampWeight} 
                rampMoment={0} // We calculated total moment for graph, but report might re-calc per station. Passing rampWeight is key.
                takeoffWeight={results.takeoffWeight}
                takeoffMoment={results.takeoffMoment}
                landingWeight={results.landingWeight}
                landingMoment={results.landingWeight * results.landingCG}
                takeoffCG={results.takeoffCG} 
                landingCG={results.landingCG} 
                isTakeoffSafe={results.isTakeoffSafe} 
                isLandingSafe={results.isLandingSafe}
            />
        </div>
      )}

      {showSettings && (
        <SettingsModal 
            onClose={() => setShowSettings(false)} 
            onImport={handleFileChange} 
            onExport={handleExportData} 
        />
      )}
    </>
  );
}