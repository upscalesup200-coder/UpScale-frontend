"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // التأكد من أن المستخدم ضغط على صورة
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // إضافة المستمع للموقع بالكامل
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      // تنظيف المستمع عند إغلاق الصفحة
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return null; // هذا المكون يعمل في الخلفية ولا يعرض أي عناصر مرئية
}