# Design Document

## Overview

The Test Prioritisation Scoring Tool is a single-page React application that provides an Excel-like interface for evaluating test automation candidates using Angie Jones' risk-based scoring methodology. The application operates entirely client-side with no backend dependencies, using localStorage for persistence and JSON for data interchange.

### Key Design Principles

1. **Client-Side Only**: All computation, storage, and state management happens in the browser
2. **Immediate Feedback**: Score calculations update in real-time as users edit fields
3. **Data Portability**: JSON import/export enables version control and team collaboration
4. **Progressive Enhancement**: Core functionality works without advanced features; state diagram integration is additive
5. **Performance First**: Optimized rendering for 100+ test cases with minimal re-renders

### User Workflows

**Basic Workflow (Manual Entry)**:
1. User adds test case rows manually
2. User fills in change type, implementation type, and risk factors
3. Application calculates scores automatically
4. User reviews recommendations and makes automation decisions
5. User exports JSON for team sharing

**State Diagram Workflow (Model-Based Testing)**:
1. User uploads state diagram JSON from their model-based testing tool
2. Application compares with previous version (if exists)
3. Application auto-generates test cases for new/modified states
4. User reviews and adjusts risk factors for generated test cases
5. Application provides prioritized list of automation candidates
6. User exports decisions and updated state diagram

## Architecture

### Component Hierarchy

```
App
├── Header
│   ├── UploadButton
│   ├── DownloadButton
│   ├── AddRowButton
│   └── HelpButton
├── MainLayout
│   ├── ExistingFunctionalitySidebar
│   │   ├── SearchBox
│   │   ├── FunctionalityList
│   │   └── AddFunctionalityButton
│   └── TestCaseTable
│       ├── TableFilters
│       │   ├── RecommendationFilter
│       │   └── SearchBox
│       ├── TableHeader (sortable columns)
│       ├── TestCaseRow (repeating)
│       │   ├── EditableCell (inline editing)
│       │   ├── ScoreCell (read-only, calculated)
│       │   ├── RecommendationBadge
│       │   └── ActionButtons (delete, duplicate, copy)
│       └── SummaryStats
├── StateDiagramDiffModal
│   ├── DiffSummary
│   ├── ChangesList
│   └── ImportControls
├── HelpModal
│   ├── TabNavigation
│   └── TabContent
└── TooltipProvider
```

### State Management Strategy

The application uses React Context API for global state management with the following structure:

**AppContext**:
- `testCases`: Array of test case objects
- `existingFunctionality`: Array of existing functionality entries
- `metadata`: Project metadata (name, team, sprint, environment)
- `stateDiagramHistory`: Array of previously uploaded state diagrams
- `filters`: Current filter and sort settings
- `uiState`: UI-specific state (modals, tooltips, etc.)

**State Update Pattern**:
- All state updates trigger automatic score recalculation
- Updates are debounced (500ms) before persisting to localStorage
- Immutable update pattern using spread operators
- Optimistic UI updates with immediate visual feedback

### Data Flow

```
User Input → Component Event Handler → Context Action → State Update → 
Score Calculation → Component Re-render → localStorage Persistence
```

**State Diagram Import Flow**:
```
File Upload → JSON Parse → Format Detection → Schema Validation →
State Diff Calculation → Diff Modal Display → User Confirmation →
Test Case Generation → State Update → localStorage Persistence
```

## Components and Interfaces

### Core Data Models

#### TestCase Interface

```typescript
interface TestCase {
  id: string;                    // UUID
  testName: string;              // Required
  changeType: ChangeType;        // Enum: new, modified-behavior, modified-ui, unchanged
  implementationType: ImplementationType;  // Enum: standard-components, new-pattern, custom-implementation, hybrid
  isLegal: boolean;
  userFrequency: number;         // 1-5
  businessImpact: number;        // 1-5
  affectedAreas: number;         // 1-5
  notes?: string;
  bertScenarioId?: string;
  jiraTicket?: string;
  scores: Scores;                // Calculated
  recommendation: Recommendation; // Calculated
  source?: 'manual' | 'state-diagram' | 'bert';  // Track origin
  stateId?: string;              // Link to state diagram state
}
```

