import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ==========================================
  // 🛡️ تحديث اسم الكوكي للاسم الجديد الذي اعتمدناه
  // ==========================================
  const token = request.cookies.get('upscale_auth_token')?.value; // 👈 التغيير هنا
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isInstructorRoute = pathname.startsWith('/instructor');
  const isLoginRoute = pathname === '/login' || pathname === '/signup';

  // 1. إذا حاول دخول مسار محمي وهو لا يملك توكن
  if (!token && (isAdminRoute || isInstructorRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let payload: any = null;

  // 2. فك تشفير التوكن (JWT) يدوياً في الميدل وير
  if (token) {
    try {
      const payloadBase64Url = token.split('.')[1];
      const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = decodeURIComponent(
          atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
      );
      payload = JSON.parse(decodedJson);
    } catch (error) {
      // إذا كان التوكن تالفاً، احذفه ووجهه للوج إن
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('upscale_auth_token'); // 👈 حذف الكوكي الجديد
      return response;
    }
  }

  // 3. حماية مسارات الإدارة (Admin)
  if (isAdminRoute && payload) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url)); // توجيه للرئيسية إذا لم يكن أدمن
    }
  }

  // 4. حماية مسارات المدرسين (Teacher / Instructor)
  if (isInstructorRoute && payload) {
    // المدرس والأدمن مسموح لهما دخول مسارات المدرسين
    if (payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 5. منع المستخدم المسجل من العودة لصفحات الـ Login/Signup
  if (isLoginRoute && payload) {
    if (payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (payload.role === 'TEACHER' || payload.role === 'INSTRUCTOR') {
      return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * استثناء ملفات النظام والصور لتسريع الأداء
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};