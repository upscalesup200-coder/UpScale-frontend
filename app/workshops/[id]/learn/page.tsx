"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import LearningInterface from '@/components/LearningInterface'; 
import { Loader2, Lock, AlertTriangle } from 'lucide-react';

export default function WorkshopLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ✅ حالة جديدة لمنع وميض شاشة التحميل لمن يتم توجيههم لتسجيل الدخول
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. حماية من غياب المعرف
    if (!id) {
        setError("رابط الورشة غير صالح.");
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        // ✅ التعديل: إرسال الكوكيز تلقائياً وحذف الهيدر اليدوي
const res = await fetch(`${API_BASE_URL}/api/workshops/${id}`, {
    credentials: "include" 
});

        const result = await res.json();
// ✅ إضافة هذا الجزء للتعامل مع انتهاء الجلسة أو عدم تسجيل الدخول
if (res.status === 401) {
    setIsRedirecting(true);
    router.push('/login');
    return;
}
        // 3. توحيد مسار الأخطاء ورميها للـ catch
        if (!res.ok) {
            throw new Error(result.message || "فشل تحميل بيانات الورشة");
        }
        
        // 4. ✅ سد الثغرة: التحقق الفعلي من امتلاك الطالب للصلاحية
        if (result.hasAccess === false) {
            throw new Error("عذراً، ليس لديك صلاحية للوصول لهذا المحتوى. يرجى الاشتراك في الورشة أولاً.");
        }

        setData(result);
        
      } catch (err: any) {
        console.error(err);
        setError(err.message || "حدث خطأ أثناء تحميل المحتوى.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [id, router]);

  // ✅ شاشة فارغة تمنع ظهور أي شيء أثناء تحويل المستخدم لصفحة تسجيل الدخول
  if (isRedirecting) return <div className="min-h-screen bg-[#0f172a]"></div>;

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <Loader2 className="animate-spin w-12 h-12 text-purple-500" />
        <p className="animate-pulse text-gray-400">جاري تجهيز بيئة العمل للورشة...</p>
    </div>
  );

  // ✅ شاشة خطأ احترافية تحتوي على خيار للعودة بدلاً من الشاشة الفارغة المغلقة
  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-6 items-center justify-center text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            {error.includes("صلاحية") ? (
                <Lock size={40} className="text-red-500" />
            ) : (
                <AlertTriangle size={40} className="text-red-500" />
            )}
        </div>
        <h2 className="text-2xl font-bold text-center px-4 max-w-lg leading-relaxed">{error}</h2>
        <button 
            onClick={() => router.push(`/workshops/${id}`)}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold mt-2"
        >
            العودة لصفحة تفاصيل الورشة
        </button>
    </div>
  );

  return <LearningInterface data={data} type="WORKSHOP" />;
}