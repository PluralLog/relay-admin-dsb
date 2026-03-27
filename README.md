# PolyLog Relay Admin Dashboard

Privacy-safe administration panel for PolyLog relay servers.

Runs as a standalone Next.js app configured with an environment variable
pointing at your relay server. The admin token never reaches the browser —
all relay communication happens server-side.

## Architecture

- The admin authenticates to the **dashboard** with a password
- The dashboard authenticates to the **relay server** with `ADMIN_TOKEN`
- The browser never sees the admin token

## Prerequisites

1. A running PolyLog relay server with the admin API enabled:
   - Copy `admin.py` into `polylog_relay/`
   - Add `register_admin_routes(app, db, volumes)` to `create_app()` in `app.py`
   - Set `POLYLOG_ADMIN_TOKEN` environment variable on the relay server

## Quick Start

```bash
# 1. Clone and install
cd polylog-admin-dashboard
npm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with your relay URL and admin token

# 3. Generate a password hash (optional but recommended)
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
# Put the output in ADMIN_PASSWORD_HASH in .env.local, can copy .env.example if needed

# 4. Run
npm run dev     # development
npm run build && npm start   # production
```

## Docker

```bash
# Build
docker build -t polylog-admin .

# Run
docker run -p 3000:3000 \
  -e RELAY_URL=http://polylog-relay:8443 \
  -e ADMIN_TOKEN=your-token-here \
  -e ADMIN_PASSWORD_HASH='$2a$12$...' \
  polylog-admin
```

Or use the provided `docker-compose.yml`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RELAY_URL` | Yes | Internal URL of the relay server |
| `ADMIN_TOKEN` | Yes | Must match `POLYLOG_ADMIN_TOKEN` on the relay |
| `ADMIN_PASSWORD_HASH` | Recommended | Bcrypt hash of the dashboard login password |
| `JWT_SECRET` | Optional | Secret for session JWTs (defaults to `ADMIN_TOKEN`) |

## Privacy Model
For those implementing a dashboard.

The admin dashboard exposes **only metadata the relay server already stores in plaintext**:

**Can see:** User IDs, handles, client types, protocol versions, feature sets,
storage usage, volume names/sizes/versions/timestamps, sharing relationship
statuses and permission flags, aggregate statistics.

**Cannot see:** Encrypted volume payloads, VEK blobs, cryptographic keys,
member names, journal entries, front history, chat messages, poll content,
or any user-generated data.

**Can do:** Delete users (removes encrypted data without exposing it),
expire sessions, run cleanup maintenance.

**Cannot do:** Decrypt anything, impersonate users, forge sharing,
create/modify volumes, view session tokens.
