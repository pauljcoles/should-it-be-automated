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

      {/* Change Type Breakdown - Only show on desktop */}
      <div className="hidden lg:block mt-2 pt-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 text-xs">
          <div>
            <span className="text-gray-600">New:</span>{' '}
            <span className="font-semibold">{stats.changeTypeCounts[ChangeType.NEW]}</span>
          </div>
          <div>
            <span className="text-gray-600">Modified Behavior:</span>{' '}
            <span className="font-semibold">{stats.changeTypeCounts[ChangeType.MODIFIED_BEHAVIOR]}</span>
          </div>
          <div>
            <span className="text-gray-600">Modified UI:</span>{' '}
            <span className="font-semibold">{stats.changeTypeCounts[ChangeType.MODIFIED_UI]}</span>
          </div>
          <div>
            <span className="text-gray-600">Unchanged:</span>{' '}
            <span className="font-semibold">{stats.changeTypeCounts[ChangeType.UNCHANGED]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
