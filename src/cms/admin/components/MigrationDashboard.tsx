import { getMigrationStatus } from '@/lib/migrations/status'
import { isAdmin } from '@/cms/utilities/users'

type DashboardProps = {
  user?: { id?: number | string; permissions?: string[]; roles?: string[]; status?: string } | null
}

const formatList = (values: string[]): string => (values.length === 0 ? 'None' : values.join(', '))

/**
 * Small read-only admin dashboard component for migration visibility.
 *
 * This is meant for operational awareness only. Running migrations should still
 * happen through CLI commands or deploy hooks.
 */
export const MigrationDashboard = async ({ user }: DashboardProps) => {
  if (!isAdmin(user)) return null

  const status = await getMigrationStatus()

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        border: '1px solid #d8dde8',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        color: '#000000',
      }}
    >
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Migration Status</h3>
      <p style={{ margin: '0.35rem 0' }}>
        <strong>DB migration files:</strong> {status.db.files.length}
      </p>
      <p style={{ margin: '0.35rem 0' }}>
        <strong>DB migration IDs:</strong> {formatList(status.db.files)}
      </p>
      <p style={{ margin: '0.35rem 0' }}>
        <strong>Completed app migrations:</strong> {formatList(status.app.completed)}
      </p>
      <p style={{ margin: '0.35rem 0' }}>
        <strong>Pending app migrations:</strong> {formatList(status.app.pending)}
      </p>
      <p style={{ margin: '0.6rem 0 0', color: '#4a5565', fontSize: '0.9rem' }}>
        Read-only operational view. Run migration commands from CLI or deployment hooks.
      </p>
    </div>
  )
}
