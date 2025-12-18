"use client";

import React, { memo } from "react";

interface StationRowProps {
  id: string;
  name: string;
  weight: number;
  arm: number;
  // Configuration
  isFuel?: boolean;
  isCustom?: boolean;
  useGallons: boolean;
  showMoments: boolean;
  // Callbacks
  onWeightChange: (id: string, val: string) => void;
  onArmChange: (id: string, val: string) => void;
  onNameChange?: (id: string, val: string) => void;
  onToggleUnit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function StationRow({
  id,
  name,
  weight,
  arm,
  isFuel,
  isCustom,
  useGallons,
  showMoments,
  onWeightChange,
  onArmChange,
  onNameChange,
  onToggleUnit,
  onDelete
}: StationRowProps) {
  
  // Display Math
  const displayWeight = (isFuel && useGallons) ? weight * 6 : weight;
  const currentMoment = displayWeight * arm;

  return (
    <div className={`flex items-center justify-between p-4 transition-colors 
      ${isCustom 
        ? 'bg-orange-50/50 dark:bg-orange-900/10 group relative border-t border-gray-100 dark:border-gray-800' 
        : 'border-b border-gray-100 dark:border-gray-800 last:border-0'
      }`
    }>
      
      {/* Delete Button (Custom Only) */}
      {isCustom && onDelete && (
        <button 
          onClick={() => onDelete(id)}
          className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove item"
        >
          ×
        </button>
      )}

      <div className="flex-1 pr-4">
        {/* Row Label / Name Input */}
        <div className="flex items-center gap-2">
          {isCustom && onNameChange ? (
             <input 
             type="text" 
             placeholder="Item Name"
             value={name}
             onChange={(e) => onNameChange(id, e.target.value)}
             className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none w-full mb-1 transition-colors"
           />
          ) : (
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">{name}</label>
          )}
          
          {/* Unit Toggle (Fuel Only) */}
          {isFuel && onToggleUnit && (
            <button
              onClick={() => onToggleUnit(id)}
              className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50 transition"
            >
              {useGallons ? "Switch to LBS" : "Switch to GALS"}
            </button>
          )}
        </div>
        
        {/* Metadata Area (Arm & Moment) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
          <div className="flex items-center gap-1">
            <span>Arm:</span>
            <input 
              type="number" 
              value={arm}
              onChange={(e) => onArmChange(id, e.target.value)}
              className={`w-10 bg-transparent border-b border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 transition-colors ${isCustom ? 'focus:border-orange-500' : 'focus:border-blue-500'}`}
            />
          </div>
          {/* Moment Display */}
          {showMoments && (
            <span className={`${isCustom ? 'text-orange-600 bg-orange-100/50 dark:bg-orange-900/30 dark:text-orange-300' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'} font-medium px-1.5 rounded`}>
              Mom: {currentMoment.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Weight Input Area */}
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="number"
          placeholder="0"
          className={`w-24 p-2 text-right border rounded-lg focus:ring-2 focus:outline-none 
            bg-white dark:bg-gray-700 
            border-gray-300 dark:border-gray-600 
            text-gray-900 dark:text-white
            ${isCustom ? 'focus:ring-orange-500' : 'focus:ring-blue-500'}`}
          value={weight || ""}
          onChange={(e) => onWeightChange(id, e.target.value)}
        />
        <span className="text-xs text-gray-400 font-medium w-6">
          {isFuel && useGallons ? "Gals" : "Lbs"}
        </span>
      </div>
    </div>
  );
}

export default memo(StationRow);
