import { z } from 'zod';
import type { FieldType } from './types';

// ----------------------------------------------------------------
// Unwrap optional / nullable / default wrappers to get the inner type
// ----------------------------------------------------------------

export function unwrapZodType(zodType: z.ZodTypeAny): z.ZodTypeAny {
  if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) {
    return unwrapZodType(zodType.unwrap());
  }
  if (zodType instanceof z.ZodDefault) {
    return unwrapZodType(zodType._def.innerType);
  }
  if (zodType instanceof z.ZodEffects) {
    return unwrapZodType(zodType._def.schema);
  }
  return zodType;
}

export function isOptional(zodType: z.ZodTypeAny): boolean {
  if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) return true;
  if (zodType instanceof z.ZodDefault) return true;
  return false;
}

// ----------------------------------------------------------------
// Infer the best default FieldType from a Zod schema
// ----------------------------------------------------------------

export function inferFieldType(zodType: z.ZodTypeAny): FieldType {
  const inner = unwrapZodType(zodType);

  if (inner instanceof z.ZodString) {
    // Use check metadata to refine type
    const checks = inner._def.checks ?? [];
    if (checks.some((c: { kind: string }) => c.kind === 'email')) return 'email';
    if (checks.some((c: { kind: string }) => c.kind === 'url')) return 'url';
    return 'text';
  }

  if (inner instanceof z.ZodNumber) return 'number';
  if (inner instanceof z.ZodBoolean) return 'checkbox';
  if (inner instanceof z.ZodEnum) return 'select';
  if (inner instanceof z.ZodNativeEnum) return 'select';
  if (inner instanceof z.ZodDate) return 'date';
  if (inner instanceof z.ZodArray) return 'multi-select';

  // Nested object — handled separately as a fieldset
  if (inner instanceof z.ZodObject) return 'text';

  return 'text';
}

// ----------------------------------------------------------------
// Extract enum options from ZodEnum / ZodNativeEnum
// ----------------------------------------------------------------

export function getEnumOptions(zodType: z.ZodTypeAny): string[] {
  const inner = unwrapZodType(zodType);
  if (inner instanceof z.ZodEnum) {
    return inner._def.values as string[];
  }
  if (inner instanceof z.ZodNativeEnum) {
    return Object.values(inner._def.values as Record<string, string>);
  }
  return [];
}

// ----------------------------------------------------------------
// Convert a camelCase / snake_case key to a human-readable label
// ----------------------------------------------------------------

export function keyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ----------------------------------------------------------------
// Extract the fields from a ZodObject in definition order
// ----------------------------------------------------------------

export interface FieldMeta {
  key: string;
  zodType: z.ZodTypeAny;
  isOptional: boolean;
}

export function extractFields(schema: z.ZodObject<z.ZodRawShape>): FieldMeta[] {
  const shape = schema.shape;
  return Object.entries(shape).map(([key, zodType]) => ({
    key,
    zodType: zodType as z.ZodTypeAny,
    isOptional: isOptional(zodType as z.ZodTypeAny),
  }));
}
