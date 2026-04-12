"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api"; 
import { 
  Mail, Briefcase, CheckCircle, Loader2, KeyRound, ShieldCheck 
} from "lucide-react";

export default function ManualEnrollmentPage() {
  const [loadingItems, setLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const initialForm = {
    email: "",
    type: "COURSE", 
    itemId: ""
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchItemsByType = async (type: string) => {
    setLoadingItems(true);
    let endpoint = "";
    
    if (type === 'COURSE') endpoint = '/api/courses';
    else if (type === 'WORKSHOP') endpoint = '/api/workshops';
    else if (type === 'BOOTCAMP') endpoint = '/api/bootcamps';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
  credentials: "include" // 👈 إضافة الكوكيز
});
      if(res.ok){
        const data = await res.json();
        setAvailableItems(Array.isArray(data) ? data : []);
      } else {
        setAvailableItems([]);
      }
    } catch (err) { 
      console.error(err);
      setAvailableItems([]);
    }
    finally { setLoadingItems(false); }
  };

  useEffect(() => {
    fetchItemsByType(formData.type);
  }, [formData.type]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.itemId) return alert("الرجاء اختيار المادة/الورشة");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollments/manual-access`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        } as any,
        credentials: "include",
        body: JSON.stringify({
            email: formData.email,
            itemId: formData.itemId,
            type: formData.type // Enum: COURSE, WORKSHOP, BOOTCAMP
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message || 'تم تفعيل الاشتراك بنجاح'}`);
        setFormData({ ...initialForm, type: formData.type }); 
      } else {
        alert(`❌ خطأ: ${data.message || 'فشلت العملية'}`);
      }
    } catch (err) { 
        alert("حدث خطأ في الاتصال بالسيرفر"); 
        console.error(err);
    }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
           {/* Header */}
           <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
             <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400">
               <ShieldCheck size={32} />
             </div>
             <div>
                <h2 className="text-2xl font-black">تفعيل اشتراك يدوي</h2>
                <p className="text-gray-400 text-sm mt-1">امنح صلاحية الوصول لطالب معين عن طريق الإيميل</p>
             </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label htmlFor="emailInput" className="text-xs font-bold text-gray-400 mr-2">بريد الطالب الإلكتروني</label>
                <div className="relative">
                   <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   <input 
                     id="emailInput"
                     name="email" 
                     type="email"
                     value={formData.email} onChange={handleChange} required 
                     className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 outline-none transition-colors" 
                     placeholder="student@example.com"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="typeSelect" className="text-xs font-bold text-gray-400 mr-2">نوع المحتوى</label>
                <div className="relative">
                   <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   <select 
                     id="typeSelect"
                     name="type" 
                     value={formData.type} onChange={handleChange}
                     className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                     aria-label="نوع المحتوى"
                   >
                     <option value="COURSE">مادة مدفوعة (Course)</option>
                     <option value="WORKSHOP">ورشة عمل (Workshop)</option>
                     <option value="BOOTCAMP">معسكر تدريبي (Bootcamp)</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="itemSelect" className="text-xs font-bold text-gray-400 mr-2">اختر المادة / الورشة المراد تفعيلها</label>
                <div className="relative">
                   {loadingItems ? (
                     <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={18} />
                   ) : (
                     <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   )}
                   <select 
                     id="itemSelect"
                     name="itemId" 
                     value={formData.itemId} onChange={handleChange} required
                     className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 outline-none appearance-none disabled:opacity-50 cursor-pointer"
                     disabled={loadingItems}
                     aria-label="اختر المادة"
                   >
                     <option value="">-- اختر من القائمة --</option>
                     {availableItems.map(item => (
                       <option key={item.id} value={item.id}>{item.title}</option>
                     ))}
                   </select>
                </div>
              </div>

              <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 rounded-xl font-bold text-lg shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin"/> : (
                    <>
                        <KeyRound size={20} />
                        تفعيل الاشتراك للطالب
                    </>
                  )}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}