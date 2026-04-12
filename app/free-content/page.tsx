"use client";
import { useState, useEffect } from "react";
import { API_ROUTES } from "@/config/api";
import Link from "next/link";
import { Gift, PlayCircle, Loader2, HelpCircle, User, ArrowRight, Star, AlertTriangle } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";
const ReadOnlyRating = ({ averageRating = 0, reviewsCount = 0 }: { averageRating?: number, reviewsCount?: number }) => {
  const displayValue = Math.round(averageRating);

  return (
    <div className="flex items-center gap-2 mt-1 mb-4">
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            <Star 
              size={14} 
              className={
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" 
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

export default function AllFreeContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 

  useEffect(() => {
    fetch(API_ROUTES.FREE_CONTENT)
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل الاتصال بالسيرفر");
        return res.json();
      })
      .then((data) => {
        setContents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true); 
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin" size={40} /></div>;

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col gap-4 items-center justify-center text-white">
      <AlertTriangle size={50} className="text-red-500" />
      <h2 className="text-xl font-bold">عذراً، حدث خطأ أثناء جلب المحتوى</h2>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-amber-600 rounded-xl hover:bg-amber-700 font-bold transition-all">إعادة المحاولة</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 flex justify-center items-center gap-3">
             <Gift className="text-amber-500 w-12 h-12" /> المكتبة المجانية
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            مجموعة مختارة من الدروس والكويزات المجانية لدعم مسيرتك التعليمية.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {contents.map((item) => (
            <div key={item.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col">
              
              <div className="w-full aspect-video relative overflow-hidden bg-slate-900">
                <img 
                  src={getImageUrl(item.imageUrl, 'course')||""} 
                  alt={item.title} 
                  loading="lazy" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-bold text-white border border-white/20 shadow-lg flex items-center gap-2">
                   <PlayCircle size={16} className="text-amber-400" />
                   {item.sessionsCount} جلسة
                </div>

                {item.isPlatformSponsored && item.stampUrl && (
                  <div className="absolute top-6 left-6 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform" title="محتوى مميز">
                      <img 
                        src={getImageUrl(item.stampUrl)||""} 
                        alt="Stamp" 
                        loading="lazy" 
                        className="w-full h-full object-contain drop-shadow-md"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex flex-col items-start mb-2">
                    <h3 className="text-3xl font-bold leading-tight group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                </div>

                <ReadOnlyRating 
                  averageRating={item.averageRating || 0} 
                  reviewsCount={item.reviewsCount || 0} 
                />

                <p className="text-gray-400 text-base mb-6 line-clamp-3 leading-relaxed">
                    {item.description || "استمتع بمشاهدة هذا المحتوى التعليمي المجاني المقدم من نخبة المدربين."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   
                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="bg-amber-500/10 p-2 rounded-full">
                        <User size={18} className="text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400">المدرب</span>
                        <span className="text-xs font-bold text-white line-clamp-1">{item.instructorName}</span>
                      </div>
                   </div>

                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-full">
                        <HelpCircle size={18} className="text-purple-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400">اختبارات</span>
                        <span className="text-xs font-bold text-white">{item.quizzesCount || 0} كويز</span>
                      </div>
                   </div>

                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                   <Link href={`/free-content/${item.id}`}>
                     <button className="w-full py-4 bg-amber-600 rounded-2xl font-bold text-base hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                       ابدأ التعلم الآن <ArrowRight size={20} />
                     </button>
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {contents.length === 0 && !loading && !error && (
            <div className="text-center py-20">
                <p className="text-gray-500 text-xl">لا يوجد محتوى مجاني حالياً. 🎁</p>
            </div>
        )}

      </div>
    </div>
  );
}