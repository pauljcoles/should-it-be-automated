/**
 * TestCaseRow Component
 * Represents a single test case row with inline editing capabilities
 * Optimized with React.memo for performance
 */

import { memo, useCallback, useState, useMemo } from 'react';
import { useAppContext } from '../context';
import type { TestCase } from '../types/models';
import { ChangeType, ImplementationType, Recommendation } from '../types/models';
import { BERTIntegrationService } from '../services/BERTIntegrationService';
import { ValidationService } from '../services/ValidationService';
import { ValidationDisplay, InlineValidation } from './ValidationDisplay';

interface TestCaseRowProps {
  testCase: TestCase;
}

function TestCaseRowComponent({ testCase }: TestCaseRowProps) {
  const { updateTestCase, deleteTestCase, duplicateTestCase, showNotification } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Get validation warnings for this test case
  const validationWarnings = useMemo(() => 
    ValidationService.getValidationWarnings(testCase),
    [testCase]
  );

  // ========================================================================
  // Update Handlers
  // ========================================================================

  const handleFieldChange = useCallback((field: keyof TestCase, value: unknown) => {
    updateTestCase(testCase.id, { [field]: value });
  }, [testCase.id, updateTestCase]);

  const handleTextChange = useCallback((field: keyof TestCase) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleFieldChange(field, e.target.value);
  }, [handleFieldChange]);

  const handleNumberChange = useCallback((field: keyof TestCase, min: number, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(min, Math.min(max, parseInt(e.target.value) || min));
    handleFieldChange(field, value);
  }, [handleFieldChange]);

  const handleCheckboxChange = useCallback((field: keyof TestCase) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange(field, e.target.checked);
  }, [handleFieldChange]);

  const handleSelectChange = useCallback((field: keyof TestCase) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFieldChange(field, e.target.value);
  }, [handleFieldChange]);

  // ========================================================================
  // Action Handlers
  // ========================================================================

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    deleteTestCase(testCase.id);
    setShowDeleteConfirm(false);
    showNotification('Test case deleted', 'info');
  }, [testCase.id, deleteTestCase, showNotification]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleDuplicate = useCallback(() => {
    duplicateTestCase(testCase.id);
    showNotification('Test case duplicated', 'success');
  }, [testCase.id, duplicateTestCase, showNotification]);

  const handleCopyDecision = useCallback(async () => {
    try {
      await BERTIntegrationService.copyDecisionToClipboard(testCase);
      showNotification('Decision copied to clipboard', 'success');
    } catch (error) {
      showNotification(
        `Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }, [testCase, showNotification]);

  // ========================================================================
  // Helper Functions
  // ========================================================================

  function getRecommendationColor(recommendation: Recommendation): string {
    switch (recommendation) {
      case Recommendation.AUTOMATE:
        return 'bg-green-100 text-green-800 border-green-300';
      case Recommendation.MAYBE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case Recommendation.DONT_AUTOMATE:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function getScoreColor(score: number, max: number): string {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 50) return 'bg-blue-50 text-blue-700';
    return 'bg-gray-50 text-gray-700';
  }

  // ========================================================================
  // Render
  // ========================================================================

  const hasErrors = validationWarnings.some(w => w.level === 'error');
  const hasWarnings = validationWarnings.some(w => w.level === 'warning');
  const rowClassName = testCase.isLegal ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50';

  return (
    <>
      <tr className={`${rowClassName} border-b border-gray-200 transition-colors`}>
        {/* Test Name - Responsive padding */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm relative min-w-[250px] max-w-[250px]">
          <textarea
            value={testCase.testName}
            onChange={handleTextChange('testName')}
            className={`px-2 py-1.5 sm:py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation resize-none ${
              hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter test name"
            rows={3}
            wrap="hard"
            style={{ 
              minHeight: '2.5rem', 
              width: '230px', 
              maxWidth: '230px', 
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflowWrap: 'anywhere'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <InlineValidation warnings={validationWarnings} field="testName" />
        </td>

        {/* Change Type - Touch-friendly select */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <select
            value={testCase.changeType}
            onChange={handleSelectChange('changeType')}
            className="w-full px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
          >
            <option value={ChangeType.NEW}>New</option>
            <option value={ChangeType.MODIFIED_BEHAVIOR}>Modified Behavior</option>
            <option value={ChangeType.MODIFIED_UI}>Modified UI</option>
            <option value={ChangeType.UNCHANGED}>Unchanged</option>
          </select>
        </td>

        {/* Implementation Type - Touch-friendly select */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <select
            value={testCase.implementationType}
            onChange={handleSelectChange('implementationType')}
            className="w-full px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
          >
            <option value={ImplementationType.LOOP_SAME}>Standard Components</option>
            <option value={ImplementationType.LOOP_DIFFERENT}>New Pattern</option>
            <option value={ImplementationType.CUSTOM}>Custom Implementation</option>
            <option value={ImplementationType.MIX}>Hybrid</option>
          </select>
        </td>

        {/* User Frequency - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.userFrequency}
            onChange={handleNumberChange('userFrequency', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Business Impact - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.businessImpact}
            onChange={handleNumberChange('businessImpact', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Affected Areas - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.affectedAreas}
            onChange={handleNumberChange('affectedAreas', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Legal Requirement - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-center">
          <input
            type="checkbox"
            checked={testCase.isLegal}
            onChange={handleCheckboxChange('isLegal')}
            className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 touch-manipulation"
          />
        </td>

        {/* Risk Score - Responsive padding */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 py-1 rounded text-center font-medium ${getScoreColor(testCase.scores.risk, 25)}`}>
            {testCase.scores.risk}
          </div>
        </td>

        {/* Value Score */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 py-1 rounded text-center font-medium ${getScoreColor(testCase.scores.value, 25)}`}>
            {testCase.scores.value}
          </div>
        </td>

        {/* Effort Score */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 py-1 rounded text-center font-medium ${getScoreColor(testCase.scores.effort ?? testCase.scores.ease ?? 0, 25)}`}>
            {testCase.scores.effort ?? testCase.scores.ease ?? 0}
          </div>
        </td>

        {/* History Score */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 py-1 rounded text-center font-medium ${getScoreColor(testCase.scores.history, 5)}`}>
            {testCase.scores.history}
          </div>
        </td>

        {/* Legal Score */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 py-1 rounded text-center font-medium ${getScoreColor(testCase.scores.legal, 20)}`}>
            {testCase.scores.legal}
          </div>
        </td>

        {/* Total Score */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 sm:px-3 py-1 rounded text-center font-bold ${getScoreColor(testCase.scores.total, 100)}`}>
            {testCase.scores.total}
          </div>
        </td>

        {/* Recommendation */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className={`px-2 sm:px-3 py-1 rounded border text-center font-semibold text-xs ${getRecommendationColor(testCase.recommendation)}`}>
            {testCase.recommendation}
          </div>
        </td>

        {/* Notes */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm min-w-[250px] max-w-[250px]">
          <textarea
            value={testCase.notes || ''}
            onChange={handleTextChange('notes')}
            className="px-2 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation resize-none"
            placeholder="Add notes..."
            rows={3}
            wrap="hard"
            style={{ 
              minHeight: '2.5rem', 
              width: '230px', 
              maxWidth: '230px', 
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflowWrap: 'anywhere'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </td>

        {/* Actions - Touch-friendly buttons */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Validation Indicator */}
            {validationWarnings.length > 0 && (
              <button
                onClick={() => setShowValidation(!showValidation)}
                className={`p-1.5 sm:p-1 rounded touch-manipulation ${
                  hasErrors ? 'text-red-600 hover:bg-red-50' : 
                  hasWarnings ? 'text-yellow-600 hover:bg-yellow-50' : 
                  'text-blue-600 hover:bg-blue-50'
                }`}
                title="Show validation warnings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            )}

            {/* Duplicate - Larger touch target */}
            <button
              onClick={handleDuplicate}
              className="p-1.5 sm:p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded touch-manipulation"
              title="Duplicate test case"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Copy Decision - Larger touch target */}
            <button
              onClick={handleCopyDecision}
              className="p-1.5 sm:p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded touch-manipulation"
              title="Copy decision to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            {/* Delete - Larger touch target */}
            <button
              onClick={handleDelete}
              className="p-1.5 sm:p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded touch-manipulation"
              title="Delete test case"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Validation Warnings Row */}
      {showValidation && validationWarnings.length > 0 && (
        <tr>
          <td colSpan={16} className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <ValidationDisplay warnings={validationWarnings} />
          </td>
        </tr>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <tr>
          <td colSpan={16} className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-800">
                Are you sure you want to delete "{testCase.testName}"?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Export memoized component for performance
export const TestCaseRow = memo(TestCaseRowComponent);
