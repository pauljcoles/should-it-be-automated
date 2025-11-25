/**
 * Core data models for the Test Prioritisation Scoring Tool
 * Based on Angie Jones' risk-based scoring methodology
 */

// ============================================================================
// Enums (as const objects for TypeScript compatibility)
// ============================================================================

/**
 * Classification of whether code has changed
 */
export const CodeChange = {
    NEW: 'new',
    MODIFIED: 'modified',
    UI_ONLY: 'ui-only',
    UNCHANGED: 'unchanged'
} as const;

export type CodeChange = typeof CodeChange[keyof typeof CodeChange];

/**
 * Classification of technical implementation approach
 */
export const ImplementationType = {
    LOOP_SAME: 'standard-components',       // Standard reusable components
    LOOP_DIFFERENT: 'new-pattern',          // New pattern or variation
    CUSTOM: 'custom-implementation',        // Custom implementation
    MIX: 'hybrid'                           // Hybrid approach
} as const;

export type ImplementationType = typeof ImplementationType[keyof typeof ImplementationType];

/**
 * Automation recommendation based on total score
 */
export const Recommendation = {
    AUTOMATE: 'AUTOMATE',           // Score >= 67
    MAYBE: 'MAYBE',                 // Score 34-66
    DONT_AUTOMATE: 'DON\'T AUTOMATE' // Score < 34
} as const;

export type Recommendation = typeof Recommendation[keyof typeof Recommendation];

/**
 * Initial judgment (gut feel) before scoring
 */
export const InitialJudgment = {
    DEFINITELY_AUTOMATE: 'definitely-automate',
    PROBABLY_AUTOMATE: 'probably-automate',
    UNSURE: 'unsure',
    PROBABLY_SKIP: 'probably-skip',
    DEFINITELY_SKIP: 'definitely-skip'
} as const;

export type InitialJudgment = typeof InitialJudgment[keyof typeof InitialJudgment];

/**
 * Status of existing functionality
 */
export const FunctionalityStatus = {
    STABLE: 'stable',
    UNSTABLE: 'unstable',
    DEPRECATED: 'deprecated'
} as const;

export type FunctionalityStatus = typeof FunctionalityStatus[keyof typeof FunctionalityStatus];

/**
 * Application mode
 */
