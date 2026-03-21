import 'dotenv/config'

import net from 'node:net'

const DEFAULT_DOCKER_DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/payload_starter'
const DEFAULT_PROJECT_DB_NAME = 'payload_starter'

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const readDatabaseUrl = (): URL => {
  const raw = process.env.DATABASE_URL?.trim() ?? ''

  if (raw.length === 0) {
    fail(
      '[db:check] DATABASE_URL is missing.\nSet it in .env or copy .env.example first.',
    )
  }

  const resolvedRaw = raw

  if (resolvedRaw.includes('<password>')) {
    fail(
      `[db:check] DATABASE_URL still contains a placeholder password.\n` +
        `Update .env with working credentials or use the docker default:\n${DEFAULT_DOCKER_DATABASE_URL}\n` +
        `Then start Postgres with: pnpm db:up`,
    )
  }

  try {
    return new URL(resolvedRaw)
  } catch {
    return fail(`[db:check] DATABASE_URL is invalid:\n${resolvedRaw}`)
  }
}

const checkPort = async (host: string, port: number): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host, port })

    const cleanup = () => {
      socket.removeAllListeners()
      socket.end()
      socket.destroy()
    }

    socket.setTimeout(3000)

    socket.once('connect', () => {
      cleanup()
      resolve()
    })

    socket.once('timeout', () => {
      cleanup()
      reject(new Error(`Timed out connecting to ${host}:${port}`))
    })

    socket.once('error', (error) => {
      cleanup()
      reject(error)
    })
  })
}

const main = async (): Promise<void> => {
  const url = readDatabaseUrl()
  const host = url.hostname || '127.0.0.1'
  const port = url.port ? Number.parseInt(url.port, 10) : 5432
  const username = decodeURIComponent(url.username || '')
  const password = decodeURIComponent(url.password || '')
  const database = url.pathname.replace(/^\//, '')
  const projectDbName = process.env.PROJECT_DB_NAME?.trim() ?? ''

  await checkPort(host, port).catch((error) => {
    fail(
      `[db:check] Cannot reach Postgres at ${host}:${port}.\n` +
        `Start a local database first.\n` +
        `Recommended Docker command: pnpm db:up\n` +
        `Current DATABASE_URL: ${process.env.DATABASE_URL}\n` +
        `Connection error: ${error instanceof Error ? error.message : String(error)}`,
    )
  })

  if (!username || !password || !database) {
    fail(
      `[db:check] DATABASE_URL is missing required connection parts.\n` +
        `Expected format: postgres://USER:PASSWORD@HOST:PORT/DATABASE`,
    )
  }

  if (projectDbName && projectDbName !== database) {
    console.warn(
      `[db:check] PROJECT_DB_NAME (${projectDbName}) does not match the database in DATABASE_URL (${database}).`,
    )
  }

  if (!projectDbName) {
    console.warn(
      '[db:check] PROJECT_DB_NAME is not set. Set it to a repo-specific local DB name so multiple clones do not share one database.',
    )
  } else if (projectDbName === DEFAULT_PROJECT_DB_NAME) {
    console.warn(
      `[db:check] PROJECT_DB_NAME is still the generic default (${DEFAULT_PROJECT_DB_NAME}). Rename it for this repo before long-term use.`,
    )
  }

  console.log(
    JSON.stringify(
      {
        database,
        host,
        projectDbName: projectDbName || null,
        passwordConfigured: Boolean(password),
        port,
        reachable: true,
        username,
      },
      null,
      2,
    ),
  )

  console.log(
    '[db:check] Postgres port is reachable. If migrate still fails, verify DATABASE_URL credentials or align them with docker-compose defaults.',
  )
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
