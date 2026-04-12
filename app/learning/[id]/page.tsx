"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ROUTES } from '@/config/api';
import LearningInterface from '@/components/LearningInterface'; 
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [courseData, setCourseData] = useState<any>(null);
  const [learningType, setLearningType] = useState<'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'FREE_CONTENT' | null>(null);
  const [userProgress, setUserProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ROUTES.COURSE_DETAILS(id), {
          withCredentials: true,
        });
        
        const data = res.data;
        if (!data) throw new Error("المادة غير موجودة");

        setCourseData(data);

        if (data.type) {
            setLearningType(data.type);
        } else if (data.quizzesCount !== undefined && data.tasksCount !== undefined) {
            setLearningType('COURSE');
        } else if (data.duration && !data.tasksCount) {
            setLearningType('FREE_CONTENT');
        } else {
            setLearningType('WORKSHOP');
        }

        try {
            const progressUrl = API_ROUTES.MY_PROGRESS ? API_ROUTES.MY_PROGRESS : `${process.env.NEXT_PUBLIC_API_URL}/enrollments/progress`;
            const progressRes = await axios.get(progressUrl, { withCredentials: true });
            if (Array.isArray(progressRes.data)) {
                setUserProgress(progressRes.data);
            }
        } catch (progressErr) {
            console.error("لم نتمكن من جلب تقدم الطالب");
        }

      } catch (err: any) {
        console.error(err);
        setError("تعذر تحميل بيانات المادة. قد لا تملك صلاحية الوصول أو أن المادة غير موجودة.");
        toast.error("حدث خطأ في تحميل المادة");
        setTimeout(() => router.push('/desktop'), 3000); 
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#0f172a] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-purple-500 w-12 h-12" />
        <p className="text-gray-400 font-bold animate-pulse">جاري تحميل بيئة التعلم المحمية...</p>
      </div>
    );
  }

  // شاشة الخطأ
  if (error || !courseData || !learningType) {
    return (
      <div className="flex h-screen w-full bg-[#0f172a] items-center justify-center">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-red-500/20 text-center max-w-md shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-2">خطأ 404</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => router.push('/desktop')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl font-bold transition-all">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <LearningInterface 
        data={courseData} 
        type={learningType} 
        userProgress={userProgress} 
    />
  );
}