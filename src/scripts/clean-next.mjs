import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const scriptsDir = path.dirname(currentFile)
const projectRoot = path.resolve(scriptsDir, '../..')
const nextDir = path.join(projectRoot, '.next')

fs.rmSync(nextDir, {
  force: true,
  recursive: true,
})

console.log('[clean:next] Removed .next build artifacts.')
