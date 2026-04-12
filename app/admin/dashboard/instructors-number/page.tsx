"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { Trash2, UserCheck, ShieldOff, Search, Loader2, BookOpen } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
const res = await fetch(`${API_BASE_URL}/api/users/admin/instructors-list`, {
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setInstructors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("فشل في جلب سجلات المدرسين");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const revokeRole = async (id: string) => {
    if(!confirm("هل أنت متأكد من سحب صلاحيات التدريس من هذا المستخدم؟ سيصبح طالباً عادياً.")) return;
    
    const toastId = toast.loading("جاري سحب الصلاحيات...");
    try {
       const res = await fetch(`${API_BASE_URL}/api/users/admin/revoke-instructor/${id}`, {
            method: 'PATCH',
            credentials: "include" 
        });

        if (res.ok) {
            setInstructors(prev => prev.filter(inst => inst.id !== id));
            toast.success("تم سحب الصلاحيات بنجاح", { id: toastId });
        } else {
            const errorData = await res.json();
            toast.error(errorData.message || "فشل في سحب الصلاحيات من الخادم", { id: toastId });
        }
    } catch (error) {
        toast.error("حدث خطأ في الاتصال بالخادم", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 pt-24" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <UserCheck className="text-cyan-500" /> سجلات المدرسين
        </h1>

        <div className="bg-[#1e293b] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            {loading ? (
                <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-cyan-500" /></div>
            ) : instructors.length === 0 ? (
                <div className="p-12 text-center text-gray-500">لا يوجد مدرسين حالياً.</div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-white/5 text-gray-400">
                        <tr>
                            <th className="p-6">الاسم الكامل</th>
                            <th className="p-6">البريد الإلكتروني</th>
                            <th className="p-6 w-1/3">المواد والطلاب</th>
                            <th className="p-6">التحكم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructors.map((inst) => (
                            <tr key={inst.id} className="border-b border-white/5 hover:bg-white/5 transition-colors align-top">
                                <td className="p-6 font-bold">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                                            {inst.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p>{inst.firstName} {inst.lastName}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{inst.phone || '-'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-gray-300 font-mono text-sm">{inst.email}</td>
                                
                                <td className="p-6">
                                    {inst.teaching && inst.teaching.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {inst.teaching.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            item.type === 'مادة' ? 'bg-blue-500' : 
                                                            item.type === 'ورشة' ? 'bg-emerald-500' : 'bg-pink-500'
                                                        }`}></span>
                                                        <span className="text-gray-200">{item.title}</span>
                                                    </div>
                                                    <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">
                                                        {item.students} طالب
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">لا يوجد محتوى مسند</span>
                                    )}
                                </td>

                                <td className="p-6">
                                    <button 
                                        onClick={() => revokeRole(inst.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold border border-red-500/20 whitespace-nowrap"
                                    >
                                        <ShieldOff size={14} /> سحب الصلاحية
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 8px;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.5); border-radius: 8px;}
      `}</style>
    </div>
  );
}