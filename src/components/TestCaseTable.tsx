/**
 * TestCaseTable Component
 * Main table displaying all test cases with sorting, filtering, and virtualization
 */

import { useMemo } from 'react';
import { useAppContext } from '../context';
import { TestCaseRowNormal } from './TestCaseRowNormal';
import { TestCaseRowTeaching } from './TestCaseRowTeaching';
import { TableFilters } from './TableFilters';
import { SummaryStats } from './SummaryStats';
import type { TestCase } from '../types/models';
import { AppMode } from '../types/models';

export function TestCaseTable() {
  const { appState, filters, sortConfig, userPreferences, collapseAllRows, expandAllRows } = useAppContext();

  // ========================================================================
  // Filter and Sort Logic
  // ========================================================================

  const filteredAndSortedTestCases = useMemo(() => {
    let result = [...appState.testCases];

    // Apply filters
    if (filters.recommendation) {
      result = result.filter(tc => tc.recommendation === filters.recommendation);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(tc =>
        tc.testName.toLowerCase().includes(searchLower) ||
        (tc.notes && tc.notes.toLowerCase().includes(searchLower))
      );
    }

    if (filters.codeChange) {
      result = result.filter(tc => tc.codeChange === filters.codeChange);
    }

    if (filters.implementationType) {
      result = result.filter(tc => tc.implementationType === filters.implementationType);
    }

    if (filters.isLegal !== undefined) {
      result = result.filter(tc => tc.isLegal === filters.isLegal);
    }

    if (filters.isDescoped !== undefined) {
      result = result.filter(tc => (tc.isDescoped ?? false) === filters.isDescoped);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: unknown;
        let bValue: unknown;

        // Handle nested score properties
        if (sortConfig.column.startsWith('scores.')) {
          const scoreKey = sortConfig.column.split('.')[1] as keyof TestCase['scores'];
          aValue = a.scores[scoreKey];
          bValue = b.scores[scoreKey];
        } else {
          aValue = a[sortConfig.column as keyof TestCase];
          bValue = b[sortConfig.column as keyof TestCase];
        }

        // Handle different types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'asc'
            ? (aValue === bValue ? 0 : aValue ? 1 : -1)
            : (aValue === bValue ? 0 : bValue ? 1 : -1);
        }

        return 0;
      });
    }

    return result;
  }, [appState.testCases, filters, sortConfig]);



  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <TableFilters />

      {/* Table Container - Table on desktop, cards on mobile */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          {/* Desktop Table - hidden on mobile */}
          <table className="hidden lg:table w-full table-auto">
            <thead className="bg-slate-100 sticky top-0 z-10 border-b-2 border-slate-300">
              {userPreferences.appMode === AppMode.NORMAL ? (
                // Normal Mode Headers - Grid layout
                <tr>
                  <th className="px-3 py-3 text-left text-base font-bold text-slate-700 min-w-[150px] border-r border-slate-300">
                    <div className="flex items-center gap-2">
                      <span>Test Name</span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={collapseAllRows}
                          className="p-1.5 bg-white hover:bg-slate-200 rounded border border-slate-300 transition-colors shadow-sm"
                          title="Collapse all rows"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={expandAllRows}
                          className="p-1.5 bg-white hover:bg-slate-200 rounded border border-slate-300 transition-colors shadow-sm"
                          title="Expand all rows"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[100px] border-r border-slate-300">Gut Feel</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 border-r border-slate-300" colSpan={4}>Scoring Categories</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[80px] border-r border-slate-300">Total Score</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[120px] border-r border-slate-300">Recommendation</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[80px]">Actions</th>
                </tr>
              ) : (
                // Teaching Mode Headers - Grid layout (same as Normal mode)
                <tr>
                  <th className="px-3 py-3 text-left text-base font-bold text-slate-700 min-w-[150px] border-r border-slate-300">
                    <div className="flex items-center gap-2">
                      <span>Test Name</span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={collapseAllRows}
                          className="p-1.5 bg-white hover:bg-slate-200 rounded border border-slate-300 transition-colors shadow-sm"
                          title="Collapse all rows"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={expandAllRows}
                          className="p-1.5 bg-white hover:bg-slate-200 rounded border border-slate-300 transition-colors shadow-sm"
                          title="Expand all rows"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[100px] border-r border-slate-300">Gut Feel</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 border-r border-slate-300" colSpan={4}>Scoring Categories</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[100px] border-r border-slate-300">Legal & Org Pressure</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[80px] border-r border-slate-300">Total Score</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[120px] border-r border-slate-300">Recommendation</th>
                  <th className="px-3 py-3 text-center text-base font-bold text-slate-700 min-w-[80px]">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTestCases.length === 0 ? (
                <tr>
                  <td colSpan={userPreferences.appMode === AppMode.NORMAL ? 13 : (userPreferences.showInitialJudgment ? 10 : 9)} className="px-2 sm:px-4 py-8 text-center text-gray-500">
                    {appState.testCases.length === 0 ? (
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">No test cases yet</p>
                        <p className="text-xs sm:text-sm">Click "Add Row" to create your first test case</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">No matching test cases</p>
                        <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSortedTestCases.map(testCase => (
                  userPreferences.appMode === AppMode.NORMAL ? (
                    <TestCaseRowNormal key={testCase.id} testCase={testCase} />
                  ) : (
                    <TestCaseRowTeaching key={testCase.id} testCase={testCase} />
                  )
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards - hidden on desktop */}
          <div className="lg:hidden space-y-3 p-2">
            {filteredAndSortedTestCases.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {appState.testCases.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium mb-2">No test cases yet</p>
                    <p className="text-sm">Click "Add Row" to create your first test case</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">No matching test cases</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            ) : (
              filteredAndSortedTestCases.map(testCase => (
                userPreferences.appMode === AppMode.NORMAL ? (
                  <TestCaseRowNormal key={testCase.id} testCase={testCase} isMobile />
                ) : (
                  <TestCaseRowTeaching key={testCase.id} testCase={testCase} isMobile />
                )
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryStats testCases={filteredAndSortedTestCases} />
    </div>
  );
}
