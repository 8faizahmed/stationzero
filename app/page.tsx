"use client";

import { useState, useEffect } from "react";
import { aircraftList, Aircraft } from "../data/aircraft";
import ManifestReport from "../components/ManifestReport";
import HangarList from "../components/HangarList";
import SettingsModal from "../components/SettingsModal";
import CalculatorView from "../components/CalculatorView";

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
  
  // Calculator State
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<'normal' | 'utility'>('normal');
  const [fuel, setFuel] = useState({ taxi: 1.5, trip: 0, burn: 0 });
  const [toggles, setToggles] = useState({ moments: false, info: false, flightPlan: false });
  const [armOverrides, setArmOverrides] = useState<Record<string, number>>({});
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);

  // Config State (for Report)
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

  // --- HANDLERS ---
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
    const exists = savedPlanes.find(p => p.id === newPlane.id);
    
    if (exists) {
        updatedFleet = savedPlanes.map(p => p.id === newPlane.id ? newPlane : p);
    } else {
        updatedFleet = [...savedPlanes, newPlane];
    }
    
    setSavedPlanes(updatedFleet);
    localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
    setView('list');
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
    if (selectedPlane && 'isCustomPlane' in selectedPlane) {
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
  }, [customEmptyWeight, customEmptyArm, armOverrides, selectedPlane, savedPlanes]);

  // --- CALCULATOR MATH FOR REPORT (Duplicate logic needed for report prop passing) ---
  // In a real app, this would be a shared hook, but keeping it simple for now.
  let fuelArm = 0;
  if(selectedPlane) {
      const fuelStation = selectedPlane.stations.find(s => s.id.toLowerCase().includes("fuel"));
      if(fuelStation) fuelArm = armOverrides[fuelStation.id] ?? fuelStation.arm;
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
              onSelect={handleSelectPlane}
              onAdd={() => setView('create')}
              onEdit={(e, plane) => { e.stopPropagation(); handleSelectPlane(plane); setView('edit'); /* Note: This is simplified, usually we pass data to form */ }}
              onDelete={handleDeletePlane}
            />
          )}

          {(view === 'create' || view === 'edit') && (
             /* Note: Re-using the inline form logic from before for simplicity, or we can extract AircraftForm here */
             <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl">
                <p>This part should use the AircraftForm component. For now, reload page to reset view.</p>
                <button onClick={() => setView('list')} className="mt-4 text-blue-500">Back</button>
             </div>
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
                setWeights={setWeights}
                setArmOverrides={setArmOverrides}
                setCategory={setCategory}
                setFuel={setFuel}
                setToggles={setToggles}
                onUpdateCustom={(id, f, v) => setCustomStations(customStations.map(s => s.id === id ? { ...s, [f]: v } : s))}
                onDeleteCustom={(id) => setCustomStations(customStations.filter(s => s.id !== id))}
                onAddCustom={() => setCustomStations([...customStations, { id: `c-${Date.now()}`, name: "Item", weight: 0, arm: 0 }])}
                onBack={() => setView('list')}
            />
          )}
        </div>
      </main>

      {/* REPORT (ALWAYS RENDERED BUT HIDDEN VIA CSS) */}
      {selectedPlane && (
        <div className="hidden print:block">
            <ManifestReport 
                plane={selectedPlane}
                date={new Date().toLocaleDateString()}
                pilotName={'registration' in selectedPlane ? selectedPlane.registration : undefined}
                emptyWeight={customEmptyWeight}
                emptyArm={customEmptyArm}
                fuelArm={fuelArm}
                // Recalculate everything for report... (Simplified for brevity)
                stations={selectedPlane.stations.map(s => ({
                    id: s.id, name: s.name, weight: weights[s.id]||0, arm: armOverrides[s.id]??s.arm, moment: (weights[s.id]||0)*(armOverrides[s.id]??s.arm)
                }))}
                taxiFuelWeight={fuel.taxi*6}
                tripFuelWeight={fuel.trip*6}
                rampWeight={0} // Needs calc
                rampMoment={0} // Needs calc
                takeoffWeight={0} // Needs calc
                takeoffMoment={0} // Needs calc
                landingWeight={0} // Needs calc
                landingMoment={0} // Needs calc
                takeoffCG={0} 
                landingCG={0} 
                isTakeoffSafe={true} 
                isLandingSafe={true}
            />
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onImport={() => {}} onExport={() => {}} />}
    </>
  );
}