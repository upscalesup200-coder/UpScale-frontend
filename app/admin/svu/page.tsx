"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, Calendar, BookOpen, Plus, Loader2, 
  Trash2, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

export default function AdminSvuPage() {
  // حالات البيانات
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات الإضافة
  const [newSemester, setNewSemester] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [submittingSemester, setSubmittingSemester] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // جلب البيانات
  const fetchData = async () => {
    setLoading(true);
    try {
      const [semestersRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/svu/public/semesters`),
        axios.get(`${API_BASE_URL}/api/svu/public/courses`)
      ]);
      setSemesters(semestersRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error("فشل في جلب البيانات، تأكد من الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة فصل جديد
  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemester.trim()) return toast.error("يرجى إدخال اسم الفصل");
    
    setSubmittingSemester(true);
    const toastId = toast.loading("جاري إضافة الفصل...");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/svu/admin/semesters`, 
        { name: newSemester.trim().toUpperCase() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("تم إضافة الفصل بنجاح!", { id: toastId });
      setNewSemester("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإضافة", { id: toastId });
    } finally {
      setSubmittingSemester(false);
    }
  };

  // إضافة مادة جديدة
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.trim()) return toast.error("يرجى إدخال اسم المادة");
    
    setSubmittingCourse(true);
    const toastId = toast.loading("جاري إضافة المادة...");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/svu/admin/courses`, 
        { name: newCourse.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("تم إضافة المادة بنجاح!", { id: toastId });
      setNewCourse("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإضافة", { id: toastId });
    } finally {
      setSubmittingCourse(false);
    }
  };

  // حذف فصل
  const handleDeleteSemester = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفصل نهائياً؟")) return;
    
    const toastId = toast.loading("جاري الحذف...");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/svu/admin/semesters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("تم الحذف بنجاح!", { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف", { id: toastId });
    }
  };

  // حذف مادة
  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المادة نهائياً؟")) return;
    
    const toastId = toast.loading("جاري الحذف...");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/svu/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("تم الحذف بنجاح!", { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] p-6 lg:p-12 text-white" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      {/* هيدر الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1">إدارة الافتراضية (SVU)</h1>
            <p className="text-gray-400 font-bold text-sm">أضف الفصول والمواد لتظهر للطلاب في محرك البحث</p>
          </div>
        </div>
        <Link href="/admin/dashboard">
          <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all">
            العودة للوحة التحكم
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ========================================== */}
          {/* قسم الفصول الدراسية */}
          {/* ========================================== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b] rounded-[2rem] border border-white/5 shadow-xl p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <Calendar className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold">الفصول الدراسية</h2>
            </div>

            <form onSubmit={handleAddSemester} className="mb-8 flex gap-3">
              <input 
                type="text" 
                placeholder="مثال: S24, F23..." 
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors uppercase font-mono"
                dir="ltr"
              />
              <button 
                type="submit" 
                disabled={submittingSemester}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submittingSemester ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                إضافة
              </button>
            </form>

            <div className="flex-1 bg-[#0f172a]/50 rounded-2xl border border-white/5 p-4 overflow-y-auto custom-scrollbar max-h-[400px]">
              {semesters.length === 0 ? (
                <div className="text-center text-gray-500 py-10 font-bold">لا يوجد فصول مضافة بعد</div>
              ) : (
                <div className="space-y-3">
                  {semesters.map((s) => (
                    <div key={s.id} className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                      <span className="font-mono font-bold text-lg text-white" dir="ltr">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle size={14} /> نشط
                        </span>
                        <button 
                          onClick={() => handleDeleteSemester(s.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                          title="حذف الفصل"
                          aria-label="حذف الفصل"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>


          {/* ========================================== */}
          {/* قسم المواد الدراسية */}
          {/* ========================================== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e293b] rounded-[2rem] border border-white/5 shadow-xl p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <BookOpen className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold">المواد الدراسية</h2>
            </div>

            <form onSubmit={handleAddCourse} className="mb-8 flex gap-3">
              <input 
                type="text" 
                placeholder="اسم المادة (مثال: برمجة 1)" 
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-bold"
              />
              <button 
                type="submit" 
                disabled={submittingCourse}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submittingCourse ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                إضافة
              </button>
            </form>

            <div className="flex-1 bg-[#0f172a]/50 rounded-2xl border border-white/5 p-4 overflow-y-auto custom-scrollbar max-h-[400px]">
              {courses.length === 0 ? (
                <div className="text-center text-gray-500 py-10 font-bold">لا يوجد مواد مضافة بعد</div>
              ) : (
                <div className="space-y-3">
                  {courses.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                      <span className="font-bold text-white">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle size={14} /> نشط
                        </span>
                        <button 
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                          title="حذف المادة"
                          aria-label="حذف المادة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}