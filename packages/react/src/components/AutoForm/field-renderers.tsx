import React from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import type { FieldConfig, FieldType } from './types';
import { getEnumOptions, unwrapZodType } from './schema-utils';
import type { z } from 'zod';

// ----------------------------------------------------------------
// Shared field wrapper
// ----------------------------------------------------------------

interface FieldWrapperProps {
  id: string;
  label: string;
  isRequired: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  id,
  label,
  isRequired,
  description,
  error,
  children,
}: FieldWrapperProps) {
  return (
    <div className="behave-field" style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {label}
        {isRequired && (
          <span aria-hidden="true" style={{ color: '#ef4444', marginLeft: '0.25rem' }}>
            *
          </span>
        )}
      </label>

      {children}

      {description && !error && (
        <p
          style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Base input styles (inline, no Tailwind dependency)
// ----------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#fff',
  cursor: 'pointer',
};

// ----------------------------------------------------------------
// Field renderer dispatcher
// ----------------------------------------------------------------

interface RenderFieldProps {
  fieldKey: string;
  fieldType: FieldType;
  config: FieldConfig;
  isRequired: boolean;
  zodType: z.ZodTypeAny;
  form: UseFormReturn<FieldValues>;
}

export function renderField({
  fieldKey,
  fieldType,
  config,
  isRequired,
  zodType,
  form,
}: RenderFieldProps): React.ReactNode {
  const id = `autoform-${fieldKey}`;
  const label = config.label ?? fieldKey;
  const placeholder = config.placeholder ?? '';
  const description = config.description;
  const error = form.formState.errors[fieldKey]?.message as string | undefined;

  const registration = form.register(fieldKey);

  // ---- Checkbox / Toggle ----
  if (fieldType === 'checkbox' || fieldType === 'toggle') {
    return (
      <FieldWrapper
        key={fieldKey}
        id={id}
        label=""
        isRequired={false}
        description={description}
        error={error}
      >
        <label
          htmlFor={id}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <input
            {...registration}
            id={id}
            type="checkbox"
            aria-describedby={error ? `${id}-error` : undefined}
            style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {label}
            {isRequired && (
              <span aria-hidden="true" style={{ color: '#ef4444', marginLeft: '0.25rem' }}>
                *
              </span>
            )}
          </span>
        </label>
      </FieldWrapper>
    );
  }

  // ---- Select ----
  if (fieldType === 'select' || fieldType === 'radio-group') {
    const options = getEnumOptions(zodType);

    if (fieldType === 'radio-group') {
      return (
        <FieldWrapper
          key={fieldKey}
          id={id}
          label={label}
          isRequired={isRequired}
          description={description}
          error={error}
        >
          <div role="radiogroup" aria-labelledby={`${id}-label`} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {options.map((opt) => (
              <label
                key={opt}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                <input
                  {...registration}
                  type="radio"
                  value={opt}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                {opt}
              </label>
            ))}
          </div>
        </FieldWrapper>
      );
    }

    return (
      <FieldWrapper
        key={fieldKey}
        id={id}
        label={label}
        isRequired={isRequired}
        description={description}
        error={error}
      >
        <select
          {...registration}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          style={selectStyle}
        >
          {!isRequired && <option value="">— Select —</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  // ---- Textarea ----
  if (fieldType === 'textarea') {
    return (
      <FieldWrapper
        key={fieldKey}
        id={id}
        label={label}
        isRequired={isRequired}
        description={description}
        error={error}
      >
        <textarea
          {...registration}
          id={id}
          placeholder={placeholder}
          rows={4}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </FieldWrapper>
    );
  }

  // ---- Range ----
  if (fieldType === 'range') {
    return (
      <FieldWrapper
        key={fieldKey}
        id={id}
        label={label}
        isRequired={isRequired}
        description={description}
        error={error}
      >
        <input
          {...registration}
          id={id}
          type="range"
          aria-describedby={error ? `${id}-error` : undefined}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </FieldWrapper>
    );
  }

  // ---- Date / Datetime-local ----
  if (fieldType === 'date' || fieldType === 'datetime-local') {
    return (
      <FieldWrapper
        key={fieldKey}
        id={id}
        label={label}
        isRequired={isRequired}
        description={description}
        error={error}
      >
        <input
          {...registration}
          id={id}
          type={fieldType}
          aria-describedby={error ? `${id}-error` : undefined}
          style={inputStyle}
        />
      </FieldWrapper>
    );
  }

  // ---- Default: text / email / url / password / number ----
  const inputType = (
    fieldType === 'email' ? 'email'
    : fieldType === 'url' ? 'url'
    : fieldType === 'password' ? 'password'
    : fieldType === 'number' ? 'number'
    : 'text'
  );

  return (
    <FieldWrapper
      key={fieldKey}
      id={id}
      label={label}
      isRequired={isRequired}
      description={description}
      error={error}
    >
      <input
        {...registration}
        id={id}
        type={inputType}
        placeholder={placeholder}
        aria-required={isRequired}
        aria-describedby={error ? `${id}-error` : undefined}
        style={inputStyle}
      />
    </FieldWrapper>
  );
}
