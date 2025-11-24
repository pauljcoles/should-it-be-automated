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
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-300 px-3 py-3 lg:py-4">
        <div className="flex lg:grid lg:grid-cols-5 gap-2 lg:gap-4 overflow-x-auto lg:overflow-visible text-xs">
          {/* Total Count */}
          <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[70px] text-center hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
            <div className="text-slate-600 font-semibold text-xs lg:text-base">Total tests</div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalCount}</div>
          </div>

          {/* Automate Count */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[90px] text-center hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all">
            <div className="text-emerald-700 font-semibold text-xs lg:text-base">✅ Automate</div>
            <div className="text-2xl font-bold text-emerald-900">
              {stats.recommendationCounts[Recommendation.AUTOMATE]}
            </div>
            <div className="text-xs lg:text-sm font-semibold text-emerald-600">(54-80)</div>
          </div>

          {/* Maybe Count */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[90px] text-center hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all">
            <div className="text-amber-700 font-semibold text-xs lg:text-base">⚠️ Maybe</div>
            <div className="text-2xl font-bold text-amber-900">
              {stats.recommendationCounts[Recommendation.MAYBE]}
            </div>
            <div className="text-xs lg:text-sm font-semibold text-amber-600">(27-53)</div>
          </div>

          {/* Exploratory Testing Count */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border-2 border-rose-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[110px] text-center hover:shadow-lg hover:border-rose-400 hover:-translate-y-0.5 transition-all">
            <div className="text-rose-700 font-semibold text-xs lg:text-base">🔍 Exploratory</div>
            <div className="text-2xl font-bold text-rose-900">
              {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
            </div>
            <div className="text-xs lg:text-sm font-semibold text-rose-600">(0-26)</div>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border-2 border-sky-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[80px] text-center hover:shadow-lg hover:border-sky-400 hover:-translate-y-0.5 transition-all">
            <div className="text-sky-700 font-semibold text-xs lg:text-base">Average score</div>
            <div className="text-2xl font-bold text-sky-900">
              {stats.averageScore}
              <span className="text-sm font-semibold text-sky-600">/80</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teaching Mode - Full stats with code change breakdown
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-300 px-3 py-3 lg:py-4">
      {/* Compact single row on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-6 gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible text-xs">
        {/* Total Count */}
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
          <div className="text-slate-600 font-semibold text-xs lg:text-base">Total</div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalCount}</div>
        </div>

        {/* Automate Count */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all">
          <div className="text-emerald-700 font-semibold text-xs lg:text-base">Auto</div>
          <div className="text-2xl font-bold text-emerald-900">
            {stats.recommendationCounts[Recommendation.AUTOMATE]}
          </div>
        </div>

        {/* Maybe Count */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all">
          <div className="text-amber-700 font-semibold text-xs lg:text-base">Maybe</div>
          <div className="text-2xl font-bold text-amber-900">
            {stats.recommendationCounts[Recommendation.MAYBE]}
          </div>
        </div>

        {/* Don't Automate Count */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border-2 border-rose-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-rose-400 hover:-translate-y-0.5 transition-all">
          <div className="text-rose-700 font-semibold text-xs lg:text-base">No</div>
          <div className="text-2xl font-bold text-rose-900">
            {stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border-2 border-sky-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-sky-400 hover:-translate-y-0.5 transition-all">
          <div className="text-sky-700 font-semibold text-xs lg:text-base">Avg</div>
          <div className="text-2xl font-bold text-sky-900">
            {stats.averageScore}
            <span className="text-sm font-semibold text-sky-600">/100</span>
          </div>
        </div>

        {/* Legal Count */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 shadow-sm px-3 py-2 lg:px-4 lg:py-3 min-w-[60px] text-center hover:shadow-lg hover:border-purple-400 hover:-translate-y-0.5 transition-all">
          <div className="text-purple-700 font-semibold text-xs lg:text-base">Legal</div>
          <div className="text-2xl font-bold text-purple-900">{stats.legalCount}</div>
        </div>
      </div>


    </div>
  );
}
