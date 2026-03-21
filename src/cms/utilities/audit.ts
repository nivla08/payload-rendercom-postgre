import type { PayloadRequest } from 'payload'

type AuditLogWriter = Pick<PayloadRequest['payload'], 'create'>

export const writeAuditLog = async (args: {
  action: 'create' | 'update' | 'delete'
  collection: string
  docId: number | string
  req: PayloadRequest
}): Promise<void> => {
  try {
    const payload = args.req.payload as AuditLogWriter

    await payload.create({
      collection: 'audit-logs',
      data: {
        action: args.action,
        collection: args.collection,
        docId: String(args.docId),
        performedBy: args.req.user?.id,
      },
      depth: 0,
      overrideAccess: true,
      req: args.req,
    })
  } catch (error) {
    console.error('[audit] failed to write audit log', error)
  }
}
