"use client";

import { useState, useEffect } from "react";
import { aircraftList, Aircraft } from "../data/aircraft";
import WBGraph from "../components/WBGraph";
import StationRow from "../components/StationRow";
import ManifestReport from "../components/ManifestReport"; // NEW IMPORT

interface CustomStation {
  id: string;
  name: string;
  weight: number;
  arm: number;
}

export default function Home() {
  const [selectedPlane, setSelectedPlane] = useState<Aircraft | null>(null);

  // Weight & Config State
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [useGallons, setUseGallons] = useState(true);
  const [category, setCategory] = useState<"normal" | "utility">("normal");

  // Aircraft Specific Configuration (Saved to LocalStorage)
  const [customEmptyWeight, setCustomEmptyWeight] = useState(0);
  const [customEmptyArm, setCustomEmptyArm] = useState(0);

  // View Toggles
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showFlightPlan, setShowFlightPlan] = useState(false);

  // Flight Planning Data
  const [taxiFuel, setTaxiFuel] = useState(1.5);
  const [tripFuel, setTripFuel] = useState(0);

  // Overrides & Custom Data
  const [armOverrides, setArmOverrides] = useState<Record<string, number>>({});
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);

  // --- 1. LOAD CONFIG (My Hangar) ---
  useEffect(() => {
    if (selectedPlane) {
      setCategory("normal");
      setWeights({});
      setArmOverrides({});
      setCustomStations([]);
      setTaxiFuel(1.5);
      setTripFuel(0);

      const savedConfig = localStorage.getItem(`wb_config_${selectedPlane.id}`);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setCustomEmptyWeight(parsed.weight || selectedPlane.emptyWeight);
        setCustomEmptyArm(parsed.arm || selectedPlane.emptyArm);
      } else {
        setCustomEmptyWeight(selectedPlane.emptyWeight);
        setCustomEmptyArm(selectedPlane.emptyArm);
      }
    }
  }, [selectedPlane]);

  // --- 2. SAVE CONFIG (Auto-Save) ---
  useEffect(() => {
    if (selectedPlane) {
      const config = { weight: customEmptyWeight, arm: customEmptyArm };
      localStorage.setItem(
        `wb_config_${selectedPlane.id}`,
        JSON.stringify(config)
      );
    }
  }, [customEmptyWeight, customEmptyArm, selectedPlane]);

  // --- HANDLERS ---
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

  const updateCustomStation = (
    id: string,
    field: keyof CustomStation,
    value: string | number
  ) => {
    setCustomStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeCustomStation = (id: string) => {
    setCustomStations((prev) => prev.filter((s) => s.id !== id));
  };

  // --- CALCULATION LOGIC ---
  let rampWeight = customEmptyWeight;
  let rampMoment = customEmptyWeight * customEmptyArm;
  let fuelArm = 0;

  const activeEnvelope =
    category === "utility" && selectedPlane?.utilityEnvelope
      ? selectedPlane.utilityEnvelope
      : selectedPlane?.envelope || [];

  if (selectedPlane) {
    selectedPlane.stations.forEach((station) => {
      let weight = weights[station.id] || 0;
      const isFuel = station.id.toLowerCase().includes("fuel");

      if (isFuel) {
        if (useGallons) weight = weight * 6;
        fuelArm =
          armOverrides[station.id] !== undefined
            ? armOverrides[station.id]
            : station.arm;
      }

      const effectiveArm =
        armOverrides[station.id] !== undefined
          ? armOverrides[station.id]
          : station.arm;

      rampWeight += weight;
      rampMoment += weight * effectiveArm;
    });

    customStations.forEach((station) => {
      rampWeight += station.weight;
      rampMoment += station.weight * station.arm;
    });
  }

  // Flight Phases
  const taxiWeight = taxiFuel * 6;
  const takeoffWeight = rampWeight - taxiWeight;
  const takeoffMoment = rampMoment - taxiWeight * fuelArm;
  const takeoffCG = takeoffMoment / (takeoffWeight || 1);

  let landingWeight = 0;
  let landingCG = 0;

  if (tripFuel > 0) {
    const tripWeight = tripFuel * 6;
    landingWeight = takeoffWeight - tripWeight;
    const landingMoment = takeoffMoment - tripWeight * fuelArm;
    landingCG = landingMoment / (landingWeight || 1);
  } else {
    // If no trip fuel entered, assume landing = takeoff for report safety check
    landingWeight = takeoffWeight;
    landingCG = takeoffCG;
  }

  // --- SAFETY CHECK LOGIC (Simplified Polygon Check) ---
  // Note: A true point-in-polygon algorithm is better, but for now we check max weight bounds
  const maxGross = Math.max(...activeEnvelope.map((p) => p.weight));
  const isTakeoffSafe = takeoffWeight <= maxGross; // Simple weight check for V1
  const isLandingSafe = landingWeight <= maxGross;

  return (
    <>
      {/* 1. APP VIEW (Hidden when printing) */}
      <main className="min-h-screen bg-gray-50 text-gray-900 font-sans print:hidden">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">W&B Calculator</h1>
          </div>

          {!selectedPlane ? (
            // AIRCRAFT LIST
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aircraftList.map((plane) => (
                <button
                  key={plane.id}
                  onClick={() => setSelectedPlane(plane)}
                  className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
                >
                  <h2 className="font-bold text-lg group-hover:text-blue-600">
                    {plane.model}
                  </h2>
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
            // CALCULATOR VIEW
            <div className="flex flex-col gap-6">
              {/* Top Nav */}
              <div>
                <button
                  onClick={() => setSelectedPlane(null)}
                  className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600 mb-2"
                >
                  ← Back to aircraft list
                </button>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedPlane.model}
                  </h2>
                  {/* PRINT BUTTON */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                      />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>

              {/* Control Deck */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowMoments(!showMoments)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      showMoments
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <span>Show Moments</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        showMoments ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                  </button>

                  <button
                    onClick={() => setShowInfoCard(!showInfoCard)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      showInfoCard
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <span>Std Weights</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        showInfoCard ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                  </button>

                  <button
                    onClick={() => setShowFlightPlan(!showFlightPlan)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      showFlightPlan
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <span>Flight Plan</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        showFlightPlan ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                {/* Left Column */}
                <div className="md:col-span-5 space-y-4">
                  {showInfoCard && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm animate-fade-in">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-blue-900">
                          Standard Pax Weights
                        </h3>
                        <button
                          onClick={() => setShowInfoCard(false)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="font-semibold text-gray-500">Pax</div>
                        <div className="font-semibold text-gray-500">
                          Summer
                        </div>
                        <div className="font-semibold text-gray-500">
                          Winter
                        </div>
                        <div className="text-left">Male</div>
                        <div className="bg-white rounded border border-blue-100">
                          200
                        </div>
                        <div className="bg-white rounded border border-blue-100">
                          206
                        </div>
                        <div className="text-left">Female</div>
                        <div className="bg-white rounded border border-blue-100">
                          165
                        </div>
                        <div className="bg-white rounded border border-blue-100">
                          171
                        </div>
                        <div className="text-left">Child</div>
                        <div className="bg-white rounded border border-blue-100">
                          75
                        </div>
                        <div className="bg-white rounded border border-blue-100">
                          75
                        </div>
                      </div>
                    </div>
                  )}

                  {/* My Hangar */}
                  <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        My Hangar Config
                      </h3>
                      <span className="text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        Auto-Saved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Basic Empty Weight
                        </label>
                        <input
                          type="number"
                          value={customEmptyWeight || ""}
                          onChange={(e) =>
                            setCustomEmptyWeight(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Empty CG (Arm)
                        </label>
                        <input
                          type="number"
                          value={customEmptyArm || ""}
                          onChange={(e) =>
                            setCustomEmptyArm(parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stations List */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {selectedPlane.stations.map((station) => {
                        const isFuel = station.id
                          .toLowerCase()
                          .includes("fuel");
                        const currentArm =
                          armOverrides[station.id] !== undefined
                            ? armOverrides[station.id]
                            : station.arm;
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
                              onWeightChange={(val) =>
                                handleWeightChange(station.id, val)
                              }
                              onArmChange={(val) =>
                                handleArmOverride(station.id, val)
                              }
                              onToggleUnit={() => setUseGallons(!useGallons)}
                            />
                            {isFuel && showFlightPlan && (
                              <div className="bg-blue-50/50 border-t border-b border-blue-100 px-4 py-3 grid grid-cols-2 gap-4 animate-fade-in">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                                    Taxi Fuel
                                  </label>
                                  <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2">
                                    <input
                                      type="number"
                                      value={taxiFuel}
                                      onChange={(e) =>
                                        setTaxiFuel(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full py-1.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      GAL
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                                    Flight Burn
                                  </label>
                                  <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2">
                                    <input
                                      type="number"
                                      value={tripFuel || ""}
                                      onChange={(e) =>
                                        setTripFuel(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full py-1.5 text-sm text-gray-700 focus:outline-none"
                                      placeholder="0"
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      GAL
                                    </span>
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
                          onWeightChange={(val) =>
                            updateCustomStation(
                              station.id,
                              "weight",
                              parseFloat(val) || 0
                            )
                          }
                          onArmChange={(val) =>
                            updateCustomStation(
                              station.id,
                              "arm",
                              parseFloat(val) || 0
                            )
                          }
                          onNameChange={(val) =>
                            updateCustomStation(station.id, "name", val)
                          }
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

                {/* Right Column: Graph */}
                <div className="md:col-span-7 flex flex-col gap-4 sticky top-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Envelope Graph
                      </h3>
                      {selectedPlane.utilityEnvelope && (
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setCategory("normal")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                              category === "normal"
                                ? "bg-white shadow text-blue-900"
                                : "text-gray-500"
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            onClick={() => setCategory("utility")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                              category === "utility"
                                ? "bg-white shadow text-blue-900"
                                : "text-gray-500"
                            }`}
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

                  <div
                    className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
                      takeoffWeight > maxGross
                        ? "bg-red-600 text-white"
                        : "bg-blue-900 text-white"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-8 relative">
                      <div>
                        <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">
                          Takeoff Weight
                        </span>
                        <span className="text-3xl font-bold">
                          {takeoffWeight.toFixed(1)}{" "}
                          <span className="text-base font-normal opacity-70">
                            lbs
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-200 text-xs uppercase tracking-wider block mb-1">
                          Takeoff CG
                        </span>
                        <span className="text-3xl font-bold">
                          {takeoffCG.toFixed(2)}{" "}
                          <span className="text-base font-normal opacity-70">
                            in
                          </span>
                        </span>
                      </div>

                      {showFlightPlan && tripFuel > 0 && (
                        <div className="pt-4 border-t border-white/20 mt-2 col-span-2 grid grid-cols-2 gap-8">
                          <div>
                            <span className="text-green-300 text-xs uppercase tracking-wider block mb-1">
                              Landing Weight
                            </span>
                            <span className="text-xl font-bold text-green-100">
                              {landingWeight.toFixed(1)}{" "}
                              <span className="text-sm font-normal opacity-70">
                                lbs
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="text-green-300 text-xs uppercase tracking-wider block mb-1">
                              Landing CG
                            </span>
                            <span className="text-xl font-bold text-green-100">
                              {landingCG.toFixed(2)}{" "}
                              <span className="text-sm font-normal opacity-70">
                                in
                              </span>
                            </span>
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
      {selectedPlane && (
        <ManifestReport
          plane={selectedPlane}
          date={new Date().toLocaleDateString()}
          // Config
          emptyWeight={customEmptyWeight}
          emptyArm={customEmptyArm}
          fuelArm={fuelArm}
          // Prepared List of Stations for the Table
          stations={[
            // Map Standard Stations
            ...selectedPlane.stations.map((station) => {
              const weight = weights[station.id] || 0;
              const isFuel = station.id.toLowerCase().includes("fuel");
              const effectiveWeight =
                isFuel && useGallons ? weight * 6 : weight;
              const effectiveArm =
                armOverrides[station.id] !== undefined
                  ? armOverrides[station.id]
                  : station.arm;

              return {
                id: station.id,
                name: station.name,
                weight: effectiveWeight,
                arm: effectiveArm,
                moment: effectiveWeight * effectiveArm,
              };
            }),
            // Map Custom Stations
            ...customStations.map((station) => ({
              id: station.id,
              name: station.name,
              weight: station.weight,
              arm: station.arm,
              moment: station.weight * station.arm,
            })),
          ]}
          // Flight Data
          taxiFuelWeight={taxiWeight}
          tripFuelWeight={showFlightPlan ? tripFuel * 6 : 0}
          // Totals
          rampWeight={rampWeight}
          rampMoment={rampMoment}
          takeoffWeight={takeoffWeight}
          takeoffMoment={takeoffMoment}
          landingWeight={landingWeight}
          landingMoment={landingWeight * landingCG} // Back-calculate moment for display consistency
          takeoffCG={takeoffCG}
          landingCG={landingCG}
          isTakeoffSafe={isTakeoffSafe}
          isLandingSafe={isLandingSafe}
        />
      )}
    </>
  );
}
