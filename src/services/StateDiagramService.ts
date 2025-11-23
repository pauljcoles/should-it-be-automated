/**
 * StateDiagramService
 * 
 * Handles parsing, validation, comparison, and test case generation from state diagrams.
 * Supports model-based testing workflows by detecting changes between diagram versions.
 */

import {
    type StateDiagram,
    type State,
    type StateDiff,
    type StateModification,
    type TestCase,
    type ValidationResult,
    type ValidationWarning,
    type ExistingFunctionality,
    CodeChange,
    ImplementationType,
    DataSource,
    FunctionalityStatus
} from '../types/models';
import { ScoreCalculator } from './ScoreCalculator';

/**
 * Service class for state diagram operations
 */
export class StateDiagramService {
    /**
     * Parse and validate a state diagram from JSON string
     * 
     * @param json - JSON string containing state diagram
     * @returns Parsed StateDiagram object
     * @throws Error if JSON is malformed or invalid
     */
    static parseStateDiagram(json: string): StateDiagram {
        try {
            const parsed = JSON.parse(json);

            // Validate required fields
            if (!parsed.states || typeof parsed.states !== 'object') {
                throw new Error('Invalid state diagram: missing or invalid "states" object');
            }

            if (!parsed.applicationName || typeof parsed.applicationName !== 'string') {
                throw new Error('Invalid state diagram: missing or invalid "applicationName"');
            }

            // Ensure version exists
            if (!parsed.version) {
                parsed.version = '1.0';
            }

            // Ensure metadata exists
            if (!parsed.metadata) {
                parsed.metadata = {
                    generated: new Date().toISOString()
                };
            } else if (!parsed.metadata.generated) {
                parsed.metadata.generated = new Date().toISOString();
            }

            return parsed as StateDiagram;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Malformed JSON: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Validate a state diagram structure and detect issues
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

    /**
     * Compare two state diagram versions and identify changes
     * 
     * @param previous - Previous version of the state diagram
     * @param current - Current version of the state diagram
     * @returns StateDiff object containing all changes
     */
    static diffStateDiagrams(previous: StateDiagram, current: StateDiagram): StateDiff {
        const prevIds = Object.keys(previous.states);
        const currIds = Object.keys(current.states);

        // Identify added and removed states
        const added = currIds.filter(id => !prevIds.includes(id));
        const removed = prevIds.filter(id => !currIds.includes(id));

        // Compare existing states
        const modified: StateModification[] = [];
        const unchanged: string[] = [];

        for (const id of currIds.filter(id => prevIds.includes(id))) {
            const prev = previous.states[id];
            const curr = current.states[id];

            const changes = this.detectStateChanges(prev, curr);

            if (Object.keys(changes).length > 0) {
                modified.push({ stateId: id, changes });
            } else {
                unchanged.push(id);
            }
        }

        return { added, removed, modified, unchanged };
    }

    /**
     * Detect specific changes between two state versions
     * 
     * @param prev - Previous state version
     * @param curr - Current state version
     * @returns Object containing detected changes
     */
    private static detectStateChanges(prev: State, curr: State): StateModification['changes'] {
        const changes: StateModification['changes'] = {};

        // Check lastModified
        if (prev.lastModified !== curr.lastModified) {
            changes.lastModified = {
                old: prev.lastModified || '',
                new: curr.lastModified || ''
            };
        }

        // Check implementation
        if (prev.implementation !== curr.implementation) {
            changes.implementation = {
                old: prev.implementation || ImplementationType.CUSTOM,
                new: curr.implementation || ImplementationType.CUSTOM
            };
        }

        // Check actions
        const prevActions = prev.actions || [];
        const currActions = curr.actions || [];
        const actionsAdded = currActions.filter(a => !prevActions.includes(a));
        const actionsRemoved = prevActions.filter(a => !currActions.includes(a));

        if (actionsAdded.length > 0) {
            changes.actionsAdded = actionsAdded;
        }
        if (actionsRemoved.length > 0) {
            changes.actionsRemoved = actionsRemoved;
        }

        // Check transitions
        const prevTransitions = prev.transitions || {};
        const currTransitions = curr.transitions || {};

        const transitionsAdded: Record<string, string> = {};
        const transitionsRemoved: Record<string, string> = {};

        // Find added or modified transitions
        for (const [action, target] of Object.entries(currTransitions)) {
            if (prevTransitions[action] !== target) {
                transitionsAdded[action] = target;
            }
        }

        // Find removed transitions
        for (const [action, target] of Object.entries(prevTransitions)) {
            if (!(action in currTransitions)) {
                transitionsRemoved[action] = target;
            }
        }

        if (Object.keys(transitionsAdded).length > 0) {
            changes.transitionsAdded = transitionsAdded;
        }
        if (Object.keys(transitionsRemoved).length > 0) {
            changes.transitionsRemoved = transitionsRemoved;
        }

        return changes;
    }

    /**
     * Generate test cases from state diagram changes
     * 
     * @param diff - State diagram diff result
     * @param diagram - Current state diagram
     * @returns Array of generated test cases
     */
    static generateTestCases(diff: StateDiff, diagram: StateDiagram): TestCase[] {
        const testCases: TestCase[] = [];

        // Generate test cases for new states
        for (const stateId of diff.added) {
            const state = diagram.states[stateId];
            const testCase = this.createTestCaseFromState(
                stateId,
                state,
                CodeChange.NEW,
                diagram,
                `New state: ${stateId}`
            );
            testCases.push(testCase);
        }

        // Generate test cases for modified states
        for (const modification of diff.modified) {
            const state = diagram.states[modification.stateId];
            const changeType = this.detectChangeType(modification);
            const changeNotes = this.formatChangeNotes(modification.changes);

            const testCase = this.createTestCaseFromState(
                modification.stateId,
                state,
                changeType,
                diagram,
                changeNotes
            );
            testCases.push(testCase);
        }

        return testCases;
    }

    /**
     * Create a test case from a state
     * 
     * @param stateId - State identifier
     * @param state - State definition
     * @param changeType - Type of change detected
     * @param diagram - Complete state diagram for context
     * @param notes - Notes about the change
     * @returns Generated test case
     */
    private static createTestCaseFromState(
        stateId: string,
        state: State,
        changeType: CodeChange,
        diagram: StateDiagram,
        notes: string
    ): TestCase {
        const implementationType = state.implementation || ImplementationType.CUSTOM;
        const affectedAreas = this.calculateAffectedAreas(stateId, diagram);

        // Default values for user-adjustable fields
        const userFrequency = 3;
        const businessImpact = 3;
        const isLegal = false;

        // Map legacy implementation type to effort scores
        // This maintains backward compatibility with state diagrams that have implementation field
        const implementationToEffort: Record<string, { easy: number; quick: number }> = {
            'standard-components': { easy: 5, quick: 5 },
            'new-pattern': { easy: 3, quick: 5 },
            'custom-implementation': { easy: 1, quick: 5 },
            'hybrid': { easy: 2, quick: 5 }
        };
        const effort = implementationToEffort[implementationType] || { easy: 3, quick: 3 };
        const easyToAutomate = effort.easy;
        const quickToAutomate = effort.quick;

        // Calculate scores
        const risk = ScoreCalculator.calculateRiskScore(userFrequency, businessImpact);
        const value = ScoreCalculator.calculateValueScore(changeType, businessImpact);
        const effortScore = ScoreCalculator.calculateEffortScore(easyToAutomate, quickToAutomate);
        const history = ScoreCalculator.calculateHistoryScore(affectedAreas);
        const legal = ScoreCalculator.calculateLegalScore(isLegal);
        const total = ScoreCalculator.calculateTotalScore({ risk, value, effort: effortScore, history, legal });
        const recommendation = ScoreCalculator.getRecommendation(total);

        return {
            id: this.generateUUID(),
            testName: state.description || stateId,
            codeChange: changeType,
            organisationalPressure: 1,
            easyToAutomate,
            quickToAutomate,
            isLegal,
            userFrequency,
            businessImpact,
            affectedAreas,
            notes: state.changeNotes || notes,
            source: DataSource.STATE_DIAGRAM,
            stateId,
            implementationType, // Keep for backward compatibility
            scores: { risk, value, effort: effortScore, history, legal, total },
            recommendation
        };
    }

    /**
     * Calculate connected components based on incoming and outgoing transitions
     * 
     * @param stateId - State identifier
     * @param diagram - Complete state diagram
     * @returns Number of connected components (capped at 5)
     */
    static calculateAffectedAreas(stateId: string, diagram: StateDiagram): number {
        const state = diagram.states[stateId];

        if (!state) {
            return 1; // Default if state not found
        }

        // Count outgoing transitions
        const outgoing = Object.keys(state.transitions || {}).length;

        // Count incoming transitions
        const incoming = Object.values(diagram.states).filter(s =>
            Object.values(s.transitions || {}).includes(stateId)
        ).length;

        // Total connected components (capped at 5)
        return Math.min(outgoing + incoming, 5);
    }

    /**
     * Detect the type of change based on state modifications
     * 
     * @param modification - State modification details
     * @returns Detected change type
     */
    static detectChangeType(modification: StateModification): CodeChange {
        const { changes } = modification;

        // If actions or transitions changed, it's a behavior change
        if (changes.actionsAdded || changes.actionsRemoved ||
            changes.transitionsAdded || changes.transitionsRemoved) {
            return CodeChange.MODIFIED;
        }

        // If implementation changed, it's a UI change
        if (changes.implementation) {
            return CodeChange.UI_ONLY;
        }

        // If only lastModified changed, treat as UI change
        if (changes.lastModified && Object.keys(changes).length === 1) {
            return CodeChange.UI_ONLY;
        }

        // Default to behavior change for any other modifications
        return CodeChange.MODIFIED;
    }

    /**
     * Format change notes into a human-readable string
     * 
     * @param changes - State modification changes
     * @returns Formatted change notes
     */
    private static formatChangeNotes(changes: StateModification['changes']): string {
        const notes: string[] = [];

        if (changes.implementation) {
            notes.push(`Implementation changed: ${changes.implementation.old} → ${changes.implementation.new}`);
        }

        if (changes.actionsAdded && changes.actionsAdded.length > 0) {
            notes.push(`Actions added: ${changes.actionsAdded.join(', ')}`);
        }

        if (changes.actionsRemoved && changes.actionsRemoved.length > 0) {
            notes.push(`Actions removed: ${changes.actionsRemoved.join(', ')}`);
        }

        if (changes.transitionsAdded && Object.keys(changes.transitionsAdded).length > 0) {
            const transitions = Object.entries(changes.transitionsAdded)
                .map(([action, target]) => `${action} → ${target}`)
                .join(', ');
            notes.push(`Transitions added: ${transitions}`);
        }

        if (changes.transitionsRemoved && Object.keys(changes.transitionsRemoved).length > 0) {
            const transitions = Object.entries(changes.transitionsRemoved)
                .map(([action, target]) => `${action} → ${target}`)
                .join(', ');
            notes.push(`Transitions removed: ${transitions}`);
        }

        if (changes.lastModified) {
            notes.push(`Last modified: ${changes.lastModified.new}`);
        }

        return notes.join('; ');
    }

    /**
     * Generate existing functionality entries from a state diagram
     * 
     * @param diagram - State diagram
     * @returns Array of existing functionality entries
     */
    static generateExistingFunctionality(diagram: StateDiagram): ExistingFunctionality[] {
        const entries: ExistingFunctionality[] = [];

        for (const [stateId, state] of Object.entries(diagram.states)) {
            entries.push({
                id: this.generateUUID(),
                name: state.description || stateId,
                implementation: state.implementation || ImplementationType.CUSTOM,
                lastTested: state.lastModified,
                status: FunctionalityStatus.STABLE,
                source: DataSource.STATE_DIAGRAM,
                stateId
            });
        }

        return entries;
    }

    /**
     * Generate a UUID v4
     * 
     * @returns UUID string
     */
    private static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
