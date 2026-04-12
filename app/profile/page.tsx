"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Wallet, Settings, BookOpen, Star, Users, Flame, 
  Mail, Phone, Lock, Loader2, CheckCircle, TrendingUp, PlayCircle, GraduationCap,
  X, UploadCloud, FileImage, Calendar, Save, Plus, Trash2, MessageCircle, ChevronRight,
  Trophy, AlertCircle, FileCheck, Eye, EyeOff,
  Calculator, GitMerge, CheckSquare, Archive, Map, ImagePlus, Unlock, Layers, ChevronDown, Clock
} from "lucide-react";
import Link from "next/link"; 
import Image from "next/image"; 
import { useAuth } from "@/context/AuthContext";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";
import { toast, Toaster } from "react-hot-toast"; 
import { compressImage } from "@/utils/imageCompression";
import axios from "axios"; 
import PrivateChat from "@/components/PrivateChat"; 

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white?text=UpScale";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth(); 
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(""); 
  const [expandedNavGroups, setExpandedNavGroups] = useState<string[]>(['learning', 'academic', 'teaching']);

const toggleNavGroup = (group: string) => {
  setExpandedNavGroups(prev => 
    prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
  );
};
  const [loading, setLoading] = useState(true);
  
  const [activeTeacherChat, setActiveTeacherChat] = useState<{contentId: string, studentId: string} | null>(null);

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [transferMethod, setTransferMethod] = useState("الهرم");
  const [rechargeAmount, setRechargeAmount] = useState<number | "">("");
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); 

  useEffect(() => {
    refreshUser();
    const fetchProfileData = async () => {
      try {
        const res = await fetch(API_ROUTES.GET_ME, {
          credentials: "include",
          cache: "no-store"
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          
          if (data.role === 'TEACHER' || data.role === 'ADMIN') {
            setActiveTab("inbox"); 
          } else {
            setActiveTab("courses");
          }

          if (!user || user.balance !== data.balance) {
            refreshUser();
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("جاري تحديث الصورة...");

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedFile, file.name || 'avatar.jpg');        
      const res = await fetch(`${API_BASE_URL}/api/users/upload-avatar`, {
        method: 'POST',
        credentials: "include", 
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        updateUser({ avatar: data.avatar });
        setProfileData((prev: any) => ({ ...prev, avatar: data.avatar }));
        toast.success("تم تحديث الصورة بنجاح!", { id: toastId });
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "فشل الرفع");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الصورة", { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة للإيصال.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("حجم الصورة كبير، أقصى حد 5 ميجابايت.");
        return;
      }
      
      const toastId = toast.loading("جاري معالجة الصورة...");
      const compressedFile = await compressImage(file);
      setReceiptImage(compressedFile); 
      toast.success("تم إرفاق الصورة وتجهيزها!", { id: toastId });
    }
  };

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage) return toast.error("يرجى إرفاق صورة الإيصال أو الحوالة.");
    if (!rechargeAmount || Number(rechargeAmount) <= 0) return toast.error("يرجى إدخال مبلغ صحيح.");

    setIsSubmittingRecharge(true);
    const toastId = toast.loading("جاري إرسال الطلب...");

    try {
      const formData = new FormData();
      formData.append('receiptImage', receiptImage, receiptImage.name || 'receipt.jpg');        
      formData.append('amount', String(rechargeAmount));
      formData.append('transferMethod', transferMethod);

      const res = await fetch(`${API_BASE_URL}/api/users/recharge-request`, {
        method: 'POST',
        credentials: "include", 
        body: formData
      });

      if (res.ok) {
        toast.success("تم إرسال طلب الشحن بنجاح! سيتم المراجعة قريباً.", { id: toastId, duration: 5000 });
        setShowRechargeModal(false);
        setReceiptImage(null);
        setRechargeAmount("");
        if (receiptInputRef.current) receiptInputRef.current.value = "";
      } else {
        const data = await res.json().catch(()=>({}));
        toast.error(data.message || "حدث خطأ أثناء إرسال الطلب.", { id: toastId });
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال بالخادم.", { id: toastId });
    } finally {
      setIsSubmittingRecharge(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <Loader2 className="animate-spin text-purple-500 w-12 h-12 relative z-10" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white relative overflow-hidden">
        <p className="relative z-10 bg-slate-900 border border-white/10 px-8 py-4 rounded-2xl">حدث خطأ في تحميل البيانات. يرجى تسجيل الدخول مجدداً.</p>
      </div>
    );
  }

  const isTeacher = profileData.role === 'ADMIN' || profileData.role === 'TEACHER';

  const studentContent = profileData.categorizedContent || {};
  const studentCourses = studentContent.courses || [];
  const studentWorkshops = studentContent.workshops || [];
  const studentBootcamps = studentContent.bootcamps || [];
  const studentFree = studentContent.free || [];

  const teachingCourses = profileData.teachingCourses || [];
  const teachingWorkshops = profileData.teachingWorkshops || [];
  const teachingBootcamps = profileData.teachingBootcamps || [];

  let navGroups = [];
  
  if (isTeacher) {
    navGroups = [
      {
        id: 'teaching', title: 'لوحة التدريس', icon: Users,
        tabs: [
          { id: "inbox", label: "الرسائل الواردة", icon: MessageCircle }, 
          { id: "teacher_exams", label: "نتائج الامتحانات", icon: FileCheck }, 
          { id: "teaching_courses", label: "مواد أُدرسها", icon: GraduationCap, count: teachingCourses.length },
          { id: "teaching_workshops", label: "ورشات أُدرسها", icon: Users, count: teachingWorkshops.length },
          { id: "teaching_camps", label: "معسكرات أُدرسها", icon: Flame, count: teachingBootcamps.length },
        ]
      },
      {
        id: 'general', title: 'إعدادات عامة', icon: Settings,
        tabs: [
          { id: "schedule", label: "الجدول الدراسي", icon: Calendar }, 
          { id: "settings", label: "إعدادات الحساب", icon: Settings }
        ]
      }
    ];
  } else {
    navGroups = [
      {
        id: 'learning', title: 'محتوى التعلم', icon: BookOpen,
        tabs: [
          { id: "courses", label: "مواد مسجلة", icon: BookOpen, count: studentCourses.length },
          { id: "workshops", label: "ورشات مسجلة", icon: Users, count: studentWorkshops.length },
          { id: "camps", label: "معسكرات مسجلة", icon: Flame, count: studentBootcamps.length },
          { id: "free", label: "محتوى مجاني", icon: Star, count: studentFree.length },
        ]
      },
      {
        id: 'academic', title: 'أدوات أكاديمية', icon: GitMerge,
        tabs: [
          { id: "academic_route", label: "المسار الأكاديمي", icon: GitMerge }, 
          { id: "university_tasks", label: "المهام الجامعية", icon: CheckSquare }, 
          { id: "calculator", label: "حاسبة الدرجات", icon: Calculator }, 
          { id: "student_exams", label: "نتائج الامتحانات", icon: FileCheck }, 
          { id: "archive", label: "أرشيف الإبداع", icon: Archive }, 
        ]
      },
      {
        id: 'general', title: 'إعدادات وتنظيم', icon: Settings,
        tabs: [
          { id: "schedule", label: "الجدول المنظم", icon: Calendar }, 
          { id: "settings", label: "إعدادات الحساب", icon: Settings }
        ]
      }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 font-sans selection:bg-purple-500/30 relative overflow-hidden" dir="rtl">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Toaster position="top-center" reverseOrder={false} 
        toastOptions={{
          style: { background: '#1e293b', color: '#fff', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-right">
              
              <div className="relative shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 shadow-2xl relative overflow-hidden group/avatar">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                    <img 
                      src={getImageUrl(profileData.avatar, 'avatar') || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.firstName}&backgroundColor=7c3aed`} 
                      alt={`الصورة الشخصية`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {uploadingImage ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <UploadCloud className="w-8 h-8 text-white scale-75 group-hover/avatar:scale-100 transition-transform" />}
                    </div>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                {(profileData.role === 'ADMIN' || profileData.role === 'TEACHER') && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1 whitespace-nowrap">
                    {profileData.role === 'ADMIN' ? <Shield size={12}/> : <Star size={12}/>}
                    {profileData.role === 'ADMIN' ? 'مدير النظام' : 'مدرس'}
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-purple-400 font-medium font-mono text-sm">
                  @{profileData.username}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800 border border-white/5 px-4 py-2 rounded-xl">
                    <Mail size={14} className="text-blue-400" /> {profileData.email}
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800 border border-white/5 px-4 py-2 rounded-xl">
                      <Phone size={14} className="text-emerald-400" /> {profileData.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-5 flex items-center gap-5 sm:min-w-[180px] hover:border-purple-500/40 transition-colors shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Flame className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-purple-300/70 font-bold mb-1 uppercase tracking-wider">نقاط الخبرة</p>
                  <p className="text-2xl font-black text-white font-mono">{profileData.xp || 0}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-5 flex items-center justify-between gap-6 sm:min-w-[240px] hover:border-emerald-500/40 transition-colors shadow-xl group/wallet">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Wallet className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-300/70 font-bold mb-1 uppercase tracking-wider">محفظتي</p>
                    <p className="text-xl font-black text-white font-mono">{profileData.balance?.toLocaleString()} <span className="text-xs font-sans text-emerald-500">ل.س</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRechargeModal(true)}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 shrink-0"
                  title="شحن الرصيد"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-72 shrink-0 sticky top-24 z-20">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 shadow-xl flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
                
                {navGroups.map((group) => {
                  const isExpanded = expandedNavGroups.includes(group.id);
                  const GroupIcon = group.icon;
                  
                  return (
                    <div key={group.id} className="flex flex-col">
                      <button 
                        onClick={() => toggleNavGroup(group.id)}
                        className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all font-bold text-sm ${isExpanded ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <GroupIcon size={18} className={isExpanded ? "text-purple-400" : "text-slate-500"} />
                          {group.title}
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-purple-400" : "text-slate-600"}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 pr-4 pl-2 py-2 border-r-2 border-slate-800/50 my-1 mr-4">
                              {group.tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                  <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                                      isActive 
                                        ? "bg-purple-500/10 text-purple-400 font-bold" 
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 text-[13px]">
                                      <Icon size={16} className={isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-400"} />
                                      {tab.label}
                                    </div>
                                    {tab.count !== undefined && tab.count > 0 && (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${isActive ? "bg-purple-500/20 text-purple-300" : "bg-slate-800 text-slate-500"}`}>
                                        {tab.count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {!isTeacher && activeTab === "courses" && <GenericContentTab data={studentCourses} type="COURSE" icon={BookOpen} emptyMessage="لا يوجد لديك مواد مسجلة حالياً" />}
                {!isTeacher && activeTab === "academic_route" && <AcademicRouteTab />}
                {!isTeacher && activeTab === "university_tasks" && <UniversityTasksTab />}
                {!isTeacher && activeTab === "calculator" && <CalculatorTab />}
                {!isTeacher && activeTab === "student_exams" && <StudentExamsTab />} 
                {!isTeacher && activeTab === "workshops" && <GenericContentTab data={studentWorkshops} type="WORKSHOP" icon={Users} emptyMessage="لا يوجد لديك ورشات عمل مسجلة حالياً" />}
                {!isTeacher && activeTab === "archive" && <ArchiveTab />}
                {!isTeacher && activeTab === "camps" && <GenericContentTab data={studentBootcamps} type="BOOTCAMP" icon={Flame} emptyMessage="لا يوجد لديك معسكرات مسجلة حالياً" />}
                {!isTeacher && activeTab === "free" && <GenericContentTab data={studentFree} type="FREE_CONTENT" icon={Star} emptyMessage="لا يوجد محتوى مجاني حالياً" />}

                {isTeacher && activeTab === "inbox" && <TeacherInboxTab onOpenChat={(contentId, studentId) => setActiveTeacherChat({contentId, studentId})} />}
                {isTeacher && activeTab === "teacher_exams" && <TeacherExamsTab />} 
                {isTeacher && activeTab === "teaching_courses" && <GenericContentTab data={teachingCourses} type="COURSE" icon={GraduationCap} emptyMessage="لا يوجد مواد تقوم بتدريسها حالياً" hideAction={true} />}
                {isTeacher && activeTab === "teaching_workshops" && <GenericContentTab data={teachingWorkshops} type="WORKSHOP" icon={Users} emptyMessage="لا يوجد ورشات تقوم بتدريسها حالياً" hideAction={true} />}
                {isTeacher && activeTab === "teaching_camps" && <GenericContentTab data={teachingBootcamps} type="BOOTCAMP" icon={Flame} emptyMessage="لا يوجد معسكرات تقوم بتدريسها حالياً" hideAction={true} />}

                {activeTab === "schedule" && <ScheduleTab />} 
                {activeTab === "settings" && <SettingsTab user={profileData} setProfileData={setProfileData} />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showRechargeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
              
              <button 
                onClick={() => !isSubmittingRecharge && setShowRechargeModal(false)}
                disabled={isSubmittingRecharge}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all disabled:opacity-50 z-10"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 space-y-8">
                  <div className="text-center mt-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(16,185,129,0.4)] rotate-3">
                          <Wallet size={32} />
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-white">شحن الرصيد</h3>
                      <p className="text-slate-400 text-sm">أرفق صورة إيصال التحويل ليتم مراجعته وإضافته لمحفظتك.</p>
                  </div>

                  <form onSubmit={handleSubmitRecharge} className="space-y-5 text-right">
                      <div className="space-y-2">
    <label htmlFor="transferMethodInput" className="text-xs font-bold text-slate-300 uppercase tracking-wider">طريقة التحويل</label>
    <select 
        id="transferMethodInput"
        title="طريقة التحويل"
        aria-label="طريقة التحويل"
        value={transferMethod}
        onChange={(e) => setTransferMethod(e.target.value)}
        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
    >
                              <option value="الهرم">حوالة الهرم</option>
                              <option value="سيريتل كاش">سيريتل كاش</option>
                              <option value="MTN كاش">MTN كاش</option>
                              <option value="شام كاش">شام كاش</option>
                          </select>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">المبلغ المحول (ل.س)</label>
                          <input 
                              type="number" 
                              required min="1"
                              value={rechargeAmount}
                              onChange={(e) => setRechargeAmount(e.target.value === "" ? "" : Number(e.target.value))}
                              placeholder="مثال: 50000"
                              className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-left text-lg"
                              dir="ltr"
                          />
                      </div>

                      <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">صورة الإيصال</label>
                          <div 
                              onClick={() => receiptInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center h-36 ${receiptImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-emerald-500/30 bg-slate-900/50'}`}
                          >
                              {receiptImage ? (
                                  <>
                                      <FileImage className="text-emerald-400" size={32} />
                                      <span className="text-emerald-400 font-bold text-xs truncate max-w-full px-4" dir="ltr">{receiptImage.name}</span>
                                  </>
                              ) : (
                                  <>
                                      <UploadCloud className="text-slate-500" size={32} />
                                      <span className="text-slate-400 text-xs font-medium">اضغط هنا لاختيار الصورة</span>
                                  </>
                              )}
                          </div>
                          <input type="file" ref={receiptInputRef} className="hidden" accept="image/*" onChange={handleReceiptChange} />
                      </div>

                      <button 
                          type="submit"
                          disabled={isSubmittingRecharge}
                          className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                      >
                          {isSubmittingRecharge ? <Loader2 className="animate-spin" size={24} /> : "إرسال طلب الشحن"}
                      </button>
                  </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTeacherChat && (
          <PrivateChat 
            contentId={activeTeacherChat.contentId} 
            receiverId={activeTeacherChat.studentId}
            isTeacherMode={true}
            onClose={() => setActiveTeacherChat(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AcademicRouteTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [passedCourses, setPassedCourses] = useState<string[]>([]);
  const [currentCourses, setCurrentCourses] = useState<string[]>([]);
  
  const [svuCourses, setSvuCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<'passed' | 'current' | 'next' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await fetch(`${API_BASE_URL}/api/svu/public/courses`, { credentials: "include" });
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          const formattedCourses = data.map((c: any) => {
            let preList: string[] = [];
            const preData = c.prerequisites;
            if (preData) {
                if (typeof preData === 'string') {
                    const str = preData.trim();
                    if (str !== '' && str.toLowerCase() !== 'none' && !str.includes('لا يوجد') && !str.includes('بدون')) {
                        preList = str.split(',').map((p: string) => p.trim()).filter(Boolean);
                    }
                } else if (Array.isArray(preData)) {
                    preList = preData.map((p: any) => p.prerequisite?.code || p.prerequisiteCode || p.code || (typeof p === 'string' ? p : null)).filter(Boolean);
                }
            }
            return {
              id: c.id,
              code: c.code,
              name: c.name,
              credits: Number(c.creditHours || c.credits) || 3, 
              pre: preList
            };
          });
          setSvuCourses(formattedCourses);
        }

        const routeRes = await fetch(`${API_BASE_URL}/api/student-profile/academic-route`, { credentials: "include" });
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          setPassedCourses(routeData.passed || []);
          setCurrentCourses(routeData.current || []);
        }

      } catch (error) {
        toast.error("حدث خطأ أثناء الاتصال بالسيرفر");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const achievedOrCurrent = [...passedCourses, ...currentCourses];

  const availableNext = svuCourses.filter(c => {
      if (achievedOrCurrent.includes(c.code)) return false;
      if (c.pre.length === 0) return true;
      return c.pre.every((p: string) => achievedOrCurrent.includes(p));
  });

  const visibleCoursesInModal = svuCourses.filter(c => {
      return achievedOrCurrent.includes(c.code) || availableNext.map(a => a.code).includes(c.code);
  });

  const currentCredits = currentCourses.reduce((sum, code) => sum + (svuCourses.find(c => c.code === code)?.credits || 0), 0);
  const passedCredits = passedCourses.reduce((sum, code) => sum + (svuCourses.find(c => c.code === code)?.credits || 0), 0);

  const isCurrentCreditsValid = currentCredits >= 16 && currentCredits <= 36;
  const showCreditError = currentCourses.length > 0 && !isCurrentCreditsValid;

  const toggleCourse = (code: string, listType: 'passed' | 'current') => {
      if (listType === 'passed') {
          if (passedCourses.includes(code)) {
              setPassedCourses(passedCourses.filter(c => c !== code));
          } else {
              setPassedCourses([...passedCourses, code]);
              setCurrentCourses(currentCourses.filter(c => c !== code)); 
          }
      } else {
          if (currentCourses.includes(code)) {
              setCurrentCourses(currentCourses.filter(c => c !== code));
          } else {
              setCurrentCourses([...currentCourses, code]);
              setPassedCourses(passedCourses.filter(c => c !== code)); 
          }
      }
  };

  const handleSaveProgress = async () => {
    if (showCreditError) {
      toast.error("لا يمكنك الحفظ! تأكد أن وحدات الفصل الحالي بين 16 و 36 وحدة.");
      return;
    }
    
    const toastId = toast.loading("جاري حفظ مسارك في قاعدة البيانات...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/student-profile/academic-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ passed: passedCourses, current: currentCourses })
      });

      if (res.ok) {
        setIsEditing(false);
        toast.success("تم تحديث مسارك الأكاديمي بنجاح!", { id: toastId });
      } else {
        toast.error("فشل في الحفظ", { id: toastId });
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالسيرفر", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
        <Loader2 className="animate-spin text-purple-500 w-12 h-12 mb-4" />
        <p className="text-slate-400 font-bold">جاري جلب بياناتك من الخادم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <GitMerge size={28} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">المسار الأكاديمي</h2>
            <p className="text-sm font-medium text-slate-400">حدد حالتك الجامعية لتُفتح لك مواد الفصل القادم.</p>
          </div>
        </div>
        <button 
            onClick={isEditing ? handleSaveProgress : () => setIsEditing(true)}
            className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 text-sm shadow-lg ${
              isEditing 
                ? (showCreditError ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20') 
                : 'bg-white hover:bg-slate-200 text-slate-900'
            }`}
        >
            {isEditing ? <><Save size={18}/> حفظ التحديثات</> : <><Settings size={18}/> تحديث حالتي</>}
        </button>
      </div>

      {isEditing ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative pb-32">
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-slate-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between gap-6 md:gap-12 px-8">
             <div className="flex flex-col items-center">
               <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">رصيد المواد الناجحة</span>
               <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{passedCredits} <span className="text-xs text-emerald-500/50 font-sans">وحدة</span></span>
             </div>
             
             <div className="w-px h-12 bg-white/10"></div>
             
             <div className="flex flex-col items-center relative">
               <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">وحدات أدرسها حالياً</span>
               <div className="flex items-center gap-2">
                 <span className={`text-xl sm:text-2xl font-black font-mono ${currentCredits === 0 ? 'text-white' : (isCurrentCreditsValid ? 'text-blue-400' : 'text-red-400')}`}>{currentCredits}</span>
               </div>
               {showCreditError && (
                 <div className="absolute top-full mt-2 w-max bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                   <AlertCircle size={12}/> يجب أن يكون بين 16 و 36 وحدة
                 </div>
               )}
               {!showCreditError && currentCredits > 0 && (
                 <div className="absolute top-full mt-2 w-max text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                   <CheckCircle size={12}/> الوحدات مقبولة للتسجيل
                 </div>
               )}
             </div>
           </div>

           <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
             <h3 className="text-xl font-black text-white flex items-center gap-3">
                 <BookOpen size={24} className="text-purple-400"/> المواد المتاحة لك للتسجيل:
             </h3>
           </div>

           {visibleCoursesInModal.length === 0 ? (
             <div className="text-center py-10 text-gray-500">لا يوجد مواد متاحة. تأكد من إضافة المواد من لوحة التحكم.</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                 {visibleCoursesInModal.map(c => (
                     <div key={c.code} className="bg-slate-800/50 hover:bg-slate-800 p-5 rounded-2xl border border-white/5 transition-colors flex flex-col justify-between gap-4 relative overflow-hidden group">
                         {!achievedOrCurrent.includes(c.code) && <div className="absolute top-0 right-0 w-1 h-full bg-purple-500"></div>}
                         <div className="flex justify-between items-start z-10 relative">
                             <div>
                               <h4 className="font-bold text-white text-base mb-1">{c.name}</h4>
                               <div className="flex items-center gap-3 text-xs">
                                 <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[10px]">{c.code}</span>
                                 <span className="text-slate-500 font-bold flex items-center gap-1"><Layers size={12}/> {c.credits} وحدات</span>
                               </div>
                             </div>
                         </div>
                         <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5 z-10 relative">
                             <button 
                               onClick={() => toggleCourse(c.code, 'passed')} 
                               className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${passedCourses.includes(c.code) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
                             >
                               تم الاجتياز
                             </button>
                             <button 
                               onClick={() => toggleCourse(c.code, 'current')} 
                               className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${currentCourses.includes(c.code) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
                             >
                               أدرسها حالياً
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
           )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveModal('passed')} className="bg-slate-900 border border-white/5 hover:border-emerald-500/30 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden cursor-pointer group transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div className="w-16 h-16 bg-slate-800 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform"><CheckCircle size={32}/></div>
            <h3 className="text-white font-black text-2xl mb-2">مواد تم اجتيازها</h3>
            <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
              <span>{passedCourses.length} مواد</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="text-emerald-400">{passedCredits} وحدة رصيد</span>
            </div>
            <div className="absolute top-8 left-8 text-slate-600 group-hover:text-emerald-400 transition-colors"><ChevronRight size={24} className="rotate-180"/></div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveModal('current')} className="bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden cursor-pointer group transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="w-16 h-16 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform"><BookOpen size={32}/></div>
            <h3 className="text-white font-black text-2xl mb-2">مواد الفصل الحالي</h3>
            <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
              <span>{currentCourses.length} مواد مسجلة</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="text-blue-400">{currentCredits} وحدة حالية</span>
            </div>
            <div className="absolute top-8 left-8 text-slate-600 group-hover:text-blue-400 transition-colors"><ChevronRight size={24} className="rotate-180"/></div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} onClick={() => setActiveModal('next')} className="bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden cursor-pointer group transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors" />
            <div className="w-16 h-16 bg-black/20 text-white rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10 group-hover:scale-110 transition-transform backdrop-blur-sm"><Map size={32}/></div>
            <h3 className="text-white font-black text-2xl mb-2">متاحة الفصل القادم</h3>
            <p className="text-purple-100 text-sm font-medium opacity-90">متاح لك فتح {availableNext.length} مادة جديدة</p>
            <div className="absolute top-8 left-8 text-white/50 group-hover:text-white transition-colors"><ChevronRight size={24} className="rotate-180"/></div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden max-h-[85vh]"
            >
              <div className={`p-8 border-b border-white/5 flex items-start justify-between relative ${activeModal === 'passed' ? 'bg-emerald-500/5' : activeModal === 'current' ? 'bg-blue-500/5' : 'bg-purple-500/5'}`}>
                <div>
                  <h3 className="text-3xl font-black text-white flex items-center gap-4 mb-3">
                    {activeModal === 'passed' && <><div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><CheckCircle size={28}/></div> مواد تم اجتيازها</>}
                    {activeModal === 'current' && <><div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><BookOpen size={28}/></div> مواد الفصل الحالي</>}
                    {activeModal === 'next' && <><div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Map size={28}/></div> مواد ستفتح الفصل القادم</>}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">
                    {activeModal === 'passed' && `مجموع الوحدات المنجزة: ${passedCredits}`}
                    {activeModal === 'current' && `الوحدات المسجلة حالياً: ${currentCredits}`}
                    {activeModal === 'next' && 'بناءً على موادك الناجحة والحالية، هذه المواد ستكون متاحة للتسجيل.'}
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-3 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-full transition-colors shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
                {activeModal === 'passed' && passedCourses.length === 0 && <div className="text-center text-slate-500 py-12 font-bold text-lg">لم تقم بتحديد أي مواد ناجحة بعد.</div>}
                {activeModal === 'current' && currentCourses.length === 0 && <div className="text-center text-slate-500 py-12 font-bold text-lg">لم تقم بتسجيل أي مواد للفصل الحالي.</div>}
                {activeModal === 'next' && availableNext.length === 0 && <div className="text-center text-slate-500 py-12 font-bold text-lg">بناءً على حالتك الحالية، لا يوجد مواد جديدة ستفتح.</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeModal === 'passed' && passedCourses.map(code => {
                    const c = svuCourses.find(x => x.code === code);
                    return (
                      <div key={code} className="bg-slate-800/80 p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-bold text-white text-lg leading-tight">{c?.name}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded shrink-0">{code}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><Layers size={14}/> {c?.credits} وحدات معتمدة</div>
                      </div>
                    )
                  })}

                  {activeModal === 'current' && currentCourses.map(code => {
                    const c = svuCourses.find(x => x.code === code);
                    return (
                      <div key={code} className="bg-slate-800/80 p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-bold text-white text-lg leading-tight">{c?.name}</span>
                          <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded shrink-0">{code}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><Layers size={14}/> {c?.credits} وحدات معتمدة</div>
                      </div>
                    )
                  })}

                  {activeModal === 'next' && availableNext.map(c => (
                    <div key={c.code} className="bg-slate-800/80 p-5 rounded-2xl border border-purple-500/20 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1 h-full bg-purple-500"></div>
                      <div className="flex justify-between items-start gap-4 pr-3">
                        <span className="font-black text-white text-lg leading-tight">{c.name}</span>
                        <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded shrink-0">{c.code}</span>
                      </div>
                      <div className="pr-3 pt-2 border-t border-white/5 mt-1 flex flex-col gap-2">
                          <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><Layers size={14}/> {c.credits} وحدات معتمدة</div>
                          {c.pre.length > 0 && (
                            <div className="text-[11px] text-purple-300/80 font-medium flex items-center gap-1.5 bg-slate-900/50 p-2 rounded-lg">
                              <Unlock size={12} className="text-purple-400 shrink-0"/>
                              <span className="truncate">تفتح بناءً على: {c.pre.join('، ')}</span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function TeacherInboxTab({ onOpenChat }: { onOpenChat: (contentId: string, studentId: string) => void }) {
  const [inbox, setInbox] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  const fetchInbox = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/private-messages/inbox`, { withCredentials: true });
      setInbox(res.data);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-500 w-12 h-12" /></div>;
  if (inbox.length === 0) return <EmptyState icon={MessageCircle} message="صندوق الوارد فارغ، لا يوجد محادثات حالياً" hideAction={true} />;

  const selectedParent = inbox.find(p => p.parentId === selectedParentId);
  const selectedContent = selectedParent?.contents.find((c: any) => c.contentId === selectedContentId);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/[0.05] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <MessageCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {!selectedParentId ? 'صندوق الوارد' : !selectedContentId ? `تصفح: ${selectedParent?.parentTitle}` : `استفسارات: ${selectedContent?.contentTitle}`}
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {!selectedParentId ? 'اختر المادة لترى الاستفسارات' : !selectedContentId ? 'اختر الدرس أو المقطع' : 'اختر طالباً للرد عليه'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {selectedContentId && (
            <button onClick={() => setSelectedContentId(null)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-white/5">
                <ChevronRight size={16} /> العودة للمقاطع
            </button>
            )}
            {selectedParentId && !selectedContentId && (
            <button onClick={() => setSelectedParentId(null)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-white/5">
                <ChevronRight size={16} /> العودة للمواد
            </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {!selectedParentId && inbox.map((parent, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} onClick={() => setSelectedParentId(parent.parentId)} className="bg-slate-900 p-6 rounded-3xl border border-white/[0.05] hover:border-blue-500/30 cursor-pointer flex items-center justify-between transition-colors shadow-lg relative group">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                 <BookOpen size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-white text-lg mb-1 line-clamp-1">{parent.parentTitle}</h4>
                 <p className="text-xs text-slate-500 font-medium">يوجد استفسارات في {parent.contents.length} مقاطع</p>
               </div>
            </div>
            {parent.totalUnread > 0 && (
              <div className="w-9 h-9 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                {parent.totalUnread}
              </div>
            )}
          </motion.div>
        ))}

        {selectedParentId && !selectedContentId && selectedParent?.contents.map((content: any, i: number) => (
          <motion.div key={i} whileHover={{ y: -4 }} onClick={() => setSelectedContentId(content.contentId)} className="bg-slate-900 p-6 rounded-3xl border border-white/[0.05] hover:border-purple-500/30 cursor-pointer flex items-center justify-between transition-colors shadow-lg relative group">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                 <PlayCircle size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-white text-lg mb-1 line-clamp-1">{content.contentTitle}</h4>
                 <p className="text-xs text-slate-500 font-medium">{content.students.length} طلاب راسلوك هنا</p>
               </div>
            </div>
            {content.totalUnread > 0 && (
              <div className="w-9 h-9 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                {content.totalUnread}
              </div>
            )}
          </motion.div>
        ))}

        {selectedParentId && selectedContentId && selectedContent?.students.map((student: any, i: number) => (
          <motion.div key={i} whileHover={{ y: -4 }} onClick={() => {
              onOpenChat(selectedContent.contentId, student.studentId);
              const newInbox = [...inbox];
              const pIndex = newInbox.findIndex(p => p.parentId === selectedParentId);
              if (pIndex > -1) {
                  const cIndex = newInbox[pIndex].contents.findIndex((c: any) => c.contentId === selectedContentId);
                  if (cIndex > -1) {
                      const sIndex = newInbox[pIndex].contents[cIndex].students.findIndex((s: any) => s.studentId === student.studentId);
                      if (sIndex > -1) {
                          const unread = newInbox[pIndex].contents[cIndex].students[sIndex].unreadCount;
                          newInbox[pIndex].contents[cIndex].students[sIndex].unreadCount = 0;
                          newInbox[pIndex].contents[cIndex].totalUnread -= unread;
                          newInbox[pIndex].totalUnread -= unread;
                          setInbox(newInbox);
                      }
                  }
              }
            }} 
            className="bg-slate-900 p-6 rounded-3xl border border-white/[0.05] hover:border-emerald-500/30 cursor-pointer flex flex-col justify-between transition-colors shadow-lg relative group"
          >
            {student.unreadCount > 0 && (
              <div className="absolute top-5 left-5 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse z-10">
                {student.unreadCount}
              </div>
            )}
            <div className="flex items-start gap-4 mb-4">
               <img src={getImageUrl(student.studentAvatar, 'avatar') || `https://api.dicebear.com/7.x/initials/svg?seed=${student.studentName}&backgroundColor=3b82f6`} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-slate-800 shadow-md"/>
               <div className="flex-1 min-w-0 pr-2">
                 <h4 className="font-bold text-white text-base truncate mb-2">{student.studentName}</h4>
                 <div className={`p-3.5 rounded-2xl border transition-colors ${student.unreadCount > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-white/5'}`}>
                   <p className={`text-sm line-clamp-2 leading-relaxed ${student.unreadCount > 0 ? 'text-white font-bold' : 'text-slate-400'}`}>{student.lastMessage}</p>
                 </div>
               </div>
            </div>
            <div className="text-xs text-slate-500 text-left font-mono mt-2 pt-3 border-t border-white/5">
               {new Date(student.lastMessageDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TeacherExamsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherExams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/exam/profile/teacher-results`, { withCredentials: true });
        setExams(res.data);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchTeacherExams();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;
  if (exams.length === 0) return <EmptyState icon={FileCheck} message="لا يوجد لديك امتحانات حالياً لتظهر نتائجها" hideAction={true} />;

  const selectedExam = exams.find(e => e.examId === selectedExamId);

  return (
    <div className="space-y-6">
      {!selectedExamId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} onClick={() => setSelectedExamId(exam.examId)} className="bg-slate-900 p-6 rounded-3xl border border-white/[0.05] hover:border-indigo-500/30 cursor-pointer flex flex-col justify-between transition-colors shadow-lg group">
              <div className="flex items-center gap-5 mb-5">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Trophy size={28} />
                 </div>
                 <div>
                   <h4 className="font-black text-white text-lg mb-1 line-clamp-1">{exam.parentName}</h4>
                   <p className="text-sm text-slate-400 font-medium">{exam.examTitle} (العلامة: {exam.totalScore})</p>
                 </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                 <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                     {exam.studentsCount} طلاب سلموا
                 </span>
                 <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${exam.isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                     {exam.isOpen ? 'مفتوح' : 'مغلق'}
                 </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/[0.05] rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800">
              <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <Trophy className="text-indigo-400" size={28}/> {selectedExam?.examTitle}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium">{selectedExam?.parentName}</p>
              </div>
              <button onClick={() => setSelectedExamId(null)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-white/5">
                  <ChevronRight size={16} /> العودة للقائمة
              </button>
          </div>
          
          {selectedExam?.results.length === 0 ? (
              <div className="p-16 text-center text-slate-500 font-medium text-lg">لم يقم أي طالب بتسليم هذا الامتحان بعد.</div>
          ) : (
              <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right border-collapse min-w-[700px]">
                      <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-black tracking-wider border-b border-white/10">
                          <tr>
                              <th className="p-5">الطالب</th>
                              <th className="p-5 text-center">العلامة</th>
                              <th className="p-5 text-center">النتيجة</th>
                              <th className="p-5 text-left">تاريخ التسليم</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                          {selectedExam?.results.map((res: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-800 transition-colors">
                                  <td className="p-5 font-bold text-slate-200">
                                      <div className="flex items-center gap-4">
                                          <img src={getImageUrl(res.studentAvatar, 'avatar') || `https://api.dicebear.com/7.x/initials/svg?seed=${res.studentName}`} alt="avatar" className="w-10 h-10 rounded-full border border-slate-700"/>
                                          {res.studentName}
                                      </div>
                                  </td>
                                  <td className="p-5 text-center font-mono font-black text-xl text-white">
                                      {res.score} <span className="text-sm text-slate-500 font-sans">/ {selectedExam.totalScore}</span>
                                  </td>
                                  <td className="p-5 text-center">
                                      {res.isPassed ? 
                                          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/20">ناجح</span> : 
                                          <span className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/20">راسب</span>
                                      }
                                  </td>
                                  <td className="p-5 text-left text-xs text-slate-400 font-mono font-medium">
                                      {new Date(res.submittedAt).toLocaleString('ar-EG')}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
        </div>
      )}
    </div>
  );
}

function StudentExamsTab() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentExams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/exam/profile/student-results`, { withCredentials: true });
        setResults(res.data);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchStudentExams();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;
  if (results.length === 0) return <EmptyState icon={FileCheck} message="لم تقم بتقديم أي امتحانات نهائية حتى الآن" hideAction={true} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       {results.map((res, i) => (
           <motion.div key={i} whileHover={{ y: -4 }} className={`bg-slate-900 rounded-3xl border ${res.isPassed ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]'} p-6 relative overflow-hidden flex flex-col justify-between group transition-colors`}>
              <div className={`absolute top-0 right-0 w-2 h-full ${res.isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div className="flex justify-between items-start mb-8 pr-4">
                  <div>
                      <h4 className="text-xl font-black text-white mb-2 line-clamp-1">{res.examTitle}</h4>
                      <p className="text-sm text-slate-400 font-medium">{res.parentName}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${res.isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {res.isPassed ? <Trophy size={24}/> : <AlertCircle size={24}/>}
                  </div>
              </div>
              <div className="flex items-end justify-between pr-4 mt-auto">
                  <div>
                      <p className="text-xs text-slate-500 font-bold mb-1 uppercase">النتيجة النهائية</p>
                      <div className="flex items-baseline gap-2 font-mono">
                          <span className={`text-4xl font-black leading-none ${res.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>{res.score}</span>
                          <span className="text-slate-500 text-base">/ {res.totalScore}</span>
                      </div>
                  </div>
                  <div className="text-left">
                      <span className={`text-sm font-bold px-4 py-2 rounded-xl border ${res.isPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {res.isPassed ? 'اجتزت بنجاح' : 'لم تجتز'}
                      </span>
                  </div>
              </div>
           </motion.div>
       ))}
    </div>
  );
}

function CalculatorTab() {
  const [practicalMark, setPracticalMark] = useState<number | "">("");

  const p100 = Number(practicalMark) || 0;
  const p30 = p100 * 0.3; 

  let neededFor60_70 = 60 - p30;
  if (neededFor60_70 < 0) neededFor60_70 = 0;
  const neededFor60_100 = (neededFor60_70 / 0.7);

  let neededFor58_70 = 57.1 - p30;
  if (neededFor58_70 < 0) neededFor58_70 = 0;
  const neededFor58_100 = (neededFor58_70 / 0.7);

  const isImpossible = neededFor60_100 > 100;
  const isImpossibleHelp = neededFor58_100 > 100;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-slate-900 border border-white/[0.05] p-8 md:p-10 rounded-[3rem] shadow-2xl max-w-3xl w-full relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] rotate-3">
            <Calculator size={40} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">حاسبة درجات SVU</h2>
          <p className="text-slate-400 font-medium">أدخل علامتك بالعملي لمعرفة ما تحتاجه للنجاح بالامتحان النظري.</p>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-white/5 max-w-sm mx-auto">
            <label className="block text-sm font-bold text-slate-300 mb-4 text-center uppercase tracking-wider">علامة العملي (من 100)</label>
            <input 
              type="number" min="0" max="100"
              value={practicalMark}
              onChange={(e) => {
                  const val = Number(e.target.value);
                  if(val <= 100) setPracticalMark(val || "");
              }}
              placeholder="مثال: 85"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-center text-4xl text-white font-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono placeholder:text-2xl placeholder:font-sans placeholder:font-normal placeholder:text-slate-600 shadow-inner"
              dir="ltr"
            />
          </div>

          <AnimatePresence>
          {practicalMark !== "" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 text-center shadow-lg w-full max-w-sm mx-auto">
                <p className="text-sm font-bold text-indigo-300 mb-3">محصلة العملي</p>
                <p className="text-5xl font-black text-white font-mono">{p30.toFixed(1)} <span className="text-xl text-indigo-500/60 font-sans">/ 30</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-800 border border-emerald-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                  <div className="text-center border-b border-white/5 pb-4 mb-4">
                    <p className="text-base font-black text-emerald-400">لتحقيق علامة النجاح (60)</p>
                  </div>
                  
                  {isImpossible ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-red-400 font-bold leading-relaxed flex flex-col items-center gap-2"><X size={28}/>عذراً، علامتك بالعملي منخفضة جداً. لا يمكنك النجاح حتى لو حصلت على 100 بالنظري.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                        <span className="text-sm font-bold text-slate-300">في ورقة الامتحان<br/><span className="text-[10px] text-slate-500">(من 100)</span></span>
                        <span className="text-3xl font-black text-white font-mono">{neededFor60_100.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                        <span className="text-sm font-bold text-emerald-300">ما يعادلها للمحصلة<br/><span className="text-[10px] text-emerald-500/60">(مضروبة بـ 0.7)</span></span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">{neededFor60_70.toFixed(1)} <span className="text-sm text-emerald-500/50">/ 70</span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800 border border-orange-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-400"></div>
                  <div className="text-center border-b border-white/5 pb-4 mb-4">
                    <p className="text-base font-black text-orange-400 flex items-center justify-center gap-2">بحالة المساعدة (58) <AlertCircle size={18}/></p>
                  </div>

                  {isImpossibleHelp ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-red-400 font-bold leading-relaxed flex flex-col items-center gap-2"><X size={28}/>عذراً، حتى مع المساعدة لا يمكنك بلوغ درجة النجاح المطلوبة.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                        <span className="text-sm font-bold text-slate-300">في ورقة الامتحان<br/><span className="text-[10px] text-slate-500">(من 100)</span></span>
                        <span className="text-3xl font-black text-white font-mono">{neededFor58_100.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                        <span className="text-sm font-bold text-orange-300">ما يعادلها للمحصلة<br/><span className="text-[10px] text-orange-500/60">(مضروبة بـ 0.7)</span></span>
                        <span className="text-2xl font-black text-orange-400 font-mono">{neededFor58_70.toFixed(1)} <span className="text-sm text-orange-500/50">/ 70</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function UniversityTasksTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
      title: "", subject: "", issueDate: "", dueDate: "", type: "individual", partners: ""
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/tasks`, { credentials: "include" });
        if (res.ok) {
          setTasks(await res.json());
        }
      } catch (error) {
        toast.error("فشل جلب المهام");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
      e.preventDefault();
      const toastId = toast.loading("جاري الإضافة...");
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: "include",
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newTask = await res.json();
          setTasks([newTask, ...tasks]);
          setFormData({ title: "", subject: "", issueDate: "", dueDate: "", type: "individual", partners: "" });
          setShowForm(false);
          toast.success("تم إضافة الوظيفة بنجاح!", { id: toastId });
        }
      } catch (err) {
        toast.error("خطأ في الاتصال", { id: toastId });
      }
  };

  const toggleTaskDone = async (id: string) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
      try {
        await fetch(`${API_BASE_URL}/api/student-profile/tasks/${id}/toggle`, { 
          method: 'PATCH', 
          credentials: "include" 
        });
      } catch (err) {
        setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
        toast.error("فشل تحديث حالة المهمة");
      }
  };

  const deleteTask = async (id: string) => {
      const prevTasks = [...tasks];
      setTasks(tasks.filter(t => t.id !== id));
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/tasks/${id}`, { 
          method: 'DELETE', 
          credentials: "include" 
        });
        if (res.ok) {
          toast.success("تم حذف الوظيفة!");
        } else {
          throw new Error();
        }
      } catch (err) {
        setTasks(prevTasks);
        toast.error("فشل حذف المهمة");
      }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3 tracking-tight"><CheckSquare className="text-emerald-400" size={32}/> مهامي الجامعية</h2>
                <p className="text-sm font-medium text-slate-400">تتبع وظائفك الجامعية ومواعيد التسليم بدقة.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 shrink-0">
                {showForm ? <X size={20}/> : <Plus size={20}/>} {showForm ? 'إلغاء' : 'إضافة مهمة'}
            </button>
        </div>

        <AnimatePresence>
            {showForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddTask} className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/[0.05] shadow-2xl space-y-6 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">عنوان الوظيفة / التكليف</label>
                            <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="مثال: وظيفة الخوارزميات الأولى" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">المادة (والرمز)</label>
                            <input required value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="مثال: برمجة 1 - BPG401" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">تاريخ الإصدار</label>
                            <input required value={formData.issueDate} onChange={e=>setFormData({...formData, issueDate: e.target.value})} type="date" className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none color-scheme-dark" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">تاريخ التسليم (Deadline)</label>
                            <input required value={formData.dueDate} onChange={e=>setFormData({...formData, dueDate: e.target.value})} type="date" className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none color-scheme-dark" />
                        </div>
                        <div>
                            <label htmlFor="taskTypeInput" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">نوع الوظيفة</label>
                            <select 
                                id="taskTypeInput"
                                value={formData.type} 
                                onChange={e=>setFormData({...formData, type: e.target.value})} 
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
                            >
                                <option value="individual">فردية 👤</option>
                                <option value="group">جماعية 👥</option>
                            </select>
                        </div>
                        {formData.type === 'group' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">أسماء الشركاء</label>
                                <input value={formData.partners} onChange={e=>setFormData({...formData, partners: e.target.value})} type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none" placeholder="مثال: أحمد، محمد، سارة..." />
                            </div>
                        )}
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-lg transition-colors shadow-lg">حفظ الوظيفة</button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>

        {tasks.length === 0 ? (
            <EmptyState icon={CheckSquare} message="لا يوجد لديك تكليفات أو وظائف حالياً" hideAction={true} />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <motion.div layout key={task.id} className={`bg-slate-900 p-6 rounded-3xl border transition-all duration-300 ${task.isDone ? 'border-emerald-500/30 opacity-60 grayscale-[0.5]' : 'border-white/10 hover:border-emerald-500/50 shadow-xl'}`}>
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-start gap-4">
                                <button onClick={() => toggleTaskDone(task.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5 ${task.isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-slate-500 hover:border-emerald-400'}`}>
                                    {task.isDone && <CheckCircle size={16} strokeWidth={3} />}
                                </button>
                                <div>
                                    <h4 className={`font-black text-lg mb-1.5 line-clamp-2 ${task.isDone ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h4>
                                    <span className="text-xs font-bold bg-slate-800 border border-white/5 text-slate-400 px-3 py-1.5 rounded-lg">{task.subject}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 bg-slate-800 rounded-full hover:bg-red-500/10"><Trash2 size={18}/></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-5 bg-slate-800 p-4 rounded-2xl border border-white/5">
                            <div className="flex flex-col gap-1.5 text-xs">
                                <span className="text-slate-500 font-bold uppercase">الإصدار</span>
                                <span className="font-bold text-slate-300 font-mono">{task.issueDate}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs">
                                <span className="text-red-400/80 font-bold uppercase">التسليم</span>
                                <span className="font-bold text-red-400 font-mono">{task.dueDate}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 ${task.type === 'group' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>
                                {task.type === 'group' ? <><Users size={14}/> جماعية</> : <><User size={14}/> فردية</>}
                            </span>
                            {task.type === 'group' && task.partners && (
                                <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]" title={task.partners}>مع: {task.partners}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
  );
}

function ArchiveTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", image: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/archive`, { credentials: "include" });
        if (res.ok) setProjects(await res.json());
      } catch (err) {
        toast.error("فشل جلب الأرشيف");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const toastId = toast.loading("جاري رفع الصورة...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          credentials: "include",
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          const imageUrl = data.url || data.fileUrl || data.imageUrl;
          setNewProject({ ...newProject, image: imageUrl });
          toast.success("تم رفع الصورة!", { id: toastId });
        } else {
          throw new Error();
        }
      } catch (err) {
        toast.error("فشل الرفع", { id: toastId });
      } finally {
        setIsUploading(false);
      }
  };

  const handleAddProject = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProject.image || !newProject.title) return toast.error("يرجى اختيار صورة وكتابة عنوان المشروع");
      
      const toastId = toast.loading("جاري الحفظ في الأرشيف...");
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: "include",
          body: JSON.stringify({ title: newProject.title, image: newProject.image })
        });

        if (res.ok) {
          const savedProject = await res.json();
          setProjects([savedProject, ...projects]);
          setNewProject({ title: "", image: "" });
          setShowForm(false);
          toast.success("تمت الإضافة بنجاح!", { id: toastId });
        } else {
          throw new Error();
        }
      } catch (err) {
        toast.error("فشل حفظ المشروع", { id: toastId });
      }
  };

  const deleteProject = async (id: string) => {
      const prev = [...projects];
      setProjects(projects.filter(p => p.id !== id));
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-profile/archive/${id}`, { 
          method: 'DELETE', credentials: "include" 
        });
        if (!res.ok) throw new Error();
        toast.success("تم الحذف من الأرشيف");
      } catch (err) {
        setProjects(prev);
        toast.error("فشل الحذف");
      }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-pink-500 w-10 h-10" /></div>;

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3 tracking-tight"><Archive className="text-pink-500" size={32}/> أرشيف الإبداع</h2>
                <p className="text-sm font-medium text-slate-400">مساحتك الخاصة لتوثيق مشاريعك وأعمالك الجامعية (Portfolio).</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] active:scale-95 shrink-0">
                {showForm ? <X size={20}/> : <ImagePlus size={20}/>} {showForm ? 'إلغاء' : 'إضافة عمل'}
            </button>
        </div>

        <AnimatePresence>
            {showForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddProject} className="bg-slate-900 p-8 rounded-[2.5rem] border border-pink-500/30 shadow-2xl space-y-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div 
                            onClick={() => !isUploading && fileRef.current?.click()}
                            className="w-full md:w-72 h-48 bg-slate-800 rounded-3xl border-2 border-dashed border-pink-500/40 hover:border-pink-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shrink-0 transition-colors"
                        >
                            {isUploading ? (
                                <Loader2 size={40} className="animate-spin text-pink-500" />
                            ) : newProject.image ? (
                                <>
                                    <img src={newProject.image} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-pink-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg">تغيير الصورة</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImagePlus size={40} className="text-pink-500/50 mb-3 group-hover:scale-110 transition-transform"/>
                                    <span className="text-sm font-bold text-slate-400">انقر لرفع لقطة للمشروع</span>
                                </>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                        <div className="flex-1 w-full flex flex-col justify-between h-full space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">عنوان المشروع أو العمل</label>
                                <input required value={newProject.title} onChange={e=>setNewProject({...newProject, title: e.target.value})} type="text" className="w-full bg-slate-800 border border-white/10 rounded-2xl p-5 text-white focus:border-pink-500 outline-none text-lg font-bold" placeholder="مثال: تطبيق إدارة المهام React" />
                            </div>
                            <button type="submit" disabled={isUploading} className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-lg transition-colors shadow-lg disabled:opacity-50">حفظ في الأرشيف</button>
                        </div>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>

        {projects.length === 0 ? (
            <EmptyState icon={Archive} message="الأرشيف فارغ، ابدأ بإضافة أعمالك المميزة" hideAction={true} />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(proj => (
                    <motion.div layout key={proj.id} className="bg-slate-900 rounded-[2rem] border border-white/5 overflow-hidden group hover:border-pink-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(236,72,153,0.15)] hover:-translate-y-2">
                        <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden">
                            <img src={proj.fileUrl || proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                            <button onClick={() => deleteProject(proj.id)} className="absolute top-4 left-4 bg-red-500/90 hover:bg-red-400 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-black text-white text-xl line-clamp-2 group-hover:text-pink-400 transition-colors leading-tight">{proj.title}</h3>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-mono font-medium">{new Date(proj.createdAt).toLocaleDateString('ar-EG')}</span>
                                <span className="w-8 h-1 bg-pink-500 rounded-full"></span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
  );
}

function GenericContentTab({ data, type, icon, emptyMessage, hideAction }: any) {
  if (!data || data.length === 0) return <EmptyState icon={icon} message={emptyMessage} hideAction={hideAction} />;
  
  const items = data.map((item: any) => ({ ...item, itemType: type }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item: any, i: number) => <ContentCard key={i} item={item} />)}
    </div>
  );
}

function ContentCard({ item }: any) {
  let data;
  if (item.itemType === 'COURSE') data = item.course || item;
  else if (item.itemType === 'WORKSHOP') data = item.workshop || item;
  else if (item.itemType === 'BOOTCAMP') data = item.bootcamp || item;
  else if (item.itemType === 'FREE_CONTENT') data = item.freeContent || item;
  else data = item.course || item.workshop || item.bootcamp || item.freeContent || item;

  const getLink = () => {
    switch(item.itemType) {
      case 'COURSE': return `/courses/${data.id}`;
      case 'BOOTCAMP': return `/bootcamps/${data.id}`;
      case 'WORKSHOP': return `/workshops/${data.id}`;
      case 'FREE_CONTENT': return `/free-content/${data.id}`;
      default: return '#';
    }
  };

  const getLabelInfo = () => {
    switch(item.itemType) {
      case 'COURSE': return { text: 'مادة أكاديمية', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'BOOTCAMP': return { text: 'معسكر تدريبي', color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'WORKSHOP': return { text: 'ورشة عمل', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'FREE_CONTENT': return { text: 'محتوى مجاني', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default: return { text: 'محتوى', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  const label = getLabelInfo();

  return (
    <Link href={getLink()} className="group block bg-slate-900 border border-white/[0.05] rounded-[2rem] p-4 hover:bg-slate-800/80 hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="flex flex-col gap-5 relative z-10">
        <div className="w-full h-40 rounded-2xl relative overflow-hidden bg-slate-950">
          <Image 
            src={getImageUrl(data?.imageUrl, 'course') || FALLBACK_IMAGE} 
            alt={data?.title || 'محتوى'} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-xl text-[10px] font-black border border-white/5 backdrop-blur-md shadow-lg ${label.bg} ${label.color}`}>
            {label.text}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between px-1">
          <h3 className="font-black text-white text-lg line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-4">{data?.title}</h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Clock size={14}/> أكمل التعلم</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-blue-500 flex items-center justify-center transition-colors text-slate-400 group-hover:text-white">
              <PlayCircle size={16} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ScheduleTab() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  
  const [gridData, setGridData] = useState<any[][][]>(Array.from({ length: 7 }, () => Array(7).fill([])));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number, col: number } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", time: "", description: "" });

  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const fetchSchedule = async (month: number, week: number) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/me/schedule?month=${month}&week=${week}`, { withCredentials: true });
      if (Array.isArray(res.data) && res.data.length === 7) {
        const safeData = res.data.map((row: any[]) => row.map((cell: any) => Array.isArray(cell) ? cell : []));
        setGridData(safeData);
      } else {
        setGridData(Array.from({ length: 7 }, () => Array(7).fill([])));
      }
    } catch (error) {
      console.error("Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedMonth, selectedWeek);
  }, [selectedMonth, selectedWeek]);

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("جاري حفظ الجدول...");
    try {
      await axios.post(`${API_BASE_URL}/api/users/me/schedule`, { month: selectedMonth, week: selectedWeek, data: gridData }, { withCredentials: true });
      toast.success("تم حفظ الجدول بنجاح! 🎯", { id: toastId });
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const openTaskModal = (row: number, col: number, taskToEdit: any = null) => {
    setActiveCell({ row, col });
    if (taskToEdit) {
      setEditingTaskId(taskToEdit.id);
      setTaskForm({ title: taskToEdit.title, time: taskToEdit.time, description: taskToEdit.description });
    } else {
      setEditingTaskId(null);
      setTaskForm({ title: "", time: "", description: "" });
    }
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!taskForm.title) return toast.error("يرجى إدخال عنوان المهمة");
    if (!activeCell) return;

    const { row, col } = activeCell;
    const newData = [...gridData];
    newData[row] = [...newData[row]];
    newData[row][col] = [...newData[row][col]];

    if (editingTaskId) {
      const taskIndex = newData[row][col].findIndex((t: any) => t.id === editingTaskId);
      if (taskIndex > -1) {
        newData[row][col][taskIndex] = { ...newData[row][col][taskIndex], ...taskForm };
      }
    } else {
      newData[row][col].push({ id: Date.now().toString(), ...taskForm });
    }

    setGridData(newData);
    setShowTaskModal(false);
  };

  const deleteTask = (row: number, col: number, taskId: string) => {
    const newData = [...gridData];
    newData[row] = [...newData[row]];
    newData[row][col] = newData[row][col].filter((t: any) => t.id !== taskId);
    setGridData(newData);
    setShowTaskModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.05] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative z-20">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] rotate-3">
            <Calendar size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-1 tracking-tight">منظم الدراسة</h2>
            <p className="text-sm font-medium text-slate-400">خطط لمهامك بدقة واحترافية</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative min-w-[150px]">
            <button 
              onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowWeekDropdown(false); }}
              className="w-full bg-slate-800 border border-white/10 hover:border-purple-500/50 text-white text-sm font-bold rounded-2xl px-6 py-4 flex items-center justify-between transition-all shadow-inner"
            >
              <span className="flex items-center gap-2"><Calendar size={18} className="text-purple-400" /> شهر {selectedMonth}</span>
              <span className="text-slate-500 text-[10px]">▼</span>
            </button>
            <AnimatePresence>
              {showMonthDropdown && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto custom-scrollbar">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <div key={m} onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }} className={`px-6 py-3.5 text-sm font-bold cursor-pointer transition-colors ${selectedMonth === m ? 'bg-purple-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
                      شهر {m}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative min-w-[150px]">
            <button 
              onClick={() => { setShowWeekDropdown(!showWeekDropdown); setShowMonthDropdown(false); }}
              className="w-full bg-slate-800 border border-white/10 hover:border-blue-500/50 text-white text-sm font-bold rounded-2xl px-6 py-4 flex items-center justify-between transition-all shadow-inner"
            >
              <span className="flex items-center gap-2"><TrendingUp size={18} className="text-blue-400" /> الأسبوع {selectedWeek}</span>
              <span className="text-slate-500 text-[10px]">▼</span>
            </button>
            <AnimatePresence>
              {showWeekDropdown && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {Array.from({ length: 4 }, (_, i) => i + 1).map(w => (
                    <div key={w} onClick={() => { setSelectedWeek(w); setShowWeekDropdown(false); }} className={`px-6 py-3.5 text-sm font-bold cursor-pointer transition-colors ${selectedWeek === w ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
                      الأسبوع {w}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            className="flex-1 lg:flex-none bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} حفظ الجدول
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-white/[0.05] shadow-2xl overflow-hidden relative z-10">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 flex items-center justify-center">
            <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto custom-scrollbar pb-6 relative z-10">
          <div className="min-w-[1000px] space-y-4">
            
            <div className="grid grid-cols-8 gap-4 mb-6">
              <div className="bg-slate-800 rounded-[2rem] p-4 flex flex-col items-center justify-center text-xs font-black text-slate-500 border border-white/5 shadow-inner uppercase tracking-wider">
                <span className="text-indigo-400 mb-1">الفترات</span>
                <span className="text-blue-400 border-t border-white/10 pt-1 w-full text-center">الأيام</span>
              </div>
              {days.map((day, i) => (
                <div key={i} className="bg-indigo-500/10 border-t-4 border-indigo-500/50 text-indigo-200 rounded-[2rem] p-5 text-center text-sm font-black shadow-lg">
                  {day}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 gap-4">
                  <div className="bg-blue-500/10 border-r-4 border-blue-500/50 rounded-[2rem] p-4 flex items-center justify-center text-sm font-black text-blue-200 shadow-lg whitespace-nowrap">
                    فترة {rowIndex + 1}
                  </div>
                  
                  {Array.from({ length: 7 }).map((_, colIndex) => {
                    const cellTasks = gridData[rowIndex]?.[colIndex] || [];
                    return (
                      <div key={colIndex} className="bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-indigo-500/40 rounded-[2rem] p-3 transition-colors flex flex-col gap-2 min-h-[120px] shadow-inner group">
                        
                        <div className="flex-1 space-y-2 overflow-y-auto max-h-[140px] custom-scrollbar pr-1">
                          {cellTasks.map((t: any) => (
                            <div 
                              key={t.id} 
                              onClick={() => openTaskModal(rowIndex, colIndex, t)}
                              className="bg-slate-900 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/30 p-2.5 rounded-xl cursor-pointer transition-colors group/task"
                            >
                              <div className="flex justify-between items-start mb-1.5 gap-2">
                                <span className="text-xs font-bold text-slate-200 line-clamp-1 leading-snug">{t.title}</span>
                                {t.time && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0 font-mono">{t.time}</span>}
                              </div>
                              {t.description && <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">{t.description}</p>}
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => openTaskModal(rowIndex, colIndex)} 
                          className={`w-full py-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${cellTasks.length === 0 ? 'border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-400' : 'border-transparent bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white mt-auto opacity-0 group-hover:opacity-100'}`}
                        >
                          <Plus size={14} strokeWidth={3} /> إضافة مهمة
                        </button>

                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTaskModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 sm:p-10 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-white">{editingTaskId ? 'تعديل المهمة' : 'إضافة مهمة'}</h3>
                </div>
                <button 
                  onClick={() => setShowTaskModal(false)} 
                  className="p-2.5 bg-slate-800 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">عنوان المهمة <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={taskForm.title} 
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="مثال: دراسة المحاضرة الثالثة"
                    className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">التوقيت (اختياري)</label>
                  <input 
                    type="time" 
                    value={taskForm.time} 
                    onChange={(e) => setTaskForm({...taskForm, time: e.target.value})}
                    className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">التفاصيل (اختياري)</label>
                  <textarea 
                    value={taskForm.description} 
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="اكتب ملاحظاتك هنا..."
                    rows={4}
                    className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none font-medium custom-scrollbar"
                  />
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button onClick={saveTask} className="flex-1 bg-white hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 text-lg">
                    {editingTaskId ? 'حفظ التعديلات' : 'إضافة للجدول'}
                  </button>
                  {editingTaskId && activeCell && (
                   <button 
                      onClick={() => deleteTask(activeCell.row, activeCell.col, editingTaskId)} 
                      className="px-5 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all shadow-sm"
                    >
                      <Trash2 size={24} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function EmptyState({ icon: Icon, message, hideAction }: any) {
  return (
    <div className="bg-slate-900 border border-dashed border-white/10 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
        <Icon size={40} className="text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{message}</h3>
      {!hideAction && (
        <>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">اكتشف أحدث المواد الدراسية، المعسكرات، وورشات العمل المتاحة في المنصة لتطوير مهاراتك.</p>
            <Link href="/courses" className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl font-black transition-all shadow-lg hover:scale-105 active:scale-95">
              تصفح المواد الآن
            </Link>
        </>
      )}
    </div>
  );
}

function SettingsTab({ user, setProfileData }: any) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: ""
  });
  
  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const passwordRequirements = [
    { id: "length", text: "8 محارف على الأقل", regex: /.{8,}/ },
    { id: "uppercase", text: "حرف كبير", regex: /[A-Z]/ },
    { id: "lowercase", text: "حرف صغير", regex: /[a-z]/ },
    { id: "number", text: "رقم", regex: /[0-9]/ },
    { id: "special", text: "رمز خاص", regex: /[^A-Za-z0-9]/ }
  ];

  const handleUpdateInfo = async () => {
    setInfoLoading(true);
    const toastId = toast.loading("جاري حفظ التعديلات...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          phone: formData.phone 
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setProfileData((prev: any) => ({...prev, ...updatedUser}));
        toast.success("تم تحديث معلوماتك بنجاح", { id: toastId });
      } else {
        const err = await res.json();
        toast.error(err.message || "حدث خطأ أثناء التحديث", { id: toastId });
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم", { id: toastId });
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error("يرجى ملء حقول كلمة المرور");
      return;
    }

    const isPasswordValid = passwordRequirements.every(req => req.regex.test(formData.newPassword));
    if (!isPasswordValid) {
      toast.error("يرجى التأكد من استيفاء جميع شروط كلمة المرور الجديدة 🛡️");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
       toast.error("كلمة المرور الجديدة يجب أن تكون مختلفة عن الكلمة الحالية");
       return;
    }

    setPassLoading(true);
    const toastId = toast.loading("جاري تغيير كلمة المرور...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ 
          oldPass: formData.currentPassword, 
          newPass: formData.newPassword 
        })
      });

      if (res.ok) {
        toast.success("تم تغيير كلمة المرور بنجاح", { id: toastId });
        setFormData({...formData, currentPassword: "", newPassword: ""});
      } else {
        const errData = await res.json();
        const errorMessage = Array.isArray(errData.message) ? errData.message[0] : errData.message;
        toast.error(errorMessage || "كلمة المرور الحالية غير صحيحة", { id: toastId });
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم", { id: toastId });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/[0.05] shadow-2xl flex flex-col relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User size={24} className="text-white" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">المعلومات الشخصية</h3>
        </div>
        
        <div className="space-y-6 flex-1 relative z-10">
          <div className="grid grid-cols-2 gap-5">
            <SettingInput id="fName" label="الاسم الأول" value={formData.firstName} onChange={(v: string) => setFormData({...formData, firstName: v})} icon={User} />
            <SettingInput id="lName" label="الكنية" value={formData.lastName} onChange={(v: string) => setFormData({...formData, lastName: v})} icon={User} />
          </div>
          <SettingInput id="phone" label="رقم الهاتف" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} icon={Phone} dir="ltr" />
        </div>
        
        <button 
          onClick={handleUpdateInfo}
          disabled={infoLoading}
          className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-8 relative z-10"
        >
          {infoLoading ? <Loader2 className="animate-spin mx-auto" /> : "حفظ التعديلات"}
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/[0.05] shadow-2xl flex flex-col relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">كلمة المرور والأمان</h3>
        </div>
        
        <div className="space-y-6 mb-8 relative z-10">
          <SettingInput 
            id="curPass" type="password" label="كلمة المرور الحالية" 
            value={formData.currentPassword} onChange={(v: string) => setFormData({...formData, currentPassword: v})} 
            icon={Lock} dir="ltr" 
          />
          
          <div className="space-y-4">
            <SettingInput 
              id="newPass" type="password" label="كلمة المرور الجديدة" 
              value={formData.newPassword} onChange={(v: string) => setFormData({...formData, newPassword: v})} 
              icon={Shield} dir="ltr" 
            />
            
            <AnimatePresence>
              {formData.newPassword.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-3 bg-slate-800 p-4 rounded-2xl border border-white/5">
                  {passwordRequirements.map((req) => {
                    const isValid = req.regex.test(formData.newPassword);
                    return (
                      <div key={req.id} className="flex items-center gap-2 text-[11px] sm:text-xs">
                        {isValid ? <CheckCircle size={14} className="text-emerald-400" strokeWidth={3} /> : <X size={14} className="text-slate-600" strokeWidth={3} />}
                        <span className={isValid ? "text-emerald-400 font-bold" : "text-slate-500 font-medium"}>{req.text}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <button 
          onClick={handleChangePassword}
          disabled={passLoading}
          className="w-full py-4 bg-slate-800 text-white hover:bg-slate-700 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-auto relative z-10"
        >
          {passLoading ? <Loader2 className="animate-spin mx-auto" /> : "تغيير كلمة المرور"}
        </button>
      </div>
    </div>
  );
}

function SettingInput({ id, label, value, onChange, icon: Icon, type = "text", dir = "rtl", autoComplete }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <Icon className={`absolute ${dir === 'ltr' ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none`} size={20} />
        <input 
          id={id}
          type={inputType} 
          value={value} 
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-800 border border-white/10 focus:border-purple-500 rounded-2xl py-4 text-white outline-none transition-all text-sm font-medium ${dir === 'ltr' ? 'pl-14 pr-14' : 'pr-14 pl-14'} focus:ring-1 focus:ring-purple-500`}
          dir={dir}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${dir === 'ltr' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}