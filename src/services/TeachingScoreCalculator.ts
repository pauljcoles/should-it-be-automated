/**
 * TeachingScoreCalculator Service
 * 
 * Extends Angie Jones' exact model with teaching elements and legal bonus.
 * This is the "Teaching Mode" calculator - includes educational guidance.
 * 
 * Scoring Model (0-120 scale):
 * - Base Score (0-100): Same as Angie's Normal Mode
 *   - RISK (0-25): Probability (1-5) × Impact (1-5)
 *   - VALUE (0-25): Distinctness (1-5) × Induction to Action (1-5)
 *   - COST EFFICIENCY (0-25): Easy to write (1-5) × Quick to write (1-5)
 *   - HISTORY (0-25): Bug count (1-5) × Affected areas (1-5)
 * - Legal Bonus (0 or 20): +20 if legal requirement
 * 
 * Total: 0-120 points
 * 
 * Thresholds for 0-120 scale:
 * - 67-120 → AUTOMATE
 * - 34-66 → MAYBE
 * - 0-33 → DON'T AUTOMATE
 */

import { AngieScoreCalculator } from './AngieScoreCalculator';
import { Recommendation, type TestCase } from '../types/models';

/**
 * Service class for calculating Teaching Mode test automation priority scores
 */
export class TeachingScoreCalculator {
    /**
     * Calculate RISK score (same as Angie's model)
     * Formula: Probability × Impact
     */
    static calculateRiskScore(probability: number, impact: number): number {
        return AngieScoreCalculator.calculateRiskScore(probability, impact);
    }

    /**
     * Calculate VALUE score (same as Angie's model)
     * Formula: Distinctness × Induction to Action
     */
    static calculateValueScore(distinctness: number, inductionToAction: number): number {
        return AngieScoreCalculator.calculateValueScore(distinctness, inductionToAction);
    }

    /**
     * Calculate COST EFFICIENCY score (same as Angie's model)
     * Formula: Easy to write × Quick to write
     */
    static calculateCostEfficiencyScore(easyToWrite: number, quickToWrite: number): number {
        return AngieScoreCalculator.calculateCostEfficiencyScore(easyToWrite, quickToWrite);
    }

    /**
     * Calculate HISTORY score (same as Angie's model)
     * Formula: Bug count × Affected areas
     */
    static calculateHistoryScore(bugCount: number, affectedAreas: number): number {
        return AngieScoreCalculator.calculateHistoryScore(bugCount, affectedAreas);
    }

    /**
     * Calculate legal score based on legal requirement flag
     * 
     * @param isLegal - Whether this is a legal/compliance requirement
     * @returns Legal score (0 or 20)
     */
    static calculateLegalScore(isLegal: boolean): number {
        return isLegal ? 20 : 0;
    }

    /**
     * Calculate total score for Teaching Mode (0-120 scale)
     * Formula: risk + value + costEfficiency + history + legal
     * 
     * @param scores - Individual scores including legal
     * @returns Total score (0-120)
     */
    static calculateTotalWithLegal(scores: {
        risk: number;
        value: number;
        costEfficiency: number;
        history: number;
        legal: number;
    }): number {
        return scores.risk + scores.value + scores.costEfficiency + scores.history + scores.legal;
    }

    /**
     * Determine automation recommendation based on total score (0-120 scale)
     * Thresholds:
     * - 67-120 → AUTOMATE
     * - 34-66 → MAYBE
     * - 0-33 → DON'T AUTOMATE
     * 
     * @param totalScore - Total score (0-120)
     * @returns Recommendation (AUTOMATE, MAYBE, or DON'T AUTOMATE)
     */
    static getRecommendation(totalScore: number): Recommendation {
        if (totalScore >= 67) {
            return Recommendation.AUTOMATE;
        } else if (totalScore >= 34) {
            return Recommendation.MAYBE;
        } else {
            return Recommendation.DONT_AUTOMATE;
        }
    }

    /**
     * Calculate the base technical score (0-100) without legal bonus
     * Used to determine if Real Talk should be shown
     */
    static calculateBaseTechnicalScore(scores: {
        risk: number;
        value: number;
        costEfficiency: number;
        history: number;
    }): number {
        return scores.risk + scores.value + scores.costEfficiency + scores.history;
    }

    /**
     * Determine if Real Talk teaching section should be shown
     * Show when:
     * - Technical score < 34 (base 0-80 score, before legal)
     * - OR Organizational Pressure ≥ 3
     */
    static shouldShowRealTalk(baseTechnicalScore: number, organizationalPressure: number): boolean {
        return baseTechnicalScore < 34 || organizationalPressure >= 3;
    }

