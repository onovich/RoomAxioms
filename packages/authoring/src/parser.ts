import type {
  AuthoringCliCommand,
  AuthoringCliOptions,
  AuthoringCliParseError,
  AuthoringCliParseResult,
  AuthoringCommandName,
} from './contracts.js'
import type { TechniqueId } from '@room-axioms/proof'

const CASE_PATH_COMMANDS = new Set<AuthoringCommandName>([
  'validate',
  'report',
  'score',
  'minimize',
])

export function parseAuthoringArgs(args: readonly string[]): AuthoringCliParseResult {
  const normalizedArgs = args[0] === '--' ? args.slice(1) : args
  const [rawCommand, ...rest] = normalizedArgs
  if (!isCommandName(rawCommand)) {
    return parseError('UNKNOWN_COMMAND', `Unknown authoring command: ${rawCommand ?? '<missing>'}.`, rawCommand)
  }

  if (rawCommand === 'anti-clone') {
    return parseAntiCloneCommand(rest)
  }

  return rawCommand === 'sample'
    ? parseSampleCommand(rest)
    : parseCasePathCommand(rawCommand, rest)
}

function parseCasePathCommand(
  name: Exclude<AuthoringCommandName, 'sample' | 'anti-clone'>,
  args: readonly string[],
): AuthoringCliParseResult {
  const { options, positionals, error } = parseOptions(args)
  if (error !== undefined) return { ok: false, error }
  const casePath = positionals[0]
  if (casePath === undefined) {
    return parseError('MISSING_CASE_PATH', `${name} requires a case JSON path.`)
  }

  return {
    ok: true,
    command: {
      name,
      casePath,
      options,
    },
  }
}

function parseAntiCloneCommand(args: readonly string[]): AuthoringCliParseResult {
  const { options, flags, positionals, error } = parseOptions(args)
  if (error !== undefined) return { ok: false, error }
  if (positionals.length < 2) {
    return parseError('MISSING_CASE_PATH', 'anti-clone requires at least two case JSON paths.')
  }

  const noveltyManifestPath = flags.get('novelty-manifest')
  const includeDegeneracy = flags.has('include-degeneracy')
  return {
    ok: true,
    command: {
      name: 'anti-clone',
      casePaths: positionals,
      ...(noveltyManifestPath === undefined ? {} : { noveltyManifestPath }),
      ...(includeDegeneracy ? { includeDegeneracy } : {}),
      options,
    },
  }
}

function parseSampleCommand(args: readonly string[]): AuthoringCliParseResult {
  const { options, flags, positionals, error } = parseOptions(args)
  if (error !== undefined) return { ok: false, error }
  if (positionals.length > 0) {
    return parseError('UNKNOWN_FLAG', `sample does not accept positional arguments: ${positionals.join(', ')}.`)
  }

  const rawSeed = flags.get('seed')
  if (rawSeed === undefined) {
    return parseError('MISSING_SEED', 'sample requires --seed <integer>.')
  }
  const seed = Number(rawSeed)
  if (!Number.isInteger(seed)) {
    return parseError('INVALID_SEED', `sample seed must be an integer: ${rawSeed}.`, rawSeed)
  }

  const templatePath = flags.get('template')
  if (templatePath === undefined) {
    return parseError('MISSING_TEMPLATE', 'sample requires --template <template.json>.')
  }

  return {
    ok: true,
    command: {
      name: 'sample',
      seed,
      templatePath,
      options,
    },
  }
}

interface OptionParseResult {
  readonly options: AuthoringCliOptions
  readonly flags: ReadonlyMap<string, string>
  readonly positionals: readonly string[]
  readonly error?: AuthoringCliParseError
}

function parseOptions(args: readonly string[]): OptionParseResult {
  const flags = new Map<string, string>()
  const positionals: string[] = []
  let outputPath: string | undefined
  const requiredTechniqueIds: TechniqueId[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--json') continue
    if (arg === '--include-degeneracy') {
      flags.set('include-degeneracy', 'true')
      continue
    }
    if (arg === '--output') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) {
        return withOptionError('MISSING_FLAG_VALUE', '--output requires a path.', arg)
      }
      outputPath = value
      index += 1
      continue
    }
    if (arg === '--seed' || arg === '--template' || arg === '--novelty-manifest') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) {
        return withOptionError('MISSING_FLAG_VALUE', `${arg} requires a value.`, arg)
      }
      flags.set(arg.slice(2), value)
      index += 1
      continue
    }
    if (arg === '--require-technique') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) {
        return withOptionError('MISSING_FLAG_VALUE', '--require-technique requires a technique id.', arg)
      }
      if (!isTechniqueId(value)) {
        return withOptionError('INVALID_TECHNIQUE', `Unknown proof technique id: ${value}.`, value)
      }
      requiredTechniqueIds.push(value)
      index += 1
      continue
    }
    if (arg.startsWith('--')) {
      return withOptionError('UNKNOWN_FLAG', `Unknown authoring flag: ${arg}.`, arg)
    }

    positionals.push(arg)
  }

  return {
    options: {
      format: 'json',
      ...(outputPath === undefined ? {} : { outputPath }),
      ...(requiredTechniqueIds.length === 0 ? {} : { requiredTechniqueIds }),
    },
    flags,
    positionals,
  }
}

const TECHNIQUE_IDS = new Set<string>([
  'GLOBAL_COUNT_SATURATED',
  'GLOBAL_COUNT_ALL_REMAINING',
  'REGION_COUNT_SATURATED',
  'REGION_COUNT_ALL_REMAINING',
  'LINE_COUNT_SATURATED',
  'LINE_COUNT_ALL_REMAINING',
  'ANCHOR_COUNT_SATURATED',
  'ANCHOR_COUNT_ALL_REMAINING',
  'LOCAL_COUNT_SATURATED',
  'LOCAL_COUNT_ALL_REMAINING',
  'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
  'LOCAL_SCOPE_INTERSECTION',
  'LOCAL_SCOPE_DIFFERENCE',
  'KNOWN_SAFE_FROM_NON_GUEST_OBJECT',
])

function isTechniqueId(value: string): value is TechniqueId {
  return TECHNIQUE_IDS.has(value)
}

function isCommandName(value: string | undefined): value is AuthoringCommandName {
  return value === 'sample' ||
    value === 'anti-clone' ||
    (value !== undefined && CASE_PATH_COMMANDS.has(value as AuthoringCommandName))
}

function parseError(
  code: AuthoringCliParseError['code'],
  message: string,
  argument?: string,
): AuthoringCliParseResult {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(argument === undefined ? {} : { argument }),
    },
  }
}

function withOptionError(
  code: AuthoringCliParseError['code'],
  message: string,
  argument: string,
): OptionParseResult {
  return {
    options: { format: 'json' },
    flags: new Map(),
    positionals: [],
    error: {
      code,
      message,
      argument,
    },
  }
}

export function commandInputPath(command: AuthoringCliCommand): string | undefined {
  if (command.name === 'anti-clone') return command.casePaths[0]
  return command.name === 'sample' ? command.templatePath : command.casePath
}
