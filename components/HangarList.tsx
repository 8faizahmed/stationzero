import React from 'react';
import { Aircraft, SavedAircraft } from '../data/aircraft';

// Maintained visual consistency
const CARD_BASE_STYLES = "group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden text-left flex justify-between gap-4";

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
            <button onClick={onAdd} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all">
              Add Your First Aircraft
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedPlanes.map((plane) => (
              <div 
                key={plane.id} 
                onClick={() => onSelect(plane)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col justify-between h-full text-left cursor-pointer border-l-4 border-l-blue-500"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                      {/* FIX: Strictly use plane.model. Removed any fallback to .name */}
                      {plane.model}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(e, plane); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        aria-label={`Edit ${plane.registration}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(e, plane.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Delete ${plane.registration}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plane.registration}</h3>
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500 mt-auto">
                   <div><span className="block text-[10px] uppercase font-bold text-slate-400">BEW</span>{plane.emptyWeight}</div>
                   <div><span className="block text-[10px] uppercase font-bold text-slate-400">Arm</span>{plane.emptyArm}"</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: FACTORY TEMPLATES */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            🏭 Factory Templates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a template for quick calc or add to hangar.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelect(template)}
              className={CARD_BASE_STYLES + " cursor-pointer hover:border-blue-400 group items-stretch"}
            >
              {/* LEFT: Information Stack */}
              <div className="flex flex-col justify-center min-w-0 pr-2 py-1">
                <div>
                   <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    {template.make || "Factory"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                  {/* FIX: Strictly use template.model. Removed .name */}
                  {template.model}
                </h3>
              </div>

              {/* RIGHT: Action Stack */}
              <div className="flex flex-col justify-between items-end shrink-0 gap-4">
                
                {/* 1. Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToFleet(template);
                  }}
                  title="Add to My Hangar"
                  aria-label={`Add ${template.model} to My Hangar`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* 2. Arrow Indicator */}
                <div className="w-8 h-8 flex items-center justify-center text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
}