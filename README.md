# OurHostel frontend

Next.js 16 App Router application migrated in the existing workspace. Uses React, strict TypeScript, Tailwind CSS v4 with PostCSS, Axios, and Lucide React. Vite and React Router have been removed.

## Run

```sh
npm install
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm test
npm run verify:api
```

Development: `npm run dev`. Production: `npm run build` then `npm run start`. Both use **http://localhost:3000**. `.next/` contains the production build; deploy with a Next.js-compatible Node host, not an index.html static-host fallback. `npm test` runs contract tests and an isolated production-server smoke suite, so build first. `npm run test:login-ui` checks the running app on port 3000.

## Routes

- Public: `/login`, `/setup-password`.
- Login redirects `HOSTEL_ADMIN` to `/admin/dashboard` and `STUDENT` to `/student/dashboard`.
- Admin: `/admin/students`, `/admin/rooms`, `/admin/attendance`, `/admin/leaves`, `/admin/events`, with nested create/detail/edit pages.
- Student: `/student/attendance`, `/student/leaves`, `/student/leaves/new`, `/student/leaves/:id`, `/student/events`, `/student/events/:id`.
- Existing `/students`, `/rooms`, `/attendance`, `/leaves` and `/events` links redirect to the appropriate permitted module. Both UI route guards and the outgoing API contract enforce role separation; backend authorization remains required.

## API source and architecture

The user-supplied file was available as `C:/Users/admin/Downloads/frontend-api-simple.txt` (the request calls it `frontend-api-simple(2).txt`). Its full contents are preserved in `docs/api-source.txt`. That document is the only backend contract used.

- `src/common/pages/auth/`: separate Login and SetNewPassword pages.
- `src/admin/pages/`: dashboard, students, rooms, attendance, leaves and events; create/detail/edit pages use the same documented APIs.
- `src/user/pages/`: dashboard, attendance, leave apply/session-list/detail/edit/cancel, event list/detail.
- `src/common/layouts/`: AuthLayout and shared WorkspaceLayout preserve the existing interface.
- `src/app/`: native file-based routes, root providers, public screens, and protected role layouts. Dynamic IDs use `[id]` folders.
- `src/common/routes/routeConfig.ts`: 16 admin page routes and seven student page routes.
- `src/common/components/`: Button, Input, Loader, ProtectedRoute and shared event views. Student dashboard belongs to `src/user/components/`; admin dashboard and charts belong to `src/admin/components/`.
- `src/admin/components/`, `src/user/components/`: reusable role-specific forms and backend limitation notices.
- `src/common/services/`: centralized Axios client, API contract, authentication and shared event reads; role-specific services stay under admin/services and user/services. Endpoint definitions stay in services.
- `src/common/services/contract.ts`: all 24 implemented operations with their allowed roles, payload fields and query parameters.
- `src/common/utils/`: authentication context, session utilities, request lifecycle, dates and actual leave-response session storage.
- `src/app/layout.tsx` and `providers.tsx`: global styles, metadata, Suspense and hydration-safe authentication.
- `src/common/utils/navigation.tsx`: thin components/hooks backed by `next/link` and `next/navigation`; no second router.
- `docs/API-ANALYSIS.md`: complete API inventory. `docs/FOLDER-STRUCTURE.md`: current module structure and refactor notes.

Unused compatibility files (`pages/Login.tsx`, `pages/Management.tsx`, `pages/AttendanceLeave.tsx`, `services/auth.ts`) and unused Vite starter CSS/assets were removed after checking static and lazy imports. Canonical authentication screens live in `src/common/pages/auth/`, exposed by `src/app/login/page.tsx` and `src/app/setup-password/page.tsx`. User-provided assets were excluded from the cleanup targets.

Base URL is fixed to `https://api.ourhostel.in/api/v1`. There is no alternate API, proxy, mocked response, or seeded application data. Authentication tokens and the returned user are stored in sessionStorage. Signing out clears authentication. The backend must enforce role and resource ownership independently of frontend checks.

## Implemented application features

- Public email/password login and first-password setup using the five-minute emailed token.
- Role-specific student/admin navigation and guarded API operations.
- Student home flag and announcements. Announcement item fields are undocumented, so returned data is shown without inventing a schema.
- Student attendance submission using an **already uploaded** photo key and numeric location; browser geolocation is optional. No upload is simulated.
- Admin attendance reports with single date or paired range, present/absent response layouts, real summary counts, page size 1–100 and pagination.
- Admin student create/list/detail/update and college department selector. Positive IDs, ten-character phone strings, and omitted unchanged fields. Roll-number editing is omitted because the backend ignores it.
- Admin room create/list/detail/update, real occupancy, capacity constraints and explicit backend warnings. Both broken room query filters are omitted. No hostel filter is invented.
- Student leave create/edit/cancel using actual responses retained in the current tab session, with a prominent history/retrieval limitation. Cached status cannot be refreshed; the backend decides whether a request remains pending.
- Admin leave list/detail/review. Rejection requires a reason; approval sends only status.
- Both roles can list/view events. Admins create/update/deactivate them. Past and inactive events are labeled and retained. Datetime input is converted between local display and ISO API strings.
- Loading, empty, validation, error, retry and API-confirmed success states.

