# Storage

This starter defaults to local disk uploads for development and uses Payload's built-in folder support for the media library.

## Local

- `PAYLOAD_STORAGE_PROVIDER=local`
- good for local work and disposable environments
- not durable enough for multi-instance or long-lived Render media storage

## S3-compatible production storage

The starter wires the official Payload S3 adapter at:

- `src/cms/plugins/storage.ts`

When `PAYLOAD_STORAGE_PROVIDER=s3`, configure:

1. `PAYLOAD_STORAGE_S3_BUCKET`
2. `PAYLOAD_STORAGE_S3_REGION`
3. optional endpoint / credential vars for AWS, R2, MinIO, or another S3-compatible provider

## Media usage tracking

Media documents keep a starter-managed `usage` array that records where uploads are currently referenced.

Tracked by default:

- pages
- posts
- shared blocks
- site settings default meta image
