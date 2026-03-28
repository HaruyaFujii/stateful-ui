import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { z } from 'zod';
import { AutoForm } from './index';

afterEach(() => vi.restoreAllMocks());

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function getInput(label: string | RegExp) {
  return screen.getByLabelText(label);
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
}

// ----------------------------------------------------------------
// Schema rendering tests
// ----------------------------------------------------------------

describe('AutoForm — field rendering', () => {
  it('renders a text input for z.string()', () => {
    const schema = z.object({ name: z.string() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text');
  });

  it('renders an email input for z.string().email()', () => {
    const schema = z.object({ email: z.string().email() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
  });

  it('renders a number input for z.number()', () => {
    const schema = z.object({ age: z.number() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/age/i)).toHaveAttribute('type', 'number');
  });

  it('renders a checkbox for z.boolean()', () => {
    const schema = z.object({ agree: z.boolean() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders a select for z.enum()', () => {
    const schema = z.object({ role: z.enum(['admin', 'user']) });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'user' })).toBeInTheDocument();
  });

  it('renders a textarea when fieldConfig.type = "textarea"', () => {
    const schema = z.object({ bio: z.string() });
    render(
      <AutoForm schema={schema} onSubmit={vi.fn()} fieldConfig={{ bio: { type: 'textarea' } }} />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // textarea has no `type` attr but is a textbox
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('renders a radio-group when fieldConfig.type = "radio-group"', () => {
    const schema = z.object({ role: z.enum(['admin', 'user']) });
    render(
      <AutoForm schema={schema} onSubmit={vi.fn()} fieldConfig={{ role: { type: 'radio-group' } }} />
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('converts camelCase key to readable label', () => {
    const schema = z.object({ firstName: z.string() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByText(/First Name/i)).toBeInTheDocument();
  });

  it('uses fieldConfig.label as the label', () => {
    const schema = z.object({ n: z.string() });
    render(
      <AutoForm schema={schema} onSubmit={vi.fn()} fieldConfig={{ n: { label: 'Full Name' } }} />
    );
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
  });

  it('hides a field when fieldConfig.hidden = true', () => {
    const schema = z.object({ name: z.string(), secret: z.string() });
    render(
      <AutoForm schema={schema} onSubmit={vi.fn()} fieldConfig={{ secret: { hidden: true } }} />
    );
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument();
  });

  it('marks required fields with aria-required', () => {
    const schema = z.object({ name: z.string() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-required', 'true');
  });

  it('does NOT mark optional fields as required', () => {
    const schema = z.object({ bio: z.string().optional() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/bio/i)).not.toHaveAttribute('aria-required', 'true');
  });

  it('shows a submit button', () => {
    const schema = z.object({ name: z.string() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('uses custom submitLabel', () => {
    const schema = z.object({ name: z.string() });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} submitLabel="Save Changes" />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});

// ----------------------------------------------------------------
// Validation tests
// ----------------------------------------------------------------

describe('AutoForm — validation', () => {
  it('shows Zod error message when required field is empty', async () => {
    const schema = z.object({ name: z.string().min(1, 'Name is required') });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);

    submit();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
    );
  });

  it('does not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();
    const schema = z.object({ email: z.string().email('Invalid email') });
    render(<AutoForm schema={schema} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    submit();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct typed values when valid', async () => {
    const onSubmit = vi.fn();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    render(<AutoForm schema={schema} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } });
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
  });

  it('shows loading state while onSubmit is pending', async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });
    const onSubmit = vi.fn(() => promise);

    const schema = z.object({ name: z.string().min(1) });
    render(
      <AutoForm schema={schema} onSubmit={onSubmit} submitLoadingLabel="Saving..." />
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Alice' } });
    submit();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    );

    await act(async () => { resolve(); await promise; });
  });

  it('populates defaultValues into fields', () => {
    const schema = z.object({ name: z.string() });
    render(
      <AutoForm schema={schema} onSubmit={vi.fn()} defaultValues={{ name: 'Bob' }} />
    );
    expect(screen.getByLabelText(/name/i)).toHaveValue('Bob');
  });
});

// ----------------------------------------------------------------
// Accessibility tests
// ----------------------------------------------------------------

describe('AutoForm — accessibility', () => {
  it('error messages have role="alert"', async () => {
    const schema = z.object({ name: z.string().min(1, 'Required') });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    submit();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('error message is linked to input via aria-describedby', async () => {
    const schema = z.object({ name: z.string().min(1, 'Required') });
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);
    submit();

    await waitFor(() => {
      const input = screen.getByLabelText(/name/i);
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId!)).toHaveTextContent('Required');
    });
  });

  it('submit button is disabled while submitting', async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });
    const schema = z.object({ name: z.string().min(1) });
    render(<AutoForm schema={schema} onSubmit={() => promise} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Alice' } });
    submit();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    );

    await act(async () => { resolve(); await promise; });
  });
});
