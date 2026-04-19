"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, Bell, MessageSquare, 
  Settings, User, HelpCircle, LogOut, Search, 
  PlayCircle, MoreHorizontal, ChevronRight, Award, Zap, ShieldCheck, Loader2,
  Calendar, Phone, Send, CheckCircle2, Trash2, Info, X,
  Wallet, Save, UploadCloud, Clock, GraduationCap, Plus, Users, FolderOpen, FileText,
  Maximize, Minimize, GitMerge, CheckSquare, Archive, Map, ImagePlus, Unlock, Layers, 
  Calculator, CheckCircle, MessageCircle, Trophy, AlertCircle, FileCheck, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";
import { toast, Toaster } from "react-hot-toast";

import PrivateChat from "@/components/PrivateChat"; 

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white?text=UpScale";

export default function DesktopDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("COURSES");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTeacherChat, setActiveTeacherChat] = useState<{contentId: string, studentId: string} | null>(null);

  const isDesktopApp = typeof window !== 'undefined' && (window as any).isUpScaleApp;

  const fetchProfileData = async () => {
    try {
      const res = await fetch(API_ROUTES.GET_ME, { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (data.role === 'TEACHER' || data.role === 'ADMIN') {
           setActiveTab("INBOX"); 
        }
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, { withCredentials: true });
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {}
  };

  useEffect(() => { 
    fetchProfileData(); 
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-screen w-full bg-[#0f172a] items-center justify-center">
      <Loader2 className="animate-spin text-purple-500 w-12 h-12" />
    </div>
  );

  if (!profileData) return (
    <div className="flex h-screen w-full bg-[#0f172a] items-center justify-center text-white">
      <p>حدث خطأ في تحميل البيانات. يرجى تسجيل الدخول مجدداً.</p>
    </div>
  );

  const isAdmin = profileData.role === 'ADMIN';
  const isTeacher = profileData.role === 'TEACHER';

  let displayItems: any[] = [];
  if (isAdmin) {
      displayItems = profileData.allContent || [];
  } else if (isTeacher) {
      displayItems = [
          ...(profileData.teachingCourses || []).map((c: any) => ({ course: c })),
          ...(profileData.teachingWorkshops || []).map((w: any) => ({ workshop: w })),
          ...(profileData.teachingBootcamps || []).map((b: any) => ({ bootcamp: b }))
      ];
  } else {
      displayItems = [
          ...(profileData.categorizedContent?.courses || []), 
          ...(profileData.categorizedContent?.workshops || []), 
          ...(profileData.categorizedContent?.bootcamps || [])
      ];
  }

  const filteredItems = displayItems.filter(item => {
    const data = item.course || item.workshop || item.bootcamp || item;
    return data?.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const heroItem = filteredItems.length > 0 ? filteredItems[0] : null;
  const heroData = heroItem ? (heroItem.course || heroItem.workshop || heroItem.bootcamp || heroItem) : null;
  
  const currentXP = profileData.xp || 0;
  const currentLevel = Math.floor(currentXP / 1000) + 1;

  const navItems = isAdmin ? [
    { id: 'COURSES', label: 'كل المواد (إدارة)', icon: LayoutDashboard },
    { id: 'INBOX', label: 'الرسائل الواردة', icon: MessageCircle },
    { id: 'EXAMS', label: 'نتائج الامتحانات', icon: FileCheck },
    { id: 'FILES', label: 'مكتبة الملفات', icon: FileText },
    { id: 'CHAT', label: 'النقاشات المباشرة', icon: MessageSquare },
    { id: 'NOTIFICATIONS', label: 'الإشعارات', icon: Bell, badge: unreadCount },
    { id: 'WALLET', label: 'المحفظة', icon: Wallet },
  ] : isTeacher ? [
    { id: 'INBOX', label: 'الرسائل الواردة', icon: MessageCircle },
    { id: 'COURSES', label: 'موادي التعليمية', icon: LayoutDashboard },
    { id: 'EXAMS', label: 'نتائج الامتحانات', icon: FileCheck },
    { id: 'SCHEDULE', label: 'الجدول الدراسي', icon: Calendar },
    { id: 'FILES', label: 'مكتبة الملفات', icon: FileText },
    { id: 'CHAT', label: 'النقاشات المباشرة', icon: MessageSquare },
    { id: 'NOTIFICATIONS', label: 'الإشعارات', icon: Bell, badge: unreadCount },
    { id: 'WALLET', label: 'المحفظة', icon: Wallet },
  ] : [
    { id: 'COURSES', label: 'مساراتي', icon: LayoutDashboard },
    { id: 'ACADEMIC_ROUTE', label: 'المسار الأكاديمي', icon: GitMerge },
    { id: 'TASKS', label: 'المهام الجامعية', icon: CheckSquare },
    { id: 'CALCULATOR', label: 'حاسبة الدرجات', icon: Calculator },
    { id: 'EXAMS', label: 'نتائجي الامتحانية', icon: Award },
    { id: 'ARCHIVE', label: 'أرشيف الإبداع', icon: Archive },
    { id: 'FILES', label: 'مكتبة الملفات (PDF)', icon: FileText },
    { id: 'CHAT', label: 'النقاشات المباشرة', icon: MessageSquare },
    { id: 'SCHEDULE', label: 'الجدول المنظم', icon: Calendar },
    { id: 'NOTIFICATIONS', label: 'الإشعارات', icon: Bell, badge: unreadCount },
    { id: 'WALLET', label: 'المحفظة والشحن', icon: Wallet },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 font-sans overflow-hidden" dir="rtl">
      <Toaster position="top-center" />
      
      <aside className="w-64 bg-[#111827] border-l border-white/5 hidden lg:flex flex-col justify-between shadow-2xl z-10">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-8 flex items-center justify-center border-b border-white/5 mb-4 shrink-0">
            <div className="flex flex-col items-center">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 tracking-tighter flex items-center gap-2">
                    <Image 
                        src="/logo.png" 
                        alt="UpScale Logo" 
                        width={40} 
                        height={40} 
                        className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                    /> 
                    UpScale
                </div>
                <span className="text-[10px] tracking-[0.3em] text-slate-500 mt-1 uppercase">Training Hub</span>
            </div>
          </div>

          <nav className="px-4 space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pb-4">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSearchQuery(""); setSelectedCourseId(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeTab === item.id ? 'bg-gradient-to-r from-purple-500/10 to-transparent text-purple-400 border-r-2 border-purple-500' : 'text-slate-400 hover:bg-white/5 border-r-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} /> {item.label}
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-white/5 shrink-0 bg-[#111827]">
            <button onClick={() => { setActiveTab("SETTINGS"); setSelectedCourseId(null); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all text-sm font-bold">
                <Settings size={18} /> الإعدادات
            </button>
            <button onClick={() => setShowHelpModal(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all text-sm font-bold">
                <HelpCircle size={18} /> المساعدة
            </button>
            <button onClick={() => logout()} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold mt-2">
                <LogOut size={18} /> تسجيل الخروج
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-20 border-b border-white/5">
            <div className="relative w-64 md:w-96">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في مساراتك..." 
                  className="w-full bg-[#1e293b]/50 border border-white/5 rounded-full py-2.5 pr-12 pl-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" 
                />
            </div>
            <div className="flex items-center gap-4">
                {isDesktopApp && <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold animate-pulse"><ShieldCheck size={16} /> بيئة تعلم محمية</div>}
                <button onClick={() => setActiveTab("NOTIFICATIONS")} className="w-10 h-10 rounded-full bg-[#1e293b] border border-white/5 flex items-center justify-center text-slate-400 relative hover:text-white transition-colors">
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1e293b] animate-ping"></span>}
                </button>
            </div>
        </header>

        <div className="p-8 pb-12 max-w-5xl mx-auto w-full space-y-8">
            
            {selectedCourseId ? (
                <DesktopCourseViewer courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
            ) : (
                <>
                    {activeTab === "COURSES" && (
                    <>
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">{searchQuery ? "نتائج البحث" : "متابعة التعلم"}</h2>
                            </div>
                            {heroData ? (
                            <div className="relative bg-gradient-to-l from-[#1e293b] to-[#0f172a] rounded-[2rem] border border-white/5 p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>

                                <div className="relative z-10 flex-1">
                                    <span className="text-[10px] font-bold text-purple-400 tracking-wider mb-2 block uppercase bg-purple-500/10 w-fit px-2 py-1 rounded-md">أحدث مساراتك</span>
                                    <h3 className="text-3xl font-black text-white mb-3 line-clamp-2">{heroData.title}</h3>
                                    <p className="text-sm text-slate-400 mb-6 max-w-md leading-relaxed line-clamp-2">تابع التعلم الآن من حيث توقفت، وحقق أهدافك في هذا المسار.</p>
                                    <button onClick={() => setSelectedCourseId(heroData.id)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 group shadow-lg shadow-purple-500/30">
                                        {(isAdmin || isTeacher) ? "إدارة المادة" : "ابدأ المشاهدة"} <ChevronRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 shrink-0 bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setSelectedCourseId(heroData.id)}>
                                    <Image src={getImageUrl(heroData.imageUrl, 'course') || FALLBACK_IMAGE} alt="course" fill className="object-cover opacity-90 group-hover:scale-105 transition-all duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle size={48} className="text-white" /></div>
                                </div>
                            </div>
                            ) : (
                            <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
                                <p className="text-gray-400">لا يوجد مسارات مسجلة حتى الآن.</p>
                            </div>
                            )}
                        </section>

                        {filteredItems.length > 1 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">كل المسارات</h2>
                                <span className="text-sm text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-lg">{filteredItems.length} مسارات</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredItems.map((item: any, idx: number) => (
                                    <CourseCard key={idx} item={item} isTeacher={isAdmin || isTeacher} onOpenCourse={(id: string) => setSelectedCourseId(id)} />
                                ))}
                            </div>
                        </section>
                        )}
                    </>
                    )}

                    {activeTab === "INBOX" && (isAdmin || isTeacher) && <TeacherInboxTab onOpenChat={(contentId, studentId) => setActiveTeacherChat({contentId, studentId})} />}
                    {activeTab === "ACADEMIC_ROUTE" && !(isAdmin || isTeacher) && <AcademicRouteTab />}
                    {activeTab === "TASKS" && !(isAdmin || isTeacher) && <UniversityTasksTab />}
                    {activeTab === "CALCULATOR" && !(isAdmin || isTeacher) && <CalculatorTab />}
                    {activeTab === "ARCHIVE" && !(isAdmin || isTeacher) && <ArchiveTab />}
                    {activeTab === "EXAMS" && ((isAdmin || isTeacher) ? <TeacherExamsTab /> : <StudentExamsTab />)}
                    
                    {activeTab === "FILES" && <DesktopFilesSection displayItems={filteredItems} />}
                    {activeTab === "NOTIFICATIONS" && <DesktopNotificationsSection updateBadge={fetchUnreadNotifications} />}
                    {activeTab === "CHAT" && <DesktopDiscussionsSection displayItems={filteredItems} router={router} />}
                    {activeTab === "SCHEDULE" && <DesktopScheduleSection />}
                    {activeTab === "WALLET" && <DesktopWalletSection user={profileData} />}
                    {activeTab === "SETTINGS" && <DesktopSettingsSection user={profileData} setProfileData={setProfileData} />}
                </>
            )}
        </div>
      </main>

      <aside className="w-80 bg-[#111827] border-r border-white/5 hidden xl:flex flex-col shadow-2xl z-10">
        <div className="p-8 flex flex-col items-center text-center border-b border-white/5 relative">
            <div className="w-full flex justify-between absolute top-6 px-6">
                <span className="text-xs font-bold text-slate-500">معلومات الحساب</span>
                <button className="text-slate-500 hover:text-white"><MoreHorizontal size={18}/></button>
            </div>
            
            <div className="relative mt-8 mb-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-blue-500">
                   <img 
                      src={getImageUrl(profileData.avatar, 'avatar') || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.firstName}`} 
                      alt="الصورة الشخصية" 
                      className="w-full h-full rounded-full object-cover border-4 border-[#111827] bg-[#1e293b]" 
                    />
                </div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111827] rounded-full"></div>
            </div>
            
            <h3 className="text-lg font-black text-white tracking-wider">{profileData.firstName} {profileData.lastName}</h3>
            <p className="text-xs text-slate-400 mt-1" dir="ltr">@{profileData.username}</p>

            <div className="w-full mt-6 bg-[#1e293b]/50 rounded-xl p-4 border border-white/5 flex justify-between items-center text-right">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-1">الرصيد</p>
                    <p className="text-xs font-bold text-emerald-400">{profileData.balance?.toLocaleString() || 0} ل.س</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-left">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">المستوى</p>
                    <p className="text-xs font-bold text-white flex items-center gap-1 justify-end"><Award size={14} className="text-amber-400"/> {currentLevel}</p>
                </div>
            </div>
        </div>

        <div className="p-6 flex-1">
            <h4 className="text-sm font-bold text-white mb-4">إحصائيات الإنجاز</h4>
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5"><span className="text-xs text-slate-400 font-medium">المسارات المسجلة:</span><span className="text-sm font-bold text-white">{displayItems.length}</span></div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5"><span className="text-xs text-slate-400 font-medium">نقاط التعلم (XP):</span><span className="text-sm font-bold text-purple-400">{currentXP}</span></div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5"><span className="text-xs text-slate-400 font-medium">حالة الحساب:</span><span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">نشط</span></div>
            </div>

            <button onClick={() => { setActiveTab("SCHEDULE"); setSelectedCourseId(null); }} className="mt-8 w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-5 text-center group transition-all hover:border-purple-500/50">
                <Calendar size={32} className="mx-auto text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-white mb-1">الجدول الدراسي</h4>
                <p className="text-xs text-slate-400">نظّم مهامك ودراستك اليومية بفعالية.</p>
            </button>
        </div>
      </aside>

      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2rem] p-8 max-w-md w-full border border-white/10 text-center shadow-2xl">
            <HelpCircle size={48} className="text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">مركز المساعدة والدعم</h3>
            <p className="text-sm text-gray-400 mb-6">نحن هنا لمساعدتك! تواصل معنا عبر القنوات التالية:</p>
            
            <div className="space-y-3">
              <a href="https://t.me/UpScaleHub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Send size={20} /></div> 
                <div className="text-right"><p className="text-xs text-gray-500 font-bold mb-1">قناة التيليجرام الرسمية</p><p className="text-sm font-bold text-white" dir="ltr">@UpScaleTrainingHub</p></div>
              </a>
              <div className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><Phone size={20} /></div> 
                <div className="text-right"><p className="text-xs text-gray-500 font-bold mb-1">رقم الدعم الفني (واتساب)</p><p className="text-sm font-bold text-white" dir="ltr">+963 985 364 635</p></div>
              </div>
            </div>
            <button onClick={() => setShowHelpModal(false)} className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">إغلاق النافذة</button>
          </div>
        </div>
      )}

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


function CourseCard({ item, isTeacher, onOpenCourse }: any) {
  const data = item.course || item.workshop || item.bootcamp || item;
  const progress = item.progress || 0; 

  return (
    <div onClick={() => onOpenCourse(data.id)} className="bg-[#1e293b] border border-white/5 hover:border-purple-500/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 group flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-black">
        <Image src={getImageUrl(data?.imageUrl, 'course') || FALLBACK_IMAGE} alt={data?.title || "كورس"} fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <h4 className="font-bold text-white text-base mb-4 line-clamp-2 group-hover:text-purple-400 transition-colors">{data?.title || "مادة تعليمية"}</h4>
        
        {!isTeacher && (
          <div>
            <div className="w-full bg-[#0f172a] rounded-full h-1.5 mb-4 overflow-hidden border border-white/5">
               <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <button className="w-full py-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl text-sm font-bold border border-purple-500/20 transition-all flex items-center justify-center gap-2">
               <PlayCircle size={16} /> متابعة التعلم
            </button>
          </div>
        )}

        {isTeacher && (
          <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-sm font-bold border border-blue-500/20 transition-all flex items-center justify-center gap-2">
             <Settings size={16} /> إدارة المادة
          </button>
        )}
      </div>
    </div>
  );
}

function DesktopCourseViewer({ courseId, onBack }: any) {
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const url = API_ROUTES.COURSE_DETAILS ? API_ROUTES.COURSE_DETAILS(courseId) : `${API_BASE_URL}/api/courses/${courseId}`;
        const res = await axios.get(url, { withCredentials: true });
        setCourseData(res.data);
      } catch (e) { toast.error("فشل تحميل بيانات المادة"); } finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId]);

const handlePlayVideo = async (video: any) => {
    const toastId = toast.loading("جاري تجهيز المشغل الآمن...");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vdocipher/otp/${video.id}`, { withCredentials: true });
      if (res.data?.otp && res.data?.playbackInfo) {
        
        axios.post(`${API_BASE_URL}/api/progress/complete`, { contentId: video.id }, { withCredentials: true }).catch(() => {});
        
        setCourseData((prev: any) => ({
          ...prev,
          contents: prev.contents.map((c: any) => c.id === video.id ? { ...c, isCompleted: true } : c)
        }));

        toast.success("تم التجهيز، جاري التحويل...", { id: toastId, duration: 2000 });
        
        setTimeout(() => {
          toast.dismiss(toastId);
          router.push(`/video-player?courseId=${courseId}&otp=${res.data.otp}&playbackInfo=${res.data.playbackInfo}`);
        }, 500);

      } else {
        toast.error("عذراً، الفيديو غير متوفر حالياً", { id: toastId });
      }
    } catch (e) {
      toast.error("حدث خطأ في جلب تصريح المشاهدة المحمي", { id: toastId });
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-500 w-12 h-12" /></div>;
  if (!courseData) return <div className="text-center p-20 text-white font-bold">لم يتم العثور على المادة المطلوبة.</div>;

  const videos = courseData.contents?.filter((c:any) => c.type === 'VIDEO') || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">{courseData.title}</h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400 flex items-center gap-2"><PlayCircle size={16}/> {videos.length} مقاطع فيديو متاحة</p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              أنجزت {videos.filter((v:any) => v.isCompleted).length} من {videos.length}
            </span>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-white bg-white/5 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold">
          <LogOut size={18} className="rtl:rotate-180" /> العودة للوحة التحكم
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((vid: any, idx: number) => (
          <div 
            key={idx} 
            onClick={() => handlePlayVideo(vid)} 
            className={`relative overflow-hidden p-6 rounded-[2rem] cursor-pointer transition-all duration-500 group flex flex-col justify-between min-h-[180px] border ${
              vid.isCompleted 
                ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]' 
                : 'bg-[#1e293b] border-white/5 hover:border-purple-500/40 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)]'
            }`}
          >
             {/* رقم الجلسة كخلفية مائية (Watermark) تعطي طابع احترافي */}
             <div className={`absolute -left-4 -bottom-4 text-9xl font-black italic opacity-[0.03] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 ${vid.isCompleted ? 'text-emerald-500' : 'text-purple-500'}`}>
                {(idx + 1).toString().padStart(2, '0')}
             </div>

             {/* إضاءة خفيفة في الزاوية */}
             <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 ${vid.isCompleted ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`}></div>

             {/* القسم العلوي: الأيقونة وحالة الاكتمال */}
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-500 group-hover:scale-110 shadow-lg ${
                  vid.isCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:shadow-emerald-500/20' 
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:shadow-purple-500/20'
                }`}>
                  {vid.isCompleted 
                    ? <CheckCircle size={28} className="drop-shadow-md" /> 
                    : <PlayCircle size={28} className="drop-shadow-md fill-purple-500/20 group-hover:fill-purple-500/40 transition-colors" />
                  }
                </div>
                
                {vid.isCompleted && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                    <CheckCircle2 size={14} /> اكتملت
                  </span>
                )}
             </div>
             
             {/* القسم السفلي: رقم الجلسة واسمها */}
             <div className="relative z-10 mt-auto">
               <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border shadow-sm ${
                    vid.isCompleted ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                  }`}>
                    الجلسة {idx + 1}
                  </span>
               </div>
               <h4 className={`font-bold text-base line-clamp-2 leading-relaxed transition-colors duration-300 ${
                 vid.isCompleted ? 'text-emerald-50 group-hover:text-emerald-200' : 'text-slate-100 group-hover:text-purple-200'
               }`}>
                 {vid.title}
               </h4>
             </div>
          </div>
        ))}
        {videos.length === 0 && <div className="col-span-full text-center py-16 text-gray-500 bg-[#1e293b]/50 rounded-[3rem] border border-dashed border-white/10 font-bold">لا يوجد فيديوهات في هذه المادة حالياً</div>}
      </div>
    </div>
  );
}

function DesktopFilesSection({ displayItems }: any) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error("عذراً، غير مسموح بحفظ أو طباعة هذا الملف 🔒");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCourse = async (id: string) => {
     setSelectedCourseId(id);
     setLoading(true);
     try {
        const url = API_ROUTES.COURSE_DETAILS ? API_ROUTES.COURSE_DETAILS(id) : `${API_BASE_URL}/api/courses/${id}`;
        const res = await axios.get(url, { withCredentials: true });
        setCourseData(res.data);
     } catch(e) { toast.error("خطأ في جلب الملفات"); }
     setLoading(false);
  };

  const togglePdfFullScreen = () => {
    if (!document.fullscreenElement) {
      pdfContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (viewingPdf) {
     return (
        <div ref={pdfContainerRef} className="bg-[#1e293b] rounded-[2rem] border border-white/10 overflow-hidden h-[80vh] relative shadow-2xl flex flex-col animate-in zoom-in-95">
           <div className="p-4 bg-[#0f172a] flex justify-between items-center border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                 <button onClick={() => setViewingPdf(null)} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
                    <ChevronRight size={16} className="rtl:rotate-180" /> رجوع
                 </button>
                 <h3 className="text-white font-bold flex items-center gap-2 border-r border-white/10 pr-3"><FileText size={18}/> عارض الملفات الآمن</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={togglePdfFullScreen} className="p-2 bg-white/10 text-white hover:bg-purple-600 rounded-lg transition-colors" title="ملء الشاشة">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                 </button>
              </div>
           </div>
           <iframe src={`${viewingPdf}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full flex-1 border-0" title="عارض ملفات PDF" onContextMenu={(e) => e.preventDefault()}></iframe>
        </div>
     );
  }

  if (selectedCourseId) {
     if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;
     
     const pdfs = courseData?.contents?.filter((c:any) => c.type === 'SUMMARY' || c.url?.toLowerCase().endsWith('.pdf')) || [];

     return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
           <button onClick={() => setSelectedCourseId(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors font-bold"><ChevronRight size={18} className="rtl:rotate-180" /> العودة للمواد</button>
           <h2 className="text-2xl font-black text-white mb-4">ملفات: {courseData?.title}</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pdfs.map((pdf: any, idx: number) => (
                 <button key={idx} onClick={() => setViewingPdf(pdf.url)} className="bg-[#1e293b] border border-white/5 hover:border-blue-500/50 p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={32}/></div>
                    <span className="text-white font-bold text-sm text-center line-clamp-2">{pdf.title}</span>
                 </button>
              ))}
              {pdfs.length === 0 && <p className="text-gray-500 col-span-full text-center p-12 bg-[#1e293b]/50 rounded-[2rem] border border-dashed border-white/10 font-bold">لا يوجد ملفات أو ملخصات في هذه المادة حالياً.</p>}
           </div>
        </div>
     );
  }

  return (
     <div className="animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center"><FolderOpen size={24} /></div>
          <div><h2 className="text-2xl font-black text-white">مكتبة الملفات والملخصات</h2><p className="text-xs text-gray-400">اختر المادة لتصفح ملفات الـ PDF الخاصة بها</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {displayItems?.map((item: any, idx: number) => {
              const data = item.course || item.workshop || item.bootcamp || item;
              return (
                 <button key={idx} onClick={() => handleSelectCourse(data.id)} className="flex items-center gap-4 bg-[#1e293b] p-4 rounded-[2rem] border border-white/5 hover:border-blue-500/50 transition-all text-right group shadow-lg">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative"><Image src={getImageUrl(data.imageUrl, 'course') || FALLBACK_IMAGE} alt="course" fill className="object-cover"/></div>
                    <div className="flex-1"><h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400">{data.title}</h4><span className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FolderOpen size={12}/> تصفح الملفات</span></div>
                 </button>
              )
           })}
           {(!displayItems || displayItems.length === 0) && <p className="text-gray-500 p-4">لا يوجد مواد متاحة.</p>}
        </div>
     </div>
  )
}

function DesktopNotificationsSection({ updateBadge }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, { withCredentials: true });
      setNotifications(res.data);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/mark-read`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      updateBadge();
      toast.success("تم تحديد الكل كمقروء");
    } catch (error) {}
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/clear`, { withCredentials: true });
      setNotifications([]);
      updateBadge();
      toast.success("تم مسح الإشعارات بنجاح");
    } catch (error) {}
  };

  const deleteNotification = async (e: any, id: string) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== id));
      updateBadge();
      toast.success("تم حذف الإشعار نهائياً");
    } catch (err) { toast.error("حدث خطأ أثناء الحذف"); }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await axios.patch(`${API_BASE_URL}/api/notifications/mark-read`, {}, { withCredentials: true });
        setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
        updateBadge();
      } catch (error) {}
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'SYSTEM': return <Info className="text-blue-400" size={20}/>;
      case 'COURSE': return <BookOpen className="text-purple-400" size={20}/>;
      case 'PAYMENT': return <Zap className="text-emerald-400" size={20}/>;
      case 'CHAT': return <MessageSquare className="text-orange-400" size={20}/>;
      default: return <Bell className="text-gray-400" size={20}/>;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center"><Bell size={24} /></div>
          <div><h2 className="text-2xl font-black text-white">مركز الإشعارات</h2><p className="text-xs text-gray-400">آخر التحديثات الخاصة بحسابك (للقراءة فقط)</p></div>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button onClick={markAllRead} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/20 transition-all"><CheckCircle2 size={16}/> تحديد كمقروء</button>
            <button onClick={clearAll} className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold border border-red-500/20 transition-all"><Trash2 size={16}/> مسح الكل</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-500 w-10 h-10" /></div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-16 text-center shadow-lg">
           <Bell size={48} className="text-gray-600 mx-auto mb-4" />
           <p className="text-lg font-bold text-white">لا يوجد إشعارات حالياً</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer group relative ${n.isRead ? 'bg-[#1e293b] border-white/5 hover:border-white/10' : 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:bg-purple-900/20'}`}>
               <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                 {getIcon(n.type)}
               </div>
               <div className="flex-1 pr-8">
                 <h4 className={`text-base font-bold mb-1 ${n.isRead ? 'text-gray-300' : 'text-white'}`}>{n.title}</h4>
                 <p className="text-sm text-gray-400 leading-relaxed mb-2">{n.message}</p>
                 <span className="text-[10px] text-gray-500 font-medium">{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
               </div>
               {!n.isRead && <div className="absolute left-6 top-6 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
               <button onClick={(e) => deleteNotification(e, n.id)} className="absolute top-4 left-4 p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="حذف الإشعار">
                 <X size={16} />
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopDiscussionsSection({ displayItems, router }: any) {
  const [selectedPrivateChatId, setSelectedPrivateChatId] = useState<string | null>(null);

  if (selectedPrivateChatId) {
    return (
      <div className="bg-[#1e293b] rounded-[2rem] border border-white/10 overflow-hidden h-[80vh] relative shadow-2xl animate-in zoom-in-95 flex flex-col">
        <div className="p-4 bg-[#0f172a] border-b border-white/10 flex justify-between items-center z-10">
           <h3 className="text-white font-bold text-sm flex items-center gap-2"><User size={16} className="text-blue-400"/> محادثة خاصة مع المدرب</h3>
           <button onClick={() => setSelectedPrivateChatId(null)} className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg transition-all">
             <X size={16} />
           </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
           <PrivateChat contentId={selectedPrivateChatId} onClose={() => setSelectedPrivateChatId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center"><MessageSquare size={24} /></div>
        <div><h2 className="text-2xl font-black text-white">النقاشات المباشرة</h2><p className="text-xs text-gray-400">اختر نوع التواصل الذي تريده لكل مادة</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems?.map((item: any, idx: number) => {
          const data = item.course || item.workshop || item.bootcamp || item;
          return (
            <div key={idx} className="bg-[#1e293b] p-5 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group shadow-lg flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative"><Image src={getImageUrl(data.imageUrl, 'course') || FALLBACK_IMAGE} alt="course" fill className="object-cover"/></div>
                 <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight flex-1 group-hover:text-purple-400 transition-colors">{data.title}</h4>
               </div>
               
               <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                  <button 
                     onClick={() => router.push(`/discussions/${data.id}`)} 
                     className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                     title="المجموعة العامة للطلاب"
                  >
                     <Users size={14}/> المجموعة
                  </button>
                  <button 
                     onClick={() => setSelectedPrivateChatId(data.id)} 
                     className="flex-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                     title="رسالة خاصة للمدرب"
                  >
                     <User size={14}/> المدرب
                  </button>
               </div>
            </div>
          );
        })}
        {(!displayItems || displayItems.length === 0) && <p className="text-gray-500 p-4 col-span-full">لا يوجد مواد متاحة للنقاش.</p>}
      </div>
    </div>
  );
}

function DesktopScheduleSection() {
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
      const res = await axios.get(`${API_BASE_URL}/api/users/me/schedule?month=${month}&week=${week}`, {
        withCredentials: true
      });

      if (Array.isArray(res.data) && res.data.length === 7) {
        const safeData = res.data.map((row: any[]) => 
          row.map((cell: any) => Array.isArray(cell) ? cell : [])
        );
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
      await axios.post(`${API_BASE_URL}/api/users/me/schedule`, {
        month: selectedMonth,
        week: selectedWeek,
        data: gridData
      }, {
       withCredentials: true
      });
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative z-20">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
            <Calendar size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-1">منظم الدراسة الأسبوعي</h2>
            <p className="text-xs font-bold text-gray-400">اضغط على الخانة لإضافة (عنوان، ساعة، تفاصيل)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative min-w-[140px]">
            <button 
              onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowWeekDropdown(false); }}
              className="w-full bg-[#0f172a] border border-white/10 hover:border-purple-500/50 text-white text-sm font-bold rounded-xl px-5 py-3.5 flex items-center justify-between transition-all shadow-inner"
            >
              <span className="flex items-center gap-2"><Calendar size={16} className="text-purple-400" /> شهر {selectedMonth}</span>
              <span className="text-gray-500 text-[10px]">▼</span>
            </button>
            <AnimatePresence>
              {showMonthDropdown && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <div key={m} onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }} className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedMonth === m ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-gray-300'}`}>
                      شهر {m}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative min-w-[140px]">
            <button 
              onClick={() => { setShowWeekDropdown(!showWeekDropdown); setShowMonthDropdown(false); }}
              className="w-full bg-[#0f172a] border border-white/10 hover:border-purple-500/50 text-white text-sm font-bold rounded-xl px-5 py-3.5 flex items-center justify-between transition-all shadow-inner"
            >
              <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-400" /> الأسبوع {selectedWeek}</span>
              <span className="text-gray-500 text-[10px]">▼</span>
            </button>
            <AnimatePresence>
              {showWeekDropdown && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  {Array.from({ length: 4 }, (_, i) => i + 1).map(w => (
                    <div key={w} onClick={() => { setSelectedWeek(w); setShowWeekDropdown(false); }} className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedWeek === w ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-300'}`}>
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
            className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} حفظ 
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] p-4 sm:p-8 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative z-10">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-[#1e293b]/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto custom-scrollbar pb-4 relative z-10">
          <div className="min-w-[900px] space-y-4">
            <div className="grid grid-cols-8 gap-3 mb-4">
              <div className="bg-black/30 rounded-2xl p-4 flex flex-col items-center justify-center text-xs font-bold text-gray-500 border border-white/5 shadow-inner">
                <span className="text-purple-400 mb-1">الفترات</span>
                <span className="text-blue-400 border-t border-white/10 pt-1 w-full text-center">الأيام</span>
              </div>
              {days.map((day, i) => (
                <div key={i} className="bg-gradient-to-b from-purple-500/10 to-transparent border-t-2 border-purple-500/50 text-purple-300 rounded-2xl p-4 text-center text-sm font-black shadow-lg">
                  {day}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 gap-3">
                  <div className="bg-gradient-to-l from-blue-500/10 to-transparent border-r-2 border-blue-500/50 rounded-2xl p-3 flex items-center justify-center text-sm font-black text-blue-300 shadow-lg">
                    الفترة {rowIndex + 1}
                  </div>
                  
                  {Array.from({ length: 7 }).map((_, colIndex) => {
                    const cellTasks = gridData[rowIndex]?.[colIndex] || [];
                    return (
                      <div key={colIndex} className="bg-[#0f172a] hover:bg-[#162032] border border-white/5 hover:border-purple-500/30 rounded-2xl p-2.5 transition-all flex flex-col gap-2 min-h-[100px] shadow-inner group">
                        
                        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] custom-scrollbar pr-1">
                          {cellTasks.map((t: any) => (
                            <div 
                              key={t.id} 
                              onClick={() => openTaskModal(rowIndex, colIndex, t)}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-xl cursor-pointer transition-colors group/task"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[11px] font-bold text-white line-clamp-1">{t.title}</span>
                                {t.time && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">{t.time}</span>}
                              </div>
                              {t.description && <p className="text-[9px] text-gray-500 line-clamp-1">{t.description}</p>}
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => openTaskModal(rowIndex, colIndex)} 
                          className={`w-full py-1.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${cellTasks.length === 0 ? 'border-gray-700 text-gray-500 hover:border-purple-500 hover:text-purple-400' : 'border-transparent bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white mt-auto opacity-0 group-hover:opacity-100'}`}
                        >
                          <Plus size={12} /> إضافة
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1e293b] rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-xl font-black text-white">{editingTaskId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</h3>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">عنوان المهمة <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={taskForm.title} 
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="مثال: دراسة المحاضرة..."
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">الساعة المخصصة (اختياري)</label>
                  <input 
                    type="time" 
                    value={taskForm.time} 
                    onChange={(e) => setTaskForm({...taskForm, time: e.target.value})}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all"
                    dir="ltr"
                    title="وقت المهمة"
                    aria-label="تحديد وقت المهمة"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">التفاصيل وماذا سأفعل (اختياري)</label>
                  <textarea 
                    value={taskForm.description} 
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="مثال: حل الواجب وكتابة ملخص..."
                    rows={3}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button onClick={saveTask} className="flex-1 bg-gradient-to-l from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95">
                    {editingTaskId ? 'حفظ التعديلات' : 'اعتماد وإضافة'}
                  </button>
                  {editingTaskId && activeCell && (
                   <button 
                      onClick={() => deleteTask(activeCell.row, activeCell.col, editingTaskId)} 
                      className="px-4 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
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

function DesktopWalletSection({ user }: any) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("SYRIATEL_CASH");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/public/settings`).then(res => {
      if(res.data) setSettings(res.data);
    }).catch((err) => {
      console.error("خطأ في جلب معلومات الشحن", err);
    });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!amount || !receipt) return toast.error("يرجى إدخال المبلغ وإرفاق صورة الإيصال");
    setLoading(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("transferMethod", method);
    formData.append("receiptImage", receipt);

    try {
      await axios.post(`${API_BASE_URL}/api/users/recharge-request`, formData, { withCredentials: true });
      toast.success("تم إرسال طلب الشحن بنجاح! يرجى انتظار موافقة الإدارة.");
      setAmount(""); setReceipt(null); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل إرسال الطلب");
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#1e293b] rounded-[2rem] border border-white/10 p-8 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center"><Wallet size={24}/></div><div><h2 className="text-2xl font-black text-white">محفظتي</h2><p className="text-xs text-gray-400">إدارة الرصيد وعمليات الشحن</p></div></div>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 relative overflow-hidden shadow-lg mb-8">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <p className="text-emerald-100 font-bold text-sm mb-1 relative z-10">الرصيد الحالي المتاح</p>
              <h1 className="text-4xl font-black text-white relative z-10">{user?.balance?.toLocaleString() || 0} <span className="text-lg font-bold">ل.س</span></h1>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white mb-4">أرقام الدفع المعتمدة بالمنصة</h3>
          <div className="space-y-4">
              
              <div className="bg-[#0f172a] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-bold text-gray-300">سيريتل كاش</span>
                <span className="text-emerald-400 font-bold tracking-widest break-all text-left" dir="ltr">
                  {settings.syriatelCashNumber || "قريباً"}
                </span>
              </div>
              
              <div className="bg-[#0f172a] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-bold text-gray-300">MTN كاش</span>
                <span className="text-yellow-400 font-bold tracking-widest break-all text-left" dir="ltr">
                  {settings.mtnCashNumber || "قريباً"}
                </span>
              </div>
              
              <div className="bg-[#0f172a] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-bold text-gray-300">شام كاش</span>
                <span className="text-purple-400 font-bold tracking-widest break-all text-left" dir="ltr">
                  {settings.chamCashNumber || "قريباً"}
                </span>
              </div>
              
              {settings.haramTransferInfo && (
                <div className="bg-[#0f172a] border border-white/5 p-5 rounded-2xl flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-300 border-b border-white/5 pb-2">شركة الهرم</span>
                  <span className="text-blue-400 text-sm whitespace-pre-wrap leading-relaxed">
                    {settings.haramTransferInfo}
                  </span>
                </div>
              )}

          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-[2rem] border border-white/10 p-8 shadow-xl">
         <h3 className="text-xl font-bold text-white mb-6">طلب شحن جديد</h3>
         <div className="space-y-5">
            <div>
               <label className="text-xs text-gray-400 mb-2 block">طريقة التحويل</label>
               <select 
                  value={method} 
                  onChange={e => setMethod(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 cursor-pointer"
                  title="طريقة التحويل" aria-label="اختر طريقة التحويل"
               >
                  <option value="SYRIATEL_CASH">سيريتل كاش</option>
                  <option value="MTN_CASH">MTN كاش</option>
                  <option value="AL_HARAM">شركة الهرم للحوالات</option>
                  <option value="CHAM_CASH">شام كاش</option>
               </select>
            </div>
            <div>
               <label className="text-xs text-gray-400 mb-2 block">المبلغ المحول (ل.س)</label>
               <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="مثال: 50000" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"/>
            </div>
            <div>
               <label className="text-xs text-gray-400 mb-2 block">صورة إيصال التحويل (مطلوب)</label>
               <input type="file" ref={fileInputRef} onChange={e => setReceipt(e.target.files?.[0] || null)} className="hidden" accept="image/*"/>
               <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-gray-400 hover:text-emerald-400">
                  <UploadCloud size={32} className="mb-2"/>
                  <span className="text-sm font-bold text-center">{receipt ? receipt.name : "اضغط هنا لرفع صورة الإيصال"}</span>
               </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 shadow-lg">
               {loading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/> إرسال طلب الشحن</>}
            </button>
         </div>
      </form>
    </div>
  );
}

function DesktopSettingsSection({ user, setProfileData }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [passData, setPassData] = useState({ oldPass: '', newPass: '' });

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/users/update-profile`, formData, { withCredentials: true });
      toast.success("تم تحديث المعلومات بنجاح!");
      setProfileData({ ...user, ...formData });
    } catch (err) { toast.error("فشل في تحديث المعلومات."); }
    setLoading(false);
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    if (!passData.oldPass || !passData.newPass) return toast.error("يرجى ملء الحقول");
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/users/change-password`, passData, { withCredentials: true });
      toast.success("تم تغيير كلمة المرور بنجاح!");
      setPassData({ oldPass: '', newPass: '' });
    } catch (err) { toast.error("كلمة المرور الحالية غير صحيحة."); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
      <form onSubmit={handleUpdateProfile} className="bg-[#1e293b] rounded-[2rem] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><User size={20}/></div><h3 className="text-lg font-bold text-white">المعلومات الشخصية</h3></div>
        <div className="space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">الاسم الأول</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"/></div>
          <div><label className="text-xs text-gray-400 mb-1 block">الكنية</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"/></div>
          <div><label className="text-xs text-gray-400 mb-1 block">رقم الهاتف</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" dir="ltr"/></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors shadow-lg">حفظ التعديلات</button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="bg-[#1e293b] rounded-[2rem] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><ShieldCheck size={20}/></div><h3 className="text-lg font-bold text-white">الأمان وكلمة المرور</h3></div>
        <div className="space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">كلمة المرور الحالية</label><input type="password" value={passData.oldPass} onChange={e => setPassData({...passData, oldPass: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"/></div>
          <div><label className="text-xs text-gray-400 mb-1 block">كلمة المرور الجديدة</label><input type="password" value={passData.newPass} onChange={e => setPassData({...passData, newPass: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"/></div>
          <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors shadow-lg">تحديث كلمة المرور</button>
        </div>
      </form>
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
  if (inbox.length === 0) return <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center"><MessageCircle size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">صندوق الوارد فارغ، لا يوجد محادثات حالياً</p></div>;

  const selectedParent = inbox.find(p => p.parentId === selectedParentId);
  const selectedContent = selectedParent?.contents.find((c: any) => c.contentId === selectedContentId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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
  if (exams.length === 0) return <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center"><FileCheck size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">لا يوجد لديك امتحانات حالياً لتظهر نتائجها</p></div>;

  const selectedExam = exams.find(e => e.examId === selectedExamId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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
  if (results.length === 0) return <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center"><FileCheck size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">لم تقم بتقديم أي امتحانات نهائية حتى الآن</p></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4">
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
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
            <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center"><CheckSquare size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">لا يوجد لديك تكليفات أو وظائف حالياً</p></div>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
            <div className="bg-[#1e293b] rounded-[2rem] border border-dashed border-white/10 p-12 text-center"><Archive size={48} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-400">الأرشيف فارغ، ابدأ بإضافة أعمالك المميزة</p></div>
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
    <div className="space-y-8 relative animate-in fade-in slide-in-from-bottom-4">
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