/**
 * ScoreCalculator Service
 * 
 * Implements Angie Jones' risk-based scoring methodology for test automation prioritization.
 * Calculates individual scores (risk, value, ease, history, legal) and provides recommendations.
 */

import { ChangeType, ImplementationType, Recommendation, type TestCase } from '../types/models';

/**
 * Service class for calculating test automation priority scores
 */
export class ScoreCalculator {
    /**
     * Calculate risk score based on usage frequency and impact if broken
     * Formula: userFrequency × businessImpact
     * 
     * @param userFrequency - Usage frequency: How often users interact with this feature (1-5)
     * @param businessImpact - Impact if broken: What happens if this feature fails (1-5)
     * @returns Risk score (0-25)
     */
    static calculateRiskScore(userFrequency: number, businessImpact: number): number {
        return userFrequency * businessImpact;
    }

    /**
     * Calculate value score based on change type and impact if broken
     * Formula: distinctness × induction to action
     * 
     * @param changeType - How the functionality has changed
     * @param businessImpact - Impact if broken: What happens if this feature fails (1-5)
     * @returns Value score (0-25)
     */
    static calculateValueScore(changeType: ChangeType, businessImpact: number): number {
        // Distinctness mapping
        const distinctness: Record<ChangeType, number> = {
            [ChangeType.UNCHANGED]: 0,
            [ChangeType.MODIFIED_UI]: 2,
            [ChangeType.MODIFIED_BEHAVIOR]: 4,
            [ChangeType.NEW]: 5
        };

        // Induction to action mapping
        const inductionToAction: Record<ChangeType, number> = {
            [ChangeType.UNCHANGED]: 1,
            [ChangeType.MODIFIED_UI]: 2,
            [ChangeType.MODIFIED_BEHAVIOR]: 5,
            [ChangeType.NEW]: businessImpact
        };

        return distinctness[changeType] * inductionToAction[changeType];
    }

    /**
     * Calculate effort score based on ease and speed of automation
     * Formula: easyToAutomate × quickToAutomate
     * 
     * @param easyToAutomate - How easy is it to automate? (1-5)
     * @param quickToAutomate - How quick is it to automate? (1-5)
     * @returns Effort score (0-25)
     */
    static calculateEffortScore(easyToAutomate: number, quickToAutomate: number): number {
        return easyToAutomate * quickToAutomate;
    }

    /**
     * @deprecated Use calculateEffortScore instead
     * Calculate ease score based on implementation type
     * Formula: implementationRisk × 5
     * 
     * @param implementationType - Technical implementation approach
     * @returns Ease score (0-25)
     */
    static calculateEaseScore(implementationType: ImplementationType): number {
        // Implementation risk mapping
        const implementationRisk: Record<ImplementationType, number> = {
            [ImplementationType.LOOP_SAME]: 5,
            [ImplementationType.LOOP_DIFFERENT]: 3,
            [ImplementationType.CUSTOM]: 1,
            [ImplementationType.MIX]: 2
        };

        return implementationRisk[implementationType] * 5;
    }

    /**
     * Calculate history score based on connected components
     * Formula: min(affectedAreas, 5)
     * 
     * @param affectedAreas - Number of areas affected by this functionality (1-5)
     * @returns History score (0-5)
     */
    static calculateHistoryScore(affectedAreas: number): number {
        return Math.min(affectedAreas, 5);
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
     * Calculate total score as sum of all individual scores
     * 
     * @param scores - Individual scores (risk, value, effort, history, legal)
     * @returns Total score (0-100)
     */
    static calculateTotalScore(scores: Omit<import('../types/models').Scores, 'total'>): number {
        const effortScore = scores.effort ?? scores.ease ?? 0;
        return scores.risk + scores.value + effortScore + scores.history + scores.legal;
    }

    /**
     * Determine automation recommendation based on total score
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
     * Generate a detailed explanation of how the score was calculated
     * Used for tooltips and help text
     * 
     * @param testCase - The test case to explain
     * @returns Formatted explanation string
     */
    static explainScore(testCase: TestCase): string {
        const lines: string[] = [];

        lines.push('Score Breakdown:');
        lines.push('');

        // Risk Score
        lines.push(`Risk Score: ${testCase.scores.risk}/25`);
        lines.push(`  = Usage Frequency (${testCase.userFrequency}) × Impact if Broken (${testCase.businessImpact})`);
        lines.push('');

        // Value Score
        lines.push(`Value Score: ${testCase.scores.value}/25`);
        const distinctness = this.getDistinctnessValue(testCase.changeType);
        const induction = this.getInductionValue(testCase.changeType, testCase.businessImpact);
        lines.push(`  = Distinctness (${distinctness}) × Induction to Action (${induction})`);
        lines.push(`  Change Type: ${testCase.changeType}`);
        lines.push('');

        // Effort Score
        const effortScore = testCase.scores.effort ?? testCase.scores.ease ?? 0;
        lines.push(`Effort Score: ${effortScore}/25`);
        if (testCase.easyToAutomate !== undefined && testCase.quickToAutomate !== undefined) {
            lines.push(`  = Easy to Automate (${testCase.easyToAutomate}) × Quick to Automate (${testCase.quickToAutomate})`);
        } else if (testCase.implementationType) {
            // Legacy calculation
            const implRisk = this.getImplementationRiskValue(testCase.implementationType);
            lines.push(`  = Implementation Risk (${implRisk}) × 5 [Legacy]`);
            lines.push(`  Implementation: ${testCase.implementationType}`);
        }
        lines.push('');

        // History Score
        lines.push(`History Score: ${testCase.scores.history}/5`);
        lines.push(`  = min(Connected Components (${testCase.affectedAreas}), 5)`);
        lines.push('');

        // Legal Score
        lines.push(`Legal Score: ${testCase.scores.legal}/20`);
        lines.push(`  = ${testCase.isLegal ? '20 (Legal requirement)' : '0 (Not a legal requirement)'}`);
        lines.push('');

        // Total
        lines.push(`Total Score: ${testCase.scores.total}/100`);
        lines.push(`Recommendation: ${testCase.recommendation}`);

        return lines.join('\n');
    }

    /**
     * Helper method to get distinctness value for explanation
     */
    private static getDistinctnessValue(changeType: ChangeType): number {
        const distinctness: Record<ChangeType, number> = {
            [ChangeType.UNCHANGED]: 0,
            [ChangeType.MODIFIED_UI]: 2,
            [ChangeType.MODIFIED_BEHAVIOR]: 4,
            [ChangeType.NEW]: 5
        };
        return distinctness[changeType];
    }

    /**
     * Helper method to get induction to action value for explanation
     */
    private static getInductionValue(changeType: ChangeType, businessImpact: number): number {
        const inductionToAction: Record<ChangeType, number | string> = {
            [ChangeType.UNCHANGED]: 1,
            [ChangeType.MODIFIED_UI]: 2,
            [ChangeType.MODIFIED_BEHAVIOR]: 5,
            [ChangeType.NEW]: businessImpact
        };
        return typeof inductionToAction[changeType] === 'number'
            ? inductionToAction[changeType] as number
            : businessImpact;
    }

    /**
     * Helper method to get implementation risk value for explanation
     */
    private static getImplementationRiskValue(implementationType: ImplementationType): number {
        const implementationRisk: Record<ImplementationType, number> = {
            [ImplementationType.LOOP_SAME]: 5,
            [ImplementationType.LOOP_DIFFERENT]: 3,
            [ImplementationType.CUSTOM]: 1,
            [ImplementationType.MIX]: 2
        };
        return implementationRisk[implementationType];
    }
}
