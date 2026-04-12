"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  Search, Lock, Unlock, Clock, FileText, CheckCircle2, 
  AlertCircle, Loader2, GraduationCap, RefreshCw, Eye, BookOpen, Layers, Zap, X, User
} from "lucide-react";
import { API_ROUTES } from "@/config/api";
import { fetchAuth } from '@/utils/api';
export default function ExamsManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

const fetchExams = async () => {
    try {
      // (اختياري) إذا لم يكن اللودر يعمل تلقائياً عند تحميل الصفحة، يمكنك تشغيله هنا
      // setIsLoading(true); 

      const res = await fetch(API_ROUTES.COURSES, { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data); // إذا كانت الداتا فارغة []، سيتم تخزينها وسيعرض الجدول رسالة "لا يوجد امتحانات"
      } else {
        console.error(`خطأ في جلب البيانات: ${res.status}`);
      }
    } catch (err) {
      console.error("حدث خطأ أثناء الاتصال بالسيرفر:", err);
    } finally {
      // 🌟 تم تعديل الاسم ليطابق المتغير المعرف عندك 🌟
      setLoading(false); 
    }
  };
  useEffect(() => {
    fetchExams();
  }, []);

  // 2. دالة التفعيل / الإلغاء
  const toggleExamStatus = async (examId: string, currentStatus: boolean, contentId: string) => {
    const action = currentStatus ? "إغلاق" : "فتح";
    if (!confirm(`هل أنت متأكد من ${action} هذا الامتحان؟ \n${currentStatus ? 'سيتم منع الطلاب من الدخول.' : 'سيصبح متاحاً للطلاب فوراً.'}`)) return;

    setProcessingId(examId);
    try {
      // ✅ التعديل هنا: حذفنا التوكن واستخدمنا credentials: "include"
const res = await fetch(`${API_BASE_URL}/api/exam/${contentId}/status`, {
  method: 'PATCH',
  headers: { 
      'Content-Type': 'application/json'
  },
  credentials: "include", // ✅ السماح بإرسال كوكيز المصادقة تلقائياً
  body: JSON.stringify({ isOpen: !currentStatus })
});
      
      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.exam?.id === examId ? { ...item, exam: { ...item.exam, isOpen: !currentStatus } } : item
        ));
      } else {
        alert("فشل تغيير الحالة، تأكد من الصلاحيات.");
      }
      
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-rose-400 mb-2 flex items-center gap-3">
              <GraduationCap size={36} className="text-indigo-500" />
              تفعيل الامتحانات
            </h1>
            <p className="text-slate-400">تحكم بفتح وإغلاق الامتحانات للطلاب بضغطة زر.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="بحث باسم الامتحان..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-lg"
                />
             </div>
             <button onClick={fetchExams} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-colors border border-white/5" title="تحديث القائمة">
                <RefreshCw size={20} />
             </button>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-6">
                <Loader2 size={50} className="animate-spin text-indigo-500" />
                <p className="text-slate-500 animate-pulse">جاري جلب الامتحانات...</p>
            </div>
        ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                    const exam = item.exam;
                    if (!exam) return null; 

                    let parentType = "عام";
                    let ParentIcon = BookOpen;
                    let parentTitle = "محتوى مستقل";
                    let instructorName = "غير محدد";

                    // ✅ استخراج اسم المادة واسم الأستاذ بناءً على نوع المحتوى
                    if (item.courseId && item.course) { 
                        parentType = "كورس"; 
                        ParentIcon = BookOpen; 
                        parentTitle = item.course.title;
                        instructorName = item.course.instructorName;
                    } else if (item.bootcampId && item.bootcamp) { 
                        parentType = "بوت كامب"; 
                        ParentIcon = Layers; 
                        parentTitle = item.bootcamp.title;
                        instructorName = item.bootcamp.instructorName;
                    } else if (item.workshopId && item.workshop) { 
                        parentType = "ورشة عمل"; 
                        ParentIcon = Zap; 
                        parentTitle = item.workshop.title;
                        instructorName = item.workshop.instructorName;
                    }

                    return (
                        <div key={item.id} className={`group relative bg-[#1e293b] border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${exam.isOpen ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-white/5 hover:border-white/10'}`}>
                            
                            {/* Decorative Background */}
                            {exam.isOpen && <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>}

                            {/* Header Badge */}
                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${exam.isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {exam.isOpen ? <Unlock size={14} className="animate-pulse"/> : <Lock size={14}/>}
                                    {exam.isOpen ? 'مفعل (الطلاب يمكنهم الدخول)' : 'مغلق (غير متاح)'}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                    <ParentIcon size={12} /> {parentType}
                                </div>
                            </div>

                            {/* ✅ اسم الامتحان */}
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={item.title}>
                                {item.title}
                            </h3>
                            
                            {/* ✅ اسم المادة واسم الأستاذ */}
                            <div className="mb-4 space-y-1.5">
                                <p className="text-sm text-indigo-400 font-medium flex items-center gap-2">
                                    <ParentIcon size={14} /> 
                                    <span className="truncate">{parentTitle}</span>
                                </p>
                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                    <User size={12} /> 
                                    <span>المدرب: {instructorName}</span>
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-[10px] text-slate-500 mb-1">المدة</span>
                                    <span className="font-mono font-bold text-indigo-300 flex items-center gap-1"><Clock size={14}/> {exam.duration} د</span>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-[10px] text-slate-500 mb-1">الدرجة</span>
                                    <span className="font-mono font-bold text-amber-300 flex items-center gap-1"><FileText size={14}/> {exam.totalScore}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => toggleExamStatus(exam.id, exam.isOpen, item.id)}
                                disabled={processingId === exam.id}
                                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 relative z-10 ${
                                    exam.isOpen 
                                    ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20' 
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20'
                                }`}
                            >
                                {processingId === exam.id ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : exam.isOpen ? (
                                    <> <Lock size={18} /> إغلاق الامتحان </>
                                ) : (
                                    <> <Unlock size={18} /> تفعيل الامتحان الآن </>
                                )}
                            </button>

                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-24 bg-[#1e293b]/50 rounded-[3rem] border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} className="text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300">لا يوجد امتحانات</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">لم يتم إضافة أي امتحانات بعد. يمكنك إضافتها من صفحة إدارة المحتوى.</p>
            </div>
        )}

      </div>
    </div>
  );
}