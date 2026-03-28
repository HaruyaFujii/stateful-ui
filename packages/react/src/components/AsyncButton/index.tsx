import React, { forwardRef, useCallback } from 'react';
import { useAsyncState } from '../../hooks/useAsyncState';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface AsyncButtonProps<T = unknown>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onError'> {
  /**
   * An async function to run on click.
   * The button will be disabled while this is running.
   */
  onClick: () => Promise<T>;

  /** Label shown while the async function is running. */
  loadingText?: string;

  /** Label shown after a successful run (before auto-reset). */
  successText?: string;

  /** Label shown after an error. */
  errorText?: string;

  /**
   * Custom spinner element. Defaults to a built-in CSS spinner.
   */
  spinner?: React.ReactNode;

  /**
   * Render prop for full control over the button content
   * based on current status.
   */
  renderContent?: (status: 'idle' | 'pending' | 'success' | 'error') => React.ReactNode;

  /** Called when the async function resolves successfully. */
  onSuccess?: (data: T) => void;

  /** Called when the async function rejects. */
  onError?: (error: Error) => void;

  /**
   * Milliseconds to wait before resetting status back to 'idle'
   * after a successful run. Set to 0 to disable auto-reset.
   * @default 2000
   */
  resetDelay?: number;
}

// ----------------------------------------------------------------
// Internal icons (no external dependency)
// ----------------------------------------------------------------

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`behave-spinner ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: '1em', height: '1em', animation: 'behave-spin 0.75s linear infinite' }}
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      aria-hidden="true"
      style={{ width: '1em', height: '1em' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      aria-hidden="true"
      style={{ width: '1em', height: '1em' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ----------------------------------------------------------------
// Injected styles (injected once on first render)
// ----------------------------------------------------------------

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes behave-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .behave-async-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4em;
      position: relative;
      transition: opacity 0.15s ease, transform 0.1s ease;
    }
    .behave-async-btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    .behave-async-btn[data-status="success"] {
      opacity: 0.9;
    }
    .behave-async-btn[data-status="error"] {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

/**
 * A button that manages async state (pending / success / error) automatically.
 *
 * @example
 * <AsyncButton
 *   onClick={() => api.submit(data)}
 *   loadingText="Submitting..."
 *   successText="Done!"
 *   onSuccess={() => router.push('/done')}
 * >
 *   Submit
 * </AsyncButton>
 */
export const AsyncButton = forwardRef<HTMLButtonElement, AsyncButtonProps>(
  function AsyncButton(
    {
      onClick,
      children,
      loadingText,
      successText,
      errorText,
      spinner,
      renderContent,
      onSuccess,
      onError,
      resetDelay = 2000,
      disabled,
      className = '',
      ...rest
    },
    ref
  ) {
    injectStyles();

    const { status, execute } = useAsyncState({
      ...(onSuccess && { onSuccess }),
      ...(onError && { onError }),
      resetDelay,
    });

    const handleClick = useCallback(async () => {
      await execute(onClick);
    }, [execute, onClick]);

    const isDisabled = disabled || status === 'pending';

    // --- Determine content ---
    const content = (() => {
      if (renderContent) return renderContent(status);

      if (status === 'pending') {
        return (
          <>
            {spinner ?? <Spinner />}
            {loadingText ?? children}
          </>
        );
      }

      if (status === 'success' && successText) {
        return (
          <>
            <CheckIcon />
            {successText}
          </>
        );
      }

      if (status === 'error' && errorText) {
        return (
          <>
            <ErrorIcon />
            {errorText}
          </>
        );
      }

      return children;
    })();

    return (
      <button
        ref={ref}
        className={`behave-async-btn ${className}`.trim()}
        data-status={status}
        disabled={isDisabled}
        aria-busy={status === 'pending'}
        aria-live="polite"
        onClick={handleClick}
        {...rest}
      >
        {content}
      </button>
    );
  }
) as <T = unknown>(
  props: AsyncButtonProps<T> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;

// Restore displayName after the cast
(AsyncButton as unknown as { displayName: string }).displayName = 'AsyncButton';