#### Scores Interface

```typescript
interface Scores {
  risk: number;      // 0-25
  value: number;     // 0-25
  ease: number;      // 0-25
  history: number;   // 0-5
  legal: number;     // 0 or 20
  total: number;     // 0-100
}
```

#### ExistingFunctionality Interface

```typescript
interface ExistingFunctionality {
  id: string;
  name: string;
  implementation: ImplementationType;
  lastTested?: string;           // ISO date string
  status: 'stable' | 'unstable' | 'deprecated';
  source: 'manual' | 'state-diagram';
  stateId?: string;              // Link to state diagram state
}
```

#### StateDiagram Interface

```typescript
interface StateDiagram {
  version: string;
  applicationName: string;
  states: Record<string, State>;
  metadata: {
    team?: string;
    environment?: string;
    generated: string;           // ISO timestamp
  };
}

interface State {
  description?: string;
  actions: string[];
  transitions: Record<string, string>;  // action -> targetState
  required_data?: string[];
  implementation?: ImplementationType;
  lastModified?: string;         // ISO date string
  changeNotes?: string;
}
```

#### StateDiff Interface

```typescript
interface StateDiff {
  added: string[];               // New state IDs
  removed: string[];             // Deleted state IDs
  modified: StateModification[]; // Changed states
  unchanged: string[];           // No changes
}

interface StateModification {
  stateId: string;
  changes: {
    lastModified?: { old: string; new: string };
    implementation?: { old: ImplementationType; new: ImplementationType };
    actionsAdded?: string[];
    actionsRemoved?: string[];
    transitionsAdded?: Record<string, string>;
    transitionsRemoved?: Record<string, string>;
  };
}
```

### Key Components

#### TestCaseTable Component

**Responsibilities**:
- Render all test case rows with inline editing
- Handle sorting by any column
- Apply filters (recommendation, search text)
- Manage row selection and bulk operations
- Display summary statistics

**Props**:
```typescript
interface TestCaseTableProps {
  testCases: TestCase[];
  onUpdateTestCase: (id: string, updates: Partial<TestCase>) => void;
  onDeleteTestCase: (id: string) => void;
  onDuplicateTestCase: (id: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}
```

**Performance Optimization**:
- Use React.memo for TestCaseRow components
- Virtualization for 100+ rows (react-window)
- Debounced input handlers for text fields
- Memoized score calculations

#### ScoreCalculator Service

**Responsibilities**:
- Calculate all scores based on test case properties
- Determine recommendation tier
- Provide score calculation explanations for tooltips

**API**:
```typescript
class ScoreCalculator {
  static calculateRiskScore(userFrequency: number, businessImpact: number): number;
  static calculateValueScore(changeType: ChangeType, businessImpact: number): number;
  static calculateEaseScore(implementationType: ImplementationType): number;
  static calculateHistoryScore(affectedAreas: number): number;
  static calculateLegalScore(isLegal: boolean): number;
  static calculateTotalScore(scores: Omit<Scores, 'total'>): number;
  static getRecommendation(totalScore: number): Recommendation;
  static explainScore(testCase: TestCase): string;
}
```

**Score Calculation Formulas**:

```typescript
// Risk Score = User Frequency × Business Impact (0-25)
riskScore = userFrequency * businessImpact;

// Value Score = Distinctness × Induction to Action (0-25)
distinctness = {
  'unchanged': 0,
  'modified-ui': 2,
  'modified-behavior': 4,
  'new': 5
};

inductionToAction = {
  'unchanged': 1,
  'modified-ui': 2,
  'modified-behavior': 5,
  'new': businessImpact
};

valueScore = distinctness[changeType] * inductionToAction[changeType];

// Ease Score = Implementation Risk × 5 (0-25)
implementationRisk = {
  'standard-components': 5,
  'new-pattern': 3,
  'custom-implementation': 1,
  'hybrid': 2
};

easeScore = implementationRisk[implementationType] * 5;

// History Score = min(Affected Areas, 5) (0-5)
historyScore = Math.min(affectedAreas, 5);

// Legal Score = 20 if legal, else 0
legalScore = isLegal ? 20 : 0;

// Total Score (0-100)
totalScore = riskScore + valueScore + easeScore + historyScore + legalScore;

// Recommendation
recommendation = {
  totalScore >= 67: 'AUTOMATE',
  totalScore >= 34: 'MAYBE',
  totalScore < 34: 'DON\'T AUTOMATE'
};
```

