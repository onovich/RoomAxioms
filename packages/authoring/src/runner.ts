import type { AuthoringCliReport } from './contracts.js'
import { minimizeCaseCommand, scoreCaseCommand } from './caseCommands.js'
import { parseAuthoringArgs } from './parser.js'
import { parsedCommandReport, parseErrorReport } from './reports.js'
import { sampleCommand } from './sampleCommand.js'
import { validateCaseCommand } from './validation.js'

export interface RunAuthoringCliOptions {
  readonly cwd?: string
}

export function runAuthoringCli(
  args: readonly string[],
  options: RunAuthoringCliOptions = {},
): AuthoringCliReport {
  const parsed = parseAuthoringArgs(args)
  if (!parsed.ok) return parseErrorReport(parsed.error)
  if (parsed.command.name === 'validate' || parsed.command.name === 'report') {
    return validateCaseCommand(parsed.command, { cwd: options.cwd })
  }
  if (parsed.command.name === 'score') {
    return scoreCaseCommand(parsed.command, { cwd: options.cwd })
  }
  if (parsed.command.name === 'minimize') {
    return minimizeCaseCommand(parsed.command, { cwd: options.cwd })
  }
  if (parsed.command.name === 'sample') {
    return sampleCommand(parsed.command, { cwd: options.cwd })
  }

  return parsedCommandReport(parsed.command)
}
