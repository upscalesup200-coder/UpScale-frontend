"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_ROUTES } from '@/config/api';
import { 
  PlayCircle, HelpCircle, User, Gift, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';
import InteractiveRating from '@/components/InteractiveRating';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 
import toast, { Toaster } from 'react-hot-toast'; 

export default function FreeContentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); 

  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState(false); 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(API_ROUTES.FREE_CONTENT_DETAILS(id as string))
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل جلب تفاصيل المحتوى");
        return res.json();
      })
      .then(data => {
        setContent(data);
        setError(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true); 
      });
  }, [id]);

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="p-6 bg-red-500/10 rounded-full text-red-500">
            <AlertTriangle size={48} />
        </div>
        <p className="font-bold text-lg md:text-xl text-gray-300">عذراً، هذا المحتوى غير متوفر أو تم إزالته.</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold transition-all">
            العودة للخلف
        </button>
    </div>
  );

  if (!content) return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse font-bold text-amber-400">جاري تحضير الهدية... 🎁</p>
    </div>
  );

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-amber-500/30 pb-20 relative" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/10 flex justify-between items-center z-40 lg:hidden">
         {isLoggedIn ? (
            <Link href={`/free-content/${content.id}/learn`} className="w-full">
              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-95 transition-transform">
                <PlayCircle size={20} fill="black" className="text-black" /> ابدأ المشاهدة فوراً
              </button>
            </Link>
         ) : (
            <Link href="/login" className="w-full">
              <button className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-colors">
                 <User size={20} className="text-black" /> سجل الدخول للمشاهدة
              </button>
            </Link>
         )}
      </div>

      <div className="w-full relative bg-[#0a0f1a] overflow-hidden shadow-2xl border-b border-white/5">
          <div className="absolute inset-0 z-0">
             <img 
               src={getImageUrl(content.imageUrl, 'course')||""} 
               alt="" 
               className="w-full h-full object-cover blur-3xl opacity-40 scale-110" 
             />
          </div>
          
          <div className="container mx-auto px-4 pt-24 pb-8 relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:min-h-[450px]">
             
             <div className="w-full lg:w-2/3 flex flex-col justify-end space-y-4 pt-8 lg:pt-32 relative z-50 text-center lg:text-right items-center lg:items-start">
                 <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs md:text-sm font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg w-fit">
                     <Gift size={14} className="md:w-4 md:h-4" /> محتوى مجاني 100%
                 </span>
                 
                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-2xl">
                     {content.title}
                 </h1>
                 
                 <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-4 text-gray-200 font-medium text-xs md:text-sm pt-2">
                     <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                         <PlayCircle size={16} className="text-amber-400" /> {content.sessionsCount || 0} درس فيديو
                     </div>
                     <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                         <HelpCircle size={16} className="text-purple-400" /> {content.quizzesCount || 0} كويز
                     </div>
                     
                     <div 
                         className="flex items-center gap-2 bg-black/60 px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg relative z-[100] pointer-events-auto cursor-pointer hover:bg-black/80 transition-colors"
                         onClick={(e) => {
                             if (!user) {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 toast.error("يجب تسجيل الدخول لإضافة تقييم");
                                 router.push('/login');
                             }
                         }}
                     >
                         <InteractiveRating 
                            itemId={content.id} 
                            itemType="FREE_CONTENT" 
                            initialRating={content.averageRating || 0} 
                            totalReviews={content.reviewsCount || 0} 
                            userRating={content.userRating}
                            size={16}
                            isEnrolled={isLoggedIn} 
                         />
                     </div>
                 </div>
             </div>

             <div className="w-full lg:w-1/3 flex justify-center lg:justify-end relative mt-8 lg:mt-0 pb-8 lg:pb-0">
                 <div className="relative w-full max-w-[350px] lg:max-w-none group perspective-1000">
                     <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-yellow-500 rounded-3xl rotate-3 opacity-30 group-hover:rotate-1 transition-all duration-500 blur-xl"></div>
                     <img 
                         loading="lazy"
                         src={getImageUrl(content.imageUrl, 'course')|| ""} 
                         alt={content.title} 
                         className="relative w-full rounded-3xl shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500 object-cover aspect-video z-10" 
                         onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                     />
                 </div>
             </div>
          </div>
          <div className="absolute inset-0 z-[5] bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 lg:via-[#0f172a]/40 to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-10 md:space-y-12 order-2 lg:order-1">
                
                <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
                        حول هذا المحتوى
                    </h2>
                    <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 leading-relaxed text-gray-300 text-base md:text-lg whitespace-pre-wrap shadow-lg">
                        {content.description}
                    </div>
                </section>

                {content.learningOutcomes && (
                <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                        ماذا ستتعلم في هذا المحتوى؟
                    </h2>
                    <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {content.learningOutcomes.split('\n').filter((item: string) => item.trim() !== '').map((outcome: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm md:text-base">
                                    <CheckCircle2 className="text-blue-400 mt-1 shrink-0" size={18} />
                                    <span className="leading-relaxed">{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                )}

                {content.instructorBio && (
                <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                        نبذة عن المدرب
                    </h2>
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-right">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30 overflow-hidden">
                            <User size={32} className="md:w-9 md:h-9" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{content.instructorName}</h3>
                            <p className="text-sm md:text-base text-gray-400 leading-relaxed whitespace-pre-wrap">{content.instructorBio}</p>
                        </div>
                    </div>
                </section>
                )}

            </div>

            <div className="lg:col-span-1 order-1 lg:order-2 mb-8 lg:mb-0 hidden lg:block">
                <div className="sticky top-28 space-y-6">
                    
                    <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"></div>
                        
                        <div className="mb-8 pt-2">
                             <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                 <Gift size={36} className="text-amber-500" />
                             </div>
                             <h3 className="text-3xl font-black text-white">متاح مجاناً!</h3>
                             <p className="text-gray-400 text-sm mt-3 font-medium">محتوى حصري متوفر للجميع بدون أي رسوم.</p>
                        </div>

                        {isLoggedIn ? (
                            <Link href={`/free-content/${content.id}/learn`}>
                                <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl font-black text-lg shadow-lg hover:from-amber-400 hover:to-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-6">
                                    <PlayCircle size={22} fill="black" className="text-black" /> ابدأ المشاهدة فوراً
                                </button>
                            </Link>
                        ) : (
                            <div className="space-y-3 mb-6">
                                <Link href="/login" className="flex w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-black text-lg shadow-lg hover:scale-[1.02] transition-all items-center justify-center gap-2">
                                    <User size={22} /> سجل الدخول للمشاهدة
                                </Link>
                                <p className="text-xs text-gray-400">لا تملك حساباً؟ <Link href="/signup" className="text-blue-400 hover:underline font-bold">سجل مجاناً الآن</Link></p>
                            </div>
                        )}
                        
                        <div className="bg-white/5 rounded-xl p-4 text-xs text-gray-400 flex flex-col gap-2 text-right">
                            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> وصول فوري لجميع الدروس.</span>
                            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> تقييمات واختبارات مرفقة.</span>
                            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> المشاهدة من أي جهاز.</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-4 hover:border-white/20 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
                             <User size={26} />
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">المدرب</p>
                            <p className="text-lg font-bold text-white line-clamp-1">{content.instructorName}</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
}