/**
 * StateDiagramService Tests
 * 
 * Unit tests for state diagram parsing, validation, diffing, and test case generation
 */

import { describe, it, expect } from 'vitest';
import { StateDiagramService } from './StateDiagramService';
import {
    type StateDiagram,
    type State,
    ChangeType,
    ImplementationType,
    DataSource
} from '../types/models';

describe('StateDiagramService', () => {
    // Helper to create a basic state diagram
    const createStateDiagram = (states: Record<string, State>, applicationName = 'TestApp'): StateDiagram => ({
        version: '1.0',
        applicationName,
        states,
        metadata: {
            generated: new Date().toISOString()
        }
    });

    // Helper to create a basic state
    const createState = (overrides: Partial<State> = {}): State => ({
        description: 'Test State',
        actions: ['action1'],
        transitions: { action1: 'nextState' },
        ...overrides
    });

    describe('parseStateDiagram', () => {
        it('should parse valid state diagram JSON', () => {
            const diagram = createStateDiagram({
                state1: createState()
            });
            const json = JSON.stringify(diagram);

            const parsed = StateDiagramService.parseStateDiagram(json);

            expect(parsed.applicationName).toBe('TestApp');
            expect(parsed.states).toHaveProperty('state1');
        });

        it('should throw error for malformed JSON', () => {
            expect(() => {
                StateDiagramService.parseStateDiagram('{ invalid json }');
            }).toThrow('Malformed JSON');
        });

        it('should throw error for missing states object', () => {
            const invalidDiagram = { applicationName: 'Test' };
            const json = JSON.stringify(invalidDiagram);

            expect(() => {
                StateDiagramService.parseStateDiagram(json);
            }).toThrow('missing or invalid "states" object');
        });

        it('should throw error for missing applicationName', () => {
            const invalidDiagram = { states: {} };
            const json = JSON.stringify(invalidDiagram);

            expect(() => {
                StateDiagramService.parseStateDiagram(json);
            }).toThrow('missing or invalid "applicationName"');
        });

        it('should add default version if missing', () => {
            const diagram = { applicationName: 'Test', states: {} };
            const json = JSON.stringify(diagram);

            const parsed = StateDiagramService.parseStateDiagram(json);

            expect(parsed.version).toBe('1.0');
        });

        it('should add default metadata if missing', () => {
            const diagram = { applicationName: 'Test', states: {}, version: '1.0' };
            const json = JSON.stringify(diagram);

            const parsed = StateDiagramService.parseStateDiagram(json);

            expect(parsed.metadata).toBeDefined();
            expect(parsed.metadata.generated).toBeDefined();
        });
    });

    describe('validateStateDiagram', () => {
        it('should validate a correct state diagram', () => {
            const diagram = createStateDiagram({
                initial: createState({ transitions: { action1: 'state2' } }),
                state2: createState({ transitions: {} })
            });

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(true);
        });

        it('should warn about empty state diagram', () => {
            const diagram = createStateDiagram({});

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('no states');
        });

        it('should detect missing actions array', () => {
            const diagram = createStateDiagram({
                state1: { transitions: {} } as State
            });

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(false);
            expect(result.warnings.some(w => w.message.includes('missing required "actions"'))).toBe(true);
        });

        it('should detect missing transitions object', () => {
            const diagram = createStateDiagram({
                state1: { actions: [], transitions: {} } as State
            });
            // Remove transitions to test validation
            delete (diagram.states.state1 as any).transitions;

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(false);
            expect(result.warnings.some(w => w.message.includes('missing required "transitions"'))).toBe(true);
        });

        it('should warn about dead-end states', () => {
            const diagram = createStateDiagram({
                initial: createState({ transitions: { action1: 'deadEnd' } }),
                deadEnd: createState({ transitions: {} })
            });

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.warnings.some(w => w.message.includes('dead end'))).toBe(true);
        });

        it('should detect invalid transition targets', () => {
            const diagram = createStateDiagram({
                state1: createState({ transitions: { action1: 'nonExistent' } })
            });

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.isValid).toBe(false);
            expect(result.warnings.some(w => w.message.includes('non-existent state'))).toBe(true);
        });

        it('should warn about unreachable states', () => {
            const diagram = createStateDiagram({
                initial: createState({ transitions: {} }),
                unreachable: createState({ transitions: {} })
            });

            const result = StateDiagramService.validateStateDiagram(diagram);

            expect(result.warnings.some(w => w.message.includes('unreachable'))).toBe(true);
        });
    });

    describe('diffStateDiagrams', () => {
        it('should detect added states', () => {
            const previous = createStateDiagram({
                state1: createState()
            });
            const current = createStateDiagram({
                state1: createState(),
                state2: createState()
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.added).toContain('state2');
            expect(diff.added).toHaveLength(1);
        });

        it('should detect removed states', () => {
            const previous = createStateDiagram({
                state1: createState(),
                state2: createState()
            });
            const current = createStateDiagram({
                state1: createState()
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.removed).toContain('state2');
            expect(diff.removed).toHaveLength(1);
        });

        it('should detect unchanged states', () => {
            const state = createState();
            const previous = createStateDiagram({ state1: state });
            const current = createStateDiagram({ state1: state });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.unchanged).toContain('state1');
            expect(diff.modified).toHaveLength(0);
        });

        it('should detect modified implementation', () => {
            const previous = createStateDiagram({
                state1: createState({ implementation: ImplementationType.LOOP_SAME })
            });
            const current = createStateDiagram({
                state1: createState({ implementation: ImplementationType.CUSTOM })
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0].stateId).toBe('state1');
            expect(diff.modified[0].changes.implementation).toBeDefined();
        });

        it('should detect added actions', () => {
            const previous = createStateDiagram({
                state1: createState({ actions: ['action1'] })
            });
            const current = createStateDiagram({
                state1: createState({ actions: ['action1', 'action2'] })
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0].changes.actionsAdded).toContain('action2');
        });

        it('should detect removed actions', () => {
            const previous = createStateDiagram({
                state1: createState({ actions: ['action1', 'action2'] })
            });
            const current = createStateDiagram({
                state1: createState({ actions: ['action1'] })
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0].changes.actionsRemoved).toContain('action2');
        });

        it('should detect added transitions', () => {
            const previous = createStateDiagram({
                state1: createState({ transitions: { action1: 'state2' } })
            });
            const current = createStateDiagram({
                state1: createState({ transitions: { action1: 'state2', action2: 'state3' } })
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0].changes.transitionsAdded).toHaveProperty('action2');
        });

        it('should detect removed transitions', () => {
            const previous = createStateDiagram({
                state1: createState({ transitions: { action1: 'state2', action2: 'state3' } })
            });
            const current = createStateDiagram({
                state1: createState({ transitions: { action1: 'state2' } })
            });

            const diff = StateDiagramService.diffStateDiagrams(previous, current);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0].changes.transitionsRemoved).toHaveProperty('action2');
        });
    });

    describe('calculateAffectedAreas', () => {
        it('should count outgoing transitions', () => {
            const diagram = createStateDiagram({
                state1: createState({
                    transitions: { action1: 'state2', action2: 'state3' }
                }),
                state2: createState({ transitions: {} }),
                state3: createState({ transitions: {} })
            });

            const affected = StateDiagramService.calculateAffectedAreas('state1', diagram);

            expect(affected).toBe(2); // 2 outgoing, 0 incoming
        });

        it('should count incoming transitions', () => {
            const diagram = createStateDiagram({
                state1: createState({ transitions: { action1: 'state2' } }),
                state2: createState({ transitions: {} }),
                state3: createState({ transitions: { action1: 'state2' } })
            });

            const affected = StateDiagramService.calculateAffectedAreas('state2', diagram);

            expect(affected).toBe(2); // 0 outgoing, 2 incoming
        });

        it('should cap connected components at 5', () => {
            const diagram = createStateDiagram({
                state1: createState({
                    transitions: {
                        action1: 'state2',
                        action2: 'state2'
                    }
                }),
                state2: createState({
                    transitions: {
                        action1: 'state3',
                        action2: 'state3',
                        action3: 'state3',
                        action4: 'state3'
                    }
                }),
                state3: createState({ transitions: {} }),
                state4: createState({
                    transitions: {
                        action1: 'state2'
                    }
                })
            });

            const affected = StateDiagramService.calculateAffectedAreas('state2', diagram);

            // state2 has 4 outgoing + 2 incoming = 6, capped at 5
            expect(affected).toBe(5);
        });

        it('should return 1 for non-existent state', () => {
            const diagram = createStateDiagram({
                state1: createState()
            });

            const affected = StateDiagramService.calculateAffectedAreas('nonExistent', diagram);

            expect(affected).toBe(1);
        });
    });

    describe('detectChangeType', () => {
        it('should detect behavior change for added actions', () => {
            const modification = {
                stateId: 'state1',
                changes: {
                    actionsAdded: ['newAction']
                }
            };

            const changeType = StateDiagramService.detectChangeType(modification);

            expect(changeType).toBe(ChangeType.MODIFIED_BEHAVIOR);
        });

        it('should detect behavior change for removed actions', () => {
            const modification = {
                stateId: 'state1',
                changes: {
                    actionsRemoved: ['oldAction']
                }
            };

            const changeType = StateDiagramService.detectChangeType(modification);

            expect(changeType).toBe(ChangeType.MODIFIED_BEHAVIOR);
        });

        it('should detect behavior change for transition changes', () => {
            const modification = {
                stateId: 'state1',
                changes: {
                    transitionsAdded: { action1: 'state2' }
                }
            };

            const changeType = StateDiagramService.detectChangeType(modification);

            expect(changeType).toBe(ChangeType.MODIFIED_BEHAVIOR);
        });

        it('should detect UI change for implementation change', () => {
            const modification = {
                stateId: 'state1',
                changes: {
                    implementation: {
                        old: ImplementationType.LOOP_SAME,
                        new: ImplementationType.CUSTOM
                    }
                }
            };

            const changeType = StateDiagramService.detectChangeType(modification);

            expect(changeType).toBe(ChangeType.MODIFIED_UI);
        });

        it('should detect UI change for lastModified only', () => {
            const modification = {
                stateId: 'state1',
                changes: {
                    lastModified: {
                        old: '2024-01-01',
                        new: '2024-01-02'
                    }
                }
            };

            const changeType = StateDiagramService.detectChangeType(modification);

            expect(changeType).toBe(ChangeType.MODIFIED_UI);
        });
    });

    describe('generateTestCases', () => {
        it('should generate test cases for new states', () => {
            const diagram = createStateDiagram({
                state1: createState({ description: 'New State' })
            });
            const diff = {
                added: ['state1'],
                removed: [],
                modified: [],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases).toHaveLength(1);
            expect(testCases[0].testName).toBe('New State');
            expect(testCases[0].changeType).toBe(ChangeType.NEW);
            expect(testCases[0].source).toBe(DataSource.STATE_DIAGRAM);
            expect(testCases[0].stateId).toBe('state1');
        });

        it('should generate test cases for modified states', () => {
            const diagram = createStateDiagram({
                state1: createState({ description: 'Modified State' })
            });
            const diff = {
                added: [],
                removed: [],
                modified: [{
                    stateId: 'state1',
                    changes: {
                        actionsAdded: ['newAction']
                    }
                }],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases).toHaveLength(1);
            expect(testCases[0].testName).toBe('Modified State');
            expect(testCases[0].changeType).toBe(ChangeType.MODIFIED_BEHAVIOR);
            expect(testCases[0].notes).toContain('Actions added');
        });

        it('should use state description as test name', () => {
            const diagram = createStateDiagram({
                state1: createState({ description: 'Login Page' })
            });
            const diff = {
                added: ['state1'],
                removed: [],
                modified: [],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases[0].testName).toBe('Login Page');
        });

        it('should use stateId as fallback test name', () => {
            const diagram = createStateDiagram({
                loginState: createState({ description: undefined })
            });
            const diff = {
                added: ['loginState'],
                removed: [],
                modified: [],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases[0].testName).toBe('loginState');
        });

        it('should calculate scores for generated test cases', () => {
            const diagram = createStateDiagram({
                state1: createState({ implementation: ImplementationType.LOOP_SAME })
            });
            const diff = {
                added: ['state1'],
                removed: [],
                modified: [],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases[0].scores).toBeDefined();
            expect(testCases[0].scores.total).toBeGreaterThan(0);
            expect(testCases[0].recommendation).toBeDefined();
        });

        it('should set default values for user-adjustable fields', () => {
            const diagram = createStateDiagram({
                state1: createState()
            });
            const diff = {
                added: ['state1'],
                removed: [],
                modified: [],
                unchanged: []
            };

            const testCases = StateDiagramService.generateTestCases(diff, diagram);

            expect(testCases[0].userFrequency).toBe(3);
            expect(testCases[0].businessImpact).toBe(3);
            expect(testCases[0].isLegal).toBe(false);
        });
    });

    describe('generateExistingFunctionality', () => {
        it('should generate entries for all states', () => {
            const diagram = createStateDiagram({
                state1: createState({ description: 'State 1' }),
                state2: createState({ description: 'State 2' })
            });

            const entries = StateDiagramService.generateExistingFunctionality(diagram);

            expect(entries).toHaveLength(2);
            expect(entries[0].name).toBe('State 1');
            expect(entries[1].name).toBe('State 2');
        });

        it('should set source to state-diagram', () => {
            const diagram = createStateDiagram({
                state1: createState()
            });

            const entries = StateDiagramService.generateExistingFunctionality(diagram);

            expect(entries[0].source).toBe(DataSource.STATE_DIAGRAM);
        });

        it('should link to state ID', () => {
            const diagram = createStateDiagram({
                loginState: createState()
            });

            const entries = StateDiagramService.generateExistingFunctionality(diagram);

            expect(entries[0].stateId).toBe('loginState');
        });

        it('should use implementation from state', () => {
            const diagram = createStateDiagram({
                state1: createState({ implementation: ImplementationType.LOOP_DIFFERENT })
            });

            const entries = StateDiagramService.generateExistingFunctionality(diagram);

            expect(entries[0].implementation).toBe(ImplementationType.LOOP_DIFFERENT);
        });

        it('should use lastModified as lastTested', () => {
            const lastModified = '2024-01-15T10:00:00Z';
            const diagram = createStateDiagram({
                state1: createState({ lastModified })
            });

            const entries = StateDiagramService.generateExistingFunctionality(diagram);

            expect(entries[0].lastTested).toBe(lastModified);
        });
    });
});
