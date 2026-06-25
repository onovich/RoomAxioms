import { parsePuzzleDefinition } from '@room-axioms/schema'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import {
  AUTHORING_CLI_VERSION,
  type AntiCloneCommand,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
} from './contracts.js'
import { evaluateAntiCloneReport } from './antiCloneReport.js'
import type { NoveltyClaimManifest } from './noveltyClaims.js'

export interface AntiCloneCommandOptions {
  readonly cwd?: string
}

export function antiCloneCommand(
  command: AntiCloneCommand,
  options: AntiCloneCommandOptions = {},
): AuthoringCliReport {
  const cwd = options.cwd ?? process.cwd()
  const diagnostics: AuthoringCliDiagnostic[] = []
  const puzzles = []

  for (const casePath of command.casePaths) {
    const resolvedPath = resolveInputPath(casePath, cwd)
    const loaded = readJson(resolvedPath)
    if (!loaded.ok) {
      diagnostics.push(loaded.diagnostic)
      continue
    }

    const parsed = parsePuzzleDefinition(loaded.value)
    if (!parsed.ok || parsed.puzzle === undefined) {
      diagnostics.push({
        code: 'ANTI_CLONE_CASE_SCHEMA_INVALID',
        severity: 'error',
        message: `${casePath} failed Puzzle Schema validation.`,
      })
      continue
    }

    puzzles.push(parsed.puzzle)
  }

  const noveltyManifest = command.noveltyManifestPath === undefined
    ? undefined
    : loadNoveltyManifest(command.noveltyManifestPath, cwd, diagnostics)

  if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
    return {
      version: AUTHORING_CLI_VERSION,
      ok: false,
      command: command.name,
      inputPath: command.casePaths[0],
      status: 'error',
      diagnostics,
    }
  }

  const antiClone = evaluateAntiCloneReport(puzzles, { noveltyManifest })
  return {
    version: AUTHORING_CLI_VERSION,
    ok: antiClone.status === 'pass',
    command: command.name,
    inputPath: command.casePaths[0],
    status: 'anti-clone-reported',
    diagnostics: [
      {
        code: antiClone.status === 'pass' ? 'ANTI_CLONE_PASS' : 'ANTI_CLONE_BLOCKED',
        severity: antiClone.status === 'pass' ? 'info' : 'warning',
        message: `Anti-clone report status: ${antiClone.status}.`,
      },
    ],
    antiClone,
  }
}

type JsonLoadResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly diagnostic: AuthoringCliDiagnostic }

function readJson(resolvedPath: string): JsonLoadResult {
  let text: string
  try {
    text = readFileSync(resolvedPath, 'utf8')
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'ANTI_CLONE_FILE_READ_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to read ${resolvedPath}.`,
      },
    }
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'ANTI_CLONE_JSON_PARSE_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to parse ${resolvedPath} as JSON.`,
      },
    }
  }
}

function loadNoveltyManifest(
  manifestPath: string,
  cwd: string,
  diagnostics: AuthoringCliDiagnostic[],
): NoveltyClaimManifest | undefined {
  const resolvedPath = resolveInputPath(manifestPath, cwd)
  const loaded = readJson(resolvedPath)
  if (!loaded.ok) {
    diagnostics.push(loaded.diagnostic)
    return undefined
  }

  return loaded.value as NoveltyClaimManifest
}

function resolveInputPath(inputPath: string, cwd: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath)
}
