/**
 * Header Component Tests
 * Tests the header with state diagram upload functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { AppProvider } from '../context';

// Mock the services
vi.mock('../services/StateDiagramService', () => ({
  StateDiagramService: {
    parseStateDiagram: vi.fn((json: string) => JSON.parse(json)),
    validateStateDiagram: vi.fn(() => ({ isValid: true, warnings: [] })),
    diffStateDiagrams: vi.fn(() => ({
      added: ['state1'],
      removed: [],
      modified: [],
      unchanged: []
    })),
    generateTestCases: vi.fn(() => []),
    generateExistingFunctionality: vi.fn(() => [])
  }
}));

vi.mock('../services/StorageService', () => ({
  StorageService: {
    getLatestStateDiagram: vi.fn(() => null),
    saveStateDiagram: vi.fn(),
    saveAppState: vi.fn(),
    isAvailable: vi.fn(() => true)
  }
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and buttons', () => {
    render(
      <AppProvider initialState={{ 
        version: '1.0.0',
        projectName: 'Test Project',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        existingFunctionality: [],
        testCases: [],
        metadata: {}
      }}>
        <Header />
      </AppProvider>
    );

    expect(screen.getByText('Test Prioritisation Tool')).toBeInTheDocument();
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
    expect(screen.getByText('DOWNLOAD')).toBeInTheDocument();
    expect(screen.getByText('ADD ROW')).toBeInTheDocument();
  });

  it('shows add row button', () => {
    render(
      <AppProvider initialState={{ 
        version: '1.0.0',
        projectName: 'Test',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        existingFunctionality: [],
        testCases: [],
        metadata: {}
      }}>
        <Header />
      </AppProvider>
    );

    const addButton = screen.getByText('ADD ROW');
    expect(addButton).toBeInTheDocument();
  });

  it('displays test case count', () => {
    render(
      <AppProvider initialState={{ 
        version: '1.0.0',
        projectName: 'Test',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        existingFunctionality: [],
        testCases: [
          {
            id: '1',
            testName: 'Test 1',
            codeChange: 'new',
            organisationalPressure: 1,
            implementationType: 'custom-implementation',
            isLegal: false,
            userFrequency: 3,
            businessImpact: 3,
            affectedAreas: 2,
            scores: { risk: 9, value: 15, ease: 5, history: 2, legal: 0, total: 31 },
            recommendation: 'DON\'T AUTOMATE'
          }
        ],
        metadata: {}
      }}>
        <Header />
      </AppProvider>
    );

    expect(screen.getByText(/1 test case/)).toBeInTheDocument();
  });
});
