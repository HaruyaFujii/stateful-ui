import { useCallback, useRef, useState } from 'react';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

export interface UseAsyncStateOptions<T> {
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

export interface UseAsyncStateReturn<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  /**
   * Execute an async function and manage its lifecycle state.
   * Concurrent calls are ignored while a previous call is pending.
   */
  execute: (fn: () => Promise<T>) => Promise<void>;
  /** Manually reset state back to idle. */
  reset: () => void;
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------

/**
 * A state machine for async operations.
 * Manages idle → pending → success/error transitions,
 * prevents concurrent execution, and optionally auto-resets.
 *
 * @example
 * const { execute, isPending, isSuccess } = useAsyncState({ onSuccess: () => router.push('/done') });
 * <button onClick={() => execute(() => api.submit(data))} disabled={isPending}>Submit</button>
 */
export function useAsyncState<T = unknown>(
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const { onSuccess, onError, resetDelay = 2000 } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  // Track the latest execution so stale async results don't update state
  const executionIdRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<void> => {
      // Ignore if already pending — prevents double-submit
      if (state.status === 'pending') return;

      const executionId = ++executionIdRef.current;

      // Clear any pending reset timer from a previous success
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      setState({ status: 'pending', data: null, error: null });

      try {
        const data = await fn();

        // Ignore stale results
        if (executionId !== executionIdRef.current) return;

        setState({ status: 'success', data, error: null });
        onSuccess?.(data);

        if (resetDelay > 0) {
          resetTimerRef.current = setTimeout(() => {
            // Only reset if this execution is still the latest
            if (executionId === executionIdRef.current) {
              setState({ status: 'idle', data: null, error: null });
            }
          }, resetDelay);
        }
      } catch (err) {
        // Ignore stale results
        if (executionId !== executionIdRef.current) return;

        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', data: null, error });
        onError?.(error);
      }
    },
    [state.status, onSuccess, onError, resetDelay]
  );

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    isPending: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
    execute,
    reset,
  };
}
