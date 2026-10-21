# Student login and dashboard

Both roles sign in at /login using POST /auth/login. The backend-returned role chooses the destination: STUDENT goes to /student/dashboard, HOSTEL_ADMIN to /admin/dashboard. No role selector, separate credentials store or duplicate login is required.

Student implementations live in src/user. The protected Next.js route layout allows only STUDENT. Admin routes allow only HOSTEL_ADMIN; the shared API contract also enforces documented roles.

The student dashboard uses the existing navy/gold workspace with a campus banner, attendance availability, leave application shortcuts and recent requests saved from actual API responses in this tab, upcoming active events and announcements. It uses GET /students/home and GET /upcoming_events. Leave history does not call an unimplemented endpoint. User styles are scoped under src/user/styles/dashboard.css; admin analytics remains separate.

No profile, room or historical attendance data is invented when the supplied API does not expose it.

The login card now provides a native keyboard-accessible User/Admin radio toggle (User selected initially). Both choices use the same documented login endpoint with email/password only. The returned role must match the selected portal before signIn stores the session or navigation occurs. A mismatch displays instructions to choose the correct portal. The selection is disabled during login.
