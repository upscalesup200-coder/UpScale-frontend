"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; 
import { Star, X, Loader2, User, Calendar, MessageCircle, Trash2 } from "lucide-react"; // ✅ إضافة أيقونة الحذف Trash2
import axios from "axios";
import { API_ROUTES } from "@/config/api";
import { toast } from "react-hot-toast"; 
import Image from "next/image"; 
import { getImageUrl } from "@/utils/imageHelper"; 
import { useAuth } from "@/context/AuthContext"; // ✅ استدعاء حالة المستخدم للتحقق من صلاحية الأدمن

interface InteractiveRatingProps {
  itemId: string;
  itemType?: string;
  initialRating?: number;
  totalReviews?: number;
  size?: number;
  userRating?: number | null; 
  isEnrolled?: boolean; 
}

export default function InteractiveRating({ 
  itemId, 
  itemType = 'COURSE', 
  initialRating = 0, 
  totalReviews = 0,
  size = 14,
  userRating = null,
  isEnrolled = false 
}: InteractiveRatingProps) {

  const { user } = useAuth(); // ✅ جلب بيانات المستخدم الحالي
  const isAdmin = user?.role === 'ADMIN'; // ✅ التحقق هل المستخدم مدير

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [avg, setAvg] = useState(initialRating || 0);
  const [count, setCount] = useState(totalReviews || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 حالات النافذة المنبثقة
  const [showReviewersModal, setShowReviewersModal] = useState(false);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);
  const [mounted, setMounted] = useState(false); 

  const hasUpdatedLocally = useRef(false);

  useEffect(() => {
    setMounted(true); 
    if (!hasUpdatedLocally.current) {
        if(initialRating !== undefined) setAvg(initialRating);
        if(totalReviews !== undefined) setCount(totalReviews);
    }

    if (userRating !== null && userRating > 0) {
        setIsRated(true);
        setRating(userRating);
    } else {
        const savedRating = localStorage.getItem(`rated_${itemType}_${itemId}`);
        if (savedRating) {
            setIsRated(true);
            setRating(Number(savedRating));
        }
    }
  }, [itemId, initialRating, totalReviews, userRating, itemType]);

  const handleRate = async (e: React.MouseEvent, val: number) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!isEnrolled) {
        toast.error("عذراً، يجب عليك الاشتراك أولاً لتتمكن من تقييم المادة!", { id: 'rating-error' });
        return;
    }

    if (isRated || isSubmitting) return;

    setIsSubmitting(true);

    try {
        const safeVal = Math.max(1, Math.min(5, val));

        const response = await axios.post(API_ROUTES.RATE_ITEM, {
            targetId: itemId,
            targetType: itemType.toUpperCase(),
            value: safeVal
        }, {
            withCredentials: true 
        });

        setRating(safeVal);
        setIsRated(true);
        hasUpdatedLocally.current = true; 
        localStorage.setItem(`rated_${itemType}_${itemId}`, safeVal.toString());

        if(response.data) {
            setAvg(response.data.averageRating);
            setCount(response.data.reviewsCount);
        }
        
        toast.success("شكراً لك! تم إرسال تقييمك بنجاح."); 

    } catch (error: any) {
        if (error.response?.status === 409) {
            toast.error("لقد قمت بتقييم هذه المادة مسبقاً!");
            setIsRated(true);
            localStorage.setItem(`rated_${itemType}_${itemId}`, "5"); 
        } else if (error.response?.status === 403) {
            toast.error("عذراً، يجب عليك الاشتراك أولاً لتتمكن من التقييم!");
        } else {
            toast.error("حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً.");
        }
    } finally {
        setIsSubmitting(false);
        setHover(0); 
    }
  };

  const handleShowReviewers = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count === 0) return; 

    setShowReviewersModal(true);
    setIsLoadingReviewers(true);

    try {
      const response = await axios.get(API_ROUTES.GET_ITEM_REVIEWS(itemId));
      setReviewers(response.data);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب قائمة المقيمين.");
      setShowReviewersModal(false);
    } finally {
      setIsLoadingReviewers(false);
    }
  };

