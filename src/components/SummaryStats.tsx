/**
 * SummaryStats Component
 * Displays aggregate statistics for test cases
 */

import { useMemo } from 'react';
import type { TestCase, SummaryStats as SummaryStatsType } from '../types/models';
import { Recommendation, ChangeType } from '../types/models';

interface SummaryStatsProps {
  testCases: TestCase[];
}

export function SummaryStats({ testCases }: SummaryStatsProps) {
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
        changeTypeCounts: {
          [ChangeType.NEW]: 0,
          [ChangeType.MODIFIED_BEHAVIOR]: 0,
          [ChangeType.MODIFIED_UI]: 0,
          [ChangeType.UNCHANGED]: 0
        }
      };
    }

    // Calculate recommendation counts
    const recommendationCounts = {
      [Recommendation.AUTOMATE]: 0,
      [Recommendation.MAYBE]: 0,
      [Recommendation.DONT_AUTOMATE]: 0
    };

    // Calculate change type counts
    const changeTypeCounts = {
      [ChangeType.NEW]: 0,
      [ChangeType.MODIFIED_BEHAVIOR]: 0,
      [ChangeType.MODIFIED_UI]: 0,
      [ChangeType.UNCHANGED]: 0
    };

    let totalScore = 0;
    let legalCount = 0;

    testCases.forEach(tc => {
      recommendationCounts[tc.recommendation]++;
      changeTypeCounts[tc.changeType]++;
      totalScore += tc.scores.total;
      if (tc.isLegal) legalCount++;
    });

    const averageScore = Math.round(totalScore / totalCount);

    return {
      totalCount,
      recommendationCounts,
      averageScore,
      legalCount,
      changeTypeCounts
    };
  }, [testCases]);

  return (
    <div className="bg-white border-t border-gray-200 px-2 sm:px-4 py-3 sm:py-4">
      {/* Responsive grid: 2 columns on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {/* Total Count */}
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-600 font-medium mb-1">Total Tests</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCount}</div>
        </div>

        {/* Automate Count */}
        <div className="bg-green-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-green-700 font-medium mb-1">Automate</div>
          <div className="text-xl sm:text-2xl font-bold text-green-800">
            {stats.recommendationCounts[Recommendation.AUTOMATE]}
          </div>
        </div>

        {/* Maybe Count */}
        <div className="bg-yellow-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-yellow-700 font-medium mb-1">Maybe</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-800">
            {stats.recommendationCounts[Recommendation.MAYBE]}
          </div>
        </div>

        {/* Don't Automate Count */}
        <div className="bg-red-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-red-700 font-medium mb-1">Don't Automate</div>
          <div className="text-xl sm:text-2xl font-bold text-red-800">
            {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-blue-700 font-medium mb-1">Avg Score</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-800">
            {stats.averageScore}
            <span className="text-xs sm:text-sm font-normal text-blue-600">/100</span>
          </div>
        </div>

        {/* Legal Count */}
        <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-purple-700 font-medium mb-1">Legal Required</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-800">{stats.legalCount}</div>
        </div>
      </div>

      {/* Change Type Breakdown - Responsive layout */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 font-medium mb-2">Change Type Distribution</div>
        {/* Stack on mobile, flex on larger screens */}
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-gray-600">New:</span>{' '}
            <span className="font-semibold text-gray-900">{stats.changeTypeCounts[ChangeType.NEW]}</span>
          </div>
          <div>
            <span className="text-gray-600">Modified Behavior:</span>{' '}
            <span className="font-semibold text-gray-900">{stats.changeTypeCounts[ChangeType.MODIFIED_BEHAVIOR]}</span>
          </div>
          <div>
            <span className="text-gray-600">Modified UI:</span>{' '}
            <span className="font-semibold text-gray-900">{stats.changeTypeCounts[ChangeType.MODIFIED_UI]}</span>
          </div>
          <div>
            <span className="text-gray-600">Unchanged:</span>{' '}
            <span className="font-semibold text-gray-900">{stats.changeTypeCounts[ChangeType.UNCHANGED]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
