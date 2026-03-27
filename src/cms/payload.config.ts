import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { env } from '@/config/env'
import { collections } from './collections'
import { createEmailAdapter } from './email/adapter'
import { globals } from './globals'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const srcDir = path.resolve(dirname, '..')

export default buildConfig({
  admin: {
    user: 'users',
    components: {
      views: {
        createFirstUser: {
          Component: './cms/admin/components/CreateFirstUserView#CreateFirstUserView',
          exact: true,
          path: '/create-first-user',
        },
        logout: {
          Component: './cms/admin/components/LogoutView#LogoutView',
        },
      },
    },
    importMap: {
      baseDir: srcDir,
    },
  },
  collections,
  globals,
  cors: env.allowedOrigins,
  csrf: env.allowedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: env.databaseUrl,
    },
  }),
  email: createEmailAdapter(),
  editor: lexicalEditor(),
  endpoints: [],
  graphQL: {
    disable: true,
  },
  plugins,
  secret: env.payloadSecret,
  serverURL: env.publicServerUrl,
  sharp,
  typescript: {
    outputFile: path.resolve(srcDir, 'payload-types.ts'),
  },
})
