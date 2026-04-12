"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";
import { toast, Toaster } from "react-hot-toast";
import { 
  Loader2, ArrowRight, BookOpen, Layers, Zap, 
  Linkedin, Github, Quote, ShieldCheck,
  Award, Briefcase, GraduationCap, PlayCircle, FileText, 
  Star, CheckCircle, MessageSquare, X, Send, UserCircle, Trash2
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; 
const InstructorRating = ({ rating = 0, count = 0, onOpenReviews }: { rating?: number, count?: number, onOpenReviews: () => void }) => {
  const displayRating = count > 0 ? Number(rating).toFixed(1) : "0.0";
  const roundedRating = Math.round(Number(displayRating));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-fit backdrop-blur-md">
        <div className="flex items-center gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={16} 
              className={star <= roundedRating && count > 0 ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-600"} 
            />
          ))}
        </div>
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <span className="text-white font-black text-lg">{displayRating}</span>
        </div>
      </div>
      
      <button 
        onClick={onOpenReviews}
        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/20"
        title="عرض آراء الطلاب"
        aria-label="عرض آراء الطلاب"
      >
        <MessageSquare size={18} /> آراء الطلاب ({count})
      </button>
    </div>
  );
};

const ContentCard = ({ item, type }: { item: any, type: 'course' | 'workshop' | 'bootcamp' }) => {
  const config = {
    course: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500", border: "group-hover:border-blue-500/50", label: "مادة أكاديمية", link: `/courses/${item.id}` },
    workshop: { icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500", border: "group-hover:border-emerald-500/50", label: "ورشة عمل", link: `/workshops/${item.id}` },
    bootcamp: { icon: Zap, color: "text-pink-400", bg: "bg-pink-500", border: "group-hover:border-pink-500/50", label: "معسكر تدريبي", link: `/bootcamps/${item.id}` },
  }[type];

  const Icon = config.icon;

  return (
    <Link href={config.link} className="block h-full" title={`عرض تفاصيل ${item.title}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className={`bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-2 rounded-[2rem] transition-all duration-300 group shadow-lg hover:shadow-2xl h-full flex flex-col relative overflow-hidden ${config.border}`}
      >
        <div className={`absolute -inset-10 bg-gradient-to-tr from-${config.bg}/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none`} />
        
        <div className="h-44 w-full relative overflow-hidden rounded-[1.5rem] border border-white/5">
          <img 
            src={getImageUrl(item.imageUrl, 'course')||""} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100" 
            alt={item.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
          
          <div className={`absolute top-3 right-3 ${config.bg}/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-black flex items-center gap-1.5 shadow-lg border border-white/20`}>
            <Icon size={12} className="text-white" /> {config.label}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1 relative z-10">
          <h4 className="text-base font-black text-slate-100 group-hover:text-white transition-colors line-clamp-2 mb-2 leading-relaxed">
            {item.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1 font-medium leading-loose">
            {item.description || "انضم الآن لاكتساب مهارات جديدة وتطوير مستواك مع نخبة الخبراء في هذه الدورة."}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
             <span className={`text-xs font-black ${config.color} flex items-center gap-1.5 group-hover:gap-2 transition-all bg-white/5 px-3 py-1.5 rounded-lg`}>
               التفاصيل <ArrowRight size={14} />
             </span>
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-inner">
                <PlayCircle size={16} className="text-slate-300" />
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function InstructorCvPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState(false); 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const fetchInstructorData = () => {
    if (!params.id) return;
    fetch(`${API_BASE_URL}/api/users/instructor-cv/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setInstructor(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

useEffect(() => {
  if (user) {
    setIsLoggedIn(true);
    setCurrentUserId(user.id || (user as any).userId);
    if (user.role === 'ADMIN') setIsAdmin(true);
  } else {
    setIsLoggedIn(false);
    setIsAdmin(false);
  }
  fetchInstructorData();
}, [params.id, user]); 

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/instructor/${params.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        
        if (currentUserId) {
          const alreadyRated = data.some((r: any) => r.userId === currentUserId);
          setHasRated(alreadyRated);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب التقييمات", error);
    } finally {
      setLoadingReviews(false);
    }
  };

const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingValue === 0) {
      toast.error("يرجى تحديد عدد النجوم للتقييم");
      return;
    }

    if (!isLoggedIn) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("جاري إرسال التقييم...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          targetId: params.id,
          targetType: 'INSTRUCTOR',
          value: ratingValue,
          comment: comment 
        })
      });

      if (res.ok) {
        const resultData = await res.json(); 
        
        toast.success("تم إرسال تقييمك بنجاح! شكراً لك", { id: loadingToast });
        setRatingValue(0);
        setComment("");
        setHasRated(true); 
        
        if (resultData && resultData.averageRating !== undefined) {
           setInstructor((prev: any) => ({
             ...prev,
             averageRating: resultData.averageRating,
             reviewsCount: resultData.reviewsCount
           }));
        }

        fetchReviews(); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "لقد قمت بتقييم هذا المدرب مسبقاً", { id: loadingToast });
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟")) return;

    const token = localStorage.getItem("token");
    const deleteToast = toast.loading("جاري الحذف...");

    try {
const res = await fetch(`${API_BASE_URL}/api/users/rate/${reviewId}`, {
  method: 'DELETE',
  credentials: "include" 
});

      if (res.ok) {
        toast.success("تم حذف التقييم بنجاح", { id: deleteToast });
        setReviews(prev => prev.filter(r => r.id !== reviewId)); 
        fetchInstructorData(); 
      } else {
        const err = await res.json();
        toast.error(err.message || "حدث خطأ أثناء الحذف", { id: deleteToast });
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال", { id: deleteToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-medium animate-pulse">جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }

  if (!instructor || instructor.statusCode === 404) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-6">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
           <ShieldCheck size={40} className="text-slate-500" />
        </div>
        <h2 className="text-3xl font-black">عذراً، المدرب غير موجود</h2>
        <p className="text-slate-400">يبدو أن الرابط غير صحيح أو تم إزالة حساب المدرب.</p>
        <button 
          onClick={() => router.back()} 
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mt-4"
          title="العودة للصفحة السابقة"
          aria-label="العودة للصفحة السابقة"
        >
           <ArrowRight size={18} /> العودة للصفحة السابقة
        </button>
      </div>
    );
  }

  const coursesCount = instructor.courses?.length || 0;
  const workshopsCount = instructor.workshops?.length || 0;
  const bootcampsCount = instructor.bootcamps?.length || 0;
  const hasContent = coursesCount > 0 || workshopsCount > 0 || bootcampsCount > 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30 font-sans pb-20" dir="rtl">
      
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="h-64 md:h-[22rem] w-full relative overflow-hidden bg-slate-900 border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-slate-900/50 to-[#0f172a]" />
        
        <div className="absolute top-28 left-0 w-full px-6 md:px-12 z-20 flex justify-between items-center">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 bg-[#0f172a]/50 hover:bg-[#0f172a] backdrop-blur-md px-5 py-2.5 rounded-full text-slate-300 hover:text-white font-bold text-sm transition-all border border-white/10 shadow-lg"
            title="العودة للرئيسية"
            aria-label="العودة للرئيسية"
          >
            <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" /> العودة للرئيسية
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 -mt-24 md:-mt-32">
        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-right"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-[2rem] md:rounded-[2.5rem] border-8 border-[#0f172a] shadow-2xl overflow-hidden bg-slate-800 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500 relative z-10">
              <img 
                src={getImageUrl(instructor.avatar, 'avatar')||""} 
                alt={instructor.firstName} 
                loading="lazy"
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}&background=0D8ABC&color=fff&size=256` }}
              />
            </div>
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full z-0 group-hover:bg-blue-500/40 transition-colors" />
            
            {instructor.isElite && (
              <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-2 md:p-3 rounded-2xl shadow-xl shadow-orange-500/20 border-4 border-[#0f172a] z-20" title="مدرب من النخبة">
                <Award size={28} className="animate-pulse" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 pb-2 md:pb-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black mb-4 shadow-sm">
               <CheckCircle size={14} /> حساب موثق
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
              {instructor.firstName} {instructor.lastName}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-slate-300 font-bold text-lg md:text-xl mb-6 flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={20} className="text-blue-500" /> {instructor.specialization || "مدرب تقني وأكاديمي"}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-start">
              
              <InstructorRating 
                rating={instructor.averageRating || 0} 
                count={instructor.reviewsCount || 0} 
                onOpenReviews={() => {
                  fetchReviews();
                  setShowReviewsModal(true);
                }} 
              />

              <div className="flex flex-wrap justify-center gap-3">
                {instructor.linkedin && (
                  <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all font-bold text-sm border border-[#0077b5]/20 hover:shadow-lg hover:shadow-[#0077b5]/20" aria-label="رابط لينكد إن">
                    <Linkedin size={18} /> LinkedIn
                  </a>
                )}
                {instructor.github && (
                  <a href={instructor.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-white hover:text-black transition-all font-bold text-sm border border-slate-700 hover:shadow-lg hover:shadow-white/10" aria-label="رابط غيت هاب">
                    <Github size={18} /> GitHub
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {instructor.bio && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a] backdrop-blur-xl border border-slate-700/50 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
                <Quote className="absolute top-8 left-8 text-white/5 w-16 h-16 rotate-180 pointer-events-none" />
                
                <h3 className="text-2xl font-black mb-6 text-white flex items-center gap-3">
                   <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-500/30"><FileText className="text-blue-400" size={24}/></div>
                   النبذة التعريفية (CV)
                </h3>
                <p className="text-slate-300 leading-loose whitespace-pre-wrap relative z-10 text-base md:text-lg font-medium">
                  {instructor.bio}
                </p>
              </motion.div>
            )}

            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
               className="grid grid-cols-3 gap-4 md:gap-6"
            >
              {[
                { label: "المواد", count: coursesCount, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "الورشات", count: workshopsCount, icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "المعسكرات", count: bootcampsCount, icon: Zap, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
              ].map((stat, i) => (
                <div key={i} className={`bg-[#1e293b]/50 border ${stat.border} rounded-3xl p-6 text-center flex flex-col items-center justify-center hover:bg-[#1e293b] transition-all hover:-translate-y-1 shadow-lg`}>
                   <div className={`w-14 h-14 rounded-[1.2rem] ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-inner border border-white/5`}>
                     <stat.icon size={28} />
                   </div>
                   <h4 className="text-3xl font-black text-white">{stat.count}</h4>
                   <p className="text-sm text-slate-400 font-bold mt-2">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
               className="sticky top-24 bg-[#1e293b]/30 border border-slate-700/50 p-6 rounded-[2.5rem] shadow-xl backdrop-blur-sm"
            >
               <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                 <div className="p-2.5 bg-purple-500/20 rounded-2xl border border-purple-500/30"><GraduationCap className="text-purple-400" size={24}/></div>
                 المسارات التي يدرسها
               </h3>

               {!hasContent ? (
                 <div className="text-center py-16 px-6 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                      <BookOpen size={24} className="text-slate-500" />
                   </div>
                   <p className="text-slate-400 text-sm leading-relaxed font-bold">لم يقم المدرب بإضافة أي مسارات تدريبية حتى الآن.</p>
                 </div>
               ) : (
                 <div className="relative">
                   <div className="space-y-5 max-h-[600px] overflow-y-auto pr-4 pb-4
                                  [&::-webkit-scrollbar]:w-2.5 
                                  [&::-webkit-scrollbar-track]:bg-slate-900/50 
                                  [&::-webkit-scrollbar-track]:rounded-full 
                                  [&::-webkit-scrollbar-thumb]:bg-blue-500/50 
                                  [&::-webkit-scrollbar-thumb]:rounded-full 
                                  [&::-webkit-scrollbar-thumb]:border-2 
                                  [&::-webkit-scrollbar-thumb]:border-slate-900
                                  hover:[&::-webkit-scrollbar-thumb]:bg-blue-400 
                                  transition-all"
                   >
                     {instructor.courses?.slice(0, 20).map((c: any) => <div key={c.id} className="min-h-[280px] shrink-0"><ContentCard item={c} type="course" /></div>)}
                     {instructor.workshops?.slice(0, 20).map((w: any) => <div key={w.id} className="min-h-[280px] shrink-0"><ContentCard item={w} type="workshop" /></div>)}
                     {instructor.bootcamps?.slice(0, 20).map((b: any) => <div key={b.id} className="min-h-[280px] shrink-0"><ContentCard item={b} type="bootcamp" /></div>)}
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#1e293b]/90 to-transparent pointer-events-none rounded-b-3xl" />
                 </div>
               )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-24 border-t border-slate-800/50">
      </div>

      <AnimatePresence>
        {showReviewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md"
              onClick={() => setShowReviewsModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#1e293b] border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]"
            >
              <button 
                onClick={() => setShowReviewsModal(false)} 
                className="absolute top-4 right-4 z-20 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 p-2 rounded-full transition-colors backdrop-blur-sm"
                title="إغلاق النافذة"
                aria-label="إغلاق النافذة"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-5/12 bg-slate-900/50 p-8 border-b md:border-b-0 md:border-l border-white/10 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" /> إضافة تقييمك
                </h3>
                
                {isLoggedIn ? (
                  hasRated ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center shadow-inner relative z-10 flex flex-col items-center justify-center mt-4">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-emerald-400" />
                      </div>
                      <p className="text-lg text-emerald-300 font-bold mb-2">شكراً لتقييمك!</p>
                      <p className="text-sm text-slate-400 leading-relaxed">لقد قمت بإضافة رأيك وتقييمك لهذا المدرب مسبقاً، لا يمكنك التقييم مرة أخرى.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-400 text-sm mb-8 leading-relaxed">رأيك يهمنا ويساعد زملاءك الطلاب في اتخاذ القرار الصحيح.</p>
                      <form onSubmit={submitReview} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-300">ما هو تقييمك للمدرب؟</label>
                          <div className="flex items-center gap-2" dir="ltr">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={32}
                                onClick={() => setRatingValue(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className={`cursor-pointer transition-all hover:scale-110 ${star <= (hoverRating || ratingValue) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-600'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-300">اكتب تعليقك (اختياري)</label>
                          <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="كيف كانت تجربتك مع هذا المدرب..."
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-32 custom-scrollbar transition-all"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSubmitting || ratingValue === 0}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                          title="نشر التقييم"
                          aria-label="نشر التقييم"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                          {isSubmitting ? "جاري الإرسال..." : "نشر التقييم"}
                        </button>
                      </form>
                    </>
                  )
                ) : (
                  <div className="bg-[#0f172a]/80 border border-white/5 rounded-2xl p-6 text-center shadow-inner relative z-10 mt-4">
                    <UserCircle size={40} className="mx-auto text-slate-500 mb-3" />
                    <p className="text-sm text-slate-300 mb-4 font-bold">يجب عليك تسجيل الدخول لتتمكن من إضافة تقييم.</p>
                    <Link href="/login">
                      <button 
                        className="px-6 py-2.5 bg-white text-black font-black rounded-xl text-sm hover:bg-gray-200 transition-colors w-full"
                        title="تسجيل الدخول"
                        aria-label="تسجيل الدخول"
                      >
                        تسجيل الدخول
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="w-full md:w-7/12 p-8 flex flex-col h-full bg-[#1e293b]">
                <h3 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <MessageSquare className="text-blue-400" /> آراء زملائك ({reviews.length})
                </h3>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                  {loadingReviews ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="font-bold text-sm">جاري جلب الآراء...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#0f172a]/50 rounded-3xl border border-dashed border-white/5 p-6">
                      <MessageSquare size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">لا يوجد تقييمات حتى الآن.</p>
                      <p className="text-xs mt-1">كن أول من يشارك رأيه!</p>
                    </div>
                  ) : (
                    reviews.map((rev: any, idx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                        key={rev.id || idx} 
                        className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col gap-3 relative group"
                      >
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="absolute top-4 left-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            title="حذف هذا التقييم"
                            aria-label="حذف هذا التقييم"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <div className="flex justify-between items-start pr-8 lg:pr-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black shadow-md border border-white/10">
                              {rev.userName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-white">{rev.userName || "طالب"}</h5>
                              <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 mt-1" dir="ltr">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={12} className={star <= rev.value ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
                            ))}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                            "{rev.comment}"
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}