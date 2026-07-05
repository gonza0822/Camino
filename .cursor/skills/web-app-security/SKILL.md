---
name: web-app-security
description: >-
  Security guidelines and audit workflow for full-stack web apps: input validation,
  injection (NoSQL/SQL/XSS), cookies and sessions, auth/authz, CSRF, headers, secrets,
  and API hardening. Use when implementing or reviewing Route Handlers, Server Actions,
  forms, auth, MongoDB/Mongoose queries, cookies, or when the user mentions security,
  OWASP, validation, injection, XSS, CSRF, or sensitive data.
---

# Web App Security

Security patterns for this project's stack: **Next.js App Router**, **Route Handlers**, **Server Actions**, **Zod**, **Mongoose/MongoDB**, **Redux** (UI state only), deploy on **Vercel**.

## When to Apply

- Adding or changing `app/api/**/route.ts`, Server Actions, auth, or file uploads
- Writing Mongoose queries, filters, or aggregations from user input
- Setting or reading cookies/sessions
- Handling forms, query params, headers, or webhooks
- Auditing code before merge or production
- User asks for security review, hardening, or OWASP checks

## Audit Workflow

1. **Map entry points** — Route Handlers, Server Actions, middleware, client forms, webhooks
2. **Review by severity** — CRITICAL → HIGH → MEDIUM
3. **Validate at the boundary** — Zod in `lib/validators/` before services/DB
4. **Check authz on every mutation/read** — not only authn
5. **Report findings** with Severity, Location (`file:line`), Issue, Fix

### Finding format

| Severity | Location | Issue | Fix |
|----------|----------|-------|-----|
| CRITICAL | `app/api/users/route.ts:42` | User input passed to `$where` | Use typed filter + allowlist |

---

## Validation (mandatory boundary)

**Rule:** Never trust client input. Validate in server code with Zod before `lib/services/` or DB.

```typescript
// lib/validators/contact.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

```typescript
// app/api/contact/route.ts
import { contactSchema } from "@/lib/validators/contact";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  // pass parsed.data to service — never raw body
}
```

**Checklist:**
- [ ] `safeParse` / `parse` on every external input (body, query, params, headers used for logic)
- [ ] Reject unknown fields with `.strict()` when updating documents
- [ ] Enforce max lengths on strings and array sizes
- [ ] Validate enums with `z.enum([...])`, not free strings for roles/status
- [ ] Server Actions: validate `FormData` fields explicitly; do not spread `Object.fromEntries(formData)` into DB updates
- [ ] Client-side validation is UX only — never a security control

---

## Injection (NoSQL, SQL, command, path)

### MongoDB / Mongoose (primary DB)

**Rule:** User input must never control operators, keys, or JavaScript in queries.

```typescript
// BAD — NoSQL injection via operator injection
const filter = JSON.parse(searchParams.get("filter") ?? "{}");
await User.find(filter);

// BAD — user controls query keys
await User.findOne({ [reqField]: value });

// GOOD — allowlist fields + typed values
const sortField = sort === "createdAt" ? "createdAt" : "name";
await User.find({ orgId }).sort({ [sortField]: 1 }).limit(limit);
```

**Never use:** `$where`, `eval`, raw aggregation stages built from strings, passing full client objects to `.find()` / `.updateOne()` / `.findOneAndUpdate()`.

**Do use:**
- Mongoose schema validation + `strict: true` on schemas
- Explicit field mapping for updates (no mass assignment from request body)
- `Types.ObjectId.isValid(id)` before queries by ID; return 404 on invalid format
- Parameterized-style filters: `{ email: parsed.data.email }` with validated types

### If SQL appears (raw queries, external DB)

Use parameterized queries / ORM methods only — never string concatenation.

### XSS (frontend + API responses)

```tsx
// BAD
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// GOOD — React escapes by default; sanitize only if HTML is required
<p>{userBio}</p>
```

- Avoid `dangerouslySetInnerHTML` unless sanitized with a vetted library
- Do not inject user input into `style`, `href`, or `src` without URL scheme allowlists
- Set `Content-Type: application/json` on API responses; never reflect raw input in HTML error pages

### Path traversal (uploads / file read)

```typescript
// BAD
const filePath = `./uploads/${filename}`;

// GOOD — strip path segments, allowlist extension, store outside public/
const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "");
```

---

## Authentication & Authorization

**Authn** — who is the user. **Authz** — can this user do this on this resource.

```typescript
// BAD — authenticated but no ownership check (IDOR)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const doc = await Report.findById(params.id);
  return Response.json(doc);
}

