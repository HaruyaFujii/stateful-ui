import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { AutoFormProps, FieldConfig } from './types';
import { extractFields, inferFieldType, keyToLabel } from './schema-utils';
import { renderField } from './field-renderers';
import { useAsyncState } from '../../hooks/useAsyncState';

/**
 * Generates a complete, accessible form UI from a Zod schema.
 *
 * - Field types are inferred automatically from the schema
 * - Validation runs on submit (and optionally on change via RHF config)
 * - The submit button shows a loading state while onSubmit is pending
 * - Zod v3 and v4 compatible
 *
 * @example
 * const schema = z.object({
 *   name:  z.string().min(1),
 *   email: z.string().email(),
 *   role:  z.enum(['admin', 'user']),
 * });
 *
 * <AutoForm schema={schema} onSubmit={async (values) => await api.create(values)} />
 */
export function AutoForm<TSchema extends z.ZodObject<z.ZodRawShape>>({
  schema,
  onSubmit,
  fieldConfig = {},
  defaultValues,
  submitLabel = 'Submit',
  submitLoadingLabel = 'Submitting...',
  renderSubmit,
  className = '',
}: AutoFormProps<TSchema>) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as Record<string, unknown>,
    mode: 'onSubmit',
  });

  const { execute, isPending } = useAsyncState<void>({
    resetDelay: 0,
  });

  const handleSubmit = useCallback(
    form.handleSubmit(async (values) => {
      await execute(async () => {
        await onSubmit(values as z.infer<TSchema>);
      });
    }),
    [form, execute, onSubmit]
  );

  // Extract and sort fields
  const fields = extractFields(schema);
  const sortedFields = [...fields].sort((a, b) => {
    const orderA = (fieldConfig as Record<string, { order?: number }>)[a.key]?.order ?? 999;
    const orderB = (fieldConfig as Record<string, { order?: number }>)[b.key]?.order ?? 999;
    return orderA - orderB;
  });

  return (
    <form
      onSubmit={handleSubmit}
      className={`behave-autoform ${className}`.trim()}
      noValidate
    >
      {sortedFields.map(({ key, zodType, isOptional }) => {
        const config = (fieldConfig as Record<string, {
          hidden?: boolean;
          type?: string;
          label?: string;
          placeholder?: string;
          description?: string;
          order?: number;
        }>)[key] ?? {};

        // Skip hidden fields
        if (config.hidden) return null;

        const inferredType = inferFieldType(zodType);
        const fieldType = (config.type as typeof inferredType) || inferredType;
        const label = config.label || keyToLabel(key);

        return renderField(
          key,
          zodType,
          isOptional,
          form,
          { ...config, label, type: fieldType } as FieldConfig
        );
      })}

      {renderSubmit ? (
        renderSubmit(form)
      ) : (
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4em',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isPending ? submitLoadingLabel : submitLabel}
        </button>
      )}
    </form>
  );
}

AutoForm.displayName = 'AutoForm';