// ✅ دالة حذف التقييم (خاصة بالأدمن)
  const handleDeleteReview = async (ratingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف تقييم هذا الطالب؟ بمجرد الحذف سيتمكن من التقييم مجدداً.")) return;

    try {
        // 1. إرسال طلب الحذف للسيرفر
        const response = await axios.delete(`${API_ROUTES.RATE_ITEM}/${ratingId}`, {
            withCredentials: true 
        });

        toast.success("تم حذف التقييم بنجاح وتحديث المتوسط!");
        
        // 2. البحث عن التقييم لتحديد صاحبه
        const deletedReview = reviewers.find(r => r.id === ratingId);
        
        // 3. إزالة التقييم المحذوف من النافذة
        setReviewers(prev => prev.filter(r => r.id !== ratingId));
        
        // 🌟 4. [الحل الجذري]: منع المكون من العودة للقيم القديمة
        hasUpdatedLocally.current = true;
        
        // 5. تحديث الأرقام والنجوم فوراً في الشاشة بناءً على رد السيرفر
        if (response.data) {
            setAvg(response.data.averageRating || 0);
            setCount(response.data.reviewsCount || 0);
        } else {
            setCount(prev => Math.max(0, prev - 1));
        }

        // 6. إذا كان الأدمن يحذف تقييمه الشخصي، نفتح له مجال التقييم من جديد
        if (deletedReview && deletedReview.userId === user?.id) {
            setIsRated(false);
            setRating(0);
            localStorage.removeItem(`rated_${itemType}_${itemId}`);
        }

    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "حدث خطأ أثناء محاولة حذف التقييم");
    }
  };

  const displayValue = hover || rating || Math.round(avg);

  return (
    <>
      <div className="flex items-center gap-2 mt-1 mb-3" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)} dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={(e) => handleRate(e, star)}
              onMouseEnter={() => isEnrolled && !isRated && setHover(star)} 
              disabled={!isEnrolled || isRated || isSubmitting}
              className={`focus:outline-none transition-transform 
                ${!isEnrolled || isRated ? 'cursor-not-allowed opacity-80' : 'hover:scale-125 cursor-pointer'} 
                ${isSubmitting ? 'opacity-50 animate-pulse' : ''}`
              } 
              title={!isEnrolled ? "يجب الاشتراك للتقييم" : isRated ? "تم التقييم مسبقاً" : `تقييم بـ ${star} نجوم`}
            >
              <Star 
                size={size} 
                className={`transition-all duration-300 ${
                  star <= displayValue
                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" 
                    : `text-gray-600 ${isEnrolled && !isRated && !isSubmitting ? "hover:text-yellow-400" : ""}`
                }`} 
              />
            </button>
          ))}
        </div>
        
        <div 
          onClick={handleShowReviewers}
          className={`flex items-center gap-1.5 border-r border-white/10 pr-2 mr-1 transition-all ${count > 0 ? 'cursor-pointer hover:bg-white/5 rounded px-1 group' : ''}`}
        >
          <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{avg > 0 ? avg.toFixed(1) : "0.0"}</span>
          <span className="text-[10px] text-gray-500 group-hover:text-blue-400 group-hover:underline underline-offset-2 transition-all flex items-center gap-1">
             ({count})
          </span>
        </div>
        
        {isRated && <span className="text-[10px] text-emerald-400 font-bold animate-in fade-in zoom-in mr-auto">شكراً!</span>}
      </div>

      {mounted && showReviewersModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()} dir="rtl">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowReviewersModal(false)}></div>
          
          <div className="relative bg-[#111827] border border-white/10 rounded-[2rem] p-6 md:p-8 max-w-5xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                     <MessageCircle className="text-blue-400" size={24} />
                  </div>
                  آراء وتقييمات الطلاب
                  <span className="text-sm font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{count} تقييم</span>
                </h3>
              </div>
              <button onClick={() => setShowReviewersModal(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content: الجدول */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {isLoadingReviewers ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <span className="text-base font-bold text-gray-400">جاري تحميل الأسماء...</span>
                </div>
              ) : reviewers.length > 0 ? (
                
                <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl overflow-hidden shadow-inner">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse min-w-[700px]">
                      <thead className="bg-[#0f172a] border-b border-white/10 text-gray-400 text-sm">
                        <tr>
                          <th className="p-4 font-bold w-[35%]">الطالب</th>
                          <th className="p-4 font-bold w-[15%] text-center">التقييم</th>
                          <th className="p-4 font-bold w-[35%]">التعليق</th>
                          <th className="p-4 font-bold w-[15%] text-center">التاريخ</th>
                          {/* ✅ إضافة عمود الإجراءات للأدمن فقط */}
                          {isAdmin && <th className="p-4 font-bold w-[10%] text-center">إجراءات</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {reviewers.map((rev) => (
                          <tr key={rev.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                {rev.userAvatar ? (
                                  <div className="relative w-10 h-10 rounded-full border border-[#0f172a] overflow-hidden shadow-sm shrink-0">
                                    <Image 
                                      unoptimized
                                      src={getImageUrl(rev.userAvatar, 'avatar') || ""} 
                                      alt={rev.userName || "طالب"} 
                                      fill 
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#0f172a] rounded-full flex items-center justify-center text-blue-300 shadow-inner shrink-0">
                                    <User size={18} />
                                  </div>
                                )}
                                <span className="text-base font-bold text-white group-hover:text-blue-300 transition-colors whitespace-normal break-words" title={rev.userName}>
                                  {rev.userName}
                                </span>
                              </div>
                            </td>

                            <td className="p-4 align-middle">
                              <div className="flex items-center justify-center gap-0.5" dir="ltr">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={16} className={s <= rev.value ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" : "text-gray-600"} />
                                ))}
                              </div>
                            </td>

                            <td className="p-4 align-middle">
                              {rev.comment && rev.comment.trim() !== "" ? (
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                  {rev.comment}
                                </p>
                              ) : (
                                <span className="text-sm text-gray-600 italic">لا يوجد تعليق نصي</span>
                              )}
                            </td>

                            <td className="p-4 align-middle text-center">
                              <span className="text-xs text-gray-400 flex flex-col items-center gap-1 justify-center">
                                <Calendar size={14} className="text-gray-500" />
                                {new Date(rev.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </td>

                            {/* ✅ إظهار زر الحذف للأدمن فقط في كل صف */}
                            {isAdmin && (
                              <td className="p-4 align-middle text-center">
                                <button 
                                  onClick={(e) => handleDeleteReview(rev.id, e)}
                                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                  title="حذف التقييم"
                                  aria-label="حذف التقييم"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              ) : (
                <div className="text-center py-20 text-gray-400 text-base font-medium">
                  لا توجد مراجعات لهذه المادة حالياً.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}