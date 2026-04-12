"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  Upload, Trash2, Edit, Loader2, CheckCircle, 
  Gift, Users, FileText, HelpCircle, PlayCircle, RotateCcw,
  Award, Target, UserCheck, CheckSquare, GraduationCap
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; 

export default function AddFreeContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

 const initialFormState = {
    title: "", 
    instructorName: "", 
    instructorBio: "",     
    description: "", 
    learningOutcomes: "",   
    sessionsCount: 0, 
    quizzesCount: "", 
    tasksCount: 0,    
    examsCount: 0,    
    isPlatformSponsored: false,
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  const [files, setFiles] = useState<any>({ image: null, stamp: null });
  const [previews, setPreviews] = useState<any>({ image: null, stamp: null });

  const fetchContents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/free-content`);
      const data = await res.json();
      setContents(Array.isArray(data) ? data : []);
      setIsLoadingList(false);
    } catch (err) {
      console.error(err);
      toast.error("فشل في جلب المحتوى المجاني");
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e: any) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles?.[0]) {
      const f = uploadedFiles[0];
      
      if (previews[name] && previews[name].startsWith('blob:')) {
        URL.revokeObjectURL(previews[name]);
      }

      setFiles({ ...files, [name]: f });
      setPreviews({ ...previews, [name]: URL.createObjectURL(f) });
      
      e.target.value = '';
    }
  };

  const handleRemoveFile = (name: string) => {
    if (previews[name] && previews[name].startsWith('blob:')) {
      URL.revokeObjectURL(previews[name]);
    }
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: null });
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      instructorName: item.instructorName,
      instructorBio: item.instructorBio || "",         
      description: item.description,
      learningOutcomes: item.learningOutcomes || "",   
      sessionsCount: item.sessionsCount,
      quizzesCount: item.quizzesCount,
      tasksCount: item.tasksCount || 0,
      examsCount: item.examsCount || 0,
      isPlatformSponsored: item.isPlatformSponsored || false,
    });
    
    setPreviews({
      image: item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : null,
      stamp: item.stampUrl ? `${API_BASE_URL}${item.stampUrl}` : null,
    });
    
    setFiles({ image: null, stamp: null });
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    
    Object.values(previews).forEach(preview => {
      if (typeof preview === 'string' && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    });

    setFiles({ image: null, stamp: null });
    setPreviews({ image: null, stamp: null });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!editingId && !files.image) {
        return toast.error("⚠️ يرجى اختيار صورة للمحتوى");
    }

    setIsSubmitting(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
            data.append(key, String(formData[key]));
        }
    });

    if (files.image) data.append('image', files.image);
    if (formData.isPlatformSponsored && files.stamp) data.append('stamp', files.stamp);

    const toastId = toast.loading("جاري حفظ المحتوى...");

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/free-content/${editingId}` 
        : `${API_BASE_URL}/api/free-content`;
        
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, { 
        method, 
        body: data 
      });
      
      if (res.ok) {
        toast.success(editingId ? "تم التعديل بنجاح!" : "تم النشر بنجاح!", { id: toastId });
        handleCancelEdit();
        fetchContents();
      } else {
        const errorData = await res.json();
        toast.error(`فشل: ${errorData.message || "تأكد من البيانات"}`, { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return;
    
    const toastId = toast.loading("جاري الحذف...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/free-content/${id}`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        setContents(contents.filter(c => c.id !== id));
        if (editingId === id) handleCancelEdit();
        toast.success("تم الحذف بنجاح", { id: toastId });
      } else {
        toast.error("فشل الحذف، تأكد من الصلاحيات", { id: toastId });
      }
    } catch (err) {
      toast.error("خطأ في الاتصال أثناء الحذف", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div ref={formTopRef} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          
          {editingId && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 animate-pulse" />}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${editingId ? 'bg-yellow-500/20 text-yellow-400' : 'bg-amber-600/20 text-amber-500'}`}>
                {editingId ? <Edit size={24} aria-hidden="true" /> : <Gift size={24} aria-hidden="true" />}
              </div>
              <h1 className="text-3xl font-black">{editingId ? 'تعديل المحتوى' : 'إضافة محتوى مجاني جديد'}</h1>
            </div>
            
            {editingId && (
                <button 
                  onClick={handleCancelEdit} 
                  type="button"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
                >
                    <RotateCcw size={16} aria-hidden="true" /> إلغاء
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="اسم المادة" name="title" icon={FileText} value={formData.title} onChange={handleChange} required />
               <Input label="استاذ المادة" name="instructorName" icon={Users} value={formData.instructorName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-2"><UserCheck size={14}/> نبذة عن المدرب</label>
                <textarea 
                  name="instructorBio" 
                  value={formData.instructorBio}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-24 focus:outline-none focus:border-amber-500 transition-colors custom-scrollbar"
                  placeholder="مثال: مهندس برمجيات بخبرة 10 سنوات في شركات تقنية..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-2"><Target size={14}/> محاور المحتوى (ماذا سيتعلم الطالب؟)</label>
                <textarea 
                  name="learningOutcomes" 
                  value={formData.learningOutcomes}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-amber-500 transition-colors custom-scrollbar"
                  placeholder="اكتب كل محور في سطر جديد..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">وصف مختصر للمادة</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-24 focus:outline-none focus:border-amber-500 transition-colors custom-scrollbar"
                  placeholder="وصف مختصر يظهر في البطاقات..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-500/5 p-6 rounded-3xl border border-amber-500/10">
                <Input 
                    label="عدد الكويزات" 
                    name="quizzesCount" 
                    type="number" 
                    min="0" 
                    icon={HelpCircle} 
                    value={formData.quizzesCount} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                <label className="flex items-center gap-4 cursor-pointer group w-fit">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.isPlatformSponsored ? 'bg-amber-500 border-amber-500' : 'border-gray-500 group-hover:border-amber-400'}`}>
                        {formData.isPlatformSponsored && <CheckCircle size={16} className="text-black" />}
                    </div>
                    <input 
                        type="checkbox" 
                        name="isPlatformSponsored" 
                        checked={formData.isPlatformSponsored} 
                        onChange={handleChange} 
                        className="hidden" 
                    />
                    <span className={`font-bold transition-colors ${formData.isPlatformSponsored ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'}`}>
                        تفعيل رعاية المنصة (إضافة ختم رسمي)
                    </span>
                </label>

                {formData.isPlatformSponsored && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <FileInput 
                            label="الختم الرسمي للمنصة" 
                            name="stamp" 
                            onChange={handleFileChange} 
                            preview={previews.stamp} 
                            onRemove={() => handleRemoveFile('stamp')}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2">
               <FileInput 
                  label="صورة المادة (الغلاف)" 
                  name="image" 
                  onChange={handleFileChange} 
                  preview={previews.image} 
                  onRemove={() => handleRemoveFile('image')}
               />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 bg-gradient-to-r ${editingId ? 'from-amber-600 to-yellow-600 shadow-amber-500/20' : 'from-yellow-600 to-amber-600 shadow-yellow-500/20'} rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50`}
            >
              {isSubmitting ? "جاري المعالجة..." : (editingId ? "حفظ التعديلات" : "نشر المحتوى المجاني 🎁")}
            </button>
          </form>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
             <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-xs font-black uppercase tracking-widest">
                    <th className="pb-6 pr-4">المادة</th>
                    <th className="pb-6">الأستاذ</th>
                    <th className="pb-6 text-center">الحالة</th>
                    <th className="pb-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contents.map((c) => (
                    <tr key={c.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <img src={c.imageUrl ? `${API_BASE_URL}${c.imageUrl}` : '/placeholder.jpg'} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                          <span className="font-bold">{c.title}</span>
                        </div>
                      </td>
                      <td className="py-6 text-gray-400 font-bold">{c.instructorName}</td>
                      <td className="py-6 text-center">
                          {c.isPlatformSponsored && (
                              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-500/30">
                                  <Award size={12} /> رسمي
                              </span>
                          )}
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEditClick(c)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all" aria-label="تعديل"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all" aria-label="حذف"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 8px;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.5); border-radius: 8px;}
      `}</style>
    </div>
  );
}

function Input({ label, name, icon: Icon, onChange, value, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 mr-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />}
        <input 
          name={name} type={type} 
          value={value ?? ""} 
          onChange={onChange} 
          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 ${Icon ? 'pr-12' : 'pr-4'} pl-4 text-sm focus:outline-none focus:border-amber-500 transition-colors`} 
          {...props} 
        />
      </div>
    </div>
  );
}

function FileInput({ label, name, onChange, preview, onRemove }: any) {
    return (
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400 mr-2">{label}</span>
        {preview ? (
          <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-amber-500/50 group">
            <img src={preview} alt="preview" className="w-full h-full object-contain bg-black/40" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                type="button" 
                onClick={onRemove} 
                className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                title="إزالة الصورة"
              >
                <Trash2 size={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-amber-500/50 transition-all group h-48">
            <Upload className="text-gray-500 mb-2 group-hover:text-amber-500" size={32} aria-hidden="true" />
            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300">اضغط لرفع {label}</span>
            <input type="file" name={name} onChange={onChange} className="hidden" />
          </label>
        )}
      </div>
    );
}