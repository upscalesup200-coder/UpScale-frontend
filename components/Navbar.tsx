"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Menu, X, Sparkles, LogOut, ChevronDown, Settings,
  Home, TrendingUp, BookOpen, Gift, Trophy, LayoutDashboard,
  Briefcase, User, ChevronUp, Wrench, Tent 
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ChatNotifications from "@/components/ChatNotifications"; 
import { useRouter, usePathname } from "next/navigation"; 
import { getImageUrl } from "@/utils/imageHelper";
import { API_BASE_URL } from "@/config/api"; 
import Image from "next/image";

export default function Navbar() {
  const { user, logout, loading } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  
  const [platformSettings, setPlatformSettings] = useState({ platformName: "Up Scale", logoUrl: "" });

  const router = useRouter(); 
  const pathname = usePathname(); 
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    logout();
    setIsProfileOpen(false);
    setIsOpen(false);
    router.push('/login');
  };

// ✅ مراقبة التنقل من صفحات أخرى إلى أقسام الصفحة الرئيسية
  useEffect(() => {
    if (pathname === "/") {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.replace("#", "");
        // زدنا المهلة لـ 500 جزء من الثانية لضمان رندرة عناصر الصفحة بعد الـ Fetch
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const yOffset = -100; // مسافة تعويضية لحجم النافبار
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 500); 
      }
    }
  }, [pathname]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          let cleanName = data.platformName || "Up Scale";
          cleanName = cleanName.replace(/Training Hub/gi, "").trim();

          setPlatformSettings({
            platformName: cleanName,
            logoUrl: data.logoUrl ? (getImageUrl(data.logoUrl, 'settings', 400) || "") : ""
          });
        }
      })
      .catch(() => console.error("Failed to load navbar settings"));
  }, []);

  const getUserInitial = () => user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";
  const getUserFullName = () => user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || "مستخدم";

  const navLinks = [
    { name: "الرئيسية", href: "/", icon: Home, color: "text-purple-400", gradient: "from-purple-500/20 to-transparent" },
    { name: "الأكثر طلباً", href: "/#popular", icon: TrendingUp, color: "text-orange-400", gradient: "from-orange-500/20 to-transparent" },
    { name: "المواد", href: "/#courses", icon: BookOpen, color: "text-blue-400", gradient: "from-blue-500/20 to-transparent" },
    { name: "الورشات", href: "/#workshops", icon: Wrench, color: "text-emerald-400", gradient: "from-emerald-500/20 to-transparent" },
    { name: "المعسكرات", href: "/#camps", icon: Tent, color: "text-pink-400", gradient: "from-pink-500/20 to-transparent" },
    { name: "المجاني", href: "/#free", icon: Gift, color: "text-yellow-400", gradient: "from-yellow-400/20 to-transparent" },
    { name: "لوحة الشرف", href: "/leaderboard", icon: Trophy, color: "text-amber-500", gradient: "from-amber-500/20 to-transparent" },
  ];

  const isHiddenPage = pathname?.includes('/quiz/') || pathname?.includes('/exam/') || pathname?.includes('/discussion/');
  if (isHiddenPage) return null;

  const menuContainerVariants: Variants = {
    hidden: { opacity: 0, x: "100%" },
    show: { opacity: 1, x: 0, transition: { type: "spring", damping: 25, stiffness: 200, staggerChildren: 0.05, delayChildren: 0.1 } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } }
  };

  const menuItemVariants: Variants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300 } }
  };

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isOpen) setIsOpen(false);

    const isHomePage = pathname === "/";
    const isHashLink = href.startsWith("/#");

    if (isHomePage) {
      if (href === "/") {
        e.preventDefault();
        window.history.pushState(null, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (isHashLink) {
        e.preventDefault(); // إيقاف سلوك Next.js الافتراضي اللي بيخرب التمرير
        
        const targetId = href.replace("/#", "");
        const element = document.getElementById(targetId);
        
        if (element) {
          // تحديث الرابط في المتصفح لتتمكن من نسخه ومشاركته
          window.history.pushState(null, "", href);
          
          const yOffset = -100; // مسافة تعويضية لحجم النافبار
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes border-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-border-wave {
          background-size: 200% auto;
          animation: border-wave 4s linear infinite;
        }
      `}</style>

      <AnimatePresence>
        {isNavHidden && pathname !== "/" && (
          <motion.button
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsNavHidden(false)}
            title="إظهار شريط التنقل"
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[70] p-[2px] rounded-b-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-border-wave shadow-[0_10px_40px_rgba(168,85,247,0.4)] group cursor-pointer"
          >
            <div className="bg-[#0f172a]/95 backdrop-blur-xl px-6 py-2 rounded-b-2xl flex items-center gap-2">
              <ChevronDown size={20} className="text-purple-400 group-hover:translate-y-1 group-hover:text-white transition-all" />
              <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors hidden sm:block">إظهار القائمة</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isNavHidden ? -150 : 0, opacity: isNavHidden ? 0 : 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-[60] flex justify-center transition-all duration-500 pt-4 ${isNavHidden ? "pointer-events-none" : ""}`}
      >
        <div className={`relative transition-all duration-700 ease-out w-fit max-w-[98%] xl:max-w-[90%] rounded-full p-[1px]`}>
          
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-border-wave transition-opacity duration-700 opacity-100`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>

          <div className="relative px-4 md:px-6 py-2.5 rounded-full bg-[#070b14]/80 backdrop-blur-2xl shadow-2xl">
            
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <div className="absolute top-1/2 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse"></div>
              <div className="absolute top-1/2 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative flex justify-between items-center z-10 gap-4">
              
              <Link href="/" onClick={(e) => handleNavClick(e, "/")} className="flex items-center gap-3 group min-w-fit">
                <div className="w-12 h-12 flex items-center justify-center group-hover:rotate-[360deg] transition-all duration-700 relative shrink-0">
                  {platformSettings.logoUrl ? (
                    <Image 
                      unoptimized
                      src={platformSettings.logoUrl} 
                      alt="Logo" 
                      fill
                      sizes="48px"
                      className="object-contain relative z-10 drop-shadow-md" 
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-indigo-400 relative z-10 animate-pulse" />
                  )}
                </div>
                <span className="text-xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300 hidden sm:block drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] max-w-[120px] lg:max-w-[180px] truncate whitespace-nowrap">
                  {platformSettings.platformName}
                </span>
              </Link>

              <div className="hidden xl:flex items-center gap-1 bg-black/40 p-1.5 rounded-full border border-white/5 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] transition-all duration-500">
                {navLinks.map((link, index) => {
                  const isHovered = hoveredIndex === index;

                  return (
                    <div key={link.name} className="relative" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className={`relative rounded-full transition-all duration-300 group flex items-center justify-center w-11 h-11`}
                      >
                        {isHovered && (
                          <motion.div
                            layoutId="nav-hover-bg"
                            className={`absolute inset-0 rounded-full bg-gradient-to-b ${link.gradient} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} 
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-center transition-all duration-300">
                          <link.icon size={20} className={`shrink-0 ${link.color} transition-transform duration-300 drop-shadow-md ${isHovered ? 'scale-110' : ''}`} />
                        </div>
                      </Link>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl text-xs font-bold text-white whitespace-nowrap z-[100] pointer-events-none"
                          >
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f172a] border-t border-r border-white/10 rotate-45"></div>
                            {link.name}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full animate-pulse"></div>
                    <div className="w-32 h-10 bg-white/5 border border-white/10 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    {user && (
                      <>
                        {pathname !== "/" && (
                          <button
                            onClick={() => setIsNavHidden(true)} title="طي شريط التنقل"
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 ml-1"
                          >
                            <ChevronUp size={16} />
                          </button>
                        )}

                        <div className="flex items-center gap-1 mx-1 bg-black/30 p-1 rounded-full border border-white/5 shadow-inner shrink-0"> 
                           <div className="hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 p-1.5 rounded-full transition-all cursor-pointer"><ChatNotifications /></div> 
                           <div className="hover:bg-blue-500/20 text-gray-300 hover:text-blue-300 p-1.5 rounded-full transition-all cursor-pointer"><NotificationBell /></div>  
                        </div>
                        
                        <div className="hidden md:flex items-center gap-3 shrink-0">
                            {user.role === "ADMIN" && (
                              <Link href="/admin/dashboard" className={`hidden lg:flex items-center justify-center bg-red-500/10 text-red-400 rounded-full border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 p-2.5`} title="الإدارة">
                                <LayoutDashboard size={20} />
                              </Link>
                            )}
                            {user.role === "TEACHER" && (
                              <Link href="/instructor/dashboard" className={`hidden lg:flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 p-2.5`} title="لوحة المدرس">
                                <Briefcase size={20} />
                              </Link>
                            )}
                        </div>
                      </>
                    )}

                    {user ? (
                      <div className="relative hidden md:block shrink-0" ref={profileMenuRef}> 
                        <button 
                          onClick={() => setIsProfileOpen(prev => !prev)} 
                          aria-label="خيارات الحساب" title="خيارات الحساب" 
                          className={`flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 group relative z-50 p-1 rounded-full`}
                        >
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden border-2 border-transparent group-hover:border-white/50 transition-all transform group-hover:scale-105 pointer-events-none`}>
                            {user.avatar && !imageError ? (
                              <img src={getImageUrl(user.avatar, 'avatar') || ""} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)}/>
                            ) : (
                              <span className="text-white font-bold text-sm drop-shadow-md">{getUserInitial()}</span>
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isProfileOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(5px)" }}
                              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                              className="absolute left-0 mt-4 w-72 bg-[#070b14]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100] ring-1 ring-white/5"
                            >
                              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-border-wave"></div>
                              
                              <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent text-center flex flex-col items-center relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(124,58,237,0.4)] overflow-hidden border-4 border-white/10 relative z-10">
                                  {user.avatar && !imageError ? (
                                    <img src={getImageUrl(user.avatar, 'avatar') || ""} alt="Profile Large" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                                  ) : (
                                    <span className="text-3xl font-black text-white">{getUserInitial()}</span>
                                  )}
                                </div>
                                <h3 className="text-white font-bold text-lg relative z-10">{getUserFullName()}</h3>
                                <p className="text-xs text-gray-400 mt-1 truncate w-full px-2 relative z-10">{user.email}</p>
                                <span className="mt-3 text-[10px] text-purple-300 font-bold uppercase tracking-widest border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 rounded-full relative z-10 shadow-inner">{user.role}</span>
                              </div>
                              
                              <div className="p-3 grid gap-2">
                                <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-300 hover:bg-white/10 hover:text-white hover:pl-6 transition-all duration-300 text-right group relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-700"></div>
                                  <Settings size={18} className="text-gray-400 group-hover:text-white transition-colors group-hover:rotate-90 duration-500" />
                                  <span className="font-bold relative z-10">الملف الشخصي</span>
                                </Link>
                                
                                {user.role === "TEACHER" && (
                                   <Link href="/instructor/dashboard" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-blue-400 hover:bg-blue-500/10 hover:pr-6 transition-all duration-300 text-right group">
                                     <Briefcase size={18} className="group-hover:scale-125 group-hover:text-blue-300 transition-transform" />
                                     <span className="font-bold">لوحة المدرس</span>
                                   </Link>
                                )}

                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:pr-6 transition-all duration-300 text-right mt-1 group">
                                  <LogOut size={18} className="group-hover:-translate-x-2 transition-transform duration-300" />
                                  <span className="font-bold">تسجيل الخروج</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link href="/login" className="hidden md:block shrink-0">
                        <button className={`relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all duration-300 hover:scale-[1.05] active:scale-95 group border border-purple-400/50 p-2`} title="تسجيل الدخول">
                          <span className="relative z-10 flex items-center justify-center w-6 h-6">
                            <User size={20} className="group-hover:animate-bounce"/>
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                      </Link>
                    )}
                  </>
                )}

                <button 
                  className="p-3 text-white xl:hidden relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 group shrink-0" 
                  onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
                  title={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.4, type: "spring" }} className="relative z-10">
                    {isOpen ? <X size={24} className="text-pink-400" /> : <Menu size={24} className="text-purple-300" />}
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }} 
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-[#070b14]/80 z-[50] xl:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              variants={menuContainerVariants} initial="hidden" animate="show" exit="exit"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#070b14]/95 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-[60] xl:hidden overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-border-wave shrink-0"></div>

              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent shrink-0">
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">القائمة</span>
                <button onClick={() => setIsOpen(false)} title="إغلاق" aria-label="إغلاق" className="p-2.5 bg-white/5 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 transition-all duration-300">
                  <X size={22}/>
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-6">
                <motion.div variants={menuItemVariants}>
                  {loading ? (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-white/10"></div>
                        <div className="space-y-2 flex-1"><div className="h-4 bg-white/10 rounded w-1/2"></div><div className="h-3 bg-white/10 rounded w-1/3"></div></div>
                    </div>
                  ) : user ? (
                      <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-500/30 shadow-[0_10px_30px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/20 shrink-0 relative z-10 group-hover:scale-105 transition-transform">
                            {user.avatar && !imageError ? (
                              <img src={getImageUrl(user.avatar, 'avatar') || ""} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                            ) : (
                              <span className="text-white font-black text-2xl drop-shadow-md">{getUserInitial()}</span>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden relative z-10">
                              <p className="font-black text-white text-lg truncate drop-shadow-sm">{getUserFullName()}</p>
                              <p className="text-xs text-indigo-300 truncate mt-0.5">{user.email}</p>
                              <span className="inline-block mt-2 text-[9px] bg-white/10 text-white px-2 py-1 rounded-md font-bold tracking-wider">{user.role}</span>
                          </div>
                      </div>
                  ) : null}
                </motion.div>

                <div className="grid gap-3">
                  
                  {!loading && user && (
                    <motion.div variants={menuItemVariants}>
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                        <User size={24} className="text-purple-400 group-hover:scale-110 transition-transform relative z-10" />
                        <span className="font-black text-white text-lg relative z-10">الملف الشخصي</span>
                      </Link>
                    </motion.div>
                  )}

                  {!loading && user?.role === "ADMIN" && (
                    <motion.div variants={menuItemVariants}>
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 shadow-[0_5px_15px_rgba(239,68,68,0.1)] transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        <LayoutDashboard size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                        <span className="font-black text-lg relative z-10">الإدارة العامة</span>
                      </Link>
                    </motion.div>
                  )}

                  {!loading && user?.role === "TEACHER" && (
                    <motion.div variants={menuItemVariants}>
                      <Link href="/instructor/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 shadow-[0_5px_15px_rgba(59,130,246,0.1)] transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        <Briefcase size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                        <span className="font-black text-lg relative z-10">لوحة المدرس</span>
                      </Link>
                    </motion.div>
                  )}

                  <div className="bg-white/5 rounded-3xl p-3 border border-white/5 shadow-inner">
                    {navLinks.map((link) => (
                      <motion.div variants={menuItemVariants} key={link.name}>
                        <Link
                          href={link.href} 
                          onClick={(e) => handleNavClick(e, link.href)}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all group relative overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-0 duration-500"></div>
                          <div className={`p-2.5 rounded-xl bg-white/5 ${link.color} group-hover:scale-125 group-hover:shadow-[0_0_15px_currentColor] transition-all duration-300 relative z-10`}>
                            <link.icon size={22} />
                          </div>
                          <span className="font-bold text-base text-gray-300 group-hover:text-white transition-colors relative z-10">{link.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div variants={menuItemVariants} className="p-6 border-t border-white/10 bg-gradient-to-t from-[#070b14] to-transparent shrink-0">
                  {loading ? (
                     <div className="h-14 rounded-2xl bg-white/5 animate-pulse w-full"></div>
                  ) : !user ? (
                     <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center font-black shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-95 transition-all text-lg border border-purple-400/50">
                        تسجيل الدخول <User size={22} className="animate-bounce"/>
                     </Link>
                  ) : (
                     <button onClick={handleLogout} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all group w-full font-black text-lg border border-red-500/30 active:scale-95 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                         <LogOut size={24} className="group-hover:-translate-x-2 transition-transform duration-300 relative z-10" />
                         <span className="relative z-10">تسجيل الخروج</span>
                     </button>
                  )}
              </motion.div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}