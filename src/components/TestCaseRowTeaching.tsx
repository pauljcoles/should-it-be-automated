/**
 * TestCaseRowTeaching Component
 * Teaching Mode - Angie Jones' model + Legal + Org Pressure + Real Talk
 * Uses same 7 fields as Normal Mode with educational guidance
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context';
import type { TestCase } from '../types/models';
import { Recommendation } from '../types/models';
import { TeachingScoreCalculator } from '../services/TeachingScoreCalculator';
import {
  getImpactLabel,
  getProbabilityLabel,
  getDistinctnessLabel,
  getFixProbabilityLabel,
  getEaseLabel,
  getSpeedLabel,
  getSimilarityLabel,
  getBreakFrequencyLabel
} from '../utils/scaleLabels';

interface TestCaseRowTeachingProps {
  testCase: TestCase;
  isMobile?: boolean;
}

function TestCaseRowTeachingComponent({ testCase, isMobile = false }: TestCaseRowTeachingProps) {
  const { updateTestCase, deleteTestCase, duplicateTestCase, showNotification, uiState, setRowCollapsed } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRealTalk, setShowRealTalk] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const textareaRefMobile = useRef<HTMLTextAreaElement>(null);
  const textareaRefDesktop = useRef<HTMLTextAreaElement>(null);
  const rowRef = useRef<HTMLTableRowElement | HTMLDivElement>(null);
  
  // Use global collapsed state, default to true (collapsed) if not set
  const isCollapsed = uiState.collapsedRows[testCase.id] ?? true;

  // Auto-resize textarea when content changes
  useEffect(() => {
    const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto';
        const minHeight = 128; // min-h-32 = 128px
        textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + 'px';
      }
    };
    resizeTextarea(textareaRefMobile.current);
    resizeTextarea(textareaRefDesktop.current);
  }, [testCase.testName, isCollapsed]);

  // Calculate if Real Talk should be shown
  const baseTechnicalScore = TeachingScoreCalculator.calculateBaseTechnicalScore({
    risk: testCase.scores.risk ?? testCase.scores.customerRisk ?? 0,
    value: testCase.scores.value ?? testCase.scores.valueScore ?? 0,
    costEfficiency: testCase.scores.costEfficiency ?? testCase.scores.costScore ?? 0,
    history: testCase.scores.history ?? testCase.scores.historyScore ?? 0
  });
  const shouldShowRealTalk = TeachingScoreCalculator.shouldShowRealTalk(
    baseTechnicalScore,
    testCase.organisationalPressure ?? 1
  );
  const realTalkContent = TeachingScoreCalculator.getRealTalkContent(
    baseTechnicalScore,
    testCase.organisationalPressure ?? 1,
    testCase.isLegal ?? false
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

  const handleToggleCollapse = useCallback((collapsed: boolean) => {
    setRowCollapsed(testCase.id, collapsed);
    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), 600);
    
    // Scroll to make row visible when expanding, with offset for sticky header
    if (!collapsed) {
      setTimeout(() => {
        if (rowRef.current) {
          const element = rowRef.current;
          const rect = element.getBoundingClientRect();
          const offset = 80; // Account for sticky header
          
          // Only scroll if the row is not fully visible
          if (rect.top < offset || rect.bottom > window.innerHeight) {
            window.scrollBy({
              top: rect.top - offset,
              behavior: 'smooth'
            });
          }
        }
      }, 50);
    }
  }, [testCase.id, setRowCollapsed]);

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

  function getRecommendationLabel(recommendation: Recommendation): string {
    switch (recommendation) {
      case Recommendation.AUTOMATE:
        return 'Automate';
      case Recommendation.MAYBE:
        return 'Maybe';
      case Recommendation.DONT_AUTOMATE:
        return 'Exploratory Testing';
      default:
        return 'Unknown';
    }
  }

  function getScoreColor(score: number, max: number): string {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-sky-100 text-sky-700';
    if (percentage >= 50) return 'bg-sky-50 text-sky-600';
    return 'bg-slate-100 text-slate-600';
  }

  // ========================================================================
  // Render - Mobile Card View
  // ========================================================================

  if (isMobile) {
    // Collapsed mobile view
    if (isCollapsed) {
      return (
        <div 
          onClick={() => handleToggleCollapse(false)}
          className={`border border-slate-300 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${isHighlighted ? 'bg-blue-100' : testCase.isDescoped ? 'bg-gray-100 opacity-60' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCollapse(false);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              title="Expand"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`flex-1 font-semibold text-gray-700 truncate text-sm ${testCase.isDescoped ? 'line-through' : ''}`}>
              {testCase.testName || 'Untitled Test'}
            </div>
            <div className="flex items-center gap-1.5">
              {testCase.isDescoped && (
                <div className="flex items-center justify-center w-6 h-6 bg-gray-200 border border-gray-400 rounded" title="Descoped">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
              {testCase.isScored && (
                <div className="flex items-center justify-center w-6 h-6 bg-green-100 border border-green-300 rounded" title="Scored">
                  <svg className="w-3.5 h-3.5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(testCase.scores.total, 100)}`}>
                {testCase.scores.total}
              </div>
              <div className={`px-2 py-1 rounded border text-xs font-bold ${getRecommendationColor(testCase.recommendation)}`}>
                {getRecommendationLabel(testCase.recommendation)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Expanded mobile view
    return (
      <div ref={rowRef as React.RefObject<HTMLDivElement>} className={`border border-slate-300 rounded-lg p-3 space-y-3 shadow-sm ${isHighlighted ? 'bg-blue-100' : testCase.isDescoped ? 'bg-gray-100 opacity-75' : 'bg-white'}`}>
        {/* Test Name with Collapse and Actions Menu */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 flex-1">
            <button
              onClick={() => handleToggleCollapse(true)}
              className="p-1 mt-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              title="Collapse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <textarea
              ref={textareaRefMobile}
              value={testCase.testName}
              onChange={handleTextChange('testName')}
              className="flex-1 min-w-0 px-3 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white resize-none"
              placeholder="Test name"
              rows={1}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)} 
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMobileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-300 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleDuplicate();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2 border-b border-slate-200"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gut Feel */}
        <div>
          <div className="text-sm font-medium text-slate-600 mb-1">Gut Feel: {testCase.gutFeel ?? 3}</div>
          <input
            type="range"
            min="1"
            max="5"
            value={testCase.gutFeel ?? 3}
            onChange={handleNumberChange('gutFeel', 1, 5)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-500 italic text-center mt-0.5">
            {testCase.gutFeel === 5 ? 'Definitely' :
             testCase.gutFeel === 4 ? 'Probably' :
             testCase.gutFeel === 3 ? 'Unsure' :
             testCase.gutFeel === 2 ? 'Probably Skip' :
             'Definitely Skip'}
          </div>
        </div>

        {/* Customer Risk */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Customer Risk (max 25)</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Impact: {testCase.impact ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.impact ?? 3}
                onChange={handleNumberChange('impact', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getImpactLabel(testCase.impact ?? 3)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Probability of Use: {testCase.probOfUse ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.probOfUse ?? 3}
                onChange={handleNumberChange('probOfUse', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getProbabilityLabel(testCase.probOfUse ?? 3)}</div>
            </div>
          </div>
        </div>

        {/* Value of Test */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Value of Test (max 25)</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Distinctness: {testCase.distinctness ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.distinctness ?? 3}
                onChange={handleNumberChange('distinctness', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getDistinctnessLabel(testCase.distinctness ?? 3)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Induction to Action: {testCase.fixProbability ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.fixProbability ?? 3}
                onChange={handleNumberChange('fixProbability', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getFixProbabilityLabel(testCase.fixProbability ?? 3)}</div>
            </div>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Cost Efficiency (max 25)</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Easy to write: {testCase.easyToWrite ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.easyToWrite ?? 3}
                onChange={handleNumberChange('easyToWrite', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getEaseLabel(testCase.easyToWrite ?? 3)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Quick to write: {testCase.quickToWrite ?? 3}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.quickToWrite ?? 3}
                onChange={handleNumberChange('quickToWrite', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getSpeedLabel(testCase.quickToWrite ?? 3)}</div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">History (max 5)</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Bug count: {testCase.similarity ?? 1}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.similarity ?? 1}
                onChange={handleNumberChange('similarity', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getSimilarityLabel(testCase.similarity ?? 1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Affected areas: {testCase.breakFreq ?? 1}</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.breakFreq ?? 1}
                onChange={handleNumberChange('breakFreq', 1, 5)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-slate-500 italic text-center mt-0.5">{getBreakFrequencyLabel(testCase.breakFreq ?? 1)}</div>
            </div>
          </div>
        </div>

        {/* Legal Requirement */}
        <div className="border-t pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={testCase.isLegal ?? false}
              onChange={handleCheckboxChange('isLegal')}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded"
            />
            <span className="text-sm font-medium text-slate-700">
              ☑ Legal Requirement (+20 points)
            </span>
          </label>
        </div>

        {/* Organizational Pressure */}
        <div className="border-t pt-2">
          <div className="text-sm font-medium text-slate-700 mb-1">Organizational Pressure</div>
          <div className="text-xs text-slate-600 mb-2">How much pressure to show test coverage?</div>
          <input
            type="range"
            min="1"
            max="5"
            value={testCase.organisationalPressure ?? 1}
            onChange={handleNumberChange('organisationalPressure', 1, 5)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-600 text-center mt-1">
            {testCase.organisationalPressure === 1 ? 'No pressure' :
             testCase.organisationalPressure === 2 ? 'Slight pressure' :
             testCase.organisationalPressure === 3 ? 'Moderate pressure' :
             testCase.organisationalPressure === 4 ? 'High pressure' :
             'Must show coverage'}
          </div>
        </div>

        {/* Final Score and Recommendation */}
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200">
          <div className="text-center">
            <div className="text-xs text-slate-500 font-medium mb-0.5">Total Score</div>
            <div className={`px-3 py-1 rounded-md font-bold text-lg ${getScoreColor(testCase.scores.total, 120)}`}>
              {testCase.scores.total}/120
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              (Base: {baseTechnicalScore}/100 + Legal: {testCase.scores.legal ?? 0}/20)
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testCase.isScored ?? false}
                onChange={handleCheckboxChange('isScored')}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-gray-700">Scored</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testCase.isDescoped ?? false}
                onChange={handleCheckboxChange('isDescoped')}
                className="w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <span className="text-sm font-semibold text-gray-700">Descope</span>
            </label>
            <div className={`px-4 py-2 rounded-md border font-bold text-sm ${getRecommendationColor(testCase.recommendation)}`}>
              {getRecommendationLabel(testCase.recommendation)}
            </div>
          </div>
        </div>

        {/* Real Talk Section */}
        {shouldShowRealTalk && (
          <div className="border-t pt-2">
            <button
              onClick={() => setShowRealTalk(!showRealTalk)}
              className="w-full flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
            >
              <span className="text-sm font-semibold text-amber-800">{realTalkContent.title}</span>
              <svg
                className={`w-4 h-4 text-amber-600 transition-transform ${showRealTalk ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRealTalk && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md space-y-3">
                <p className="text-sm text-amber-900">{realTalkContent.message}</p>
                
                {/* Coverage Duvet Teaching */}
                <div className="border-t border-amber-300 pt-3">
                  <div className="text-sm font-semibold text-amber-900 mb-2">📚 The Coverage Duvet</div>
                  <p className="text-sm text-amber-800 mb-2">
                    High test coverage doesn't equal effective testing. It's like a duvet that looks warm but has holes - 
                    you might have 90% coverage but miss the critical 10% that matters.
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Focus on:</strong> Tests that catch real bugs, not tests that make the coverage number go up.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border-2 border-red-300">
              <p className="text-base text-red-700 font-bold mb-4">Delete "{testCase.testName}"?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={cancelDelete} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================================
  // Render - Desktop Table Row (single row with grid layout + expandable Real Talk)
  // ========================================================================

  // Collapsed view - just show test name and key scores
  if (isCollapsed) {
    return (
      <>
        <tr className={`border-b transition-all ${isHighlighted ? 'bg-blue-100' : testCase.isDescoped ? 'bg-gray-100 opacity-60 hover:bg-gray-200' : 'bg-white hover:bg-gray-50'}`}>
          {/* Test Name with Expand Button */}
          <td className="px-3 py-3 border-r border-slate-300" colSpan={2}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleCollapse(false)}
                className="p-1 hover:bg-gray-200 rounded border transition-all"
                title="Expand row"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {testCase.isDescoped && (
                <div className="flex items-center justify-center w-6 h-6 bg-gray-200 border border-gray-400 rounded" title="Descoped">
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
              {testCase.isScored && (
                <div className="flex items-center justify-center w-6 h-6 bg-green-100 border border-green-300 rounded" title="Scored">
                  <svg className="w-3.5 h-3.5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className={`font-semibold text-gray-700 ${testCase.isDescoped ? 'line-through' : ''}`}>{testCase.testName || 'Untitled Test'}</span>
            </div>
          </td>

          {/* Quick Scores Summary */}
          <td className="px-3 py-3 border-r border-slate-300" colSpan={4}>
            <div className="flex items-center gap-3 justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Customer</div>
                <div className={`px-2 py-0.5 rounded border text-sm font-bold ${getScoreColor(testCase.scores.customerRisk ?? 0, 25)}`}>
                  {testCase.scores.customerRisk ?? 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Value</div>
                <div className={`px-2 py-0.5 rounded border text-sm font-bold ${getScoreColor(testCase.scores.valueScore ?? 0, 25)}`}>
                  {testCase.scores.valueScore ?? 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Cost</div>
                <div className={`px-2 py-0.5 rounded border text-sm font-bold ${getScoreColor(testCase.scores.costScore ?? 0, 25)}`}>
                  {testCase.scores.costScore ?? 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">History</div>
                <div className={`px-2 py-0.5 rounded border text-sm font-bold ${getScoreColor(testCase.scores.historyScore ?? 0, 5)}`}>
                  {testCase.scores.historyScore ?? 0}
                </div>
              </div>
            </div>
          </td>

          {/* Legal & Org Pressure */}
          <td className="px-3 py-3 text-center border-r border-slate-300">
            <div className="flex items-center justify-center gap-2">
              {testCase.isLegal && <span className="text-xs font-bold text-blue-600">⚖️ Legal</span>}
              <span className="text-xs text-gray-600">Org: {testCase.organisationalPressure ?? 1}</span>
            </div>
          </td>

          {/* Total Score */}
          <td className="px-3 py-3 text-center border-r border-slate-300">
            <div className={`px-3 py-1 rounded-lg border-2 shadow-md font-bold text-xl hover:scale-105 transition-transform ${getScoreColor(testCase.scores.total, 100)}`}>
              {testCase.scores.total}
            </div>
          </td>

          {/* Recommendation */}
          <td className="px-3 py-3 text-center border-r border-slate-300">
            <div className={`px-3 py-1 rounded-lg border-2 shadow-md font-bold text-sm hover:scale-105 transition-transform ${getRecommendationColor(testCase.recommendation)}`}>
              {getRecommendationLabel(testCase.recommendation)}
            </div>
          </td>

          {/* Actions */}
          <td className="px-3 py-3 relative">
            <div className="flex gap-1 justify-center">
              <button
                onClick={handleDuplicate}
                className="p-1 text-blue-500 hover:bg-blue-100 rounded border-2 border-blue-500 hover:shadow-sm transition-all"
                title="Duplicate"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-500 hover:bg-red-100 rounded border-2 border-red-500 hover:shadow-sm transition-all"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr ref={rowRef as React.RefObject<HTMLTableRowElement>} className={`border-b border-slate-300 transition-all hover:shadow-sm ${isHighlighted ? 'bg-blue-100' : testCase.isDescoped ? 'bg-gray-100 opacity-75 hover:bg-gray-200' : 'bg-white hover:bg-gray-50'}`}>
          {/* Test Name with Collapse Button */}
        <td className="px-3 py-3 border-r border-slate-300 w-64">
          <div className="flex items-start gap-2">
            <button
              onClick={() => handleToggleCollapse(true)}
              className="p-1 mt-1 hover:bg-gray-200 rounded border transition-all flex-shrink-0"
              title="Collapse row"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <textarea
              ref={textareaRefDesktop}
              value={testCase.testName}
              onChange={handleTextChange('testName')}
              className={`w-full max-w-[200px] min-h-32 px-2 py-1.5 text-base border rounded-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all resize-none ${testCase.isDescoped ? 'line-through' : ''}`}
              placeholder="Test name"
              rows={6}
            />
          </div>
        </td>

        {/* Toggle Buttons Column */}
        <td className="px-3 py-3 border-r border-slate-300 w-32 max-w-[8rem]">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            {/* Scored Toggle */}
            <button
              onClick={() => handleFieldChange('isScored', !testCase.isScored)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 shadow-sm hover:shadow-md ${
                testCase.isScored 
                  ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' 
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
              title={testCase.isScored ? 'Mark as unscored' : 'Mark as scored'}
            >
              {testCase.isScored ? '✓ Scored' : 'Unscored'}
            </button>

            {/* Descoped Toggle */}
            <button
              onClick={() => handleFieldChange('isDescoped', !testCase.isDescoped)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 shadow-sm hover:shadow-md ${
                testCase.isDescoped 
                  ? 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500' 
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
              title={testCase.isDescoped ? 'Mark as in scope' : 'Mark as descoped'}
            >
              {testCase.isDescoped ? 'Descoped' : 'In Scope'}
            </button>
          </div>
        </td>

        {/* Gut Feel */}
        <td className="px-3 py-3 border-r border-slate-300 w-40 max-w-[10rem]">
          <div className="border-2 border-slate-200 rounded-lg p-2 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all h-full flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-700 mb-1 text-center border-b-2 border-slate-300 pb-0.5">
              GUT FEEL
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={testCase.gutFeel ?? 3}
              onChange={handleNumberChange('gutFeel', 1, 5)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-1"
            />
            <span className="text-xs font-bold text-gray-700 text-center">
              {testCase.gutFeel === 5 ? 'Definitely' :
               testCase.gutFeel === 4 ? 'Probably' :
               testCase.gutFeel === 3 ? 'Unsure' :
               testCase.gutFeel === 2 ? 'Probably Skip' :
               'Definitely Skip'}
            </span>
          </div>
        </td>

        {/* 2x2 Grid of Categories */}
        <td className="px-3 py-3 border-r border-slate-300" colSpan={4}>
          <div className="grid grid-cols-2 gap-3">
            {/* Customer Risk */}
            <div className="border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="text-base font-bold text-slate-700 mb-2 text-center border-b-2 border-slate-300 pb-1">
                Customer Risk (25)
              </div>
              <div className="space-y-2">
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Impact: {testCase.impact ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getImpactLabel(testCase.impact ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.impact ?? 3}
                    onChange={handleNumberChange('impact', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Probability of Use: {testCase.probOfUse ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getProbabilityLabel(testCase.probOfUse ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.probOfUse ?? 3}
                    onChange={handleNumberChange('probOfUse', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className={`text-lg font-bold text-center mt-2 px-2 py-1 rounded-lg border-2 shadow-md ${getScoreColor(testCase.scores.customerRisk ?? 0, 25)}`}>
                  Score: {testCase.scores.customerRisk ?? 0}/25
                </div>
              </div>
            </div>

            {/* Value of Test */}
            <div className="border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="text-base font-bold text-slate-700 mb-2 text-center border-b-2 border-slate-300 pb-1">
                Value of Test (25)
              </div>
              <div className="space-y-2">
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Distinctness: {testCase.distinctness ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getDistinctnessLabel(testCase.distinctness ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.distinctness ?? 3}
                    onChange={handleNumberChange('distinctness', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Induction to Action: {testCase.fixProbability ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getFixProbabilityLabel(testCase.fixProbability ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.fixProbability ?? 3}
                    onChange={handleNumberChange('fixProbability', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className={`text-lg font-bold text-center mt-2 px-2 py-1 rounded-lg border-2 shadow-md ${getScoreColor(testCase.scores.valueScore ?? 0, 25)}`}>
                  Score: {testCase.scores.valueScore ?? 0}/25
                </div>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className="border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="text-base font-bold text-slate-700 mb-2 text-center border-b-2 border-slate-300 pb-1">
                Cost Efficiency (25)
              </div>
              <div className="space-y-2">
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Easy to write: {testCase.easyToWrite ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getEaseLabel(testCase.easyToWrite ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.easyToWrite ?? 3}
                    onChange={handleNumberChange('easyToWrite', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Quick to write: {testCase.quickToWrite ?? 3}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getSpeedLabel(testCase.quickToWrite ?? 3)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.quickToWrite ?? 3}
                    onChange={handleNumberChange('quickToWrite', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className={`text-lg font-bold text-center mt-2 px-2 py-1 rounded-lg border-2 shadow-md ${getScoreColor(testCase.scores.costScore ?? 0, 25)}`}>
                  Score: {testCase.scores.costScore ?? 0}/25
                </div>
              </div>
            </div>

            {/* History */}
            <div className="border-2 border-slate-200 rounded-lg p-3 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="text-base font-bold text-slate-700 mb-2 text-center border-b-2 border-slate-300 pb-1">
                History (5)
              </div>
              <div className="space-y-2">
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Bug count: {testCase.similarity ?? 1}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getSimilarityLabel(testCase.similarity ?? 1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.similarity ?? 1}
                    onChange={handleNumberChange('similarity', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <span className="text-base text-gray-700 font-semibold">Affected areas: {testCase.breakFreq ?? 1}</span>
                    <span className="text-xs text-gray-500 italic text-right max-w-[180px] break-words">{getBreakFrequencyLabel(testCase.breakFreq ?? 1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={testCase.breakFreq ?? 1}
                    onChange={handleNumberChange('breakFreq', 1, 5)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className={`text-lg font-bold text-center mt-2 px-2 py-1 rounded-lg border-2 shadow-md ${getScoreColor(testCase.scores.historyScore ?? 0, 5)}`}>
                  Score: {testCase.scores.historyScore ?? 0}/5 (MAX)
                </div>
              </div>
            </div>
          </div>
        </td>

        {/* Legal Requirement & Org Pressure Column */}
        <td className="px-3 py-3 border-r border-slate-300">
          <div className="space-y-3">
            {/* Legal Requirement */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testCase.isLegal ?? false}
                onChange={handleCheckboxChange('isLegal')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-bold text-gray-700">
                Legal (+20)
              </span>
            </label>

            {/* Organizational Pressure */}
            <div>
              <div className="text-xs font-bold text-gray-700 mb-1">Org Pressure</div>
              <input
                type="range"
                min="1"
                max="5"
                value={testCase.organisationalPressure ?? 1}
                onChange={handleNumberChange('organisationalPressure', 1, 5)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-xs text-gray-600 text-center mt-1 font-semibold">
                {testCase.organisationalPressure === 1 ? 'None' :
                 testCase.organisationalPressure === 2 ? 'Slight' :
                 testCase.organisationalPressure === 3 ? 'Moderate' :
                 testCase.organisationalPressure === 4 ? 'High' :
                 'Must show'}
              </div>
            </div>
          </div>
        </td>

        {/* Total Score */}
        <td className="px-3 py-3 text-center border-r border-slate-300">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-slate-600 font-semibold">Total</span>
            <div className={`px-4 py-2 rounded-lg border-2 shadow-lg font-bold text-2xl ${getScoreColor(testCase.scores.total, 100)}`}>
              {testCase.scores.total}/100
            </div>
            <span className="text-xs text-gray-500">
              ({baseTechnicalScore}/80 + {testCase.scores.legal ?? 0}/20)
            </span>
          </div>
        </td>

        {/* Recommendation */}
        <td className="px-3 py-3 text-center border-r border-slate-300">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-slate-600 font-semibold">Recommendation</span>
            <div className={`px-4 py-2 rounded-lg border-2 shadow-lg font-bold text-base ${getRecommendationColor(testCase.recommendation)}`}>
              {getRecommendationLabel(testCase.recommendation)}
            </div>
          </div>
        </td>

        {/* Actions */}
        <td className="px-3 py-3 relative">
          <div className="flex gap-1 justify-center">
              <button
                onClick={handleDuplicate}
                className="p-1 text-blue-500 hover:bg-blue-100 rounded border-2 border-blue-500 hover:shadow-sm transition-all"
                title="Duplicate"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-500 hover:bg-red-100 rounded border-2 border-red-500 hover:shadow-sm transition-all"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
          </div>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full border-2 border-red-300">
                <p className="text-sm text-red-700 font-bold mb-4">Delete "{testCase.testName}"?</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={cancelDelete} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                  <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold">Delete</button>
                </div>
              </div>
            </div>
          )}
        </td>
      </tr>

      {/* Real Talk Expandable Row */}
      {shouldShowRealTalk && (
        <tr className="bg-amber-50 border-b border-slate-300">
          <td colSpan={8} className="px-3 py-2">
            <button
              onClick={() => setShowRealTalk(!showRealTalk)}
              className="w-full flex items-center justify-between p-2 hover:bg-amber-100 rounded border-2 border-amber-600 hover:shadow-sm transition-all"
            >
              <span className="text-sm font-semibold text-amber-800">{realTalkContent.title}</span>
              <svg
                className={`w-4 h-4 text-amber-600 transition-transform ${showRealTalk ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRealTalk && (
              <div className="mt-2 p-3 bg-white border rounded-lg rounded shadow-sm space-y-3">
                <p className="text-sm text-amber-900 font-semibold">{realTalkContent.message}</p>
                
                {/* Coverage Duvet Teaching */}
                <div className="border-t-4 border-amber-600 pt-3">
                  <div className="text-sm font-semibold text-amber-900 mb-2">📚 The Coverage Duvet</div>
                  <p className="text-sm text-amber-800 mb-2">
                    High test coverage doesn't equal effective testing. It's like a duvet that looks warm but has holes - 
                    you might have 90% coverage but miss the critical 10% that matters.
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Focus on:</strong> Tests that catch real bugs, not tests that make the coverage number go up.
                  </p>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export const TestCaseRowTeaching = memo(TestCaseRowTeachingComponent);
