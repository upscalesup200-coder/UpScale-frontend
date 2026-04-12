"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { CheckCircle, XCircle, Loader2, Image as ImageIcon, ZoomIn, X, User, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PendingRechargeRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false); 

  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

const fetchRequests = async () => {
    try {
      setFetchError(false);
      const res = await fetch(`${API_BASE_URL}/api/users/admin/recharge-requests/pending`, {
        credentials: "include", 
      });
      const data = await res.json();
      
      if (res.ok) {
          setRequests(data);
      } else {
          setFetchError(true);
          toast.error(data.message || "فشل جلب الطلبات من الخادم");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setFetchError(true);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!window.confirm(`هل أنت متأكد أنك تريد ${action === "approve" ? "الموافقة على" : "رفض"} هذا الطلب؟`)) return;

    setProcessingIds((prev) => [...prev, id]);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/recharge-requests/${id}/${action}`, {
        method: "PATCH",
        credentials: "include", 
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || (action === "approve" ? "تم شحن الرصيد بنجاح" : "تم رفض الطلب"));
        setRequests((prev) => prev.filter((req) => req.id !== id));
      } else {
        toast.error(data.message || "حدث خطأ أثناء معالجة الطلب");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setProcessingIds((prev) => prev.filter((pId) => pId !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060a14]">
        <Loader2 className="animate-spin text-green-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-white pt-12 px-8 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 border-b border-white/10 pb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
            <ImageIcon className="text-green-500" size={36} />
            طلبات الشحن المعلقة
          </h1>
          <p className="text-gray-400">راجع الحوالات وصور الهويات المرفقة وقم بالموافقة لرفع رصيد الطلاب.</p>
        </div>

        {fetchError ? (
          <div className="bg-[#0f172a] border border-red-500/20 rounded-3xl p-16 text-center shadow-xl">
            <XCircle className="text-red-500 w-20 h-20 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">تعذر جلب الطلبات</h3>
            <p className="text-gray-400 mb-6">حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.</p>
            <button onClick={fetchRequests} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold transition-colors">
                إعادة المحاولة
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#0f172a] border border-dashed border-white/20 rounded-3xl p-16 text-center shadow-xl">
            <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">لا توجد طلبات معلقة!</h3>
            <p className="text-gray-400">لقد قمت بمراجعة جميع الحوالات. عمل رائع! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {requests.map((req) => (
              <div key={req.id} className="bg-[#0f172a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                
                <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400 font-bold mb-1">المبلغ المطلوب</p>
                    <p className="text-3xl font-black text-green-400">{req.amount} <span className="text-sm text-green-500/70">ل.س</span></p>
                  </div>
                  <div className="text-left">
                    <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                      {req.transferMethod}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 justify-end">
                      <Calendar size={12} /> {formatDate(req.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                      <User className="text-gray-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{req.user?.firstName} {req.user?.lastName}</h4>
                      <div className="flex flex-col gap-1 mt-1 text-sm text-gray-400 font-mono">
                        <span className="flex items-center gap-2"><Mail size={14} className="text-gray-500"/> {req.user?.email}</span>
                        <span className="flex items-center gap-2"><Phone size={14} className="text-gray-500"/> {req.user?.phone || 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black/20 border-t border-b border-white/5 grid grid-cols-2 gap-4">
                  
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><ImageIcon size={14}/> صورة الإيصال</p>
                    <div 
                      onClick={() => setPreviewImage(req.receiptImageUrl)}
                      className="relative h-32 rounded-xl overflow-hidden border border-white/10 cursor-zoom-in group bg-[#0a0f1c]"
                    >
                      <img loading="lazy" src={req.receiptImageUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="text-white drop-shadow-md" size={32} />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-6 mt-auto flex gap-4">
                  <button 
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={processingIds.includes(req.id)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.includes(req.id) ? <Loader2 className="animate-spin" size={20} /> : <><XCircle size={20} /> رفض وحذف</>}
                  </button>
                  
                  <button 
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={processingIds.includes(req.id)}
                    className="flex-1 py-3.5 rounded-xl font-black text-white bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                  >
                    {processingIds.includes(req.id) ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> قبول وشحن</>}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl" onClick={() => setPreviewImage(null)}>
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all z-50"
            onClick={() => setPreviewImage(null)}
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      )}

    </div>
  );
}