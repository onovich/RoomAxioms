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
  op: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']),
  value: z.number().int().nonnegative(),
})

export const countComparisonSchema = z.strictObject({
  op: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']),
  offset: z.number().int().min(-5).max(5).optional(),
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

export const anchorDefinitionSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  title: z.string().refine(hasNonBlankText, 'Anchor title must not be empty'),
  subject: cellKindSchema,
})

export const recordDefinitionSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  title: z.string().refine(hasNonBlankText, 'Record title must not be empty'),
  ruleIds: z.array(z.string().regex(ruleIdPattern)).min(1).refine(hasUniqueValues, {
    message: 'Record rule ids must be unique',
  }),
})

export const globalScopeSchema = z.strictObject({
  kind: z.literal('global'),
})

export const localScopeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('orthogonal') }),
  z.strictObject({ kind: z.literal('adjacent') }),
  z.strictObject({ kind: z.literal('north') }),
  z.strictObject({ kind: z.literal('south') }),
  z.strictObject({ kind: z.literal('east') }),
  z.strictObject({ kind: z.literal('west') }),
])

export const staticLineScopeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('row'), index: z.number().int().nonnegative() }),
  z.strictObject({ kind: z.literal('column'), index: z.number().int().nonnegative() }),
])

export const rayScopeSchema = z.strictObject({
  kind: z.literal('ray'),
  direction: z.enum(['north', 'south', 'east', 'west']),
  stopAtKinds: z.array(cellKindSchema).refine(hasUniqueValues, {
    message: 'Ray blocker kinds must be unique',
  }).optional(),
})

export const lineScopeSchema = z.discriminatedUnion('kind', [
  ...staticLineScopeSchema.options,
  rayScopeSchema,
])

export const scopeSchema = z.discriminatedUnion('kind', [globalScopeSchema, ...localScopeSchema.options])

export const regionReferenceScopeSchema = z.strictObject({
  kind: z.literal('region'),
  regionId: z.string().regex(ruleIdPattern),
})

export const countLineScopeRefSchema = z.strictObject({
  kind: z.literal('line'),
  origin: cellIdSchema.optional(),
  scope: lineScopeSchema,
})

export const countScopeRefSchema = z.discriminatedUnion('kind', [
  globalScopeSchema,
  regionReferenceScopeSchema,
  countLineScopeRefSchema,
])

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

export const lineCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('lineCount'),
  origin: cellIdSchema.optional(),
  scope: lineScopeSchema,
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const anchorCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('anchorCount'),
  anchorId: z.string().regex(ruleIdPattern),
  scope: localScopeSchema,
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const recordSetRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('recordSet'),
  recordIds: z.array(z.string().regex(ruleIdPattern)).min(1).refine(hasUniqueValues, {
    message: 'Record-set record ids must be unique',
  }),
  falseRecords: z.strictObject({
    op: z.enum(['eq', 'lte']),
    value: z.literal(1),
  }),
  presentation: rulePresentationSchema,
})

export const scopeOverlapCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('scopeOverlapCount'),
  left: countScopeRefSchema,
  right: countScopeRefSchema,
  mode: z.enum(['intersection', 'union', 'leftOnly', 'rightOnly']),
  target: cellKindSchema,
  count: comparatorSchema,
  presentation: rulePresentationSchema,
})

export const comparativeCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('comparativeCount'),
  left: countScopeRefSchema,
  right: countScopeRefSchema,
  target: cellKindSchema,
  comparison: countComparisonSchema,
  presentation: rulePresentationSchema,
})

export const conditionalCountClauseSchema = z.strictObject({
  scope: countScopeRefSchema,
  target: cellKindSchema,
  count: comparatorSchema,
})

export const conditionalCountRuleSchema = z.strictObject({
  id: z.string().regex(ruleIdPattern),
  type: z.literal('conditionalCount'),
  condition: conditionalCountClauseSchema,
  then: conditionalCountClauseSchema,
  presentation: rulePresentationSchema,
})

export const ruleDefinitionSchema = z.discriminatedUnion('type', [
  globalCountRuleSchema,
  forEachCountRuleSchema,
  regionCountRuleSchema,
  lineCountRuleSchema,
  anchorCountRuleSchema,
  recordSetRuleSchema,
  scopeOverlapCountRuleSchema,
  comparativeCountRuleSchema,
  conditionalCountRuleSchema,
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
  anchors: z.array(anchorDefinitionSchema).refine((anchors) => hasUniqueValues(anchors.map((anchor) => anchor.id)), {
    message: 'Anchor ids must be unique',
  }).optional(),
  records: z.array(recordDefinitionSchema).refine((records) => hasUniqueValues(records.map((record) => record.id)), {
    message: 'Record ids must be unique',
  }).optional(),
  rules: z.array(ruleDefinitionSchema).min(1),
  initialReveals: z.array(cellIdSchema),
  target: z.record(z.string(), cellKindSchema),
  metadata: puzzleMetadataSchema,
})
