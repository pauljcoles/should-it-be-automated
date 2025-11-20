/**
 * ValidationDisplay Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationDisplay, InlineValidation } from './ValidationDisplay';
import type { ValidationWarning } from '../types/models';

describe('ValidationDisplay', () => {
  it('should render nothing when no warnings', () => {
    const { container } = render(<ValidationDisplay warnings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error warnings', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'error',
        message: 'Test name is required',
        field: 'testName'
      }
    ];

    render(<ValidationDisplay warnings={warnings} />);
    expect(screen.getByText(/Test name is required/)).toBeDefined();
  });

  it('should render warning level messages', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'warning',
        message: 'Test name exceeds 100 characters',
        field: 'testName'
      }
    ];

    render(<ValidationDisplay warnings={warnings} />);
    expect(screen.getByText(/Test name exceeds 100 characters/)).toBeDefined();
  });

  it('should render info level messages', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'info',
        message: 'Loop components are easy to automate',
        field: 'implementationType'
      }
    ];

    render(<ValidationDisplay warnings={warnings} />);
    expect(screen.getByText(/Loop components are easy to automate/)).toBeDefined();
  });

  it('should render multiple warnings', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'error',
        message: 'Error 1',
        field: 'testName'
      },
      {
        level: 'warning',
        message: 'Warning 1',
        field: 'changeType'
      }
    ];

    render(<ValidationDisplay warnings={warnings} />);
    expect(screen.getByText('Error 1')).toBeDefined();
    expect(screen.getByText('Warning 1')).toBeDefined();
  });
});

describe('InlineValidation', () => {
  it('should render nothing when no warnings for field', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'error',
        message: 'Error',
        field: 'notes'
      }
    ];

    const { container } = render(
      <InlineValidation warnings={warnings} field="testName" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render indicator for field with error', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'error',
        message: 'Test name is required',
        field: 'testName'
      }
    ];

    const { container } = render(
      <InlineValidation warnings={warnings} field="testName" />
    );
    expect(container.querySelector('.bg-red-500')).toBeDefined();
  });

  it('should render indicator for field with warning', () => {
    const warnings: ValidationWarning[] = [
      {
        level: 'warning',
        message: 'Test name is long',
        field: 'testName'
      }
    ];

    const { container } = render(
      <InlineValidation warnings={warnings} field="testName" />
    );
    expect(container.querySelector('.bg-yellow-500')).toBeDefined();
  });
});
