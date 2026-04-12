"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL, API_ROUTES } from '@/config/api'; 
import LearningInterface from '@/components/LearningInterface'; 
import { Loader2, Lock } from 'lucide-react';

export default function BootcampLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true; 

const fetchData = async () => {
try {
const res = await fetch(`${API_BASE_URL}/api/bootcamps/${id}`, {
    credentials: "include" 
});

if (!res.ok) {
const errData = await res.json().catch(() => ({}));
throw new Error(errData.message || "فشل تحميل المعسكر");
}

const result = await res.json();

if (!result.hasAccess) {
    if (isMounted) {
        setError("عذراً، يجب عليك الاشتراك في هذا المعسكر للوصول إلى المحتوى.");
        setLoading(false);
    }
    return;
}

if (isMounted) setData(result);

try {
const progressRes = await fetch(`${API_BASE_URL}/api/progress/my-progress?targetId=${id}&targetType=BOOTCAMP`, {
    credentials: "include" 
});

if (progressRes.ok) {
    const progressData = await progressRes.json();
    if (isMounted) {
        setUserProgress(progressData.map((p: any) => p.contentId));
    }
}
} catch (e) {
    console.error("Failed to load progress", e);
}
 
} catch (err: any) {
    console.error(err);
if (isMounted) setError(err.message || "حدث خطأ أثناء تحميل المحتوى.");
} finally {
    if (isMounted) setLoading(false);
 }
};
    fetchData();
    return () => { isMounted = false; };

  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <Loader2 className="animate-spin w-12 h-12 text-pink-500" />
        <p className="animate-pulse text-gray-400">جاري الدخول إلى المعسكر...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-6 items-center justify-center text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
            <Lock size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-center px-4 leading-relaxed">{error}</h2>
        <button 
            onClick={() => router.push(`/bootcamps/${id}`)}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold border border-white/10 mt-4"
        >
            العودة لصفحة التفاصيل
        </button>
    </div>
  );

  return <LearningInterface data={data} type="BOOTCAMP" userProgress={userProgress} />;
}