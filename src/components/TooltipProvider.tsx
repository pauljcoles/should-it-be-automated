/**
 * TooltipProvider Component
 * 
 * Provides tooltip content definitions for all fields, scores, and recommendations
 * in the application. This centralizes all help text for consistency.
 */

import { Info } from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import type { Recommendation, CodeChange, ImplementationType } from '../types/models';

// ============================================================================
// Field Label Tooltips
// ============================================================================

interface FieldTooltipProps {
  field: 'testName' | 'changeType' | 'implementationType' | 'userFrequency' | 
         'businessImpact' | 'affectedAreas' | 'isLegal' | 'notes' | 
         'bertScenarioId' | 'jiraTicket';
}

export function FieldTooltip({ field }: FieldTooltipProps) {
  const tooltips: Record<FieldTooltipProps['field'], string> = {
    testName: 'A descriptive name for this test case. Keep it clear and concise (max 100 characters).',
    changeType: 'How has this functionality changed? New = brand new feature, Modified Behavior = logic changed, Modified UI = visual only, Unchanged = no changes.',
    implementationType: 'Technical implementation approach. Loop Same = reuses existing pattern exactly, Loop Different = similar pattern with variations, Custom = built from scratch, Mix = combination.',
    userFrequency: 'Usage Frequency: How often do users interact with this feature? Consider: 1 (rarely/monthly), 2 (weekly), 3 (few times/week), 4 (daily), 5 (multiple times/day). Think about typical user behavior, not edge cases.',
    businessImpact: 'Impact if Broken: What happens if this feature fails? Consider: 1 (cosmetic issue), 2 (minor inconvenience), 3 (workaround exists), 4 (major feature broken), 5 (critical - revenue loss, data corruption, security breach).',
    affectedAreas: 'Connected Components: How many parts of the system connect to or depend on this feature? Count: pages that use it, components that integrate with it, APIs it calls, data it touches. Range: 1 (isolated) to 5 (highly connected hub).',
    isLegal: 'Check this if the test is required for legal, compliance, or regulatory reasons (GDPR, accessibility, audit trails, etc.). Adds 20 points to the score.',
    notes: 'Additional context, edge cases, or special considerations for this test.',
    bertScenarioId: 'Optional: Link to the BERT scenario ID if this test was generated from BERT.',
    jiraTicket: 'Optional: Link to the Jira ticket or issue tracking this work.'
  };

  return (
    <Tooltip content={tooltips[field]} side="top">
      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline-block" />
    </Tooltip>
  );
}

// ============================================================================
// Score Cell Tooltips
// ============================================================================

interface ScoreTooltipProps {
  scoreType: 'risk' | 'value' | 'ease' | 'history' | 'legal' | 'total';
  userFrequency?: number;
  businessImpact?: number;
  changeType?: CodeChange;
  implementationType?: ImplementationType;
  affectedAreas?: number;
  isLegal?: boolean;
}

