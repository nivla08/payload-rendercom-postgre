import { AuditLogs } from './AuditLogs'
import { Media } from './Media'
import { MigrationRuns } from './MigrationRuns'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { SharedBlocks } from './SharedBlocks'
import { Users } from './Users'

export const collections = [Users, AuditLogs, MigrationRuns, Media, SharedBlocks, Pages, Posts]

export { AuditLogs, Media, MigrationRuns, Pages, Posts, SharedBlocks, Users }
