"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL, API_ROUTES } from "@/config/api";
import { Trash2, PlusCircle, Star, Layers, Flame, BookOpen, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getImageUrl } from "@/utils/imageHelper";

export default function FeaturedManagerPage() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedType, setSelectedType] = useState<'COURSE' | 'WORKSHOP' | 'BOOTCAMP'>('COURSE');
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeatured = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/featured`);
      if (res.ok) {
        const data = await res.json();
        setFeaturedItems(data);
      }
    } catch (err) { 
      console.error(err); 
      toast.error("حدث خطأ أثناء جلب القائمة");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    let endpoint = "";
    if (selectedType === 'COURSE') endpoint = API_ROUTES.COURSES;
    if (selectedType === 'WORKSHOP') endpoint = API_ROUTES.WORKSHOPS;
    if (selectedType === 'BOOTCAMP') endpoint = API_ROUTES.BOOTCAMPS;

    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setAvailableItems(Array.isArray(data) ? data : []);
      }
      setSelectedItemId(""); 
    } catch (err) { 
      console.error(err); 
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    fetchAvailableItems();
  }, [selectedType]);

  const handleAdd = async () => {
    if (!selectedItemId) return toast.error("الرجاء اختيار عنصر من القائمة");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, itemId: selectedItemId })
      });
      
      if (res.ok) {
        await fetchFeatured(); 
        toast.success("تمت الإضافة لقائمة الأكثر طلباً بنجاح ✅");
        setSelectedItemId(""); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "فشل في الإضافة، قد يكون العنصر موجوداً بالفعل.");
      }
    } catch (err) { 
      toast.error("حدث خطأ في الاتصال بالخادم"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("هل أنت متأكد من إزالة هذا العنصر من القائمة؟")) return;
    
    const toastId = toast.loading("جاري الإزالة...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/featured/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeaturedItems(prev => prev.filter(item => item.id !== id));
        toast.success("تمت الإزالة بنجاح", { id: toastId });
      } else {
        toast.error("فشل في إزالة العنصر", { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال", { id: toastId });
    }
  };

  const alreadyFeaturedIds = featuredItems.map(item => item.course?.id || item.workshop?.id || item.bootcamp?.id);
  const filteredAvailableItems = availableItems.filter(item => !alreadyFeaturedIds.includes(item.id));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32">
      <Toaster position="top-center" /> 
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
           <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
             <Star className="text-yellow-400 fill-yellow-400" /> إدارة "الأكثر طلباً"
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">نوع المحتوى</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full bg-[#0f172a] border border-white/20 rounded-xl p-3 focus:border-blue-500 outline-none"
                  aria-label="نوع المحتوى"
                >
                  <option value="COURSE">مادة أكاديمية</option>
                  <option value="WORKSHOP">ورشة عمل</option>
                  <option value="BOOTCAMP">معسكر تدريبي</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">اختر العنصر</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/20 rounded-xl p-3 focus:border-blue-500 outline-none"
                  aria-label="اختر العنصر"
                >
                  <option value="">-- اختر --</option>
                  {filteredAvailableItems.length === 0 ? (
                    <option value="" disabled>جميع العناصر مضافة أو لا يوجد عناصر</option>
                  ) : (
                    filteredAvailableItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))
                  )}
                </select>
              </div>

              <button 
                onClick={handleAdd}
                disabled={isSubmitting || !selectedItemId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin"/> : <PlusCircle />} إضافة للقائمة
              </button>
           </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
           <h3 className="text-xl font-bold mb-6 text-gray-300">القائمة الحالية ({featuredItems.length})</h3>
           
           {loading ? <Loader2 className="animate-spin mx-auto text-blue-500"/> : (
             <div className="space-y-4">
               {featuredItems.map((item) => {
                 const data = item.course || item.workshop || item.bootcamp;
                 const typeLabel = item.course ? 'مادة' : (item.workshop ? 'ورشة' : 'معسكر');
                 const typeColor = item.course ? 'text-blue-400 bg-blue-400/10' : (item.workshop ? 'text-emerald-400 bg-emerald-400/10' : 'text-pink-400 bg-pink-400/10');
                 const Icon = item.course ? BookOpen : (item.workshop ? Layers : Flame);

                 if (!data) return null;

                 return (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={getImageUrl(data.imageUrl, typeLabel === 'مادة' ? 'course' : typeLabel === 'ورشة' ? 'workshop' : 'bootcamp') || ""} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />                         <div>
                            <h4 className="font-bold text-lg">{data.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 w-fit mt-1 border ${typeColor.replace('bg-', 'border-')}`}>
                              <Icon size={12} /> {typeLabel}
                            </span>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors bg-red-400/10"
                        aria-label="إزالة العنصر"
                        title="إزالة العنصر"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                 );
               })}
               {featuredItems.length === 0 && (
                  <div className="text-center py-10">
                      <Star className="mx-auto text-gray-600 mb-3" size={40} />
                      <p className="text-gray-500">لا يوجد عناصر مميزة حالياً.</p>
                  </div>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}