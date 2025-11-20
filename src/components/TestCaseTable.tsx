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
  const { appState, filters, sortConfig, toggleSort } = useAppContext();

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
        className={`px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none touch-manipulation ${className}`}
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

      {/* Table Container - Horizontal scroll on tablet/mobile, fixed headers */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {/* Touch-friendly scrolling with momentum */}
        <div className="min-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {/* Responsive column widths: smaller on mobile */}
                <ColumnHeader column="testName" label="Test Name" className="min-w-[150px] sm:min-w-[200px]" />
                <ColumnHeader column="changeType" label="Change Type" className="min-w-[120px] sm:min-w-[150px]" />
                <ColumnHeader column="implementationType" label="Implementation" className="min-w-[120px] sm:min-w-[150px]" />
                <ColumnHeader column="userFrequency" label="Frequency" className="min-w-[90px] sm:min-w-[100px]" />
                <ColumnHeader column="businessImpact" label="Impact" className="min-w-[90px] sm:min-w-[100px]" />
                <ColumnHeader column="affectedAreas" label="Areas" className="min-w-[80px] sm:min-w-[100px]" />
                <ColumnHeader column="isLegal" label="Legal" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.risk" label="Risk" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.value" label="Value" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.ease" label="Ease" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.history" label="History" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.legal" label="Legal" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="scores.total" label="Total" className="min-w-[70px] sm:min-w-[80px]" />
                <ColumnHeader column="recommendation" label="Recommendation" className="min-w-[120px] sm:min-w-[140px]" />
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">
                  Notes
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTestCases.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-2 sm:px-4 py-8 text-center text-gray-500">
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
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryStats testCases={filteredAndSortedTestCases} />
    </div>
  );
}
