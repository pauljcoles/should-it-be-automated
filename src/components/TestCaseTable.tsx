/**
 * TestCaseTable Component
 * Main table displaying all test cases with sorting, filtering, and virtualization
 */

import { useMemo } from 'react';
import { useAppContext } from '../context';
import { TestCaseRow } from './TestCaseRow';
import { TableFilters } from './TableFilters';
import { SummaryStats } from './SummaryStats';
import type { TestCase, SortConfig } from '../types/models';

export function TestCaseTable() {
  const { appState, filters, sortConfig, toggleSort, userPreferences } = useAppContext();

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

    if (filters.changeType) {
      result = result.filter(tc => tc.changeType === filters.changeType);
    }

    if (filters.implementationType) {
      result = result.filter(tc => tc.implementationType === filters.implementationType);
    }

    if (filters.isLegal !== undefined) {
      result = result.filter(tc => tc.isLegal === filters.isLegal);
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
  // Column Header Component
  // ========================================================================

  interface ColumnHeaderProps {
    column: SortConfig['column'];
    label: string;
    className?: string;
  }

  function ColumnHeader({ column, label, className = '' }: ColumnHeaderProps) {
    const isSorted = sortConfig?.column === column;
    const direction = isSorted ? sortConfig.direction : null;

    return (
      <th
        onClick={() => toggleSort(column)}
        className={`px-2 sm:px-4 py-3 text-left text-base font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none touch-manipulation ${className}`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isSorted && (
            <svg
              className={`w-4 h-4 transition-transform ${direction === 'desc' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </th>
    );
  }

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
          <table className="hidden lg:table w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <ColumnHeader column="testName" label="Test Name" className="min-w-[200px]" />
                {userPreferences.showInitialJudgment && (
                  <th className="px-2 py-2 text-left text-base font-medium text-gray-700 min-w-[160px]">
                    <div className="flex items-center gap-1">
                      <span>Gut Feel</span>
                      <span 
                        className="cursor-help text-blue-500" 
                        title="Your initial judgment before seeing the calculated score. Helps identify biases and learn from scoring patterns."
                      >
                        ℹ️
                      </span>
                    </div>
                  </th>
                )}
                <th className="px-2 py-2 text-left text-base font-medium text-gray-700 min-w-[180px]">
                  <div className="flex items-center gap-1">
                    <span>New or Changed?</span>
                    <span 
                      className="cursor-help text-blue-500" 
                      title="Does this test verify something new or changed?"
                    >
                      ℹ️
                    </span>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-base font-medium text-gray-700 min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <span>Easy?</span>
                    <span 
                      className="cursor-help text-blue-500" 
                      title="How easy is it to automate? (1=very difficult, 5=very easy)"
                    >
                      ℹ️
                    </span>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-base font-medium text-gray-700 min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <span>Quick?</span>
                    <span 
                      className="cursor-help text-blue-500" 
                      title="How quick is it to automate? (1=very slow, 5=very fast)"
                    >
                      ℹ️
                    </span>
                  </div>
                </th>
                <ColumnHeader column="userFrequency" label="Freq" className="w-16" />
                <ColumnHeader column="businessImpact" label="Impact" className="w-16" />
                <ColumnHeader column="affectedAreas" label="Areas" className="w-16" />
                <ColumnHeader column="isLegal" label="Legal" className="w-16" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTestCases.length === 0 ? (
                <tr>
                  <td colSpan={userPreferences.showInitialJudgment ? 9 : 8} className="px-2 sm:px-4 py-8 text-center text-gray-500">
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
                  <TestCaseRow key={testCase.id} testCase={testCase} />
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
                <TestCaseRow key={testCase.id} testCase={testCase} isMobile />
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
