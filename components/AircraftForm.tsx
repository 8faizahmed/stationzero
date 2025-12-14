import { useState } from "react";
import { Aircraft, SavedAircraft, aircraftList } from "../data/aircraft"; // <--- Import aircraftList

interface AircraftFormProps {
  template: Aircraft | SavedAircraft; 
  isEditMode: boolean;
  onSave: (data: SavedAircraft) => void;
  onCancel: () => void;
}

export default function AircraftForm({ template: initialTemplate, isEditMode, onSave, onCancel }: AircraftFormProps) {
  
  // 1. State to track the currently selected base model
  const [selectedTemplate, setSelectedTemplate] = useState<Aircraft | SavedAircraft>(initialTemplate);

  // 2. Form Fields
  const [reg, setReg] = useState('registration' in initialTemplate ? initialTemplate.registration : "");
  
  // Initialize weight/arm from the CURRENT selection
  const [bew, setBew] = useState(initialTemplate.emptyWeight.toString());
  const [arm, setArm] = useState(initialTemplate.emptyArm.toString());
  
  // Helper to extract arms from a template
  const getStationArms = (tmpl: Aircraft | SavedAircraft) => {
    const arms: Record<string, number> = {};
    tmpl.stations.forEach(s => {
      // If it has saved overrides, use them. Otherwise factory default.
      if ('savedArmOverrides' in tmpl && tmpl.savedArmOverrides?.[s.id] !== undefined) {
        arms[s.id] = tmpl.savedArmOverrides[s.id];
      } else {
        arms[s.id] = s.arm;
      }
    });
    return arms;
  };

  const [stationArms, setStationArms] = useState<Record<string, number>>(() => getStationArms(initialTemplate));

  // 3. Handle changing the dropdown
  const handleModelChange = (newId: string) => {
    const newModel = aircraftList.find(p => p.id === newId);
    if (!newModel) return;

    setSelectedTemplate(newModel);
    setBew(newModel.emptyWeight.toString());
    setArm(newModel.emptyArm.toString());
    setStationArms(getStationArms(newModel)); // Reset station arms to new model defaults
  };

  const handleSave = () => {
    if (!reg) return;

    // Construct the saved plane object using the CURRENTLY selected template
    const savedPlane: SavedAircraft = {
      ...selectedTemplate,
      // If editing, keep original ID. If creating, make new ID.
      id: isEditMode ? initialTemplate.id : `${selectedTemplate.id}-${Date.now()}`,
      registration: reg.toUpperCase(),
      emptyWeight: parseFloat(bew) || 0,
      emptyArm: parseFloat(arm) || 0,
      isCustomPlane: true,
      savedArmOverrides: stationArms,
      model: selectedTemplate.model 
    };

    onSave(savedPlane);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEditMode ? 'Edit Aircraft Details' : 'Add Aircraft to Fleet'}
      </h2>

      <div className="space-y-6">
        
        {/* BASE MODEL DROPDOWN */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Base Model</label>
            <div className="relative">
                <select 
                    value={selectedTemplate.id.split('-')[0]} // Handle potential suffix on IDs if strictly matching base templates
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full p-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {aircraftList.map(plane => (
                        <option key={plane.id} value={plane.id}>
                            {plane.model} ({plane.make})
                        </option>
                    ))}
                </select>
                {/* Custom Chevron Icon for Dropdown */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Changing this will reset weights and station arms to factory defaults.</p>
        </div>

        {/* REGISTRATION */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Registration</label>
          <input 
            type="text" 
            placeholder="C-GABC"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
          />
        </div>

        {/* WEIGHT & ARM */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Empty Weight</label>
            <input 
              type="number" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={bew}
              onChange={(e) => setBew(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Empty Arm</label>
            <input 
              type="number" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
            />
          </div>
        </div>

        {/* STATION ARMS */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Station Arms (Optional)</label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                {selectedTemplate.stations.map((station) => (
                    <div key={station.id} className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">{station.name}</label>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Arm:</span>
                            <input 
                                type="number" 
                                className="w-20 p-1.5 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                                value={stationArms[station.id] ?? station.arm}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setStationArms(prev => ({
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

        {/* ACTIONS */}
        <div className="flex gap-4 pt-4">
          <button 
            onClick={handleSave}
            disabled={!reg}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isEditMode ? 'Save Changes' : 'Save & Open'}
          </button>
          <button 
            onClick={onCancel}
            className="px-6 py-3 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}