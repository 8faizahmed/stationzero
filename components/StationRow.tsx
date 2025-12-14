"use client";

import React from "react";

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
  onWeightChange: (val: string) => void;
  onArmChange: (val: string) => void;
  onNameChange?: (val: string) => void;
  onToggleUnit?: () => void;
  onDelete?: () => void;
}

export default function StationRow({
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
    <div className={`flex items-center justify-between p-4 ${isCustom ? 'bg-orange-50/50 group relative border-t border-gray-100' : ''}`}>
      
      {/* Delete Button (Custom Only) */}
      {isCustom && onDelete && (
        <button 
          onClick={onDelete}
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
             onChange={(e) => onNameChange(e.target.value)}
             className="text-sm font-medium text-gray-700 bg-transparent border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none w-full mb-1 transition-colors"
           />
          ) : (
            <label htmlFor={id} className="text-sm font-medium text-gray-700">{name}</label>
          )}
          
          {/* Unit Toggle (Fuel Only) */}
          {isFuel && onToggleUnit && (
            <button
              onClick={onToggleUnit}
              className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            >
              {useGallons ? "LBS" : "GALS"}
            </button>
          )}
        </div>
        
        {/* Metadata Area (Arm & Moment) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
          <div className="flex items-center gap-1">
            <span>Arm:</span>
            <input 
              type="number" 
              value={arm}
              onChange={(e) => onArmChange(e.target.value)}
              className={`w-10 bg-transparent border-b border-gray-300 text-center text-gray-600 focus:outline-none focus:bg-white transition-colors ${isCustom ? 'focus:border-orange-500' : 'focus:border-blue-500'}`}
            />
          </div>
          {/* Moment Display */}
          {showMoments && (
            <span className={`${isCustom ? 'text-orange-600 bg-orange-100/50' : 'text-blue-600 bg-blue-50'} font-medium px-1.5 rounded`}>
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
          className={`w-24 p-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:outline-none bg-white ${isCustom ? 'focus:ring-orange-500' : 'focus:ring-blue-500'}`}
          value={weight || ""}
          onChange={(e) => onWeightChange(e.target.value)}
        />
        <span className="text-xs text-gray-400 font-medium w-6">
          {isFuel && useGallons ? "Gals" : "Lbs"}
        </span>
      </div>
    </div>
  );
}