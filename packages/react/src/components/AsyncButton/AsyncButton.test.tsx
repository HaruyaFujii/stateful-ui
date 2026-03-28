import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AsyncButton } from './index';

// fake timers は使わず、実際の Promise 解決タイミングに任せる
// (vi.useFakeTimers と waitFor の相性問題を回避)

afterEach(() => vi.restoreAllMocks());

describe('AsyncButton', () => {

  // --- Rendering (同期) ---

  it('renders children in idle state', () => {
    render(<AsyncButton onClick={() => Promise.resolve()}>Submit</AsyncButton>);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('is not disabled in idle state', () => {
    render(<AsyncButton onClick={() => Promise.resolve()}>Submit</AsyncButton>);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('has data-status="idle" initially', () => {
    render(<AsyncButton onClick={() => Promise.resolve()}>Submit</AsyncButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-status', 'idle');
  });

  it('sets aria-busy="false" when not pending', () => {
    render(<AsyncButton onClick={() => Promise.resolve()}>Submit</AsyncButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');
  });

  it('respects external disabled prop', () => {
    render(<AsyncButton onClick={() => Promise.resolve()} disabled>Submit</AsyncButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // --- Pending state ---

  it('shows loadingText while pending', async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });

    render(
      <AsyncButton onClick={() => promise} loadingText="Submitting...">Submit</AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Submitting...')).toBeInTheDocument());
    expect(screen.getByRole('button')).toHaveAttribute('data-status', 'pending');

    await act(async () => { resolve(); await promise; });
  });

  it('disables the button and sets aria-busy while pending', async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });

    render(<AsyncButton onClick={() => promise}>Submit</AsyncButton>);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');

    await act(async () => { resolve(); await promise; });
  });

  it('prevents double-submit by ignoring clicks while pending', async () => {
    const onClick = vi.fn(() => new Promise<void>((res) => setTimeout(res, 50)));
    render(<AsyncButton onClick={onClick}>Submit</AsyncButton>);

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
    fireEvent.click(screen.getByRole('button')); // disabled なので無視される

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'success')
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // --- Success state ---

  it('shows successText after resolution', async () => {
    render(
      <AsyncButton
        onClick={() => Promise.resolve('ok')}
        successText="Done!"
        resetDelay={0}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Done!')).toBeInTheDocument());
    expect(screen.getByRole('button')).toHaveAttribute('data-status', 'success');
  });

  it('calls onSuccess with the resolved value', async () => {
    const onSuccess = vi.fn();
    render(
      <AsyncButton
        onClick={() => Promise.resolve({ id: 42 })}
        onSuccess={onSuccess}
        resetDelay={0}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 42 }));
  });

  it('auto-resets to idle after resetDelay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true }); // real Promise + fake setTimeout

    render(
      <AsyncButton
        onClick={() => Promise.resolve('ok')}
        successText="Done!"
        resetDelay={500}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Done!')).toBeInTheDocument());

    act(() => vi.advanceTimersByTime(500));

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'idle')
    );

    vi.useRealTimers();
  });

  // --- Error state ---

  it('shows errorText after rejection', async () => {
    render(
      <AsyncButton
        onClick={() => Promise.reject(new Error('API error'))}
        errorText="Failed!"
        resetDelay={0}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Failed!')).toBeInTheDocument());
    expect(screen.getByRole('button')).toHaveAttribute('data-status', 'error');
  });

  it('calls onError with the error', async () => {
    const onError = vi.fn();
    render(
      <AsyncButton
        onClick={() => Promise.reject(new Error('Network timeout'))}
        onError={onError}
        resetDelay={0}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0]?.[0]).toHaveProperty('message', 'Network timeout');
  });

  it('re-enables the button after error so the user can retry', async () => {
    render(
      <AsyncButton
        onClick={() => Promise.reject(new Error('fail'))}
        resetDelay={0}
      >
        Submit
      </AsyncButton>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'error')
    );
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  // --- renderContent ---

  it('uses renderContent when provided', async () => {
    const renderContent = vi.fn((status: string) => <span>Status: {status}</span>);
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });

    render(
      <AsyncButton onClick={() => promise} renderContent={renderContent}>
        Fallback
      </AsyncButton>
    );

    expect(screen.getByText('Status: idle')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Status: pending')).toBeInTheDocument());

    await act(async () => { resolve(); await promise; });
    await waitFor(() => expect(screen.getByText('Status: success')).toBeInTheDocument());
  });
});
