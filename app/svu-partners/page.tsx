"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, GraduationCap, Search, AlertTriangle, 
  CheckCircle2, Phone, Lock, Loader2, PlusCircle, X, BookOpen, Layers,
  List, Trash2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

export default function SvuPartnersPage() {
  const { user } = useAuth();
  
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const classes = Array.from({ length: 50 }, (_, i) => `C${i + 1}`);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  
  // 🌟 State للبحث المخصص داخل المواد
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  const [requests, setRequests] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [semRes, crsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/svu/public/semesters`),
          axios.get(`${API_BASE_URL}/api/svu/public/courses`)
        ]);
        setSemesters(semRes.data);
        setCourses(crsRes.data);
      } catch (error) {
        console.error("Failed to load SVU dropdowns");
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!selectedSemester || !selectedCourse || !selectedClass) {
      toast.error("يرجى تحديد الفصل، المادة، والصف للبحث");
      return;
    }
    setLoadingSearch(true);
    setHasSearched(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/svu/partners/search`, {
        params: { semester: selectedSemester, courseName: selectedCourse, classNumber: selectedClass },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setRequests(res.data);
    } catch (error) {
      toast.error("حدث خطأ أثناء البحث، يرجى تسجيل الدخول");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSubmitRequest = async () => {
    setLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/svu/partners/request`, {
        semester: selectedSemester,
        courseName: selectedCourse,
        classNumber: selectedClass
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("تم نشر طلبك بنجاح! 🚀");
      setShowConfirmModal(false);
      setShowRequestModal(false);
      handleSearch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء النشر");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleMarkAsFound = async (requestId: string) => {
    if (!confirm("هل أنت متأكد أنك وجدت شريكاً وتريد إخفاء معلوماتك؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/api/svu/partners/request/${requestId}/found`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("مبروك! تم تحديث حالة طلبك.");
      handleSearch();
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleOpenMyRequests = async () => {
    setShowMyRequestsModal(true);
    setLoadingMyRequests(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/svu/partners/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(res.data);
    } catch (e) {
      toast.error("فشل جلب طلباتك");
    } finally {
      setLoadingMyRequests(false);
    }
  };

  const handleDeleteSingleRequest = async (id: string) => {
    if(!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/svu/partners/request/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(prev => prev.filter(r => r.id !== id));
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success("تم حذف الطلب بنجاح");
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleDeleteAllByAdmin = async () => {
    if(!confirm("⚠️ هل أنت متأكد من مسح جميع طلبات الشركاء لجميع الطلاب من قاعدة البيانات؟ لا يمكن التراجع!")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/svu/admin/partners/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("تم مسح جميع الطلبات من النظام بنجاح");
      setRequests([]);
    } catch (e) {
      toast.error("حدث خطأ أثناء المسح الشامل");
    }
  };

  // 🌟 فلترة المواد بناءً على نص البحث
  const filteredCourses = courses.filter((c: any) => 
    c.name.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  const OptionCardsGrid = ({ items, selectedValue, onSelect, valueKey = "name", labelKey = "name", icon: Icon, emptyMessage = "لا يوجد بيانات" }: any) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar p-1">
      {items.length === 0 ? (
        <div className="col-span-full py-8 text-center text-gray-500 font-bold text-sm bg-white/5 rounded-2xl border border-dashed border-white/10">
          {emptyMessage}
        </div>
      ) : (
        items.map((item: any) => {
          const value = typeof item === 'string' ? item : item[valueKey];
          const label = typeof item === 'string' ? item : item[labelKey];
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                isSelected 
                  ? 'border-pink-500 bg-pink-500/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                  : 'border-white/5 bg-[#0f172a] text-gray-400 hover:border-white/20 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              {Icon && <Icon className={`mb-2 ${isSelected ? "text-pink-400" : "text-gray-600"}`} size={24} />}
              <span className="font-bold text-sm text-center">{label}</span>
              {isSelected && (
                <div className="absolute top-2 right-2 text-pink-500">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );

  const ClassCompactGrid = ({ classes, selectedClass, onSelect }: any) => (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar p-1">
      {classes.map((c: string) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
            selectedClass === c
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] border-transparent"
              : "bg-[#0f172a] text-gray-400 border border-white/5 hover:border-blue-500/50 hover:text-white hover:bg-white/5"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );

  // 🌟 مكون شريط التحديد الحالي (المشترك بين البحث ونافذة النشر)
  const CurrentSelectionSummary = () => (
    <div className="bg-black/30 p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-inner mb-6 w-full">
      <span className="text-gray-300 text-sm font-bold whitespace-nowrap flex items-center gap-2">
        <CheckCircle2 className="text-emerald-400" size={18} /> التحديد الحالي:
      </span>
      <div className="flex flex-wrap gap-2 w-full">
        {selectedSemester ? (
          <span className="bg-pink-500/20 text-pink-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-pink-500/20 shadow-sm">
            <GraduationCap size={14} /> {selectedSemester}
          </span>
        ) : (
          <span className="bg-white/5 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-600 flex items-center gap-1.5">
            لم يتم تحديد الفصل
          </span>
        )}

        {selectedCourse ? (
          <span className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-purple-500/20 shadow-sm">
            <BookOpen size={14} /> {selectedCourse}
          </span>
        ) : (
          <span className="bg-white/5 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-600 flex items-center gap-1.5">
            لم يتم تحديد المادة
          </span>
        )}

        {selectedClass ? (
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-500/20 shadow-sm">
            <Layers size={14} /> {selectedClass}
          </span>
        ) : (
          <span className="bg-white/5 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-600 flex items-center gap-1.5">
            لم يتم تحديد الصف
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-pink-500/30 pt-24 pb-12 font-sans" dir="rtl">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* الهيدر الرئيسي */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-sm">
            <Users size={16} /> حلقة الوصل لطلاب الجامعة الافتراضية
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            ابحث عن <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">شريك الوظيفة</span> بسهولة
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            منصة مخصصة لطلاب الجامعة الافتراضية السورية لتسهيل العثور على شركاء للوظائف العملية وحلقات البحث في نفس الصف الدراسي.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <>
                <button 
                  onClick={() => setShowRequestModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:-translate-y-1"
                >
                  اضغط هنا لنشر طلبك 🚀
                </button>
                
                <button 
                  onClick={handleOpenMyRequests}
                  className="w-full sm:w-auto px-8 py-4 bg-[#1e293b] hover:bg-white/10 text-white rounded-2xl font-black text-lg transition-all shadow-xl border border-white/10 flex items-center justify-center gap-2"
                >
                  <List size={20}/> طلباتي
                </button>

                {(user.role === 'ADMIN') && (
                  <button 
                    onClick={handleDeleteAllByAdmin}
                    className="w-full sm:w-auto px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-lg transition-all shadow-xl border border-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20}/> مسح الكل (أدمن)
                  </button>
                )}
              </>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-400">
                <Lock size={20} />
                <span className="font-bold text-sm">يجب تسجيل الدخول لتتمكن من نشر طلب بحث عن شريك.</span>
                <Link href="/login" className="px-4 py-1.5 bg-amber-500 text-black rounded-lg font-bold text-xs hover:bg-amber-400 transition-colors mr-auto">تسجيل الدخول</Link>
              </div>
            )}
          </div>
        </div>

        {/* صندوق البحث الشامل بالبطاقات */}
        <div className="bg-[#1e293b]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 max-w-5xl mx-auto">
           <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
             <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
               <Search size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white">حدد معلومات البحث</h2>
               <p className="text-gray-400 text-sm mt-1">اختر من البطاقات أدناه لتصفية النتائج</p>
             </div>
           </div>

           <div className="space-y-10 mb-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-white flex items-center gap-2 px-1">
                  <GraduationCap className="text-pink-500" size={20} /> 1. اختر الفصل الدراسي
                </label>
                <OptionCardsGrid items={semesters} selectedValue={selectedSemester} onSelect={setSelectedSemester} icon={GraduationCap} />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-purple-500" size={20} /> 2. اختر المادة
                  </label>
                  {/* 🌟 مربع البحث الخاص بالمواد */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    <input 
                      type="text"
                      title="البحث عن مادة"
                      aria-label="البحث عن مادة"
                      placeholder="ابحث عن اسم المادة..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <OptionCardsGrid items={filteredCourses} selectedValue={selectedCourse} onSelect={setSelectedCourse} icon={BookOpen} emptyMessage="لم يتم العثور على مادة بهذا الاسم" />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-white flex items-center gap-2 px-1">
                  <Layers className="text-blue-500" size={20} /> 3. اختر الصف (Class)
                </label>
                <ClassCompactGrid classes={classes} selectedValue={selectedClass} onSelect={setSelectedClass} />
              </div>
           </div>

           {/* 🌟 استدعاء مكون شريط الملخص */}
           <CurrentSelectionSummary />

           <button 
             onClick={handleSearch}
             disabled={loadingSearch}
             className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex justify-center items-center gap-2 text-xl"
           >
             {loadingSearch ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
             عرض زملاء الصف
           </button>
        </div>

        {/* نتائج البحث */}
        {hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">
             <h3 className="text-2xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-4">
               نتائج البحث <span className="bg-white/10 text-sm px-3 py-1 rounded-full">{requests.length} طلب</span>
             </h3>

             {requests.length === 0 ? (
               <div className="bg-[#1e293b] border border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-[#0f172a] rounded-full flex items-center justify-center mb-4"><Users size={32} className="text-gray-600" /></div>
                 <h4 className="text-xl font-bold text-white mb-2">لا يوجد طلبات حالياً!</h4>
                 <p className="text-gray-400 text-sm max-w-md">كن أنت الأول وقم بنشر طلبك لهذه المادة والصف ليتمكن زملائك من التواصل معك.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {requests.map((req: any) => {
                   const isFound = req.status === 'FOUND';
                   const isMyRequest = user && user.id === req.userId;
                   const isAdmin = user?.role === 'ADMIN';

                   return (
                     <div key={req.id} className={`bg-[#1e293b] rounded-[2rem] p-6 border transition-all ${isFound ? 'border-emerald-500/30 opacity-75' : isMyRequest ? 'border-pink-500/50 shadow-lg shadow-pink-500/10' : 'border-white/5 hover:border-blue-500/30 hover:-translate-y-1'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isFound ? 'bg-emerald-500/20 text-emerald-400' : isMyRequest ? 'bg-pink-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                              {req.user?.firstName?.[0] || '?'}
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{isFound ? 'شريك تم الإيجاد' : `${req.user?.firstName || ''} ${req.user?.lastName || ''}`}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isFound && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={12}/> وجد شريكاً</span>}
                            {isMyRequest && !isFound && <span className="bg-pink-500/20 text-pink-400 text-[10px] font-bold px-2 py-1 rounded-md">طلبك الخاص</span>}
                            {isAdmin && (
                              <button 
                                onClick={() => handleDeleteSingleRequest(req.id)}
                                title="حذف الطلب (صلاحية أدمن)"
                                aria-label="حذف الطلب"
                                className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors shadow-inner"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {!isFound && (
                          <div className="bg-[#0f172a] rounded-xl p-4 space-y-3 mb-4 border border-white/5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400 flex items-center gap-2"><Phone size={14}/> الهاتف:</span>
                              <span className="text-white font-bold" dir="ltr">{req.user?.phone || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400 flex items-center gap-2"><Phone size={14} className="text-green-500"/> واتساب:</span>
                              {req.user?.whatsapp ? (
                                <a href={`https://wa.me/${req.user.whatsapp}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline font-bold" dir="ltr">{req.user.whatsapp}</a>
                              ) : <span className="text-gray-600">غير محدد</span>}
                            </div>
                          </div>
                        )}

                        {isMyRequest && !isFound && (
                          <button 
                            onClick={() => handleMarkAsFound(req.id)}
                            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} /> إخفاء الطلب (وجدت شريك)
                          </button>
                        )}
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Modal طلباتي */}
      <AnimatePresence>
        {showMyRequestsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1e293b]/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
                    <List size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">طلباتي</h3>
                    <p className="text-gray-400 text-xs mt-1">إدارة طلبات البحث عن شركاء الخاصة بك</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMyRequestsModal(false)} 
                  title="إغلاق نافذة طلباتي"
                  aria-label="إغلاق نافذة طلباتي"
                  className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingMyRequests ? (
                  <div className="flex justify-center items-center py-20">
                     <Loader2 size={40} className="animate-spin text-blue-500" />
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">لا يوجد لديك طلبات حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((req: any) => (
                       <div key={req.id} className="bg-[#0f172a] p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center group hover:border-white/20 transition-all shadow-lg">
                          <div>
                             <h4 className="text-white font-black text-lg mb-2">{req.courseName}</h4>
                             <div className="flex flex-wrap gap-2 text-xs font-bold">
                                <span className="bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg border border-white/5">الفصل: {req.semester}</span>
                                <span className="bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg border border-white/5">الصف: {req.classNumber}</span>
                                {req.status === 'FOUND' ? (
                                   <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg">✅ مخفي (تم الإيجاد)</span>
                                ) : (
                                   <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg">🔍 قيد البحث</span>
                                )}
                             </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteSingleRequest(req.id)}
                            title="حذف الطلب"
                            aria-label={`حذف طلبك لمادة ${req.courseName}`}
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shrink-0 flex justify-center items-center shadow-inner"
                          >
                             <Trash2 size={20} />
                          </button>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal النشر 🌟 تم التكبير لـ max-w-5xl */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1e293b]/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 w-full max-w-5xl shadow-2xl border border-white/10 relative flex flex-col max-h-[95vh]"
            >
              <div className="flex justify-between items-center mb-6 shrink-0 border-b border-white/5 pb-4">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 text-pink-500 rounded-xl flex items-center justify-center"><PlusCircle size={20}/></div>
                  نشر طلب جديد
                </h3>
                <button 
                  onClick={() => setShowRequestModal(false)} 
                  title="إغلاق نافذة النشر"
                  aria-label="إغلاق نافذة النشر"
                  className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 mb-6">
                 
                 {/* 🌟 استدعاء شريط الملخص ليعرف المستخدم ما حدده مسبقاً */}
                 <CurrentSelectionSummary />

                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-300 leading-relaxed font-bold">
                    💡 سيتم نشر اسمك ورقم هاتفك للطلاب الذين يبحثون ضمن نفس معلومات الفصل والمادة والصف المحددة. يمكنك تعديلها من البطاقات أدناه.
                 </div>

                 <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-300">الفصل الدراسي</label>
                    <OptionCardsGrid items={semesters} selectedValue={selectedSemester} onSelect={setSelectedSemester} icon={GraduationCap} />
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                      <label className="text-sm font-bold text-gray-300">المادة</label>
                      {/* 🌟 مربع البحث الخاص بالمواد داخل نافذة النشر أيضاً */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        <input 
                          type="text"
                          title="البحث عن مادة"
                          aria-label="البحث عن مادة"
                          placeholder="ابحث عن اسم المادة..."
                          value={courseSearchQuery}
                          onChange={(e) => setCourseSearchQuery(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                    <OptionCardsGrid items={filteredCourses} selectedValue={selectedCourse} onSelect={setSelectedCourse} icon={BookOpen} emptyMessage="لم يتم العثور على مادة بهذا الاسم" />
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-300">الصف (Class)</label>
                    <ClassCompactGrid classes={classes} selectedValue={selectedClass} onSelect={setSelectedClass} />
                 </div>
              </div>

              <div className="shrink-0 pt-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    if(!selectedSemester || !selectedCourse || !selectedClass) { toast.error("يرجى تحديد جميع الخيارات أولاً"); return; }
                    setShowRequestModal(false); setShowConfirmModal(true);
                  }}
                  className="w-full py-5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] text-xl"
                >
                  متابعة لنشر الطلب
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal تأكيد النشر */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1e293b] rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-orange-500/30 relative overflow-hidden text-center"
            >
              <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">تأكيد النشر</h3>
              <p className="text-gray-400 text-base leading-relaxed mb-8 font-medium">
                بنشرك لهذا الطلب، سيصبح اسمك ورقم هاتفك مرئياً للطلاب الباحثين في نفس الصف.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 bg-[#0f172a] hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 shadow-inner"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  disabled={loadingSubmit}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] flex justify-center items-center disabled:opacity-50"
                >
                  {loadingSubmit ? <Loader2 size={24} className="animate-spin" /> : 'موافق، انشر طلبي'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}