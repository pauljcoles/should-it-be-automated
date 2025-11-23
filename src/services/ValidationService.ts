/**
 * ValidationService
 * 
 * Provides validation and smart suggestions for test cases and state diagrams.
 * Implements validation rules and intelligent warnings to help users make better decisions.
 */

import {
    type TestCase,
    type StateDiagram,
    type ValidationResult,
    type ValidationWarning,
    CodeChange,
    ImplementationType
} from '../types/models';

/**
 * Service class for validation and smart suggestions
 */
export class ValidationService {
    /**
     * Get all validation warnings for a test case
     * Includes both error-level and warning-level validations
     * 
     * @param testCase - Test case to validate
     * @returns Array of validation warnings
     */
    static getValidationWarnings(testCase: TestCase): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        // Validate test name (required field)
        if (!testCase.testName || testCase.testName.trim().length === 0) {
            warnings.push({
                level: 'error',
                message: 'Test name is required. Please enter a name for this test case.',
                field: 'testName'
            });
        }

        // Validate test name length
        if (testCase.testName && testCase.testName.length > 100) {
            warnings.push({
                level: 'warning',
                message: 'Test name exceeds 100 characters',
                field: 'testName'
            });
        }

        // Smart suggestion: unchanged high-frequency tests
        if (testCase.codeChange === CodeChange.UNCHANGED && testCase.userFrequency > 3) {
            warnings.push({
                level: 'warning',
                message: '⚠️ Unchanged code typically scores low. Consider exploratory testing instead.',
                field: 'codeChange'
            });
        }

        // Smart suggestion: low-scoring standard components
        if (testCase.implementationType === ImplementationType.LOOP_SAME && testCase.scores.total < 40) {
            warnings.push({
                level: 'info',
                message: '💡 Standard components are easy to automate. Consider the maintenance cost vs. value.',
                field: 'implementationType'
            });
        }

        // Smart suggestion: legal requirements
        if (testCase.isLegal && testCase.scores.total < 50) {
            warnings.push({
                level: 'info',
                message: '📋 Legal requirement detected. This will be tested for compliance.',
                field: 'isLegal'
            });
        }

        // Additional validation: suspicious value combinations
        if (testCase.userFrequency === 5 && testCase.businessImpact === 1) {
            warnings.push({
                level: 'warning',
                message: 'High frequency but low impact - verify these values are correct',
                field: 'userFrequency'
            });
        }

        if (testCase.userFrequency === 1 && testCase.businessImpact === 5) {
            warnings.push({
                level: 'warning',
                message: 'Low frequency but high impact - verify these values are correct',
                field: 'businessImpact'
            });
        }

        return warnings;
    }

    /**
     * Validate a single test case
     * Returns validation result with pass/fail status
     * 
     * @param testCase - Test case to validate
     * @returns Validation result
     */
    static validateTestCase(testCase: TestCase): ValidationResult {
        const warnings = this.getValidationWarnings(testCase);

        // Check if there are any error-level warnings
        const hasErrors = warnings.some(w => w.level === 'error');

        return {
            isValid: !hasErrors,
            warnings
        };
    }

    /**
     * Validate a state diagram structure and detect issues
     * Checks for unreachable states, dead ends, and invalid transitions
     * 
     * @param diagram - State diagram to validate
     * @returns Validation result with warnings and errors
     */
    static validateStateDiagram(diagram: StateDiagram): ValidationResult {
        const warnings: ValidationWarning[] = [];

        // Check if states object is empty
        const stateIds = Object.keys(diagram.states);
        if (stateIds.length === 0) {
            warnings.push({
                level: 'warning',
                message: 'State diagram contains no states'
            });
            return { isValid: warnings.length === 0, warnings };
        }

        // Track all state IDs for transition validation
        const stateIdSet = new Set(stateIds);

        // Track states with incoming transitions
        const statesWithIncoming = new Set<string>();

        // Validate each state
        for (const [stateId, state] of Object.entries(diagram.states)) {
            // Check for required fields
            if (!state.actions || !Array.isArray(state.actions)) {
                warnings.push({
                    level: 'error',
                    message: `State "${stateId}" is missing required "actions" array`
                });
            }

            if (!state.transitions || typeof state.transitions !== 'object') {
                warnings.push({
                    level: 'error',
                    message: `State "${stateId}" is missing required "transitions" object`
                });
                continue;
            }

            // Check for dead-end states (no outgoing transitions)
            if (Object.keys(state.transitions).length === 0) {
                warnings.push({
                    level: 'warning',
                    message: `State "${stateId}" has no outgoing transitions (potential dead end)`
                });
            }

            // Validate transition targets
            for (const [action, targetState] of Object.entries(state.transitions)) {
                if (!stateIdSet.has(targetState)) {
                    warnings.push({
                        level: 'error',
                        message: `State "${stateId}" has invalid transition: action "${action}" points to non-existent state "${targetState}"`
                    });
                } else {
                    statesWithIncoming.add(targetState);
                }
            }
        }

        // Check for unreachable states (no incoming transitions)
        // Note: We assume the first state or a state named "initial" is the entry point
        const potentialEntryPoints = ['initial', 'start', 'home', stateIds[0]];
        const entryPoint = stateIds.find(id => potentialEntryPoints.includes(id.toLowerCase())) || stateIds[0];

        for (const stateId of stateIds) {
            if (stateId !== entryPoint && !statesWithIncoming.has(stateId)) {
                warnings.push({
                    level: 'warning',
                    message: `State "${stateId}" has no incoming transitions (potentially unreachable)`
                });
            }
        }

        // Determine if validation passed (no errors)
        const hasErrors = warnings.some(w => w.level === 'error');

        return {
            isValid: !hasErrors,
            warnings
        };
    }
}
