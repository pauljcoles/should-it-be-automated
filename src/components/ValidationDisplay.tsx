/**
 * ValidationDisplay Component
 * 
 * Displays validation warnings and errors for test cases
 */

import type { ValidationWarning } from '../types/models';

interface ValidationDisplayProps {
  warnings: ValidationWarning[];
  className?: string;
}

export function ValidationDisplay({ warnings, className = '' }: ValidationDisplayProps) {
  if (warnings.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {warnings.map((warning, index) => (
        <div
          key={index}
          className={`
            text-sm p-2 border-brutal
            ${warning.level === 'error' ? 'bg-red-50 text-red-800 border-red-300' : ''}
            ${warning.level === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' : ''}
            ${warning.level === 'info' ? 'bg-blue-50 text-blue-800 border-blue-300' : ''}
          `}
        >
          <span className="font-medium">
            {warning.level === 'error' && '❌ '}
            {warning.level === 'warning' && '⚠️ '}
            {warning.level === 'info' && 'ℹ️ '}
          </span>
          {warning.message}
        </div>
      ))}
    </div>
  );
}

/**
 * Inline validation indicator for form fields
 */
interface InlineValidationProps {
  warnings: ValidationWarning[];
  field: string;
}

export function InlineValidation({ warnings, field }: InlineValidationProps) {
  const fieldWarnings = warnings.filter(w => w.field === field);
  
  if (fieldWarnings.length === 0) return null;

  const hasError = fieldWarnings.some(w => w.level === 'error');
  const hasWarning = fieldWarnings.some(w => w.level === 'warning');

  return (
    <div className="absolute -top-1 -right-1 z-10">
      {hasError && (
        <span className="inline-block w-3 h-3 bg-red-500 rounded-full border-2 border-white" title={fieldWarnings.find(w => w.level === 'error')?.message} />
      )}
      {!hasError && hasWarning && (
        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" title={fieldWarnings.find(w => w.level === 'warning')?.message} />
      )}
    </div>
  );
}
