import type { z } from 'zod';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

// ----------------------------------------------------------------
// Field config — per-field UI overrides
// ----------------------------------------------------------------

export type FieldType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'email'
  | 'url'
  | 'number'
  | 'range'
  | 'checkbox'
  | 'toggle'
  | 'select'
  | 'radio-group'
  | 'combobox'
  | 'date'
  | 'datetime-local'
  | 'multi-select';

export interface FieldConfig {
  /** Display label. Defaults to a title-cased version of the field key. */
  label?: string;
  /** Placeholder text for inputs. */
  placeholder?: string;
  /** Override the default UI type inferred from the Zod schema. */
  type?: FieldType;
  /** Additional description shown below the field. */
  description?: string;
  /** Hide this field from the form entirely. */
  hidden?: boolean;
  /** Order override (lower = earlier). Defaults to schema order. */
  order?: number;
}

// ----------------------------------------------------------------
// AutoForm props
// ----------------------------------------------------------------

export interface AutoFormProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** Zod schema that drives the form structure and validation. */
  schema: TSchema;
  /**
   * Called with fully validated, typed values on submit.
   * Can be async — the submit button will show a loading state.
   */
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
  /** Per-field UI configuration. Keys match the schema field names. */
  fieldConfig?: Partial<Record<keyof z.infer<TSchema>, FieldConfig>>;
  /** Default values. Merged with Zod defaults. */
  defaultValues?: Partial<z.infer<TSchema>>;
  /** Label for the submit button. @default "Submit" */
  submitLabel?: string;
  /** Label for the submit button while submitting. @default "Submitting..." */
  submitLoadingLabel?: string;
  /**
   * Render prop — replaces the default submit button.
   * Receives the form instance for full control.
   */
  renderSubmit?: (form: UseFormReturn<FieldValues>) => React.ReactNode;
  /** Class applied to the <form> element. */
  className?: string;
}
