import type { AuthoringCliReport } from './contracts.js'
import { parseAuthoringArgs } from './parser.js'
import { parsedCommandReport, parseErrorReport } from './reports.js'

export function runAuthoringCli(args: readonly string[]): AuthoringCliReport {
  const parsed = parseAuthoringArgs(args)
  return parsed.ok ? parsedCommandReport(parsed.command) : parseErrorReport(parsed.error)
}
