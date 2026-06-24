export const AUTHORING_PACKAGE_NAME = '@room-axioms/authoring' as const

export const AUTHORING_CLI_VERSION = 'phase-10-authoring-v1' as const

export type AuthoringCommandName =
  | 'validate'
  | 'report'
  | 'score'
  | 'minimize'
  | 'sample'

export type AuthoringOutputFormat = 'json'

export interface AuthoringCliOptions {
  readonly format: AuthoringOutputFormat
  readonly outputPath?: string
}

export type AuthoringCliCommand =
  | CasePathCommand
  | SampleCommand

export interface CasePathCommand {
  readonly name: Exclude<AuthoringCommandName, 'sample'>
  readonly casePath: string
  readonly options: AuthoringCliOptions
}

export interface SampleCommand {
  readonly name: 'sample'
  readonly seed: number
  readonly templatePath: string
  readonly options: AuthoringCliOptions
}

export interface AuthoringCliParseError {
  readonly code:
    | 'UNKNOWN_COMMAND'
    | 'MISSING_CASE_PATH'
    | 'MISSING_FLAG_VALUE'
    | 'UNKNOWN_FLAG'
    | 'INVALID_SEED'
    | 'MISSING_SEED'
    | 'MISSING_TEMPLATE'
  readonly message: string
  readonly argument?: string
}

export type AuthoringCliParseResult =
  | { readonly ok: true; readonly command: AuthoringCliCommand }
  | { readonly ok: false; readonly error: AuthoringCliParseError }

export interface AuthoringCliReport {
  readonly version: typeof AUTHORING_CLI_VERSION
  readonly ok: boolean
  readonly command?: AuthoringCommandName
  readonly inputPath?: string
  readonly outputPath?: string
  readonly seed?: number
  readonly templatePath?: string
  readonly status: 'parsed' | 'not-implemented' | 'error'
  readonly diagnostics: readonly AuthoringCliDiagnostic[]
}

export interface AuthoringCliDiagnostic {
  readonly code: string
  readonly severity: 'info' | 'warning' | 'error'
  readonly message: string
}
