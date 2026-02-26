# API Reference

All endpoints are prefixed with `/api`. Requests and responses use `application/json`.

Authentication is handled via a session cookie set by `POST /api/login`. Endpoints marked as "Auth required" will return `401 Unauthorized` if the cookie is absent or invalid.

---

## Authentication

### POST /api/login

Authenticates a user. On success, sets an HTTP-only session cookie.

**Auth required :** No

**Rate limit :** 10 requests per 15-minute window per IP

**Request body :**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Plain-text password (compared against bcrypt hash) |

**Responses :**

| Status | Description |
|---|---|
| 200 | Login successful. Session cookie set. Returns user object (without password field) |
| 400 | Validation error. Missing or malformed fields |
| 401 | Invalid credentials |
| 429 | Rate limit exceeded |

**Response body (200) :**

```json
{
    "id": "uuid",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com"
}
```

---

### POST /api/logout

Clears the session cookie server-side.

**Auth required :** No

**Responses :**

| Status | Description |
|---|---|
| 200 | Cookie cleared |

---

## Events

### GET /api/events

Returns the full list of events.

**Auth required :** No

**Responses :**

| Status | Description |
|---|---|
| 200 | Array of event objects |
| 500 | Data read error |

---

### POST /api/events

Creates a new event.

**Auth required :** Yes

**Request body :**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string (3-100 chars) | Yes | Event title |
| `description` | string (10-1000 chars) | Yes | Event description |
| `date` | string (YYYY-MM-DD) | Yes | Event date |
| `time` | string (HH:MM) | Yes | Event time |
| `location` | string (5-200 chars) | Yes | Event location |
| `category` | number | Yes | Category ID |
| `maxParticipants` | number (1-10000) | Yes | Maximum registrations |
| `image` | string | No | Path to event image in `/public/events/` |

**Responses :**

| Status | Description |
|---|---|
| 201 | Created. Returns the new event with its generated `id` |
| 400 | Validation error |
| 401 | Not authenticated |
| 500 | Data write error |

---

### GET /api/events/:id

Returns a single event by its ID.

**Auth required :** No

**Responses :**

| Status | Description |
|---|---|
| 200 | Event object |
| 404 | Event not found |

---

### PATCH /api/events/:id

Updates one or more fields of an existing event.

**Auth required :** Yes

**Request body :** Any subset of the POST body fields. Only provided fields are updated.

**Responses :**

| Status | Description |
|---|---|
| 200 | Updated event object |
| 400 | Validation error |
| 401 | Not authenticated |
| 404 | Event not found |

---

### DELETE /api/events/:id

Deletes an event and all associated registrations.

**Auth required :** Yes

**Responses :**

| Status | Description |
|---|---|
| 200 | Deleted event object |
| 401 | Not authenticated |
| 404 | Event not found |

---

## Inscriptions (Registrations)

### GET /api/inscriptions

Returns all registrations. Results can be filtered by user or event using query parameters.

**Auth required :** Yes

**Query parameters :**

| Parameter | Type | Description |
|---|---|---|
| `user` | string | Filter by user ID |
| `event` | string | Filter by event ID |

**Responses :**

| Status | Description |
|---|---|
| 200 | Array of registration objects |
| 401 | Not authenticated |

---

### POST /api/inscriptions

Registers the authenticated user for an event.

**Auth required :** Yes

**Request body :**

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | User ID |
| `event` | string | Yes | Event ID |

**Responses :**

| Status | Description |
|---|---|
| 201 | Created. Returns the new registration with its generated `id` |
| 400 | Validation error |
| 401 | Not authenticated |
| 409 | Registration already exists for this user and event |

---

### DELETE /api/inscriptions/:id

Cancels a registration.

**Auth required :** Yes

**Responses :**

| Status | Description |
|---|---|
| 200 | Deleted registration object |
| 401 | Not authenticated |
| 404 | Registration not found |

---

## Users

### GET /api/users

Returns all users. Passwords are excluded from all responses.

**Auth required :** Yes

**Responses :**

| Status | Description |
|---|---|
| 200 | Array of user objects (without password field) |
| 401 | Not authenticated |

---

### POST /api/users

Creates a new user account. The password is hashed with bcrypt before storage.

**Auth required :** No

**Request body :**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstname` | string (2-50 chars) | Yes | First name |
| `lastname` | string (2-50 chars) | Yes | Last name |
| `email` | string (valid email) | Yes | Email address (must be unique) |
| `password` | string (min 8 chars) | Yes | Plain-text password (hashed before storage) |

**Responses :**

| Status | Description |
|---|---|
| 201 | Created. Returns user object without password field |
| 400 | Validation error |
| 409 | Email already in use |

---

### GET /api/users/:id

Returns a single user by ID. Password is excluded.

**Auth required :** Yes

**Responses :**

| Status | Description |
|---|---|
| 200 | User object (without password field) |
| 401 | Not authenticated |
| 404 | User not found |

---

### PATCH /api/users/:id

Updates one or more fields of a user. If `password` is provided, it is hashed before storage.

**Auth required :** Yes

**Request body :** Any subset of the POST body fields.

**Responses :**

| Status | Description |
|---|---|
| 200 | Updated user object (without password field) |
| 400 | Validation error |
| 401 | Not authenticated |
| 404 | User not found |
| 409 | Email already in use (if email field is being updated) |

---

### DELETE /api/users/:id

Deletes a user account and all associated registrations.

**Auth required :** Yes

**Responses :**

| Status | Description |
|---|---|
| 200 | Deleted user object (without password field) |
| 401 | Not authenticated |
| 404 | User not found |

---

## Categories

### GET /api/categories

Returns all categories.

**Auth required :** No

**Responses :**

| Status | Description |
|---|---|
| 200 | Array of category objects |

---

### GET /api/categories/:id

Returns a single category by ID.

**Auth required :** No

**Responses :**

| Status | Description |
|---|---|
| 200 | Category object |
| 404 | Category not found |

---

## Contact

### POST /api/contact

Submits a contact message. The message is appended to `src/data/contacts.json`.

**Auth required :** No

**Request body :**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string (2-100 chars) | Yes | Sender name |
| `email` | string (valid email) | Yes | Sender email address |
| `message` | string (10-2000 chars) | Yes | Message content |

**Responses :**

| Status | Description |
|---|---|
| 201 | Message stored. Returns the stored contact object with its ID |
| 400 | Validation error |

---

## Common Error Shape

All error responses follow this format :

```json
{
    "message": "Human-readable description of the error"
}
```

Validation errors from Zod include the field-level detail :

```json
{
    "message": "Validation failed",
    "errors": [
        { "field": "email", "message": "Invalid email address" },
        { "field": "password", "message": "Password must be at least 8 characters" }
    ]
}
```
