import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CellKind, CountScopeRef, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import type { AuthoringCaseValidationReport, AuthoringCliReport } from './contracts.js'
import {
  candidateShrinkSignature,
  canonicalPuzzleIsomorphismSignature,
  evaluateCoreQualityGates,
  evaluateDegeneracyGates,
  evaluateRuleFamilyDiversityGate,
  evaluateRuleContribution,
  evaluateRuleImpactVector,
  evaluateTechniqueRetentionGate,
  findCandidateShrinkCloneGroups,
  findEffectiveIsomorphicPuzzleGroups,
  findIsomorphicPuzzleGroups,
  findProofTraceCloneGroups,
  findRuleImpactCloneGroups,
  proofTraceFingerprint,
} from './qualityGates.js'
import { runAuthoringCli } from './runner.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const contentRoot = resolve(repositoryRoot, 'content/cases')
const shippedCasePaths = readdirSync(contentRoot)
  .filter((fileName) => /^case-\d+\.json$/.test(fileName))
  .sort()
  .map((fileName) => resolve(contentRoot, fileName))
const trivialCasePath = resolve(
  repositoryRoot,
  'content/experimental/phase-19/gate-fixtures/opening-trivial-case.json',
)
const canonicalCleaningCasePath = resolve(contentRoot, 'case-004.json')
const replacementCleaningCasePath = resolve(contentRoot, 'case-006.json')
const intersectionCasePath = resolve(contentRoot, 'case-011.json')
const differenceCasePath = resolve(contentRoot, 'case-012.json')
const paddedCleaningClonePath = resolve(
  repositoryRoot,
  'content/experimental/phase-20/padded-case004-right-edge.json',
)

describe('quality gate contracts', () => {
  it('rejects opening states with a unique guest layout', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'opening-ambiguity',
      status: 'fail',
      expected: 2,
      actual: 1,
    }))
  })

  it('rejects cases with zero proof waves', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'proof-wave',
      status: 'fail',
      expected: 1,
      actual: 0,
    }))
  })

  it('rejects cases with zero deductions', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'deduction-count',
      status: 'fail',
      expected: 1,
      actual: 0,
    }))
  })

  it('rejects non-onboarding cases that close at the opening state', () => {
    const report = evaluateCase(trivialCasePath, 'normal')

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'fail',
      expected: 2,
      actual: 1,
    }))
  })

  it('still rejects onboarding cases when opening ambiguity collapses to one layout', () => {
    const report = evaluateCase(trivialCasePath, 'onboarding')

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'fail',
      message: 'Onboarding cases still need at least two opening candidate layouts.',
    }))
  })

  it('passes the retained intersection case through the initial gate set', () => {
    const report = evaluateCase(intersectionCasePath)

    expect(report).toMatchObject({
      puzzleId: 'case-011',
      profile: 'normal',
      status: 'pass',
    })
    expect(report.results.every((result) => result.status === 'pass')).toBe(true)
  })

  it('allows opening-closure fixtures only as warnings for internal evidence', () => {
    const report = evaluateCase(trivialCasePath, 'internal-fixture')

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'warning',
    }))
  })
})

