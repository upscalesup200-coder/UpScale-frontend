"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Award, Search, Loader2, CheckCircle2, 
  XCircle, Linkedin, Github, Edit2, X, Save, FileText,
  UserX
} from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  specialization?: string;
  isElite: boolean;
  linkedin?: string;
  github?: string;
  bio?: string;
}

export default function EliteInstructorsPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isElite, setIsElite] = useState(false);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/teachers-management`, {
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("فشل في جلب البيانات");
      
      const data = await res.json();
      setTeachers(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsElite(teacher.isElite);
    setLinkedin(teacher.linkedin || "");
    setGithub(teacher.github || "");
    setBio(teacher.bio || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setIsSaving(true);
    const savingToast = toast.loading("جاري حفظ التعديلات...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/update-elite/${editingTeacher.id}`, {
        method: 'PATCH',
        headers: { 
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isElite, linkedin, github, bio })
      });

      if (res.ok) {
        toast.success("تم تحديث بيانات المدرب بنجاح!", { id: savingToast });
        setEditingTeacher(null);
        fetchTeachers(); 
      } else {
        throw new Error("فشل في تحديث البيانات");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ، يرجى المحاولة لاحقاً.", { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const searchTerm = search.toLowerCase();
    const fName = t.firstName || "";
    const lName = t.lastName || "";
    const email = t.email || "";
    
    const fullName = `${fName} ${lName}`.toLowerCase();
    return fullName.includes(searchTerm) || email.toLowerCase().includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 pt-24 md:p-12 md:pt-32 font-sans selection:bg-blue-500/30" dir="rtl">
      
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => router.back()} 
              className="group text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors text-sm font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10 w-fit"
            >
              <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" /> العودة للوحة التحكم
            </button>
            <h1 className="text-4xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
                <Award className="text-white w-8 h-8" />
              </div>
              إدارة نخبة الخبراء
            </h1>
            <p className="text-slate-400 mt-3 text-sm max-w-xl leading-relaxed">
              قم بإدارة المدربين، تحديد من يظهر ضمن قائمة النخبة في الصفحة الرئيسية، وتحديث سيرهم الذاتية وروابط حساباتهم.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو البريد..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
              <p className="text-slate-400 font-medium animate-pulse">جاري جلب بيانات المدربين...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 mb-2 shadow-inner">
                <UserX className="text-slate-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">لا يوجد نتائج</h3>
              <p className="text-slate-400 text-sm">لم يتم العثور على مدرب يطابق كلمة البحث "{search}"</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right min-w-[800px]">
                <thead className="bg-[#0f172a]/80 text-slate-300 text-xs uppercase font-black tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-6 rounded-tr-[2rem]">المدرب</th>
                    <th className="p-6 text-center">التخصص</th>
                    <th className="p-6 text-center">حالة النخبة</th>
                    <th className="p-6 text-center">الروابط والسيرة</th>
                    <th className="p-6 text-center rounded-tl-[2rem]">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredTeachers.map((teacher, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={teacher.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-6 font-bold text-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={getImageUrl(teacher.avatar, 'avatar') || ""} 
                              onError={(e) => { 
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${teacher.firstName || 'U'}+${teacher.lastName || 'N'}&background=0D8ABC&color=fff`;
                              }} 
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-md group-hover:border-blue-500 transition-colors" 
                              alt={teacher.firstName} 
                            />
                            {teacher.isElite && (
                               <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1 shadow-lg border-2 border-[#1e293b]">
                                  <Award size={10} className="text-white" />
                               </div>
                            )}
                          </div>
                          <div>
                            <p className="text-base group-hover:text-blue-400 transition-colors">{teacher.firstName} {teacher.lastName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-1">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center text-slate-400 font-medium">
                        <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs border border-white/5">{teacher.specialization || "غير محدد"}</span>
                      </td>
                      <td className="p-6 text-center">
                        {teacher.isElite ? (
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-500/5">
                            <CheckCircle2 size={14} className="text-amber-500" /> ضمن النخبة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold">
                            <XCircle size={14} /> عادي
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                              <div className={`p-2 rounded-lg border ${teacher.linkedin ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-transparent text-slate-600'}`} title="LinkedIn">
                                <Linkedin size={16} />
                              </div>
                              <div className={`p-2 rounded-lg border ${teacher.github ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-800 border-transparent text-slate-600'}`} title="GitHub">
                                <Github size={16} />
                              </div>
                              <div className={`p-2 rounded-lg border ${teacher.bio ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-transparent text-slate-600'}`} title="السيرة الذاتية (CV)">
                                <FileText size={16} />
                              </div>
                          </div>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => openEditModal(teacher)} 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2" 
                        >
                          <Edit2 size={14} /> تعديل البيانات
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md" 
              onClick={() => setEditingTeacher(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#1e293b] border border-white/10 rounded-[2rem] p-8 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
              
              <button onClick={() => setEditingTeacher(null)} className="absolute top-6 left-6 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors" title="إغلاق">
                <X size={20} />
              </button>
              
              <div className="mb-8 pr-2">
                 <h3 className="text-2xl font-black text-white flex items-center gap-3">
                   <Edit2 className="text-blue-500" /> 
                   ملف المدرب: {editingTeacher.firstName}
                 </h3>
                 <p className="text-slate-400 text-sm mt-2">قم بتحديث معلومات السيرة الذاتية وحالة الظهور في المنصة.</p>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-2">
                
                <label className={`flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all ${isElite ? 'bg-amber-500/10 border-amber-500/50' : 'bg-[#0f172a] border-white/10 hover:border-white/20'}`}>
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" checked={isElite} onChange={(e) => setIsElite(e.target.checked)} className="peer sr-only"/>
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <div>
                    <span className={`block font-bold ${isElite ? 'text-amber-400' : 'text-slate-300'}`}>وسام "نخبة الخبراء"</span>
                    <span className="text-xs text-slate-500 mt-1 block leading-relaxed">تفعيل هذا الخيار سيجعل المدرب يظهر في قسم الخبراء بالصفحة الرئيسية للمنصة للترويج له.</span>
                  </div>
                </label>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-bold flex items-center gap-2"><FileText size={16} className="text-emerald-400"/> السيرة الذاتية (النبذة)</label>
                  <textarea 
                    placeholder="اكتب نبذة عن المدرب، خبراته العملية، والشركات التي عمل بها..."
                    value={bio} onChange={(e) => setBio(e.target.value)} 
                    className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm min-h-[140px] resize-y transition-all text-slate-200 placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 font-bold flex items-center gap-2"><Linkedin size={16} className="text-blue-500"/> حساب LinkedIn</label>
                    <input 
                      type="url" dir="ltr" placeholder="https://linkedin.com/in/..." 
                      value={linkedin} onChange={(e) => setLinkedin(e.target.value)} 
                      className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-3.5 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all text-slate-200 placeholder:text-slate-600" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 font-bold flex items-center gap-2"><Github size={16} className="text-slate-400" /> حساب GitHub</label>
                    <input 
                      type="url" dir="ltr" placeholder="https://github.com/..." 
                      value={github} onChange={(e) => setGithub(e.target.value)} 
                      className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-3.5 px-4 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 outline-none text-sm transition-all text-slate-200 placeholder:text-slate-600" 
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <button 
                    type="submit" 
                    disabled={isSaving} 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}