// GOOD — verify session + ownership or role
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!Types.ObjectId.isValid(params.id)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await Report.findOne({ _id: params.id, ownerId: session.userId });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(toPublicReport(doc));
}
```

**Checklist:**
- [ ] Sensitive routes fail closed (401/403), not silent empty data leaks
- [ ] Role checks in services, not only hidden UI
- [ ] Passwords: bcrypt/argon2 (cost ≥ 12), never MD5/SHA1/plaintext
- [ ] Rate-limit login, password reset, and OTP endpoints
- [ ] Do not expose password hashes, reset tokens, or internal IDs unnecessarily

---

## Cookies & Sessions

Prefer **`cookies()` from `next/headers`** in Server Components / Server Actions / Route Handlers.

```typescript
import { cookies } from "next/headers";

// GOOD — session cookie flags
cookieStore.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // use "strict" when CSRF risk is higher; "none" only with Secure + cross-site need
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

**Checklist:**
- [ ] `httpOnly: true` for session/auth cookies (not readable from JS)
- [ ] `secure: true` in production (HTTPS)
- [ ] `sameSite` set intentionally (`lax` default; avoid omitting)
- [ ] Never store JWT/session tokens in `localStorage` or Redux
- [ ] Rotate session on privilege change; invalidate on logout
- [ ] Short-lived access + refresh pattern if using JWTs; verify signature server-side

**CSRF:** Server Actions with Next.js built-in origin check; for cookie-auth Route Handlers use SameSite + CSRF token on state-changing requests from browsers.

---

## Secrets & Environment

- `MONGODB_URI`, API keys, signing secrets — **server only**, never `NEXT_PUBLIC_*`
- Read via `process.env.VAR` in server modules; fail fast if missing in production
- No secrets in client bundles, Redux state, logs, or error responses
- `.env.local` never committed; use Vercel env for production

---

## API & Server Actions

```typescript
// BAD — mass assignment
await User.findByIdAndUpdate(id, await request.json());

// GOOD — pick allowed fields after Zod parse
const { displayName, bio } = updateProfileSchema.parse(body);
await User.findByIdAndUpdate(id, { displayName, bio }, { runValidators: true });
```

**Checklist:**
- [ ] Consistent error shape; no stack traces or DB errors to clients in production
- [ ] Rate limiting on public and auth endpoints (middleware, Upstash, or Vercel)
- [ ] Webhooks: verify signature (HMAC) before processing body
- [ ] SSRF: allowlist hostnames before server-side `fetch(userUrl)`
- [ ] CORS: explicit origins if needed; never `*` with credentials
- [ ] Pagination caps (`limit` max e.g. 100) to prevent DoS

---

## Security Headers

Configure in `next.config.ts` `headers()` or middleware:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Restrict script/style/load sources |
| `Strict-Transport-Security` | Force HTTPS |
| `X-Content-Type-Options: nosniff` | Prevent MIME sniffing |
| `X-Frame-Options: DENY` or CSP `frame-ancestors` | Clickjacking |
| `Referrer-Policy` | Limit referrer leakage |

Start CSP strict in report-only if needed; tighten gradually.

---

## Frontend-Specific

- No secrets or privileged logic in `"use client"` components
- Sanitize URLs before `window.open` / `<a href>` from user content (`javascript:` blocked)
- File uploads: validate MIME **and** extension; size limits server-side; scan/store outside `public/`
- Redux: UI preferences only — not auth tokens or PII caches
- Depend on `npm audit` / Dependabot; pin and update vulnerable packages

---

## Logging & Monitoring

```typescript
// BAD
console.log("Login failed", { email, password });

// GOOD
console.error("Login failed", { email, ip, requestId });
```

- Log auth failures, permission denials, validation failures (without sensitive payloads)
- Never log passwords, tokens, cookies, full credit card numbers, or PII dumps

---

## Severity Reference

| Severity | Examples |
|----------|----------|
| **CRITICAL** | NoSQL/SQL injection, missing authz (IDOR), hardcoded secrets, plaintext passwords, `$where` with user input |
| **HIGH** | Missing cookie flags, weak session handling, mass assignment, SSRF, open redirects, missing CSRF on cookie auth |
| **MEDIUM** | Missing rate limits, verbose errors in prod, incomplete input validation on non-critical fields |
| **LOW** | Missing optional headers, suboptimal CSP, dev-only warnings left in prod |

Fix CRITICAL and HIGH before shipping features that touch user data or auth.

---

## Quick Scan Patterns

Search the diff/codebase for:

- `dangerouslySetInnerHTML`, `.innerHTML`, `eval(`, `new Function(`
- `$where`, `$regex` with unescaped user input, `JSON.parse` on query params for filters
- `findOneAndUpdate` / `updateOne` with spread of request body
- `process.env` referenced in client components or `NEXT_PUBLIC_` for secrets
- `Set-Cookie` without `HttpOnly` / `Secure` / `SameSite`
- `fetch(` with user-controlled URL
- `md5`, `sha1` for passwords
- `console.log` with request bodies or credentials

For diff-only review of local changes, the built-in **review-security** skill (subagent) complements this checklist.
