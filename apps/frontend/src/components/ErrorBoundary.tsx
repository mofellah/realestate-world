import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "page" | "component" | "section";
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays a fallback UI
 * Prevents entire app from crashing
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Error Info:", errorInfo);

    // Call optional error handler (e.g., for error reporting service)
    this.props.onError?.(error, errorInfo);

    // TODO: Send to Sentry, LogRocket, or other error tracking service
    // import * as Sentry from "@sentry/react";
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      const level = this.props.level || "component";

      // Full page error (application level)
      if (level === "page") {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>

              <p className="text-center text-gray-600 mb-6">
                We apologize for the inconvenience. An unexpected error occurred. Please try
                refreshing the page or contact support if the problem persists.
              </p>

              {import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm">
                  <p className="font-semibold text-red-900 mb-2">Error Details (Development):</p>
                  <p className="text-red-800 font-mono text-xs break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Refresh
                </button>
              </div>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        );
      }

      // Section or component level error
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
              <p className="mt-1 text-sm text-red-700">
                {this.state.error.message || "An unexpected error occurred"}
              </p>
              <div className="mt-3">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Map-specific error fallback
 */
export function MapErrorFallback() {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center" style={{ minHeight: "400px" }}>
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Map failed to load</h3>
      <p className="text-gray-600 mb-4">
        Unable to display the map. This might be a temporary issue. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Retry
      </button>
    </div>
  );
}

/**
 * Search results-specific error fallback
 */
export function SearchErrorFallback() {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Search failed</h3>
      <p className="text-gray-600 mb-4">
        Unable to load search results. Please try adjusting your search filters and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Retry
      </button>
    </div>
  );
}

/**
 * Dashboard-specific error fallback
 */
export function DashboardErrorFallback() {
  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Dashboard error</h3>
        <p className="text-red-700 mb-4">
          Unable to load your dashboard. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
