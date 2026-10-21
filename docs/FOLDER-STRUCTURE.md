# OurHostel source organization

## Admin ownership

All admin-specific implementation is grouped in `src/admin/`:

```text
src/admin/
  components/
    AdminDashboardContent.tsx
    AdminWorkspaceTools.tsx
    DashboardChart.tsx
    StudentForm.tsx
    RoomForm.tsx
    RoomWarning.tsx
    EventForm.tsx
  layouts/
    AdminLayout.tsx
  pages/
    Dashboard.tsx
    students/     # list, add, details, edit
    rooms/        # list, add, details, edit
    attendance/   # admin reports
    leaves/       # list, details, review
    events/       # list, create, details, edit
  services/
    dashboardService.js
    studentService.js
    roomService.js
    attendanceService.js
    leaveService.js
    eventService.js
  styles/
    dashboard.css
  utils/
    dashboardData.js
```

`src/app/admin/` contains only the native Next.js route adapters and the protected admin route layout. Pages import `@/admin/pages/...`; the layout loads admin CSS and the HOSTEL_ADMIN guard. All existing URLs stay the same.

Admin-only API operations live in admin/services. The Axios client, bearer-token interceptor and documented operation/role contract remain centralized in src/common/services/api.ts and contract.js. Shared event reads remain in src/services. Student home, attendance marking, and leave operations are owned by src/user/services; their HTTP methods, fields, paths and response handling are unchanged.

## Public, student and shared code

- `src/app/layout.tsx` and `providers.tsx`: document, metadata, shared CSS and hydration-safe authentication.
- `src/app/login/`, `src/app/setup-password/`: public native routes.
- `src/common/pages/auth/`: login and password setup screens, shared by the supported roles.
- `src/app/student/`: native student routes and protected STUDENT layout.
- `src/user/pages/`: student-only screens.
- `src/user/components/StudentDashboardContent.tsx`: student dashboard, with no admin imports.
- `src/common/layouts/WorkspaceLayout.tsx`: reusable shell, receiving an optional header tools slot from AdminLayout; no admin implementation import.
- `src/user/layouts/StudentLayout.tsx`, `AuthLayout.tsx`: student and authentication layout.
- `src/common/components/`, `src/common/components/UI.tsx`: shared controls and common event views.
- `src/common/styles/workspace.css`: shared workspace appearance; admin analytics CSS is imported only by the admin route layout.
- `src/common/services/`, `src/common/utils/`: shared API contract, auth context, session/navigation utilities and shared read services.
- `src/common/assets/` and `public/images/`: existing shared image assets.

The old `src/views/admin`, `src/common/components/admin`, top-level AdminLayout, and shared admin dashboard/chart/tool files have been removed after moving their implementation and updating references.

Development: `npm run dev` at http://localhost:3000. Production: `npm run build` then `npm run start`.

## User / student ownership

All student-specific implementation is now grouped under src/user:

```text
src/user/
  pages/
    Dashboard.tsx
    attendance/MarkAttendance.tsx
    leaves/ApplyLeave.tsx, MyLeaves.tsx, LeaveDetails.tsx
    events/EventList.tsx, EventDetails.tsx
  components/
    StudentDashboardContent.tsx
    LeaveForm.tsx
    LeaveHistoryNotice.tsx
  layouts/
    StudentLayout.tsx
  services/
    studentService.js
    attendanceService.js
    leaveService.js
  utils/
    leaveSession.js
```

The seven existing /student routes and STUDENT guard remain under src/app/student. They import the screens and layout from src/user. The public login/password screens, token storage, role guards, navigation adapter, Axios client/contract, common event reads, shared workspace CSS, and image assets remain outside both role folders because they are shared.

This is a file organization change: API endpoints, payloads, roles, URLs and session-storage keys are unchanged. The previous src/views/student, src/common/components/student and top-level student-specific service/layout/leave-session files were removed after their references were updated. Build, lint and 15 existing tests pass.


Shared files are centralized in src/common/: components, layouts, services, styles, utils, routes, assets, and pages/auth. The global stylesheet is common/styles/index.css. Next.js routing stays in src/app; role-specific implementations stay in src/admin and src/user. All imports and test references have been updated.
