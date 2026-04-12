"use client";

import { useState, useEffect, useRef } from "react";
import { API_ROUTES } from "@/config/api";
import { 
  UploadCloud, FileText, CheckCircle, Clock, 
  Award, MessageSquare, Loader2, RefreshCw, AlertCircle, Lock, Timer, AlertTriangle, FileArchive
} from "lucide-react";
import { toast } from "react-hot-toast";

interface StudentTaskSubmissionProps {
  taskId: string;
  taskTitle?: string;
  taskDescription?: string;
  taskDueDate?: string; 
}

const ALLOWED_EXTENSIONS = ['zip', 'rar'];
const MAX_FILE_SIZE_MB = 30; 

export default function StudentTaskSubmission({ taskId, taskTitle, taskDescription, taskDueDate }: StudentTaskSubmissionProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isExpired, setIsExpired] = useState(false);
  const [timeOffset, setTimeOffset] = useState<number>(0); 
  const fileInputRef = useRef<HTMLInputElement>(null);

const fetchMySubmission = async () => {
    setFetchError(false);
    try {
      const res = await fetch(API_ROUTES.MY_SUBMISSION(taskId), {
        credentials: "include" 
      });
      
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setSubmission(data);
        } else {
          setSubmission(null);
        }
      } else if (res.status === 404 || res.status === 204) {
        // 🌟 التعديل الجوهري هنا:
        // إذا رد السيرفر بـ 404 (غير موجود) أو 204 (لا يوجد محتوى)
        // فهذا يعني أن الطالب لم يسلم الوظيفة بعد، وهذا طبيعي جداً وليس خطأ!
        setSubmission(null);
      } else {
         // أي خطأ آخر (مثل 500 مشكلة بالسيرفر) نعتبره خطأ حقيقي
         throw new Error("Failed to fetch");
      }
    } catch (err) {
      console.error("Error fetching submission", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmission();
  }, [taskId]);

  useEffect(() => {
    const syncTimeSafely = async () => {
      try {
        const response = await fetch(window.location.origin, { 
            method: 'HEAD', 
            cache: 'no-store' 
        });
        
        const serverDateStr = response.headers.get('Date');
        if (serverDateStr) {
          const realServerTime = new Date(serverDateStr).getTime();
          const localTime = Date.now();
          setTimeOffset(realServerTime - localTime); 
        }
      } catch (error) {
        console.error("فشل سحب الوقت، سيتم الاعتماد على وقت الجهاز محلياً", error);
      }
    };
    
    syncTimeSafely();
  }, []);

  useEffect(() => {
    if (taskDueDate) {
      const checkExpiration = () => {
        const realTimeNow = new Date(Date.now() + timeOffset);
        // ✅ حماية الـ TypeScript: تأكدنا أن القيمة نصية قبل تطبيق Replace
        const safeDateString = String(taskDueDate || '').replace(' ', 'T'); 
        const deadline = new Date(safeDateString);
        
        setIsExpired(realTimeNow > deadline);
      };
      
      checkExpiration(); 
      const timer = setInterval(checkExpiration, 10000); 
      return () => clearInterval(timer);
    } else {
      setIsExpired(false); 
    }
  }, [taskDueDate, timeOffset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExpired) {
        toast.error("عذراً، لقد انتهى وقت تسليم هذه المهمة.");
        return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
        toast.error("يرجى ضغط ملفاتك! مسموح فقط بملفات .zip أو .rar");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE_MB}MB)!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("جاري رفع ملف الحل...");
    const formData = new FormData();
    formData.append('file', file);

    try {
      // ✅ التعديل: حذف الهيدرز تماماً (لأنه FormData) وإضافة الكوكيز
const res = await fetch(API_ROUTES.SUBMIT_TASK(taskId), {
  method: 'POST',
  credentials: "include", // 👈 تفعيل إرسال الكوكيز تلقائياً
  body: formData
});

      if (res.ok) {
        toast.success("تم تسليم المهمة بنجاح! 🚀", { id: toastId });
        fetchMySubmission(); 
      } else {
        const errorData = await res.json().catch(()=>({}));
        if (res.status === 403 || res.status === 400) {
            setIsExpired(true);
            toast.error("رفض السيرفر الطلب: انتهى وقت التسليم فعلياً.", { id: toastId });
        } else {
            toast.error(`خطأ: ${errorData.message || "فشل رفع الملف"}`, { id: toastId });
        }
      }
    } catch (err) {
      toast.error("حدث خطأ في الاتصال أثناء رفع الملف.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (fetchError) {
      return (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center animate-in fade-in">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ في الاتصال</h3>
              <p className="text-slate-400 mb-6 text-sm">لم نتمكن من جلب حالة تسليمك. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.</p>
              <button onClick={fetchMySubmission} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm">
                  إعادة المحاولة
              </button>
          </div>
      )
  }

  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
      
      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-blue-400" />
            {taskTitle || "المهمة العملية"}
            </h2>

            {taskDueDate && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-sm w-fit ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {isExpired ? <Lock size={14} /> : <Timer size={14} />}
                    {/* ✅ حماية الـ TypeScript مرة أخرى هنا */}
                    {isExpired ? "انتهى وقت التسليم" : `آخر موعد: ${new Date(String(taskDueDate || '').replace(' ', 'T')).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}`}
                </div>
            )}
        </div>

        {taskDescription && (
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {taskDescription}
          </p>
        )}
      </div>

      {!submission ? (
        <div className={`text-center rounded-2xl p-10 transition-all border-2 border-dashed ${isExpired ? 'bg-red-900/10 border-red-500/20 cursor-not-allowed opacity-80' : 'bg-black/20 border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
          {isExpired ? (
              <Lock className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          ) : (
              <FileArchive className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          )}
          
          <h3 className="text-lg font-bold text-white mb-2">
              {isExpired ? "المهمة مغلقة" : "قم برفع ملف الحل الخاص بك هنا"}
          </h3>
          <p className="text-xs mb-6 flex-wrap leading-relaxed">
              {isExpired 
                ? <span className="text-red-400 font-medium">عذراً، لقد تجاوزت الوقت المحدد لتسليم هذه المهمة.</span> 
                : <span className="text-gray-400">يرجى ضغط ملفاتك في ملف واحد.<br/>المسموح: <strong className="text-blue-400">.zip</strong> أو <strong className="text-blue-400">.rar</strong> بحد أقصى {MAX_FILE_SIZE_MB} ميغابايت.</span>}
          </p>
          
          <input 
            type="file" 
            title="رفع ملف الحل"
            aria-label="رفع ملف الحل"
            className="hidden" 
            ref={fileInputRef} 
            accept=".zip,.rar" 
            onChange={handleFileUpload}
            disabled={isUploading || isExpired} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isExpired} 
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all disabled:opacity-50 ${isExpired ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
          >
            {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : (isExpired ? <Lock className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />)}
            {isUploading ? "جاري الرفع..." : (isExpired ? "مغلق" : "اختر الملف وقم بالتسليم")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${submission.status === 'GRADED' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${submission.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {submission.status === 'GRADED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-lg">
                    {submission.status === 'GRADED' ? "تم تصحيح المهمة" : "قيد المراجعة"}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate" dir="ltr">
                    {submission.fileName || "ملف الحل"} <FileArchive size={12} className="shrink-0" /> 
                  </p>
                </div>
              </div>

              {submission.status === 'PENDING' && (
                <div>
                  <input 
                    type="file" 
                    title="تعديل ملف الحل"
                    aria-label="تعديل ملف الحل"
                    className="hidden" 
                    ref={fileInputRef} 
                    accept=".zip,.rar" 
                    onChange={handleFileUpload} 
                    disabled={isUploading || isExpired}
                  />
                  {isExpired ? (
                      <span className="text-xs font-bold text-red-400 bg-red-400/10 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-500/20 whitespace-nowrap">
                          <Lock size={14} /> مقفلة للتعديل
                      </span>
                  ) : (
                      <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-xs font-bold text-orange-400 hover:text-white bg-orange-400/10 hover:bg-orange-500 px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-orange-500/20 whitespace-nowrap">
                        {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                        تعديل الحل
                      </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {submission.status === 'GRADED' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-inner">
                <Award className="text-yellow-400 w-12 h-12 mb-2 drop-shadow-md" />
                <span className="text-gray-400 text-sm font-bold mb-1">علامتك</span>
                <span className="text-4xl font-black text-white">{submission.grade} <span className="text-lg text-gray-500">/ 100</span></span>
              </div>
              
              <div className="bg-black/30 border border-white/5 rounded-2xl p-6 shadow-inner flex flex-col justify-center">
                <h4 className="text-gray-400 text-sm font-bold mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> ملاحظات المدرس:
                </h4>
                {submission.feedback ? (
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap font-medium">{submission.feedback}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic flex items-center gap-2">
                    <AlertCircle size={14} /> لا توجد ملاحظات إضافية.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}