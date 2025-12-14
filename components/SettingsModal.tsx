// src/components/SettingsModal.tsx
import { useRef } from "react";

interface SettingsModalProps {
  onClose: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export default function SettingsModal({ onClose, onImport, onExport }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-xl animate-fade-in">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Data Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Back up your fleet data to a file or restore from a previous backup.
        </p>
        
        <div className="space-y-3">
          <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-3 rounded-lg font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export Fleet Data (JSON)
          </button>

          <div className="relative">
            <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-bold border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Import Fleet Data
            </button>
          </div>
        </div>

        <button onClick={onClose} className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          Cancel
        </button>
      </div>
    </div>
  );
}