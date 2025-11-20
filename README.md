# Test Prioritisation Scoring Tool

A React-based application for evaluating test automation candidates using Angie Jones' risk-based scoring methodology. The tool helps QA teams make objective decisions about test automation by calculating priority scores based on multiple risk factors.

## Features

- **Objective Scoring**: Calculate automation priority based on risk, value, ease, history, and legal factors
- **Visual Recommendations**: Color-coded guidance (AUTOMATE/MAYBE/DON'T AUTOMATE)
- **State Diagram Integration**: Import model-based testing diagrams to auto-generate test cases
- **Scenario Tool Integration**: Import test scenarios from external tools via JSON
- **Data Portability**: Export/import as JSON for team collaboration
- **Client-Side Only**: No backend required, all data stored in browser localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

### Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run linter
npm run lint
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Documentation

- **[User Guide](docs/USER_GUIDE.md)**: Complete guide for using the application
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Technical documentation for developers
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Instructions for deploying to production
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)**: Pre and post-deployment verification

## Deployment

The application can be deployed to any static hosting service for free:

### Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

### GitHub Pages
Push to GitHub and enable GitHub Actions deployment (workflow included in `.github/workflows/deploy.yml`)

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Technology Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: React Context API
- **Testing**: Vitest 4.0.12 + React Testing Library
- **Property-Based Testing**: fast-check 4.3.0

## Project Structure

```
src/
├── components/          # React components
├── context/            # State management
├── services/           # Business logic
├── types/              # TypeScript types
├── utils/              # Utility functions
└── test/               # Test utilities

.kiro/specs/test-prioritization-tool/
├── requirements.md     # Feature requirements
├── design.md          # Design document
└── tasks.md           # Implementation tasks
```

## Testing

- **Unit Tests**: Component and service tests
- **Property-Based Tests**: 54 correctness properties with 100+ iterations each
- **Integration Tests**: End-to-end workflow tests
- **Browser Compatibility**: Tested on Chrome, Firefox, Safari, Edge

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit changes: `git commit -m "Add feature"`
7. Push to branch: `git push origin feature/my-feature`
8. Create a pull request

See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for detailed development instructions.

## License

[Add your license here]

## Support

For questions or issues:
- Review the [User Guide](docs/USER_GUIDE.md)
- Check the [Developer Guide](docs/DEVELOPER_GUIDE.md)
- Open an issue on the repository

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
