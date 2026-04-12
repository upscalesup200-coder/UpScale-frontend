"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalHistoryFix() {
  const pathname = usePathname();
  const router = useRouter();

  // 1. معالجة زر الرجوع الخاص بالموبايل (Swipe / Hardware Back)
  useEffect(() => {
    // إذا دخل المستخدم من رابط خارجي مباشرة (سجل المتصفح فارغ) وهو ليس في الرئيسية
    if (window.history.length === 1 && pathname !== "/") {
      // خدعة: نستبدل السجل الحالي بالرئيسية، ثم نضيف الصفحة الحالية فوقها
      window.history.replaceState(null, "", "/");
      window.history.pushState(null, "", pathname);
    }
  }, []);

  // 2. معالجة أزرار الرجوع المبرمجة في واجهتك (router.back) وإنشاء Stack وهمي
  useEffect(() => {
    // جلب السجل الوهمي من الـ Session Storage (لكي يبقى محفوظاً عند تحديث الصفحة)
    const historyStack = JSON.parse(sessionStorage.getItem("app_history_stack") || "[]");
    
    // إضافة المسار الحالي للسجل إذا كان مختلفاً عن آخر مسار
    if (historyStack[historyStack.length - 1] !== pathname) {
      historyStack.push(pathname);
      sessionStorage.setItem("app_history_stack", JSON.stringify(historyStack));
    }

    // حفظ الدالة الأصلية للرجوع في المتصفح
    const originalBack = window.history.back;
    
    // إعادة كتابة دالة الرجوع (وهي التي يستخدمها Next.js داخلياً في router.back)
    window.history.back = function () {
      const currentStack = JSON.parse(sessionStorage.getItem("app_history_stack") || "[]");
      
      if (currentStack.length > 1) {
        // الوضع الطبيعي: المستخدم تنقل داخل الموقع، نخرجه من الـ Stack وننفذ الرجوع الطبيعي
        currentStack.pop();
        sessionStorage.setItem("app_history_stack", JSON.stringify(currentStack));
        originalBack.apply(window.history);
      } else {
        // السجل فارغ! المستخدم يضغط رجوع ولا يوجد صفحة سابقة
        // نمنعه من الخروج ونوجهه للصفحة الرئيسية (أو صفحة المسارات)
        router.push("/");
      }
    };

    // تنظيف (Cleanup) عند إزالة المكون
    return () => {
      window.history.back = originalBack;
    };
  }, [pathname, router]);

  // هذا المكون لا يعرض أي شيء في الواجهة
  return null; 
}