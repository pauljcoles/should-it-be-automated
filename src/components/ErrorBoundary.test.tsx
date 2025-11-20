/**
 * ErrorBoundary Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError(): React.ReactElement {
  throw new Error('Test error');
}

// Component that doesn't throw
function NoError() {
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeDefined();
  });

  it('should catch errors and display error UI', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something Went Wrong')).toBeDefined();
    expect(screen.getByText('Test error')).toBeDefined();

    // Restore console.error
    console.error = originalError;
  });

  it('should provide recovery options', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeDefined();
    expect(screen.getByText('Reload Application')).toBeDefined();
    expect(screen.getByText('Clear Data & Reload')).toBeDefined();

    // Restore console.error
    console.error = originalError;
  });
});
