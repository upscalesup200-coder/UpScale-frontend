// 1. جلب الرابط من البيئة
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 2. تنظيف الرابط: حذف أي "سلاش" من نهاية الرابط لتجنب مشكلة السلاش المزدوج //
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

// 3. نظام تنبيه للمطورين في بيئة الإنتاج لمنع نسيان إضافة رابط السيرفر
if (process.env.NODE_ENV === "production" && API_BASE_URL.includes("localhost")) {
  console.warn("⚠️ تحذير: الموقع يعمل في بيئة الإنتاج ولكنه يحاول الاتصال بـ Localhost! تأكد من ضبط NEXT_PUBLIC_API_URL في إعدادات السيرفر.");
}

export const API_ROUTES = {
  // --- Auth & Users ---
 // --- Auth & Users ---
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`, 
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  RESET_PASSWORD_CONFIRM: `${API_BASE_URL}/api/auth/reset-password`,
  GET_ME: `${API_BASE_URL}/api/users/me`,
  LEADERBOARD: `${API_BASE_URL}/api/users/leaderboard`,
  GIVE_XP: `${API_BASE_URL}/api/users/give-xp`,
  RATE_ITEM: `${API_BASE_URL}/api/users/rate`,
  
  // ✅ السطر الذي كان مفقوداً (جلب بيانات الملف الشخصي)
  GET_PROFILE: (id: string) => `${API_BASE_URL}/api/users/profile/${encodeURIComponent(id)}`,
  GET_ITEM_REVIEWS: (id: string) => `${API_BASE_URL}/api/users/item-reviews/${encodeURIComponent(id)}`,
  // ✅ استخدام encodeURIComponent لحماية الروابط من أي رموز غريبة في الـ ID
  UPDATE_PROFILE: (id?: string) => `${API_BASE_URL}/api/users/update-profile`,
  CHANGE_PASSWORD: (id?: string) => `${API_BASE_URL}/api/users/change-password`,
  UPLOAD_AVATAR: (userId?: string) => `${API_BASE_URL}/api/users/upload-avatar`,

  // --- Admin ---
  ADMIN_STATS: `${API_BASE_URL}/api/enrollments/admin/stats`,
  ADMIN_MANUAL_ENROLL: `${API_BASE_URL}/api/enrollments/manual-access`,  
  ADMIN_DEVICES: `${API_BASE_URL}/api/users/admin/devices`, 
  ADMIN_SVU_COURSES: `${API_BASE_URL}/api/svu/admin/courses`,
  GET_ITEM_STUDENTS: (itemId: string) => `${API_BASE_URL}/api/enrollments/admin/students/${encodeURIComponent(itemId)}`,
  ADMIN_ITEM_STUDENTS: (itemId: string) => `${API_BASE_URL}/api/enrollments/admin/students/${encodeURIComponent(itemId)}`,
  ADMIN_REMOVE_ENROLLMENT: (userId: string, itemId: string) => `${API_BASE_URL}/api/enrollments/admin/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`,
  ADMIN_TOGGLE_DEVICE: (id: string) => `${API_BASE_URL}/api/users/admin/device/toggle/${encodeURIComponent(id)}`, 
  ADMIN_RESET_DEVICE: (id: string) => `${API_BASE_URL}/api/users/admin/reset-device/${encodeURIComponent(id)}`,
  // --- Content ---
  COURSES: `${API_BASE_URL}/api/courses`,
  COURSE_DETAILS: (id: string) => `${API_BASE_URL}/api/courses/${encodeURIComponent(id)}`,
  WORKSHOPS: `${API_BASE_URL}/api/workshops`,
  WORKSHOP_DETAILS: (id: string) => `${API_BASE_URL}/api/workshops/${encodeURIComponent(id)}`,
  BOOTCAMPS: `${API_BASE_URL}/api/bootcamps`,
  BOOTCAMP_DETAILS: (id: string) => `${API_BASE_URL}/api/bootcamps/${encodeURIComponent(id)}`,
  FREE_CONTENT: `${API_BASE_URL}/api/free-content`,
  FREE_CONTENT_DETAILS: (id: string) => `${API_BASE_URL}/api/free-content/${encodeURIComponent(id)}`,
  NEWS: `${API_BASE_URL}/api/news`,
  FEATURED: `${API_BASE_URL}/api/featured`,

  // --- Comments & Chat ---
  COMMENTS: `${API_BASE_URL}/api/comments`,
  COMMENT_ACTION: (id: string) => `${API_BASE_URL}/api/comments/${encodeURIComponent(id)}`, 
  COMMENTS_PARTICIPANTS: (videoId: string) => `${API_BASE_URL}/api/comments/participants?videoId=${encodeURIComponent(videoId)}`,
  CLEAR_CHAT: (videoId: string) => `${API_BASE_URL}/api/comments/video/${encodeURIComponent(videoId)}/clear-all`,
  READ_ALL_NOTIFICATIONS: (videoId: string) => `${API_BASE_URL}/api/comments/notifications/read-all/${encodeURIComponent(videoId)}`,
  READ_SINGLE_MESSAGE: (msgId: string) => `${API_BASE_URL}/api/comments/notifications/read-message/${encodeURIComponent(msgId)}`,

  // --- Progress & Tasks ---
  MY_PROGRESS: `${API_BASE_URL}/api/progress/my-progress`,
  COMPLETE_CONTENT: `${API_BASE_URL}/api/progress/complete`,
  PROBLEM_DETAILS: (problemId: string) => `${API_BASE_URL}/api/competitions/problems/${encodeURIComponent(problemId)}`,
  SUBMIT_CODE: (problemId: string) => `${API_BASE_URL}/api/competitions/problems/${encodeURIComponent(problemId)}/submit`,
  SUBMIT_TASK: (taskId: string) => `${API_BASE_URL}/api/submissions/task/${encodeURIComponent(taskId)}`,
  MY_SUBMISSION: (taskId: string) => `${API_BASE_URL}/api/submissions/my-submission/${encodeURIComponent(taskId)}`,
  TASK_SUBMISSIONS: (taskId: string) => `${API_BASE_URL}/api/submissions/task/${encodeURIComponent(taskId)}/all`,
  GRADE_SUBMISSION: (submissionId: string) => `${API_BASE_URL}/api/submissions/grade/${encodeURIComponent(submissionId)}`,

  // --- Instructor ---
  INSTRUCTOR_MY_ITEMS: `${API_BASE_URL}/api/instructor-content/my-items`,
  UPLOAD_MEDIA: `${API_BASE_URL}/api/instructor-content/upload-media`,
  INSTRUCTOR_ADD_CONTENT: `${API_BASE_URL}/api/instructor-content/add`,
  INSTRUCTOR_UPDATE_CONTENT: (id: string) => `${API_BASE_URL}/api/instructor-content/update/${encodeURIComponent(id)}`,
  INSTRUCTOR_DELETE_CONTENT: (id: string) => `${API_BASE_URL}/api/instructor-content/delete/${encodeURIComponent(id)}`,
  CREATE_QUIZ: `${API_BASE_URL}/api/instructor-content/create-quiz`,
  CREATE_EXAM: `${API_BASE_URL}/api/instructor-content/create-exam`,

  // --- Notifications ---
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  MARK_READ: `${API_BASE_URL}/api/notifications/mark-read`,
  CLEAR_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/clear`,
  DELETE_NOTIFICATION: (id: string) => `${API_BASE_URL}/api/notifications/${encodeURIComponent(id)}`,

  VERIFY_EMAIL: `${API_BASE_URL}/api/users/verify-email`,
  RESEND_OTP: `${API_BASE_URL}/api/users/resend-otp`, // 👈 السطر الجديد
};