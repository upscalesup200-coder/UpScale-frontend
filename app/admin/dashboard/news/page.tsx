"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  Trash2, Plus, Megaphone, Loader2, Save, X, Image as ImageIcon, Calendar, User 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; 

export default function NewsManagementPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    publisher: "Up Scale Admin"
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/news`);
      
      if (!res.ok) throw new Error("فشل في جلب الأخبار");
      
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء جلب الأخبار");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ title: "", content: "", publisher: "Up Scale Admin" });
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("publisher", formData.publisher);
    if (file) data.append("image", file);

    const toastId = toast.loading("جاري نشر الخبر...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/news`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        toast.success("تم نشر الخبر بنجاح!", { id: toastId });
        resetForm();
        fetchNews(); 
      } else {
        const errData = await res.json();
        toast.error(errData.message || "حدث خطأ أثناء النشر", { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

    const toastId = toast.loading("جاري حذف الخبر...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNewsList(newsList.filter((news) => news.id !== id));
        toast.success("تم حذف الخبر بنجاح", { id: toastId });
      } else {
        toast.error("فشل الحذف، تأكد من الصلاحيات", { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-red-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-24 font-sans" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Megaphone className="text-red-500" size={32} />
              إدارة شريط الأخبار
            </h1>
            <p className="text-gray-400 mt-2">نشر التحديثات والإعلانات في الشريط المتحرك على الرئيسية.</p>
          </div>
          <button 
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                showForm 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
            }`}
          >
            {showForm ? <><X size={20} /> إلغاء</> : <><Plus size={20} /> خبر جديد</>}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-6 border-b border-white/5 pb-4">إضافة خبر جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="news-title" className="text-sm font-bold text-gray-400">عنوان الخبر</label>
                  <input 
                    id="news-title"
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="مثال: خصم 50% على جميع الكورسات..." 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="news-publisher" className="text-sm font-bold text-gray-400">الجهة الناشرة</label>
                  <input 
                    id="news-publisher"
                    type="text" 
                    name="publisher" 
                    value={formData.publisher} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="news-content" className="text-sm font-bold text-gray-400">تفاصيل الخبر</label>
                <textarea 
                  id="news-content"
                  name="content" 
                  value={formData.content} 
                  onChange={handleChange} 
                  required 
                  placeholder="اكتب تفاصيل الإعلان أو الخبر هنا..." 
                  className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-4 px-4 h-32 focus:border-red-500 outline-none transition-colors custom-scrollbar"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-bold text-gray-400">صورة الخبر (اختياري - يظهر كأيقونة صغيرة)</span>
                <div className="flex items-center gap-6">
                    <label htmlFor="news-image" className="cursor-pointer flex items-center gap-3 bg-[#0f172a] border border-dashed border-white/20 px-6 py-4 rounded-xl hover:border-red-500 hover:text-red-400 transition-all">
                        <ImageIcon size={20} />
                        <span className="text-sm font-bold">رفع صورة</span>
                    </label>
                    <input 
                        id="news-image" 
                        type="file" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*" 
                    />
                    
                    {preview && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> نشر الخبر</>}
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {newsList.length > 0 ? (
            newsList.map((news) => (
              <div key={news.id} className="group flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all hover:bg-white/[0.07]">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                    {news.imageUrl ? (
                        <img 
                          src={`${API_BASE_URL}${news.imageUrl}`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                    ) : (
                        <Megaphone size={20} className="text-gray-500" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">{news.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><User size={12} /> {news.publisher}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> 
                          {news.publishDate ? new Date(news.publishDate).toLocaleDateString('ar-EG') : 'تاريخ غير محدد'}
                        </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(news.id)}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="حذف الخبر"
                  aria-label="حذف الخبر"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Megaphone size={48} className="mx-auto mb-4 opacity-20" />
                <p>لا يوجد أخبار منشورة حالياً</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}