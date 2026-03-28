import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { z } from 'zod';
import { AutoForm } from './index';

afterEach(() => {
  vi.restoreAllMocks();
});

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

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

// ----------------------------------------------------------------
// Discriminated Union tests
// ----------------------------------------------------------------

describe('AutoForm — Discriminated Union', () => {
  const schema = z.discriminatedUnion('accountType', [
    z.object({
      accountType: z.literal('personal'),
      age: z.number().int().positive(),
    }),
    z.object({
      accountType: z.literal('company'),
      taxId: z.string().min(1),
    }),
  ]);

  it('renders discriminator field as select', () => {
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);

    const discriminatorSelect = screen.getByLabelText(/account type/i);
    expect(discriminatorSelect).toBeInTheDocument();
    expect(discriminatorSelect.tagName).toBe('SELECT');

    // Check options are present
    expect(screen.getByDisplayValue('Select...')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('shows personal fields when personal is selected', () => {
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);

    // Initially no conditional fields
    expect(screen.queryByLabelText(/age/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tax id/i)).not.toBeInTheDocument();

    // Select personal
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'personal' }
    });

    // Personal field should appear
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/tax id/i)).not.toBeInTheDocument();
  });

  it('switches from personal to company fields', () => {
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />);

    // Select personal first
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'personal' }
    });
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();

    // Switch to company
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'company' }
    });

    // Company field should appear, personal should disappear
    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/age/i)).not.toBeInTheDocument();
  });

  it('validates based on selected discriminator option', async () => {
    const onSubmit = vi.fn();
    render(<AutoForm schema={schema} onSubmit={onSubmit} />);

    // Select personal but don't fill age
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'personal' }
    });

    submit();

    // Should show validation error and not call onSubmit
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with correct typed values for personal account', async () => {
    const onSubmit = vi.fn();
    render(<AutoForm schema={schema} onSubmit={onSubmit} />);

    // Select personal and fill fields
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'personal' }
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '25', valueAsNumber: 25 }
    });

    submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        accountType: 'personal',
        age: 25,
      });
    });
  });

  it('submits with correct typed values for company account', async () => {
    const onSubmit = vi.fn();
    render(<AutoForm schema={schema} onSubmit={onSubmit} />);

    // Select company and fill fields
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'company' }
    });
    fireEvent.change(screen.getByLabelText(/tax id/i), {
      target: { value: '123456789' }
    });

    submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        accountType: 'company',
        taxId: '123456789',
      });
    });
  });
});
