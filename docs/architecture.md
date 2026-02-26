# Architecture

This document explains the design decisions behind EventFlow : why things are structured the way they are, how the layers interact, and how to evolve the project.

---

## Table of Contents

- [Overview](#overview)
- [Directory Layout Philosophy](#directory-layout-philosophy)
- [Routing : App Router vs Pages Router](#routing--app-router-vs-pages-router)
- [State Management : Context and Hooks](#state-management--context-and-hooks)
- [API Layer : Route Handlers](#api-layer--route-handlers)
- [Authentication Flow](#authentication-flow)
- [Middleware : Route Protection](#middleware--route-protection)
- [Data Layer : JSON Files](#data-layer--json-files)
- [Migrating to a Database](#migrating-to-a-database)
- [Input Validation with Zod](#input-validation-with-zod)
- [Rate Limiting](#rate-limiting)
- [Component Library : shadcn/ui](#component-library--shadcnui)

---

## Overview

EventFlow is a monolithic Next.js application. There is no separate backend service : the API routes live inside the same codebase as the React pages. This makes the project self-contained and easy to run, while still enforcing a clear boundary between the server-side API and the client-side UI.

```
Browser
  |
  | HTTP request
  v
Next.js (edge middleware)
  |
  | If request targets a protected route:
  | -> verify JWT from cookie
  | -> redirect to /login if invalid
  |
  v
App Router
  |
  +-- /app/page.js           -> React pages (client-side rendering)
  +-- /app/api/*/route.jsx   -> REST API handlers (server-side only)
```

---

## Directory Layout Philosophy

The `src/` directory is divided by concern, not by feature. This means all contexts live in `src/contexts/`, all hooks in `src/hooks/`, all API routes in `src/app/api/`. This is the standard Next.js App Router layout and makes it straightforward to locate any file.

The alternative (feature-based layout, e.g. `src/events/`, `src/users/`) works well for very large codebases. For a project of this scope, concern-based layout keeps navigation simple.

---

## Routing : App Router vs Pages Router

This project uses the Next.js App Router (introduced in Next.js 13, stable from 14). The App Router uses file-system-based routing inside the `app/` directory, where each folder becomes a route segment and `page.jsx` renders the page at that route.

API routes are defined as `route.jsx` files inside `app/api/`. Each file exports named functions (`GET`, `POST`, `PATCH`, `DELETE`) that correspond to HTTP methods. This is the standard for Next.js route handlers.

---

## State Management : Context and Hooks

React state is managed with the Context API. There is one context per data domain.

| Context | Manages |
|---|---|
| `EventsContext` | Events array, loading state, add/remove event |
| `UsersContext` | Users array, loading state, add/remove/update user |
| `InscriptionsContext` | Registrations array, loading state, add/remove registration |
| `CategoriesContext` | Categories array, loading state |
| `LoginContext` | Authenticated user, login, logout |

Each context fetches its data from the corresponding API route on mount. All mutations (create, delete, update) go through the API and then update the local state on success, keeping the UI in sync with the server.

Custom hooks are thin interfaces over these contexts. There are two types :

1. Pass-through hooks : `useEvents()` simply calls `useContext(EventsContext)`. They exist so components never import context objects directly, making future refactors easier.

2. Derived hooks : `useEvent(id)` and `useEventsFiltered()` consume the context and compute derived data with `useMemo`. They encapsulate logic that would otherwise be duplicated across components.

All contexts are provided at the root of the application in `src/app/providers.jsx`, which is rendered inside the root layout.

---

## API Layer : Route Handlers

Each API route follows the same structure :

1. Validate the request body with a Zod schema (for mutating methods)
2. Check authentication from the JWT cookie (for protected endpoints)
3. Read the relevant JSON file
4. Perform the operation
5. Write the updated data back to the file
6. Return a typed JSON response with the correct HTTP status code

Error responses follow a consistent shape : `{ message: string }`. They never include stack traces, file paths, or internal identifiers.

---

## Authentication Flow

The authentication system uses two building blocks : bcrypt for passwords and JWT for sessions.

### Password verification

When a user submits the login form, the API reads the user record by email, then calls `bcrypt.compare(submittedPassword, storedHash)`. This comparison is timing-safe and cannot be shortcut by string comparison tricks. If the comparison fails, the API returns 401 with a generic message that does not indicate whether the email or the password was wrong.

### Session token

On successful login, the API calls `jwt.sign({ userId, email }, JWT_SECRET, { expiresIn })` to create a signed token, then sets it as a cookie with these flags :

| Flag | Value | Reason |
|---|---|---|
| `HttpOnly` | true | The token is not accessible from JavaScript at all |
| `Secure` | true in production | The cookie is only sent over HTTPS |
| `SameSite` | Strict | The cookie is not sent with cross-site requests |
| `Path` | / | The cookie is sent with every request |
| `MaxAge` | JWT expiry in seconds | The browser deletes the cookie when it expires |

### Logout

The logout endpoint calls `cookies().delete('token')` server-side, which sets the cookie to an empty value with `MaxAge=0`. This forces the browser to discard it immediately.

---

## Middleware : Route Protection

`middleware.js` at the project root runs on every request that matches the configured matcher. It reads the JWT cookie, verifies the signature and expiry using the shared `src/lib/auth.js` utility, and either lets the request proceed or redirects to `/login`.

The middleware protects all routes except the public ones listed in the matcher exclusion pattern. Public routes are : `/login`, `/api/login`, `/api/logout`, `/api/events` (GET), `/api/categories` (GET).

The middleware runs at the edge (before any page or API route handler), which means unauthorized requests are rejected before any application code executes. This is significantly more secure than checking authentication inside each individual route handler.

---

## Data Layer : JSON Files

All data is stored in JSON files inside `src/data/`. Each API route reads and writes its corresponding file using Node.js `fs.promises`. The files are pretty-printed with 4-space indentation, making them human-readable and easy to inspect or edit directly.

This design has clear trade-offs.

Advantages :

- Zero setup : no database server to install or configure
- Fully portable : the entire data layer is just files on disk
- Human-readable : any editor can inspect the current state of the data
- No migration scripts needed for schema changes in development

Limitations :

- Not safe for concurrent writes in production under high load
- Not suitable for multi-instance (clustered) deployments
- No query language : all filtering happens in JavaScript after reading the full file
- File size grows unbounded without manual cleanup

For a personal project, a teaching context, or a low-traffic deployment, these trade-offs are acceptable. For anything else, see the next section.

---

## Migrating to a Database

The data access code is isolated to the API route files. Migrating to a database requires changes in only those files, not in any React component, hook, or context.

The migration process for each route is :

1. Install your database client (e.g. `npm install @prisma/client` for Prisma, or `npm install pg` for PostgreSQL)
2. Define your schema
3. Replace the `fs.readFile` + `JSON.parse` block with a database read query
4. Replace the `fs.writeFile` + `JSON.stringify` block with a database write query
5. Remove the `filePath` constant at the top of the file

No other files need to change. The React components and hooks interact only with the API routes, not with the data layer directly.

### Recommended database options

| Use case | Recommended option |
|---|---|
| Simple hosted deployment | PlanetScale (MySQL), Neon (PostgreSQL) |
| Self-hosted | PostgreSQL with Prisma ORM |
| Serverless with edge runtime | Turso (SQLite), Cloudflare D1 |
| Document-style data | MongoDB Atlas |

---

## Input Validation with Zod

Every API route that accepts a request body (POST, PATCH) validates that body against a Zod schema before doing anything else. If validation fails, the route returns 400 with the Zod error message.

Zod schemas serve as the single source of truth for what a valid request body looks like. They enforce types, required fields, string length limits, and format constraints (e.g. valid email format, date string format). This prevents invalid or malformed data from ever reaching the file system.

---

## Rate Limiting

The login endpoint uses an in-memory rate limiter. It tracks request counts per IP address over a configurable time window. When a client exceeds the maximum number of attempts within the window, the endpoint returns 429 Too Many Requests.

The implementation is in `src/lib/rateLimit.js`. It uses a plain JavaScript `Map` as the store. This is sufficient for single-instance deployments. For multi-instance deployments, replace the `Map` with a Redis-backed store (e.g. using `@upstash/ratelimit`). The function signature and return value remain the same, so no calling code needs to change.

---

## Component Library : shadcn/ui

EventFlow uses shadcn/ui as its component library. Unlike traditional component libraries that are installed as a dependency, shadcn/ui components are copied directly into `src/components/ui/`. This means the component source code is part of the project and can be modified freely.

The underlying primitives come from Radix UI, which provides fully accessible, unstyled base components. Tailwind CSS v4 is used for all styling. The `components.json` file at the project root configures the shadcn/ui CLI for adding new components.
