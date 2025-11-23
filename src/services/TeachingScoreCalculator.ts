/**
 * TeachingScoreCalculator Service
 * 
 * Extends Angie Jones' exact model with teaching elements.
 * This is the "Teaching Mode" calculator - includes educational guidance.
 * 
 * Scoring Model (0-100 scale):
 * - Base Score (0-80): Same as Angie's Normal Mode
 *   - Customer Risk (0-25): impact × probOfUse
 *   - Value of Test (0-25): distinctness × fixProbability
 *   - Cost Efficiency (0-25): easyToWrite × quickToWrite
 *   - History (0-5): MAX(similarity, breakFreq)
 * - Legal Bonus (0 or 20): +20 if legal requirement
 * 
 * Total: 0-100 points
 * 
 * Thresholds for 0-100 scale:
 * - 67-100 → AUTOMATE
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
     * Calculate Customer Risk score (same as Angie's model)
     * Formula: impact × probOfUse
     */
    static calculateCustomerRisk(impact: number, probOfUse: number): number {
        return AngieScoreCalculator.calculateCustomerRisk(impact, probOfUse);
    }

    /**
     * Calculate Value of Test score (same as Angie's model)
     * Formula: distinctness × fixProbability
     */
    static calculateValueScore(distinctness: number, fixProbability: number): number {
        return AngieScoreCalculator.calculateValueScore(distinctness, fixProbability);
    }

    /**
     * Calculate Cost Efficiency score (same as Angie's model)
     * Formula: easyToWrite × quickToWrite
     */
    static calculateCostScore(easyToWrite: number, quickToWrite: number): number {
        return AngieScoreCalculator.calculateCostScore(easyToWrite, quickToWrite);
    }

    /**
     * Calculate History score (same as Angie's model)
     * Formula: MAX(similarity, breakFreq) - NOT multiply!
     */
    static calculateHistoryScore(similarity: number, breakFreq: number): number {
        return AngieScoreCalculator.calculateHistoryScore(similarity, breakFreq);
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
     * Calculate total score for Teaching Mode (0-100 scale)
     * Formula: customerRisk + valueScore + costScore + historyScore + legalScore
     * 
     * @param scores - Individual scores including legal
     * @returns Total score (0-100)
     */
    static calculateTotalWithLegal(scores: {
        customerRisk: number;
        valueScore: number;
        costScore: number;
        historyScore: number;
        legal: number;
    }): number {
        return scores.customerRisk + scores.valueScore + scores.costScore + scores.historyScore + scores.legal;
    }

    /**
     * Determine automation recommendation based on total score (0-100 scale)
     * Thresholds:
     * - 67-100 → AUTOMATE
     * - 34-66 → MAYBE
     * - 0-33 → DON'T AUTOMATE
     * 
     * @param totalScore - Total score (0-100)
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
     * Calculate the base technical score (0-80) without legal bonus
     * Used to determine if Real Talk should be shown
     */
    static calculateBaseTechnicalScore(scores: {
        customerRisk: number;
        valueScore: number;
        costScore: number;
        historyScore: number;
    }): number {
        return scores.customerRisk + scores.valueScore + scores.costScore + scores.historyScore;
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
            customerRisk: number;
            valueScore: number;
            costScore: number;
            historyScore: number;
            legal: number;
            total: number;
        };
        recommendation: Recommendation;
        baseTechnicalScore: number;
        shouldShowRealTalk: boolean;
    } {
        // Use default values if fields are not set
        const impact = testCase.impact ?? 3;
        const probOfUse = testCase.probOfUse ?? 3;
        const distinctness = testCase.distinctness ?? 3;
        const fixProbability = testCase.fixProbability ?? 3;
        const easyToWrite = testCase.easyToWrite ?? 3;
        const quickToWrite = testCase.quickToWrite ?? 3;
        const similarity = testCase.similarity ?? 1;
        const breakFreq = testCase.breakFreq ?? 1;
        const isLegal = testCase.isLegal ?? false;
        const organizationalPressure = testCase.organisationalPressure ?? 1;

        const customerRisk = this.calculateCustomerRisk(impact, probOfUse);
        const valueScore = this.calculateValueScore(distinctness, fixProbability);
        const costScore = this.calculateCostScore(easyToWrite, quickToWrite);
        const historyScore = this.calculateHistoryScore(similarity, breakFreq);
        const legal = this.calculateLegalScore(isLegal);

        const baseTechnicalScore = this.calculateBaseTechnicalScore({
            customerRisk,
            valueScore,
            costScore,
            historyScore
        });

        const scores = {
            customerRisk,
            valueScore,
            costScore,
            historyScore,
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

        lines.push('Score Breakdown (Teaching Mode - 0-100 scale):');
        lines.push('');

        // Customer Risk
        if (testCase.scores.customerRisk !== undefined) {
            lines.push(`Customer Risk: ${testCase.scores.customerRisk}/25`);
            lines.push(`  = Impact (${testCase.impact ?? 3}) × Prob of Use (${testCase.probOfUse ?? 3})`);
            lines.push('');
        }

        // Value of Test
        if (testCase.scores.valueScore !== undefined) {
            lines.push(`Value of Test: ${testCase.scores.valueScore}/25`);
            lines.push(`  = Distinctness (${testCase.distinctness ?? 3}) × Fix Probability (${testCase.fixProbability ?? 3})`);
            lines.push('');
        }

        // Cost Efficiency
        if (testCase.scores.costScore !== undefined) {
            lines.push(`Cost Efficiency: ${testCase.scores.costScore}/25`);
            lines.push(`  = Easy to Write (${testCase.easyToWrite ?? 3}) × Quick to Write (${testCase.quickToWrite ?? 3})`);
            lines.push('');
        }

        // History
        if (testCase.scores.historyScore !== undefined) {
            lines.push(`History: ${testCase.scores.historyScore}/5`);
            lines.push(`  = MAX(Similarity (${testCase.similarity ?? 1}), Break Freq (${testCase.breakFreq ?? 1}))`);
            lines.push('');
        }

        // Legal Score
        lines.push(`Legal Requirement: ${testCase.scores.legal}/20`);
        lines.push(`  = ${testCase.isLegal ? '20 (Legal requirement)' : '0 (Not a legal requirement)'}`);
        lines.push('');

        // Total
        const baseTechnicalScore = this.calculateBaseTechnicalScore({
            customerRisk: testCase.scores.customerRisk ?? 0,
            valueScore: testCase.scores.valueScore ?? 0,
            costScore: testCase.scores.costScore ?? 0,
            historyScore: testCase.scores.historyScore ?? 0
        });
        lines.push(`Base Technical Score: ${baseTechnicalScore}/80`);
        lines.push(`Total Score: ${testCase.scores.total}/100`);
        lines.push(`Recommendation: ${testCase.recommendation}`);

        return lines.join('\n');
    }
}
