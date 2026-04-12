import { API_ROUTES } from '@/config/api';
import { AlertTriangle } from 'lucide-react';
import CourseClient from './CourseClient'; 

async function fetchCourseDetails(id: string) {
  try {
    const fetchUrl = API_ROUTES.COURSE_DETAILS(id).replace('localhost', '127.0.0.1');
    
    console.log(`[Server Fetch] Requesting: ${fetchUrl}`); 

    const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
    
    if (!res.ok) {
        console.error(`[Server Fetch] Failed with Status: ${res.status}`);
        return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("[Server Fetch] Network Error:", error);
    return null;
  }
}

export default async function CourseDetailsPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const courseId = resolvedParams?.id;

  if (!courseId) {
     console.error("[Server Fetch] Course ID is missing!");
     return null;
  }

  const course = await fetchCourseDetails(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
          <div className="p-6 bg-red-500/10 rounded-full text-red-500">
              <AlertTriangle size={48} />
          </div>
          <p className="font-bold text-xl text-gray-300">عذراً، هذه المادة غير متوفرة أو تم إزالتها.</p>
      </div>
    );
  }

  return <CourseClient course={course} id={courseId} />;
}