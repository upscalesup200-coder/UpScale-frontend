"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import toast from "react-hot-toast"; 
import { 
  UserPlus, MapPin, Briefcase, Search, Edit, Trash2, 
  CheckCircle, Loader2, Users, Phone, Mail 
} from "lucide-react";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const initialForm = {
    fullName: "",
    email: "", 
    residence: "",
    phone: "",
    type: "COURSE",
    itemId: ""
  };
  const [formData, setFormData] = useState(initialForm);
  const fetchInstructors = async () => {
    try {
const res = await fetch(`${API_BASE_URL}/api/instructors`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setInstructors(Array.isArray(data) ? data : []);
      } else {
          toast.error("حدث خطأ أثناء جلب بيانات المدرسين");
      }
      setLoading(false);
    } catch (err) { 
      console.error(err);
      toast.error("فشل الاتصال بالخادم");
      setLoading(false);
    }
  };

  const fetchItemsByType = async (type: string) => {
    setLoadingItems(true);
    let endpoint = "";
    if (type === 'COURSE') endpoint = '/api/courses';
    else if (type === 'WORKSHOP') endpoint = '/api/workshops';
    else if (type === 'BOOTCAMP') endpoint = '/api/bootcamps';
    else if (type === 'FREE_CONTENT') endpoint = '/api/free-content';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          credentials: "include" 
      });
      
      if (res.ok) {
          const data = await res.json();
          setAvailableItems(Array.isArray(data) ? data : []);
      } else {
          toast.error("فشل جلب قائمة المواد/الورشات");
      }
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoadingItems(false); 
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    fetchItemsByType(formData.type);
  }, [formData.type]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e: any) => {
      setFormData({ ...formData, type: e.target.value, itemId: "" });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.itemId) {
        toast.error("الرجاء اختيار المادة/الورشة");
        return;
    }

    setIsSubmitting(true);
    
    const url = editingId 
      ? `${API_BASE_URL}/api/instructors/${editingId}`
      : `${API_BASE_URL}/api/instructors`;
    
    const method = editingId ? 'PATCH' : 'POST';

    const uploadPromise = fetch(url, {
      method,
      headers: { 
          'Content-Type': 'application/json',
      },
      credentials: "include", 
      body: JSON.stringify(formData)
    }).then(async (res) => {
      const resultData = await res.json();
      if (!res.ok) {
        throw new Error(resultData.message || 'فشلت العملية، تأكد من صحة البيانات');
      }
      return resultData;
    });

    toast.promise(
      uploadPromise,
      {
        loading: 'جاري المعالجة والرفع للسيرفر... يرجى الانتظار وعدم إغلاق الصفحة ⏳',
        success: editingId ? "تم التعديل بنجاح! ✅" : "تمت الإضافة بنجاح! السيرفر أنهى المعالجة ✅",
        error: (err) => `${err.message} ❌`,
      }
    );

    try {
      await uploadPromise;
      setFormData(initialForm);
      setEditingId(null);
      fetchInstructors();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (inst: any) => {
    setEditingId(inst.id);
    
    let currentItemId = "";
    if (inst.type === 'COURSE') currentItemId = inst.courseId;
    else if (inst.type === 'WORKSHOP') currentItemId = inst.workshopId;
    else if (inst.type === 'BOOTCAMP') currentItemId = inst.bootcampId;
    else if (inst.type === 'FREE_CONTENT') currentItemId = inst.freeContentId;

    setFormData({
      fullName: inst.fullName,
      email: inst.email || "", 
      residence: inst.residence,
      phone: inst.phone || "",
      type: inst.type,
      itemId: currentItemId || ""
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المدرس؟")) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/instructors/${id}`, { 
            method: 'DELETE',
            credentials: "include" 
        });
        
        if (res.ok) {
            setInstructors(instructors.filter(i => i.id !== id));
            toast.success("تم حذف المدرس بنجاح 🗑️");
        } else {
            const errorData = await res.json();
            toast.error(errorData.message || "فشل الحذف. قد يكون المدرس مرتبطاً ببيانات أخرى.");
        }
    } catch (error) {
        toast.error("خطأ في الاتصال بالخادم أثناء الحذف.");
    }
  };

  const filteredInstructors = instructors.filter(inst => 
    inst.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inst.residence.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
           {editingId && <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 animate-pulse" />}
           
           <div className="flex items-center gap-4 mb-8">
             <div className={`p-3 rounded-2xl ${editingId ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-600/20 text-blue-400'}`}>
               <Users size={28} />
             </div>
             <h2 className="text-2xl font-black">{editingId ? 'تعديل بيانات المدرس' : 'إضافة مدرس جديد'}</h2>
             {editingId && <button onClick={() => {setEditingId(null); setFormData(initialForm);}} className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">إلغاء التعديل</button>}
           </div>

           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             <div className="space-y-2">
               <label htmlFor="fullNameInput" className="text-xs font-bold text-gray-400 mr-2">اسم المدرس كامل</label>
               <div className="relative">
                  <UserPlus className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    id="fullNameInput"
                    name="fullName" 
                    value={formData.fullName} onChange={handleChange} required 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none" 
                    placeholder="مثال: د. أحمد المحمد"
                  />
               </div>
             </div>

             <div className="space-y-2">
               <label htmlFor="emailInput" className="text-xs font-bold text-gray-400 mr-2">البريد الإلكتروني</label>
               <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    id="emailInput"
                    name="email" 
                    type="email"
                    value={formData.email} onChange={handleChange} required 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none" 
                    placeholder="email@example.com"
                  />
               </div>
             </div>

             <div className="space-y-2">
               <label htmlFor="residenceInput" className="text-xs font-bold text-gray-400 mr-2">مكان الإقامة</label>
               <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    id="residenceInput"
                    name="residence" 
                    value={formData.residence} onChange={handleChange} required 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none" 
                    placeholder="مثال: دمشق، سوريا"
                  />
               </div>
             </div>

             <div className="space-y-2">
               <label htmlFor="phoneInput" className="text-xs font-bold text-gray-400 mr-2">رقم الهاتف</label>
               <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    id="phoneInput"
                    name="phone" 
                    value={formData.phone} onChange={handleChange} required 
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none text-left" dir="ltr"
                    placeholder="0912345678"
                  />
               </div>
             </div>

             <div className="space-y-2">
               <label htmlFor="type-select" className="text-xs font-bold text-gray-400 mr-2">نوع التكليف</label>
               <div className="relative">
                  <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <select 
                    id="type-select"
                    name="type" 
                    value={formData.type} onChange={handleTypeChange}
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none appearance-none"
                    title="نوع التكليف"
                    aria-label="نوع التكليف"
                  >
                    <option value="COURSE">مادة مدفوعة (Course)</option>
                    <option value="WORKSHOP">ورشة عمل (Workshop)</option>
                    <option value="BOOTCAMP">معسكر تدريبي (Bootcamp)</option>
                    <option value="FREE_CONTENT">محتوى مجاني (Free Content)</option>
                  </select>
               </div>
             </div>

             <div className="space-y-2 md:col-span-2">
               <label htmlFor="item-select" className="text-xs font-bold text-gray-400 mr-2">اختر المادة / الورشة</label>
               <div className="relative">
                  {loadingItems ? (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />
                  ) : (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  )}
                  <select 
                    id="item-select"
                    name="itemId" 
                    value={formData.itemId} onChange={handleChange} required
                    className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 pr-12 pl-4 focus:border-blue-500 outline-none appearance-none disabled:opacity-50"
                    disabled={loadingItems}
                    title="اختر المادة"
                    aria-label="اختر المادة"
                  >
                    <option value="">-- اختر من القائمة --</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
               </div>
             </div>

             <div className="md:col-span-2">
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                   ${editingId 
                     ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/20' 
                     : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                   } disabled:opacity-70 disabled:cursor-not-allowed`}
               >
                 {isSubmitting ? <Loader2 className="animate-spin"/> : (editingId ? "حفظ التعديلات" : "إضافة المدرس")}
               </button>
             </div>
           </form>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 flex-wrap gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users size={20} className="text-gray-400" /> قائمة المدرسين ({instructors.length})
                </h3>
                <div className="relative w-full md:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="بحث بالاسم، الإيميل أو الهاتف..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="بحث عن مدرس"
                      className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-2 pr-10 pl-4 text-sm focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden">
               {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32}/></div> : (
                 <div className="overflow-x-auto custom-scrollbar">
                   <table className="w-full text-right">
                     <thead className="bg-black/20 text-gray-400 text-xs font-bold uppercase">
                       <tr>
                         <th className="py-4 px-6">الاسم الكامل</th>
                         <th className="py-4 px-6">معلومات الاتصال</th>
                         <th className="py-4 px-6">التكليف (المحتوى)</th>
                         <th className="py-4 px-6 text-center">الإجراءات</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {filteredInstructors.length > 0 ? filteredInstructors.map((inst) => {
                         const contentTitle = inst.course?.title || inst.workshop?.title || inst.bootcamp?.title || inst.freeContent?.title || "غير محدد";
                         const typeLabel = inst.type === 'COURSE' ? 'مادة' : inst.type === 'WORKSHOP' ? 'ورشة' : inst.type === 'BOOTCAMP' ? 'معسكر' : 'مجاني';
                         const typeColor = inst.type === 'COURSE' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : inst.type === 'WORKSHOP' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : inst.type === 'BOOTCAMP' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

                         return (
                           <tr key={inst.id} className="hover:bg-white/5 transition-colors group">
                             <td className="py-4 px-6 font-bold">
                               <div className="flex flex-col">
                                 <span>{inst.fullName}</span>
                                 <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {inst.residence}</span>
                               </div>
                             </td>
                             <td className="py-4 px-6 text-gray-400">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-gray-500"/> <span dir="ltr" className="text-left">{inst.email}</span></div>
                                  <div className="flex items-center gap-1.5 text-xs"><Phone size={12} className="text-gray-500"/> <span dir="ltr" className="text-left">{inst.phone}</span></div>
                                </div>
                             </td>
                             <td className="py-4 px-6">
                                <div className="flex flex-col gap-1.5">
                                   <span className="font-bold text-sm truncate max-w-[150px]" title={contentTitle}>{contentTitle}</span>
                                   <span className={`text-[10px] font-bold w-fit px-2 py-0.5 rounded-md border ${typeColor}`}>
                                      {typeLabel}
                                   </span>
                                </div>
                             </td>
                             <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleEdit(inst)} 
                                     className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                     title="تعديل بيانات المدرس"
                                     aria-label="تعديل"
                                   >
                                      <Edit size={16} />
                                   </button>
                                   <button 
                                     onClick={() => handleDelete(inst.id)} 
                                     className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                     title="حذف المدرس"
                                     aria-label="حذف"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </td>
                           </tr>
                         );
                       }) : (
                         <tr>
                           <td colSpan={4} className="py-12 text-center text-gray-500">لا يوجد نتائج مطابقة للبحث</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
        </div>

      </div>
    </div>
  );
}