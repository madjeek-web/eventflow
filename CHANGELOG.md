# Changelog

All notable changes to EventFlow are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-01

### Added

- Full event management platform : listing, detail, creation, deletion
- User authentication with bcrypt password hashing (cost factor 12)
- JWT session tokens stored in HTTP-only, Secure, SameSite=Strict cookies
- Next.js Middleware for server-side route protection before rendering
- Zod validation schemas on all API route request bodies
- Rate limiting on the login endpoint (10 attempts per 15-minute window per IP)
- Password hashing migration script (`scripts/hash-passwords.js`)
- Logout endpoint (`POST /api/logout`) that clears the session cookie server-side
- React Context and custom hook architecture for all data domains
- `useEventsFiltered` hook with memoized category, keyword, and date filters
- `useEvent(id)` hook with memoized single-event lookup
- shadcn/ui component library integration (Button, Card, Badge, Input, Select, Switch, etc.)
- Auto-generated JSDoc API documentation (`npm run docs`)
- GitHub Actions CI workflow (lint and build checks on every push and pull request)
- GitHub Issue templates (bug report, feature request)
- GitHub Pull Request template
- `SECURITY.md` with responsible disclosure process
- `CONTRIBUTING.md` with branching, code style, and commit conventions
- `CODE_OF_CONDUCT.md`
- `docs/architecture.md` with design decisions and database migration guide
- `docs/api.md` with full REST endpoint reference
- `.env.example` documenting all environment variables
- `LICENSE` (MIT)

### Security

- Passwords are hashed with bcrypt before being written to the data store
- Passwords are never returned in any API response
- JWT tokens are server-side only (HTTP-only cookie, inaccessible to JavaScript)
- All protected routes are guarded in middleware before the route handler runs
- API error responses do not expose internal file paths or stack traces
- Login is rate-limited per IP address
