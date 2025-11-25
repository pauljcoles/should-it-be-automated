/**
 * Tests for scoring utility functions
 */

import { describe, it, expect } from 'vitest';
import { isTestCaseScored } from './scoringUtils';
import type { TestCase } from '../types/models';
import { CodeChange, Recommendation } from '../types/models';

describe('isTestCaseScored', () => {
    const createTestCase = (overrides: Partial<TestCase> = {}): TestCase => ({
        id: 'test-1',
        testName: 'Test Case',
        codeChange: CodeChange.NEW,
        organisationalPressure: 1,
        userFrequency: 3,
        businessImpact: 3,
        affectedAreas: 3,
        isLegal: false,
        scores: {
            risk: 9,
            value: 9,
            costEfficiency: 9,
            history: 1,
            legal: 0,
            total: 28
        },
        recommendation: Recommendation.DONT_AUTOMATE,
        ...overrides
    });

    it('should return false when all fields are at default values', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(false);
    });

    it('should return false when test name is empty', () => {
        const testCase = createTestCase({
            testName: '',
            impact: 5,
            probOfUse: 5
        });

        expect(isTestCaseScored(testCase)).toBe(false);
    });

    it('should return true when impact is changed from default', () => {
        const testCase = createTestCase({
            impact: 5,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when probOfUse is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 5,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when distinctness is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 5,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when fixProbability is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 5,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when easyToWrite is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 5,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when quickToWrite is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 5,
            similarity: 1,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when similarity is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 3,
            breakFreq: 1
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when breakFreq is changed from default', () => {
        const testCase = createTestCase({
            impact: 3,
            probOfUse: 3,
            distinctness: 3,
            fixProbability: 3,
            easyToWrite: 3,
            quickToWrite: 3,
            similarity: 1,
            breakFreq: 3
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return true when multiple fields are changed from default', () => {
        const testCase = createTestCase({
            impact: 5,
            probOfUse: 4,
            distinctness: 5,
            fixProbability: 4,
            easyToWrite: 2,
            quickToWrite: 2,
            similarity: 3,
            breakFreq: 2
        });

        expect(isTestCaseScored(testCase)).toBe(true);
    });

    it('should return false when fields are undefined', () => {
        const testCase = createTestCase({
            impact: undefined,
            probOfUse: undefined,
            distinctness: undefined,
            fixProbability: undefined,
            easyToWrite: undefined,
            quickToWrite: undefined,
            similarity: undefined,
            breakFreq: undefined
        });

        expect(isTestCaseScored(testCase)).toBe(false);
    });
});
