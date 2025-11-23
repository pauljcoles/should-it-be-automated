/**
 * ModeToggle Component
 * Allows users to switch between Normal and Teaching modes
 */

import { useAppContext } from '../context';
import { AppMode } from '../types/models';

export function ModeToggle() {
  const { userPreferences, setAppMode } = useAppContext();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
      <span className="text-sm font-medium text-gray-700">Mode:</span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="appMode"
            value={AppMode.NORMAL}
            checked={userPreferences.appMode === AppMode.NORMAL}
            onChange={() => setAppMode(AppMode.NORMAL)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Normal</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="appMode"
            value={AppMode.TEACHING}
            checked={userPreferences.appMode === AppMode.TEACHING}
            onChange={() => setAppMode(AppMode.TEACHING)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Teaching</span>
        </label>
      </div>
      <button
        onClick={() => {
          // TODO: Open "About This Tool" modal
          alert('About This Tool modal coming soon!');
        }}
        className="ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="About this tool"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
