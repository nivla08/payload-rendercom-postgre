# Render Deploy

Render is now one supported deployment target for this starter, not the core architectural assumption.

## Recommended Render service

- Runtime: Node
- Node version: `22.22.0`
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Pre-deploy command: `pnpm migrate && pnpm migrate:app`
- Health check path: `/api/health`
- Blueprint file: `render.yaml` (optional convenience, not required for the starter itself)

## Required Render environment variables

- `NODE_ENV=production`
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL`
- `PAYLOAD_CORS_ORIGIN`

Blueprint notes:

- `render.yaml` now pins `NODE_VERSION=22.22.0`
- `render.yaml` can generate `PAYLOAD_SECRET` automatically for new services
- set `DATABASE_URL`, `PAYLOAD_PUBLIC_SERVER_URL`, and `PAYLOAD_CORS_ORIGIN` in Render for the actual environment

Recommended values:

- `PAYLOAD_PUBLIC_SERVER_URL=https://<your-service>.onrender.com`
- `PAYLOAD_CORS_ORIGIN=https://<your-service>.onrender.com`

## PostgreSQL

Use a Render PostgreSQL instance and set its internal connection string as `DATABASE_URL`.

## Media storage

This starter supports local disk uploads for development and small internal deployments, but Render web services do not provide durable local disk storage across deploys or instance replacement.

For production media, prefer external object storage and treat `PAYLOAD_STORAGE_PROVIDER=local` as a development default.

## Notes

- Render should run migrations before the new release receives traffic.
- If you scale to multiple instances, keep media out of local disk storage.
- Keep `PAYLOAD_SECRET` stable across deploys.
- Deployment should apply committed migrations only. Do not rely on interactive migration prompts during deploy.
