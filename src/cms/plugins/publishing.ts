import type { Plugin } from 'payload'

/**
 * Extension point for optional publishing workflows such as scheduled publish /
 * unpublish. The starter keeps this disabled by default so projects can opt in
 * without forcing extra operational complexity onto every build.
 */
export const createPublishingPlugins = (): Plugin[] => {
  return []
}
