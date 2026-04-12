"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image"; 
import { API_BASE_URL } from '@/config/api';
import {
  CheckCircle, Clock, Calendar, HelpCircle, ShieldCheck,
  BookOpen, Globe, Award, Star, User, Loader2, PlayCircle, X, 
  MessageCircle, Send, Wallet, UploadCloud, FileImage, Video, FileText, CheckSquare, FileEdit, Target, IdCard
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';
import InteractiveRating from '@/components/InteractiveRating';
import { useAuth } from '@/context/AuthContext'; 
import toast, { Toaster } from 'react-hot-toast';

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white?text=UpScale";

export default function CourseClient({ course, id }: { course: any, id: string }) {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useAuth(); 
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isPreparingToBuy, setIsPreparingToBuy] = useState(false);

  const [showRechargeForm, setShowRechargeForm] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [transferMethod, setTransferMethod] = useState("الهرم");
  const [rechargeAmount, setRechargeAmount] = useState<number | "">("");
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!course) return;

    const isAdmin = user?.role === 'ADMIN';
    const userEmail = user?.email?.toLowerCase()?.trim();
    const isOwner = user?.role === 'TEACHER' && (
        course.instructors?.some((inst: any) => inst.email?.toLowerCase()?.trim() === userEmail) ||
        course.instructorName === user?.username ||
        course.instructorName === `${user?.firstName} ${user?.lastName}`
    );

    const isEnrolledStudent = (user as any)?.enrollments?.some((e: any) => e.itemId === id || e.courseId === id);
    const hasBackendAccess = course.hasAccess === true;

    if (hasBackendAccess || isAdmin || isOwner || isEnrolledStudent) {
        setIsEnrolled(true);
    } else {
        setIsEnrolled(false);
    }
  }, [course, user, id]);

  useEffect(() => {
      if (showRechargeForm && !settings) {
          fetch(`${API_BASE_URL}/api/public/settings`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { if(data) setSettings(data); })
            .catch(err => console.error("Failed to fetch settings", err));
      }
  }, [showRechargeForm, settings]);

  const handleOpenEnrollModal = async () => {
      if (!user) {
          toast.error("يجب تسجيل الدخول لإتمام عملية الشراء");
          router.push('/login');
          return;
      }
      
      setIsPreparingToBuy(true);
      await refreshUser(); 
      setIsPreparingToBuy(false);
      
      setShowEnrollModal(true);
      setShowRechargeForm(false);
  };

  const handleBuyCourse = async () => {
    if (!user) return router.push('/login');
    
    const priceToPay = course.offerPrice !== null && course.offerPrice !== undefined ? course.offerPrice : course.price;

    if (((user as any)?.balance || 0) < priceToPay) {
        setShowRechargeForm(true); 
        return;
    }

    setIsBuying(true);
    const toastId = toast.loading("جاري إتمام عملية الشراء...");
    
    try {
const res = await fetch(`${API_BASE_URL}/api/users/buy`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json'
    },
    credentials: "include",
    body: JSON.stringify({ itemId: course.id, itemType: 'COURSE' })
});

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            toast.success("تم الشراء بنجاح! مبروك اشتراكك في المادة.", { id: toastId });
            setShowEnrollModal(false);
            
            setIsEnrolled(true);
            
            const updatedEnrollments = [...((user as any)?.enrollments || []), { courseId: course.id, itemId: course.id }];
            updateUser({ 
                ...user, 
                balance: ((user as any)?.balance || 0) - priceToPay,
                enrollments: updatedEnrollments
            });

            refreshUser();
            
        } else {
            toast.error(data.message || "فشلت عملية الشراء.", { id: toastId });
        }
    } catch (error) {
        toast.error("حدث خطأ في الاتصال بالخادم.", { id: toastId });
    } finally {
        setIsBuying(false);
    }
  };

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeAmount || Number(rechargeAmount) <= 0) return toast.error("يرجى إدخال مبلغ صحيح.");
    if (!receiptImage) return toast.error("يرجى إرفاق صورة الإيصال أو الحوالة.");

    setIsSubmittingRecharge(true);
    const toastId = toast.loading("جاري إرسال طلب الشحن...");

    try {
        const formData = new FormData();
        formData.append('amount', String(rechargeAmount));
        formData.append('transferMethod', transferMethod);
        formData.append('receiptImage', receiptImage, receiptImage.name || 'receipt.jpg'); 

const res = await fetch(`${API_BASE_URL}/api/users/recharge-request`, {
    method: 'POST',
    credentials: "include",
    body: formData 
});

        if (res.ok) {
            toast.success("تم إرسال طلب الشحن بنجاح! سيتم مراجعته قريباً.", { id: toastId, duration: 5000 });
            setShowRechargeForm(false);
            setShowEnrollModal(false);
            setReceiptImage(null);
            setRechargeAmount("");
        } else {
            const data = await res.json().catch(() => ({}));
            toast.error(data.message || "حدث خطأ أثناء إرسال الطلب.", { id: toastId });
        }
    } catch (error) {
        toast.error("حدث خطأ في الاتصال بالخادم.", { id: toastId });
    } finally {
        setIsSubmittingRecharge(false);
    }
  };

  const formatDateEn = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fallbackInstructorAvatar = `https://ui-avatars.com/api/?name=${course?.instructorName || 'U'}&background=0D8ABC&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30 pb-20 relative" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="w-full relative bg-[#0a0f1a] overflow-hidden shadow-2xl border-b border-white/5">
          <div className="absolute inset-0 z-0">
             <Image 
                unoptimized
                priority
                src={getImageUrl(course.imageUrl, 'course', 1200) || FALLBACK_IMAGE} 
                alt="Background Cover" 
                fill 
                sizes="100vw"
                className="object-cover blur-2xl md:blur-3xl opacity-30 md:opacity-40 scale-110" 
             />            
          </div>
          
          <div className="container mx-auto px-4 pt-24 pb-8 relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:min-h-[450px]">
             <div className="w-full lg:w-2/3 flex flex-col justify-end space-y-4 pt-8 lg:pt-32 relative z-50">
                 <div className="flex flex-wrap gap-2 md:gap-3">
                     {course.isPlatformSponsored && (
                         <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#0f172a]/95 md:bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs md:text-sm font-bold flex items-center gap-1.5 md:backdrop-blur-md shadow-lg">
                             <Award size={14} className="md:w-4 md:h-4" /> مادة رسمية
                         </span>
                     )}
                     <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#0f172a]/95 md:bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs md:text-sm font-bold flex items-center gap-1.5 md:backdrop-blur-md shadow-lg">
                         <Globe size={14} className="md:w-4 md:h-4" /> Offline Course
                     </span>
                 </div>
                 
                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-lg md:drop-shadow-2xl">
                     {course.title}
                 </h1>
                 
                 <div className="flex flex-wrap gap-2 md:gap-4 text-gray-200 font-medium text-xs md:text-sm pt-2">
                     <div className="flex items-center gap-1.5 bg-[#0f172a]/95 md:bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:backdrop-blur-md border border-white/10 shadow-lg">
                         <BookOpen size={16} className="text-blue-400" /> {course.sessionsCount || 0} محاضرة
                     </div>
                     <div className="flex items-center gap-1.5 bg-[#0f172a]/95 md:bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:backdrop-blur-md border border-white/10 shadow-lg">
                         <HelpCircle size={16} className="text-purple-400" /> {course.quizzesCount || 0} كويز
                     </div>
                     <div className="flex items-center gap-1.5 bg-[#0f172a]/95 md:bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:backdrop-blur-md border border-white/10 shadow-lg">
                         <Clock size={16} className="text-cyan-400" /> {course.duration || "غير محدد"}
                     </div>
                     
                     <div className="flex items-center gap-2 bg-[#0f172a]/95 md:bg-black/60 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:backdrop-blur-md border border-white/20 shadow-lg relative z-[100] pointer-events-auto cursor-pointer hover:bg-black/80 transition-colors">
                         <InteractiveRating
                            itemId={course.id}
                            itemType="COURSE"
                            initialRating={course.averageRating || 0}
                            totalReviews={course.reviewsCount || 0}
                            userRating={course.userRating}
                            size={16}
                            isEnrolled={isEnrolled}
                         />
                     </div>
                 </div>
             </div>

             <div className="w-full lg:w-1/3 flex justify-center lg:justify-end relative mt-8 lg:mt-0 pb-8 lg:pb-0 h-64 sm:h-72 md:h-80 lg:h-96">
                 <div className="relative w-full h-full max-w-[350px] lg:max-w-none">
                     <Image 
                        unoptimized
                        priority 
                        src={getImageUrl(course.imageUrl, 'course', 600) || FALLBACK_IMAGE} 
                        alt={course.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-contain rounded-2xl shadow-2xl md:shadow-none md:drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10 relative"
                     />
                     {course.isPlatformSponsored && course.stampUrl && (
                         <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 md:-top-8 md:-right-8 lg:-top-10 lg:-right-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rotate-12 drop-shadow-lg md:drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)] z-20 pointer-events-none">
                             <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg md:blur-[20px] animate-pulse"></div>
                             <Image 
                                unoptimized
                                src={getImageUrl(course.stampUrl, 'course', 300) || FALLBACK_IMAGE} 
                                alt="Official Stamp" 
                                fill 
                                sizes="160px"
                                className="object-contain relative" 
                             />
                         </div>
                     )}
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
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span> عن هذه المادة
                    </h2>
                    <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 leading-relaxed text-gray-300 text-base md:text-lg whitespace-pre-line shadow-lg">
                        {course.description}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span> ماذا تتضمن المادة؟
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <FeatureCard icon={Video} label="الجلسات" value={course.sessionsCount} color="text-blue-400" bg="bg-blue-500/10" />
                        <FeatureCard icon={HelpCircle} label="الكويزات" value={course.quizzesCount} color="text-yellow-400" bg="bg-yellow-500/10" />
                        <FeatureCard icon={FileText} label="الملخصات" value={course.summariesCount} color="text-emerald-400" bg="bg-emerald-500/10" />
                        <FeatureCard icon={CheckSquare} label="المهام (Tasks)" value={course.tasksCount} color="text-purple-400" bg="bg-purple-500/10" />
                        <FeatureCard icon={FileEdit} label="الامتحانات" value={course.examsCount} color="text-rose-400" bg="bg-rose-500/10" />
                        <FeatureCard icon={ShieldCheck} label="الشهادة" value={course.hasCertificate ? "متوفرة" : "لا يوجد"} color="text-cyan-400" bg="bg-cyan-500/10" />
                    </div>
                </section>

                {course.learningOutcomes && (
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                            <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span> محاور المادة
                        </h2>
                        <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg">
                            <ul className="space-y-3 md:space-y-4">
                                {course.learningOutcomes.split('\n').filter((item: string) => item.trim() !== '').map((outcome: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-300 text-base md:text-lg">
                                        <Target className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                                        <span>{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2 mb-8 lg:mb-0">
                <div className="sticky top-28 space-y-6">
                    <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"></div>
                        
                        <div className="text-center mb-6 md:mb-8 pt-2">
                            <p className="text-gray-400 text-xs font-bold mb-2 md:mb-3 uppercase tracking-widest">
                                {isEnrolled ? "حالة التسجيل" : "التسجيل متاح الآن"}
                            </p>
                            <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                                {course.offerPrice !== null && course.offerPrice !== undefined ? (
                                    <>
                                        <span className="text-lg md:text-2xl text-gray-500 line-through decoration-red-500/50 decoration-2">ل.س{(course.price || 0).toLocaleString()}</span>
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">ل.س{(course.offerPrice || 0).toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">ل.س{(course.price || 0).toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        {isEnrolled ? (
                            <Link
                                href={`/courses/${id}/learn`}
                                className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-base md:text-lg shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 md:mb-8"
                            >
                                <PlayCircle size={20} /> دخول للمادة
                            </Link>
                        ) : (
                            <button
                                onClick={handleOpenEnrollModal}
                                disabled={isPreparingToBuy}
                                className="w-full py-3 md:py-4 bg-white text-black rounded-xl font-black text-base md:text-lg shadow-lg hover:shadow-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 md:mb-8 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isPreparingToBuy ? (
                                    <><Loader2 className="animate-spin text-black" size={20} /> جاري المعالجة...</>
                                ) : (
                                    <><BookOpen size={20} fill="black" className="text-black" /> تسجيل في المادة</>
                                )}
                            </button>
                        )}

                        <div className="space-y-3 md:space-y-4 border-t border-white/5 pt-4 md:pt-6">
                            <div className="flex justify-between items-center text-xs md:text-sm group">
                                <span className="text-gray-400 flex items-center gap-1.5 md:gap-2 group-hover:text-blue-400 transition-colors"><Calendar size={14} className="md:w-4 md:h-4" /> تاريخ البداية</span>
                                <span className="font-bold font-mono text-white">{formatDateEn(course.startDate)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs md:text-sm group">
                                <span className="text-gray-400 flex items-center gap-1.5 md:gap-2 group-hover:text-cyan-400 transition-colors"><Calendar size={14} className="md:w-4 md:h-4" /> تاريخ النهاية</span>
                                <span className="font-bold font-mono text-white">{formatDateEn(course.endDate)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        <div className="hidden md:block absolute top-0 left-0 w-32 md:w-40 h-32 md:h-40 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-white/5 pb-2 md:pb-3">مدرس المادة</h3>
                            
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4 md:mb-5 group-hover:scale-105 transition-transform duration-500 flex justify-center">
                                    <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-[2rem] blur-md opacity-40"></div>
                                    <div className="relative w-28 h-28 md:w-40 md:h-40">
                                        <Image 
                                            unoptimized
                                            src={getImageUrl(course.instructorImage, 'avatar', 300) || fallbackInstructorAvatar}
                                            alt={course.instructorName}
                                            fill
                                            sizes="160px"
                                            className="object-cover rounded-[1.5rem] md:rounded-[2rem] border-2 border-white/10 shadow-2xl bg-[#0f172a]"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-blue-600 text-white p-1.5 md:p-2 rounded-lg md:rounded-xl border-2 md:border-4 border-[#1e293b] shadow-lg">
                                        <ShieldCheck size={16} className="md:w-5 md:h-5" />
                                    </div>
                                </div>

                                <h2 className="text-xl md:text-2xl font-black text-white">{course.instructorName}</h2>
                                <p className="text-blue-400 font-bold text-xs md:text-sm mt-1 mb-4 md:mb-6 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Course Instructor</p>
                                
                                <div className="w-full p-4 md:p-5 bg-black/20 rounded-xl md:rounded-2xl border border-white/5 text-xs md:text-sm text-gray-300 leading-relaxed text-right">
                                    {course.instructorBio && course.instructorBio.trim() !== ""
                                        ? course.instructorBio
                                        : "مدرس أكاديمي ذو خبرة واسعة في تدريس وتوصيل المعلومات بأسلوب مبسط ومباشر."
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {showEnrollModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 md:bg-black/80 md:backdrop-blur-sm transition-opacity" onClick={() => setShowEnrollModal(false)}></div>

<div className="relative bg-[#1e293b] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">                <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="إغلاق" title="إغلاق">
                    <X size={24} />
                </button>

                {!showRechargeForm ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mt-2">
                            <Wallet size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">إتمام عملية الشراء</h3>
                            <p className="text-gray-400">سيتم خصم قيمة المادة من رصيد محفظتك وتفعيل الاشتراك فوراً.</p>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 text-sm text-gray-300 border border-white/5 space-y-2">
                            <div className="flex justify-between font-bold">
                                <span>رصيدك الحالي:</span>
                                <span className="text-green-400">{((user as any)?.balance || 0).toLocaleString()} ل.س</span>
                            </div>
                            <div className="flex justify-between font-bold border-b border-white/10 pb-2">
                                <span>سعر المادة:</span>
                                <span className="text-red-400">- {(course.offerPrice !== null && course.offerPrice !== undefined ? course.offerPrice : course.price).toLocaleString()} ل.س</span>
                            </div>
                            <div className="flex justify-between font-black text-lg pt-1 text-white">
                                <span>الرصيد المتبقي:</span>
                                <span>{(((user as any)?.balance || 0) - (course.offerPrice !== null && course.offerPrice !== undefined ? course.offerPrice : course.price)).toLocaleString()} ل.س</span>
                            </div>
                        </div>

                        {!user ? (
                            <button onClick={() => router.push('/login')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg transition-all">
                                تسجيل الدخول للمتابعة
                            </button>
                        ) : ((user as any)?.balance || 0) < (course.offerPrice !== null && course.offerPrice !== undefined ? course.offerPrice : course.price) ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-red-400 text-sm font-bold">⚠️ رصيدك غير كافٍ لإتمام الشراء.</p>
                                <button 
                                    onClick={() => setShowRechargeForm(true)}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                                >
                                    <UploadCloud size={20} /> شحن المحفظة الآن
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleBuyCourse}
                                disabled={isBuying}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                            >
                                {isBuying ? <Loader2 className="animate-spin" size={24} /> : "تأكيد الشراء 🚀"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6" dir="rtl">
                        <div className="text-center mt-2">
                            <h3 className="text-2xl font-bold mb-2 text-white">شحن الرصيد بالحوالة</h3>                         
                        </div>

                        <form onSubmit={handleSubmitRecharge} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="transferMethod" className="text-sm font-bold text-gray-300">طريقة التحويل</label>
                                <select 
                                    id="transferMethod"
                                    value={transferMethod}
                                    onChange={(e) => setTransferMethod(e.target.value)}
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="الهرم">حوالة الهرم</option>
                                    <option value="سيريتل كاش">سيريتل كاش</option>
                                    <option value="MTN كاش">MTN كاش</option>
                                    <option value="شام كاش">شام كاش</option>
                                </select>
                            </div>

                            {settings && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <h4 className="text-blue-400 text-xs font-bold mb-3">بيانات التحويل المطلوبة:</h4>
                                
                                {transferMethod === "الهرم" && (
                                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed font-medium">
                                        {settings.haramTransferInfo || "لا توجد معلومات مضافة من الإدارة بعد."}
                                    </p>
                                )}
        
                            {(transferMethod === "سيريتل كاش" || transferMethod === "MTN كاش" || transferMethod === "شام كاش") && (
                                <div className="mt-2 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3 w-full overflow-hidden">
                                    <span className="text-gray-400 text-sm font-medium text-center">يرجى التحويل إلى الكود التالي:</span>
                                    
                                    <div className="w-full bg-blue-600/20 p-3 sm:p-4 rounded-lg border border-blue-500/30 shadow-inner flex items-center overflow-x-auto custom-scrollbar touch-pan-x">
                                        <span 
                                            dir="ltr"
                                            className="font-mono font-bold text-white text-xs sm:text-sm md:text-lg lg:text-xl tracking-wide whitespace-nowrap select-all mx-auto"
                                        >
                                            {transferMethod === "سيريتل كاش" ? (settings.syriatelCashNumber || "---") : 
                                            transferMethod === "MTN كاش" ? (settings.mtnCashNumber || "---") : 
                                            (settings.chamCashNumber || "---")}
                                        </span>
                                    </div>
                                    
                                    <span className="text-[10px] md:text-xs text-blue-300 mt-1 opacity-80 font-normal text-center">
                                        (اسحب لليمين واليسار لرؤية الرقم كاملاً، أو اضغط مطولاً للنسخ)
                                    </span>
                                </div>
                            )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="rechargeAmount" className="text-sm font-bold text-gray-300">المبلغ المحول (ل.س)</label>
                                <input 
                                    id="rechargeAmount"
                                    type="number" 
                                    required min="1"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                    placeholder="مثال: 500"
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 text-center block">صورة الحوالة / الإشعار</label>
                                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 hover:border-blue-500/50 bg-[#0a0f1c] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors h-28 text-center">
                                        {receiptImage ? (
                                            <>
                                                <FileImage className="text-green-400" size={28} />
                                                <span className="text-green-400 font-bold text-[10px] truncate w-full px-2">{receiptImage.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="text-blue-400" size={28} />
                                                <span className="text-gray-400 text-[10px] font-medium">اضغط للرفع</span>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        id="receiptInput"
                                        title="رفع صورة الحوالة"
                                        aria-label="رفع صورة الحوالة"
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => { 
                                            if (e.target.files?.[0]) {
                                                setReceiptImage(e.target.files[0]); 
                                                e.target.value = '';
                                            }
                                        }} 
                                    />
                                </div>                     
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
                               <p className="text-xs text-red-200 font-bold flex items-center gap-1"><ShieldCheck size={14} className="text-red-400"/>ملاحظة هامة</p>
                                <ul className="text-[10px] text-gray-400 list-disc list-inside px-2 space-y-1">
                                    <li><strong className="text-gray-300">موعد التفعيل :</strong> سيتم تفعيل الاشعار خلال مدة اقصاها 20 دقيقة </li>
                                    <li><strong className="text-gray-300">حدوث مشكلة :</strong>في حال هناك مشكلة بالوصل سيصلك اشعار بالرفض فالرجاء التواصل مع الادارة لحل المشكلة</li>
                                </ul>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmittingRecharge}
                                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {isSubmittingRecharge ? <Loader2 className="animate-spin" size={24} /> : "إرسال طلب الشحن للتدقيق"}
                            </button>
                        </form>

                        <button 
                            type="button"
                            onClick={() => setShowRechargeForm(false)}
                            className="w-full py-3 bg-transparent text-gray-500 hover:text-white rounded-xl font-bold text-sm transition-all"
                        >
                            إلغاء والعودة للخلف
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, label, value, color, bg }: any) {
    const displayValue = value === undefined || value === null ? 0 : value;
    
    return (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-white/5 transition-colors">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={color} size={20} />
            </div>
            <div>
                <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-0.5 md:mb-1">{label}</p>
                <p className="text-base md:text-lg font-black text-white">{displayValue}</p>
            </div>
        </div>
    );
}