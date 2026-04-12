"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { toast, Toaster } from "react-hot-toast"; 
import { 
  Loader2, Download, CheckCircle, Clock, 
  ArrowRight, User, MessageSquare, Award, X, FileText, AlertTriangle
} from "lucide-react";

export default function TaskSubmissionsPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const router = useRouter();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 
  
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [grade, setGrade] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(API_ROUTES.TASK_SUBMISSIONS(taskId), {
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("فشل الاتصال");

      const text = await res.text();
      if (text) {
        const data = JSON.parse(text);
        setSubmissions(Array.isArray(data) ? data : []);
      } else {
        setSubmissions([]);
      }
      setError(false);
    } catch (err) {
      console.error("Error fetching submissions", err);
      setError(true); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [taskId]);

  const openGradingModal = (sub: any) => {
    setSelectedSub(sub);
    setGrade(sub.grade ?? "");
    setFeedback(sub.feedback ?? "");
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    
    if (grade === "") {
        toast.error("يرجى إدخال العلامة المستحقة للطالب.");
        return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("جاري حفظ التقييم...");

    try {
      const finalGrade = Number(grade);

      const res = await fetch(API_ROUTES.GRADE_SUBMISSION(selectedSub.id), {
        method: "PATCH",
        credentials: "include", 
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ grade: finalGrade, feedback })
      });

      if (res.ok) {
        toast.success("تم تقييم الحل بنجاح! ✅", { id: toastId });
        
        setSubmissions(prev => 
            prev.map(sub => 
                sub.id === selectedSub.id 
                ? { ...sub, grade: finalGrade, feedback: feedback, status: 'GRADED' } 
                : sub
            )
        );
        
        setSelectedSub(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "فشل التقييم، يرجى المحاولة مرة أخرى.", { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-500" />
        <p className="text-gray-400 font-bold animate-pulse">جاري جلب تسليمات الطلاب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold">عذراً، حدث خطأ أثناء جلب التسليمات</h2>
        <button onClick={fetchSubmissions} className="px-6 py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all font-bold">
            إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24 md:p-12 md:pt-32" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => router.back()} 
              className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors text-sm font-bold"
            >
              <ArrowRight size={16} /> العودة للوحة التحكم
            </button>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <FileText className="text-indigo-400 w-8 h-8" /> 
              تسليمات الطلاب للمهمة
            </h1>
            <p className="text-gray-400 mt-2">إجمالي التسليمات: {submissions.length}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">لم يقم أي طالب بتسليم هذه المهمة حتى الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right">
                <thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-5">الطالب</th>
                    <th className="p-5">ملف الحل</th>
                    <th className="p-5 text-center">الحالة</th>
                    <th className="p-5 text-center">العلامة</th>
                    <th className="p-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
                            {sub.student?.firstName?.[0] || <User size={20} />}
                          </div>
                          <div>
                            <p>{sub.student?.firstName || "طالب"} {sub.student?.lastName || ""}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5" dir="ltr">{sub.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <a 
                          href={sub.fileUrl?.startsWith('http') ? sub.fileUrl : `${API_BASE_URL}${sub.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors w-fit bg-indigo-400/10 px-3 py-1.5 rounded-lg border border-indigo-400/20 shadow-sm"
                        >
                          <Download size={14} /> تحميل {sub.fileName ? `(${sub.fileName})` : "الملف"}
                        </a>
                      </td>
                      <td className="p-5 text-center">
                        {sub.status === 'GRADED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            <CheckCircle size={12} /> تم التقييم
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            <Clock size={12} /> بانتظار التقييم
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center font-black text-lg">
                        {sub.status === 'GRADED' ? (
                           <span className="text-white">{sub.grade} <span className="text-xs text-gray-500 font-normal">/ 100</span></span>
                        ) : (
                           <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => openGradingModal(sub)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 border border-indigo-500/50"
                        >
                          {sub.status === 'GRADED' ? "تعديل التقييم" : "قيّم الآن"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setSelectedSub(null)}></div>
          <div className="relative bg-[#1e293b] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedSub(null)} disabled={isSubmitting} className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50" title="إغلاق" aria-label="إغلاق">
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Award className="text-yellow-500" /> تقييم الحل
            </h3>

            <div className="mb-6 bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                  {selectedSub.student?.firstName?.[0] || <User size={20}/>}
              </div>
              <div>
                  <p className="text-xs text-gray-400 mb-0.5">الطالب المعني:</p>
                  <p className="font-bold text-white text-sm">{selectedSub.student?.firstName} {selectedSub.student?.lastName}</p>
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="gradeInput" className="text-sm text-gray-300 font-bold block">العلامة (من 100)</label>
                <input 
                  id="gradeInput"
                  type="number" 
                  title="العلامة"
                  aria-label="العلامة"
                  placeholder="مثال: 95"
                  required
                  min="0"
                  max="100"
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value === "" ? "" : Number(e.target.value))} 
                  className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-indigo-500 outline-none text-xl font-bold text-center text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="feedbackInput" className="text-sm text-gray-300 font-bold flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-400" /> ملاحظات للطالب (اختياري)
                </label>
                <textarea 
                  id="feedbackInput"
                  title="ملاحظات"
                  aria-label="ملاحظات"
                  placeholder="أحسنت عملاً في الجزء الأول، ولكن يرجى الانتباه للسطر كذا..."
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-white/20 rounded-xl p-4 focus:border-indigo-500 outline-none min-h-[120px] resize-y text-white text-sm leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || grade === ""}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                {isSubmitting ? "جاري الحفظ..." : "حفظ التقييم وإرساله"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}