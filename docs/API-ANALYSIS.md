# API analysis

Source: `api-source.txt`, copied in full from the supplied attachment. Examples in that file describe schemas; no example records populate the application.

Base: `https://api.ourhostel.in/api/v1`. JSON requests use `Content-Type: application/json`. Protected operations require `Authorization: Bearer <login token>`. Student resource IDs are student **profile** IDs.

## Response schemas

Every successful response contains `status`, `message`, `data` and usually `errors: null`. The attendance report instead additionally documents `meta: {page,pageSize,totalPages}`. The exact examples and fields remain in the source document.

- **Login:** `data: {user: {id,email,status,role},token}`.
- **Password setup:** `data` is a success message string.
- **Student home:** `{canMarkAttendance:boolean,announcementsData:[]}`. No announcement item schema is defined.
- **Student:** `{id,studentName,contactNumber,parentMobileNumber,studentImageKey,rollNumber,userId,departmentId,roomId,collegeId,hostelId,createdAt,updatedAt}`. Detail adds `studentImageUrl`, a temporary signed URL. Student lists contain these profiles.
- **Department:** `{id,departmentName,hodName,contactPersonName,contactNumber,collegeId}`.
- **Room create/update:** `{id,roomNumber,capacity,hostelId,createdAt,updatedAt}`.
- **Room list item:** `{id,roomNumber,capacity,hostelId,occupied,remaining}`.
- **Room detail:** `{id,roomNumber,capacity,hostelId,_count:{studentProfiles}}`.
- **Attendance record:** `{id,attendanceDate,reportedTime,capturedImageKey,faceMatchingPercentage,latitude,longitude,isLocatedWithinHostelRadius,locationDeviationFromHostel,studentId}`.
- **Attendance present list item:** attendance record plus `student:{studentName,rollNumber,studentImageKey,room:{roomNumber}}`.
- **Attendance absent list item:** `{studentName,rollNumber,contactNumber,roomNumber,department,parentMobileNumber,studentImageKey,absentDates:string[]}`.
- **Attendance summary:** `{totalStudentsOfTheHostel,totalStudentsWithatleastOnePresentDuringDateFilter,completelyAbsentStudentsCountDuringDates}`. Report `data` is `{summary,attendanceRecords:[present or absent items]}`.
- **Leave:** `{id,leaveReason,fromDate,toDate,status,rejectionReason,studentId,createdAt,updatedAt,reviewedAt}`. Status includes `WAITING_FOR_APPROVAL`, `APPROVED`, `REJECTED`, `CANCELLED`.
- **Event:** `{id,eventName,eventDescription,startingAt,endingAt,isActive,eventImageKey,eventLink,contactPersonName,contactPersonPhone,hostelId}`.

Common failure: `{status:'failure',message,data:null,errors}`. `errors` can be a field/message object or string. Documented HTTP errors: 400 invalid credentials/missing auth; 401 invalid/expired token; 403 wrong role; 404 missing resource; 409 conflict; 422 invalid input. Unimplemented routes can return HTML.

## Implemented operations

Public requires no token. A = HOSTEL_ADMIN; S = STUDENT. Unless explicitly listed, an operation has no query parameters and no request body. All request fields below are the documented API field names.

