import type { PuzzleDefinition } from '@room-axioms/domain'

import { contentCases } from '../content/cases'
import phase10IntersectionFixture from '../../../../content/experimental/phase-10/phase-10-local-scope-intersection-001.json' with { type: 'json' }
import phase12DifferenceFixture from '../../../../content/experimental/phase-12/phase-12-local-scope-difference-001.json' with { type: 'json' }
import phase22ContaminatedFixture from '../../../../content/experimental/phase-22/fixtures/contaminated-record-cross-check.json' with { type: 'json' }
import phase23RejectedProbeFixture from '../../../../content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json' with { type: 'json' }
import phase24ComparativeFixture from '../../../../content/experimental/phase-24/phase-24-comparative-balance-001.json' with { type: 'json' }
import phase24ConditionalFixture from '../../../../content/experimental/phase-24/phase-24-conditional-frontier-001.json' with { type: 'json' }
import phase25SingletonGiveawayFixture from '../../../../content/experimental/phase-25/phase-25-singleton-region-giveaway.json' with { type: 'json' }
import phase25OneRuleFixture from '../../../../content/experimental/phase-25/phase-25-one-rule-solution.json' with { type: 'json' }
import phase25PaddedOneRuleFixture from '../../../../content/experimental/phase-25/phase-25-one-rule-solution-padded.json' with { type: 'json' }

export type WorkbenchCaseSource = 'shipped' | 'experimental'

export interface WorkbenchCaseImport {
  readonly puzzle: PuzzleDefinition
  readonly source: WorkbenchCaseSource
  readonly sourcePath: string
}

export const shippedWorkbenchCases: readonly WorkbenchCaseImport[] = contentCases.map((puzzle) => ({
  puzzle,
  source: 'shipped',
  sourcePath: `content/cases/${puzzle.id}.json`,
}))

export const experimentalWorkbenchCases: readonly WorkbenchCaseImport[] = [
  experimentalCase(
    phase10IntersectionFixture,
    'content/experimental/phase-10/phase-10-local-scope-intersection-001.json',
  ),
  experimentalCase(
    phase12DifferenceFixture,
    'content/experimental/phase-12/phase-12-local-scope-difference-001.json',
  ),
  experimentalCase(
    phase22ContaminatedFixture,
    'content/experimental/phase-22/fixtures/contaminated-record-cross-check.json',
  ),
  experimentalCase(
    phase23RejectedProbeFixture,
    'content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json',
  ),
  experimentalCase(
    phase24ComparativeFixture,
    'content/experimental/phase-24/phase-24-comparative-balance-001.json',
  ),
  experimentalCase(
    phase24ConditionalFixture,
    'content/experimental/phase-24/phase-24-conditional-frontier-001.json',
  ),
  experimentalCase(
    phase25SingletonGiveawayFixture,
    'content/experimental/phase-25/phase-25-singleton-region-giveaway.json',
  ),
  experimentalCase(
    phase25OneRuleFixture,
    'content/experimental/phase-25/phase-25-one-rule-solution.json',
  ),
  experimentalCase(
    phase25PaddedOneRuleFixture,
    'content/experimental/phase-25/phase-25-one-rule-solution-padded.json',
  ),
]

export const workbenchCaseLibrary: readonly WorkbenchCaseImport[] = [
  ...shippedWorkbenchCases,
  ...experimentalWorkbenchCases,
]

export function getWorkbenchCaseImportById(caseId: string): WorkbenchCaseImport {
  const item = workbenchCaseLibrary.find((candidate) => candidate.puzzle.id === caseId)
  if (item === undefined) throw new Error(`Unknown workbench case id: ${caseId}`)

  return item
}

function experimentalCase(fixture: unknown, sourcePath: string): WorkbenchCaseImport {
  return {
    puzzle: fixture as PuzzleDefinition,
    source: 'experimental',
    sourcePath,
  }
}
