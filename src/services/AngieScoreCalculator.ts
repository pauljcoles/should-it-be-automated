/**
 * AngieScoreCalculator Service
 * 
 * Implements Angie Jones' exact test prioritization scoring model.
 * This is the "Normal Mode" calculator - simple, fast, no teaching elements.
 * 
 * Scoring Model (0-100 scale):
 * - RISK (0-25): Probability (1-5) × Impact (1-5)
 * - VALUE (0-25): Distinctness (1-5) × Induction to Action (1-5)
 * - COST EFFICIENCY (0-25): Easy to write (1-5) × Quick to write (1-5)
 * - HISTORY (0-25): Bug count (1-5) × Affected areas (1-5)
 * 
 * Total: 0-100 points
 * 
 * Thresholds:
 * - 67-100 → AUTOMATE
 * - 34-66 → MAYBE
 * - 0-33 → DON'T AUTOMATE
 */

import { Recommendation, type TestCase } from '../types/models';

/**
 * Service class for calculating Angie Jones' test automation priority scores
 */
export class AngieScoreCalculator {
    /**
     * Calculate RISK score
     * Formula: Probability × Impact
     * 
     * @param probability - How often users interact with this feature (1-5)
     * @param impact - What happens if this feature fails (1-5)
     * @returns RISK score (0-25)
     */
    static calculateRiskScore(probability: number, impact: number): number {
        return probability * impact;
    }

    /**
     * Calculate VALUE score
     * Formula: Distinctness × Induction to Action
     * 
     * @param distinctness - Does this test provide NEW information? (1-5)
     * @param inductionToAction - Would dev team prioritize fixing if this test fails? (1-5)
     * @returns VALUE score (0-25)
     */
    static calculateValueScore(distinctness: number, inductionToAction: number): number {
        return distinctness * inductionToAction;
    }

    /**
     * Calculate COST EFFICIENCY score
     * Formula: Easy to write × Quick to write
     * 
     * @param easyToWrite - Implementation complexity (1=hard, 5=easy)
     * @param quickToWrite - Time to implement (1=slow, 5=fast)
     * @returns COST EFFICIENCY score (0-25)
     */
    static calculateCostEfficiencyScore(easyToWrite: number, quickToWrite: number): number {
        return easyToWrite * quickToWrite;
    }

    /**
     * Calculate HISTORY score
     * Formula: Bug count × Affected areas
     * 
     * @param bugCount - How often bugs occur in this area (1-5)
     * @param affectedAreas - Number of areas affected by this functionality (1-5)
     * @returns HISTORY score (0-25)
     */
    static calculateHistoryScore(bugCount: number, affectedAreas: number): number {
        return bugCount * affectedAreas;
    }

    /**
     * Calculate total score for Angie's model
     * Formula: risk + value + costEfficiency + history
     * 
     * @param scores - Individual scores
     * @returns Total score (0-100)
     */
    static calculateTotalScore(scores: {
        risk: number;
        value: number;
        costEfficiency: number;
        history: number;
    }): number {
        return scores.risk + scores.value + scores.costEfficiency + scores.history;
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
     * Calculate all scores for a test case using Angie's model
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
            total: number;
        };
        recommendation: Recommendation;
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

        const risk = this.calculateRiskScore(probability, impact);
        const value = this.calculateValueScore(distinctness, inductionToAction);
        const costEfficiency = this.calculateCostEfficiencyScore(easyToWrite, quickToWrite);
        const history = this.calculateHistoryScore(bugCount, affectedAreas);

        const scores = {
            risk,
            value,
            costEfficiency,
            history,
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

        // Total
        lines.push(`Total Score: ${testCase.scores.total}/100`);
        lines.push(`Recommendation: ${testCase.recommendation}`);

        return lines.join('\n');
    }
}
