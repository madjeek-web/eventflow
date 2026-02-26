# Contributing to EventFlow

Thank you for taking the time to contribute. This document explains the process for reporting bugs, suggesting features, and submitting code changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Suggest a Feature](#how-to-suggest-a-feature)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Branching Convention](#branching-convention)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## How to Report a Bug

Before opening a new issue, search the existing issues to avoid duplicates. If the bug has not been reported yet, open a new issue using the Bug Report template. The template will guide you through the information needed to reproduce and fix the problem.

For security vulnerabilities, do not open a public issue. Follow the process described in [SECURITY.md](SECURITY.md).

---

## How to Suggest a Feature

Open a new issue using the Feature Request template. Describe the use case first, not the implementation. Explain what you are trying to accomplish and why the current behavior does not satisfy that need.

---

## Setting Up the Development Environment

Follow the [Getting Started](README.md#getting-started) section in the README to have a running local instance. Make sure lint passes before writing any code :

```bash
npm run lint
```

---

## Branching Convention

Fork the repository and work on a dedicated branch. Never commit directly to `main`.

| Branch type | Pattern | Example |
|---|---|---|
| Bug fix | `fix/short-description` | `fix/login-cookie-expiry` |
| New feature | `feat/short-description` | `feat/event-search-filter` |
| Documentation | `docs/short-description` | `docs/api-reference-update` |
| Refactor | `refactor/short-description` | `refactor/auth-middleware` |

---

## Code Style

The project follows these conventions consistently. Please match them in your contributions.

**JSDoc comments on every function and file**

Every API route, hook, context function, and utility must have a JSDoc block. Include `@param`, `@returns`, `@example`, and `@throws` where applicable. The goal is that anyone reading a function signature and its JSDoc block understands exactly what it does without reading the implementation.

**Explicit variable names**

Prefer `inscriptions.find(...)` over `data.find(...)`. Prefer `const newEvent = { ...body, id: uuidv4() }` over `const obj = { ...body, id: uuidv4() }`.

**Guard clauses over nested conditionals**

Return early on invalid or missing data rather than nesting the happy path inside an `if` block.

**Inline comments on non-obvious logic**

If a line of code requires context to understand, add a comment on the line above it. Comments should explain the "why", not the "what".

**Section separators in long functions**

Use banner comments to visually separate distinct sections within a long function. The existing codebase uses `// ═══` for major sections and `// ───` for sub-sections.

---

## Commit Messages

Follow the Conventional Commits format.

```
type(scope): short imperative description

Optional longer description if the change is complex.
```

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `refactor` | Code change that is neither a fix nor a feature |
| `chore` | Build process, dependency updates, tooling |
| `test` | Adding or updating tests |
| `security` | Security-related changes |

Examples :

```
feat(events): add date range filter to event listing
fix(auth): correct JWT expiry parsing for short-lived tokens
docs(api): add PATCH /events/:id to API reference
security(login): apply rate limiting to login endpoint
```

---

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a pull request against the `main` branch of this repository
3. Fill in the pull request template completely
4. Make sure the CI checks pass (lint and build)
5. Wait for a maintainer review

Pull requests that do not include a description, break the lint check, or do not follow the branching convention will be asked to revise before review.
