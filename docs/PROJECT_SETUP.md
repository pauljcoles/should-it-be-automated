# Test Prioritisation Scoring Tool - Project Setup

## Overview

This is a React + TypeScript application built with Vite for the Test Prioritisation Scoring Tool.

## Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **Testing**: Vitest 4.0.12
- **Property-Based Testing**: fast-check 4.3.0
- **Testing Library**: @testing-library/react 16.3.0

## Project Structure

```
src/
├── components/     # React components
├── services/       # Service classes (ScoreCalculator, StateDiagramService, etc.)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── test/           # Test setup and utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Testing

The project uses Vitest for unit testing and fast-check for property-based testing. Test files should be placed alongside the code they test with a `.test.ts` or `.test.tsx` extension.

### Property-Based Testing

Property-based tests should be configured to run a minimum of 100 iterations:

```typescript
import * as fc from 'fast-check';

fc.assert(
  fc.property(fc.integer(), (n) => {
    // Your property test here
  }),
  { numRuns: 100 }
);
```

## Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.
