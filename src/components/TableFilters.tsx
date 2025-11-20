/**
 * TableFilters Component - Neo-Brutalist Edition
 * Provides filtering controls for test cases
 */

import { useAppContext } from '../context';
import { Recommendation, ChangeType, ImplementationType } from '../types/models';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

export function TableFilters() {
  const {
    filters,
    setRecommendationFilter,
    setSearchTerm,
    setChangeTypeFilter,
    setImplementationTypeFilter,
    setLegalFilter,
    clearFilters
  } = useAppContext();

  const hasActiveFilters = !!(
    filters.recommendation ||
    filters.searchTerm ||
    filters.changeType ||
    filters.implementationType ||
    filters.isLegal !== undefined
  );

  return (
    <div className="bg-white border-b-4 border-black px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
      {/* Responsive grid layout: 1 column on mobile, 2 on tablet, multiple on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3">
        {/* Search - Full width on mobile, flexible on desktop */}
        <div className="sm:col-span-2 lg:col-span-1 lg:flex-1 lg:min-w-[200px]">
          <Input
            type="text"
            value={filters.searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test name or notes..."
            className="font-bold touch-manipulation"
          />
        </div>

        {/* Recommendation Filter - Touch-friendly */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.recommendation || ''}
            onChange={(e) => setRecommendationFilter(e.target.value as Recommendation || undefined)}
            className="w-full h-10 px-3 py-2 border-brutal bg-white text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black touch-manipulation"
          >
            <option value="">All Recommendations</option>
            <option value={Recommendation.AUTOMATE}>Automate</option>
            <option value={Recommendation.MAYBE}>Maybe</option>
            <option value={Recommendation.DONT_AUTOMATE}>Don't Automate</option>
          </select>
        </div>

        {/* Change Type Filter - Touch-friendly */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.changeType || ''}
            onChange={(e) => setChangeTypeFilter(e.target.value as ChangeType || undefined)}
            className="w-full h-10 px-3 py-2 border-brutal bg-white text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black touch-manipulation"
          >
            <option value="">All Change Types</option>
            <option value={ChangeType.NEW}>New</option>
            <option value={ChangeType.MODIFIED_BEHAVIOR}>Modified Behavior</option>
            <option value={ChangeType.MODIFIED_UI}>Modified UI</option>
            <option value={ChangeType.UNCHANGED}>Unchanged</option>
          </select>
        </div>

        {/* Implementation Type Filter - Touch-friendly */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.implementationType || ''}
            onChange={(e) => setImplementationTypeFilter(e.target.value as ImplementationType || undefined)}
            className="w-full h-10 px-3 py-2 border-brutal bg-white text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black touch-manipulation"
          >
            <option value="">All Implementation Types</option>
            <option value={ImplementationType.LOOP_SAME}>Loop - Same</option>
            <option value={ImplementationType.LOOP_DIFFERENT}>Loop - Different</option>
            <option value={ImplementationType.CUSTOM}>Custom</option>
            <option value={ImplementationType.MIX}>Mix</option>
          </select>
        </div>

        {/* Legal Filter - Touch-friendly */}
        <div className="w-full lg:w-auto">
          <select
            value={filters.isLegal === undefined ? '' : filters.isLegal ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value;
              setLegalFilter(value === '' ? undefined : value === 'true');
            }}
            className="w-full h-10 px-3 py-2 border-brutal bg-white text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black touch-manipulation"
          >
            <option value="">All Legal Status</option>
            <option value="true">Legal Required</option>
            <option value="false">Not Legal</option>
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
              CLEAR
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
