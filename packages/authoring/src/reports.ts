import {
  AUTHORING_CLI_VERSION,
  type AuthoringCliCommand,
  type AuthoringCliParseError,
  type AuthoringCliReport,
} from './contracts.js'
import { commandInputPath } from './parser.js'

export function parsedCommandReport(command: AuthoringCliCommand): AuthoringCliReport {
  return {
    version: AUTHORING_CLI_VERSION,
    ok: false,
    command: command.name,
    inputPath: commandInputPath(command),
    ...(command.options.outputPath === undefined ? {} : { outputPath: command.options.outputPath }),
    ...(command.name === 'sample'
      ? {
          seed: command.seed,
          templatePath: command.templatePath,
        }
      : {}),
    status: 'not-implemented',
    diagnostics: [
      {
        code: 'COMMAND_NOT_IMPLEMENTED',
        severity: 'warning',
        message: `${command.name} parsed successfully; execution is implemented in later Phase 10 rounds.`,
      },
    ],
  }
}

export function parseErrorReport(error: AuthoringCliParseError): AuthoringCliReport {
  return {
    version: AUTHORING_CLI_VERSION,
    ok: false,
    status: 'error',
    diagnostics: [
      {
        code: error.code,
        severity: 'error',
        message: error.message,
      },
    ],
  }
}