describe('degeneracy gates', () => {
  it('fails singleton region scopes that behave like direct reveals', () => {
    const report = evaluateDegeneracyGates(singletonRegionCase())

    expect(report).toMatchObject({
      puzzleId: 'degenerate-region-singleton',
      status: 'fail',
    })
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'ZR1',
      scopeKind: 'region',
      status: 'fail',
      reasons: expect.arrayContaining(['singleton-effective-scope', 'direct-count-giveaway']),
      unknownCellCount: 1,
      requiredTargetCount: 1,
    }))
  })

  it('fails blocker sightlines with one effective unknown guest cell', () => {
    const report = evaluateDegeneracyGates(singletonSightlineCase())

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'LR1',
      scopeKind: 'line',
      status: 'fail',
      reasons: expect.arrayContaining(['singleton-effective-scope', 'direct-count-giveaway']),
      scopeCellCount: 1,
      unknownCellCount: 1,
    }))
  })

  it('warns when a line count is only one cell away from a direct guest giveaway', () => {
    const report = evaluateDegeneracyGates(nearGiveawayLineCase())

    expect(report.status).toBe('warning')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'LR1',
      status: 'warning',
      reasons: ['near-count-giveaway'],
      unknownCellCount: 3,
      requiredTargetCount: 2,
    }))
  })

  it('passes dense region scopes with enough effective ambiguity', () => {
    const report = evaluateDegeneracyGates(healthyRegionCase())

    expect(report.status).toBe('pass')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'ZR1',
      status: 'pass',
      unknownCellCount: 4,
      requiredTargetCount: 2,
    }))
  })

  it('fails singleton scope-overlap counts that behave like direct reveals', () => {
    const report = evaluateDegeneracyGates(singletonScopeOverlapCase())

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'OR1',
      ruleType: 'scopeOverlapCount',
      scopeKind: 'scope-overlap',
      status: 'fail',
      reasons: expect.arrayContaining(['singleton-effective-scope', 'direct-count-giveaway']),
      unknownCellCount: 1,
      requiredTargetCount: 1,
    }))
  })

  it('fails conditional consequences that directly give away guest cells', () => {
    const report = evaluateDegeneracyGates(conditionalThenGiveawayCase())

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CR1',
      ruleType: 'conditionalCount',
      scopeKind: 'conditional-condition',
      status: 'pass',
      unknownCellCount: 4,
    }))
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CR1',
      ruleType: 'conditionalCount',
      scopeKind: 'conditional-then',
      status: 'fail',
      reasons: expect.arrayContaining(['singleton-effective-scope', 'direct-count-giveaway']),
      unknownCellCount: 1,
      requiredTargetCount: 1,
    }))
  })

  it('allows fixed public conditional conditions while still checking the consequence', () => {
    const report = evaluateDegeneracyGates(fixedConditionalConditionCase())

    expect(report.status).toBe('pass')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CR1',
      ruleType: 'conditionalCount',
      scopeKind: 'conditional-condition',
      status: 'pass',
      reasons: [],
      unknownCellCount: 0,
    }))
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CR1',
      ruleType: 'conditionalCount',
      scopeKind: 'conditional-then',
      status: 'pass',
      unknownCellCount: 2,
    }))
  })

  it('fails comparative counts that compare the same scope with no offset', () => {
    const report = evaluateDegeneracyGates(trivialComparativeCase())

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CP1',
      ruleType: 'comparativeCount',
      scopeKind: 'comparative-left',
      status: 'pass',
      unknownCellCount: 4,
    }))
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CP1',
      ruleType: 'comparativeCount',
      scopeKind: 'comparative-right',
      status: 'pass',
      unknownCellCount: 4,
    }))
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CP1',
      ruleType: 'comparativeCount',
      scopeKind: 'comparative',
      status: 'fail',
      reasons: ['trivial-same-scope-comparison'],
    }))
  })

  it('allows a fixed public comparative side as a readable comparison anchor', () => {
    const report = evaluateDegeneracyGates(fixedComparativeSideCase())

    expect(report.status).toBe('pass')
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CP1',
      ruleType: 'comparativeCount',
      scopeKind: 'comparative-left',
      status: 'pass',
      unknownCellCount: 2,
    }))
    expect(report.results).toContainEqual(expect.objectContaining({
      ruleId: 'CP1',
      ruleType: 'comparativeCount',
      scopeKind: 'comparative-right',
      status: 'pass',
      reasons: [],
      unknownCellCount: 0,
    }))
  })
})