## Missing backend dependencies

No request is sent to any of these unavailable endpoints:

| Endpoint | Affected experience |
| --- | --- |
| `/students/forgot_password` | Recovery displays unavailable state. |
| `/hostel-admin/dashboard` | Dedicated dashboard overview unavailable; overview uses documented student list, with source identified. |
| `/leave_applications/student/my_leave_applications` | Student leave history unavailable; only real responses from this tab session can be displayed. |
| `/leave_applications/student/my_leave_applications/{id}` | Student leave detail refresh unavailable. Admin detail API is never used by a student. |
| `/media/upload_url` | Photo capture/upload unavailable. Existing uploaded object keys may be supplied to implemented APIs. |
| `/media/download_url` | Generic image resolution unavailable. Only student detail's actual signed `studentImageUrl` is rendered. |

Room creation may fail because of the documented hostel ID issue. Room list/detail/update hostel filtering is unreliable; the UI exposes hostel IDs and warnings. These backend defects are not silently corrected or bypassed.

## Verification and remaining blockers

- `npm run build`: passes.
- `npm test`: eight checks pass. They compare all 24 operations and roles against the API source, exclude missing operations, reject unsupported room filters/fields, server-render both auth pages, verify role-specific route collections, exercise actual missing-session/wrong-role route guards, and check the Axios bearer-token interceptor. Test session fixtures stay in memory; no API success responses or application records are fabricated.
- Live probes in `docs/api-verification.json`: POST login and password setup with empty bodies return documented HTTP 422 validation errors. GET student home, attendance records, students, departments, rooms, leave applications and events return HTTP 400 missing-auth errors.
- No valid account credentials or resource IDs were supplied. Successful login, protected successful reads, detail reads, mutations, and end-to-end role workflows remain unverified. No production records were created or changed during checks.
- **Confirmed browser blocker:** login OPTIONS preflight for `http://localhost:3000` returned 200 but no `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, or `Access-Control-Allow-Headers`. Actual responses also omit allow-origin. Backend CORS must allow the frontend origin, JSON content type and Authorization header before cross-origin browser integration can succeed. The frontend keeps the exact required API URL.
- Server-rendered authentication and guard checks pass. The login UI was subsequently checked in local headless Chrome; see docs/LOGIN-UI.md. Other authenticated workflows remain unverified in-browser.

`npm run verify:api` repeats only safe unauthenticated reads, public empty-body validation and CORS checks. It never creates or updates hostel records.

## Login UI with supplied assets

The light-blue split-screen authentication UI uses the original `src/common/assets/login1.png` campus background and `login2.png` contained decoration. See [login implementation and QA notes](docs/LOGIN-UI.md) for the changed files, screenshots, four viewport checks, interaction tests, and live CORS result. Remember Me stores the email only; token handling remains session-based.

Run `npm run test:login-ui` with Chrome installed and the dev server running on port 5173. The latest production build and ten module/contract checks pass. Actual browser interaction checks are recorded in `artifacts/login-qa.json`; successful authenticated login remains unverified.

## Next.js migration verification

Native routes preserve the existing URLs, 16 admin views, seven student views, role guards, and all 24 documented API operations. Session tokens stay in sessionStorage and are restored after hydration; no authentication credentials are serialized into server-rendered HTML. Both provided PNGs remain in src/assets and use Next static-import URLs.

Production build, ESLint, 10 contract/server smoke tests, and 43 login viewport/zoom-equivalent cases pass. The browser suite checks protected-route redirects and the raw emailed setup token. Successful live login and authenticated API mutations still require valid user credentials; none were supplied or simulated. Older reports under docs describe the pre-migration implementation unless updated here.
#   H o s t e l  
 
## Admin folder organization

All admin-only pages, components, layout, API services, styles, and chart utilities are centralized under **src/admin/**. Native Next.js route adapters remain under src/app/admin, preserving every URL. Shared authentication, API transport/contract, and the student workspace remain separate. Admin styles are loaded by the admin route layout. See docs/FOLDER-STRUCTURE.md for the complete tree.

## User folder organization

Student/user pages, components, layout, student-only services and leave-session utilities are centralized under **src/user/**. Native Next.js route adapters remain in src/app/student and preserve all /student URLs. Admin code remains in src/admin. Authentication, common UI, event reads and the API transport/contract remain shared. See docs/FOLDER-STRUCTURE.md.
