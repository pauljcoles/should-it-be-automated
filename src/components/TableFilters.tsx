/**
 * TableFilters Component - Neo-Brutalist Edition
 * Provides filtering controls for test cases
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { Recommendation, AppMode } from '../types/models';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

export function TableFilters() {
  const {
    filters,
    setRecommendationFilter,
    setSearchTerm,
    setLegalFilter,
    setDescopeFilter,
    clearFilters,
    userPreferences,
    appState,
    uiState,
    collapseAllRows,
    expandAllRows
  } = useAppContext();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const isTeachingMode = userPreferences.appMode === AppMode.TEACHING;

  const hasActiveFilters = !!(
    filters.recommendation ||
    filters.searchTerm ||
    filters.codeChange ||
    filters.implementationType ||
    filters.isLegal !== undefined ||
    filters.isDescoped !== undefined
  );

  // Determine if most rows are collapsed
  const collapsedCount = Object.values(uiState.collapsedRows).filter(Boolean).length;
  const totalRows = appState.testCases.length;
  const areRowsCollapsed = collapsedCount > totalRows / 2;

  const handleToggleRows = () => {
    if (areRowsCollapsed) {
      expandAllRows();
    } else {
      collapseAllRows();
    }
  };

  return (
    <div className="bg-slate-100 border-b border-slate-300 px-2 sm:px-4 lg:px-6 py-1.5">
      {/* Toggle Buttons - Compact on mobile */}
      <div className="flex gap-1.5 items-center">
        <Button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          variant="outline"
          size="sm"
          className="gap-1 px-2 py-1 h-8"
          title="Toggle Search"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Search</span>
          {isSearchOpen ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </Button>
        <Button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          variant="outline"
          size="sm"
          className="gap-1 px-2 py-1 h-8 relative"
          title="Toggle Filters"
        >
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-blue-500 text-white text-[10px] rounded-full min-w-[16px] text-center">{Object.values(filters).filter(v => v !== undefined && v !== '').length}</span>}
          {isFiltersOpen ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </Button>
        
        {/* Toggle Expand/Collapse All Button */}
        <Button
          onClick={handleToggleRows}
          variant="outline"
          size="sm"
          className="gap-1 px-2 py-1 h-8 ml-auto"
          title={areRowsCollapsed ? "Expand all rows" : "Collapse all rows"}
        >
          {areRowsCollapsed ? (
            <>
              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Expand</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Search Section */}
      {isSearchOpen && (
        <div className="mb-2">
          <Input
            type="text"
            value={filters.searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test name or notes..."
            className="font-medium touch-manipulation"
          />
        </div>
      )}

      {/* Filters Section */}
      {isFiltersOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3">
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

        {/* Descope Filter */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.isDescoped === undefined ? '' : filters.isDescoped ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value;
              setDescopeFilter(value === '' ? undefined : value === 'true');
            }}
            className="w-full h-10 px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-sm font-semibold shadow-sm hover:shadow-md hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 touch-manipulation transition-all"
          >
            <option value="">All Tests</option>
            <option value="false">Hide Descoped</option>
            <option value="true">Only Descoped</option>
          </select>
        </div>

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
      )}
    </div>
  );
}
