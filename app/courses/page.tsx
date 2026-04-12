import { API_ROUTES } from "@/config/api";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, HelpCircle, FileText, ArrowLeft, Star, MonitorPlay, TimerReset, AlertTriangle } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white.png?text=Course";

async function fetchCourses() {
  try {
    const res = await fetch(API_ROUTES.COURSES, { next: { revalidate: 60 } });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("فشل جلب المواد:", error);
    return null; 
  }
}


const ReadOnlyRating = ({ averageRating = 0, reviewsCount = 0 }: { averageRating?: number, reviewsCount?: number }) => {
  const displayValue = Math.round(averageRating);

  return (
    <div className="flex items-center gap-2 mt-1 mb-3">
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            <Star 
              size={14} 
              className={
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400 md:drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" 
                  : "text-gray-600"
              } 
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-2 mr-1">
        <span className="text-xs font-bold text-white">{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</span>
        <span className="text-[10px] text-gray-500">({reviewsCount})</span>
      </div>
    </div>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};


export default async function AllCoursesPage() {
  const courses = await fetchCourses();

  if (!courses) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <AlertTriangle size={50} className="text-red-500" />
        <h2 className="text-xl font-bold">عذراً، حدث خطأ أثناء جلب المواد</h2>
        <p className="text-gray-400">يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4 flex justify-center items-center gap-3">
             <BookOpen className="text-blue-500 w-10 h-10" /> المواد الأكاديمية
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            تصفح موادك الجامعية مشروحة بالكامل، مع كويزات وملخصات شاملة تضمن تفوقك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course: any, index: number) => (
            <div key={course.id} className="group bg-[#1e293b] md:bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl md:hover:-translate-y-1 flex flex-col h-full relative">
              
              <div className="w-full h-48 relative overflow-hidden bg-slate-800">
                <Image 
                  unoptimized
                  priority={index < 4} 
                  src={getImageUrl(course.imageUrl, 'course', 600) || FALLBACK_IMAGE} 
                  alt={course.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover md:group-hover:scale-110 transition-transform duration-700" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                <div className="absolute top-3 right-3 bg-black/80 md:bg-black/60 md:backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                   {course.sessionsCount} محاضرة 📺
                </div>

                {course.isPlatformSponsored && course.stampUrl && (
                  <div className="absolute top-3 left-3 w-10 h-10 bg-[#0f172a]/90 md:bg-white/10 md:backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-1 shadow-lg md:group-hover:scale-110 transition-transform" title="مادة رسمية">
                      <Image 
                        unoptimized
                        src={getImageUrl(course.stampUrl) || FALLBACK_IMAGE}
                        alt="Stamp" 
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-1">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-1" title={course.title}>
                      {course.title}
                    </h3>
                </div>

                <ReadOnlyRating 
                  averageRating={course.averageRating || 0} 
                  reviewsCount={course.reviewsCount || 0} 
                />

                <p 
                  className="text-gray-400 text-xs mb-4 leading-relaxed line-clamp-2 font-medium"
                  title={course.description}
                >
                    {course.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-gray-300 mb-4 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Clock size={14} className="text-blue-400 shrink-0" />
                        <span className="truncate">المدة: <span className="font-bold text-white">{course.duration}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <MonitorPlay size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">مهام: <span className="font-bold text-white">{course.tasksCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <HelpCircle size={14} className="text-purple-400 shrink-0" />
                        <span className="truncate">كويزات: <span className="font-bold text-white">{course.quizzesCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <FileText size={14} className="text-pink-400 shrink-0" />
                        <span className="truncate">ملخصات: <span className="font-bold text-white">{course.summariesCount}</span></span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative">
                    <div className="flex flex-col">
                      {course.offerPrice ? (
                          <div className="flex flex-col leading-tight">
                              <span className="text-lg font-black text-blue-400">ل.س{(course.offerPrice || 0).toLocaleString()}</span>
                              <span className="text-[10px] text-gray-500 line-through">ل.س{(course.price || 0).toLocaleString()}</span>
                              {course.offerEndsAt && (
                                  <span className="text-[9px] text-orange-400 font-bold flex items-center gap-1 mt-1 bg-orange-400/10 px-2 py-0.5 rounded-full w-fit">
                                      <TimerReset size={10} /> ينتهي العرض: {formatDate(course.offerEndsAt)}
                                  </span>
                              )}
                          </div>
                      ) : (
                          <span className="text-lg font-black text-blue-400">ل.س{(course.price || 0).toLocaleString()}</span>
                      )}
                    </div>
                    
                    <Link href={`/courses/${course.id}`}>
                      <button className="px-4 py-2 bg-blue-600 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1 shrink-0 shadow-md">
                        التفاصيل <ArrowLeft size={14} />
                      </button>
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {courses.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mt-10">
                <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد مواد أكاديمية متاحة حالياً.</p>
            </div>
        )}

      </div>
    </div>
  );
}