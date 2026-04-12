"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_ROUTES } from "@/config/api";
import { Loader2, AlertTriangle } from "lucide-react";
import LearningInterface from "@/components/LearningInterface"; 

export default function FreeContentLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [contentData, setContentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [isRedirecting, setIsRedirecting] = useState(false); 

  useEffect(() => {
    if (!id) {
        setError("رابط المحتوى غير صالح.");
        setLoading(false);
        return;
    }

    const fetchContent = async () => {
      try {
const response = await fetch(API_ROUTES.FREE_CONTENT_DETAILS(id as string), {
  credentials: "include" 
});
        
const data = await response.json();
if (response.status === 401) {
    setIsRedirecting(true);
    router.push('/login');
    return;
}
        if (!response.ok) {
            throw new Error(data.message || "فشل تحميل المحتوى");
        }
        
        if (data.hasAccess === false) {
            throw new Error("عذراً، هذا المحتوى لم يعد متاحاً أو يحتاج لصلاحيات خاصة.");
        }
        
        setContentData(data);
      } catch (err: any) {
        console.error("Error fetching free content:", err);
        setError(err.message || "حدث خطأ أثناء تحميل المحتوى، يرجى المحاولة لاحقاً.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, router]);

  if (isRedirecting) return <div className="min-h-screen bg-[#0f172a]"></div>;
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
        <p className="text-white font-bold animate-pulse">جاري تجهيز بيئة التعلم...</p>
      </div>
    );
  }

  if (error || !contentData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertTriangle size={40} className="text-red-500" />
        </div>
        <div className="text-center px-4 max-w-md">
          <h2 className="text-2xl font-bold mb-4 leading-relaxed">
            {error || "هذا المحتوى غير موجود"}
          </h2>
          <button 
            onClick={() => router.back()} 
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold"
          >
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  return (
    <LearningInterface 
       data={contentData} 
       type="FREE_CONTENT" 
    />
  );
}