export const AppMode = {
    NORMAL: 'normal',       // Simple calculator based on Angie Jones' exact model
    TEACHING: 'teaching'    // Calculator + educational guidance for learning teams
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

/**
 * Source of data entry
 */
export const DataSource = {
    MANUAL: 'manual',
    STATE_DIAGRAM: 'state-diagram',
    BERT: 'bert'
} as const;

export type DataSource = typeof DataSource[keyof typeof DataSource];

// ============================================================================
// Score Interfaces
// ============================================================================

/**
 * Individual and total scores for a test case
 */
export interface Scores {
    // ========================================================================
    // Angie Jones' Model Scores (Both Modes)
    // ========================================================================

    /** RISK score: Probability × Impact (0-25) */
    risk: number;

    /** VALUE score: Distinctness × Induction to Action (0-25) */
    value: number;

    /** COST EFFICIENCY score: Easy to write × Quick to write (0-25) */
    costEfficiency?: number;

    /** HISTORY score: Bug count × Affected areas (0-25) */
    history: number;

    /** Legal score: 20 if legal requirement, else 0 (Teaching mode only) */
    legal: number;

    // ========================================================================
    // Common
    // ========================================================================

    /** Total score: sum of all individual scores (0-100 for normal, 0-120 for teaching) */
    total: number;

    // ========================================================================
    // Legacy/Deprecated Fields
    // ========================================================================

    /** @deprecated Legacy field - use risk instead */
    customerRisk?: number;

    /** @deprecated Legacy field - use value instead */
    valueScore?: number;

    /** @deprecated Legacy field - use costEfficiency instead */
    costScore?: number;

    /** @deprecated Legacy field - use history instead */
    historyScore?: number;

    /** @deprecated Legacy field - use costEfficiency instead */
    effort?: number;

    /** @deprecated Legacy field - use costEfficiency instead */
    ease?: number;
}

// ============================================================================
// Test Case Interface
// ============================================================================

/**
 * Represents a single test case for automation evaluation
 */
export interface TestCase {
    /** Unique identifier (UUID) */
    id: string;

    /** Name/description of the test case (required, max 100 chars) */
    testName: string;

    // ========================================================================
    // Teaching Mode Fields (used when appMode = 'teaching')
    // ========================================================================

    /** Did the code change? */
    codeChange: CodeChange;

    /** Organisational pressure to automate (1-5, where 1=no pressure, 5=high pressure) */
    organisationalPressure: number;

    /** How easy is it to automate this test? (1=very difficult, 5=very easy) */
    easyToAutomate?: number;

    /** How quick is it to automate this test? (1=very slow, 5=very fast) */
    quickToAutomate?: number;

    /** Whether this is a legal/compliance requirement */
    isLegal: boolean;

    /** How frequently users interact with this feature (1-5) */
    /** Usage frequency: How often users interact with this feature (1-5) */
    userFrequency: number;

    /** Impact if broken: What happens if this feature fails (1-5) */
    businessImpact: number;

    /** Number of areas affected by this functionality (1-5) */
    affectedAreas: number;

    // ========================================================================
    // Normal Mode Fields (Angie Jones' exact model, used when appMode = 'normal')
    // ========================================================================

    /** Gut feel: Initial instinct about automation (1-5) */
    gutFeel?: 1 | 2 | 3 | 4 | 5;

    /** Customer Risk: Impact if this breaks (1-5) */
    impact?: number;

    /** Customer Risk: Probability of use (1-5) */
    probOfUse?: number;

    /** Value: Distinctness - does this test provide NEW information? (1-5, MANUAL) */
    distinctness?: number;

    /** Value: Fix probability - would dev team prioritize fixing if this fails? (1-5) */
    fixProbability?: number;

    /** Cost Efficiency: Easy to write (1-5, where 1=hard, 5=easy) */
    easyToWrite?: number;

    /** Cost Efficiency: Quick to write (1-5, where 1=slow, 5=fast) */
    quickToWrite?: number;

    /** History: Similarity - have similar areas broken before? (1-5) */
    similarity?: number;

    /** History: Break frequency - how often does this area break? (1-5) */
    breakFreq?: number;

    // ========================================================================
    // Common Fields
    // ========================================================================

    /** Additional notes or context */
    notes?: string;

    /** BERT scenario identifier for integration */
    bertScenarioId?: string;

    /** Associated Jira ticket */
    jiraTicket?: string;

    /** Calculated scores */
    scores: Scores;

    /** Automation recommendation based on total score */
    recommendation: Recommendation;

    /** Origin of this test case */
    source?: DataSource;

    /** Link to state diagram state ID */
    stateId?: string;

    /** Initial judgment (gut feel) before scoring - for bias detection and learning */
    initialJudgment?: InitialJudgment;

    /** User-controlled flag to mark this test case as fully scored */
    isScored?: boolean;

    /** User-controlled flag to mark this test case as descoped/junk */
    isDescoped?: boolean;

    /** @deprecated Legacy field - use easyToAutomate and quickToAutomate instead */
    implementationType?: ImplementationType;
}

// ============================================================================
// Existing Functionality Interface
// ============================================================================

/**
 * Represents already-implemented functionality for context
 */
export interface ExistingFunctionality {
    /** Unique identifier */
    id: string;

    /** Name of the functionality */
    name: string;

    /** Implementation approach used */
    implementation: ImplementationType;

    /** Last time this was tested (ISO date string) */
    lastTested?: string;

    /** Current status of the functionality */
    status: FunctionalityStatus;

    /** Origin of this entry */
    source: DataSource;

    /** Link to state diagram state ID */
    stateId?: string;
}

// ============================================================================
// State Diagram Interfaces
// ============================================================================

/**
 * Represents a single state in a state diagram
 */
export interface State {
    /** Description of the state */
    description?: string;

    /** Available actions in this state */
    actions: string[];

    /** Transitions: action -> target state ID */
    transitions: Record<string, string>;

    /** Required data for this state */
    required_data?: string[];

    /** Implementation approach for this state */
    implementation?: ImplementationType;

    /** Last modification timestamp (ISO date string) */
    lastModified?: string;

    /** Notes about changes to this state */
    changeNotes?: string;
}

/**
 * Complete state diagram for model-based testing
 */
export interface StateDiagram {
    /** Version of the state diagram format */
    version: string;

    /** Name of the application/journey */
    applicationName: string;

    /** Map of state ID to state definition */
    states: Record<string, State>;

    /** Additional metadata */
    metadata: {
        team?: string;
        environment?: string;
        /** Generation timestamp (ISO string) */
        generated: string;
    };
}

/**
 * Details of modifications to a state
 */
export interface StateModification {
    /** ID of the modified state */
    stateId: string;

    /** Specific changes detected */
    changes: {
        lastModified?: {
            old: string;
            new: string;
        };
        implementation?: {
            old: ImplementationType;
            new: ImplementationType;
        };
        actionsAdded?: string[];
        actionsRemoved?: string[];
        transitionsAdded?: Record<string, string>;
        transitionsRemoved?: Record<string, string>;
    };
}

/**
 * Result of comparing two state diagram versions
 */
export interface StateDiff {
    /** State IDs that were added */
    added: string[];

    /** State IDs that were removed */
    removed: string[];

    /** States that were modified with details */
    modified: StateModification[];

    /** State IDs that remained unchanged */
    unchanged: string[];
}

// ============================================================================
// Application State Interface
// ============================================================================

/**
 * Complete application state for persistence
 */
export interface AppState {
    /** Version of the application state format */
    version: string;

    /** Name of the project */
    projectName: string;

    /** Creation timestamp (ISO string) */
    created: string;

    /** Last modification timestamp (ISO string) */
    lastModified: string;

    /** List of existing functionality entries */
    existingFunctionality: ExistingFunctionality[];

    /** List of test cases */
    testCases: TestCase[];

    /** Additional project metadata */
    metadata: {
        team?: string;
        sprint?: string;
        environment?: string;
    };
}

// ============================================================================
// Filter and UI State Interfaces
// ============================================================================

/**
 * Filter criteria for test cases
 */
export interface FilterState {
    /** Filter by recommendation */
    recommendation?: Recommendation;

    /** Search term for test name or notes */
    searchTerm?: string;

    /** Filter by code change */
    codeChange?: CodeChange;

    /** Filter by implementation type */
    implementationType?: ImplementationType;

    /** Filter by legal requirement */
    isLegal?: boolean;

    /** Filter by descoped status: true = show only descoped, false = hide descoped, undefined = show all */
    isDescoped?: boolean;
}

/**
 * Sort configuration
 */
export interface SortConfig {
    /** Column to sort by */
    column: keyof TestCase | 'scores.total' | 'scores.risk' | 'scores.value' | 'scores.effort' | 'scores.ease' | 'scores.history' | 'scores.legal';

    /** Sort direction */
    direction: 'asc' | 'desc';
}

/**
 * Validation warning for a test case
 */
export interface ValidationWarning {
    /** Severity level */
    level: 'error' | 'warning' | 'info';

    /** Warning message */
    message: string;

    /** Field that triggered the warning */
    field?: keyof TestCase;
}

/**
 * Validation result
 */
export interface ValidationResult {
    /** Whether validation passed */
    isValid: boolean;

    /** List of warnings or errors */
    warnings: ValidationWarning[];
}

// ============================================================================
// BERT Integration Interfaces
// ============================================================================

/**
 * BERT scenario data structure for clipboard integration
 */
export interface BERTScenario {
    /** BERT scenario identifier */
    bertScenarioId: string;

    /** Title of the scenario */
    scenarioTitle: string;

    /** Associated Jira ticket */
    jiraTicket?: string;

    /** Detected code change from BERT analysis */
    detectedCodeChange?: CodeChange;

    /** Detected implementation approach from BERT analysis */
    detectedImplementation?: ImplementationType;

    /** Additional context or notes */
    context?: string;
}

// ============================================================================
// Summary Statistics Interface
// ============================================================================

/**
 * Aggregate statistics for test cases
 */
export interface SummaryStats {
    /** Total number of test cases */
    totalCount: number;

    /** Count by recommendation */
    recommendationCounts: {
        [Recommendation.AUTOMATE]: number;
        [Recommendation.MAYBE]: number;
        [Recommendation.DONT_AUTOMATE]: number;
    };

    /** Average total score */
    averageScore: number;

    /** Count of legal requirements */
    legalCount: number;

    /** Count by code change */
    codeChangeCounts: {
        [CodeChange.NEW]: number;
        [CodeChange.MODIFIED]: number;
        [CodeChange.UI_ONLY]: number;
        [CodeChange.UNCHANGED]: number;
    };
}
