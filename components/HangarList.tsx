import React from 'react';
import { Aircraft, SavedAircraft } from '../data/aircraft';

// Simple SVG Silhouettes for visual enhancement
const ICONS = {
  highWing: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-10">
      <path d="M21 14l-2.5-8h-13L3 14h2l1-4h12l1 4h2z M2 16h20v2H2z" />
    </svg>
  ),
  lowWing: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-10">
      <path d="M2 12l8 2 2-6 2 6 8-2v2l-10 4-10-4z M10 16h4v2h-4z" />
    </svg>
  )
};

// Helper to safely determine the icon based on any string (make, model, or name)
const getIconForPlane = (str?: string) => {
  if (!str) return ICONS.lowWing; 
  if (str.toLowerCase().includes('cessna')) return ICONS.highWing;
  return ICONS.lowWing;
};

interface HangarListProps {
  savedPlanes: SavedAircraft[];
  templates: Aircraft[];
  onSelect: (plane: Aircraft | SavedAircraft) => void;
  onAddToFleet: (plane: Aircraft) => void;
  onAdd: () => void;
  onEdit: (e: React.MouseEvent, plane: SavedAircraft) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export default function HangarList({
  savedPlanes,
  templates,
  onSelect,
  onAddToFleet,
  onAdd,
  onEdit,
  onDelete
}: HangarListProps) {
  
  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* SECTION: MY HANGAR */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            ✈️ My Hangar
          </h2>
          {savedPlanes.length > 0 && (
            <button onClick={onAdd} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              + New Aircraft
            </button>
          )}
        </div>

        {savedPlanes.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50">
            <p className="text-slate-500 mb-4">Your hangar is empty.</p>
            <button 
              onClick={onAdd} 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Add Your First Aircraft
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedPlanes.map((plane) => {
               // Fallback logic for display name
               const displayName = plane.name || plane.model || "Unknown Type";
               
               return (
                <div 
                  key={plane.id} 
                  onClick={() => onSelect(plane)}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                  {/* Decorative Silhouette Background - Check make or name for correct shape */}
                  <div className="absolute -right-4 -top-4 w-32 h-32 text-slate-100 dark:text-slate-700 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    {getIconForPlane(plane.make || plane.name)}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        {displayName}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => onEdit(e, plane)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Edit Configuration"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={(e) => onDelete(e, plane.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                      {plane.registration}
                    </h3>
                    
                    <div className="flex gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">BEW</span>
                        {plane.emptyWeight} lbs
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Arm</span>
                        {plane.emptyArm}"
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator Strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: FACTORY TEMPLATES */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 opacity-80">
          🏭 Factory Templates
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onAddToFleet(template)}
              className="flex items-center gap-3 p-3 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                {/* Use the make (e.g. Cessna) to pick the icon, or fallback to '+' */}
                <div className="w-5 h-5 opacity-50">
                   {getIconForPlane(template.make || template.name)}
                </div>
              </div>
              <div className="min-w-0"> {/* min-w-0 forces text truncation if needed */}
                <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {/* FIX: Try model first, then name */}
                  {template.model || template.name || "Unknown Model"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate block">
                   {/* FIX: Show Make if available (e.g. Cessna), else 'Add to Fleet' */}
                   {template.make || "Add to Fleet"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}