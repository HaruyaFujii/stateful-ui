import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncState } from './useAsyncState';

describe('useAsyncState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.runAllTimers(); vi.useRealTimers(); });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useAsyncState());
    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions idle → pending → success', async () => {
    const { result } = renderHook(() => useAsyncState<string>());

    let resolve!: (v: string) => void;
    const promise = new Promise<string>((res) => { resolve = res; });

    act(() => { void result.current.execute(() => promise); });
    expect(result.current.status).toBe('pending');
    expect(result.current.isPending).toBe(true);

    await act(async () => { resolve('hello'); await promise; });
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('hello');
    expect(result.current.isSuccess).toBe(true);
  });

  it('transitions idle → pending → error', async () => {
    const { result } = renderHook(() => useAsyncState({ resetDelay: 0 }));

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('boom')));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.isError).toBe(true);
  });

  it('auto-resets to idle after resetDelay', async () => {
    const { result } = renderHook(() => useAsyncState({ resetDelay: 1000 }));

    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'));
    });

    expect(result.current.status).toBe('success');

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.status).toBe('idle');
  });

  it('does not reset when resetDelay is 0', async () => {
    const { result } = renderHook(() => useAsyncState({ resetDelay: 0 }));

    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'));
    });

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe('success');
  });

  it('ignores concurrent executions while pending', async () => {
    const fn = vi.fn(() => new Promise<string>((res) => setTimeout(() => res('ok'), 500)));
    const { result } = renderHook(() => useAsyncState<string>());

    act(() => { void result.current.execute(fn); });
    act(() => { void result.current.execute(fn); }); // should be ignored
    act(() => { void result.current.execute(fn); }); // should be ignored

    await act(async () => vi.advanceTimersByTime(600));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onSuccess with the result', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsyncState({ onSuccess, resetDelay: 0 }));

    await act(async () => {
      await result.current.execute(() => Promise.resolve({ id: 1 }));
    });

    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
  });

  it('calls onError with an Error instance', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAsyncState({ onError, resetDelay: 0 }));

    await act(async () => {
      await result.current.execute(() => Promise.reject('string error'));
    });

    // Non-Error rejections are wrapped
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0]?.[0].message).toBe('string error');
  });

  it('manual reset() returns to idle', async () => {
    const { result } = renderHook(() => useAsyncState({ resetDelay: 0 }));

    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'));
    });

    expect(result.current.status).toBe('success');

    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
  });
});
