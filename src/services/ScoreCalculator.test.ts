/**
 * Unit tests for ScoreCalculator service
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ScoreCalculator } from './ScoreCalculator';
import { ChangeType, ImplementationType, Recommendation, type TestCase } from '../types/models';

describe('ScoreCalculator', () => {
    describe('calculateRiskScore', () => {
        it('should calculate risk score as frequency × impact', () => {
            expect(ScoreCalculator.calculateRiskScore(1, 1)).toBe(1);
            expect(ScoreCalculator.calculateRiskScore(3, 4)).toBe(12);
            expect(ScoreCalculator.calculateRiskScore(5, 5)).toBe(25);
        });
    });

    describe('calculateValueScore', () => {
        it('should calculate value score for unchanged', () => {
            expect(ScoreCalculator.calculateValueScore(ChangeType.UNCHANGED, 3)).toBe(0);
        });

        it('should calculate value score for modified-ui', () => {
            expect(ScoreCalculator.calculateValueScore(ChangeType.MODIFIED_UI, 3)).toBe(4);
        });

        it('should calculate value score for modified-behavior', () => {
            expect(ScoreCalculator.calculateValueScore(ChangeType.MODIFIED_BEHAVIOR, 3)).toBe(20);
        });

        it('should calculate value score for new with business impact', () => {
            expect(ScoreCalculator.calculateValueScore(ChangeType.NEW, 3)).toBe(15);
            expect(ScoreCalculator.calculateValueScore(ChangeType.NEW, 5)).toBe(25);
        });
    });

    describe('calculateEaseScore', () => {
        it('should calculate ease score for loop-same', () => {
            expect(ScoreCalculator.calculateEaseScore(ImplementationType.LOOP_SAME)).toBe(25);
        });

        it('should calculate ease score for loop-different', () => {
            expect(ScoreCalculator.calculateEaseScore(ImplementationType.LOOP_DIFFERENT)).toBe(15);
        });

        it('should calculate ease score for custom', () => {
            expect(ScoreCalculator.calculateEaseScore(ImplementationType.CUSTOM)).toBe(5);
        });

        it('should calculate ease score for mix', () => {
            expect(ScoreCalculator.calculateEaseScore(ImplementationType.MIX)).toBe(10);
        });
    });

    describe('calculateHistoryScore', () => {
        it('should return affected areas when <= 5', () => {
            expect(ScoreCalculator.calculateHistoryScore(1)).toBe(1);
            expect(ScoreCalculator.calculateHistoryScore(3)).toBe(3);
            expect(ScoreCalculator.calculateHistoryScore(5)).toBe(5);
        });

        it('should cap at 5 when affected areas > 5', () => {
            expect(ScoreCalculator.calculateHistoryScore(6)).toBe(5);
            expect(ScoreCalculator.calculateHistoryScore(10)).toBe(5);
        });
    });

    describe('calculateLegalScore', () => {
        it('should return 20 when legal requirement', () => {
            expect(ScoreCalculator.calculateLegalScore(true)).toBe(20);
        });

        it('should return 0 when not legal requirement', () => {
            expect(ScoreCalculator.calculateLegalScore(false)).toBe(0);
        });
    });

    describe('calculateTotalScore', () => {
        it('should sum all individual scores', () => {
            const scores = {
                risk: 12,
                value: 15,
                ease: 25,
                history: 3,
                legal: 20
            };
            expect(ScoreCalculator.calculateTotalScore(scores)).toBe(75);
        });

        it('should handle zero scores', () => {
            const scores = {
                risk: 0,
                value: 0,
                ease: 0,
                history: 0,
                legal: 0
            };
            expect(ScoreCalculator.calculateTotalScore(scores)).toBe(0);
        });

        it('should handle maximum scores', () => {
            const scores = {
                risk: 25,
                value: 25,
                ease: 25,
                history: 5,
                legal: 20
            };
            expect(ScoreCalculator.calculateTotalScore(scores)).toBe(100);
        });
    });

    describe('getRecommendation', () => {
        it('should return AUTOMATE for scores >= 67', () => {
            expect(ScoreCalculator.getRecommendation(67)).toBe(Recommendation.AUTOMATE);
            expect(ScoreCalculator.getRecommendation(75)).toBe(Recommendation.AUTOMATE);
            expect(ScoreCalculator.getRecommendation(100)).toBe(Recommendation.AUTOMATE);
        });

        it('should return MAYBE for scores 34-66', () => {
            expect(ScoreCalculator.getRecommendation(34)).toBe(Recommendation.MAYBE);
            expect(ScoreCalculator.getRecommendation(50)).toBe(Recommendation.MAYBE);
            expect(ScoreCalculator.getRecommendation(66)).toBe(Recommendation.MAYBE);
        });

        it('should return DON\'T AUTOMATE for scores < 34', () => {
            expect(ScoreCalculator.getRecommendation(0)).toBe(Recommendation.DONT_AUTOMATE);
            expect(ScoreCalculator.getRecommendation(20)).toBe(Recommendation.DONT_AUTOMATE);
            expect(ScoreCalculator.getRecommendation(33)).toBe(Recommendation.DONT_AUTOMATE);
        });
    });

    describe('explainScore', () => {
        it('should generate detailed explanation for a test case', () => {
            const testCase: TestCase = {
                id: '123',
                testName: 'Test Login',
                changeType: ChangeType.NEW,
                implementationType: ImplementationType.LOOP_SAME,
                isLegal: true,
                userFrequency: 5,
                businessImpact: 5,
                affectedAreas: 3,
                scores: {
                    risk: 25,
                    value: 25,
                    ease: 25,
                    history: 3,
                    legal: 20,
                    total: 98
                },
                recommendation: Recommendation.AUTOMATE
            };

            const explanation = ScoreCalculator.explainScore(testCase);

            expect(explanation).toContain('Score Breakdown:');
            expect(explanation).toContain('Risk Score: 25/25');
            expect(explanation).toContain('Value Score: 25/25');
            expect(explanation).toContain('Effort Score: 25/25');
            expect(explanation).toContain('History Score: 3/5');
            expect(explanation).toContain('Legal Score: 20/20');
            expect(explanation).toContain('Total Score: 98/100');
            expect(explanation).toContain('Recommendation: AUTOMATE');
        });
    });

    describe('Property-Based Tests', () => {
        /**
         * Feature: test-prioritization-tool, Property 5: Risk score calculation correctness
         * Validates: Requirements 2.1
         * 
         * Property: For any user frequency value (1-5) and business impact value (1-5),
         * the risk score should equal their product.
         */
        it('risk score equals frequency times impact for all valid inputs', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 5 }),
                    fc.integer({ min: 1, max: 5 }),
                    (userFrequency, businessImpact) => {
                        const riskScore = ScoreCalculator.calculateRiskScore(userFrequency, businessImpact);
                        return riskScore === userFrequency * businessImpact;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
