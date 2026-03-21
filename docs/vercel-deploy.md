# Vercel Deploy

## Recommended fit

Vercel works well for this starter when:

- PostgreSQL is hosted externally
- media is stored in S3-compatible object storage
- deployment does not rely on local disk persistence

## Required environment variables

- `NODE_ENV=production`
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL`
- `PAYLOAD_CORS_ORIGIN`

Recommended:

- `PAYLOAD_PREVIEW_SECRET`
- `PAYLOAD_STORAGE_PROVIDER=s3`
- `PAYLOAD_STORAGE_S3_BUCKET`
- related S3-compatible credentials / endpoint vars

Recommended values:

- `PAYLOAD_PUBLIC_SERVER_URL=https://<your-project>.vercel.app`
- `PAYLOAD_CORS_ORIGIN=https://<your-project>.vercel.app`

## Important notes

- Vercel filesystem is ephemeral, so production uploads should not use local storage
- keep migrations non-interactive and committed before deployment
- run migrations in a controlled deployment step or CI job before traffic depends on the new schema
- keep `PAYLOAD_SECRET` stable across deployments

## Database pairing

Good pairings for Vercel:

- Neon
- Supabase
- any managed PostgreSQL service with SSL support
