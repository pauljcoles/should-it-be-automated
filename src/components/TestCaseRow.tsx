/**
 * TestCaseRow Component
 * Represents a single test case row with inline editing capabilities
 * Optimized with React.memo for performance
 */

import { memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context';
import type { TestCase } from '../types/models';
import { CodeChange, Recommendation, InitialJudgment } from '../types/models';
import { BERTIntegrationService } from '../services/BERTIntegrationService';
import { ValidationService } from '../services/ValidationService';
import { ValidationDisplay, InlineValidation } from './ValidationDisplay';

interface TestCaseRowProps {
  testCase: TestCase;
  isMobile?: boolean;
}

function TestCaseRowComponent({ testCase, isMobile = false }: TestCaseRowProps) {
  const { updateTestCase, deleteTestCase, duplicateTestCase, showNotification, userPreferences } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const textareaRefMobile = useRef<HTMLTextAreaElement>(null);
  const textareaRefDesktop = useRef<HTMLTextAreaElement>(null);

  // Get validation warnings for this test case
  const validationWarnings = useMemo(() => 
    ValidationService.getValidationWarnings(testCase),
    [testCase]
  );

  // Auto-resize textarea when content changes
  useEffect(() => {
    const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    };
    resizeTextarea(textareaRefMobile.current);
    resizeTextarea(textareaRefDesktop.current);
  }, [testCase.testName]);

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
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case Recommendation.MAYBE:
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case Recommendation.DONT_AUTOMATE:
        return 'bg-rose-100 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  function getInitialJudgmentLabel(judgment?: InitialJudgment): string {
    if (!judgment) return 'Not set';
    switch (judgment) {
      case InitialJudgment.DEFINITELY_AUTOMATE:
        return 'Definitely Automate';
      case InitialJudgment.PROBABLY_AUTOMATE:
        return 'Probably Automate';
      case InitialJudgment.UNSURE:
        return 'Unsure';
      case InitialJudgment.PROBABLY_SKIP:
        return 'Probably Skip';
      case InitialJudgment.DEFINITELY_SKIP:
        return 'Definitely Skip';
      default:
        return 'Not set';
    }
  }

  function doesJudgmentMatchRecommendation(judgment?: InitialJudgment, recommendation?: Recommendation): boolean {
    if (!judgment) return true; // No judgment means no mismatch
    
    const automateJudgments: InitialJudgment[] = [InitialJudgment.DEFINITELY_AUTOMATE, InitialJudgment.PROBABLY_AUTOMATE];
    const skipJudgments: InitialJudgment[] = [InitialJudgment.DEFINITELY_SKIP, InitialJudgment.PROBABLY_SKIP];
    
    if (recommendation === Recommendation.AUTOMATE && automateJudgments.includes(judgment)) return true;
    if (recommendation === Recommendation.DONT_AUTOMATE && skipJudgments.includes(judgment)) return true;
    if (recommendation === Recommendation.MAYBE && judgment === InitialJudgment.UNSURE) return true;
    
    return false;
  }

  function getJudgmentMismatchExplanation(judgment?: InitialJudgment, recommendation?: Recommendation): string {
    if (!judgment || doesJudgmentMatchRecommendation(judgment, recommendation)) return '';
    
    const judgmentLabel = getInitialJudgmentLabel(judgment);
    return `Your gut feel was "${judgmentLabel}" but the calculated recommendation is "${recommendation}". This could indicate: ${
      recommendation === Recommendation.AUTOMATE 
        ? 'the test has higher value than initially perceived (consider risk factors and business impact)' 
        : recommendation === Recommendation.DONT_AUTOMATE
        ? 'the test has lower value than initially perceived (consider implementation complexity and frequency)'
        : 'the test falls in a gray area where additional context is needed'
    }`;
  }

  function getScoreColor(score: number, max: number): string {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-sky-100 text-sky-700';
    if (percentage >= 50) return 'bg-sky-50 text-sky-600';
    return 'bg-slate-100 text-slate-600';
  }

  // ========================================================================
  // Render
  // ========================================================================

  const hasErrors = validationWarnings.some(w => w.level === 'error');
  const hasWarnings = validationWarnings.some(w => w.level === 'warning');
  const rowClassName = testCase.isLegal ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50';

  // Mobile card view
  if (isMobile) {
    return (
      <div className={`${testCase.isLegal ? 'bg-amber-50' : 'bg-slate-50'} border border-slate-300 rounded-lg p-3 space-y-3 shadow-sm`}>
        <div className="flex justify-between items-start gap-2">
          <textarea
            ref={textareaRefMobile}
            value={testCase.testName}
            onChange={handleTextChange('testName')}
            className={`flex-1 px-3 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white resize-none overflow-hidden break-words ${
              hasErrors ? 'border-red-400 bg-red-50' : ''
            }`}
            placeholder="Test name"
            rows={1}
          />
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Initial Judgment (Gut Feel) - MOVED TO TOP OF MOBILE CARD */}
        {userPreferences.showInitialJudgment && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600">Initial Judgment (Gut Feel)</div>
            <select
              value={testCase.initialJudgment || ''}
              onChange={handleSelectChange('initialJudgment')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Not set</option>
              <option value={InitialJudgment.DEFINITELY_AUTOMATE}>✓✓ Definitely Automate</option>
              <option value={InitialJudgment.PROBABLY_AUTOMATE}>✓ Probably Automate</option>
              <option value={InitialJudgment.UNSURE}>? Unsure</option>
              <option value={InitialJudgment.PROBABLY_SKIP}>✗ Probably Skip</option>
              <option value={InitialJudgment.DEFINITELY_SKIP}>✗✗ Definitely Skip</option>
            </select>
            {testCase.initialJudgment && !doesJudgmentMatchRecommendation(testCase.initialJudgment, testCase.recommendation) && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                <div className="flex items-start gap-1">
                  <span>⚠️</span>
                  <span>{getJudgmentMismatchExplanation(testCase.initialJudgment, testCase.recommendation)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="text-base font-medium text-slate-600 mb-1">Did Code Change?</div>
            <select
              value={testCase.codeChange}
              onChange={handleSelectChange('codeChange')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={CodeChange.NEW}>Yes - New (never existed before)</option>
              <option value={CodeChange.MODIFIED}>Yes - Modified (behaviour/logic changed)</option>
              <option value={CodeChange.UI_ONLY}>Yes - UI only (styling/layout changed)</option>
              <option value={CodeChange.UNCHANGED}>No - Unchanged (works the same way)</option>
            </select>
            <div className="text-sm text-blue-600 mt-1">
              💡 If unchanged, you probably don't need to test it again!
            </div>
            {testCase.codeChange === CodeChange.UNCHANGED && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <div className="font-semibold mb-1">⚠️ UNCHANGED CODE DETECTED</div>
                <div className="space-y-1">
                  <div>This functionality hasn't changed. Consider:</div>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Do existing tests already cover this?</li>
                    <li>Is this truly NEW risk?</li>
                    <li>Are you duplicating coverage unnecessarily?</li>
                  </ul>
                  <div className="mt-1 italic">
                    💡 Risk-based testing means: Test what CHANGED, not what's reachable via a new route.
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="text-base font-medium text-slate-600 mb-1">Easy to Automate?</div>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.easyToAutomate ?? 3}
                onChange={handleNumberChange('easyToAutomate', 1, 5)}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="w-6 text-center font-medium text-slate-700 text-base">{testCase.easyToAutomate ?? 3}</span>
            </div>
            <span className="text-base text-slate-600 italic">
              {testCase.easyToAutomate === 1 ? 'Very difficult' :
               testCase.easyToAutomate === 2 ? 'Difficult' :
               testCase.easyToAutomate === 3 ? 'Moderate' :
               testCase.easyToAutomate === 4 ? 'Easy' : 'Very easy'}
            </span>
          </div>
          
          <div>
            <div className="text-base font-medium text-slate-600 mb-1">Quick to Automate?</div>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.quickToAutomate ?? 3}
                onChange={handleNumberChange('quickToAutomate', 1, 5)}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="w-6 text-center font-medium text-slate-700 text-base">{testCase.quickToAutomate ?? 3}</span>
            </div>
            <span className="text-base text-slate-600 italic">
              {testCase.quickToAutomate === 1 ? 'Very slow' :
               testCase.quickToAutomate === 2 ? 'Slow' :
               testCase.quickToAutomate === 3 ? 'Moderate' :
               testCase.quickToAutomate === 4 ? 'Fast' : 'Very fast'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Usage Freq</div>
            <input type="number" min="1" max="5" value={testCase.userFrequency} onChange={handleNumberChange('userFrequency', 1, 5)} className="w-full px-2 py-2 text-base border border-slate-300 rounded-md text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Impact if Broken</div>
            <input type="number" min="1" max="5" value={testCase.businessImpact} onChange={handleNumberChange('businessImpact', 1, 5)} className="w-full px-2 py-2 text-base border border-slate-300 rounded-md text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Connected</div>
            <input type="number" min="1" max="5" value={testCase.affectedAreas} onChange={handleNumberChange('affectedAreas', 1, 5)} className="w-full px-2 py-2 text-base border border-slate-300 rounded-md text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex flex-col items-center justify-end">
            <div className="text-xs font-medium text-slate-600 mb-1">Legal</div>
            <input type="checkbox" checked={testCase.isLegal} onChange={handleCheckboxChange('isLegal')} className="w-5 h-5 text-blue-500 border-slate-300 rounded" id={`legal-m-${testCase.id}`} />
          </div>
        </div>

        <div>
          <div className="text-base font-medium text-slate-600 mb-1">Organisational Pressure</div>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="range"
              min="1"
              max="5"
              value={testCase.organisationalPressure}
              onChange={handleNumberChange('organisationalPressure', 1, 5)}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              title="How much pressure is there to automate this?"
            />
            <span className="w-6 text-center font-medium text-slate-700 text-base">{testCase.organisationalPressure}</span>
          </div>
          <span className="text-sm text-slate-600 italic">
            {testCase.organisationalPressure === 1 ? 'No pressure, team decides' :
             testCase.organisationalPressure === 2 ? 'Low pressure' :
             testCase.organisationalPressure === 3 ? 'Some stakeholder anxiety' :
             testCase.organisationalPressure === 4 ? 'High pressure' :
             'Must show coverage'}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200">
          <div className="flex gap-2 text-xs">
            <div className="text-center">
              <div className="text-slate-500 font-medium mb-0.5">Risk</div>
              <div className={`px-2 py-1 rounded-md font-semibold ${getScoreColor(testCase.scores.risk, 25)}`}>{testCase.scores.risk}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 font-medium mb-0.5">Value</div>
              <div className={`px-2 py-1 rounded-md font-semibold ${getScoreColor(testCase.scores.value, 25)}`}>{testCase.scores.value}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 font-medium mb-0.5">Effort</div>
              <div className={`px-2 py-1 rounded-md font-semibold ${getScoreColor(testCase.scores.effort ?? testCase.scores.ease ?? 0, 25)}`}>{testCase.scores.effort ?? testCase.scores.ease ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 font-medium mb-0.5">Total</div>
              <div className={`px-2 py-1 rounded-md font-bold ${getScoreColor(testCase.scores.total, 100)}`}>{testCase.scores.total}</div>
            </div>
          </div>
          <div className={`px-3 py-2 rounded-md border font-bold text-sm ${getRecommendationColor(testCase.recommendation)}`}>
            {testCase.recommendation === Recommendation.AUTOMATE ? '✓ Auto' : 
             testCase.recommendation === Recommendation.DONT_AUTOMATE ? '✗ No' : '? Maybe'}
          </div>
        </div>

        <input
          type="text"
          value={testCase.notes || ''}
          onChange={handleTextChange('notes')}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Notes..."
        />

        {showDeleteConfirm && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-700 mb-2">Delete "{testCase.testName}"?</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={cancelDelete} className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop table row view - Split into two rows
  const judgmentMismatch = testCase.initialJudgment && !doesJudgmentMatchRecommendation(testCase.initialJudgment, testCase.recommendation);
  
  return (
    <>
      {/* First Row: Input fields */}
      <tr className={`${rowClassName} border-b-0 transition-colors`}>
        {/* Test Name - Responsive padding */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base relative">
          <textarea
            ref={textareaRefDesktop}
            value={testCase.testName}
            onChange={handleTextChange('testName')}
            className={`w-full px-2 py-1.5 sm:py-1 text-base border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation resize-none overflow-hidden break-words ${
              hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter test name"
            rows={1}
          />
          <InlineValidation warnings={validationWarnings} field="testName" />
        </td>

        {/* Initial Judgment (Gut Feel) - Conditionally shown - MOVED TO SECOND POSITION */}
        {userPreferences.showInitialJudgment && (
          <td className="px-2 sm:px-4 py-2 sm:py-3 text-base relative">
            <select
              value={testCase.initialJudgment || ''}
              onChange={handleSelectChange('initialJudgment')}
              className={`w-full px-2 py-1.5 sm:py-1 text-base border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation ${
                judgmentMismatch ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
              }`}
            >
              <option value="">Not set</option>
              <option value={InitialJudgment.DEFINITELY_AUTOMATE}>✓✓ Definitely</option>
              <option value={InitialJudgment.PROBABLY_AUTOMATE}>✓ Probably</option>
              <option value={InitialJudgment.UNSURE}>? Unsure</option>
              <option value={InitialJudgment.PROBABLY_SKIP}>✗ Probably Skip</option>
              <option value={InitialJudgment.DEFINITELY_SKIP}>✗✗ Definitely Skip</option>
            </select>
          </td>
        )}

        {/* Did Code Change? - Dropdown */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <select
            value={testCase.codeChange}
            onChange={handleSelectChange('codeChange')}
            className="w-full px-2 py-1.5 sm:py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            title="Did the code change?"
          >
            <option value={CodeChange.NEW}>Yes - New</option>
            <option value={CodeChange.MODIFIED}>Yes - Modified</option>
            <option value={CodeChange.UI_ONLY}>Yes - UI only</option>
            <option value={CodeChange.UNCHANGED}>No - Unchanged</option>
          </select>
          {testCase.codeChange === CodeChange.UNCHANGED && (
            <div className="text-xs text-amber-600 mt-1">
              ⚠️ Unchanged code - consider if testing is needed
            </div>
          )}
        </td>

        {/* Easy to Automate - Slider with descriptive text */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.easyToAutomate ?? 3}
                onChange={handleNumberChange('easyToAutomate', 1, 5)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title="How easy is it to automate?"
              />
              <span className="w-6 text-center font-medium text-gray-700 text-base">{testCase.easyToAutomate ?? 3}</span>
            </div>
            <span className="text-base text-gray-600 italic">
              {testCase.easyToAutomate === 1 ? 'Very difficult' :
               testCase.easyToAutomate === 2 ? 'Difficult' :
               testCase.easyToAutomate === 3 ? 'Moderate' :
               testCase.easyToAutomate === 4 ? 'Easy' : 'Very easy'}
            </span>
          </div>
        </td>

        {/* Quick to Automate - Slider with descriptive text */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.quickToAutomate ?? 3}
                onChange={handleNumberChange('quickToAutomate', 1, 5)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title="How quick is it to automate?"
              />
              <span className="w-6 text-center font-medium text-gray-700 text-base">{testCase.quickToAutomate ?? 3}</span>
            </div>
            <span className="text-base text-gray-600 italic">
              {testCase.quickToAutomate === 1 ? 'Very slow' :
               testCase.quickToAutomate === 2 ? 'Slow' :
               testCase.quickToAutomate === 3 ? 'Moderate' :
               testCase.quickToAutomate === 4 ? 'Fast' : 'Very fast'}
            </span>
          </div>
        </td>

        {/* User Frequency - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.userFrequency}
            onChange={handleNumberChange('userFrequency', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Business Impact - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.businessImpact}
            onChange={handleNumberChange('businessImpact', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Affected Areas - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <input
            type="number"
            min="1"
            max="5"
            value={testCase.affectedAreas}
            onChange={handleNumberChange('affectedAreas', 1, 5)}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center touch-manipulation"
          />
        </td>

        {/* Legal Requirement - Larger touch target */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base text-center">
          <input
            type="checkbox"
            checked={testCase.isLegal}
            onChange={handleCheckboxChange('isLegal')}
            className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 touch-manipulation"
          />
        </td>

        {/* Organisational Pressure - Slider */}
        <td className="px-2 sm:px-4 py-2 sm:py-3 text-base">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.organisationalPressure}
                onChange={handleNumberChange('organisationalPressure', 1, 5)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title="Organisational pressure to automate"
              />
              <span className="w-6 text-center font-medium text-gray-700 text-base">{testCase.organisationalPressure}</span>
            </div>
            <span className="text-xs text-gray-600 italic">
              {testCase.organisationalPressure === 1 ? 'No pressure' :
               testCase.organisationalPressure === 2 ? 'Low' :
               testCase.organisationalPressure === 3 ? 'Some anxiety' :
               testCase.organisationalPressure === 4 ? 'High' :
               'Must show coverage'}
            </span>
          </div>
        </td>
      </tr>

      {/* Second Row: Scores as labeled fields */}
      <tr className={`${rowClassName} border-b border-gray-200 transition-colors`}>
        <td colSpan={userPreferences.showInitialJudgment ? 10 : 9} className="px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Risk Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Risk:</span>
              <div className={`px-3 py-1 rounded text-center font-medium text-base ${getScoreColor(testCase.scores.risk, 25)}`}>
                {testCase.scores.risk}
              </div>
            </div>

            {/* Value Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Value:</span>
              <div className={`px-3 py-1 rounded text-center font-medium text-base ${getScoreColor(testCase.scores.value, 25)}`}>
                {testCase.scores.value}
              </div>
            </div>

            {/* Effort Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Effort:</span>
              <div className={`px-3 py-1 rounded text-center font-medium text-base ${getScoreColor(testCase.scores.effort ?? testCase.scores.ease ?? 0, 25)}`}>
                {testCase.scores.effort ?? testCase.scores.ease ?? 0}
              </div>
            </div>

            {/* History Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">History:</span>
              <div className={`px-3 py-1 rounded text-center font-medium text-base ${getScoreColor(testCase.scores.history, 5)}`}>
                {testCase.scores.history}
              </div>
            </div>

            {/* Legal Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Legal:</span>
              <div className={`px-3 py-1 rounded text-center font-medium text-base ${getScoreColor(testCase.scores.legal, 20)}`}>
                {testCase.scores.legal}
              </div>
            </div>

            {/* Total Score with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Total:</span>
              <div className={`px-3 py-1 rounded text-center font-bold text-base ${getScoreColor(testCase.scores.total, 100)}`}>
                {testCase.scores.total}
              </div>
            </div>

            {/* Recommendation with label */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-600 font-medium">Recommendation:</span>
              <div className={`px-3 py-1 rounded border text-center font-semibold text-base ${getRecommendationColor(testCase.recommendation)}`}>
                {testCase.recommendation}
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-base text-gray-600 font-medium">Notes:</span>
              <input
                type="text"
                value={testCase.notes || ''}
                onChange={handleTextChange('notes')}
                className="flex-1 px-2 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Add notes..."
              />
            </div>

            {/* Actions */}
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
          </div>
        </td>
      </tr>

      {/* Gut Feel Warning/Notes Row */}
      {judgmentMismatch && (
        <tr>
          <td colSpan={userPreferences.showInitialJudgment ? 10 : 9} className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <div className="flex items-start gap-2 text-base text-amber-800">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-semibold">Gut Feel Mismatch:</span> {getJudgmentMismatchExplanation(testCase.initialJudgment, testCase.recommendation)}
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Validation Warnings Row */}
      {showValidation && validationWarnings.length > 0 && (
        <tr>
          <td colSpan={userPreferences.showInitialJudgment ? 10 : 9} className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <ValidationDisplay warnings={validationWarnings} />
          </td>
        </tr>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <tr>
          <td colSpan={userPreferences.showInitialJudgment ? 10 : 9} className="px-4 py-2 bg-red-50 border-b border-red-200">
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
