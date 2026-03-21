import type { Plugin } from 'payload'
import { createPublishingPlugins } from './publishing'
import { createRedirectPlugins } from './redirects'
import { createStoragePlugins } from './storage'

export const plugins: Plugin[] = [...createRedirectPlugins(), ...createStoragePlugins(), ...createPublishingPlugins()]