export function ScoreTooltip({ 
  scoreType, 
  userFrequency, 
  businessImpact, 
  changeType,
  implementationType,
  affectedAreas,
  isLegal
}: ScoreTooltipProps) {
  const getTooltipContent = (): React.ReactNode => {
    switch (scoreType) {
      case 'risk':
        return (
          <div>
            <p className="font-bold mb-1">Risk Score (0-25)</p>
            <p className="text-xs mb-2">Formula: Usage Frequency × Impact if Broken</p>
            {userFrequency !== undefined && businessImpact !== undefined && (
              <p className="text-xs bg-gray-100 p-1 rounded">
                {userFrequency} × {businessImpact} = {userFrequency * businessImpact}
              </p>
            )}
            <p className="text-xs mt-2">Measures how critical this functionality is based on usage and business value.</p>
          </div>
        );
      
      case 'value':
        const distinctnessMap: Record<CodeChange, number> = {
          'unchanged': 0,
          'ui-only': 2,
          'modified': 4,
          'new': 5
        };
        const inductionMap: Record<CodeChange, string> = {
          'unchanged': '1',
          'ui-only': '2',
          'modified': '5',
          'new': `${businessImpact || 'BI'}`
        };
        return (
          <div>
            <p className="font-bold mb-1">Value Score (0-25)</p>
            <p className="text-xs mb-2">Formula: Distinctness × Induction to Action</p>
            {changeType && (
              <p className="text-xs bg-gray-100 p-1 rounded mb-2">
                {distinctnessMap[changeType]} × {inductionMap[changeType]}
              </p>
            )}
            <p className="text-xs">Measures how much the functionality has changed and likelihood of bugs.</p>
          </div>
        );
      
      case 'ease':
        const riskMap: Record<ImplementationType, number> = {
          'standard-components': 5,
          'new-pattern': 3,
          'custom-implementation': 1,
          'hybrid': 2
        };
        return (
          <div>
            <p className="font-bold mb-1">Effort Score (0-25)</p>
            <p className="text-xs mb-2">Formula: Easy to Automate × Quick to Automate</p>
            {implementationType && (
              <p className="text-xs bg-gray-100 p-1 rounded mb-2">
                Legacy: {riskMap[implementationType]} × 5 = {riskMap[implementationType] * 5}
              </p>
            )}
            <p className="text-xs">Measures the effort required to automate based on technical complexity and time investment.</p>
          </div>
        );
      
      case 'history':
        return (
          <div>
            <p className="font-bold mb-1">History Score (0-5)</p>
            <p className="text-xs mb-2">Formula: min(Connected Components, 5)</p>
            {affectedAreas !== undefined && (
              <p className="text-xs bg-gray-100 p-1 rounded mb-2">
                min({affectedAreas}, 5) = {Math.min(affectedAreas, 5)}
              </p>
            )}
            <p className="text-xs">Measures how many parts of the system are connected to this feature.</p>
          </div>
        );
      
      case 'legal':
        return (
          <div>
            <p className="font-bold mb-1">Legal Score (0 or 20)</p>
            <p className="text-xs mb-2">Formula: isLegal ? 20 : 0</p>
            {isLegal !== undefined && (
              <p className="text-xs bg-gray-100 p-1 rounded mb-2">
                {isLegal ? '20 (Legal requirement)' : '0 (Not a legal requirement)'}
              </p>
            )}
            <p className="text-xs">Binary score for legal/compliance requirements that must be tested.</p>
          </div>
        );
      
      case 'total':
        return (
          <div>
            <p className="font-bold mb-1">Total Score (0-100)</p>
            <p className="text-xs mb-2">Formula: Risk + Value + Effort + History + Legal</p>
            <p className="text-xs">Sum of all component scores. Determines the automation recommendation.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Tooltip content={getTooltipContent()} side="top">
      <span className="cursor-help">
        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 inline-block ml-1" />
      </span>
    </Tooltip>
  );
}

// ============================================================================
// Recommendation Badge Tooltips
// ============================================================================

interface RecommendationTooltipProps {
  recommendation: Recommendation;
  totalScore: number;
}

export function RecommendationTooltip({ recommendation, totalScore }: RecommendationTooltipProps) {
  const getTooltipContent = (): React.ReactNode => {
    switch (recommendation) {
      case 'AUTOMATE':
        return (
          <div>
            <p className="font-bold mb-1">AUTOMATE (67-100 points)</p>
            <p className="text-xs mb-2">Current score: {totalScore}</p>
            <p className="text-xs">
              High-value automation candidate. This test has strong justification for automation
              based on risk, value, and feasibility factors.
            </p>
          </div>
        );
      
      case 'MAYBE':
        return (
          <div>
            <p className="font-bold mb-1">MAYBE (34-66 points)</p>
            <p className="text-xs mb-2">Current score: {totalScore}</p>
            <p className="text-xs">
              Moderate automation candidate. Consider your team's capacity and whether this test
              provides unique coverage. May be worth automating if resources allow.
            </p>
          </div>
        );
      
      case 'DON\'T AUTOMATE':
        return (
          <div>
            <p className="font-bold mb-1">DON'T AUTOMATE (0-33 points)</p>
            <p className="text-xs mb-2">Current score: {totalScore}</p>
            <p className="text-xs">
              Low-value automation candidate. The cost of automation likely exceeds the benefit.
              Consider manual exploratory testing instead.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Tooltip content={getTooltipContent()} side="left">
      <span className="cursor-help inline-block">
        <Info className="w-3 h-3 text-gray-600 hover:text-gray-800 inline-block ml-1" />
      </span>
    </Tooltip>
  );
}

// ============================================================================
// Change Type Tooltips (for dropdowns)
// ============================================================================

export function getCodeChangeTooltip(changeType: CodeChange): string {
  const tooltips: Record<CodeChange, string> = {
    'new': 'Brand new functionality that didn\'t exist before. Highest risk of bugs.',
    'modified': 'Existing functionality with changed logic or workflow. High risk of regressions.',
    'ui-only': 'Visual changes only, logic unchanged. Lower risk but still worth testing.',
    'unchanged': 'No changes to this functionality. Lowest priority for automation.'
  };
  return tooltips[changeType];
}

// ============================================================================
// Implementation Type Tooltips (for dropdowns)
// ============================================================================

export function getImplementationTypeTooltip(implementationType: ImplementationType): string {
  const tooltips: Record<ImplementationType, string> = {
    'standard-components': 'Uses standard reusable components from design system. Easiest to automate, lowest maintenance.',
    'new-pattern': 'New pattern or variation of existing components. Moderate automation effort.',
    'custom-implementation': 'Unique implementation built from scratch. Highest automation effort.',
    'hybrid': 'Combination of standard components and custom elements. Moderate automation effort.'
  };
  return tooltips[implementationType];
}