describe('rule contribution gate', () => {
  it('reports useful rules when removing them changes candidate layouts or proof outcomes', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleContribution(puzzle, {
      requiredTechniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
    })

    expect(report.puzzleId).toBe('case-011')
    expect(report.results.some((result) => result.status === 'contributes')).toBe(true)
    expect(report.results.find((result) => result.ruleId === 'R1')).toMatchObject({
      status: 'contributes',
    })
  })

  it('reports redundant duplicate rules in report-only mode', () => {
    const puzzle = loadCase(intersectionCasePath)
    const duplicatedRule = {
      ...puzzle.rules[0],
      id: 'R1_DUPLICATE',
    }
    const report = evaluateRuleContribution({
      ...puzzle,
      rules: [duplicatedRule, ...puzzle.rules],
    })
    expect(report.status).toBe('warning')
    expect(report.results.find((result) => result.ruleId === 'R1_DUPLICATE')).toMatchObject({
      status: 'redundant',
      reasons: ['no-material-change'],
    })
  })

  it('reports decorative non-guest rules that do not affect guest reasoning', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleContribution({
      ...puzzle,
      rules: [
        ...puzzle.rules,
        {
          id: 'DECORATIVE_BIN_COUNT',
          type: 'globalCount',
          target: 'bin',
          count: {
            op: 'eq',
            value: 4,
          },
          presentation: {
            title: 'Decorative bin count',
            flavor: 'A maintainer-facing fixture rule that should not affect guest reasoning.',
          },
        },
      ],
    })

    expect(report.status).toBe('warning')
    expect(report.results.find((result) => result.ruleId === 'DECORATIVE_BIN_COUNT')).toMatchObject({
      status: 'redundant',
      reasons: ['no-material-change'],
    })
  })
})

describe('rule impact vector', () => {
  it('reports redundant decorative rules with zero impact deltas', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleImpactVector({
      ...puzzle,
      rules: [
        ...puzzle.rules,
        {
          id: 'DECORATIVE_BIN_COUNT',
          type: 'globalCount',
          target: 'bin',
          count: {
            op: 'eq',
            value: 4,
          },
          presentation: {
            title: 'Decorative bin count',
            flavor: 'A maintainer-facing fixture rule that should not affect guest reasoning.',
          },
        },
      ],
    })
    const decorativeImpact = report.entries.find((entry) => entry.ruleId === 'DECORATIVE_BIN_COUNT')

    expect(report.status).toBe('warning')
    expect(decorativeImpact).toMatchObject({
      status: 'redundant',
      openingGuestLayoutDelta: 0,
      proofWaveDelta: 0,
      proofDeductionDelta: 0,
      lostTechniqueIds: [],
      gainedTechniqueIds: [],
    })
  })

  it('groups identical rule-impact vectors as reviewer-blocking clone evidence', () => {
    const groups = findRuleImpactCloneGroups([
      loadCase(canonicalCleaningCasePath),
      loadCase(paddedCleaningClonePath),
    ])

    expect(groups).toContainEqual(expect.objectContaining({
      status: 'reviewer-blocking',
      puzzleIds: ['case-004', 'phase-20-padded-case004-right-edge'],
    }))
  }, 45_000)
})

describe('rule family diversity gate', () => {
  it('fails cases carried by a single material rule family', () => {
    const report = evaluateRuleFamilyDiversityGate(singleFamilyCase())

    expect(report).toMatchObject({
      puzzleId: 'single-family-gate-fixture',
      status: 'fail',
      materialFamilyCount: 1,
      materialFamilies: ['global'],
      reasons: expect.arrayContaining(['single-material-family']),
    })
  })

  it('passes cases with two material rule families and no redundant rules', () => {
    const report = evaluateRuleFamilyDiversityGate(mixedFamilyCase())

    expect(report).toMatchObject({
      puzzleId: 'mixed-family-gate-fixture',
      status: 'pass',
      materialFamilyCount: 2,
      materialFamilies: ['global', 'region'],
      redundantRuleIds: [],
    })
  })

  it('reports redundant rules even when another hard family gate fails', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleFamilyDiversityGate({
      ...puzzle,
      rules: [
        ...puzzle.rules,
        {
          id: 'DECORATIVE_BIN_COUNT',
          type: 'globalCount',
          target: 'bin',
          count: {
            op: 'eq',
            value: 4,
          },
          presentation: {
            title: 'Decorative bin count',
            flavor: 'A maintainer-facing fixture rule that should not affect guest reasoning.',
          },
        },
      ],
    })

    expect(report.status).toBe('fail')
    expect(report.redundantRuleIds).toEqual(['DECORATIVE_BIN_COUNT'])
    expect(report.reasons).toContain('redundant-rules')
  })
})

