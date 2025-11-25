/**
 * SummaryStats Component
 * Displays aggregate statistics for test cases
 */

import { useMemo } from 'react';
import { useAppContext } from '../context';
import type { TestCase, SummaryStats as SummaryStatsType } from '../types/models';
import { Recommendation, CodeChange, AppMode } from '../types/models';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface SummaryStatsProps {
  testCases: TestCase[];
}

export function SummaryStats({ testCases }: SummaryStatsProps) {
  const { userPreferences, uiState, setSummaryStatsOpen } = useAppContext();
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



  const statsContent = isNormalMode ? (
    // Normal Mode - Simple stats, no teaching
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-300 px-2 py-2 lg:px-3 lg:py-4">
        <div className="flex lg:grid lg:grid-cols-5 gap-1.5 lg:gap-4 overflow-x-auto lg:overflow-visible text-xs">
          {/* Total Count */}
          <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm px-2 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
            <div className="text-slate-600 font-semibold text-xs lg:text-sm">Total: <span className="text-slate-900">{stats.totalCount}</span></div>
          </div>

          {/* Automate Count */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-sm px-2 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all">
            <div className="text-emerald-700 font-semibold text-xs lg:text-sm">
              Automate: <span className="text-emerald-900">{stats.recommendationCounts[Recommendation.AUTOMATE]}</span> <span className="text-emerald-600">(67-100)</span>
            </div>
          </div>

          {/* Maybe Count */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 shadow-sm px-2 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all">
            <div className="text-amber-700 font-semibold text-xs lg:text-sm">
              Maybe: <span className="text-amber-900">{stats.recommendationCounts[Recommendation.MAYBE]}</span> <span className="text-amber-600">(34-66)</span>
            </div>
          </div>

          {/* Exploratory Testing Count */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border-2 border-rose-300 shadow-sm px-2 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-rose-400 hover:-translate-y-0.5 transition-all">
            <div className="text-rose-700 font-semibold text-xs lg:text-sm">
              Exploratory: <span className="text-rose-900">{stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}</span> <span className="text-rose-600">(0-33)</span>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border-2 border-sky-300 shadow-sm px-2 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-sky-400 hover:-translate-y-0.5 transition-all">
            <div className="text-sky-700 font-semibold text-xs lg:text-sm">
              Avg: <span className="text-sky-900">{stats.averageScore}</span><span className="text-sky-600">/100</span>
            </div>
          </div>
        </div>
      </div>
  ) : (
    // Teaching Mode - Full stats with code change breakdown
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-300 px-2 py-2 lg:px-3 lg:py-4">
      {/* Compact single row on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-6 gap-1.5 lg:gap-3 overflow-x-auto lg:overflow-visible text-xs">
        {/* Total Count */}
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all">
          <div className="text-slate-600 font-semibold text-xs lg:text-sm">Total: <span className="text-slate-900">{stats.totalCount}</span></div>
        </div>

        {/* Automate Count */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all">
          <div className="text-emerald-700 font-semibold text-xs lg:text-sm">
            Auto: <span className="text-emerald-900">{stats.recommendationCounts[Recommendation.AUTOMATE]}</span>
          </div>
        </div>

        {/* Maybe Count */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all">
          <div className="text-amber-700 font-semibold text-xs lg:text-sm">
            Maybe: <span className="text-amber-900">{stats.recommendationCounts[Recommendation.MAYBE]}</span>
          </div>
        </div>

        {/* Don't Automate Count */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border-2 border-rose-300 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-rose-400 hover:-translate-y-0.5 transition-all">
          <div className="text-rose-700 font-semibold text-xs lg:text-sm">
            Exploratory: <span className="text-rose-900">{stats.recommendationCounts[Recommendation.DONT_AUTOMATE]}</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border-2 border-sky-300 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-sky-400 hover:-translate-y-0.5 transition-all">
          <div className="text-sky-700 font-semibold text-xs lg:text-sm">
            Avg: <span className="text-sky-900">{stats.averageScore}</span><span className="text-sky-600">/100</span>
          </div>
        </div>

        {/* Legal Count */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 shadow-sm px-3 py-1 lg:px-3 lg:py-2 min-w-[60px] text-center hover:shadow-lg hover:border-purple-400 hover:-translate-y-0.5 transition-all">
          <div className="text-purple-700 font-semibold text-xs lg:text-sm">Legal: <span className="text-purple-900">{stats.legalCount}</span></div>
        </div>
      </div>
    </div>
  );

  // Render logic
  return (
    <>
      {/* Mobile: Drawer (only show when open) */}
      {uiState.isSummaryStatsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSummaryStatsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-300 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">Summary Statistics</h3>
              <Button
                onClick={() => setSummaryStatsOpen(false)}
                variant="ghost"
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {statsContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Always visible at bottom */}
      <div className="hidden lg:block">
        {statsContent}
      </div>
    </>
  );
}
