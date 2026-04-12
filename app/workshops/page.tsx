import { API_ROUTES } from "@/config/api";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, Wrench, Layers, CheckCircle, TimerReset, AlertTriangle } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white.png?text=Workshop";

// =========================================
// 🌟 دالة جلب البيانات من السيرفر (Server-Side)
// =========================================
async function fetchWorkshops() {
  try {
    // ميزة ISR: تخزين البيانات وتحديثها خلف الكواليس كل 60 ثانية
    const res = await fetch(API_ROUTES.WORKSHOPS, { next: { revalidate: 60 } });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("فشل جلب الورشات:", error);
    return null;
  }
}

// دالة تنسيق التاريخ
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

// =========================================
// 🚀 المكون الرئيسي للصفحة (Server Component)
// =========================================
export default async function AllWorkshopsPage() {
  // جلب البيانات قبل إرسال الصفحة للمتصفح
  const workshops = await fetchWorkshops();

  // معالجة حالة الخطأ بأمان
  if (!workshops) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <AlertTriangle size={50} className="text-red-500" />
        <h2 className="text-xl font-bold">عذراً، حدث خطأ أثناء جلب ورشات العمل</h2>
        <p className="text-gray-400">يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4 flex justify-center items-center gap-3">
             <Wrench className="text-emerald-500 w-10 h-10" /> استكشف ورشات العمل 🚀
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ورشات عملية مكثفة لتطوير مهاراتك التقنية وربطها بسوق العمل.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workshops.map((workshop: any, index: number) => (
            <div key={workshop.id} className="group bg-[#1e293b] md:bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all md:hover:shadow-xl md:hover:-translate-y-1 flex flex-col h-full relative">
              
              <div className="w-full h-48 relative overflow-hidden bg-slate-800">
                <Image 
                  unoptimized
                  priority={index < 4} // 🔥 أولوية قصوى لتحميل أول 4 صور
                  src={getImageUrl(workshop.imageUrl, 'workshop', 600) || FALLBACK_IMAGE} 
                  alt={workshop.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover md:group-hover:scale-110 transition-transform duration-700" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                {workshop.isPlatformSponsored && workshop.stampUrl && (
                    <div className="absolute top-3 left-3 w-10 h-10 bg-[#0f172a]/90 md:bg-white/10 md:backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-1 shadow-lg z-10 md:group-hover:scale-110 transition-transform" title="ورشة رسمية">
                        <Image 
                          unoptimized
                          src={getImageUrl(workshop.stampUrl) || FALLBACK_IMAGE} 
                          alt="Stamp" 
                          fill
                          sizes="40px"
                          className="object-contain p-1" 
                        />
                    </div>
                )}

                <div className="absolute top-3 right-3 bg-black/80 md:bg-black/70 md:backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/20 flex items-center gap-1">
                   <Calendar size={14} className="text-purple-400 shrink-0" />
                   <span className="truncate">يبدأ: {formatDate(workshop.startDate)}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors line-clamp-1" title={workshop.title}>
                    {workshop.title}
                    </h3>
                </div>

                <p 
                  className="text-gray-400 text-xs mb-4 leading-relaxed line-clamp-2 font-medium"
                  title={workshop.description}
                >
                    {workshop.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-gray-300 mb-4 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 md:gap-2 col-span-2">
                        <Clock size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">مدة الورشة: <span className="font-bold text-white">{workshop.duration}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Layers size={14} className="text-blue-400 shrink-0" />
                        <span className="truncate">جلسات: <span className="font-bold text-white">{workshop.sessionsCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <CheckCircle size={14} className="text-purple-400 shrink-0" />
                        <span className="truncate">مهام: <span className="font-bold text-white">{workshop.tasksCount}</span></span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative">
                   
                   <div className="flex flex-col">
                      {workshop.offerPrice ? (
                          <div className="flex flex-col leading-tight">
                                <span className="text-lg font-black text-emerald-400">ل.س{(workshop.offerPrice || 0).toLocaleString()}</span>
                                <span className="text-[10px] text-gray-500 line-through">ل.س{(workshop.price || 0).toLocaleString()}</span>
                                {workshop.offerEndsAt && formatDate(workshop.offerEndsAt) && (
                                    <span className="text-[9px] text-orange-400 font-bold flex items-center gap-1 mt-1 bg-orange-400/10 px-2 py-0.5 rounded-full w-fit">
                                        <TimerReset size={10} /> ينتهي: {formatDate(workshop.offerEndsAt)}
                                    </span>
                                )}
                          </div>
                      ) : (
                          <span className="text-lg font-black text-emerald-400">
                            {workshop.price === 0 ? "مجاني" : `ل.س${(workshop.price || 0).toLocaleString()}`}
                          </span>
                      )}
                   </div>
                   
                   <Link href={`/workshops/${workshop.id}`}>
                     <button className="flex items-center gap-1 px-4 py-2 bg-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all md:hover:scale-105 active:scale-95 shrink-0 shadow-md">
                       التفاصيل <ArrowLeft size={14} />
                     </button>
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {workshops.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mt-10">
                <Wrench size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد ورشات عمل متاحة حالياً.</p>
            </div>
        )}

      </div>
    </div>
  );
}