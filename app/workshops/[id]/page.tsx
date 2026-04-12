import { API_ROUTES } from '@/config/api';
import { AlertTriangle } from 'lucide-react';
import WorkshopClient from './WorkshopClient';

// جلب البيانات من السيرفر بسرعة فائقة مع التخزين المؤقت (Cache)
async function fetchWorkshopDetails(id: string) {
  try {
    // 1. حل مشكلة localhost في بيئة التطوير (Node.js IPv6 Bug)
    const fetchUrl = API_ROUTES.WORKSHOP_DETAILS(id).replace('localhost', '127.0.0.1');
    
    // 🔥 رسالة تتبع تظهر في Terminal محرر الأكواد عندك
    console.log(`[Server Fetch - Workshop] Requesting: ${fetchUrl}`); 

    const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
    
    if (!res.ok) {
        console.error(`[Server Fetch - Workshop] Failed with Status: ${res.status}`);
        return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("[Server Fetch - Workshop] Network Error:", error);
    return null;
  }
}

// 2. تحديث المكون ليتوافق مع Next.js 15 (التعامل مع params كـ Promise)
export default async function WorkshopDetailsPage({ params }: { params: any }) {
  // فك تشفير الـ params لضمان الحصول على الـ ID بشكل صحيح
  const resolvedParams = await params;
  const workshopId = resolvedParams?.id;

  if (!workshopId) {
     console.error("[Server Fetch - Workshop] Workshop ID is missing from params!");
     return null;
  }

  const workshop = await fetchWorkshopDetails(workshopId);

  // إذا لم يتم العثور على الورشة أو حدث خطأ بالسيرفر
  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
          <div className="p-6 bg-red-500/10 rounded-full text-red-500">
              <AlertTriangle size={48} />
          </div>
          <p className="font-bold text-xl text-gray-300">عذراً، هذه الورشة غير متوفرة أو تم إزالتها.</p>
      </div>
    );
  }

  // إذا نجح الجلب، نمرر البيانات الجاهزة للعميل ليدير الأزرار والتفاعلات
  return <WorkshopClient workshop={workshop} id={workshopId} />;
}