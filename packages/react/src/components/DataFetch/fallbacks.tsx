import React from 'react';

// ----------------------------------------------------------------
// CSS injection (once)
// ----------------------------------------------------------------

let injected = false;

function injectSkeletonStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes behave-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .behave-skeleton-line {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 800px 100%;
      animation: behave-shimmer 1.4s infinite linear;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------------------------------------------
// DefaultSkeleton component
// ----------------------------------------------------------------

export function DefaultSkeleton() {
  injectSkeletonStyles();

  return (
    <div
      aria-busy="true"
      aria-label="Loading..."
      role="status"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}
    >
      {/* Title line */}
      <div className="behave-skeleton-line" style={{ height: '1.25rem', width: '60%' }} />
      {/* Body lines */}
      <div className="behave-skeleton-line" style={{ height: '1rem', width: '100%' }} />
      <div className="behave-skeleton-line" style={{ height: '1rem', width: '90%' }} />
      <div className="behave-skeleton-line" style={{ height: '1rem', width: '80%' }} />
    </div>
  );
}

// ----------------------------------------------------------------
// DefaultErrorFallback component
// ----------------------------------------------------------------

interface DefaultErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  return (
    <div
      role="alert"
      style={{
        padding: '1rem',
        border: '1px solid #fca5a5',
        borderRadius: '0.375rem',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        fontSize: '0.875rem',
      }}
    >
      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Something went wrong</p>
      <p style={{ margin: '0 0 0.75rem', color: '#dc2626' }}>{error.message}</p>
      <button
        onClick={retry}
        style={{
          padding: '0.25rem 0.75rem',
          fontSize: '0.8rem',
          border: '1px solid #fca5a5',
          borderRadius: '0.25rem',
          backgroundColor: '#fff',
          color: '#b91c1c',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
