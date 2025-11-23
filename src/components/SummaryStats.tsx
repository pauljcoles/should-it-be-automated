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
      <div className="bg-yellow-400 border-t-4 border-black px-3 py-3 lg:py-4">
        <div className="flex lg:grid lg:grid-cols-5 gap-2 lg:gap-4 overflow-x-auto lg:overflow-visible text-xs">
          {/* Total Count */}
          <div className="bg-white rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[70px] text-center hover:shadow-brutal-lg transition-all">
            <div className="text-gray-700 font-black text-xs lg:text-base">Total tests</div>
            <div className="text-2xl font-black text-gray-900">{stats.totalCount}</div>
          </div>

          {/* Automate Count */}
          <div className="bg-emerald-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[90px] text-center hover:shadow-brutal-lg transition-all">
            <div className="text-emerald-700 font-black text-xs lg:text-base">✅ Automate</div>
            <div className="text-2xl font-black text-emerald-800">
              {stats.recommendationCounts[Recommendation.AUTOMATE]}
            </div>
            <div className="text-xs lg:text-sm font-bold text-emerald-600">(54-80)</div>
          </div>

          {/* Maybe Count */}
          <div className="bg-amber-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[90px] text-center hover:shadow-brutal-lg transition-all">
            <div className="text-amber-700 font-black text-xs lg:text-base">⚠️ Maybe</div>
            <div className="text-2xl font-black text-amber-800">
              {stats.recommendationCounts[Recommendation.MAYBE]}
            </div>
            <div className="text-xs lg:text-sm font-bold text-amber-600">(27-53)</div>
          </div>

          {/* Exploratory Testing Count */}
          <div className="bg-rose-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[110px] text-center hover:shadow-brutal-lg transition-all">
            <div className="text-rose-700 font-black text-xs lg:text-base">🔍 Exploratory</div>
            <div className="text-2xl font-black text-rose-800">
              {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
            </div>
            <div className="text-xs lg:text-sm font-bold text-rose-600">(0-26)</div>
          </div>

          {/* Average Score */}
          <div className="bg-sky-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[80px] text-center hover:shadow-brutal-lg transition-all">
            <div className="text-sky-700 font-black text-xs lg:text-base">Average score</div>
            <div className="text-2xl font-black text-sky-800">
              {stats.averageScore}
              <span className="text-sm font-bold text-sky-600">/80</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teaching Mode - Full stats with code change breakdown
  return (
    <div className="bg-yellow-400 border-t-4 border-black px-3 py-3 lg:py-4">
      {/* Compact single row on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-6 gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible text-xs">
        {/* Total Count */}
        <div className="bg-white rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-gray-700 font-black text-xs lg:text-base">Total</div>
          <div className="text-2xl font-black text-gray-900">{stats.totalCount}</div>
        </div>

        {/* Automate Count */}
        <div className="bg-emerald-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-emerald-700 font-black text-xs lg:text-base">Auto</div>
          <div className="text-2xl font-black text-emerald-800">
            {stats.recommendationCounts[Recommendation.AUTOMATE]}
          </div>
        </div>

        {/* Maybe Count */}
        <div className="bg-amber-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-amber-700 font-black text-xs lg:text-base">Maybe</div>
          <div className="text-2xl font-black text-amber-800">
            {stats.recommendationCounts[Recommendation.MAYBE]}
          </div>
        </div>

        {/* Don't Automate Count */}
        <div className="bg-rose-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-rose-700 font-black text-xs lg:text-base">No</div>
          <div className="text-2xl font-black text-rose-800">
            {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-sky-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-sky-700 font-black text-xs lg:text-base">Avg</div>
          <div className="text-2xl font-black text-sky-800">
            {stats.averageScore}
            <span className="text-sm font-bold text-sky-600">/100</span>
          </div>
        </div>

        {/* Legal Count */}
        <div className="bg-purple-100 rounded border-brutal shadow-brutal px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-brutal-lg transition-all">
          <div className="text-purple-700 font-black text-xs lg:text-base">Legal</div>
          <div className="text-2xl font-black text-purple-800">{stats.legalCount}</div>
        </div>
      </div>

      {/* Code Change Breakdown - Only show on desktop */}
      <div className="hidden lg:block mt-3 pt-3 border-t-4 border-black">
        <div className="flex flex-wrap gap-4 text-xs lg:text-sm">
          <div className="bg-white rounded border-2 border-black px-3 py-1 lg:px-4 lg:py-2 shadow-brutal">
            <span className="text-gray-700 font-bold">New:</span>{' '}
            <span className="font-black text-gray-900">{stats.codeChangeCounts[CodeChange.NEW]}</span>
          </div>
          <div className="bg-white rounded border-2 border-black px-3 py-1 lg:px-4 lg:py-2 shadow-brutal">
            <span className="text-gray-700 font-bold">Modified:</span>{' '}
            <span className="font-black text-gray-900">{stats.codeChangeCounts[CodeChange.MODIFIED]}</span>
          </div>
          <div className="bg-white rounded border-2 border-black px-3 py-1 lg:px-4 lg:py-2 shadow-brutal">
            <span className="text-gray-700 font-bold">UI Only:</span>{' '}
            <span className="font-black text-gray-900">{stats.codeChangeCounts[CodeChange.UI_ONLY]}</span>
          </div>
          <div className="bg-white rounded border-2 border-black px-3 py-1 lg:px-4 lg:py-2 shadow-brutal">
            <span className="text-gray-700 font-bold">Unchanged:</span>{' '}
            <span className="font-black text-gray-900">{stats.codeChangeCounts[CodeChange.UNCHANGED]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
