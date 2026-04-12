"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import LearningInterface from '@/components/LearningInterface'; 
import { Loader2, Lock } from 'lucide-react';

export default function CourseLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false); 

  useEffect(() => {
    if (!id) {
        setError("رابط المادة غير صالح.");
        setLoading(false);
        return;
    }
    const fetchData = async () => {
      try {
const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    credentials: "include" 
});

const result = await res.json();
if (res.status === 401) {
    setIsRedirecting(true);
    router.push('/login');
    return;
}
        if (!res.ok) {
            throw new Error(result.message || "فشل تحميل المادة");
        }
        
        if (!result.hasAccess) {
            throw new Error("عذراً، ليس لديك صلاحية للوصول لهذا المحتوى. يرجى الاشتراك أولاً.");
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

  if (isRedirecting) return (
      <div className="min-h-screen bg-[#0f172a]"></div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
        <p className="animate-pulse text-gray-400">جاري تجهيز القاعة الدراسية...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-6 items-center justify-center text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <Lock size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-center px-4">{error}</h2>
        <button 
            onClick={() => router.push(`/courses/${id}`)}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold"
        >
            العودة لصفحة التفاصيل
        </button>
    </div>
  );

  return <LearningInterface data={data} type="COURSE" />;
}