    /**
     * Get Real Talk content based on scenario
     */
    static getRealTalkContent(baseTechnicalScore: number, organizationalPressure: number, isLegal: boolean): {
        title: string;
        message: string;
        scenario: 'low-score-high-pressure' | 'low-score-low-pressure' | 'high-score-high-pressure' | 'legal-requirement';
    } {
        // Legal requirement takes precedence
        if (isLegal) {
            return {
                title: '📋 Legal Requirement Detected',
                message: 'This test is marked as a legal/compliance requirement. While the technical score may be low, regulatory testing is mandatory regardless of traditional prioritization metrics. Document this as compliance testing rather than functional testing.',
                scenario: 'legal-requirement'
            };
        }

        // Low technical score + high organizational pressure
        if (baseTechnicalScore < 34 && organizationalPressure >= 3) {
            return {
                title: '⚠️ Real Talk: Coverage Pressure vs. Value',
                message: 'The technical score suggests this test has low value, but there\'s organizational pressure to automate it. This is a common scenario where teams feel pressure to "show coverage" rather than focus on risk. Consider: Is this test providing real value, or are we just checking a box? Remember: More tests ≠ Better testing. Focus on tests that catch real bugs.',
                scenario: 'low-score-high-pressure'
            };
        }

        // Low technical score + low organizational pressure
        if (baseTechnicalScore < 34 && organizationalPressure < 3) {
            return {
                title: '💡 Low Value Test Detected',
                message: 'This test scores low on the technical metrics. Consider whether this test is worth the maintenance cost. Low-value tests can become a burden over time. It might be better to focus your automation efforts on higher-value tests, or use exploratory testing for this scenario.',
                scenario: 'low-score-low-pressure'
            };
        }

        // High technical score + high organizational pressure
        if (baseTechnicalScore >= 34 && organizationalPressure >= 3) {
            return {
                title: '✓ Good News: Value Aligns with Pressure',
                message: 'This test has good technical value AND there\'s organizational pressure to automate it. This is the ideal scenario - the pressure is justified by the risk. Proceed with confidence.',
                scenario: 'high-score-high-pressure'
            };
        }

        // Default (shouldn't reach here if shouldShowRealTalk logic is correct)
        return {
            title: '💡 Teaching Note',
            message: 'Consider the balance between technical value and organizational context when making automation decisions.',
            scenario: 'low-score-low-pressure'
        };
    }

    /**
     * Calculate all scores for a test case using Teaching Mode
     * 
     * @param testCase - The test case with Angie's fields populated
     * @returns Calculated scores and recommendation
     */
    static calculateScores(testCase: Partial<TestCase>): {
        scores: {
            risk: number;
            value: number;
            costEfficiency: number;
            history: number;
            legal: number;
            total: number;
        };
        recommendation: Recommendation;
        baseTechnicalScore: number;
        shouldShowRealTalk: boolean;
    } {
        // Use default values if fields are not set
        const probability = testCase.probOfUse ?? 3;
        const impact = testCase.impact ?? 3;
        const distinctness = testCase.distinctness ?? 3;
        const inductionToAction = testCase.fixProbability ?? 3;
        const easyToWrite = testCase.easyToWrite ?? 3;
        const quickToWrite = testCase.quickToWrite ?? 3;
        const bugCount = testCase.similarity ?? 1;
        const affectedAreas = testCase.breakFreq ?? 1;
        const isLegal = testCase.isLegal ?? false;
        const organizationalPressure = testCase.organisationalPressure ?? 1;

        const risk = this.calculateRiskScore(probability, impact);
        const value = this.calculateValueScore(distinctness, inductionToAction);
        const costEfficiency = this.calculateCostEfficiencyScore(easyToWrite, quickToWrite);
        const history = this.calculateHistoryScore(bugCount, affectedAreas);
        const legal = this.calculateLegalScore(isLegal);

        const baseTechnicalScore = this.calculateBaseTechnicalScore({
            risk,
            value,
            costEfficiency,
            history
        });

        const scores = {
            risk,
            value,
            costEfficiency,
            history,
            legal,
            total: 0
        };

        scores.total = this.calculateTotalWithLegal(scores);
        const recommendation = this.getRecommendation(scores.total);
        const shouldShowRealTalk = this.shouldShowRealTalk(baseTechnicalScore, organizationalPressure);

        return {
            scores,
            recommendation,
            baseTechnicalScore,
            shouldShowRealTalk
        };
    }

    /**
     * Generate a detailed explanation of how the score was calculated
     * Used for tooltips and help text
     * 
     * @param testCase - The test case to explain
     * @returns Formatted explanation string
     */
    static explainScore(testCase: TestCase): string {
        const lines: string[] = [];

        lines.push('Score Breakdown (Teaching Mode - 0-120 scale):');
        lines.push('');

        // RISK
        if (testCase.scores.risk !== undefined) {
            lines.push(`RISK: ${testCase.scores.risk}/25`);
            lines.push(`  = Probability (${testCase.probOfUse ?? 3}) × Impact (${testCase.impact ?? 3})`);
            lines.push('');
        }

        // VALUE
        if (testCase.scores.value !== undefined) {
            lines.push(`VALUE: ${testCase.scores.value}/25`);
            lines.push(`  = Distinctness (${testCase.distinctness ?? 3}) × Induction to Action (${testCase.fixProbability ?? 3})`);
            lines.push('');
        }

        // COST EFFICIENCY
        if (testCase.scores.costEfficiency !== undefined) {
            lines.push(`COST EFFICIENCY: ${testCase.scores.costEfficiency}/25`);
            lines.push(`  = Easy to Write (${testCase.easyToWrite ?? 3}) × Quick to Write (${testCase.quickToWrite ?? 3})`);
            lines.push('');
        }

        // HISTORY
        if (testCase.scores.history !== undefined) {
            lines.push(`HISTORY: ${testCase.scores.history}/25`);
            lines.push(`  = Bug Count (${testCase.similarity ?? 1}) × Affected Areas (${testCase.breakFreq ?? 1})`);
            lines.push('');
        }

        // Legal Score
        lines.push(`Legal Requirement: ${testCase.scores.legal}/20`);
        lines.push(`  = ${testCase.isLegal ? '20 (Legal requirement)' : '0 (Not a legal requirement)'}`);
        lines.push('');

        // Total
        const baseTechnicalScore = this.calculateBaseTechnicalScore({
            risk: testCase.scores.risk ?? 0,
            value: testCase.scores.value ?? 0,
            costEfficiency: testCase.scores.costEfficiency ?? 0,
            history: testCase.scores.history ?? 0
        });
        lines.push(`Base Technical Score: ${baseTechnicalScore}/100`);
        lines.push(`Total Score: ${testCase.scores.total}/120`);
        lines.push(`Recommendation: ${testCase.recommendation}`);

        return lines.join('\n');
    }
}
