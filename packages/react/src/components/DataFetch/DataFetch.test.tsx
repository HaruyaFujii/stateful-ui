import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataFetch } from './index';
import { clearDataFetchCache } from './useDataFetch';

// ----------------------------------------------------------------
// Setup: キャッシュとタイマーをリセット
// ----------------------------------------------------------------

beforeEach(() => {
  clearDataFetchCache();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

type User = { id: number; name: string };

function makeQuery<T>(value: T, delay = 0): () => Promise<T> {
  return () => new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

function makeRejectedQuery(message = 'Fetch failed', delay = 0): () => Promise<never> {
  return () =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), delay)
    );
}

// ----------------------------------------------------------------
// Loading state
// ----------------------------------------------------------------

describe('DataFetch — loading state', () => {
  it('shows default skeleton while loading', () => {
    render(
      <DataFetch queryKey={['test']} queryFn={makeQuery({ id: 1 }, 500)}>
        {(data) => <div>{JSON.stringify(data)}</div>}
      </DataFetch>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('shows custom loadingFallback while loading', () => {
    render(
      <DataFetch
        queryKey={['test']}
        queryFn={makeQuery({ id: 1 }, 500)}
        loadingFallback={<div>Custom loading...</div>}
      >
        {(data) => <div>{JSON.stringify(data)}</div>}
      </DataFetch>
    );
    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('has data-status="loading" while fetching', () => {
    const { container } = render(
      <DataFetch queryKey={['test']} queryFn={makeQuery({ id: 1 }, 500)}>
        {() => <div>data</div>}
      </DataFetch>
    );
    expect(container.firstChild).toHaveAttribute('data-status', 'loading');
  });
});

// ----------------------------------------------------------------
// Success state
// ----------------------------------------------------------------

describe('DataFetch — success state', () => {
  it('renders children with data on success', async () => {
    render(
      <DataFetch queryKey={['user', 1]} queryFn={makeQuery<User>({ id: 1, name: 'Alice' })}>
        {(user) => <div>Hello, {user.name}</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('Hello, Alice')).toBeInTheDocument());
  });

  it('has data-status="success" after fetch', async () => {
    const { container } = render(
      <DataFetch queryKey={['user', 1]} queryFn={makeQuery<User>({ id: 1, name: 'Alice' })}>
        {(user) => <div>{user.name}</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute('data-status', 'success')
    );
  });

  it('uses cached data without re-fetching within staleTime', async () => {
    const queryFn = vi.fn(makeQuery<User>({ id: 1, name: 'Alice' }));

    // First render
    const { unmount } = render(
      <DataFetch queryKey={['user', 1]} queryFn={queryFn} staleTime={60_000}>
        {(user) => <div>{user.name}</div>}
      </DataFetch>
    );
    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    unmount();

    // Second render — should use cache
    render(
      <DataFetch queryKey={['user', 1]} queryFn={queryFn} staleTime={60_000}>
        {(user) => <div>{user.name}</div>}
      </DataFetch>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(queryFn).toHaveBeenCalledTimes(1); // キャッシュ利用でfetch1回のみ
  });
});

// ----------------------------------------------------------------
// Empty state
// ----------------------------------------------------------------

describe('DataFetch — empty state', () => {
  it('shows emptyFallback when data is null', async () => {
    render(
      <DataFetch
        queryKey={['user', 999]}
        queryFn={makeQuery<User | null>(null)}
        emptyFallback={<p>No user found.</p>}
      >
        {(user) => <div>{user.name}</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('No user found.')).toBeInTheDocument());
  });

  it('shows emptyFallback when data is empty array', async () => {
    render(
      <DataFetch
        queryKey={['users']}
        queryFn={makeQuery<User[]>([])}
        emptyFallback={<p>No users.</p>}
      >
        {(users) => <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('No users.')).toBeInTheDocument());
  });

  it('renders nothing when data is empty and no emptyFallback given', async () => {
    const { container } = render(
      <DataFetch queryKey={['empty']} queryFn={makeQuery<null>(null)}>
        {() => <div>Data</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute('data-status', 'success')
    );
    expect(screen.queryByText('Data')).not.toBeInTheDocument();
  });
});

// ----------------------------------------------------------------
// Error state
// ----------------------------------------------------------------

describe('DataFetch — error state', () => {
  it('shows default error fallback on fetch failure (after retries)', async () => {
    render(
      <DataFetch
        queryKey={['fail']}
        queryFn={makeRejectedQuery('Not found')}
        retry={false}
      >
        {() => <div>Data</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('shows custom errorFallback on failure', async () => {
    render(
      <DataFetch
        queryKey={['fail']}
        queryFn={makeRejectedQuery('Server error')}
        retry={false}
        errorFallback={({ error }) => <div>Custom error: {error.message}</div>}
      >
        {() => <div>Data</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() =>
      expect(screen.getByText('Custom error: Server error')).toBeInTheDocument()
    );
  });

  it('has data-status="error" after failure', async () => {
    const { container } = render(
      <DataFetch
        queryKey={['fail']}
        queryFn={makeRejectedQuery()}
        retry={false}
      >
        {() => <div>Data</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute('data-status', 'error')
    );
  });

  it('retries the specified number of times before showing error', async () => {
    const queryFn = vi.fn(makeRejectedQuery('fail'));

    render(
      <DataFetch queryKey={['fail']} queryFn={queryFn} retry={2} retryDelay={100}>
        {() => <div>Data</div>}
      </DataFetch>
    );

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    // 初回 + 2回リトライ = 3回呼ばれる
    expect(queryFn).toHaveBeenCalledTimes(3);
  });

  it('re-fetches when retry button is clicked', async () => {
    let callCount = 0;
    const queryFn = vi.fn(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('First fail'));
      return Promise.resolve({ id: 1, name: 'Alice' });
    });

    render(
      <DataFetch queryKey={['retry-test']} queryFn={queryFn} retry={false}>
        {(user: User) => <div>Hello, {user.name}</div>}
      </DataFetch>
    );

    // エラー状態になるまで待つ
    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    // "Try again" ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('Hello, Alice')).toBeInTheDocument());
  });
});

// ----------------------------------------------------------------
// queryKey の変更
// ----------------------------------------------------------------

describe('DataFetch — queryKey change', () => {
  it('re-fetches when queryKey changes', async () => {
    const queryFn = vi.fn((id: number) => makeQuery<User>({ id, name: `User ${id}` })());

    function TestComponent({ userId }: { userId: number }) {
      return (
        <DataFetch
          queryKey={['user', userId]}
          queryFn={() => queryFn(userId)}
          staleTime={0}
        >
          {(user) => <div>{user.name}</div>}
        </DataFetch>
      );
    }

    const { rerender } = render(<TestComponent userId={1} />);
    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('User 1')).toBeInTheDocument());

    rerender(<TestComponent userId={2} />);
    await act(async () => vi.runAllTimersAsync());
    await waitFor(() => expect(screen.getByText('User 2')).toBeInTheDocument());

    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
