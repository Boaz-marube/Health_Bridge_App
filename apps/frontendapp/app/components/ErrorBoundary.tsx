"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary as SentryErrorBoundary } from "@sentry/react";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">We've been notified and are working on a fix.</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SentryErrorBoundary fallback={ErrorFallback} beforeCapture={Sentry.captureException}>
      {children}
    </SentryErrorBoundary>
  );
}