"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  Users, Search, Award, ArrowRight, Loader2, 
  CheckCircle, Zap
} from "lucide-react";
import { API_ROUTES } from "@/config/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast"; 

export default function InstructorStudentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const itemId = params.id as string;
  const itemTitle = searchParams.get('title') || "المحتوى التعليمي";

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [xpAmount, setXpAmount] = useState<number | "">(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch(API_ROUTES.GET_ITEM_STUDENTS(itemId), {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.map((e: any) => e.user));
        } else {
            toast.error("حدث خطأ أثناء جلب بيانات الطلاب");
        }
      } catch (err) {
        console.error(err);
        toast.error("فشل الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [itemId]);

  const handleGiveXp = async () => {
    if (!selectedStudent) return;
    
    const finalAmount = Number(xpAmount);

    if (isNaN(finalAmount) || finalAmount <= 0) {
        toast.error("يرجى إدخال قيمة صحيحة وموجبة للنقاط.");
        return;
    }
    if (finalAmount > 10000) {
        toast.error("الحد الأقصى للنقاط المسموح منحها دفعة واحدة هو 10,000 نقطة.");
        return;
    }

setIsSubmitting(true);

try {
  const res = await fetch(API_ROUTES.GIVE_XP, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    credentials: "include", 
    body: JSON.stringify({
      studentId: selectedStudent.id,
      amount: finalAmount,
      itemName: itemTitle 
    })
  });

      if (res.ok) {
        toast.success(`تم منح ${finalAmount} XP للطالب ${selectedStudent.firstName || 'بنجاح'}!`);
        setSelectedStudent(null);
        setXpAmount(100); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "حدث خطأ أثناء منح النقاط");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
      return students.filter(s => {
          const fullName = `${s?.firstName || ""} ${s?.lastName || ""}`.toLowerCase();
          const email = (s?.email || "").toLowerCase();
          const query = searchQuery.toLowerCase().trim();
          return fullName.includes(query) || email.includes(query);
      });
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors text-sm"
            >
              <ArrowRight size={16} /> عودة للوحة التحكم
            </button>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Users className="text-purple-500" />
              طلاب: <span className="text-purple-200">{itemTitle}</span>
            </h1>
            <p className="text-gray-400 mt-1">إدارة الطلاب ومنح نقاط الخبرة والتحفيز</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="بحث عن طالب..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              aria-label="بحث عن طالب" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={40} /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-bold">لا يوجد طلاب مسجلين أو مطابقين لبحثك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={student.id} 
                className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all hover:bg-white/[0.07] relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                    {(student.firstName && student.firstName[0]) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg leading-tight truncate">{student.firstName || "طالب"} {student.lastName || ""}</h3>
                    <p className="text-xs text-gray-400 truncate" dir="ltr">{student.email}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-2">
                  <button 
                    onClick={() => setSelectedStudent(student)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-purple-900/20"
                  >
                    <Award size={18} /> منح نقاط XP
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedStudent && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => !isSubmitting && setSelectedStudent(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 p-10 bg-purple-600/20 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <h2 className="text-2xl font-black mb-1 text-center relative z-10">مكافأة الطالب 🌟</h2>
                <p className="text-center text-gray-400 text-sm mb-6 relative z-10">
                  منح نقاط خبرة للطالب <span className="text-white font-bold">{selectedStudent.firstName || "المحدد"}</span>
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                  {[50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setXpAmount(amount)}
                      className={`py-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                        xpAmount === amount 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <Zap size={18} className={xpAmount === amount ? "text-yellow-300" : "text-gray-500"} />
                      {amount} XP
                    </button>
                  ))}
                </div>

                <div className="mb-6 relative z-10">
                  <label className="text-xs text-gray-400 mb-2 block font-bold">أو أدخل قيمة مخصصة</label>
                  <input 
                    type="number" 
                    value={xpAmount}
                    onChange={(e) => setXpAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    min="1"
                    max="10000"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-center font-mono font-bold text-lg focus:border-purple-500 focus:outline-none"
                    aria-label="قيمة النقاط المخصصة" 
                  />
                </div>

                <div className="flex gap-3 relative z-10">
                  <button 
                    onClick={handleGiveXp}
                    disabled={isSubmitting || xpAmount === ""}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> تأكيد المنح</>}
                  </button>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}