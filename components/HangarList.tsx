// src/components/HangarList.tsx
import { Aircraft } from "../data/aircraft";

interface HangarListProps {
  savedPlanes: any[];
  templates: Aircraft[];
  onSelect: (plane: any) => void;
  onAdd: () => void;
  onEdit: (e: React.MouseEvent, plane: any) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export default function HangarList({ savedPlanes, templates, onSelect, onAdd, onEdit, onDelete }: HangarListProps) {
  return (
    <div className="space-y-8">
      {/* MY HANGAR */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">My Hangar</h2>
          <button onClick={onAdd} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow hover:bg-blue-700 transition">
            + Add Aircraft
          </button>
        </div>
        
        {savedPlanes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400">
            <p>No aircraft in your hangar yet.</p>
            <button onClick={onAdd} className="text-blue-600 dark:text-blue-400 underline mt-2 hover:text-blue-800">Add your first plane</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlanes.map((plane) => (
              <button key={plane.id} onClick={() => onSelect(plane)} className="relative p-6 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-xl shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition text-left group">
                <span className="absolute top-4 right-4 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">{plane.registration}</span>
                <h2 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 text-gray-900 dark:text-white">{plane.model}</h2>
                <p className="text-gray-400 text-sm mt-1">BEW: {plane.emptyWeight} lbs</p>
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div onClick={(e) => onEdit(e, plane)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg></div>
                    <div onClick={(e) => onDelete(e, plane.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-red-50 dark:hover:bg-gray-600" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FACTORY TEMPLATES */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Factory Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((plane) => (
            <button key={plane.id} onClick={() => onSelect(plane)} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-sm transition text-left">
              <h2 className="font-bold text-base text-gray-700 dark:text-gray-200">{plane.model}</h2>
              <p className="text-gray-400 text-xs">{plane.make}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}