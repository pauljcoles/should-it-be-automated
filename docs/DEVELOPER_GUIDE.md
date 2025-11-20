# Test Prioritisation Tool - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Component Guide](#component-guide)
6. [Service Layer](#service-layer)
7. [Testing](#testing)
8. [Customization](#customization)
9. [Contributing](#contributing)

## Architecture Overview

### Technology Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: React Context API
- **Testing**: Vitest 4.0.12 + React Testing Library
- **Property-Based Testing**: fast-check 4.3.0

### Design Principles

1. **Client-Side Only**: No backend dependencies, all processing in browser
2. **Immediate Feedback**: Real-time score calculations
3. **Data Portability**: JSON-based import/export
4. **Performance First**: Optimized for 100+ test cases
5. **Progressive Enhancement**: Core features work without advanced capabilities

### Data Flow

```
User Input → Component Event Handler → Context Action → State Update →
Score Calculation → Component Re-render → localStorage Persistence
```

## Development Setup

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd should-it-be-automated
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (buttons, cards, etc.)
│   ├── Header.tsx      # Main header with actions
│   ├── TestCaseTable.tsx
│   ├── TestCaseRow.tsx
│   ├── ExistingFunctionalitySidebar.tsx
│   ├── StateDiagramDiffModal.tsx
│   ├── HelpModal.tsx
│   └── ...
├── context/            # React Context for state management
│   ├── AppContext.tsx  # Main application context
│   └── index.ts
├── services/           # Business logic and utilities
│   ├── ScoreCalculator.ts
│   ├── StateDiagramService.ts
│   ├── StorageService.ts
│   ├── ValidationService.ts
│   ├── ImportExportService.ts
│   ├── ScenarioIntegrationService.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   ├── models.ts       # Core data models
│   └── index.ts
├── utils/              # Utility functions
│   └── index.ts
├── test/               # Test setup and utilities
│   ├── setup.ts
│   └── browser-compatibility.test.ts
├── App.tsx             # Root component
├── main.tsx            # Application entry point
└── index.css           # Global styles

.kiro/specs/test-prioritization-tool/
├── requirements.md     # Feature requirements
├── design.md          # Design document
└── tasks.md           # Implementation tasks
```

## Core Concepts

### Data Models

#### TestCase

The primary data structure representing a test case to be evaluated.

```typescript
interface TestCase {
  id: string;                    // UUID
  testName: string;              // Required
  changeType: ChangeType;        // Enum
  implementationType: ImplementationType;
  isLegal: boolean;
  userFrequency: number;         // 1-5
  businessImpact: number;        // 1-5
  affectedAreas: number;         // 1-5
  notes?: string;
  scenarioId?: string;
  jiraTicket?: string;
  scores: Scores;                // Calculated
  recommendation: Recommendation; // Calculated
  source?: 'manual' | 'state-diagram' | 'external';
  stateId?: string;
}
```

#### AppState

The global application state managed by Context.

```typescript
interface AppState {
  version: string;
  projectName: string;
  created: string;
  lastModified: string;
  existingFunctionality: ExistingFunctionality[];
  testCases: TestCase[];
  metadata: {
    team?: string;
    sprint?: string;
    environment?: string;
  };
}
```

### State Management

The application uses React Context API for global state management.

#### AppContext

Located in `src/context/AppContext.tsx`, provides:

**State**:
- `state`: Current application state
- `filteredTestCases`: Test cases after applying filters
- `sortConfig`: Current sort configuration

**Actions**:
- `addTestCase()`: Add new test case
- `updateTestCase(id, updates)`: Update existing test case
- `deleteTestCase(id)`: Remove test case
- `duplicateTestCase(id)`: Create copy of test case
- `importState(state)`: Import complete state
- `updateMetadata(metadata)`: Update project metadata
- `addExistingFunctionality(func)`: Add to existing functionality list
- `updateExistingFunctionality(id, updates)`: Update existing functionality
- `deleteExistingFunctionality(id)`: Remove existing functionality
- `setFilter(filter)`: Apply filters
- `setSort(column, direction)`: Apply sorting

#### Using Context in Components

```typescript
import { useAppContext } from '../context';

function MyComponent() {
  const { state, addTestCase, updateTestCase } = useAppContext();
  
  const handleAdd = () => {
    addTestCase({
      testName: 'New Test',
      changeType: 'new',
      // ... other fields
    });
  };
  
  return (
    <div>
      <p>Total: {state.testCases.length}</p>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
```

### Score Calculation

Scores are calculated automatically when test case fields change.

#### ScoreCalculator Service

Located in `src/services/ScoreCalculator.ts`:

```typescript
class ScoreCalculator {
  // Calculate risk score (0-25)
  static calculateRiskScore(
    userFrequency: number,
    businessImpact: number
  ): number {
    return userFrequency * businessImpact;
  }
  
  // Calculate value score (0-25)
  static calculateValueScore(
    changeType: ChangeType,
    businessImpact: number
  ): number {
    const distinctness = this.getDistinctness(changeType);
    const induction = this.getInductionToAction(changeType, businessImpact);
    return distinctness * induction;
  }
  
  // ... other methods
}
```

#### Formulas

**Risk Score**:
```typescript
riskScore = userFrequency * businessImpact
```

**Value Score**:
```typescript
distinctness = {
  'unchanged': 0,
  'modified-ui': 2,
  'modified-behavior': 4,
  'new': 5
}

inductionToAction = {
  'unchanged': 1,
  'modified-ui': 2,
  'modified-behavior': 5,
  'new': businessImpact
}

valueScore = distinctness * inductionToAction
```

**Ease Score**:
```typescript
implementationRisk = {
  'standard-components': 5,
  'new-pattern': 3,
  'custom-implementation': 1,
  'hybrid': 2
}

easeScore = implementationRisk * 5
```

**Total Score**:
```typescript
totalScore = riskScore + valueScore + easeScore + historyScore + legalScore
```

## Component Guide

### Header Component

Main navigation and actions.

**Location**: `src/components/Header.tsx`

**Features**:
- Project name display/edit
- Upload button (JSON/State Diagram)
- Download button (Export/Copy)
- Add row button
- Help button
- Test case count display

**Key Props**: None (uses Context)

### TestCaseTable Component

Main table displaying all test cases.

**Location**: `src/components/TestCaseTable.tsx`

**Features**:
- Sortable columns
- Filters (recommendation, search)
- Summary statistics
- Virtualization for performance

**Performance Optimizations**:
- React.memo on TestCaseRow
- Virtualization with react-window (if needed)
- Debounced search input

### TestCaseRow Component

Individual test case row with inline editing.

**Location**: `src/components/TestCaseRow.tsx`

**Features**:
- Inline editable cells
- Dropdown selects
- Number inputs
- Checkbox
- Color-coded scores
- Action buttons (delete, duplicate, copy)

**Props**:
```typescript
interface TestCaseRowProps {
  testCase: TestCase;
  onUpdate: (id: string, updates: Partial<TestCase>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}
```

### StateDiagramDiffModal Component

Visual diff display for state diagram imports.

**Location**: `src/components/StateDiagramDiffModal.tsx`

**Features**:
- Diff summary with counts
- Color-coded changes (green/yellow/red)
- Detailed change list
- Confirm/cancel actions

**Props**:
```typescript
interface StateDiagramDiffModalProps {
  diff: StateDiff;
  currentDiagram: StateDiagram;
  onConfirm: () => void;
  onCancel: () => void;
}
```

## Service Layer

### StateDiagramService

Handles state diagram parsing, validation, and diff calculation.

**Location**: `src/services/StateDiagramService.ts`

**Key Methods**:

```typescript
class StateDiagramService {
  // Parse JSON string to StateDiagram object
  static parseStateDiagram(json: string): StateDiagram;
  
  // Validate state diagram structure
  static validateStateDiagram(diagram: StateDiagram): ValidationResult;
  
  // Compare two state diagrams
  static diffStateDiagrams(
    previous: StateDiagram,
    current: StateDiagram
  ): StateDiff;
  
  // Generate test cases from diff
  static generateTestCases(
    diff: StateDiff,
    diagram: StateDiagram
  ): TestCase[];
  
  // Calculate affected areas for a state
  static calculateAffectedAreas(
    stateId: string,
    diagram: StateDiagram
  ): number;
}
```

### StorageService

Manages localStorage persistence.

**Location**: `src/services/StorageService.ts`

**Key Methods**:

```typescript
class StorageService {
  // Save application state
  static saveAppState(state: AppState): void;
  
  // Load application state
  static loadAppState(): AppState | null;
  
  // Save state diagram version
  static saveStateDiagram(diagram: StateDiagram): void;
  
  // Load state diagram history
  static loadStateDiagramHistory(appName: string): StateDiagram[];
  
  // Get latest state diagram
  static getLatestStateDiagram(appName: string): StateDiagram | null;
  
  // Clear all data
  static clearAllData(): void;
  
  // Check if localStorage is available
  static isAvailable(): boolean;
}
```

**Storage Keys**:
- `test-prioritizer-state`: Current application state
- `test-prioritizer-states-{appName}-{timestamp}`: State diagram versions

### ValidationService

Provides validation and smart suggestions.

**Location**: `src/services/ValidationService.ts`

**Key Methods**:

```typescript
class ValidationService {
  // Get all validation warnings for a test case
  static getValidationWarnings(testCase: TestCase): ValidationWarning[];
  
  // Validate test case fields
  static validateTestCase(testCase: TestCase): ValidationResult;
  
  // Validate state diagram structure
  static validateStateDiagram(diagram: StateDiagram): ValidationResult;
}
```

## Testing

### Unit Tests

Located alongside source files with `.test.ts` or `.test.tsx` extension.

**Running Tests**:
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
```

**Example Test**:
```typescript
import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from './ScoreCalculator';

describe('ScoreCalculator', () => {
  it('calculates risk score correctly', () => {
    const score = ScoreCalculator.calculateRiskScore(5, 5);
    expect(score).toBe(25);
  });
});
```

### Property-Based Tests

Using fast-check for property-based testing.

**Example**:
```typescript
import fc from 'fast-check';

it('risk score is always between 0 and 25', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      (frequency, impact) => {
        const score = ScoreCalculator.calculateRiskScore(frequency, impact);
        return score >= 0 && score <= 25;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Component Tests

Using React Testing Library.

**Example**:
```typescript
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { AppProvider } from '../context';

it('renders header with title', () => {
  render(
    <AppProvider>
      <Header />
    </AppProvider>
  );
  
  expect(screen.getByText('Test Prioritisation Tool')).toBeInTheDocument();
});
```

## Customization

### Modifying Score Formulas

Edit `src/services/ScoreCalculator.ts`:

```typescript
// Change risk score calculation
static calculateRiskScore(frequency: number, impact: number): number {
  // Original: frequency * impact
  // Custom: weighted formula
  return (frequency * 0.6 + impact * 0.4) * 5;
}
```

### Adding New Fields

1. Update `TestCase` interface in `src/types/models.ts`:
```typescript
interface TestCase {
  // ... existing fields
  customField: string;
}
```

2. Update `AppContext` to handle the new field

3. Add UI input in `TestCaseRow.tsx`

4. Update validation in `ValidationService.ts`

5. Update export/import in `ImportExportService.ts`

### Customizing Styling

The application uses Tailwind CSS. Modify:

- `tailwind.config.js`: Theme configuration
- `src/index.css`: Global styles
- Component files: Component-specific styles

### Adding New Recommendation Tiers

1. Update `Recommendation` enum in `src/types/models.ts`:
```typescript
export enum Recommendation {
  AUTOMATE = 'AUTOMATE',
  HIGH_PRIORITY = 'HIGH_PRIORITY',  // New tier
  MAYBE = 'MAYBE',
  LOW_PRIORITY = 'LOW_PRIORITY',    // New tier
  DONT_AUTOMATE = 'DON\'T AUTOMATE'
}
```

2. Update `getRecommendation()` in `ScoreCalculator.ts`:
```typescript
static getRecommendation(totalScore: number): Recommendation {
  if (totalScore >= 80) return Recommendation.AUTOMATE;
  if (totalScore >= 67) return Recommendation.HIGH_PRIORITY;
  if (totalScore >= 50) return Recommendation.MAYBE;
  if (totalScore >= 34) return Recommendation.LOW_PRIORITY;
  return Recommendation.DONT_AUTOMATE;
}
```

3. Update color coding in `TestCaseRow.tsx`

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules: `npm run lint`
- Use functional components with hooks
- Prefer const over let
- Use meaningful variable names

### Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Push branch: `git push origin feature/my-feature`
6. Create pull request

### Pull Request Guidelines

- Include description of changes
- Reference related issues
- Ensure all tests pass
- Update documentation if needed
- Add tests for new features

### Debugging

**React DevTools**:
- Install React DevTools browser extension
- Inspect component tree and props
- Profile performance

**Console Logging**:
```typescript
console.log('State:', state);
console.log('Scores:', scores);
```

**Breakpoints**:
- Use browser DevTools to set breakpoints
- Step through code execution
- Inspect variables

### Performance Profiling

**React Profiler**:
```typescript
import { Profiler } from 'react';

<Profiler id="TestCaseTable" onRender={onRenderCallback}>
  <TestCaseTable />
</Profiler>
```

**Chrome DevTools**:
- Performance tab
- Record and analyze
- Identify bottlenecks

## Common Tasks

### Adding a New Service

1. Create file in `src/services/`:
```typescript
// MyService.ts
export class MyService {
  static myMethod(): void {
    // Implementation
  }
}
```

2. Export from `src/services/index.ts`:
```typescript
export { MyService } from './MyService';
```

3. Add tests in `MyService.test.ts`

### Adding a New Component

1. Create file in `src/components/`:
```typescript
// MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>;
}
```

2. Export from `src/components/index.ts`:
```typescript
export { MyComponent } from './MyComponent';
```

3. Add tests in `MyComponent.test.tsx`

### Updating Data Models

1. Modify interfaces in `src/types/models.ts`
2. Update Context actions if needed
3. Update components using the model
4. Update services handling the model
5. Update tests
6. Update documentation

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)

---

**Version**: 1.0.0  
**Last Updated**: November 2025