#### StateDiagramService

**Responsibilities**:
- Parse and validate state diagram JSON
- Compare two state diagram versions
- Generate test cases from state changes
- Calculate affected areas from transition counts
- Validate state diagram structure

**API**:
```typescript
class StateDiagramService {
  static parseStateDiagram(json: string): StateDiagram;
  static validateStateDiagram(diagram: StateDiagram): ValidationResult;
  static diffStateDiagrams(previous: StateDiagram, current: StateDiagram): StateDiff;
  static generateTestCases(diff: StateDiff, currentDiagram: StateDiagram): TestCase[];
  static calculateAffectedAreas(stateId: string, diagram: StateDiagram): number;
  static detectChangeType(modification: StateModification): ChangeType;
}
```

**Diff Algorithm**:

```typescript
function diffStateDiagrams(previous: StateDiagram, current: StateDiagram): StateDiff {
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
    
    const changes = detectStateChanges(prev, curr);
    
    if (Object.keys(changes).length > 0) {
      modified.push({ stateId: id, changes });
    } else {
      unchanged.push(id);
    }
  }
  
  return { added, removed, modified, unchanged };
}

function detectStateChanges(prev: State, curr: State): StateModification['changes'] {
  const changes: StateModification['changes'] = {};
  
  // Check lastModified
  if (prev.lastModified !== curr.lastModified) {
    changes.lastModified = { old: prev.lastModified, new: curr.lastModified };
  }
  
  // Check implementation
  if (prev.implementation !== curr.implementation) {
    changes.implementation = { old: prev.implementation, new: curr.implementation };
  }
  
  // Check actions
  const actionsAdded = curr.actions.filter(a => !prev.actions.includes(a));
  const actionsRemoved = prev.actions.filter(a => !curr.actions.includes(a));
  if (actionsAdded.length > 0) changes.actionsAdded = actionsAdded;
  if (actionsRemoved.length > 0) changes.actionsRemoved = actionsRemoved;
  
  // Check transitions
  const prevTransitions = Object.entries(prev.transitions);
  const currTransitions = Object.entries(curr.transitions);
  
  const transitionsAdded = Object.fromEntries(
    currTransitions.filter(([k, v]) => prev.transitions[k] !== v)
  );
  const transitionsRemoved = Object.fromEntries(
    prevTransitions.filter(([k, v]) => curr.transitions[k] !== v)
  );
  
  if (Object.keys(transitionsAdded).length > 0) changes.transitionsAdded = transitionsAdded;
  if (Object.keys(transitionsRemoved).length > 0) changes.transitionsRemoved = transitionsRemoved;
  
  return changes;
}
```

**Test Case Generation**:

```typescript
function generateTestCases(diff: StateDiff, diagram: StateDiagram): TestCase[] {
  const testCases: TestCase[] = [];
  
  // Generate test cases for new states
  for (const stateId of diff.added) {
    const state = diagram.states[stateId];
    testCases.push({
      id: generateUUID(),
      testName: state.description || stateId,
      changeType: 'new',
      implementationType: state.implementation || 'custom',
      isLegal: false,
      userFrequency: 3,  // Default, user must adjust
      businessImpact: 3,  // Default, user must adjust
      affectedAreas: calculateAffectedAreas(stateId, diagram),
      notes: state.changeNotes || `New state: ${stateId}`,
      source: 'state-diagram',
      stateId: stateId,
      scores: calculateScores(/* ... */),
      recommendation: getRecommendation(/* ... */)
    });
  }
  
  // Generate test cases for modified states
  for (const modification of diff.modified) {
    const state = diagram.states[modification.stateId];
    const changeNotes = formatChangeNotes(modification.changes);
    
    testCases.push({
      id: generateUUID(),
      testName: state.description || modification.stateId,
      changeType: detectChangeType(modification),
      implementationType: state.implementation || 'custom',
      isLegal: false,
      userFrequency: 3,
      businessImpact: 3,
      affectedAreas: calculateAffectedAreas(modification.stateId, diagram),
      notes: changeNotes,
      source: 'state-diagram',
      stateId: modification.stateId,
      scores: calculateScores(/* ... */),
      recommendation: getRecommendation(/* ... */)
    });
  }
  
  return testCases;
}

function calculateAffectedAreas(stateId: string, diagram: StateDiagram): number {
  const state = diagram.states[stateId];
  
  // Count outgoing transitions
  const outgoing = Object.keys(state.transitions).length;
  
  // Count incoming transitions
  const incoming = Object.values(diagram.states).filter(s =>
    Object.values(s.transitions).includes(stateId)
  ).length;
  
  // Total affected areas (capped at 5)
  return Math.min(outgoing + incoming, 5);
}
```

