"use client";
import { useState, useEffect, useRef } from "react";
import { API_ROUTES } from "@/config/api";
import { Upload, Trash2, Edit, Loader2, CheckCircle, Info, DollarSign, Calendar, Clock, Users, Gift, RotateCcw } from "lucide-react";
import { Banknote } from "lucide-react"; 
import { getImageUrl } from "@/utils/imageHelper";

export default function AddWorkshopPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
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

  const fetchWorkshops = async () => {
    try {
      const res = await fetch(API_ROUTES.WORKSHOPS);
      if (res.ok) {
        const data = await res.json();
        setWorkshops(Array.isArray(data) ? data : []);
      }
      setIsLoadingList(false);
    } catch (err) {
      console.error(err);
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
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

  const handleEditClick = (workshop: any) => {
    setEditingId(workshop.id);
    
    setFormData({
      ...workshop,
      instructorBio: workshop.instructorBio || "", 
      startDate: workshop.startDate ? workshop.startDate.split('T')[0] : "",
      endDate: workshop.endDate ? workshop.endDate.split('T')[0] : "",
      offerEndsAt: workshop.offerEndsAt ? workshop.offerEndsAt.split('T')[0] : "",
      offerPrice: workshop.offerPrice !== null ? workshop.offerPrice : "", 
    });

    setPreviews({
      image: getImageUrl(workshop.imageUrl, 'workshop'),
      instructorImage: getImageUrl(workshop.instructorImage, 'avatar'),
      stamp: getImageUrl(workshop.stampUrl),
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
      return alert("⚠️ يرجى اختيار صورة رئيسية للورشة");
    }

    if (formData.offerPrice && Number(formData.offerPrice) >= Number(formData.price)) {
      return alert("⚠️ لا يمكن أن يكون سعر العرض مساوياً أو أكبر من السعر الأساسي!");
    }

    setIsSubmitting(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && !key.includes('Url') && !key.includes('Image')) {
             if (formData[key] !== null && formData[key] !== "") {
                 data.append(key, String(formData[key]));
             }
        }
    });

    if (files.image) data.append('image', files.image);
    if (files.instructorImage) data.append('instructorImage', files.instructorImage);
    if (files.stamp && formData.isPlatformSponsored) data.append('stamp', files.stamp);

    try {
      const url = editingId 
        ? API_ROUTES.WORKSHOP_DETAILS(editingId) 
        : API_ROUTES.WORKSHOPS;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: data, 
      });
      
      if (res.ok) {
        alert(editingId ? "✅ تم تعديل بيانات الورشة بنجاح!" : "✅ تم نشر الورشة الجديدة بنجاح!");
        handleCancelEdit();
        fetchWorkshops();
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
    if (!confirm("هل أنت متأكد من حذف هذه الورشة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    try {
      const res = await fetch(API_ROUTES.WORKSHOP_DETAILS(id), { 
        method: 'DELETE',
      });
      if (res.ok) {
        setWorkshops(workshops.filter(w => w.id !== id));
        if (editingId === id) handleCancelEdit();
      } else {
        alert("فشل الحذف، تأكد من صلاحياتك");
      }
    } catch (err) {
      alert("خطأ في الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-32">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div ref={formTopRef} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          
          {editingId && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-600/20 text-purple-500'}`}>
                {editingId ? <Edit size={24} aria-hidden="true" /> : <Upload size={24} aria-hidden="true" />}
              </div>
              <h1 className="text-3xl font-black">{editingId ? 'تعديل بيانات الورشة' : 'إضافة ورشة عمل جديدة'}</h1>
            </div>
            
            {editingId && (
                <button 
                  onClick={handleCancelEdit} 
                  type="button"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
                >
                    <RotateCcw size={16} /> إلغاء التعديل
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="اسم الورشة" name="title" icon={Info} value={formData.title} onChange={handleChange} required />
               <Input label="اسم الأستاذ" name="instructorName" icon={Users} value={formData.instructorName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-bold text-gray-400 mr-2">نبذة عن الورشة</label>
                <textarea 
                  id="description"
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                  placeholder="اشرح باختصار محتوى الورشة..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="instructorBio" className="text-xs font-bold text-gray-400 mr-2">نبذة عن الأستاذ</label>
                <textarea 
                  id="instructorBio"
                  name="instructorBio" 
                  value={formData.instructorBio}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                  placeholder="خبرات الأستاذ ومؤهلاته..."
                />
              </div>
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
                  placeholder="نقطة 1، نقطة 2، نقطة 3..."
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <Input label="السعر الأساسي (ل.س)" name="price" type="number" min="0" step="1" icon={Banknote} value={formData.price} onChange={handleChange} required />
              <Input label="سعر العرض" name="offerPrice" type="number" min="0" step="1" icon={Gift} value={formData.offerPrice} onChange={handleChange} />
              <Input label="نهاية العرض" name="offerEndsAt" type="date" value={formData.offerEndsAt} onChange={handleChange} />
              <Input label="المدة" name="duration" icon={Clock} value={formData.duration} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="تاريخ الانطلاق" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              <Input label="تاريخ الانتهاء" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              <Input label="عدد الجلسات" name="sessionsCount" type="number" min="1" value={formData.sessionsCount} onChange={handleChange} required />
              <Input label="عدد المهام" name="tasksCount" type="number" min="0" value={formData.tasksCount} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileInput 
                label="صورة الورشة" 
                name="image" 
                onChange={handleFileChange} 
                preview={previews.image}
                onRemove={() => handleRemoveFile('image')}
              />
              <FileInput 
                label="صورة المدرس" 
                name="instructorImage" 
                onChange={handleFileChange} 
                preview={previews.instructorImage}
                onRemove={() => handleRemoveFile('instructorImage')}
              />
              {formData.isPlatformSponsored && (
                <FileInput 
                  label="الختم الإلكتروني" 
                  name="stamp" 
                  onChange={handleFileChange} 
                  preview={previews.stamp}
                  onRemove={() => handleRemoveFile('stamp')}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-8 p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="hasCertificate" 
                  checked={formData.hasCertificate} 
                  onChange={handleChange} 
                  className="w-5 h-5 accent-purple-600 rounded"
                />
                <span className="font-bold text-sm group-hover:text-purple-400">شهادة إتمام للورشة</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="isPlatformSponsored" 
                  checked={formData.isPlatformSponsored} 
                  onChange={handleChange} 
                  className="w-5 h-5 accent-purple-600 rounded"
                />
                <span className="font-bold text-sm group-hover:text-purple-400">مقدمة من المنصة</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 bg-gradient-to-r ${editingId ? 'from-blue-600 to-cyan-600 shadow-blue-500/20' : 'from-purple-600 to-blue-600 shadow-purple-500/20'} rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50`}
            >
              {isSubmitting ? "جاري المعالجة..." : (editingId ? "حفظ التعديلات" : "حفظ ونشر الورشة في المنصة 🚀")}
            </button>
          </form>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            الورشات المنشورة حالياً
            <span className="text-sm font-normal text-gray-500 bg-white/5 px-4 py-1 rounded-full">{workshops.length}</span>
          </h2>

          {isLoadingList ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-500 font-bold">جاري تحديث القائمة...</p>
            </div>
          ) : workshops.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا يوجد ورشات منشورة حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-xs font-black uppercase tracking-widest">
                    <th className="pb-6 pr-4">الورشة</th>
                    <th className="pb-6">المدرب</th>
                    <th className="pb-6">السعر</th>
                    <th className="pb-6">النوع</th>
                    <th className="pb-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workshops.map((w) => (
                    <tr key={w.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={getImageUrl(w.imageUrl, 'workshop') || ""} 
                            alt="" 
                            className="w-12 h-12 rounded-xl object-cover border border-white/10" 
                          />
                          <span className="font-bold">{w.title}</span>
                        </div>
                      </td>
                      <td className="py-6 text-gray-400 font-bold">{w.instructorName}</td>
                      <td className="py-6 font-black text-green-400">
                        {w.offerPrice ? `${w.offerPrice}` : `${w.price}`}
                      </td>
                      <td className="py-6">
                        {w.isPlatformSponsored ? (
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 font-bold">منصة</span>
                        ) : (
                          <span className="text-[10px] bg-gray-500/10 text-gray-400 px-3 py-1 rounded-full border border-gray-500/20 font-bold">خارجي</span>
                        )}
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(w)}
                            className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                            aria-label={`تعديل ورشة ${w.title}`}
                            title="تعديل"
                          >
                            <Edit size={18} aria-hidden="true" />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(w.id)}
                            className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            aria-label={`حذف ورشة ${w.title}`}
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

function FileInput({ label, name, onChange, preview, onRemove }: any) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-gray-400 mr-2">{label}</span>
      
      {preview ? (
        <div className="relative w-full h-32 rounded-3xl overflow-hidden border border-purple-500/50 group">
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
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
             <CheckCircle size={10} aria-hidden="true" /> تم الاختيار
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-purple-500/50 transition-all group h-32">
          <Upload className="text-gray-500 mb-2 group-hover:text-purple-500" size={24} aria-hidden="true" />
          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">اضغط للرفع</span>
          <input type="file" name={name} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}