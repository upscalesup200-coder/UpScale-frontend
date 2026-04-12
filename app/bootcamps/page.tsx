import { API_ROUTES } from "@/config/api";
import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, ArrowLeft, Layers, Zap, TimerReset, AlertTriangle } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white.png?text=Bootcamp";


async function fetchBootcamps() {
  try {
    const res = await fetch(API_ROUTES.BOOTCAMPS, { next: { revalidate: 60 } });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("فشل في جلب المعسكرات:", error);
    return null;
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; 
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default async function AllBootcampsPage() {
  const bootcamps = await fetchBootcamps();

  if (!bootcamps) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
        <AlertTriangle size={50} className="text-red-500" />
        <h2 className="text-xl font-bold">عذراً، حدث خطأ أثناء جلب المعسكرات</h2>
        <p className="text-gray-400">يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4 flex justify-center items-center gap-3">
             <Flame className="text-pink-500 w-10 h-10" /> المعسكرات التدريبية
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            تعلم مهارات سوق العمل في معسكرات مكثفة ومختصرة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bootcamps.map((camp: any, index: number) => (
            <div 
              key={camp.id} 
              className="group bg-[#1e293b] md:bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all duration-300 flex flex-col md:hover:shadow-xl md:hover:-translate-y-1 relative"
            >
              
              <div className="w-full h-48 relative overflow-hidden bg-slate-800 flex items-center justify-center">
                <Image 
                  unoptimized
                  priority={index < 4}
                  src={getImageUrl(camp.imageUrl, 'bootcamp', 600) || FALLBACK_IMAGE} 
                  alt={camp.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover md:group-hover:scale-110 transition-transform duration-500" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute top-3 right-3 bg-black/80 md:bg-black/60 md:backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                   {camp.sessionsCount || 0} جلسة 🎯
                </div>

                {camp.isPlatformSponsored && camp.stampUrl && (
                  <div className="absolute top-3 left-3 w-10 h-10 bg-[#0f172a]/90 md:bg-white/10 md:backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-1 shadow-lg md:group-hover:scale-110 transition-transform" title="معسكر رسمي">
                      <Image 
                        unoptimized
                        src={getImageUrl(camp.stampUrl) || FALLBACK_IMAGE} 
                        alt="Stamp" 
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-pink-400 transition-colors line-clamp-1" title={camp.title}>
                      {camp.title}
                    </h3>
                </div>

                <p 
                    className="text-gray-400 text-xs mb-4 leading-relaxed line-clamp-2 font-medium"
                    title={camp.description}
                >
                  {camp.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-gray-300 mb-4 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 md:gap-2 col-span-2">
                        <Clock size={14} className="text-blue-400 shrink-0" />
                        <span className="truncate">مدة المعسكر: <span className="font-bold text-white">{camp.duration || "غير محدد"}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Layers size={14} className="text-pink-400 shrink-0" />
                        <span className="truncate">جلسات: <span className="font-bold text-white">{camp.sessionsCount || 0}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Zap size={14} className="text-yellow-400 shrink-0" />
                        <span className="truncate">مشاريع: <span className="font-bold text-white">{camp.tasksCount || 0}</span></span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative">
                   
                   <div className="flex flex-col">
                      {camp.offerPrice ? (
                        <div className="flex flex-col leading-tight">
                          <span className="text-lg font-black text-pink-500">ل.س{(camp.offerPrice || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-500 line-through">ل.س{(camp.price || 0).toLocaleString()}</span>
                          {camp.offerEndsAt && formatDate(camp.offerEndsAt) && (
                              <span className="text-[9px] text-orange-400 font-bold flex items-center gap-1 mt-1 bg-orange-400/10 px-2 py-0.5 rounded-full w-fit">
                                  <TimerReset size={10} /> ينتهي: {formatDate(camp.offerEndsAt)}
                              </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-lg font-black text-pink-500">
                          {camp.price === 0 ? "مجاني" : `ل.س${(camp.price || 0).toLocaleString()}`}
                        </span>
                      )}
                   </div>
                   
                   <Link href={`/bootcamps/${camp.id}`}>
                      <button className="px-4 py-2 bg-pink-600 rounded-xl font-bold text-xs hover:bg-pink-700 transition-all flex items-center gap-1 shrink-0 shadow-md">
                        التفاصيل <ArrowLeft size={14} />
                      </button>
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {bootcamps.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mt-10">
                <Flame size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد معسكرات متاحة حالياً.</p>
            </div>
        )}

      </div>
    </div>
  );
}