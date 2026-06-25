import { z } from 'zod'
import type { CellKind } from '@room-axioms/domain'
import { PUZZLE_SCHEMA_VERSION } from './constants.js'

export const CELL_KIND_VALUES = ['empty', 'bottle', 'bin', 'mirror', 'guest'] as const satisfies readonly CellKind[]

const puzzleIdPattern = /^[a-z0-9][a-z0-9-]{2,63}$/
const ruleIdPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/
const cellIdPattern = /^[A-Za-z]+[1-9][0-9]*$/

const hasUniqueValues = (values: readonly string[]): boolean => new Set(values).size === values.length
const hasNonBlankText = (value: string): boolean => value.trim().length > 0

export const cellKindSchema = z.enum(CELL_KIND_VALUES)

export const cellIdSchema = z.string().regex(cellIdPattern)

export const boardSizeSchema = z.strictObject({
  width: z.number().int().min(3).max(5),
  height: z.number().int().min(3).max(5),
})

export const comparatorSchema = z.strictObject({
  op: z.enum(['eq', 'gte', 'lte']),
  value: z.number().int().nonnegative(),
})

export const rulePresentationSchema = z.strictObject({
  title: z.string().refine(hasNonBlankText, 'Rule presentation title must not be empty'),
  flavor: z.string().refine(hasNonBlankText, 'Rule presentation flavor must not be empty').optional(),
})

export const regionDefinitionSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  title: z.string().refine(hasNonBlankText, 'Region title must not be empty'),
  cells: z.array(cellIdSchema).min(1).refine(hasUniqueValues, {
    message: 'Region cells must be unique',
  }),
})

export const globalScopeSchema = z.strictObject({
  kind: z.literal('global'),
})

export const localScopeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('orthogonal') }),
  z.strictObject({ kind: z.literal('adjacent') }),
])

export const scopeSchema = z.discriminatedUnion('kind', [globalScopeSchema, ...localScopeSchema.options])

export const globalCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('globalCount'),
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const forEachCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('forEachCount'),
  subject: cellKindSchema,
  scope: localScopeSchema,
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const regionCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('regionCount'),
  regionId: z.string().regex(ruleIdPattern),
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const ruleDefinitionSchema = z.discriminatedUnion('type', [
  globalCountRuleSchema,
  forEachCountRuleSchema,
  regionCountRuleSchema,
])

export const puzzleMetadataSchema = z.strictObject({
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  tags: z.array(z.string().refine(hasNonBlankText, 'Metadata tags must not be empty')).refine(hasUniqueValues, {
    message: 'Metadata tags must be unique',
  }),
  author: z.string().refine(hasNonBlankText, 'Metadata author must not be empty').optional(),
  status: z.enum(['draft', 'validated', 'published', 'deprecated']),
  notes: z.string().refine(hasNonBlankText, 'Metadata notes must not be empty').optional(),
})

export const puzzleDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(PUZZLE_SCHEMA_VERSION),
  id: z.string().regex(puzzleIdPattern),
  title: z.string().min(1).max(80),
  caseName: z.string().min(1).max(120).optional(),
  board: boardSizeSchema,
  allowedKinds: z
    .array(cellKindSchema)
    .min(2)
    .refine(hasUniqueValues, { message: 'Allowed kinds must be unique' })
    .refine((kinds) => kinds.includes('empty'), { message: 'Allowed kinds must include empty' })
    .refine((kinds) => kinds.includes('guest'), { message: 'Allowed kinds must include guest' }),
  regions: z.array(regionDefinitionSchema).refine((regions) => hasUniqueValues(regions.map((region) => region.id)), {
    message: 'Region ids must be unique',
  }).optional(),
  rules: z.array(ruleDefinitionSchema).min(1),
  initialReveals: z.array(cellIdSchema),
  target: z.record(z.string(), cellKindSchema),
  metadata: puzzleMetadataSchema,
})
