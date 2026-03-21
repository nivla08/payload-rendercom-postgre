import type { Plugin } from 'payload'
import { createRedirectPlugins } from './redirects'
import { createStoragePlugins } from './storage'

export const plugins: Plugin[] = [...createRedirectPlugins(), ...createStoragePlugins()]
