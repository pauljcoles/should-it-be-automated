/**
 * ErrorBoundary Component
 * 
 * Catches React errors and displays user-friendly error messages
 * with recovery options.
 */

import { Component, type ReactNode } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearData = () => {
    if (confirm('This will clear all data and reload the application. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border-brutal-thick shadow-brutal-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-black mb-2">Something Went Wrong</h1>
              <p className="text-gray-600">
                The application encountered an unexpected error. Don't worry, your data should be safe.
              </p>
            </div>

            <div className="bg-red-50 border-brutal p-4 mb-6">
              <h2 className="font-bold mb-2">Error Details:</h2>
              <p className="text-sm font-mono text-red-800 break-words">
                {this.state.error.message}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="default"
              >
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                Reload Application
              </Button>

              <Button
                onClick={this.handleClearData}
                className="w-full"
                variant="outline"
              >
                Clear Data & Reload
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>If the problem persists, please contact support with the error details above.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
