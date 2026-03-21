# Email

## Transport modes

- Console mode when `PAYLOAD_EMAIL_PROVIDER=console`
- SMTP mode when `PAYLOAD_EMAIL_PROVIDER=smtp` and credentials are configured

## Recommended starter behavior

Leave email in console mode until a project is ready for real SMTP.

Local / not yet configured:

```bash
PAYLOAD_EMAIL_PROVIDER=console
```

Real SMTP:

```bash
PAYLOAD_EMAIL_PROVIDER=smtp
PAYLOAD_SMTP_HOST=smtp.example.com
PAYLOAD_SMTP_PORT=587
PAYLOAD_SMTP_SECURE=false
PAYLOAD_SMTP_USER=your-user
PAYLOAD_SMTP_PASSWORD=your-password
```

## Environment variables

- `PAYLOAD_EMAIL_PROVIDER`
- `PAYLOAD_SMTP_ENABLED`
- `PAYLOAD_SMTP_HOST`
- `PAYLOAD_SMTP_PORT`
- `PAYLOAD_SMTP_SECURE`
- `PAYLOAD_SMTP_USER`
- `PAYLOAD_SMTP_PASSWORD`
- `PAYLOAD_EMAIL_FROM`
- `PAYLOAD_EMAIL_REPLY_TO`

## Structure

- `src/cms/email/adapter.ts`: Payload email adapter
- `src/cms/email/service.ts`: safe wrapper for transactional sends
- `src/cms/email/templates.ts`: simple starter templates for auth flows

## Local testing

Use `PAYLOAD_EMAIL_PROVIDER=console` during local work to log email payloads to the console.
Switch to `smtp` only when credentials are ready, or point SMTP at a local mail-catcher.
