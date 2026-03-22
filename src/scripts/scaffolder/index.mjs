import { spawnSync } from 'node:child_process'
import process from 'node:process'

import { generateBlock, generateField } from '../generators/interactive.mjs'
import { loadScaffolderAdapter, summarizeAdapter } from './adapters/detect.mjs'

const rootDir = process.cwd()

const printUsage = () => {
  process.stdout.write(
    [
      'Usage: node src/scripts/scaffolder/index.mjs <field|block|collection|global|inspect> [--dry-run]',
      '',
      'This is a local developer scaffolder.',
      'It generates TypeScript files and updates indexes/registries using the current distro adapter.',
      '',
    ].join('\n'),
  )
}

const runPlop = (generatorName, adapter, options) => {
  if (options.dryRun) {
    throw new Error(`Dry-run is not supported for plop-backed "${generatorName}" scaffolding in this distro.`)
  }

  const result = spawnSync(
    'pnpm',
    ['exec', 'plop', '--plopfile', adapter.paths.plopfile, generatorName],
    {
      cwd: rootDir,
      stdio: 'inherit',
    },
  )

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

export const runScaffolder = async (argv = process.argv.slice(2)) => {
  const command = argv[0]
  const dryRun = argv.includes('--dry-run')
  const adapter = await loadScaffolderAdapter(rootDir)

  if (!command) {
    printUsage()
    return
  }

  if (command === 'inspect') {
    process.stdout.write(`${JSON.stringify(summarizeAdapter(adapter), null, 2)}\n`)
    return
  }

  if (command === 'field') {
    await generateField({ adapter, cwd: rootDir, dryRun })
    return
  }

  if (command === 'block') {
    await generateBlock({ adapter, cwd: rootDir, dryRun })
    return
  }

  if (command === 'collection' || command === 'global') {
    runPlop(command, adapter, { dryRun })
    return
  }

  printUsage()
  process.exitCode = 1
}

runScaffolder().catch((error) => {
  console.error('[scaffolder] failed', error)
  process.exit(1)
})
