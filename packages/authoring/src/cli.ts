#!/usr/bin/env node
import { runAuthoringCli } from './runner.js'

const report = runAuthoringCli(process.argv.slice(2), {
  cwd: process.env.INIT_CWD ?? process.cwd(),
})
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
process.exitCode = report.status === 'error' ? 2 : 0
