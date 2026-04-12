"use client";
import { useState, useEffect, useRef } from "react";
import { API_ROUTES } from "@/config/api";
import { Upload, Trash2, Edit, Loader2, CheckCircle, Info, DollarSign, Calendar, Clock, Users, Gift, RotateCcw, Zap } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

export default function AddBootcampPage() {
  const [bootcamps, setBootcamps] = useState<any[]>([]);
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
    duration: "", 
    price: "", 
    offerPrice: "", 
    offerEndsAt: "",
    startDate: "", 
    endDate: "", 
    sessionsCount: "", 
    tasksCount: "",
    hasCertificate: true, 
    isPlatformSponsored: false,
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  
  const [files, setFiles] = useState<any>({
    image: null,
    instructorImage: null,
    stamp: null,
  });

  const [previews, setPreviews] = useState<any>({
    image: null,
    instructorImage: null,
    stamp: null,
  });

  const fetchBootcamps = async () => {
    try {
      const res = await fetch(API_ROUTES.BOOTCAMPS);
      const data = await res.json();
      setBootcamps(Array.isArray(data) ? data : []);
      setIsLoadingList(false);
    } catch (err) {
      console.error(err);
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBootcamps();
  }, []);

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

  const handleRemoveFile = (name: string) => {
    if (previews[name] && previews[name].startsWith('blob:')) {
      URL.revokeObjectURL(previews[name]);
    }
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: null });
  };

  const handleEditClick = (bootcamp: any) => {
    setEditingId(bootcamp.id);
    
    setFormData({
      ...bootcamp,
      instructorBio: bootcamp.instructorBio || "", 
      startDate: bootcamp.startDate ? bootcamp.startDate.split('T')[0] : "",
      endDate: bootcamp.endDate ? bootcamp.endDate.split('T')[0] : "",
      offerEndsAt: bootcamp.offerEndsAt ? bootcamp.offerEndsAt.split('T')[0] : "",
      offerPrice: bootcamp.offerPrice !== null ? bootcamp.offerPrice : "", 
    });

    setPreviews({
      image: getImageUrl(bootcamp.imageUrl, 'bootcamp'),
      instructorImage: getImageUrl(bootcamp.instructorImage, 'avatar'),
      stamp: getImageUrl(bootcamp.stampUrl),
    });

    setFiles({ image: null, instructorImage: null, stamp: null });
    
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    
    Object.values(previews).forEach(preview => {
      if (typeof preview === 'string' && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    });

    setFiles({ image: null, instructorImage: null, stamp: null });
    setPreviews({ image: null, instructorImage: null, stamp: null });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!editingId && !files.image) {
      return alert("⚠️ يرجى اختيار صورة غلاف المعسكر");
    }

    if (formData.offerPrice && Number(formData.offerPrice) >= Number(formData.price)) {
      return alert("⚠️ لا يمكن أن يكون سعر العرض مساوياً أو أكبر من السعر الأساسي!");
    }

    setIsSubmitting(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && !key.includes('Url') && !key.includes('Image')) {
             if (formData[key] !== null && formData[key] !== "") {
                 // إرسال القيم البوليانية بوضوح ليتمكن الباك إند من قراءتها
                 data.append(key, String(formData[key])); 
             }
        }
    });

    if (files.image) data.append('image', files.image);
    if (files.instructorImage) data.append('instructorImage', files.instructorImage);
    if (files.stamp && formData.isPlatformSponsored) data.append('stamp', files.stamp);

    try {
      const url = editingId 
        ? API_ROUTES.BOOTCAMP_DETAILS(editingId) 
        : API_ROUTES.BOOTCAMPS;
        
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, { 
        method, 
        body: data 
      });
      
      if (res.ok) {
        alert(editingId ? "✅ تم تعديل بيانات المعسكر بنجاح!" : "✅ تم نشر المعسكر الجديد بنجاح!");
        handleCancelEdit();
        fetchBootcamps();
      } else {
        const errorData = await res.json();
        alert(`❌ فشل العملية: ${errorData.message || "تأكد من صحة البيانات"}`);
      }
    } catch (err) {
      alert("❌ حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعسكر؟")) return;
    try {
      const res = await fetch(API_ROUTES.BOOTCAMP_DETAILS(id), { 
        method: 'DELETE'
      });
      if (res.ok) {
        setBootcamps(bootcamps.filter(b => b.id !== id));
        if (editingId === id) handleCancelEdit();
      } else {
        alert("فشل الحذف، تأكد من الصلاحيات");
      }
    } catch (err) {
      alert("خطأ في الحذف");
    }
  };


  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div ref={formTopRef} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          
          {editingId && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse" />}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${editingId ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-600/20 text-purple-500'}`}>
                {editingId ? <Edit size={24} aria-hidden="true" /> : <Zap size={24} aria-hidden="true" />}
              </div>
              <h1 className="text-3xl font-black">{editingId ? 'تعديل بيانات المعسكر' : 'إضافة معسكر تدريبي جديد'}</h1>
            </div>
            
            {editingId && (
                <button onClick={handleCancelEdit} type="button" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
                    <RotateCcw size={16} aria-hidden="true" /> إلغاء التعديل
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="اسم المعسكر" name="title" icon={Info} value={formData.title} onChange={handleChange} required />
               <Input label="اسم المدرب المسؤول" name="instructorName" icon={Users} value={formData.instructorName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">وصف المعسكر</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-pink-500 transition-colors custom-scrollbar"
                  placeholder="لمحة عامة عن المعسكر وأهدافه..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">نبذة عن المدرب</label>
                <textarea 
                  name="instructorBio" 
                  value={formData.instructorBio}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-pink-500 transition-colors custom-scrollbar"
                  placeholder="الخبرات، المشاريع السابقة، الشهادات..."
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">ماذا سيتعلم المتدرب؟</label>
                <textarea 
                  name="learningOutcomes" 
                  value={formData.learningOutcomes}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-pink-500 transition-colors custom-scrollbar"
                  placeholder="المحاور التدريبية، التقنيات المستخدمة..."
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <Input label="السعر الأساسي ($)" name="price" type="number" min="0" step="0.01" icon={DollarSign} value={formData.price} onChange={handleChange} required />
              <Input label="سعر العرض ($)" name="offerPrice" type="number" min="0" step="0.01" icon={Gift} value={formData.offerPrice} onChange={handleChange} />
              <Input label="نهاية العرض" name="offerEndsAt" type="date" value={formData.offerEndsAt} onChange={handleChange} />
              <Input label="المدة (أشهر/أسابيع)" name="duration" icon={Clock} value={formData.duration} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="تاريخ الانطلاق" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              <Input label="تاريخ الانتهاء" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              <Input label="عدد الجلسات" name="sessionsCount" type="number" min="1" value={formData.sessionsCount} onChange={handleChange} required />
              <Input label="المشاريع العملية" name="tasksCount" type="number" min="0" value={formData.tasksCount} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileInput 
                label="صورة غلاف المعسكر" 
                name="image" 
                onChange={handleFileChange} 
                preview={previews.image} 
                onRemove={() => handleRemoveFile('image')} 
              />
              <FileInput 
                label="صورة المدرب" 
                name="instructorImage" 
                onChange={handleFileChange} 
                preview={previews.instructorImage} 
                onRemove={() => handleRemoveFile('instructorImage')} 
              />
              {formData.isPlatformSponsored && (
                <FileInput 
                  label="الختم الرسمي" 
                  name="stamp" 
                  onChange={handleFileChange} 
                  preview={previews.stamp} 
                  onRemove={() => handleRemoveFile('stamp')} 
                />
              )}
            </div>

            <div className="flex flex-wrap gap-8 p-6 bg-pink-500/5 rounded-3xl border border-pink-500/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="hasCertificate" checked={formData.hasCertificate} onChange={handleChange} className="w-5 h-5 accent-pink-600 rounded" />
                <span className="font-bold text-sm group-hover:text-pink-400">شهادة إتمام معتمدة</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isPlatformSponsored" checked={formData.isPlatformSponsored} onChange={handleChange} className="w-5 h-5 accent-pink-600 rounded" />
                <span className="font-bold text-sm group-hover:text-pink-400">برعاية المنصة (Official)</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 bg-gradient-to-r ${editingId ? 'from-pink-600 to-purple-600 shadow-pink-500/20' : 'from-purple-600 to-pink-600 shadow-purple-500/20'} rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50`}
            >
              {isSubmitting ? "جاري المعالجة..." : (editingId ? "حفظ التعديلات" : "إطلاق المعسكر 🚀")}
            </button>
          </form>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            المعسكرات النشطة حالياً
            <span className="text-sm font-normal text-gray-500 bg-white/5 px-4 py-1 rounded-full">{bootcamps.length}</span>
          </h2>

          {isLoadingList ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-500 font-bold">جاري تحديث القائمة...</p>
            </div>
          ) : bootcamps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا يوجد معسكرات مسجلة حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-xs font-black uppercase tracking-widest">
                    <th className="pb-6 pr-4">المعسكر</th>
                    <th className="pb-6">المدرب</th>
                    <th className="pb-6">الرسوم</th>
                    <th className="pb-6">النوع</th>
                    <th className="pb-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bootcamps.map((b) => (
                    <tr key={b.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <img src={getImageUrl(b.imageUrl, 'bootcamp') || ""} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                          <span className="font-bold">{b.title}</span>
                        </div>
                      </td>
                      <td className="py-6 text-gray-400 font-bold">{b.instructorName}</td>
                      <td className="py-6 font-black text-green-400">
                        {b.offerPrice ? `$${b.offerPrice}` : `$${b.price}`}
                      </td>
                      <td className="py-6">
                        {b.isPlatformSponsored ? (
                          <span className="text-[10px] bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full border border-pink-500/20 font-bold">رسمي</span>
                        ) : (
                          <span className="text-[10px] bg-gray-500/10 text-gray-400 px-3 py-1 rounded-full border border-gray-500/20 font-bold">خارجي</span>
                        )}
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(b)} 
                            className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                            aria-label="تعديل المعسكر"
                            title="تعديل"
                          >
                            <Edit size={18} aria-hidden="true" />
                          </button>
                          <button 
                            onClick={() => handleDelete(b.id)} 
                            className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            aria-label="حذف المعسكر"
                            title="حذف"
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 ${Icon ? 'pr-12' : 'pr-4'} pl-4 text-sm focus:outline-none focus:border-pink-500 transition-colors`} 
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
        <div className="relative w-full h-32 rounded-3xl overflow-hidden border border-pink-500/50 group">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              type="button" 
              onClick={onRemove} 
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              aria-label="إزالة الصورة"
              title="إزالة الصورة"
            >
              <Trash2 size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-pink-500/50 transition-all group h-32">
          <Upload className="text-gray-500 mb-2 group-hover:text-pink-500" size={24} aria-hidden="true" />
          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">اضغط للرفع</span>
          <input type="file" name={name} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}