describe('non-isomorphism gate', () => {
  it('assigns equivalent canonical signatures to exact structural duplicates', () => {
    const source = loadCase(canonicalCleaningCasePath)
    const canonical = canonicalPuzzleIsomorphismSignature(source)
    const duplicate = canonicalPuzzleIsomorphismSignature({
      ...source,
      id: 'case-004-copy',
      title: 'copy',
      caseName: 'copy',
      metadata: {
        ...source.metadata,
        notes: 'fixture copy',
      },
    })

    expect(duplicate.canonicalSignature).toBe(canonical.canonicalSignature)
  })

  it('does not group promoted replacement cases with the retained cleaning case', () => {
    const puzzles = [
      loadCase(canonicalCleaningCasePath),
      loadCase(replacementCleaningCasePath),
      loadCase(intersectionCasePath),
    ]
    const groups = findIsomorphicPuzzleGroups(puzzles)

    expect(groups).toEqual([])
  })

  it('finds no duplicate classes when scanning all shipped ladder cases', () => {
    const groups = findIsomorphicPuzzleGroups(shippedCasePaths.map(loadCase))

    expect(groups).toEqual([])
  })

  it('groups padded clones after reducing to the effective board', () => {
    const groups = findEffectiveIsomorphicPuzzleGroups([
      loadCase(canonicalCleaningCasePath),
      loadCase(paddedCleaningClonePath),
      loadCase(differenceCasePath),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].puzzleIds).toEqual([
      'case-004',
      'phase-20-padded-case004-right-edge',
    ])
    expect(
      groups[0].members.find((member) => member.puzzleId === 'phase-20-padded-case004-right-edge')
        ?.reduction.irrelevantCells,
    ).toEqual(['E1', 'E2', 'E3', 'E4'])
  })
})

describe('technique retention gate', () => {
  it('passes when an intersection case retains its required technique after minimization', () => {
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-011',
      retention: requireTechniqueRetention(runAuthoringCli([
        'minimize',
        intersectionCasePath,
        '--require-technique',
        'LOCAL_SCOPE_INTERSECTION',
      ])),
    })

    expect(gate).toMatchObject({
      puzzleId: 'case-011',
      status: 'pass',
      requiredTechniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
      missingRequiredTechniqueIds: [],
    })
  })

  it('passes mixed retention when a difference case keeps all required techniques', () => {
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-012',
      retention: requireTechniqueRetention(runAuthoringCli([
        'minimize',
        differenceCasePath,
        '--require-technique',
        'LOCAL_COUNT_SATURATED',
        '--require-technique',
        'LOCAL_SCOPE_DIFFERENCE',
      ])),
    })

    expect(gate).toMatchObject({
      puzzleId: 'case-012',
      status: 'pass',
      requiredTechniqueIds: ['LOCAL_COUNT_SATURATED', 'LOCAL_SCOPE_DIFFERENCE'],
      missingRequiredTechniqueIds: [],
    })
  })

  it('fails when minimization drops a required mixed-case technique', () => {
    const report = runAuthoringCli([
      'minimize',
      canonicalCleaningCasePath,
      '--require-technique',
      'LOCAL_COUNT_SATURATED',
      '--require-technique',
      'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
    ])
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-004',
      retention: requireTechniqueRetention(report),
    })

    expect(report.ok).toBe(false)
    expect(gate).toMatchObject({
      puzzleId: 'case-004',
      status: 'fail',
      requiredTechniqueIds: ['LOCAL_COUNT_SATURATED', 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION'],
      missingRequiredTechniqueIds: ['UNIQUE_TARGET_NEIGHBOR_INTERSECTION'],
    })
  }, 60_000)
})

