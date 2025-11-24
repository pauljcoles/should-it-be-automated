/**
 * TableFilters Component - Neo-Brutalist Edition
 * Provides filtering controls for test cases
 */

import { useAppContext } from '../context';
import { Recommendation, AppMode } from '../types/models';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

export function TableFilters() {
  const {
    filters,
    setRecommendationFilter,
    setSearchTerm,
    setLegalFilter,
    clearFilters,
    userPreferences,
    uiState
  } = useAppContext();

  const isTeachingMode = userPreferences.appMode === AppMode.TEACHING;

  const hasActiveFilters = !!(
    filters.recommendation ||
    filters.searchTerm ||
    filters.codeChange ||
    filters.implementationType ||
    filters.isLegal !== undefined
  );

  // On mobile, hide filters when closed
  if (!uiState.isFiltersOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }

  return (
    <div className="bg-slate-100 border-b border-slate-300 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
      {/* Responsive grid layout: 1 column on mobile, 2 on tablet, multiple on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3">
        {/* Search - Full width on mobile, flexible on desktop */}
        <div className="sm:col-span-2 lg:col-span-1 lg:flex-1 lg:min-w-[200px]">
          <Input
            type="text"
            value={filters.searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test name or notes..."
            className="font-medium touch-manipulation"
          />
        </div>

        {/* Recommendation Filter - Touch-friendly */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.recommendation || ''}
            onChange={(e) => setRecommendationFilter(e.target.value as Recommendation || undefined)}
            className="w-full h-10 px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-sm font-semibold shadow-sm hover:shadow-md hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 touch-manipulation transition-all"
          >
            <option value="">All Recommendations</option>
            <option value={Recommendation.AUTOMATE}>Automate</option>
            <option value={Recommendation.MAYBE}>Maybe</option>
            <option value={Recommendation.DONT_AUTOMATE}>Exploratory Testing</option>
          </select>
        </div>

        {/* Legal Filter - Only show in Teaching mode */}
        {isTeachingMode && (
          <div className="w-full lg:w-auto">
            <select
              value={filters.isLegal === undefined ? '' : filters.isLegal ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value;
                setLegalFilter(value === '' ? undefined : value === 'true');
              }}
              className="w-full h-10 px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-sm font-semibold shadow-sm hover:shadow-md hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 touch-manipulation transition-all"
            >
              <option value="">All Legal Status</option>
              <option value="true">Legal Required</option>
              <option value="false">Not Legal</option>
            </select>
          </div>
        )}

        {/* Clear Filters - Full width on mobile */}
        {hasActiveFilters && (
          <div className="w-full sm:w-auto">
            <Button
              onClick={clearFilters}
              variant="destructive"
              size="sm"
              className="gap-1 w-full sm:w-auto touch-manipulation"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
