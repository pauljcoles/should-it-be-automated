/**
 * AngieScoreCalculator Service
 * 
 * Implements Angie Jones' exact test prioritization scoring model.
 * This is the "Normal Mode" calculator - simple, fast, no teaching elements.
 * 
 * Scoring Model (0-80 scale):
 * - Customer Risk (0-25): impact × probOfUse
 * - Value of Test (0-25): distinctness × fixProbability
 * - Cost Efficiency (0-25): easyToWrite × quickToWrite
 * - History (0-5): MAX(similarity, breakFreq) - NOT multiply!
 * 
 * Total: 0-80 points
 */

import { Recommendation, type TestCase } from '../types/models';

/**
 * Service class for calculating Angie Jones' test automation priority scores
 */
export class AngieScoreCalculator {
    /**
     * Calculate Customer Risk score
     * Formula: impact × probOfUse
     * 
     * @param impact - Severity if this breaks for customers (1-5)
     * @param probOfUse - How often customers use this feature (1-5)
     * @returns Customer Risk score (0-25)
     */
    static calculateCustomerRisk(impact: number, probOfUse: number): number {
        return impact * probOfUse;
    }

    /**
     * Calculate Value of Test score
     * Formula: distinctness × fixProbability
     * 
     * @param distinctness - Does this test provide NEW information? (1-5, MANUAL)
     * @param fixProbability - Would dev team prioritize fixing if this test fails? (1-5)
     * @returns Value score (0-25)
     */
    static calculateValueScore(distinctness: number, fixProbability: number): number {
        return distinctness * fixProbability;
    }

    /**
     * Calculate Cost Efficiency score
     * Formula: easyToWrite × quickToWrite
     * 
     * @param easyToWrite - Implementation complexity (1=hard, 5=easy)
     * @param quickToWrite - Time to implement (1=slow, 5=fast)
     * @returns Cost Efficiency score (0-25)
     */
    static calculateCostScore(easyToWrite: number, quickToWrite: number): number {
        return easyToWrite * quickToWrite;
    }

    /**
     * Calculate History score
     * Formula: MAX(similarity, breakFreq) - NOT multiply!
     * 
     * @param similarity - Have similar areas broken before? (1-5)
     * @param breakFreq - How often does this area break? (1-5)
     * @returns History score (0-5)
     */
    static calculateHistoryScore(similarity: number, breakFreq: number): number {
        return Math.max(similarity, breakFreq);
    }

    /**
     * Calculate total score for Angie's model
     * Formula: customerRisk + valueScore + costScore + historyScore
     * 
     * @param scores - Individual scores
     * @returns Total score (0-80)
     */
    static calculateTotalScore(scores: {
        customerRisk: number;
        valueScore: number;
        costScore: number;
        historyScore: number;
    }): number {
        return scores.customerRisk + scores.valueScore + scores.costScore + scores.historyScore;
    }

    /**
     * Determine automation recommendation based on total score (0-80 scale)
     * Thresholds adjusted proportionally from 0-100 scale:
     * - 67-100 (on 100 scale) = 54-80 (on 80 scale) → AUTOMATE
     * - 34-66 (on 100 scale) = 27-53 (on 80 scale) → MAYBE
     * - 0-33 (on 100 scale) = 0-26 (on 80 scale) → DON'T AUTOMATE
     * 
     * @param totalScore - Total score (0-80)
     * @returns Recommendation (AUTOMATE, MAYBE, or DON'T AUTOMATE)
     */
    static getRecommendation(totalScore: number): Recommendation {
        if (totalScore >= 54) {
            return Recommendation.AUTOMATE;
        } else if (totalScore >= 27) {
            return Recommendation.MAYBE;
        } else {
            return Recommendation.DONT_AUTOMATE;
        }
    }

    /**
     * Calculate all scores for a test case using Angie's model
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
            total: number;
        };
        recommendation: Recommendation;
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

        const customerRisk = this.calculateCustomerRisk(impact, probOfUse);
        const valueScore = this.calculateValueScore(distinctness, fixProbability);
        const costScore = this.calculateCostScore(easyToWrite, quickToWrite);
        const historyScore = this.calculateHistoryScore(similarity, breakFreq);

        const scores = {
            customerRisk,
            valueScore,
            costScore,
            historyScore,
            total: 0
        };

        scores.total = this.calculateTotalScore(scores);
        const recommendation = this.getRecommendation(scores.total);

        return { scores, recommendation };
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

        lines.push('Score Breakdown (Angie Jones Model):');
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

        // Total
        lines.push(`Total Score: ${testCase.scores.total}/80`);
        lines.push(`Recommendation: ${testCase.recommendation}`);

        return lines.join('\n');
    }
}
