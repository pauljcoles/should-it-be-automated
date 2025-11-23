/**
 * Unit tests for ValidationService
 */

import { describe, it, expect } from 'vitest';
import { ValidationService } from './ValidationService';
import {
    CodeChange,
    type TestCase,
    type StateDiagram,
    ImplementationType,
    Recommendation
} from '../types/models';

describe('ValidationService', () => {
    // Helper function to create a valid test case
    const createTestCase = (overrides: Partial<TestCase> = {}): TestCase => ({
        id: '123',
        testName: 'Test Case',
        codeChange: CodeChange.NEW,
        organisationalPressure: 1,
        implementationType: ImplementationType.CUSTOM,
        isLegal: false,
        userFrequency: 3,
        businessImpact: 3,
        affectedAreas: 2,
        scores: {
            risk: 9,
            value: 15,
            ease: 5,
            history: 2,
            legal: 0,
            total: 31
        },
        recommendation: Recommendation.DONT_AUTOMATE,
        ...overrides
    });

    describe('getValidationWarnings', () => {
        it('should return error for empty test name', () => {
            const testCase = createTestCase({ testName: '' });
            const warnings = ValidationService.getValidationWarnings(testCase);

            expect(warnings).toHaveLength(1);
            expect(warnings[0].level).toBe('error');
            expect(warnings[0].message).toContain('Test name is required');
            expect(warnings[0].field).toBe('testName');
        });

        it('should return warning for test name exceeding 100 characters', () => {
            const longName = 'a'.repeat(101);
            const testCase = createTestCase({ testName: longName });
            const warnings = ValidationService.getValidationWarnings(testCase);

            const lengthWarning = warnings.find(w => w.message.includes('exceeds 100 characters'));
            expect(lengthWarning).toBeDefined();
            expect(lengthWarning?.level).toBe('warning');
        });

        it('should return warning for unchanged high-frequency tests', () => {
            const testCase = createTestCase({
                codeChange: CodeChange.UNCHANGED,
                organisationalPressure: 1,
                userFrequency: 4
            });
            const warnings = ValidationService.getValidationWarnings(testCase);

            const unchangedWarning = warnings.find(w => w.message.includes('Unchanged code'));
            expect(unchangedWarning).toBeDefined();
            expect(unchangedWarning?.level).toBe('warning');
            expect(unchangedWarning?.message).toContain('exploratory testing');
        });

        it('should return info for low-scoring standard components', () => {
            const testCase = createTestCase({
                implementationType: ImplementationType.LOOP_SAME,
                scores: { ...createTestCase().scores, total: 35 }
            });
            const warnings = ValidationService.getValidationWarnings(testCase);

            const componentWarning = warnings.find(w => w.message.includes('Standard components'));
            expect(componentWarning).toBeDefined();
            expect(componentWarning?.level).toBe('info');
            expect(componentWarning?.message).toContain('maintenance cost');
        });

        it('should return info for legal requirements', () => {
            const testCase = createTestCase({
                isLegal: true,
                scores: { ...createTestCase().scores, total: 45 }
            });
            const warnings = ValidationService.getValidationWarnings(testCase);

            const legalWarning = warnings.find(w => w.message.includes('Legal requirement'));
            expect(legalWarning).toBeDefined();
            expect(legalWarning?.level).toBe('info');
            expect(legalWarning?.message).toContain('compliance');
        });

        it('should return warning for high frequency but low impact', () => {
            const testCase = createTestCase({
                userFrequency: 5,
                businessImpact: 1
            });
            const warnings = ValidationService.getValidationWarnings(testCase);

            const suspiciousWarning = warnings.find(w => w.message.includes('High frequency but low impact'));
            expect(suspiciousWarning).toBeDefined();
            expect(suspiciousWarning?.level).toBe('warning');
        });

        it('should return no warnings for valid test case', () => {
            const testCase = createTestCase();
            const warnings = ValidationService.getValidationWarnings(testCase);

            expect(warnings).toHaveLength(0);
        });
    });

    describe('validateTestCase', () => {
        it('should return invalid for test case with errors', () => {
            const testCase = createTestCase({ testName: '' });
            const result = ValidationService.validateTestCase(testCase);

            expect(result.isValid).toBe(false);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should return valid for test case with only warnings', () => {
            const testCase = createTestCase({
                codeChange: CodeChange.UNCHANGED,
                organisationalPressure: 1,
                userFrequency: 4
            });
            const result = ValidationService.validateTestCase(testCase);

            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should return valid for valid test case', () => {
            const testCase = createTestCase();
            const result = ValidationService.validateTestCase(testCase);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe('validateStateDiagram', () => {
        it('should return warning for empty state diagram', () => {
            const diagram: StateDiagram = {
                version: '1.0',
                applicationName: 'Test App',
                states: {},
                metadata: { generated: new Date().toISOString() }
            };

            const result = ValidationService.validateStateDiagram(diagram);

            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('contains no states');
        });

        it('should detect unreachable states', () => {
            const diagram: StateDiagram = {
                version: '1.0',
                applicationName: 'Test App',
                states: {
                    'initial': {
                        actions: ['start'],
                        transitions: { 'start': 'state2' }
                    },
                    'state2': {
                        actions: ['continue'],
                        transitions: { 'continue': 'state3' }
                    },
                    'state3': {
                        actions: ['finish'],
                        transitions: {}
                    },
                    'orphan': {
                        actions: ['action'],
                        transitions: {}
                    }
                },
                metadata: { generated: new Date().toISOString() }
            };

            const result = ValidationService.validateStateDiagram(diagram);

            const unreachableWarning = result.warnings.find(w =>
                w.message.includes('orphan') && w.message.includes('no incoming transitions')
            );
            expect(unreachableWarning).toBeDefined();
            expect(unreachableWarning?.level).toBe('warning');
        });

        it('should detect dead-end states', () => {
            const diagram: StateDiagram = {
                version: '1.0',
                applicationName: 'Test App',
                states: {
                    'initial': {
                        actions: ['start'],
                        transitions: { 'start': 'deadend' }
                    },
                    'deadend': {
                        actions: ['stuck'],
                        transitions: {}
                    }
                },
                metadata: { generated: new Date().toISOString() }
            };

            const result = ValidationService.validateStateDiagram(diagram);

            const deadendWarning = result.warnings.find(w =>
                w.message.includes('deadend') && w.message.includes('no outgoing transitions')
            );
            expect(deadendWarning).toBeDefined();
            expect(deadendWarning?.level).toBe('warning');
        });

        it('should detect invalid transitions', () => {
            const diagram: StateDiagram = {
                version: '1.0',
                applicationName: 'Test App',
                states: {
                    'initial': {
                        actions: ['start'],
                        transitions: { 'start': 'nonexistent' }
                    }
                },
                metadata: { generated: new Date().toISOString() }
            };

            const result = ValidationService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(false);
            const invalidTransition = result.warnings.find(w =>
                w.message.includes('invalid transition') && w.message.includes('nonexistent')
            );
            expect(invalidTransition).toBeDefined();
            expect(invalidTransition?.level).toBe('error');
        });

        it('should return valid for well-formed state diagram', () => {
            const diagram: StateDiagram = {
                version: '1.0',
                applicationName: 'Test App',
                states: {
                    'initial': {
                        actions: ['start'],
                        transitions: { 'start': 'state2' }
                    },
                    'state2': {
                        actions: ['continue', 'back'],
                        transitions: {
                            'continue': 'state3',
                            'back': 'initial'
                        }
                    },
                    'state3': {
                        actions: ['finish'],
                        transitions: { 'finish': 'initial' }
                    }
                },
                metadata: { generated: new Date().toISOString() }
            };

            const result = ValidationService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });
    });
});