| # | Method / endpoint | Role | Request fields / query | Success response data |
| --- | --- | --- | --- | --- |
| 1 | POST `/auth/login` | Public | Required `email,password` | 200 Login |
| 2 | POST `/students/setup_new_password` | Public | Required `token,newPassword`; raw emailed token expires after 5 minutes | 201 message string |
| 3 | GET `/students/home` | S | None | 200 Student home |
| 4 | POST `/attendance_records` | S | Required `capturedImageKey,latitude,longitude`; numeric coordinates; photo must already be uploaded | 201 Attendance record |
| 5 | GET `/attendance_records` | A | Query `page,pageSize,date,fromDate,toDate,status`, described below | 200 report with summary, records and top-level meta |
| 6 | POST `/students` | A | Required `email,studentName,contactNumber,parentMobileNumber,departmentId,rollNumber`; optional `studentImageKey,roomId` | 201 Student; emails setup link |
| 7 | GET `/students` | A | None | 200 Student[] |
| 8 | GET `/students/{id}` | A | None | 200 Student with signed image URL |
| 9 | PATCH `/students/{id}` | A | All create fields optional; send changed fields only; no nulls; backend ignores `rollNumber` updates | 200 Student |
| 10 | GET `/students/departments` | A | None | 200 Department[] scoped to college |
| 11 | POST `/rooms` | A | Required `roomNumber,capacity`; positive integer capacity | 201 Room create/update; known hostel ID defect |
| 12 | GET `/rooms` | A | Omit `starts_with` and `only_vacancy`; neither works | 200 Room list item[]; known hostel filtering defect |
| 13 | GET `/rooms/{id}` | A | None | 200 Room detail; known hostel filtering defect |
| 14 | PATCH `/rooms/{id}` | A | Optional `roomNumber,capacity`; positive integer capacity cannot be below occupancy | 200 Room create/update; known hostel filtering defect |
| 15 | POST `/leave_applications` | S | Required `leaveReason,fromDate,toDate`; start ≤ end; one pending request | 201 Leave |
| 16 | GET `/leave_applications` | A | None | 200 Leave[] for hostel |
| 17 | GET `/leave_applications/{id}` | A | None | 200 Leave |
| 18 | PATCH `/leave_applications/{id}` | S | Optional `leaveReason,fromDate,toDate`; send both dates if changing dates; pending only | 200 Leave |
| 19 | PATCH `/leave_applications/{id}/review` | A | Required `status` APPROVED or REJECTED; `rejectionReason` required for rejection; pending only | 200 Leave |
| 20 | PATCH `/leave_applications/{id}/cancel` | S | No body; pending only | 200 Leave with CANCELLED status |
| 21 | POST `/upcoming_events` | A | Required `eventName,eventDescription,startingAt,endingAt`; optional `eventImageKey,eventLink,contactPersonName,contactPersonPhone` | 201 Event |
| 22 | GET `/upcoming_events` | A or S | None | 200 Event[]; includes past and inactive events |
| 23 | GET `/upcoming_events/{id}` | A or S | None | 200 Event |
| 24 | PATCH `/upcoming_events/{id}` | A | All create fields optional, plus optional boolean `isActive`; changed fields only | 200 Event |

Student phone strings have exactly ten characters. Student IDs in payloads are positive integers. Event dates are ISO datetime strings; `eventLink` must be a valid URL. The document does not define event image download URLs or a schema for announcement items, so these are not fabricated.

### Attendance queries

- `page`: integer, minimum 1, default 1.
- `pageSize`: integer 1–100, default 10.
- `status`: `present` (default) or `absent`.
- Either `date` as YYYY-MM-DD, or paired `fromDate` and `toDate` in YYYY-MM-DD; do not combine.
- With no date filters, the backend defaults to today.
- For ranges, absent rows mean absent at least once; the completely-absent summary counts students missing every date.

### Room and hostel filtering limitations

`starts_with` is ignored. `only_vacancy` is declared boolean but URL strings fail validation and the service ignores it. Both are omitted. There are no documented working room filters or additional hostel filtering parameters. Room list/detail/update can have incorrect hostel filtering, and room create can fail because of the hostel ID issue. Warnings and hostel IDs remain visible rather than claiming correct scoping.

## Explicitly unimplemented

For each endpoint below, **the HTTP method, payload, queries, roles and successful response are undefined**. No method or request contract is inferred and the frontend never calls them.

| # | Endpoint | Blocked dependency |
| --- | --- | --- |
| 25 | `/students/forgot_password` | Password reset email |
| 26 | `/hostel-admin/dashboard` | Dedicated admin overview |
| 27 | `/leave_applications/student/my_leave_applications` | Student leave history |
| 28 | `/leave_applications/student/my_leave_applications/{id}` | Student leave detail |
| 29 | `/media/upload_url` | Upload URL and object key; proposed `media_for` query is unimplemented |
| 30 | `/media/download_url` | Signed image URL; proposed `image_key` query is unimplemented |

See `api-verification.json` for observed live results and `../README.md` for application coverage and remaining verification limits.
