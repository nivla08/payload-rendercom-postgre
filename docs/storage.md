# Storage

This starter defaults to local disk uploads for development.

## Local

- `PAYLOAD_STORAGE_PROVIDER=local`
- good for local work and disposable environments
- not durable enough for multi-instance or long-lived Render media storage

## S3-compatible extension point

The starter includes a storage plugin extension point at:

- `src/cms/plugins/storage.ts`

When `PAYLOAD_STORAGE_PROVIDER=s3`, the starter currently warns instead of silently pretending uploads are durable.

To enable production-safe object storage:

1. install an S3-compatible Payload storage plugin
2. wire it inside `src/cms/plugins/storage.ts`
3. configure the required bucket/credential env vars

This keeps the starter honest: local storage works now, and durable object storage has a clear integration point when a project needs it.
