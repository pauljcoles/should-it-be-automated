/**
 * Utility functions for scoring-related operations
 */

import type { TestCase } from '../types/models';

/**
 * Determines if a test case has been fully scored (all required fields filled in, not using defaults)
 * 
 * For both Normal Mode and Teaching Mode:
 * - At least one of the 8 core fields must be non-default: impact, probOfUse, distinctness, 
 *   fixProbability, easyToWrite, quickToWrite, similarity, breakFreq
 * 
 * Default values:
 * - Most fields default to 3
 * - History fields (similarity, breakFreq) default to 1
 * 
 * @param testCase - The test case to check
 * @returns true if at least one required field has been explicitly set (not using defaults)
 */
export function isTestCaseScored(testCase: TestCase): boolean {
    // Check if test name is filled
    if (!testCase.testName || testCase.testName.trim() === '') {
        return false;
    }

    // For both modes, check the same 8 core fields
    const hasNonDefaultImpact = testCase.impact !== undefined && testCase.impact !== 3;
    const hasNonDefaultProbOfUse = testCase.probOfUse !== undefined && testCase.probOfUse !== 3;
    const hasNonDefaultDistinctness = testCase.distinctness !== undefined && testCase.distinctness !== 3;
    const hasNonDefaultFixProbability = testCase.fixProbability !== undefined && testCase.fixProbability !== 3;
    const hasNonDefaultEasyToWrite = testCase.easyToWrite !== undefined && testCase.easyToWrite !== 3;
    const hasNonDefaultQuickToWrite = testCase.quickToWrite !== undefined && testCase.quickToWrite !== 3;
    const hasNonDefaultSimilarity = testCase.similarity !== undefined && testCase.similarity !== 1;
    const hasNonDefaultBreakFreq = testCase.breakFreq !== undefined && testCase.breakFreq !== 1;

    // A test case is considered "scored" if at least one field has been changed from default
    // This indicates the user has started scoring it
    return (
        hasNonDefaultImpact ||
        hasNonDefaultProbOfUse ||
        hasNonDefaultDistinctness ||
        hasNonDefaultFixProbability ||
        hasNonDefaultEasyToWrite ||
        hasNonDefaultQuickToWrite ||
        hasNonDefaultSimilarity ||
        hasNonDefaultBreakFreq
    );
}