describe('proof trace fingerprint', () => {
  it('records the public proof technique sequence and normalized target kinds', () => {
    const fingerprint = proofTraceFingerprint(loadCase(canonicalCleaningCasePath))

    expect(fingerprint.puzzleId).toBe('case-004')
    expect(fingerprint.techniqueSequence).toContain('LOCAL_COUNT_SATURATED')
    expect(fingerprint.techniqueSequence).toContain('UNIQUE_TARGET_NEIGHBOR_INTERSECTION')
    expect(fingerprint.steps.some((step) => step.targetKindRole === 'object')).toBe(true)
    expect(fingerprint.steps.every((step) => step.cellId.length > 0)).toBe(true)
  })

  it('matches a padded board clone after effective-coordinate normalization', () => {
    const canonical = proofTraceFingerprint(loadCase(canonicalCleaningCasePath))
    const padded = proofTraceFingerprint(loadCase(paddedCleaningClonePath))

    expect(padded.canonicalSignature).toBe(canonical.canonicalSignature)
    expect(padded.canonicalKindAgnosticSignature).toBe(canonical.canonicalKindAgnosticSignature)
  })

  it('hard-fails exact proof-trace clones', () => {
    const groups = findProofTraceCloneGroups([
      loadCase(canonicalCleaningCasePath),
      loadCase(paddedCleaningClonePath),
      loadCase(differenceCasePath),
    ])

    expect(groups).toContainEqual(expect.objectContaining({
      matchKind: 'exact',
      status: 'hard-fail',
      puzzleIds: ['case-004', 'phase-20-padded-case004-right-edge'],
    }))
  })

  it('blocks object-label-swapped trace clones for reviewer evidence', () => {
    const source = loadCase(canonicalCleaningCasePath)
    const swapped = renamePuzzleKinds(source, {
      bottle: 'mirror',
      mirror: 'bottle',
    }, 'case-004-label-swap')
    const groups = findProofTraceCloneGroups([source, swapped, loadCase(differenceCasePath)])

    expect(groups).toContainEqual(expect.objectContaining({
      matchKind: 'kind-agnostic',
      status: 'reviewer-blocking',
      puzzleIds: ['case-004', 'case-004-label-swap'],
    }))
  })
})

describe('candidate shrink signature', () => {
  it('records opening, wave, and final guest-layout counts', () => {
    const signature = candidateShrinkSignature(loadCase(canonicalCleaningCasePath))

    expect(signature.puzzleId).toBe('case-004')
    expect(signature.checkpoints.map((checkpoint) => checkpoint.label)).toEqual([
      'opening',
      'wave',
      'final',
    ])
    expect(signature.checkpoints[0]).toMatchObject({
      guestLayoutCount: 15,
      unique: false,
    })
    expect(signature.checkpoints[signature.checkpoints.length - 1]).toMatchObject({
      guestLayoutCount: 1,
      unique: true,
    })
    expect(signature.techniqueSequence).toContain('LOCAL_COUNT_SATURATED')
  })

  it('blocks identical shrink curves plus technique order for review', () => {
    const groups = findCandidateShrinkCloneGroups([
      loadCase(canonicalCleaningCasePath),
      loadCase(paddedCleaningClonePath),
      loadCase(differenceCasePath),
    ])

    expect(groups).toContainEqual(expect.objectContaining({
      status: 'reviewer-blocking',
      puzzleIds: ['case-004', 'phase-20-padded-case004-right-edge'],
    }))
  })
})

function evaluateCase(
  casePath: string,
  profile: Parameters<typeof evaluateCoreQualityGates>[0]['profile'] = 'normal',
): ReturnType<typeof evaluateCoreQualityGates> {
  const report = runAuthoringCli(['report', casePath])
  const score = runAuthoringCli(['score', casePath])
  const validation = requireValidation(report)

  expect(report.ok).toBe(true)
  expect(score.ok).toBe(true)

  return evaluateCoreQualityGates({
    validation,
    ...(score.score === undefined ? {} : { score: score.score }),
    profile,
  })
}

function singletonRegionCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'degenerate-region-singleton',
    title: 'Degenerate region singleton',
    board: { width: 2, height: 1 },
    allowedKinds: ['empty', 'guest'],
    regions: [{ id: 'east-room', title: '东侧房间', cells: ['A1', 'B1'] }],
    rules: [{
      id: 'ZR1',
      type: 'regionCount',
      regionId: 'east-room',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: '东侧房间' },
    }],
    initialReveals: ['A1'],
    target: { A1: 'empty', B1: 'guest' },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function singletonSightlineCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'degenerate-sightline-singleton',
    title: 'Degenerate sightline singleton',
    board: { width: 3, height: 1 },
    allowedKinds: ['empty', 'mirror', 'guest'],
    rules: [{
      id: 'LR1',
      type: 'lineCount',
      origin: 'A1',
      scope: { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: '向右视线' },
    }],
    initialReveals: ['C1'],
    target: { A1: 'empty', B1: 'guest', C1: 'mirror' },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function nearGiveawayLineCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'near-line-giveaway',
    title: 'Near line giveaway',
    board: { width: 3, height: 1 },
    allowedKinds: ['empty', 'guest'],
    rules: [{
      id: 'LR1',
      type: 'lineCount',
      scope: { kind: 'row', index: 0 },
      target: 'guest',
      count: { op: 'eq', value: 2 },
      presentation: { title: '第一行账目' },
    }],
    initialReveals: [],
    target: { A1: 'guest', B1: 'guest', C1: 'empty' },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function healthyRegionCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'healthy-region-scope',
    title: 'Healthy region scope',
    board: { width: 4, height: 2 },
    allowedKinds: ['empty', 'guest'],
    regions: [{ id: 'middle-band', title: '中带区域', cells: ['A2', 'B2', 'C2', 'D2'] }],
    rules: [{
      id: 'ZR1',
      type: 'regionCount',
      regionId: 'middle-band',
      target: 'guest',
      count: { op: 'eq', value: 2 },
      presentation: { title: '中带区域' },
    }],
    initialReveals: ['A1', 'B1'],
    target: {
      A1: 'empty',
      B1: 'empty',
      C1: 'empty',
      D1: 'empty',
      A2: 'guest',
      B2: 'empty',
      C2: 'guest',
      D2: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function singletonScopeOverlapCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'degenerate-scope-overlap-singleton',
    title: 'Degenerate scope overlap singleton',
    board: { width: 3, height: 2 },
    allowedKinds: ['empty', 'guest'],
    regions: [
      { id: 'left-block', title: 'Left block', cells: ['A1', 'B1', 'A2', 'B2'] },
      { id: 'right-block', title: 'Right block', cells: ['B1', 'C1', 'B2', 'C2'] },
    ],
    rules: [{
      id: 'OR1',
      type: 'scopeOverlapCount',
      left: { kind: 'region', regionId: 'left-block' },
      right: { kind: 'region', regionId: 'right-block' },
      mode: 'intersection',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'Overlap has one guest' },
    }],
    initialReveals: ['B1'],
    target: {
      A1: 'empty',
      B1: 'empty',
      C1: 'empty',
      A2: 'empty',
      B2: 'guest',
      C2: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function conditionalThenGiveawayCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'degenerate-conditional-then-singleton',
    title: 'Degenerate conditional consequence singleton',
    board: { width: 4, height: 2 },
    allowedKinds: ['empty', 'guest'],
    regions: [
      { id: 'condition-band', title: 'Condition band', cells: ['A1', 'B1', 'C1', 'D1'] },
      { id: 'then-cell', title: 'Then cell', cells: ['A2', 'B2'] },
    ],
    rules: [{
      id: 'CR1',
      type: 'conditionalCount',
      condition: {
        scope: { kind: 'region', regionId: 'condition-band' },
        target: 'guest',
        count: { op: 'eq', value: 2 },
      },
      then: {
        scope: { kind: 'region', regionId: 'then-cell' },
        target: 'guest',
        count: { op: 'eq', value: 1 },
      },
      presentation: { title: 'Conditional then giveaway' },
    }],
    initialReveals: ['B2'],
    target: {
      A1: 'guest',
      B1: 'empty',
      C1: 'guest',
      D1: 'empty',
      A2: 'guest',
      B2: 'empty',
      C2: 'empty',
      D2: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function fixedConditionalConditionCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'fixed-conditional-condition',
    title: 'Fixed conditional condition',
    board: { width: 4, height: 2 },
    allowedKinds: ['empty', 'guest'],
    regions: [
      { id: 'condition-band', title: 'Condition band', cells: ['A1', 'B1'] },
      { id: 'then-band', title: 'Then band', cells: ['A2', 'B2'] },
    ],
    rules: [{
      id: 'CR1',
      type: 'conditionalCount',
      condition: {
        scope: { kind: 'region', regionId: 'condition-band' },
        target: 'guest',
        count: { op: 'eq', value: 1 },
      },
      then: {
        scope: { kind: 'region', regionId: 'then-band' },
        target: 'guest',
        count: { op: 'eq', value: 0 },
      },
      presentation: { title: 'Fixed condition fixture' },
    }],
    initialReveals: ['A1', 'B1'],
    target: {
      A1: 'guest',
      B1: 'empty',
      C1: 'empty',
      D1: 'empty',
      A2: 'empty',
      B2: 'empty',
      C2: 'empty',
      D2: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function trivialComparativeCase(): PuzzleDefinition {
  const repeatedScope: CountScopeRef = { kind: 'region', regionId: 'shared-band' }

  return {
    schemaVersion: 1,
    id: 'degenerate-comparative-same-scope',
    title: 'Degenerate comparative same scope',
    board: { width: 4, height: 1 },
    allowedKinds: ['empty', 'guest'],
    regions: [{ id: 'shared-band', title: 'Shared band', cells: ['A1', 'B1', 'C1', 'D1'] }],
    rules: [{
      id: 'CP1',
      type: 'comparativeCount',
      left: repeatedScope,
      right: repeatedScope,
      target: 'guest',
      comparison: { op: 'eq', offset: 0 },
      presentation: { title: 'Same scope comparison' },
    }],
    initialReveals: [],
    target: {
      A1: 'guest',
      B1: 'empty',
      C1: 'guest',
      D1: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function fixedComparativeSideCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'fixed-comparative-side',
    title: 'Fixed comparative side',
    board: { width: 4, height: 1 },
    allowedKinds: ['empty', 'guest'],
    regions: [
      { id: 'left-band', title: 'Left band', cells: ['A1', 'B1'] },
      { id: 'right-band', title: 'Right band', cells: ['C1', 'D1'] },
    ],
    rules: [{
      id: 'CP1',
      type: 'comparativeCount',
      left: { kind: 'region', regionId: 'left-band' },
      right: { kind: 'region', regionId: 'right-band' },
      target: 'guest',
      comparison: { op: 'eq' },
      presentation: { title: 'Fixed side comparison' },
    }],
    initialReveals: ['C1', 'D1'],
    target: {
      A1: 'guest',
      B1: 'empty',
      C1: 'guest',
      D1: 'empty',
    },
    metadata: { difficulty: 4, tags: ['degeneracy-fixture'], status: 'draft' },
  }
}

function singleFamilyCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'single-family-gate-fixture',
    title: 'Single family gate fixture',
    board: { width: 3, height: 1 },
    allowedKinds: ['empty', 'guest'],
    rules: [{
      id: 'G1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'One guest' },
    }],
    initialReveals: ['A1', 'C1'],
    target: { A1: 'empty', B1: 'guest', C1: 'empty' },
    metadata: { difficulty: 4, tags: ['family-fixture'], status: 'draft' },
  }
}

function mixedFamilyCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'mixed-family-gate-fixture',
    title: 'Mixed family gate fixture',
    board: { width: 2, height: 2 },
    allowedKinds: ['empty', 'guest'],
    regions: [{ id: 'top-row', title: 'Top row', cells: ['A1', 'B1'] }],
    rules: [
      {
        id: 'G1',
        type: 'globalCount',
        target: 'guest',
        count: { op: 'eq', value: 2 },
        presentation: { title: 'Two guests' },
      },
      {
        id: 'R1',
        type: 'regionCount',
        regionId: 'top-row',
        target: 'guest',
        count: { op: 'eq', value: 1 },
        presentation: { title: 'Top row has one guest' },
      },
    ],
    initialReveals: [],
    target: {
      A1: 'guest',
      B1: 'empty',
      A2: 'guest',
      B2: 'empty',
    },
    metadata: { difficulty: 4, tags: ['family-fixture'], status: 'draft' },
  }
}

