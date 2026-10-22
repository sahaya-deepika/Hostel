# Role-based authorization fix

## Root cause and source of authority

Previously both role layouts were client components. ProtectedRoute and AuthProvider read the role from editable sessionStorage JSON. The outgoing API allowlist also reads that JSON as a frontend convenience. There was no server-readable, integrity-protected authentication session, Proxy, or server layout check. Changing stored data could therefore unlock UI rendering even though it must never grant backend API privileges.

POST https://api.ourhostel.in/api/v1/auth/login returns data.user.role and data.token. The supplied guide documents no /me, session introspection, token refresh or logout endpoint. We do not invent any backend endpoint and do not treat merely decoding a JWT as verification.

## Authorization flow

1. The existing login form posts email/password to a new internal Next.js route, POST /api/auth/login. X-Login-Role expresses only the selected portal.
2. That server route forwards exactly email/password to the existing backend /auth/login over HTTPS. Backend errors remain errors. Only a successful response with an active, supported user and nonempty token can establish a session. A mismatch with the selected portal is rejected before issuing the cookie.
3. Next.js issues an HMAC-SHA256 signed HttpOnly, SameSite=Lax cookie with the backend-returned user and a SHA-256 digest of the token. The raw token is not stored in the cookie. HTTPS requests use Secure. The cookie expires after at most eight hours, or sooner if the backend token advertises an earlier exp. Decoding exp can only shorten this lifetime; decoded roles never grant access.
4. src/proxy.ts verifies the cookie signature, payload and expiry for all /admin/:path* and /student/:path* requests, including direct URLs, nested routes and refreshes. No cookie or invalid cookie goes to /login. Student accessing admin goes to /student/dashboard; admin accessing student goes to /admin/dashboard.
5. Both role route layouts also perform a server-side check before constructing their protected contents. They are dynamic because they read request cookies. Client guards remain for pending client auth state and sign-out behavior.
6. On client restoration, AuthProvider sends the existing per-tab bearer token to GET /api/auth/session. The server verifies that the token digest matches the signed cookie and returns the cookie's verified user. Stored JSON roles are overwritten and never used as authentication evidence. Cookie alone does not restore the browser's API token.
7. Logout calls DELETE /api/auth/session, expires the cookie, then clears existing sessionStorage keys and navigates fully to /login, discarding cached route content. A failed server logout is reported instead of falsely claiming completion. Existing backend 401 handling also clears the Next session cookie.
8. Login and logout mutations check the request Origin against the actual Host and protocol. Responses carrying session data are private/no-store. The cookie secret never uses a NEXT_PUBLIC variable.

The UI, styles, role names, backend endpoints and payloads are unchanged. The browser's existing ourhostel-user / ourhostel-token keys remain for established client API calls. That API interceptor is advisory; the backend must authorize independently. The login transport now goes through Next so browser-supplied roles cannot create server sessions.

## Configuration and existing sessions

A generated server-only AUTH_SESSION_SECRET was added to the ignored .env.local file without exposing its value. .env.example documents it. All deployed instances must use the same random secret of at least 32 characters. Missing configuration fails closed. Keep this value private and set it in production environment configuration.

Existing sessions predate the signed cookie and must sign in once again. No migration accepts a role or token from browser JSON as verified identity. Cookies are shared by browser tabs while the existing bearer tokens remain per-tab; a tab whose token no longer matches the current cookie must sign in again.

## Backend verification and required enforcement

Only frontend/Next source is available. The live unauthenticated read-only probes in docs/api-verification.json show that protected APIs reject missing tokens (currently HTTP 400). These probes do not prove that a valid STUDENT token is rejected on admin endpoints. No backend implementation or valid student/admin credentials were supplied, so authenticated backend authorization and real credential success are not claimed.

Backend requirements, if not already implemented:

- Verify the bearer token signature using trusted keys and an allowed algorithm; check expiry, issuer/audience where applicable, account status and resource ownership.
- Resolve the authoritative role from a trusted signed claim or current backend account/session; never from the login tab, URL, browser JSON, request body or a caller-controlled role header.
- Require HOSTEL_ADMIN for students list/create/detail/update, departments, rooms list/create/detail/update, attendance reports, leave list/detail/review and event create/update.
- Require STUDENT for student home, attendance creation and leave create/update/cancel; verify the student owns the leave request.
- Allow both supported roles for event list/detail.
- Return 401 for absent/invalid/expired authentication and 403 for a valid account lacking permission. Avoid returning unauthorized records or permitting mutations.
- If immediate role/status changes, token revocation or global logout are required, provide a documented verification/revocation mechanism. Next currently authenticates role at successful login and retains that signed assertion until expiry; live API authorization must remain current on every backend request.

The frontend repository cannot implement or certify these backend rules. No secret key for the backend JWT was assumed and no undocumented introspection endpoint was called.

## Verification

- Production build, strict TypeScript and ESLint pass.
- 22 tests pass: all protected routes redirect before rendering, missing/tampered/expired sessions fail closed, both role policies are enforced, opposite-role direct requests and refreshes redirect, token binding is checked, same-origin/logout behavior and existing API/chart tests pass.
- Signed role-policy sessions in tests are isolated fixtures under an ephemeral test-server secret. They are not real backend logins, not installed in the running application, and never used to access real protected backend data. Application code contains no mock users, login success stubs or hardcoded credentials.
- Login browser suite passes 43 viewport/zoom cases plus validation, password visibility, portal switching, loading, duplicate request prevention, request-failure recovery, setup navigation, direct unauthenticated redirects, forged browser storage and refresh.
- The browser loading/error test intercepts and fails the internal login request before credentials reach any backend. No successful backend authentication was mocked.
- Real successful student/admin login and live backend wrong-role denial remain unverified without valid credentials.

## Every changed file

- .env.local (ignored local server secret), .env.example (configuration template)
- src/proxy.ts
- src/common/server/session.ts
- src/common/server/requireRole.ts
- src/app/api/auth/session/route.ts
- src/app/api/auth/login/route.ts
- src/common/server/authHttp.ts
- src/app/admin/layout.tsx
- src/app/student/layout.tsx
- src/admin/layouts/AdminLayout.tsx
- src/user/layouts/StudentLayout.tsx
- src/common/utils/AuthContext.tsx
- src/common/services/authService.ts
- src/common/pages/auth/Login.tsx
- scripts/modules.test.mjs
- scripts/session.test.mjs
- scripts/login-browser-qa.mjs
- package.json
- docs/api-verification.json
- docs/ROLE-AUTHORIZATION.md
