"use client";
import { useState, useEffect, useRef } from "react";
import { API_ROUTES } from "@/config/api";
import { 
  Upload, Trash2, Edit, Loader2, CheckCircle, Info, DollarSign, 
  Calendar, Clock, Users, Gift, RotateCcw, BookOpen, FileText, 
  HelpCircle, PenTool, GraduationCap 
} from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

export default function AddCoursePage() {
  const [courses, setCourses] = useState<any[]>([]);
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
    quizzesCount: "",
    summariesCount: "",
    examsCount: "",
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

  const fetchCourses = async () => {
    try {
      const res = await fetch(API_ROUTES.COURSES);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
      setIsLoadingList(false);
    } catch (err) {
      console.error(err);
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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

  const handleEditClick = (course: any) => {
    setEditingId(course.id);
    
    setFormData({
      ...course,
      instructorBio: course.instructorBio || "", 
      startDate: course.startDate ? course.startDate.split('T')[0] : "",
      endDate: course.endDate ? course.endDate.split('T')[0] : "",
      offerEndsAt: course.offerEndsAt ? course.offerEndsAt.split('T')[0] : "",
      offerPrice: course.offerPrice !== null ? course.offerPrice : "", 
    });

    setPreviews({
      image: getImageUrl(course.imageUrl, 'course'),
      instructorImage: getImageUrl(course.instructorImage, 'avatar'),
      stamp: getImageUrl(course.stampUrl),
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
      return alert("⚠️ يرجى اختيار صورة غلاف المادة");
    }

    if (formData.offerPrice && Number(formData.offerPrice) >= Number(formData.price)) {
      return alert("⚠️ لا يمكن أن يكون سعر العرض مساوياً أو أكبر من السعر الأساسي!");
    }

    setIsSubmitting(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && !key.includes('Url') && !key.includes('Image')) {
             if (formData[key] !== null && formData[key] !== "") {
                 // ✅ تحويل القيم لضمان استقرار الاستقبال في Nest.js
                 data.append(key, String(formData[key]));
             }
        }
    });

    if (files.image) data.append('image', files.image);
    if (files.instructorImage) data.append('instructorImage', files.instructorImage);
    if (files.stamp && formData.isPlatformSponsored) data.append('stamp', files.stamp);

    try {
      const url = editingId 
        ? API_ROUTES.COURSE_DETAILS(editingId) 
        : API_ROUTES.COURSES;
        
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, { 
        method, 
        body: data
      });
      
      if (res.ok) {
        alert(editingId ? "✅ تم تعديل بيانات المادة بنجاح!" : "✅ تم إضافة المادة الجديدة بنجاح!");
        handleCancelEdit();
        fetchCourses();
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
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;
    try {
      const res = await fetch(API_ROUTES.COURSE_DETAILS(id), { 
        method: 'DELETE',
      });
      if (res.ok) {
        setCourses(courses.filter(c => c.id !== id));
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
          
          {editingId && <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-cyan-600/20 text-cyan-500'}`}>
                {editingId ? <Edit size={24} aria-hidden="true" /> : <BookOpen size={24} aria-hidden="true" />}
              </div>
              <h1 className="text-3xl font-black">{editingId ? 'تعديل بيانات المادة' : 'إضافة مادة أكاديمية جديدة'}</h1>
            </div>
            
            {editingId && (
                <button onClick={handleCancelEdit} type="button" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
                    <RotateCcw size={16} aria-hidden="true" /> إلغاء التعديل
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="اسم المادة" name="title" icon={BookOpen} value={formData.title} onChange={handleChange} required />
               <Input label="اسم المدرس" name="instructorName" icon={Users} value={formData.instructorName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">وصف المادة</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-blue-500 transition-colors custom-scrollbar"
                  placeholder="لمحة عامة عن المادة..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">نبذة عن المدرس</label>
                <textarea 
                  name="instructorBio" 
                  value={formData.instructorBio}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-blue-500 transition-colors custom-scrollbar"
                  placeholder="الخبرات، الشهادات..."
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">ماذا سيتعلم الطالب؟</label>
                <textarea 
                  name="learningOutcomes" 
                  value={formData.learningOutcomes}
                  onChange={handleChange} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-blue-500 transition-colors custom-scrollbar"
                  placeholder="المحاور الرئيسية..."
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <Input label="السعر ($)" name="price" type="number" min="0" step="0.01" icon={DollarSign} value={formData.price} onChange={handleChange} required />
              <Input label="سعر العرض ($)" name="offerPrice" type="number" min="0" step="0.01" icon={Gift} value={formData.offerPrice} onChange={handleChange} />
              <Input label="نهاية العرض" name="offerEndsAt" type="date" value={formData.offerEndsAt} onChange={handleChange} />
              <Input label="المدة (أشهر/أسابيع)" name="duration" icon={Clock} value={formData.duration} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="تاريخ البداية" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              <Input label="تاريخ النهاية" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              <Input label="عدد المحاضرات" name="sessionsCount" type="number" min="1" value={formData.sessionsCount} onChange={handleChange} required />
              <Input label="عدد الوظائف" name="tasksCount" type="number" min="0" value={formData.tasksCount} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10">
                <Input label="عدد الكويزات" name="quizzesCount" type="number" min="0" icon={HelpCircle} value={formData.quizzesCount} onChange={handleChange} required />
                <Input label="عدد الملخصات" name="summariesCount" type="number" min="0" icon={FileText} value={formData.summariesCount} onChange={handleChange} required />
                <Input label="عدد الاختبارات" name="examsCount" type="number" min="0" icon={PenTool} value={formData.examsCount} onChange={handleChange} required />
            </div>

            <div className="flex flex-wrap gap-8 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 mt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="hasCertificate" checked={formData.hasCertificate} onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded" />
                <span className="font-bold text-sm group-hover:text-blue-400">شهادة إتمام</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isPlatformSponsored" checked={formData.isPlatformSponsored} onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded" />
                <span className="font-bold text-sm group-hover:text-blue-400">مادة رسمية (Official)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <FileInput 
                label="صورة غلاف المادة" 
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
                  label="الختم الرسمي" 
                  name="stamp" 
                  onChange={handleFileChange} 
                  preview={previews.stamp} 
                  onRemove={() => handleRemoveFile('stamp')} 
                />
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 bg-gradient-to-r ${editingId ? 'from-blue-600 to-cyan-600 shadow-blue-500/20' : 'from-cyan-600 to-blue-600 shadow-cyan-500/20'} rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 mt-8`}
            >
              {isSubmitting ? "جاري المعالجة..." : (editingId ? "حفظ التعديلات" : "إضافة المادة 📚")}
            </button>
          </form>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            المواد المتاحة حالياً
            <span className="text-sm font-normal text-gray-500 bg-white/5 px-4 py-1 rounded-full">{courses.length}</span>
          </h2>

          {isLoadingList ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-gray-500 font-bold">جاري تحديث القائمة...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا يوجد مواد مسجلة حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-xs font-black uppercase tracking-widest">
                    <th className="pb-6 pr-4">المادة</th>
                    <th className="pb-6">المدرس</th>
                    <th className="pb-6">الرسوم</th>
                    <th className="pb-6">المحتوى</th>
                    <th className="pb-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courses.map((c) => (
                    <tr key={c.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <img src={getImageUrl(c.imageUrl, 'course') || ""} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                          <span className="font-bold">{c.title}</span>
                        </div>
                      </td>
                      <td className="py-6 text-gray-400 font-bold">{c.instructorName}</td>
                      <td className="py-6 font-black text-green-400">
                        {c.offerPrice ? `$${c.offerPrice}` : `$${c.price}`}
                      </td>
                      <td className="py-6 text-xs text-gray-400">
                        <div className="flex gap-2">
                            <span title="كويزات" className="flex items-center gap-1"><HelpCircle size={12}/> {c.quizzesCount}</span>
                            <span title="ملخصات" className="flex items-center gap-1"><FileText size={12}/> {c.summariesCount}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(c)} 
                            className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                            aria-label="تعديل المادة"
                            title="تعديل"
                          >
                            <Edit size={18} aria-hidden="true" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)} 
                            className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            aria-label="حذف المادة"
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
          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 ${Icon ? 'pr-12' : 'pr-4'} pl-4 text-sm focus:outline-none focus:border-blue-500 transition-colors`} 
          {...props} 
        />
      </div>
    </div>
  );
}

function FileInput({ label, name, onChange, required, preview, onRemove }: any) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-gray-400 mr-2">{label}</span>
      {preview ? (
        <div className="relative w-full h-32 rounded-3xl overflow-hidden border border-blue-500/50 group">
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
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group h-32">
          <Upload className="text-gray-500 mb-2 group-hover:text-blue-500" size={24} aria-hidden="true" />
          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">اضغط للرفع</span>
          <input type="file" name={name} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}