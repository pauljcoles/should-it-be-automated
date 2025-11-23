# Technology Stack

## Core Technologies

- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17 with PostCSS
- **State Management**: React Context API (no Redux/Zustand)
- **Testing**: Vitest 4.0.12 + React Testing Library + jsdom
- **Property-Based Testing**: fast-check 4.3.0

## UI Libraries

- **Component Utilities**: class-variance-authority, clsx, tailwind-merge
- **Icons**: lucide-react
- **UI Components**: Custom components in `src/components/ui/` (shadcn/ui style)

## Development Tools

- **Linting**: ESLint 9 with TypeScript ESLint, React Hooks, and React Refresh plugins
- **Type Checking**: TypeScript strict mode
- **Path Aliases**: `@/` maps to `./src/`

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Testing
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI

# Build & Preview
npm run build            # TypeScript check + production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

## Build Configuration

- **Vite Config**: Uses `@vitejs/plugin-react` for Fast Refresh
- **Test Setup**: Vitest configured with jsdom environment, setup file at `src/test/setup.ts`
- **TypeScript**: Project references pattern with separate configs for app and node

## Deployment Targets

Static hosting services: Netlify (recommended), Vercel, GitHub Pages. No server-side rendering or backend required.