function requireValidation(report: AuthoringCliReport): AuthoringCaseValidationReport {
  if (report.validation === undefined) {
    throw new Error('Expected authoring report validation output.')
  }

  return report.validation
}

function requireTechniqueRetention(
  report: AuthoringCliReport,
): NonNullable<AuthoringCliReport['techniqueRetention']> {
  if (report.techniqueRetention === undefined) {
    throw new Error('Expected technique retention output.')
  }

  return report.techniqueRetention
}

function loadCase(casePath: string): PuzzleDefinition {
  const parsed = parsePuzzleDefinition(JSON.parse(readFileSync(casePath, 'utf8')) as unknown)
  expect(parsed.ok).toBe(true)
  if (parsed.puzzle === undefined) {
    throw new Error(`Expected parsed puzzle for ${casePath}`)
  }

  return parsed.puzzle
}

function renamePuzzleKinds(
  puzzle: PuzzleDefinition,
  replacements: Partial<Record<CellKind, CellKind>>,
  id: string,
): PuzzleDefinition {
  const rename = (kind: CellKind): CellKind => replacements[kind] ?? kind

  return {
    ...puzzle,
    id,
    title: `${puzzle.title} label swap`,
    caseName: `${puzzle.caseName} label swap`,
    rules: puzzle.rules.map((rule) => renameRuleKinds(rule, rename)),
    target: Object.fromEntries(
      Object.entries(puzzle.target).map(([cellId, kind]) => [cellId, rename(kind)]),
    ),
    metadata: {
      ...puzzle.metadata,
      notes: 'In-memory test fixture for proof-trace label-swap detection.',
    },
  }
}

