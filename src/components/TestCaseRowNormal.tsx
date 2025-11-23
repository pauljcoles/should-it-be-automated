/**
 * TestCaseRowNormal Component
 * Angie Jones' exact model - Simple calculator, no teaching elements
 * Displays test case in Normal mode with 0-80 scoring scale
 */

import { memo, useCallback, useState } from 'react';
import { useAppContext } from '../context';
import type { TestCase } from '../types/models';
import { Recommendation } from '../types/models';
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

interface TestCaseRowNormalProps {
  testCase: TestCase;
  isMobile?: boolean;
}

function TestCaseRowNormalComponent({ testCase, isMobile = false }: TestCaseRowNormalProps) {
  const { updateTestCase, deleteTestCase, duplicateTestCase, showNotification } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    return (
      <div className="bg-white border border-slate-300 rounded-lg p-3 space-y-3 shadow-sm">
        {/* Test Name */}
        <div className="flex justify-between items-start gap-2">
          <input
            type="text"
            value={testCase.testName}
            onChange={handleTextChange('testName')}
            className="flex-1 px-3 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
            placeholder="Test name"
          />
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Gut Feel */}
        <div>
          <div className="text-sm font-medium text-slate-600 mb-1">Gut Feel</div>
          <input
            type="range"
            min="1"
            max="5"
            value={testCase.gutFeel ?? 3}
            onChange={handleNumberChange('gutFeel', 1, 5)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-600 text-center">{testCase.gutFeel ?? 3}</div>
        </div>

        {/* Customer Risk */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Customer Risk (max 25)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Impact</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.impact ?? 3}
                onChange={handleNumberChange('impact', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Prob of Use</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.probOfUse ?? 3}
                onChange={handleNumberChange('probOfUse', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-slate-500">Score: </span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getScoreColor(testCase.scores.customerRisk ?? 0, 25)}`}>
              {testCase.scores.customerRisk ?? 0}
            </span>
          </div>
        </div>

        {/* Value of Test */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Value of Test (max 25)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Distinctness</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.distinctness ?? 3}
                onChange={handleNumberChange('distinctness', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Fix Prob</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.fixProbability ?? 3}
                onChange={handleNumberChange('fixProbability', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-slate-500">Score: </span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getScoreColor(testCase.scores.valueScore ?? 0, 25)}`}>
              {testCase.scores.valueScore ?? 0}
            </span>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">Cost Efficiency (max 25)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Easy</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.easyToWrite ?? 3}
                onChange={handleNumberChange('easyToWrite', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Quick</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.quickToWrite ?? 3}
                onChange={handleNumberChange('quickToWrite', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-slate-500">Score: </span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getScoreColor(testCase.scores.costScore ?? 0, 25)}`}>
              {testCase.scores.costScore ?? 0}
            </span>
          </div>
        </div>

        {/* History */}
        <div className="border-t pt-2">
          <div className="text-sm font-semibold text-slate-700 mb-2">History (max 5)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-slate-600 mb-1">Similarity</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.similarity ?? 1}
                onChange={handleNumberChange('similarity', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Break Freq</div>
              <input
                type="number"
                min="1"
                max="5"
                value={testCase.breakFreq ?? 1}
                onChange={handleNumberChange('breakFreq', 1, 5)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-slate-500">Score: </span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getScoreColor(testCase.scores.historyScore ?? 0, 5)}`}>
              {testCase.scores.historyScore ?? 0}
            </span>
          </div>
        </div>

        {/* Final Score and Recommendation */}
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200">
          <div className="text-center">
            <div className="text-xs text-slate-500 font-medium mb-0.5">Total Score</div>
            <div className={`px-3 py-1 rounded-md font-bold text-lg ${getScoreColor(testCase.scores.total, 80)}`}>
              {testCase.scores.total}/80
            </div>
          </div>
          <div className={`px-4 py-2 rounded-md border font-bold text-sm ${getRecommendationColor(testCase.recommendation)}`}>
            {getRecommendationLabel(testCase.recommendation)}
          </div>
        </div>

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

  // ========================================================================
  // Render - Desktop Table Row (single row with grid layout)
  // ========================================================================

  // Collapsed view - just show test name and key scores
  if (isCollapsed) {
    return (
      <tr className="bg-white hover:bg-gray-50 border-b-4 border-black transition-all">
        {/* Test Name with Expand Button */}
        <td className="px-3 py-3 border-r-4 border-black" colSpan={2}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1 hover:bg-gray-200 rounded border-2 border-black transition-all"
              title="Expand row"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 truncate">{testCase.testName || 'Untitled Test'}</span>
          </div>
        </td>

        {/* Quick Scores Summary */}
        <td className="px-3 py-3 border-r-4 border-black" colSpan={4}>
          <div className="flex items-center gap-3 justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Customer</div>
              <div className={`px-2 py-0.5 rounded border-2 border-black text-sm font-bold ${getScoreColor(testCase.scores.customerRisk ?? 0, 25)}`}>
                {testCase.scores.customerRisk ?? 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Value</div>
              <div className={`px-2 py-0.5 rounded border-2 border-black text-sm font-bold ${getScoreColor(testCase.scores.valueScore ?? 0, 25)}`}>
                {testCase.scores.valueScore ?? 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Cost</div>
              <div className={`px-2 py-0.5 rounded border-2 border-black text-sm font-bold ${getScoreColor(testCase.scores.costScore ?? 0, 25)}`}>
                {testCase.scores.costScore ?? 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">History</div>
              <div className={`px-2 py-0.5 rounded border-2 border-black text-sm font-bold ${getScoreColor(testCase.scores.historyScore ?? 0, 5)}`}>
                {testCase.scores.historyScore ?? 0}
              </div>
            </div>
          </div>
        </td>

        {/* Total Score */}
        <td className="px-3 py-3 text-center border-r-4 border-black">
          <div className={`px-3 py-1 rounded border-brutal shadow-brutal font-black text-xl ${getScoreColor(testCase.scores.total, 80)}`}>
            {testCase.scores.total}
          </div>
        </td>

        {/* Recommendation */}
        <td className="px-3 py-3 text-center border-r-4 border-black">
          <div className={`px-3 py-1 rounded border-brutal shadow-brutal font-black text-sm ${getRecommendationColor(testCase.recommendation)}`}>
            {getRecommendationLabel(testCase.recommendation)}
          </div>
        </td>

        {/* Actions */}
        <td className="px-3 py-3 relative">
          <div className="flex gap-1 justify-center">
            <button
              onClick={handleDuplicate}
              className="p-1 text-blue-500 hover:bg-blue-100 rounded border-2 border-blue-500 hover:shadow-brutal transition-all"
              title="Duplicate"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:bg-red-100 rounded border-2 border-red-500 hover:shadow-brutal transition-all"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-white hover:bg-gray-50 border-b-4 border-black transition-all hover:shadow-brutal">
      {/* Test Name with Collapse Button */}
      <td className="px-3 py-3 border-r-4 border-black">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-200 rounded border-2 border-black transition-all flex-shrink-0"
            title="Collapse row"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <input
            type="text"
            value={testCase.testName}
            onChange={handleTextChange('testName')}
            className="flex-1 px-2 py-1.5 text-base border-brutal rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-brutal hover:shadow-brutal-lg transition-all"
            placeholder="Test name"
          />
        </div>
      </td>

      {/* Gut Feel */}
      <td className="px-3 py-3 border-r-4 border-black">
        <div className="flex flex-col gap-1">
          <span className="text-base text-gray-600 text-center font-bold">Gut Feel</span>
          <input
            type="range"
            min="1"
            max="5"
            value={testCase.gutFeel ?? 3}
            onChange={handleNumberChange('gutFeel', 1, 5)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-base font-bold text-gray-700 text-center leading-tight">
            {testCase.gutFeel === 5 ? 'Definitely' :
             testCase.gutFeel === 4 ? 'Probably' :
             testCase.gutFeel === 3 ? 'Unsure' :
             testCase.gutFeel === 2 ? 'Probably Skip' :
             'Definitely Skip'}
          </span>
        </div>
      </td>

      {/* 2x2 Grid of Categories */}
      <td className="px-3 py-3 border-r-4 border-black" colSpan={4}>
        <div className="grid grid-cols-2 gap-3">
          {/* Customer Risk */}
          <div className="border-brutal rounded-lg p-3 bg-gray-50 shadow-brutal hover:shadow-brutal-lg transition-all">
            <div className="text-base font-black text-gray-700 mb-2 text-center border-b-4 border-black pb-1">
              Customer Risk (25)
            </div>
            <div className="space-y-2">
              <div>
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Impact: {testCase.impact ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getImpactLabel(testCase.impact ?? 3)}</span>
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
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Prob of Use: {testCase.probOfUse ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getProbabilityLabel(testCase.probOfUse ?? 3)}</span>
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
              <div className={`text-lg font-black text-center mt-2 px-2 py-1 rounded border-brutal shadow-brutal ${getScoreColor(testCase.scores.customerRisk ?? 0, 25)}`}>
                Score: {testCase.scores.customerRisk ?? 0}/25
              </div>
            </div>
          </div>

          {/* Value of Test */}
          <div className="border-brutal rounded-lg p-3 bg-gray-50 shadow-brutal hover:shadow-brutal-lg transition-all">
            <div className="text-base font-black text-gray-700 mb-2 text-center border-b-4 border-black pb-1">
              Value of Test (25)
            </div>
            <div className="space-y-2">
              <div>
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Distinctness: {testCase.distinctness ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getDistinctnessLabel(testCase.distinctness ?? 3)}</span>
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
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Fix Prob: {testCase.fixProbability ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getFixProbabilityLabel(testCase.fixProbability ?? 3)}</span>
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
              <div className={`text-lg font-black text-center mt-2 px-2 py-1 rounded border-brutal shadow-brutal ${getScoreColor(testCase.scores.valueScore ?? 0, 25)}`}>
                Score: {testCase.scores.valueScore ?? 0}/25
              </div>
            </div>
          </div>

          {/* Cost Efficiency */}
          <div className="border-brutal rounded-lg p-3 bg-gray-50 shadow-brutal hover:shadow-brutal-lg transition-all">
            <div className="text-base font-black text-gray-700 mb-2 text-center border-b-4 border-black pb-1">
              Cost Efficiency (25)
            </div>
            <div className="space-y-2">
              <div>
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Easy: {testCase.easyToWrite ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getEaseLabel(testCase.easyToWrite ?? 3)}</span>
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
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Quick: {testCase.quickToWrite ?? 3}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getSpeedLabel(testCase.quickToWrite ?? 3)}</span>
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
              <div className={`text-lg font-black text-center mt-2 px-2 py-1 rounded border-brutal shadow-brutal ${getScoreColor(testCase.scores.costScore ?? 0, 25)}`}>
                Score: {testCase.scores.costScore ?? 0}/25
              </div>
            </div>
          </div>

          {/* History */}
          <div className="border-brutal rounded-lg p-3 bg-gray-50 shadow-brutal hover:shadow-brutal-lg transition-all">
            <div className="text-base font-black text-gray-700 mb-2 text-center border-b-4 border-black pb-1">
              History (5)
            </div>
            <div className="space-y-2">
              <div>
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Similarity: {testCase.similarity ?? 1}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getSimilarityLabel(testCase.similarity ?? 1)}</span>
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
                <div className="grid grid-cols-[1fr_220px] gap-2 items-center">
                  <span className="text-base text-gray-700 font-semibold">Break Freq: {testCase.breakFreq ?? 1}</span>
                  <span className="text-base text-gray-500 italic text-right truncate">{getBreakFrequencyLabel(testCase.breakFreq ?? 1)}</span>
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
              <div className={`text-lg font-black text-center mt-2 px-2 py-1 rounded border-brutal shadow-brutal ${getScoreColor(testCase.scores.historyScore ?? 0, 5)}`}>
                Score: {testCase.scores.historyScore ?? 0}/5 (MAX)
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Total Score */}
      <td className="px-3 py-3 text-center border-r-4 border-black">
        <div className="flex flex-col gap-1">
          <span className="text-base text-gray-700 font-black">Total</span>
          <div className={`px-3 py-2 rounded border-brutal shadow-brutal font-black text-2xl ${getScoreColor(testCase.scores.total, 80)}`}>
            {testCase.scores.total}
          </div>
          <span className="text-sm text-gray-600 font-bold">/80</span>
        </div>
      </td>

      {/* Recommendation */}
      <td className="px-3 py-3 text-center border-r-4 border-black">
        <div className={`px-3 py-2 rounded border-brutal shadow-brutal font-black text-base ${getRecommendationColor(testCase.recommendation)}`}>
          {getRecommendationLabel(testCase.recommendation)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 relative">
        <div className="flex gap-1 justify-center">
          <button
            onClick={handleDuplicate}
            className="p-1 text-blue-500 hover:bg-blue-100 rounded border-2 border-blue-500 hover:shadow-brutal transition-all"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:bg-red-100 rounded border-2 border-red-500 hover:shadow-brutal transition-all"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {showDeleteConfirm && (
          <div className="absolute z-10 mt-1 p-2 bg-white border-brutal rounded shadow-brutal-lg right-0">
            <p className="text-xs text-red-700 font-bold mb-2">Delete?</p>
            <div className="flex gap-1">
              <button onClick={confirmDelete} className="px-2 py-1 text-xs bg-red-500 text-white rounded border-2 border-black hover:shadow-brutal font-bold">Yes</button>
              <button onClick={cancelDelete} className="px-2 py-1 text-xs bg-gray-200 rounded border-2 border-black hover:shadow-brutal font-bold">No</button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

export const TestCaseRowNormal = memo(TestCaseRowNormalComponent);
