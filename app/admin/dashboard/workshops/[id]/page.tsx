"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { Upload, Save, ArrowRight, Loader2, Info, Users, DollarSign, Gift, Clock, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditWorkshopPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [fetchError, setFetchError] = useState(false); 
  const [files, setFiles] = useState<any>({});
  const [previews, setPreviews] = useState<any>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/workshops/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Workshop not found");
        return res.json();
      })
      .then(data => {
        if(data.startDate) data.startDate = data.startDate.split('T')[0];
        if(data.endDate) data.endDate = data.endDate.split('T')[0];
        if(data.offerEndsAt) data.offerEndsAt = data.offerEndsAt.split('T')[0];
        setFormData(data);
      })
      .catch(err => {
        console.error("Error fetching workshop:", err);
        setFetchError(true);
      });

      return () => {
        Object.values(previews).forEach((preview: any) => {
          if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        });
      };
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e: any) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles?.[0]) {
      const file = uploadedFiles[0];
      
      if (previews[name] && previews[name].startsWith('blob:')) {
        URL.revokeObjectURL(previews[name]);
      }

      setFiles({ ...files, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
      
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (formData.offerPrice && Number(formData.offerPrice) >= Number(formData.price)) {
        return alert("⚠️ لا يمكن أن يكون سعر العرض مساوياً أو أكبر من السعر الأساسي!");
    }

    setIsSubmitting(true);
    const data = new FormData();

    Object.keys(formData).forEach(key => {
        const value = formData[key];
        if(key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && !key.includes('Image') && key !== 'stampUrl') {
            if (value !== null && value !== undefined && value !== "") {
                data.append(key, String(value));
            }
        }
    });

    if (files.image) data.append('image', files.image);
    if (files.instructorImage) data.append('instructorImage', files.instructorImage);
    if (files.stamp && formData.isPlatformSponsored) data.append('stamp', files.stamp);

    try {
      const res = await fetch(`${API_BASE_URL}/api/workshops/${id}`, {
        method: 'PATCH',
        body: data, 
      });

      if (res.ok) {
        alert("✅ تم تعديل بيانات الورشة بنجاح!");
        router.push('/admin/dashboard/workshops/add');
      } else {
        const errorData = await res.json();
        console.error(errorData); 
        alert(`❌ فشل الحفظ! ${errorData.message || "تأكد من البيانات المدخلة."}`);
      }
    } catch (err) {
      alert("❌ خطأ في الاتصال بالسيرفر");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4">
      <div className="p-4 bg-red-500/20 text-red-500 rounded-full"><Info size={40} /></div>
      <p className="text-xl font-bold">عذراً، لم يتم العثور على الورشة أو حدث خطأ.</p>
      <Link href="/admin/dashboard/workshops/add" className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">العودة للقائمة</Link>
    </div>
  );

  if (!formData) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
      <p>جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32">
      <div className="max-w-5xl mx-auto bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black">تعديل الورشة: {formData.title}</h1>
            <Link href="/admin/dashboard/workshops/add" className="text-gray-400 hover:text-white flex items-center gap-2 font-bold px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                <ArrowRight size={18} /> إلغاء وعودة
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="عنوان الورشة" name="title" icon={Info} value={formData.title} onChange={handleChange} required />
               <Input label="اسم المدرب" name="instructorName" icon={Users} value={formData.instructorName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-bold text-gray-400 mr-2">نبذة عن الورشة</label>
                <textarea 
                  id="description"
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="learningOutcomes" className="text-xs font-bold text-gray-400 mr-2">ماذا سيتعلم الطالب؟</label>
                <textarea 
                  id="learningOutcomes"
                  name="learningOutcomes" 
                  value={formData.learningOutcomes}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <Input label="السعر الأساسي" name="price" type="number" min="0" step="1" icon={DollarSign} value={formData.price} onChange={handleChange} required />
              <Input label="سعر العرض" name="offerPrice" type="number" min="0" step="1" icon={Gift} value={formData.offerPrice || ''} onChange={handleChange} />
              <Input label="نهاية العرض" name="offerEndsAt" type="date" value={formData.offerEndsAt || ''} onChange={handleChange} />
              <Input label="المدة" name="duration" icon={Clock} value={formData.duration} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="تاريخ الانطلاق" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              <Input label="تاريخ الانتهاء" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              <Input label="عدد الجلسات" name="sessionsCount" type="number" min="1" value={formData.sessionsCount} onChange={handleChange} required />
              <Input label="عدد المهام" name="tasksCount" type="number" min="0" value={formData.tasksCount} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400">صورة الورشة</span>
                  <div className="h-32 rounded-xl border-2 border-dashed border-white/20 mb-2 bg-white/5 flex items-center justify-center overflow-hidden relative group">
                    {(previews.image || formData.imageUrl) ? (
                        <img 
                            src={previews.image || `${API_BASE_URL}${formData.imageUrl}`} 
                            alt="معاينة الورشة" 
                            className="w-full h-full object-cover transition-all group-hover:scale-105" 
                        />
                    ) : <span className="text-xs text-gray-500">لا توجد صورة</span>}
                  </div>
                  <FileInput label="اختيار صورة جديدة" name="image" onChange={handleFileChange} />
              </div>
              
              <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400">صورة المدرب</span>
                  <div className="h-32 rounded-xl border-2 border-dashed border-white/20 mb-2 bg-white/5 flex items-center justify-center overflow-hidden relative group">
                    {(previews.instructorImage || formData.instructorImage) ? (
                        <img 
                            src={previews.instructorImage || `${API_BASE_URL}${formData.instructorImage}`} 
                            alt="معاينة المدرب" 
                            className="w-full h-full object-cover transition-all group-hover:scale-105" 
                        />
                    ) : <span className="text-xs text-gray-500">لا توجد صورة</span>}
                  </div>
                  <FileInput label="اختيار صورة جديدة" name="instructorImage" onChange={handleFileChange} />
              </div>

              {formData.isPlatformSponsored && (
                <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400">الختم الإلكتروني</span>
                    <div className="h-32 rounded-xl border-2 border-dashed border-white/20 mb-2 bg-white/5 flex items-center justify-center overflow-hidden relative group">
                       {(previews.stamp || formData.stampUrl) ? (
                         <img 
                           src={previews.stamp || `${API_BASE_URL}${formData.stampUrl}`} 
                           alt="معاينة الختم" 
                           className="w-full h-full object-contain transition-all group-hover:scale-105" 
                         />
                       ) : <span className="text-xs text-gray-500">لا يوجد ختم</span>}
                    </div>
                    <FileInput label="اختيار ختم جديد" name="stamp" onChange={handleFileChange} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-8 p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="hasCertificate" checked={formData.hasCertificate} onChange={handleChange} className="w-5 h-5 accent-purple-600 rounded" />
                <span className="font-bold text-sm group-hover:text-purple-400">شهادة إتمام</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isPlatformSponsored" checked={formData.isPlatformSponsored} onChange={handleChange} className="w-5 h-5 accent-purple-600 rounded" />
                <span className="font-bold text-sm group-hover:text-purple-400">مقدمة من المنصة</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-blue-600 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              حفظ التعديلات
            </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, icon: Icon, onChange, value, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-xs font-bold text-gray-400 mr-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />}
        <input 
          id={name}
          name={name}
          type={type}
          value={value ?? ""} 
          onChange={onChange}
          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 ${Icon ? 'pr-12' : 'pr-4'} pl-4 text-sm focus:outline-none focus:border-purple-500 transition-colors`}
          {...props}
        />
      </div>
    </div>
  );
}

function FileInput({ label, name, onChange }: any) {
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center p-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group w-full">
        <Upload className="text-gray-500 mb-1 group-hover:text-blue-500" size={18} aria-hidden="true" />
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">{label}</span>
        <input type="file" name={name} onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}