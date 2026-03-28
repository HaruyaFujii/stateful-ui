import { z } from 'zod';
import type { FieldType } from './types';

// ----------------------------------------------------------------
// Zod v4 compatible type checking
// ----------------------------------------------------------------

function getZodTypeName(zodType: z.ZodTypeAny): string | undefined {
  return (zodType as any)._def?.typeName;
}

// ----------------------------------------------------------------
// Unwrap optional / nullable / default wrappers to get the inner type
// ----------------------------------------------------------------

export function unwrapZodType(zodType: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getZodTypeName(zodType);

  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
    return unwrapZodType((zodType as any).unwrap());
  }
  if (typeName === 'ZodDefault') {
    return unwrapZodType((zodType as any)._def.innerType);
  }
  if (typeName === 'ZodEffects') {
    return unwrapZodType((zodType as any)._def.schema);
  }
  return zodType;
}

export function isOptional(zodType: z.ZodTypeAny): boolean {
  const typeName = getZodTypeName(zodType);
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') return true;
  if (typeName === 'ZodDefault') return true;
  return false;
}

// ----------------------------------------------------------------
// Infer the best default FieldType from a Zod schema
// ----------------------------------------------------------------

export function inferFieldType(zodType: z.ZodTypeAny): FieldType {
  const inner = unwrapZodType(zodType);
  const typeName = getZodTypeName(inner);

  if (typeName === 'ZodString') {
    // Use check metadata to refine type
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

  // Nested object — handled separately as a fieldset
  if (typeName === 'ZodObject') return 'text';

  return 'text';
}

// ----------------------------------------------------------------
// Extract enum options from ZodEnum / ZodNativeEnum
// ----------------------------------------------------------------

export function getEnumOptions(zodType: z.ZodTypeAny): string[] {
  const inner = unwrapZodType(zodType);
  const typeName = getZodTypeName(inner);

  if (typeName === 'ZodEnum') {
    return (inner as any)._def.values as string[];
  }
  if (typeName === 'ZodNativeEnum') {
    const values = (inner as any)._def.values as Record<string, string | number>;
    // Filter out reverse mappings for number enums
    return Object.values(values).filter(v => typeof v === 'string') as string[];
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