#### StorageService

**Responsibilities**:
- Persist application state to localStorage
- Load state on application startup
- Manage state diagram version history
- Handle storage quota errors

**API**:
```typescript
class StorageService {
  static saveAppState(state: AppState): void;
  static loadAppState(): AppState | null;
  static saveStateDiagram(diagram: StateDiagram): void;
  static loadStateDiagramHistory(applicationName: string): StateDiagram[];
  static getLatestStateDiagram(applicationName: string): StateDiagram | null;
  static clearAllData(): void;
}
```

**Storage Keys**:
- `test-prioritizer-state`: Current application state
- `test-prioritizer-states-{applicationName}-{timestamp}`: State diagram versions
- `test-prioritizer-metadata`: Application metadata

**Version Management**:
```typescript
function saveStateDiagram(diagram: StateDiagram): void {
  const key = `test-prioritizer-states-${diagram.applicationName}-${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(diagram));
  
  // Clean up old versions (keep last 3)
  const allKeys = Object.keys(localStorage)
    .filter(k => k.startsWith(`test-prioritizer-states-${diagram.applicationName}-`))
    .sort();
  
  if (allKeys.length > 3) {
    const toRemove = allKeys.slice(0, allKeys.length - 3);
    toRemove.forEach(k => localStorage.removeItem(k));
  }
}
```

## Data Models

### Application State Schema

```typescript
interface AppState {
  version: string;
  projectName: string;
  created: string;              // ISO timestamp
  lastModified: string;         // ISO timestamp
  existingFunctionality: ExistingFunctionality[];
  testCases: TestCase[];
  metadata: {
    team?: string;
    sprint?: string;
    environment?: string;
  };
}
```

### Validation Rules

**TestCase Validation**:
- `testName`: Required, max 100 characters
- `userFrequency`: 1-5 integer
- `businessImpact`: 1-5 integer
- `affectedAreas`: 1-5 integer
- `changeType`: Must be valid enum value
- `implementationType`: Must be valid enum value

**StateDiagram Validation**:
- Must have `states` object
- Each state must have `actions` array
- Each state must have `transitions` object
- All transition targets must exist as states
- No circular references without actions (deadlock detection)

**Smart Validation Warnings**:
```typescript
function getValidationWarnings(testCase: TestCase): string[] {
  const warnings: string[] = [];
  
  if (testCase.testName.length > 100) {
    warnings.push('Test name exceeds 100 characters');
  }
  
  if (testCase.changeType === 'unchanged' && testCase.userFrequency > 3) {
    warnings.push('⚠️ Unchanged code typically scores low. Consider exploratory testing instead.');
  }
  
  if (testCase.implementationType === 'standard-components' && testCase.scores.total < 40) {
    warnings.push('💡 Standard components are easy to automate. Consider the maintenance cost vs. value.');
  }
  
  if (testCase.isLegal && testCase.scores.total < 50) {
    warnings.push('📋 Legal requirement detected. This will be tested for compliance.');
  }
  
  if (testCase.userFrequency === 5 && testCase.businessImpact === 1) {
    warnings.push('High frequency but low impact - verify these values are correct');
  }
  
  return warnings;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Row addition increases test case count

*For any* application state with N test cases, adding a new row should result in N+1 test cases with the new row having default values.

**Validates: Requirements 1.1**

### Property 2: Row deletion decreases test case count

*For any* test case in the application, deleting it should remove it from the test cases array and decrease the count by 1.

**Validates: Requirements 1.2**

### Property 3: Duplication preserves field values

*For any* test case, duplicating it should create a new test case with identical field values except the ID (which must be unique) and the test name (which should have " (Copy)" appended).

**Validates: Requirements 1.3**

### Property 4: Field updates are immediately reflected

*For any* test case and any editable field, updating that field should immediately change the value in the application state.

**Validates: Requirements 1.4**

### Property 5: Risk score calculation correctness

*For any* user frequency value (1-5) and business impact value (1-5), the risk score should equal their product.

**Validates: Requirements 2.1**

### Property 6: Value score calculation correctness

*For any* change type and business impact, the value score should equal distinctness × induction to action according to the defined formulas.

**Validates: Requirements 2.2**

### Property 7: Ease score calculation correctness

*For any* implementation type, the ease score should equal the implementation risk multiplied by 5 according to the defined mapping.

**Validates: Requirements 2.3**

### Property 8: History score calculation correctness

*For any* affected areas value, the history score should equal the minimum of that value and 5.

**Validates: Requirements 2.4**

### Property 9: Legal score binary correctness

*For any* test case, the legal score should be 20 if isLegal is true, and 0 if isLegal is false.

**Validates: Requirements 2.5**

### Property 10: Total score is sum of components

*For any* test case, the total score should equal the sum of risk score, value score, ease score, history score, and legal score.

**Validates: Requirements 2.6**

### Property 11: Recommendation tier correctness

*For any* test case, the recommendation should be "AUTOMATE" if total score ≥ 67, "MAYBE" if 34 ≤ total score < 67, and "DON'T AUTOMATE" if total score < 34.

**Validates: Requirements 2.7, 2.8, 2.9**

### Property 12: JSON format detection correctness

*For any* valid JSON file, the application should correctly identify whether it's a Test Prioritisation State or State Diagram format and validate against the appropriate schema.

**Validates: Requirements 3.1**

### Property 13: State serialization round-trip

*For any* valid application state, serializing to JSON and then parsing back should produce an equivalent state.

**Validates: Requirements 3.2**

### Property 14: Export filename pattern correctness

*For any* application state with a project name, the export filename should match the pattern "test-prioritization-{projectName}-{date}.json".

**Validates: Requirements 3.3**

### Property 15: Serialized JSON contains required fields

*For any* application state, the serialized JSON should include version, projectName, created, lastModified, existingFunctionality, testCases, and metadata fields.

**Validates: Requirements 3.5**

### Property 16: State diagram parsing completeness

*For any* valid state diagram JSON, parsing should extract all states with their actions, transitions, implementation types, and lastModified timestamps.

**Validates: Requirements 3A.1**

### Property 17: State diagram diff correctness

*For any* two state diagram versions, the diff should correctly identify all added, removed, modified, and unchanged states.

**Validates: Requirements 3A.2**

### Property 18: New state generates correct test case

*For any* new state detected in a state diagram diff, the generated test case should have changeType set to "new".

**Validates: Requirements 3A.3**

### Property 19: Modified state generates correct test case

*For any* modified state detected in a state diagram diff, the generated test case should have changeType set to "modified-behavior" and notes populated with change details.

**Validates: Requirements 3A.4**

### Property 20: Affected areas calculation from transitions

*For any* state in a state diagram, the affected areas should equal the count of incoming plus outgoing transitions, capped at 5.

**Validates: Requirements 3A.5**

### Property 21: State diagram field mapping correctness

*For any* state in a state diagram, the generated test case should have implementationType from the state's implementation field and notes from changeNotes or description.

**Validates: Requirements 3A.6**

### Property 22: Diff summary counts correctness

*For any* state diagram diff, the summary counts of new, modified, and unchanged states should match the actual counts in the diff result.

**Validates: Requirements 3A.7**

### Property 23: Import creates correct number of test cases

*For any* state diagram import, the number of test cases created should equal the number of new plus modified states.

**Validates: Requirements 3A.8**

### Property 24: State persistence round-trip

*For any* application state, saving to localStorage and then loading should produce an equivalent state.

**Validates: Requirements 4.1, 4.2**

### Property 25: Clear data removes all localStorage entries

*For any* application state, clearing all data should remove all test-prioritizer-* keys from localStorage.

**Validates: Requirements 4.5**

### Property 26: Adding existing functionality increases count

*For any* existing functionality list, adding a new entry should increase the count by 1 and include all required fields.

**Validates: Requirements 5.2**

### Property 27: Editing existing functionality updates state

*For any* existing functionality entry, editing any field should update that field in the application state.

**Validates: Requirements 5.3**

### Property 28: Deleting existing functionality decreases count

*For any* existing functionality entry, deleting it should remove it from the list and decrease the count by 1.

**Validates: Requirements 5.4**

### Property 29: Search filters existing functionality correctly

*For any* existing functionality list and search term, the filtered results should include only entries whose names contain the search term (case-insensitive).

**Validates: Requirements 5.5**

### Property 30: State diagram import populates existing functionality

*For any* state diagram, importing it should create existing functionality entries for all states with their names, implementation types, and lastModified timestamps.

**Validates: Requirements 5.6**

### Property 31: Existing functionality source tracking

*For any* existing functionality entry, it should have a source field indicating whether it was manually added or imported from a state diagram.

**Validates: Requirements 5.7**

### Property 32: Column sorting correctness

*For any* column and test case list, sorting by that column should order all rows by that column's values in ascending order.

**Validates: Requirements 6.1**

### Property 33: Sort toggle reverses order

*For any* sorted column, sorting again should reverse the order to descending.

**Validates: Requirements 6.2**

### Property 34: Recommendation filter correctness

*For any* recommendation filter value, the filtered test cases should include only those with matching recommendations.

**Validates: Requirements 6.3**

### Property 35: Search filter correctness

*For any* search term, the filtered test cases should include only those whose test name or notes contain the search term (case-insensitive).

**Validates: Requirements 6.4**

### Property 36: Multiple filters are ANDed

*For any* combination of active filters, the filtered test cases should match all filter criteria simultaneously.

**Validates: Requirements 6.5**

### Property 37: Summary statistics count correctness

*For any* test case list, the total count should equal the array length.

**Validates: Requirements 8.1**

### Property 38: Recommendation category counts correctness

*For any* test case list, the counts for each recommendation category should match the actual distribution of recommendations.

**Validates: Requirements 8.2**

### Property 39: Average score calculation correctness

*For any* test case list, the average total score should equal the sum of all total scores divided by the count.

**Validates: Requirements 8.3**

### Property 40: Legal requirement count correctness

*For any* test case list, the legal requirement count should equal the number of test cases with isLegal set to true.

**Validates: Requirements 8.4**

### Property 41: Filtered statistics correctness

*For any* active filters, the summary statistics should be calculated only on the filtered subset of test cases.

**Validates: Requirements 8.5**

### Property 42: Smart validation for unchanged high-frequency tests

*For any* test case with changeType "unchanged" and userFrequency > 3, a warning should be generated suggesting exploratory testing.

**Validates: Requirements 9.3**

### Property 43: Smart validation for low-scoring standard components

*For any* test case with implementationType "standard-components" and total score < 40, a tip should be generated about maintenance cost versus value.

**Validates: Requirements 9.4**

### Property 44: Smart validation for legal requirements

*For any* test case with isLegal true and total score < 50, a note should be generated explaining this is regulatory testing.

**Validates: Requirements 9.5**

### Property 45: State diagram validation for unreachable states

*For any* state diagram with a state having no incoming transitions (except the initial state), a warning should be generated that the state may be unreachable.

**Validates: Requirements 9.6**

### Property 46: State diagram validation for dead-end states

*For any* state diagram with a state having no outgoing transitions, a warning should be generated that the state may be a dead end.

**Validates: Requirements 9.7**

### Property 47: State diagram validation for invalid transitions

*For any* state diagram with a transition to a non-existent state, a validation error should be generated identifying the invalid transition.

**Validates: Requirements 9.8**

### Property 48: BERT JSON parsing correctness

*For any* valid BERT JSON, parsing should create a test case with all BERT fields correctly mapped to test case fields.

**Validates: Requirements 11.1, 11.2**

### Property 49: Copy decision format correctness

*For any* test case, the copied decision text should include the test name, score, recommendation, and rationale in the specified format.

**Validates: Requirements 11.3**

### Property 50: BERT field mapping correctness

*For any* BERT JSON with detectedChangeType and detectedImplementation, these values should be correctly mapped to the test case's changeType and implementationType fields.

**Validates: Requirements 11.4, 11.5**

### Property 51: State diagram storage key pattern correctness

*For any* uploaded state diagram, the localStorage key should match the pattern "test-prioritizer-states-{applicationName}-{timestamp}".

**Validates: Requirements 15.1**

### Property 52: State diagram version limit enforcement

*For any* application journey, uploading more than 3 state diagram versions should automatically remove the oldest version.

**Validates: Requirements 15.2, 15.5**

### Property 53: State diagram history completeness

*For any* application journey, the history should include all stored versions with their upload timestamps and application names.

**Validates: Requirements 15.3**

### Property 54: State diagram version comparison correctness

*For any* two state diagram versions from history, the comparison should correctly show all added, removed, and modified states.

**Validates: Requirements 15.4**

## Error Handling

### Input Validation Errors

**Invalid Test Case Data**:
- Empty test name: Display inline error, prevent save
- Out-of-range values (frequency, impact, areas): Clamp to valid range (1-5)
- Invalid enum values: Reset to default, show warning

**Invalid JSON Import**:
- Malformed JSON: Display error modal with parse error details
- Missing required fields: Display error listing missing fields
- Invalid schema: Display error with schema validation details
- Unknown format: Display error asking user to verify file type

**State Diagram Validation Errors**:
- Missing states object: Display error "Invalid state diagram: missing 'states' object"
- Invalid transition target: Display error listing all invalid transitions
- Circular references: Display warning with affected states
- Missing required fields: Display warning, use defaults

### Storage Errors

**localStorage Quota Exceeded**:
- Catch QuotaExceededError
- Display modal: "Storage limit reached. Please export and clear old data."
- Offer to clear state diagram history
- Offer to export current state before clearing

**localStorage Access Denied**:
- Catch SecurityError
- Display warning: "Local storage unavailable. Changes will not be saved."
- Continue with in-memory state only
- Disable auto-save

### Runtime Errors

**Score Calculation Errors**:
- Catch any calculation exceptions
- Log error to console
- Display "N/A" for affected scores
- Show warning icon with error details in tooltip

**State Diff Errors**:
- Catch diff algorithm exceptions
- Display error modal: "Unable to compare state diagrams"
- Offer to import without comparison
- Log detailed error for debugging

### User-Facing Error Messages

All error messages should:
- Be clear and actionable
- Avoid technical jargon when possible
- Provide next steps or solutions
- Include a "Learn More" link to help documentation when appropriate

Example error messages:
- ✅ "Test name is required. Please enter a name for this test case."
- ❌ "Validation failed: testName is null"

## Testing Strategy

### Unit Testing

**Score Calculation Tests**:
- Test each score formula with boundary values (0, 1, 5, etc.)
- Test total score calculation with various combinations
- Test recommendation tier boundaries (33, 34, 66, 67)
- Test edge cases (all zeros, all max values)

**State Diagram Diff Tests**:
- Test diff with no changes (should return empty diff)
- Test diff with only additions
- Test diff with only removals
- Test diff with only modifications
- Test diff with mixed changes
- Test diff with complex transition changes

**Validation Tests**:
- Test required field validation
- Test range validation (1-5 for risk factors)
- Test smart validation warnings
- Test state diagram structure validation
- Test invalid transition detection

**Storage Tests**:
- Test save and load round-trip
- Test version management (keep last 3)
- Test clear all data
- Test storage key patterns

### Property-Based Testing

The application will use **fast-check** (for JavaScript/TypeScript) as the property-based testing library. Each property-based test should run a minimum of 100 iterations.

**Test Case Generation Strategy**:
```typescript
// Generator for valid test cases
const testCaseArbitrary = fc.record({
  id: fc.uuid(),
  testName: fc.string({ minLength: 1, maxLength: 100 }),
  changeType: fc.constantFrom('new', 'modified-behavior', 'modified-ui', 'unchanged'),
  implementationType: fc.constantFrom('standard-components', 'new-pattern', 'custom-implementation', 'hybrid'),
  isLegal: fc.boolean(),
  userFrequency: fc.integer({ min: 1, max: 5 }),
  businessImpact: fc.integer({ min: 1, max: 5 }),
  affectedAreas: fc.integer({ min: 1, max: 5 }),
  notes: fc.option(fc.string({ maxLength: 500 })),
  bertScenarioId: fc.option(fc.string()),
  jiraTicket: fc.option(fc.string())
});

// Generator for state diagrams
const stateDiagramArbitrary = fc.record({
  version: fc.constant('1.0'),
  applicationName: fc.string({ minLength: 1 }),
  states: fc.dictionary(
    fc.string({ minLength: 1 }),
    fc.record({
      description: fc.option(fc.string()),
      actions: fc.array(fc.string(), { minLength: 1 }),
      transitions: fc.dictionary(fc.string(), fc.string()),
      implementation: fc.option(fc.constantFrom('standard-components', 'new-pattern', 'custom-implementation', 'hybrid')),
      lastModified: fc.option(fc.date().map(d => d.toISOString()))
    })
  ),
  metadata: fc.record({
    team: fc.option(fc.string()),
    environment: fc.option(fc.string()),
    generated: fc.date().map(d => d.toISOString())
  })
});
```

**Property Test Examples**:

```typescript
// Property 5: Risk score calculation correctness
// Feature: test-prioritization-tool, Property 5: Risk score calculation correctness
it('risk score equals frequency times impact', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      (frequency, impact) => {
        const riskScore = ScoreCalculator.calculateRiskScore(frequency, impact);
        return riskScore === frequency * impact;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 13: State serialization round-trip
// Feature: test-prioritization-tool, Property 13: State serialization round-trip
it('serializing and parsing state produces equivalent state', () => {
  fc.assert(
    fc.property(
      appStateArbitrary,
      (state) => {
        const json = JSON.stringify(state);
        const parsed = JSON.parse(json);
        return deepEqual(state, parsed);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 17: State diagram diff correctness
// Feature: test-prioritization-tool, Property 17: State diagram diff correctness
it('diff correctly identifies all changes', () => {
  fc.assert(
    fc.property(
      stateDiagramArbitrary,
      stateDiagramArbitrary,
      (prev, curr) => {
        const diff = StateDiagramService.diffStateDiagrams(prev, curr);
        
        // Verify all states are accounted for
        const allStates = new Set([
          ...Object.keys(prev.states),
          ...Object.keys(curr.states)
        ]);
        
        const diffStates = new Set([
          ...diff.added,
          ...diff.removed,
          ...diff.modified.map(m => m.stateId),
          ...diff.unchanged
        ]);
        
        return allStates.size === diffStates.size &&
               [...allStates].every(s => diffStates.has(s));
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**End-to-End Workflows**:
- Test complete manual entry workflow (add → edit → score → export)
- Test state diagram import workflow (upload → diff → confirm → generate test cases)
- Test BERT integration workflow (paste → edit → copy decision)
- Test filter and sort combinations
- Test localStorage persistence across page reloads

**Browser Compatibility Testing**:
- Test on Chrome, Firefox, Safari, Edge
- Test localStorage behavior across browsers
- Test clipboard API across browsers
- Test responsive behavior on different screen sizes

### Performance Testing

**Benchmarks**:
- Measure score calculation time for 100 test cases
- Measure state diagram diff time for 50-state diagrams
- Measure JSON export time for 100 test cases
- Measure table render time for 100 rows
- Measure localStorage save time

**Performance Targets**:
- Score recalculation: < 10ms
- State diagram diff: < 500ms for 50 states
- JSON export: < 100ms for 100 rows
- Table render: < 100ms for 100 rows
- localStorage save: < 50ms

### Test Coverage Goals

- Unit test coverage: > 80% for business logic
- Property test coverage: All 54 correctness properties
- Integration test coverage: All major user workflows
- Edge case coverage: All validation rules and error conditions

