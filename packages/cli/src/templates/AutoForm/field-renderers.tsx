import React from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import type { FieldConfig, FieldType } from './types';
import { getEnumOptions, unwrapZodType, getZodTypeName } from './schema-utils';
import type { z } from 'zod';

// ----------------------------------------------------------------
// Shared field wrapper
// ----------------------------------------------------------------

interface FieldWrapperProps {
  id: string;
  label: string;
  isRequired: boolean;
  description?: string | undefined;
  error?: string | undefined;
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
          id={`${id}-hint`}
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginTop: '0.25rem',
          }}
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: '#ef4444',
            marginTop: '0.25rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Helper function to detect if schema type is ZodNumber
// ----------------------------------------------------------------

function isNumberType(zodType: z.ZodTypeAny): boolean {
  const typeName = getZodTypeName(zodType);
  return typeName === 'ZodNumber';
}

// ----------------------------------------------------------------
// Render a form field based on its type and configuration
// ----------------------------------------------------------------

export function renderField<T extends FieldValues>(
  fieldKey: string,
  zodType: z.ZodTypeAny,
  isOptional: boolean,
  form: UseFormReturn<T>,
  fieldConfig?: FieldConfig
) {
  const {
    register,
    formState: { errors },
  } = form;

  const config = fieldConfig || {};
  const fieldType: FieldType = config.type || inferFieldType(zodType);
  const label = config.label || keyToLabel(fieldKey);
  const placeholder = config.placeholder;
  const description = config.description;

  const isRequired = !isOptional;
  const error = errors[fieldKey]?.message as string | undefined;
  const id = `field-${fieldKey}`;

  // Special handling for number fields
  const isNumber = isNumberType(unwrapZodType(zodType));
  const registration = isNumber && fieldType === 'number'
    ? register(fieldKey as any, { valueAsNumber: true })
    : register(fieldKey as any);

  // Common styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    minWidth: '200px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    minHeight: '2.5rem', // より良い見た目のための最小高さ
  };

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
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            {...register(fieldKey as any)}
            id={id}
            type="checkbox"
            aria-describedby={error ? `${id}-error` : undefined}
            style={{ width: '1rem', height: '1rem' }}
          />
          <span style={{ fontSize: '0.875rem' }}>{label}</span>
        </label>
      </FieldWrapper>
    );
  }

  // ---- Select / Radio Group ----
  if (fieldType === 'select' || fieldType === 'radio-group') {
    const options = getEnumOptions(zodType);

    if (options.length === 0) {
      // No options available - fallback to text input
      return renderField(fieldKey, zodType, isOptional, form, {
        ...config,
        type: 'text'
      });
    }

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
          {!isRequired && <option value="">— 選択してください —</option>}
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
          aria-required={isRequired}
          aria-describedby={error ? `${id}-error` : undefined}
          rows={4}
          style={inputStyle}
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

// ----------------------------------------------------------------
// Import needed utilities from schema-utils
// ----------------------------------------------------------------

function inferFieldType(zodType: z.ZodTypeAny): FieldType {
  const inner = unwrapZodType(zodType);
  const typeName = getZodTypeName(inner);

  if (typeName === 'ZodString') {
    const checks = (inner as any)._def.checks ?? [];
    if (checks.some((c: { kind: string }) => c.kind === 'email')) return 'email';
    if (checks.some((c: { kind: string }) => c.kind === 'url')) return 'url';
    return 'text';
  }

  if (typeName === 'ZodNumber') return 'number';
  if (typeName === 'ZodBoolean') return 'checkbox';
  if (typeName === 'ZodEnum') return 'select';
  if (typeName === 'ZodNativeEnum') return 'select';
  if (typeName === 'ZodDate') return 'date';
  if (typeName === 'ZodArray') return 'multi-select';
  if (typeName === 'ZodObject') return 'text';

  return 'text';
}

function keyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

