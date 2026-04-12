"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // إجبار المتصفح على العودة لأعلى الصفحة عند أي تغيير في المسار
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto" // استخدم "auto" لانتقال فوري، أو "smooth" لانتقال ناعم
    });
  }, [pathname]);

  return null; // هذا المكون لا يعرض أي شيء في الواجهة
}