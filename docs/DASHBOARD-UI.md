# Admin dashboard and Apache ECharts

## UI

The existing admin dashboard now follows the supplied navy/gold/cream reference: campus banner, five metric cards, student overview, recent leave applications, upcoming events, a searchable workspace header, and notification availability notice. Existing role guards and backend authorization rules remain unchanged. The student dashboard retains its student-only API behavior.

The header search filters existing frontend navigation links locally; it does not invent a backend search API. Notifications show an explicit unavailable state because no notification endpoint is documented. No unread count is fabricated.

## Data sources

| Content | Documented source |
| --- | --- |
| Student count and names | GET /students, all returned profiles |
| Room count | GET /rooms, all returned rooms; count is labeled as returned data because hostel filtering is broken |
| Attendance percentage and pie | GET /attendance_records with today's India date, status=present, page=1, pageSize=1; use summary fields only |
| Seven-day line | Seven daily GET /attendance_records calls with the same documented parameters |
| Recent leaves/count | GET /leave_applications, sorted by createdAt, up to five rows; names joined by studentId against student list |
| Upcoming events/count | GET /upcoming_events, active entries not yet ended, sorted by startingAt, up to four rows |

No calls are sent to /hostel-admin/dashboard. No room filters are sent. The missing dashboard endpoint and room hostel-filtering issue remain visible in the dashboard notice. No venue, student year, or other undocumented response field is inferred. The reference's year distribution cannot be reproduced from the guide, so the requested line chart shows real daily attendance instead. Screenshot names and totals are not seeded into the app.

A consistent summary must contain nonnegative integer total, present, and absent counts with present + absent = total. Missing/inconsistent summaries are unavailable, not zero. Empty hostels have no computed percentage and no pie. Missing daily reports create null gaps; days with actual zero present remain zero.

## Charts

Apache ECharts is installed directly. DashboardChart is client-only and loads pie/line modules dynamically, uses the SVG renderer, observes its container with ResizeObserver, honors reduced motion, and disposes each instance on unmount or option changes. No chart service or backend endpoint is added.

Charts have accessible descriptions; the pie has visible summary counts and the line has a screen-reader table. Tooltips use rich-text rendering rather than interpolated HTML.

## Verification

- Next build and ESLint pass.
- 15 tests include the existing API contract and production-route smoke suite, India-date boundaries, real ECharts SVG rendering for pie/line options, summary consistency, missing-day gaps, and active-event sorting.
- Chart unit tests contain explicitly isolated synthetic values; there are no mocked successful API responses or mock authentication in the application.
- Isolated SSR loading-layout checks use the actual AdminDashboardContent: 1672x940, 1920x1080, 1366x768, 1024x768, 768x1024, 375x812, 320x740. No horizontal overflow; common desktop loading layouts fit the viewport. Tablet/mobile layouts scroll naturally. Results: artifacts/admin-analytics-layout-qa.json.
- These layout previews exercise loading state, not a live authenticated populated dashboard. Successful authenticated reads, actual live chart values, and live student/leave/event interactions require valid admin credentials and remain unverified.

## Admin source ownership

Admin implementation now lives in src/admin: components/AdminDashboardContent.tsx, components/DashboardChart.tsx, components/AdminWorkspaceTools.tsx, layouts/AdminLayout.tsx, services/dashboardService.ts, utils/dashboardData.ts, and styles/dashboard.css. Admin CRUD/review/report service functions are also grouped in src/admin/services. src/app/admin contains only native route adapters and the guarded layout. Shared transport, public authentication and student modules remain separate.