function renameRuleKinds(
  rule: RuleDefinition,
  rename: (kind: CellKind) => CellKind,
): RuleDefinition {
  if (rule.type === 'globalCount') {
    return {
      ...rule,
      target: rename(rule.target),
    }
  }

  if (rule.type === 'regionCount') {
    return {
      ...rule,
      target: rename(rule.target),
    }
  }

  if (rule.type === 'lineCount') {
    return {
      ...rule,
      scope: rule.scope.kind === 'ray'
        ? {
            ...rule.scope,
            stopAtKinds: rule.scope.stopAtKinds?.map(rename),
          }
        : rule.scope,
      target: rename(rule.target),
    }
  }

  if (rule.type === 'anchorCount') {
    return {
      ...rule,
      target: rename(rule.target),
    }
  }

  if (rule.type === 'recordSet') {
    return rule
  }

  if (rule.type === 'scopeOverlapCount') {
    return {
      ...rule,
      left: renameCountScopeKinds(rule.left, rename),
      right: renameCountScopeKinds(rule.right, rename),
      target: rename(rule.target),
    }
  }

  if (rule.type === 'comparativeCount') {
    return {
      ...rule,
      left: renameCountScopeKinds(rule.left, rename),
      right: renameCountScopeKinds(rule.right, rename),
      target: rename(rule.target),
    }
  }

  if (rule.type === 'conditionalCount') {
    return {
      ...rule,
      condition: {
        ...rule.condition,
        scope: renameCountScopeKinds(rule.condition.scope, rename),
        target: rename(rule.condition.target),
      },
      then: {
        ...rule.then,
        scope: renameCountScopeKinds(rule.then.scope, rename),
        target: rename(rule.then.target),
      },
    }
  }

  return {
    ...rule,
    subject: rename(rule.subject),
    target: rename(rule.target),
  }
}

function renameCountScopeKinds(
  scope: CountScopeRef,
  rename: (kind: CellKind) => CellKind,
): CountScopeRef {
  if (scope.kind !== 'line' || scope.scope.kind !== 'ray') return scope

  return {
    ...scope,
    scope: {
      ...scope.scope,
      stopAtKinds: scope.scope.stopAtKinds?.map(rename),
    },
  }
}
