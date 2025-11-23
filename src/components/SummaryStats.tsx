/**
 * SummaryStats Component
 * Displays aggregate statistics for test cases
 */

import { useMemo } from 'react';
import { useAppContext } from '../context';
import type { TestCase, SummaryStats as SummaryStatsType } from '../types/models';
import { Recommendation, CodeChange, AppMode } from '../types/models';

interface SummaryStatsProps {
  testCases: TestCase[];
}

export function SummaryStats({ testCases }: SummaryStatsProps) {
  const { userPreferences } = useAppContext();
  const isNormalMode = userPreferences.appMode === AppMode.NORMAL;
  
  const stats = useMemo((): SummaryStatsType => {
    const totalCount = testCases.length;
    
    if (totalCount === 0) {
      return {
        totalCount: 0,
        recommendationCounts: {
          [Recommendation.AUTOMATE]: 0,
          [Recommendation.MAYBE]: 0,
          [Recommendation.DONT_AUTOMATE]: 0
        },
        averageScore: 0,
        legalCount: 0,
        codeChangeCounts: {
          [CodeChange.NEW]: 0,
          [CodeChange.MODIFIED]: 0,
          [CodeChange.UI_ONLY]: 0,
          [CodeChange.UNCHANGED]: 0
        }
      };
    }

    // Calculate recommendation counts
    const recommendationCounts = {
      [Recommendation.AUTOMATE]: 0,
      [Recommendation.MAYBE]: 0,
      [Recommendation.DONT_AUTOMATE]: 0
    };

    // Calculate code change counts
    const codeChangeCounts = {
      [CodeChange.NEW]: 0,
      [CodeChange.MODIFIED]: 0,
      [CodeChange.UI_ONLY]: 0,
      [CodeChange.UNCHANGED]: 0
    };

    let totalScore = 0;
    let legalCount = 0;

    testCases.forEach(tc => {
      recommendationCounts[tc.recommendation]++;
      codeChangeCounts[tc.codeChange]++;
      totalScore += tc.scores.total;
      if (tc.isLegal) legalCount++;
    });

    const averageScore = Math.round(totalScore / totalCount);

    return {
      totalCount,
      recommendationCounts,
      averageScore,
      legalCount,
      codeChangeCounts
    };
  }, [testCases]);

  if (isNormalMode) {
    // Normal Mode - Simple stats, no teaching
    return (
      <div className="bg-white border-t-2 border-black px-2 py-2">
        <div className="flex lg:grid lg:grid-cols-5 gap-1 lg:gap-3 overflow-x-auto lg:overflow-visible text-xs">
          {/* Total Count */}
          <div className="bg-gray-50 rounded px-2 py-1 min-w-[70px] text-center">
            <div className="text-gray-600 font-medium">Total tests</div>
            <div className="text-lg font-bold text-gray-900">{stats.totalCount}</div>
          </div>

          {/* Automate Count */}
          <div className="bg-green-50 rounded px-2 py-1 min-w-[90px] text-center">
            <div className="text-green-700 font-medium">✅ Automate</div>
            <div className="text-lg font-bold text-green-800">
              {stats.recommendationCounts[Recommendation.AUTOMATE]}
              <span className="text-xs font-normal text-green-600 ml-1">(54-80)</span>
            </div>
          </div>

          {/* Maybe Count */}
          <div className="bg-yellow-50 rounded px-2 py-1 min-w-[90px] text-center">
            <div className="text-yellow-700 font-medium">⚠️ Maybe</div>
            <div className="text-lg font-bold text-yellow-800">
              {stats.recommendationCounts[Recommendation.MAYBE]}
              <span className="text-xs font-normal text-yellow-600 ml-1">(27-53)</span>
            </div>
          </div>

          {/* Exploratory Testing Count */}
          <div className="bg-red-50 rounded px-2 py-1 min-w-[110px] text-center">
            <div className="text-red-700 font-medium">🔍 Exploratory</div>
            <div className="text-lg font-bold text-red-800">
              {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
              <span className="text-xs font-normal text-red-600 ml-1">(0-26)</span>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-blue-50 rounded px-2 py-1 min-w-[80px] text-center">
            <div className="text-blue-700 font-medium">Average score</div>
            <div className="text-lg font-bold text-blue-800">
              {stats.averageScore}
              <span className="text-xs font-normal text-blue-600">/80</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teaching Mode - Full stats with code change breakdown
  return (
    <div className="bg-white border-t-2 border-black px-2 py-2">
      {/* Compact single row on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-6 gap-1 lg:gap-3 overflow-x-auto lg:overflow-visible text-xs">
        {/* Total Count */}
        <div className="bg-gray-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-gray-600 font-medium">Total</div>
          <div className="text-lg font-bold text-gray-900">{stats.totalCount}</div>
        </div>

        {/* Automate Count */}
        <div className="bg-green-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-green-700 font-medium">Auto</div>
          <div className="text-lg font-bold text-green-800">
            {stats.recommendationCounts[Recommendation.AUTOMATE]}
          </div>
        </div>

        {/* Maybe Count */}
        <div className="bg-yellow-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-yellow-700 font-medium">Maybe</div>
          <div className="text-lg font-bold text-yellow-800">
            {stats.recommendationCounts[Recommendation.MAYBE]}
          </div>
        </div>

        {/* Don't Automate Count */}
        <div className="bg-red-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-red-700 font-medium">No</div>
          <div className="text-lg font-bold text-red-800">
            {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-blue-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-blue-700 font-medium">Avg</div>
          <div className="text-lg font-bold text-blue-800">
            {stats.averageScore}
            <span className="text-xs font-normal text-blue-600">/100</span>
          </div>
        </div>

        {/* Legal Count */}
        <div className="bg-purple-50 rounded px-2 py-1 min-w-[60px] text-center">
          <div className="text-purple-700 font-medium">Legal</div>
          <div className="text-lg font-bold text-purple-800">{stats.legalCount}</div>
        </div>
      </div>

      {/* Code Change Breakdown - Only show on desktop */}
      <div className="hidden lg:block mt-2 pt-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 text-xs">
          <div>
            <span className="text-gray-600">New:</span>{' '}
            <span className="font-semibold">{stats.codeChangeCounts[CodeChange.NEW]}</span>
          </div>
          <div>
            <span className="text-gray-600">Modified:</span>{' '}
            <span className="font-semibold">{stats.codeChangeCounts[CodeChange.MODIFIED]}</span>
          </div>
          <div>
            <span className="text-gray-600">UI Only:</span>{' '}
            <span className="font-semibold">{stats.codeChangeCounts[CodeChange.UI_ONLY]}</span>
          </div>
          <div>
            <span className="text-gray-600">Unchanged:</span>{' '}
            <span className="font-semibold">{stats.codeChangeCounts[CodeChange.UNCHANGED]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
