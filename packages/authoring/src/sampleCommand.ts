import {
  createGeneratorSeed,
  generateVerifiedCandidates,
  type GeneratorArtifactPolicy,
  type GeneratorInputContract,
  type GeneratorPuzzleTemplate,
} from '@room-axioms/generator'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import {
  AUTHORING_CLI_VERSION,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
  type SampleCommand,
} from './contracts.js'

export interface AuthoringSampleCommandOptions {
  readonly cwd?: string
}

interface SampleTemplateFile extends Omit<GeneratorInputContract, 'seed'> {
  readonly template?: GeneratorPuzzleTemplate
}

export function sampleCommand(
  command: SampleCommand,
  options: AuthoringSampleCommandOptions = {},
): AuthoringCliReport {
  const resolvedPath = resolveInputPath(command.templatePath, options.cwd ?? process.cwd())
  const baseReport = {
    version: AUTHORING_CLI_VERSION,
    ok: false,
    command: command.name,
    inputPath: command.templatePath,
    resolvedInputPath: resolvedPath,
    ...(command.options.outputPath === undefined ? {} : { outputPath: command.options.outputPath }),
    seed: command.seed,
    templatePath: command.templatePath,
    status: 'sampled',
  } as const satisfies Omit<AuthoringCliReport, 'diagnostics' | 'sample'>

  const loaded = readTemplate(resolvedPath)
  if (!loaded.ok) {
    return {
      ...baseReport,
      diagnostics: [loaded.diagnostic],
    }
  }

  const parsed = templateInput(loaded.value, command.seed)
  if (!parsed.ok) {
    return {
      ...baseReport,
      diagnostics: [parsed.diagnostic],
    }
  }

  const sample = generateVerifiedCandidates(parsed.input, loaded.value.template ?? {})
  const ok = sample.accepted.length > 0 && !sample.stats.truncated
  return {
    ...baseReport,
    ok,
    diagnostics: [{
      code: ok ? 'SAMPLE_ACCEPTED' : 'SAMPLE_REJECTED',
      severity: ok ? 'info' : 'warning',
      message: ok
        ? `Sample accepted ${sample.accepted.length} candidate(s) from seed ${command.seed}; no files were written.`
        : `No candidate accepted from seed ${command.seed}; inspect rejection reasons.`,
    }],
    sample,
  }
}

type TemplateLoadResult =
  | { readonly ok: true; readonly value: SampleTemplateFile }
  | { readonly ok: false; readonly diagnostic: AuthoringCliDiagnostic }

function readTemplate(resolvedPath: string): TemplateLoadResult {
  let text: string
  try {
    text = readFileSync(resolvedPath, 'utf8')
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'TEMPLATE_READ_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to read ${resolvedPath}.`,
      },
    }
  }

  try {
    return { ok: true, value: JSON.parse(text) as SampleTemplateFile }
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'TEMPLATE_JSON_PARSE_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to parse ${resolvedPath} as JSON.`,
      },
    }
  }
}

type TemplateInputResult =
  | { readonly ok: true; readonly input: GeneratorInputContract }
  | { readonly ok: false; readonly diagnostic: AuthoringCliDiagnostic }

function templateInput(template: SampleTemplateFile, seed: number): TemplateInputResult {
  const artifactPolicy = template.artifactPolicy ?? 'report-only'
  if (!isArtifactPolicy(artifactPolicy)) {
    return templateError(`Unsupported artifactPolicy: ${String(artifactPolicy)}.`)
  }
  if (template.board === undefined || template.allowedKinds === undefined || template.rules === undefined) {
    return templateError('Template must define board, allowedKinds, and rules.')
  }
  if (template.guestCount === undefined || template.initialRevealRange === undefined || template.caps === undefined) {
    return templateError('Template must define guestCount, initialRevealRange, and caps.')
  }

  return {
    ok: true,
    input: {
      seed: createGeneratorSeed(seed),
      board: template.board,
      allowedKinds: template.allowedKinds,
      guestCount: template.guestCount,
      rules: template.rules,
      initialRevealRange: template.initialRevealRange,
      caps: template.caps,
      solver: template.solver,
      artifactPolicy,
    },
  }
}

function templateError(message: string): TemplateInputResult {
  return {
    ok: false,
    diagnostic: {
      code: 'TEMPLATE_INVALID',
      severity: 'error',
      message,
    },
  }
}

function isArtifactPolicy(value: unknown): value is GeneratorArtifactPolicy {
  return (
    value === 'report-only' ||
    value === 'content-experimental' ||
    value === 'candidate-for-planner-promotion'
  )
}

function resolveInputPath(inputPath: string, cwd: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath)
}
