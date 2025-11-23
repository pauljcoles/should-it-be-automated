# Project Structure

## Source Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI primitives (button, card, input, etc.)
│   └── *.tsx           # Feature components (Header, TestCaseTable, etc.)
├── context/            # React Context for state management
│   ├── AppContext.tsx  # Main application context provider
│   └── index.ts        # Barrel export
├── services/           # Business logic and calculations
│   ├── ScoreCalculator.ts        # Teaching mode scoring (0-100 scale)
│   ├── AngieScoreCalculator.ts   # Normal mode scoring (0-80 scale)
│   ├── StorageService.ts         # localStorage persistence
│   ├── ValidationService.ts      # Input validation
│   ├── ImportExportService.ts    # JSON import/export
│   └── StateDiagramService.ts    # State diagram processing
├── types/              # TypeScript type definitions
│   ├── models.ts       # Core data models and enums
│   └── index.ts        # Barrel export
├── utils/              # Utility functions
├── test/               # Test setup and utilities
│   └── setup.ts        # Vitest configuration
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Architecture Patterns

### State Management
- **Single Context**: `AppContext` provides all state and actions
- **No Props Drilling**: Components use `useAppContext()` hook
- **Auto-persistence**: State automatically saved to localStorage on changes
- **Immutable Updates**: All state updates use spread operators

### Component Patterns
- **Functional Components**: All components use hooks, no class components
- **Barrel Exports**: Index files re-export for cleaner imports
- **Responsive Design**: Mobile-first with Tailwind breakpoints (lg:)
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

### Service Layer
- **Static Methods**: Services use static methods (no instantiation)
- **Pure Functions**: Calculations are deterministic and side-effect free
- **Separation of Concerns**: Business logic isolated from UI

### Type Safety
- **Const Enums**: Use `as const` pattern for type-safe enums
- **Strict Mode**: TypeScript strict mode enabled
- **Interface First**: Define interfaces before implementation

## File Naming Conventions

- **Components**: PascalCase (e.g., `TestCaseTable.tsx`)
- **Services**: PascalCase (e.g., `ScoreCalculator.ts`)
- **Types**: PascalCase (e.g., `models.ts`)
- **Tests**: Same name with `.test.tsx` or `.test.ts` suffix
- **Utilities**: camelCase (e.g., `utils.ts`)

## Import Patterns

```typescript
// External dependencies first
import { useState, useCallback } from 'react';

// Internal imports with @ alias
import { useAppContext } from '@/context';
import { ScoreCalculator } from '@/services';
import type { TestCase } from '@/types';

// Relative imports for same directory
import { Button } from './ui/button';
```

## Testing Structure

- **Co-located Tests**: Test files next to source files
- **Property-Based Tests**: Use fast-check for correctness properties
- **Test Setup**: Global setup in `src/test/setup.ts`
- **Coverage**: Focus on services and complex components

## Documentation

- **Inline Comments**: JSDoc for functions and complex logic
- **Type Documentation**: Interfaces include descriptive comments
- **README**: User-facing documentation in `/docs`
- **Specs**: Feature specs in `.kiro/specs/test-prioritization-tool/`
