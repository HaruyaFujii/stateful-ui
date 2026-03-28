import { z } from 'zod';
import type { FieldType } from './types';

// ----------------------------------------------------------------
// Zod v4 compatible type checking
// ----------------------------------------------------------------

export function getZodTypeName(zodType: z.ZodTypeAny): string | undefined {
  // Zod v4 compatibility: check both def.type and _def.typeName
  const def = (zodType as any).def || (zodType as any)._def;
  if (!def) return undefined;

  // In Zod v4, the type is stored in def.type as a string
  if (def.type) {
    // Convert type to old typeName format for compatibility
    const typeMap: Record<string, string> = {
      'string': 'ZodString',
      'number': 'ZodNumber',
      'boolean': 'ZodBoolean',
      'date': 'ZodDate',
      'enum': 'ZodEnum',
      'nativeEnum': 'ZodNativeEnum',
      'object': 'ZodObject',
      'array': 'ZodArray',
      'optional': 'ZodOptional',
      'nullable': 'ZodNullable',
      'literal': 'ZodLiteral',
      'union': 'ZodUnion',
      'discriminatedUnion': 'ZodDiscriminatedUnion',
      'intersection': 'ZodIntersection',
      'tuple': 'ZodTuple',
      'record': 'ZodRecord',
      'map': 'ZodMap',
      'set': 'ZodSet',
      'function': 'ZodFunction',
      'lazy': 'ZodLazy',
      'promise': 'ZodPromise',
      'any': 'ZodAny',
      'unknown': 'ZodUnknown',
      'never': 'ZodNever',
      'void': 'ZodVoid',
      'nan': 'ZodNaN',
      'bigint': 'ZodBigInt',
      'symbol': 'ZodSymbol',
      'null': 'ZodNull',
      'undefined': 'ZodUndefined',
    };
    return typeMap[def.type] || def.type;
  }

  // Fallback for Zod v3
  return def.typeName;
}

// ----------------------------------------------------------------
// Unwrap optional / nullable / default wrappers to get the inner type
// ----------------------------------------------------------------

export function unwrapZodType(zodType: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getZodTypeName(zodType);

  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
    // Zod v4: Check for unwrap method
    if (typeof (zodType as any).unwrap === 'function') {
      return unwrapZodType((zodType as any).unwrap());
    }
    // Fallback: check def structure
    const def = (zodType as any).def || (zodType as any)._def;
    if (def && def.innerType) {
      return unwrapZodType(def.innerType);
    }
  }
  if (typeName === 'ZodDefault') {
    const def = (zodType as any).def || (zodType as any)._def;
    return unwrapZodType(def.innerType);
  }
  if (typeName === 'ZodEffects') {
    const def = (zodType as any).def || (zodType as any)._def;
    return unwrapZodType(def.schema);
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
    const def = (inner as any).def || (inner as any)._def;
    const checks = def.checks ?? [];
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
    // Zod v4: Check for options array first
    if ((inner as any).options) {
      return (inner as any).options as string[];
    }
    // Zod v3/v4: Check def.entries or _def.values
    const def = (inner as any).def || (inner as any)._def;
    if (def.entries) {
      return def.entries as string[];
    }
    if (def.values) {
      return def.values as string[];
    }
  }
  if (typeName === 'ZodNativeEnum') {
    const def = (inner as any).def || (inner as any)._def;
    const values = def.values as Record<string, string | number>;
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