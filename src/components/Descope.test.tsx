/**
 * Descope functionality tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context';
import { TestCaseRowNormal } from './TestCaseRowNormal';
import { TestCaseRowTeaching } from './TestCaseRowTeaching';
import type { TestCase } from '../types/models';
import { CodeChange, Recommendation } from '../types/models';

describe('Descope Checkbox', () => {
  const mockTestCase: TestCase = {
    id: 'test-1',
    testName: 'Test Case',
    codeChange: CodeChange.NEW,
    organisationalPressure: 3,
    easyToAutomate: 3,
    quickToAutomate: 3,
    userFrequency: 3,
    businessImpact: 3,
    affectedAreas: 3,
    isLegal: false,
    gutFeel: 3,
    impact: 3,
    probOfUse: 3,
    distinctness: 3,
    fixProbability: 3,
    easyToWrite: 3,
    quickToWrite: 3,
    similarity: 1,
    breakFreq: 1,
    scores: {
      risk: 9,
      value: 9,
      costEfficiency: 9,
      history: 1,
      legal: 0,
      total: 28
    },
    recommendation: Recommendation.MAYBE,
    isDescoped: false
  };

  it('should render descope checkbox in Normal mode', () => {
    render(
      <AppProvider>
        <table>
          <tbody>
            <TestCaseRowNormal testCase={mockTestCase} />
          </tbody>
        </table>
      </AppProvider>
    );

    // Check that descope checkbox exists
    const descopeCheckboxes = screen.getAllByRole('checkbox');
    const descopeCheckbox = descopeCheckboxes.find(cb => 
      cb.parentElement?.textContent?.includes('Descope')
    );
    expect(descopeCheckbox).toBeDefined();
  });

  it('should render descope checkbox in Teaching mode', () => {
    render(
      <AppProvider>
        <table>
          <tbody>
            <TestCaseRowTeaching testCase={mockTestCase} />
          </tbody>
        </table>
      </AppProvider>
    );

    // Check that descope checkbox exists
    const descopeCheckboxes = screen.getAllByRole('checkbox');
    const descopeCheckbox = descopeCheckboxes.find(cb => 
      cb.parentElement?.textContent?.includes('Descope')
    );
    expect(descopeCheckbox).toBeDefined();
  });

  it('should apply visual styling when descoped', () => {
    const descopedTestCase = { ...mockTestCase, isDescoped: true };
    
    const { container } = render(
      <AppProvider>
        <table>
          <tbody>
            <TestCaseRowNormal testCase={descopedTestCase} />
          </tbody>
        </table>
      </AppProvider>
    );

    // Check that the row has the descoped styling
    const row = container.querySelector('tr');
    expect(row?.className).toContain('opacity');
  });
});
