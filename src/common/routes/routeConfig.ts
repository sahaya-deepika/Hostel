// Frontend route names are independent of backend endpoint names.
// Every lazy import below is checked by the production build.
export const adminRoutes=[
 {path:'dashboard',load:()=>import('../../admin/pages/Dashboard')},
 {path:'students',load:()=>import('../../admin/pages/students/StudentList')},
 {path:'students/new',load:()=>import('../../admin/pages/students/AddStudent')},
 {path:'students/:id',load:()=>import('../../admin/pages/students/StudentDetails')},
 {path:'students/:id/edit',load:()=>import('../../admin/pages/students/EditStudent')},
 {path:'rooms',load:()=>import('../../admin/pages/rooms/RoomList')},
 {path:'rooms/new',load:()=>import('../../admin/pages/rooms/AddRoom')},
 {path:'rooms/:id',load:()=>import('../../admin/pages/rooms/RoomDetails')},
 {path:'rooms/:id/edit',load:()=>import('../../admin/pages/rooms/EditRoom')},
 {path:'attendance',load:()=>import('../../admin/pages/attendance/AttendanceManagement')},
 {path:'leaves',load:()=>import('../../admin/pages/leaves/LeaveList')},
 {path:'leaves/:id',load:()=>import('../../admin/pages/leaves/LeaveDetails')},
 {path:'events',load:()=>import('../../admin/pages/events/EventList')},
 {path:'events/new',load:()=>import('../../admin/pages/events/CreateEvent')},
 {path:'events/:id',load:()=>import('../../admin/pages/events/EventDetails')},
 {path:'events/:id/edit',load:()=>import('../../admin/pages/events/EditEvent')},
]
export const studentRoutes=[
 {path:'dashboard',load:()=>import('../../user/pages/Dashboard')},
 {path:'attendance',load:()=>import('../../user/pages/attendance/MarkAttendance')},
 {path:'leaves',load:()=>import('../../user/pages/leaves/MyLeaves')},
 {path:'leaves/new',load:()=>import('../../user/pages/leaves/ApplyLeave')},
 {path:'leaves/:id',load:()=>import('../../user/pages/leaves/LeaveDetails')},
 {path:'events',load:()=>import('../../user/pages/events/EventList')},
 {path:'events/:id',load:()=>import('../../user/pages/events/EventDetails')},
]

