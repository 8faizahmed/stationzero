"use client";

import { useState, useEffect, useRef } from "react";
import { aircraftList, Aircraft } from "../data/aircraft";
import WBGraph from "../components/WBGraph";
import StationRow from "../components/StationRow";
import ManifestReport from "../components/ManifestReport";

// --- TYPES ---
interface CustomStation {
  id: string;
  name: string;
  weight: number;
  arm: number;
}

interface SavedAircraft extends Aircraft {
  registration: string; // e.g., "C-GABC"
  isCustomPlane: true;
  savedArmOverrides?: Record<string, number>;
}

export default function Home() {
  // --- STATE ---
  
  // Navigation State
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'calculator'>('list');
  const [showSettings, setShowSettings] = useState(false); // NEW: Settings Modal
  
  // Data State
  const [savedPlanes, setSavedPlanes] = useState<SavedAircraft[]>([]);
  const [selectedPlane, setSelectedPlane] = useState<Aircraft | SavedAircraft | null>(null);
  
  // Creation/Edit Form State
  const [newPlaneTemplate, setNewPlaneTemplate] = useState<Aircraft | null>(null);
  const [newPlaneReg, setNewPlaneReg] = useState("");
  const [newPlaneWeight, setNewPlaneWeight] = useState("");
  const [newPlaneArm, setNewPlaneArm] = useState("");
  const [editingPlaneId, setEditingPlaneId] = useState<string | null>(null);
  const [editingStationArms, setEditingStationArms] = useState<Record<string, number>>({});

  // Calculator State
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [useGallons, setUseGallons] = useState(true);
  const [category, setCategory] = useState<'normal' | 'utility'>('normal');

  // Config State
  const [customEmptyWeight, setCustomEmptyWeight] = useState(0);
  const [customEmptyArm, setCustomEmptyArm] = useState(0);
  
  // Toggles
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showFlightPlan, setShowFlightPlan] = useState(false);

  // Flight Planning
  const [taxiFuel, setTaxiFuel] = useState(1.5);
  const [tripFuel, setTripFuel] = useState(0);

  // Overrides
  const [armOverrides, setArmOverrides] = useState<Record<string, number>>({});
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);

  // Refs for Import
  const fileInputRef = useRef<HTMLInputElement>(null);


  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const loadedFleet = localStorage.getItem("wb_saved_fleet");
    if (loadedFleet) {
      try {
        setSavedPlanes(JSON.parse(loadedFleet));
      } catch (e) {
        console.error("Failed to load fleet", e);
      }
    }
  }, []);

  // --- 2. IMPORT / EXPORT HANDLERS ---
  
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlanes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wb_fleet_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Basic validation could go here
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
    // Reset input so same file can be selected again if needed
    e.target.value = ""; 
  };


  // --- 3. PLANE SELECTION ---
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
    setTaxiFuel(1.5);
    setTripFuel(0);
    setCustomEmptyWeight(plane.emptyWeight);
    setCustomEmptyArm(plane.emptyArm);
    setView('calculator');
  };

  // --- 4. CREATE / UPDATE HANDLERS ---
  const handleEditClick = (e: React.MouseEvent, plane: SavedAircraft) => {
    e.stopPropagation();
    setNewPlaneTemplate(plane); 
    setNewPlaneReg(plane.registration);
    setNewPlaneWeight(plane.emptyWeight.toString());
    setNewPlaneArm(plane.emptyArm.toString());
    setEditingPlaneId(plane.id);
    
    const currentArms: Record<string, number> = {};
    plane.stations.forEach(s => {
      currentArms[s.id] = plane.savedArmOverrides?.[s.id] ?? s.arm;
    });
    setEditingStationArms(currentArms);

    setView('edit');
  };

  const handleSavePlane = () => {
    if (!newPlaneTemplate || !newPlaneReg) return;

    const weight = parseFloat(newPlaneWeight) || newPlaneTemplate.emptyWeight;
    const arm = parseFloat(newPlaneArm) || newPlaneTemplate.emptyArm;

    let updatedFleet;

    if (view === 'edit' && editingPlaneId) {
      updatedFleet = savedPlanes.map(p => {
        if (p.id === editingPlaneId) {
          return {
            ...p,
            registration: newPlaneReg.toUpperCase(),
            emptyWeight: weight,
            emptyArm: arm,
            savedArmOverrides: editingStationArms,
          };
        }
        return p;
      });
    } else {
      const newPlane: SavedAircraft = {
        ...newPlaneTemplate,
        id: `${newPlaneTemplate.id}-${Date.now()}`,
        registration: newPlaneReg.toUpperCase(),
        emptyWeight: weight,
        emptyArm: arm,
        isCustomPlane: true,
        model: newPlaneTemplate.model,
        savedArmOverrides: editingStationArms 
      };
      updatedFleet = [...savedPlanes, newPlane];
    }

    setSavedPlanes(updatedFleet);
    localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
    
    setNewPlaneTemplate(null);
    setNewPlaneReg("");
    setNewPlaneWeight("");
    setNewPlaneArm("");
    setEditingStationArms({});
    setEditingPlaneId(null);
    setView('list');
  };

  const handleDeletePlane = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this aircraft from your fleet?")) {
      const updatedFleet = savedPlanes.filter(p => p.id !== id);
      setSavedPlanes(updatedFleet);
      localStorage.setItem("wb_saved_fleet", JSON.stringify(updatedFleet));
    }
  };


  // --- 5. AUTO-SAVE ---
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

  const handleBackToList = () => {
    const loadedFleet = localStorage.getItem("wb_saved_fleet");
    if (loadedFleet) setSavedPlanes(JSON.parse(loadedFleet));
    setSelectedPlane(null);
    setView('list');
  };


  // --- CALCULATOR HELPERS ---
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
    setCustomStations([...customStations, {
      id: `custom-${Date.now()}`,
      name: "New Item",
      weight: 0,
      arm: 0, 
    }]);
  };

  const updateCustomStation = (id: string, field: keyof CustomStation, value: string | number) => {
    setCustomStations(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeCustomStation = (id: string) => {
    setCustomStations(prev => prev.filter(s => s.id !== id));
  };


  // --- MATH ---
  let rampWeight = customEmptyWeight;
  let rampMoment = customEmptyWeight * customEmptyArm;
  let fuelArm = 0;

  const activeEnvelope = (category === 'utility' && selectedPlane?.utilityEnvelope) 
    ? selectedPlane.utilityEnvelope 
    : selectedPlane?.envelope || [];

  if (selectedPlane) {
    selectedPlane.stations.forEach((station) => {
      let weight = weights[station.id] || 0;
      const isFuel = station.id.toLowerCase().includes("fuel");
      if (isFuel) {
        if (useGallons) weight = weight * 6;
        fuelArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
      }
      const effectiveArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
      rampWeight += weight;
      rampMoment += weight * effectiveArm;
    });

    customStations.forEach((station) => {
      rampWeight += station.weight;
      rampMoment += station.weight * station.arm;
    });
  }

  const taxiWeight = taxiFuel * 6;
  const takeoffWeight = rampWeight - taxiWeight;
  const takeoffMoment = rampMoment - (taxiWeight * fuelArm);
  const takeoffCG = takeoffMoment / (takeoffWeight || 1);

  let landingWeight = 0;
  let landingCG = 0;
  
  if (tripFuel > 0) {
    const tripWeight = tripFuel * 6;
    landingWeight = takeoffWeight - tripWeight;
    const landingMoment = takeoffMoment - (tripWeight * fuelArm);
    landingCG = landingMoment / (landingWeight || 1);
  } else {
    landingWeight = takeoffWeight;
    landingCG = takeoffCG;
  }

  const maxGross = Math.max(...activeEnvelope.map(p => p.weight));
  const isTakeoffSafe = takeoffWeight <= maxGross;
  const isLandingSafe = landingWeight <= maxGross;

  // --- RENDER ---
  return (
    <>
      <main className="min-h-screen bg-gray-50 text-gray-900 font-sans print:hidden">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">W&B Calculator</h1>
            
            {/* SETTINGS BUTTON (Only in List View) */}
            {view === 'list' && (
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
                title="Data Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>

          {view === 'list' && (
            <div className="space-y-8">
              {/* SECTION 1: MY HANGAR */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-xl font-bold text-gray-800">My Hangar</h2>
                  <button 
                    onClick={() => {
                        setNewPlaneTemplate(null);
                        setNewPlaneReg("");
                        setNewPlaneWeight("");
                        setNewPlaneArm("");
                        setEditingStationArms({});
                        setView('create');
                    }}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow hover:bg-blue-700 transition"
                  >
                    + Add Aircraft
                  </button>
                </div>
                
                {savedPlanes.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400">
                    <p>No aircraft in your hangar yet.</p>
                    <button onClick={() => setView('create')} className="text-blue-600 underline mt-2 hover:text-blue-800">
                      Add your first plane
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPlanes.map((plane) => (
                      <button
                        key={plane.id}
                        onClick={() => handleSelectPlane(plane)}
                        className="relative p-6 bg-white border border-blue-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
                      >
                        <span className="absolute top-4 right-4 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {plane.registration}
                        </span>
                        <h2 className="font-bold text-lg group-hover:text-blue-600">{plane.model}</h2>
                        <p className="text-gray-400 text-sm mt-1">BEW: {plane.emptyWeight} lbs</p>
                        
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div 
                              onClick={(e) => handleEditClick(e, plane)}
                              className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-full hover:bg-blue-50"
                              title="Edit Aircraft"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                            </div>
                            <div 
                              onClick={(e) => handleDeletePlane(e, plane.id)}
                              className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-full hover:bg-red-50"
                              title="Delete Aircraft"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: TEMPLATES */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Factory Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aircraftList.map((plane) => (
                    <button
                      key={plane.id}
                      onClick={() => handleSelectPlane(plane)}
                      className="p-6 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-400 hover:shadow-sm transition text-left"
                    >
                      <h2 className="font-bold text-base text-gray-700">{plane.model}</h2>
                      <p className="text-gray-400 text-xs">{plane.make}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CREATE OR EDIT VIEW */}
          {(view === 'create' || view === 'edit') && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">
                  {view === 'edit' ? 'Edit Aircraft Details' : 'Add Aircraft to Fleet'}
              </h2>
              
              <div className="space-y-6">
                {view === 'create' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Base Model</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {aircraftList.map((plane) => (
                          <button
                            key={plane.id}
                            onClick={() => {
                              setNewPlaneTemplate(plane);
                              setNewPlaneWeight(plane.emptyWeight.toString());
                              setNewPlaneArm(plane.emptyArm.toString());
                              const defaultArms: Record<string, number> = {};
                              plane.stations.forEach(s => defaultArms[s.id] = s.arm);
                              setEditingStationArms(defaultArms);
                            }}
                            className={`p-3 text-left rounded-lg text-sm border transition ${newPlaneTemplate?.id === plane.id ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-transparent hover:bg-gray-50'}`}
                          >
                            {plane.model}
                          </button>
                        ))}
                      </div>
                    </div>
                )}

                {newPlaneTemplate && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {view === 'create' ? '2. Registration (Tail Number)' : 'Registration'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="C-GABC"
                        className="w-full p-3 border border-gray-300 rounded-lg uppercase font-mono"
                        value={newPlaneReg}
                        onChange={(e) => setNewPlaneReg(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            {view === 'create' ? '3. Empty Weight' : 'Empty Weight'}
                        </label>
                        <input 
                          type="number" 
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={newPlaneWeight}
                          onChange={(e) => setNewPlaneWeight(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            {view === 'create' ? '4. Empty Arm' : 'Empty Arm'}
                        </label>
                        <input 
                          type="number" 
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={newPlaneArm}
                          onChange={(e) => setNewPlaneArm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            {view === 'create' ? '5. Station Arms (Optional)' : 'Station Arms'}
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {newPlaneTemplate.stations.map((station) => (
                                <div key={station.id} className="flex items-center justify-between">
                                    <label className="text-sm text-gray-600 font-medium">{station.name}</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Arm:</span>
                                        <input 
                                            type="number" 
                                            className="w-20 p-1.5 text-right border border-gray-300 rounded bg-white text-sm"
                                            value={editingStationArms[station.id] ?? station.arm}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setEditingStationArms(prev => ({
                                                    ...prev,
                                                    [station.id]: isNaN(val) ? 0 : val
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleSavePlane}
                        disabled={!newPlaneReg}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {view === 'edit' ? 'Save Changes' : 'Save & Open'}
                      </button>
                      <button 
                        onClick={() => {
                           setView('list');
                           setNewPlaneTemplate(null);
                           setEditingPlaneId(null);
                           setEditingStationArms({});
                        }}
                        className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'calculator' && selectedPlane && (
            <div className="flex flex-col gap-6">
              <div>
                <button 
                  onClick={handleBackToList}
                  className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600 mb-2"
                >
                  ← Back to hangar
                </button>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-bold text-gray-900">{selectedPlane.model}</h2>
                     {'registration' in selectedPlane && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-mono font-bold px-2 py-1 rounded">
                          {selectedPlane.registration}
                        </span>
                     )}
                   </div>
                   
                   <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                     </svg>
                     Print Report
                   </button>
                </div>
              </div>

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

                    <button 
                      onClick={() => setShowFlightPlan(!showFlightPlan)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${showFlightPlan ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                    >
                      <span>Flight Plan</span>
                      <div className={`w-2 h-2 rounded-full ${showFlightPlan ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                <div className="md:col-span-5 space-y-4">
                  {showInfoCard && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm animate-fade-in">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-blue-900">Standard Pax Weights</h3>
                        <button onClick={() => setShowInfoCard(false)} className="text-blue-400 hover:text-blue-700">×</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="font-semibold text-gray-500">Pax</div><div className="font-semibold text-gray-500">Summer</div><div className="font-semibold text-gray-500">Winter</div>
                        <div className="text-left">Male</div><div className="bg-white rounded border border-blue-100">200</div><div className="bg-white rounded border border-blue-100">206</div>
                        <div className="text-left">Female</div><div className="bg-white rounded border border-blue-100">165</div><div className="bg-white rounded border border-blue-100">171</div>
                        <div className="text-left">Child</div><div className="bg-white rounded border border-blue-100">75</div><div className="bg-white rounded border border-blue-100">75</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex justify-between items-center mb-3">
                       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {'isCustomPlane' in selectedPlane ? `Config for ${selectedPlane.registration}` : 'Generic Config'}
                       </h3>
                       {'isCustomPlane' in selectedPlane && (
                         <span className="text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Auto-Saving</span>
                       )}
                    </div>
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

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {selectedPlane.stations.map((station) => {
                        const isFuel = station.id.toLowerCase().includes("fuel");
                        const currentArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
                        const weight = weights[station.id] || 0;

                        return (
                          <div key={station.id}>
                            <StationRow 
                              id={station.id}
                              name={station.name}
                              weight={weight}
                              arm={currentArm}
                              isFuel={isFuel}
                              useGallons={useGallons}
                              showMoments={showMoments}
                              onWeightChange={(val) => handleWeightChange(station.id, val)}
                              onArmChange={(val) => handleArmOverride(station.id, val)}
                              onToggleUnit={() => setUseGallons(!useGallons)}
                            />
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

                      {customStations.map((station) => (
                        <StationRow
                          key={station.id}
                          id={station.id}
                          name={station.name}
                          weight={station.weight}
                          arm={station.arm}
                          isCustom={true}
                          useGallons={false}
                          showMoments={showMoments}
                          onWeightChange={(val) => updateCustomStation(station.id, 'weight', parseFloat(val) || 0)}
                          onArmChange={(val) => updateCustomStation(station.id, 'arm', parseFloat(val) || 0)}
                          onNameChange={(val) => updateCustomStation(station.id, 'name', val)}
                          onDelete={() => removeCustomStation(station.id)}
                        />
                      ))}
                    </div>
                    
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

                <div className="md:col-span-7 flex flex-col gap-4 sticky top-8">
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

                  <div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
                      takeoffWeight > maxGross 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-900 text-white'
                    }`}>
                    <div className="grid grid-cols-2 gap-8 relative">
                      <div>
                        <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">Takeoff Weight</span>
                        <span className="text-3xl font-bold">{takeoffWeight.toFixed(1)} <span className="text-base font-normal opacity-70">lbs</span></span>
                      </div>
                      <div>
                        <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">Takeoff CG</span>
                        <span className="text-3xl font-bold">{takeoffCG.toFixed(2)} <span className="text-base font-normal opacity-70">in</span></span>
                      </div>

                      {showFlightPlan && tripFuel > 0 && (
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 2. REPORT VIEW */}
      {selectedPlane && view === 'calculator' && (
        <ManifestReport 
          plane={selectedPlane}
          date={new Date().toLocaleDateString()}
          pilotName={'registration' in selectedPlane ? selectedPlane.registration : undefined}
          emptyWeight={customEmptyWeight}
          emptyArm={customEmptyArm}
          fuelArm={fuelArm}
          stations={[
            ...selectedPlane.stations.map(station => {
              const weight = weights[station.id] || 0;
              const isFuel = station.id.toLowerCase().includes("fuel");
              const effectiveWeight = (isFuel && useGallons) ? weight * 6 : weight;
              const effectiveArm = armOverrides[station.id] !== undefined ? armOverrides[station.id] : station.arm;
              
              return {
                id: station.id,
                name: station.name,
                weight: effectiveWeight,
                arm: effectiveArm,
                moment: effectiveWeight * effectiveArm
              };
            }),
            ...customStations.map(station => ({
              id: station.id,
              name: station.name,
              weight: station.weight,
              arm: station.arm,
              moment: station.weight * station.arm
            }))
          ]}
          taxiFuelWeight={taxiWeight}
          tripFuelWeight={showFlightPlan ? (tripFuel * 6) : 0}
          rampWeight={rampWeight}
          rampMoment={rampMoment}
          takeoffWeight={takeoffWeight}
          takeoffMoment={takeoffMoment}
          landingWeight={landingWeight}
          landingMoment={landingWeight * landingCG} 
          takeoffCG={takeoffCG}
          landingCG={landingCG}
          isTakeoffSafe={isTakeoffSafe}
          isLandingSafe={isLandingSafe}
        />
      )}

      {/* 3. SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-2">Data Management</h2>
            <p className="text-sm text-gray-500 mb-6">
              Back up your fleet data to a file or restore from a previous backup.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-lg font-bold border border-blue-200 hover:bg-blue-100 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export Fleet Data (JSON)
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button 
                  onClick={handleImportClick}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Import Fleet Data
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}