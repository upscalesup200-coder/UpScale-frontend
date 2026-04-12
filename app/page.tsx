"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext"; 
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image"; 
import { 
  ArrowLeft, PlayCircle, BookOpen, Layers, MonitorPlay, 
  Zap, User, Wrench, Star, Activity,
  Code2, BrainCircuit, Palette, GraduationCap, Laptop2,
  Gift, Sparkles, Users, ShieldCheck, 
  Trophy, Rocket, Award,
  Search, ChevronDown, Github, Linkedin,
  Briefcase, Loader2, ArrowDownCircle, X, Megaphone, Calendar, ArrowUp,
  ChevronRight, ChevronLeft // 🌟 تمت إضافة الأيقونات الخاصة بالأسهم
} from "lucide-react";
import Background from "@/components/Background";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";

const FALLBACK_IMAGE = "https://placehold.co/800x500/0f172a/white.png?text=UpScale";

// ==========================================
// ✨ فواصل وتأثيرات بصرية متقدمة ✨
// ==========================================

const AnimatedBeamSeparator = ({ colorFrom = "from-blue-500", colorTo = "to-indigo-500" }: { colorFrom?: string, colorTo?: string }) => (
  <div className="relative w-full h-[1px] bg-white/[0.03] overflow-hidden z-20 flex items-center justify-center">
    <div className={`absolute w-1/3 h-[1px] bg-gradient-to-r transparent via-white/10 to-transparent`} />
    {/* تم إخفاء الحركة اللانهائية على الموبايل لتخفيف الضغط */}
    <motion.div 
      className={`hidden md:block absolute top-0 bottom-0 w-64 md:w-96 bg-gradient-to-r from-transparent ${colorFrom.replace('from-', 'via-')} to-transparent opacity-60`}
      animate={{ x: ["-300%", "300%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const GlowingLine = ({ color = "from-blue-500" }: { color?: string }) => (
  <div className="relative w-full h-px flex items-center justify-center -my-px z-20 opacity-70">
    <div className={`absolute w-3/4 max-w-3xl h-px bg-gradient-to-r transparent via-white/20 to-transparent ${color.replace('from-', 'via-')}`} />
    <div className={`absolute w-1/4 max-w-sm h-[2px] bg-gradient-to-r from-transparent ${color} to-transparent blur-[2px]`} />
  </div>
);

const CurveSeparator = ({ topColor = "#0f172a", bottomColor = "#060a14" }: { topColor?: string, bottomColor?: string }) => (
  <div className="w-full overflow-hidden leading-none z-20 relative -mt-[1px]">
    <svg className="relative block w-full h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill={bottomColor}></path>
      <path d="M0,0V27.35A600.21,600.21,0,0,0,321.39,56.44c58,10.79,114.16-8.13,172-19.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,53,906.67,94,985.66,114.83c70.05,18.48,146.53,26.09,214.34,4.97V0Z" fill={topColor}></path>
    </svg>
  </div>
);

const BadgeSeparator = ({ icon: Icon, text, color = "text-blue-400", glow = "shadow-blue-500/20" }: { icon: any, text: string, color?: string, glow?: string }) => (
  <div className="relative w-full flex items-center justify-center z-30 -my-6 pointer-events-none">
    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      whileInView={{ opacity: 1, scale: 1 }} 
      viewport={{ once: true, margin: "-50px" }}
      className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#060a14]/95 md:bg-[#060a14]/90 backdrop-blur-sm md:backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.8)] md:shadow-[0_0_30px_rgba(0,0,0,0.8)] ${glow}`}
    >
      <div className="absolute inset-0 rounded-full bg-white/[0.02] hidden md:block animate-pulse" />
      <Icon size={16} className={`relative z-10 ${color}`} />
      <span className="relative z-10 text-xs font-black text-gray-200 tracking-widest uppercase">{text}</span>
    </motion.div>
  </div>
);

// ==========================================
// 🧩 مكونات البطاقات والتقييم
// ==========================================

const ReadOnlyRating = ({ averageRating = 0, reviewsCount = 0 }: { averageRating?: number, reviewsCount?: number }) => {
  const displayValue = Math.round(averageRating);
  return (
    <div className="flex items-center gap-2 mt-1 mb-2">
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star: number) => (
          <div key={`star-${star}`}>
            <Star size={13} className={star <= displayValue ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-gray-700/50"} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-2 mr-1">
        <span className="text-[11px] font-black text-white">{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</span>
        <span className="text-[10px] text-gray-400">({reviewsCount})</span>
      </div>
    </div>
  );
};

const SectionCard = ({ title, desc, icon: Icon, color, borderColor }: { title: string, desc: string, icon: any, color: string, borderColor: string }) => (
  // تم تخفيف البلور والظلال على الموبايل
  <motion.div whileHover={{ y: -5 }} className={`p-8 rounded-[2rem] bg-[#0f172a] md:bg-white/[0.02] border ${borderColor} hover:bg-[#1e293b] md:hover:bg-white/[0.04] transition-all duration-500 group cursor-pointer md:backdrop-blur-md shadow-lg md:shadow-xl hover:shadow-2xl relative overflow-hidden`}>
    <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 md:group-hover:scale-110 transition-transform duration-500 shadow-inner relative z-10`}>
      <Icon className="text-white w-7 h-7" />
    </div>
    <h3 className="text-xl font-black text-white mb-3 relative z-10">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed relative z-10">{desc}</p>
  </motion.div>
);

const CourseCard = ({ image, title, delay }: { image: string, title: string, delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="group relative h-[320px] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-xl md:shadow-2xl bg-[#0f172a] flex flex-col md:hover:border-blue-500/40 md:hover:-translate-y-2 transition-all duration-500">
    <div className="absolute inset-0 z-0 h-[65%]">
      <Image unoptimized
        src={image || FALLBACK_IMAGE} 
        alt={title} 
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 md:group-hover:scale-110 opacity-90" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
    </div>
    
    <div className="relative z-10 flex flex-col justify-end h-full p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full bg-blue-500/20 md:backdrop-blur-md text-[10px] font-black text-blue-300 border border-blue-500/30 flex items-center gap-1.5 uppercase tracking-wider shadow-sm md:shadow-lg">
          <BookOpen size={12} /> أكاديمي
        </span>
      </div>
      <h3 className="text-2xl font-black text-white mb-2 md:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">{title}</h3>
      <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">امتحانات شاملة - ملخصات مركزة - كويزات تفاعلية ومهام عملية.</p>
    </div>
  </motion.div>
);

const FreeContentCard = ({ item }: { item: any }) => (
  <Link href={`/free-content/${item.id}`} className="block h-full relative group perspective-1000">
    <div className="hidden md:block absolute -inset-0.5 bg-gradient-to-b from-amber-500/0 via-amber-500/10 to-orange-600/30 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-700" />
    
    <div className="relative h-full bg-[#0f172a] md:bg-[#060a14]/80 md:backdrop-blur-2xl border border-white/10 md:group-hover:border-amber-500/40 rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col shadow-xl md:shadow-2xl transform md:group-hover:-translate-y-2">
        <div className="w-full aspect-[16/10] relative overflow-hidden bg-slate-900 p-1.5">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                <Image unoptimized 
                  src={getImageUrl(item.imageUrl, 'course', 600) || FALLBACK_IMAGE} 
                  alt={item.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-transparent opacity-90" />
                
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-md md:shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-1.5 z-10">
                   <Sparkles size={12} fill="currentColor" /> مجاناً
                </div>
                
                <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 opacity-80" />
                        <PlayCircle size={32} className="relative z-10 fill-white text-orange-500 ml-1" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow relative z-10">
            <h3 className="text-lg font-black text-white mb-1.5 leading-snug md:group-hover:text-amber-400 transition-colors line-clamp-2 drop-shadow-sm">{item.title}</h3>
            <ReadOnlyRating averageRating={item.averageRating || 0} reviewsCount={item.reviewsCount || 0} />
            <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                        <User size={16} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{item.instructorName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    <PlayCircle size={14} /> {item.sessionsCount} درس
                </div>
            </div>
        </div>
    </div>
  </Link>
);

const FloatingIcon = ({ icon: Icon, delay, x, y, color }: { icon: any, delay: number, x: string, y: string, color: string }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5, y: [0, -25, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 6, delay: delay, repeat: Infinity, ease: "easeInOut" }} className={`absolute ${x} ${y} hidden lg:flex w-24 h-24 rounded-[2rem] ${color} backdrop-blur-xl border border-white/10 items-center justify-center shadow-2xl z-0`}>
    <Icon className="w-12 h-12 text-white/90 drop-shadow-lg" />
  </motion.div>
);

const SkeletonCard = () => (
  <div className="w-full h-[380px] bg-white/[0.02] rounded-[2rem] border border-white/5 animate-pulse overflow-hidden flex flex-col">
    <div className="h-44 bg-white/[0.05] w-full shrink-0" />
    <div className="p-5 flex flex-col gap-4 flex-grow">
      <div className="h-5 bg-white/[0.05] rounded-full w-3/4 mb-1" />
      <div className="h-3 bg-white/[0.05] rounded-full w-1/3 mb-3" />
      <div className="h-2 bg-white/[0.05] rounded-full w-full" />
      <div className="h-2 bg-white/[0.05] rounded-full w-5/6" />
      <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
         <div className="h-4 bg-white/[0.05] rounded-full w-1/4" />
         <div className="h-4 bg-white/[0.05] rounded-full w-1/4" />
      </div>
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-3xl bg-[#0f172a] md:bg-white/[0.02] md:backdrop-blur-xl mb-4 overflow-hidden transition-all duration-500 md:hover:border-blue-500/30 md:hover:bg-white/[0.04]">
      <button type="button" aria-expanded={isOpen} aria-label={question} onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 md:p-8 text-right text-white font-bold hover:text-blue-400 transition-colors focus:outline-none">
        <span className="text-lg">{question}</span>
        <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-500 shadow-inner ${isOpen ? "rotate-180 bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}`}><ChevronDown size={20} /></div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div key="faq-answer-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 md:px-8 text-slate-300 text-sm leading-relaxed font-medium">
            <p className="pb-8 pt-2 border-t border-white/5">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 🚀 المكون الرئيسي (Main Component)
// ==========================================

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // 🌟 متتبع حاوية الكروت الخاصة بمتابعة التعلم
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🌟 دالة التمرير (يمين ويسار)
  const scroll = (direction: 'right' | 'left') => {
    if (scrollRef.current) {
      const scrollAmount = 350; 
      // حسب الاتجاه، نضيف التمرير
      if (direction === 'right') {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const [platformSettings, setPlatformSettings] = useState({
    platformName: "Up Scale Training Hub",
    logoUrl: "",
    footerLogoUrl: "",
    course1Url: "https://placehold.co/800x500/0f172a/white.png?text=Course+1",
    course2Url: "https://placehold.co/800x500/0f172a/white.png?text=Course+2",
    course3Url: "https://placehold.co/800x500/0f172a/white.png?text=Course+3",
    course4Url: "https://placehold.co/800x500/0f172a/white.png?text=Course+4",
    workshopUrl: "https://placehold.co/800x500/0f172a/white.png?text=Workshops",
    certificateUrl: "https://placehold.co/800x500/0f172a/white.png?text=Certificate",
  });

  const [freeContent, setFreeContent] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  
  const [newsList, setNewsList] = useState<any[]>([]); 
  const [isLoadingNews, setIsLoadingNews] = useState(true); 
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const [instructorsList, setInstructorsList] = useState<any[]>([]); 
  
  const [platformStats, setPlatformStats] = useState({ users: 0, courses: 0, workshops: 0, bootcamps: 0 });

  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSearchResults, setLiveSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPlatformSettings({
            platformName: data.platformName || "Up Scale Training Hub",
            logoUrl: data.logoUrl ? (getImageUrl(data.logoUrl, 'settings', 400) || "") : "",
            footerLogoUrl: data.footerLogoUrl ? (getImageUrl(data.footerLogoUrl, 'settings', 400) || "") : "",
            course1Url: data.course1Url ? (getImageUrl(data.course1Url, 'course', 800) || "") : "",
            course2Url: data.course2Url ? (getImageUrl(data.course2Url, 'course', 800) || "") : "",
            course3Url: data.course3Url ? (getImageUrl(data.course3Url, 'course', 800) || "") : "",
            course4Url: data.course4Url ? (getImageUrl(data.course4Url, 'course', 800) || "") : "",
            workshopUrl: data.workshopUrl ? (getImageUrl(data.workshopUrl, 'course', 1000) || "") : "",
            certificateUrl: data.certificateUrl ? (getImageUrl(data.certificateUrl, 'course', 1000) || "") : "",
          });
        }
      })
      .catch(() => console.error("Failed to load platform settings"));

    const cachedNews = localStorage.getItem('upscale_news');
    if (cachedNews) {
      try {
        setNewsList(JSON.parse(cachedNews));
        setIsLoadingNews(false); 
      } catch (e) {}
    }

    fetch(API_ROUTES.NEWS)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setNewsList(arr);
        localStorage.setItem('upscale_news', JSON.stringify(arr));
        setIsLoadingNews(false);
      })
      .catch(() => setIsLoadingNews(false));

    fetch(API_ROUTES.FREE_CONTENT).then(res => res.json()).then(data => setFreeContent(Array.isArray(data) ? data.slice(0, 8) : [])).catch(() => {});
    fetch(API_ROUTES.FEATURED).then(res => res.json()).then(data => setFeatured(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setIsLoadingFeatured(false));
    
    fetch(`${API_BASE_URL}/api/public/stats`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setPlatformStats(data); })
        .catch(() => {});

    fetch(`${API_BASE_URL}/api/users/elite-instructors/public`).then(res => res.json()).then(data => setInstructorsList(Array.isArray(data) ? data : [])).catch(() => {});
    
// ✅ التعديل هنا: نتحقق من وجود المستخدم المسجل بدلاً من التوكن اليدوي
if (user) {
    setIsLoggedIn(true);
    
    // جلب التقدم الدراسي باستخدام الكوكيز
    fetch(API_ROUTES.MY_PROGRESS, { 
      credentials: "include" // ✅ إضافة الكوكيز
    })
    .then(res => res.text())
    .then(text => setUserProgress(text ? JSON.parse(text) : []))
    .catch(() => {}); 

    // جلب الاشتراكات باستخدام الكوكيز
    const enrollmentsUrl = (API_ROUTES as any).MY_ENROLLMENTS || `${API_BASE_URL}/api/users/enrollments`;
    fetch(enrollmentsUrl, { 
      credentials: "include" // ✅ إضافة الكوكيز
    })
    .then(res => res.text())
    .then(text => setMyEnrollments(text ? JSON.parse(text) : []))
    .catch(() => {}); 
}
  }, [user]);

  // ✅ تم إصلاح مشكلة التمرير بإضافة Throttle و passive:true 
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setShowBackToTop(window.scrollY > 500);
        timeoutId = null;
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = featured.filter((item: any) => {
        const data = item.course || item.workshop || item.bootcamp;
        if (!data) return false;
        return data.title?.toLowerCase().includes(lowerQuery) || data.description?.toLowerCase().includes(lowerQuery);
      }).slice(0, 5); 
      setLiveSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchQuery, featured]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); 
    }
  };

  const formatDateAr = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const faqs = [
    { q: "ما هو نظام الـ XP وكيف أستفيد منه؟", a: "هو نظام تنافسي يمنحك نقاطاً (XP) عند إكمال الفيديوهات، حل الكويزات، والتفاعل في المنتديات. يمكنك استبدالها لاحقاً بخصومات." },
    { q: "هل الكورسات مسجلة أم بث مباشر؟", a: "المواد الأكاديمية مسجلة لتشاهدها بالوقت الذي يناسبك، أما المعسكرات والورشات فتتضمن لقاءات تفاعلية مباشرة (Live) أسبوعياً مع المدرب." },
    { q: "عند التسجيل في المحتوى هل يبقى المحتوى بشكل دائم في الحساب ؟ ", a: "لا عند الحصول على اي محتوى سواء كان كورس او ورشة او معسكر يتم اضافته الى حسابك بشكل مؤقت لمدة 4 اشهر فقط (للمواد ) وشهرين (للمعسكرات ) و7 اشهر (للورشات ) بعدها يتم الغاء الاشتراك في المحتوى بلشكل تلقائي." },
    { q: "هل الشهادة هي شهادة معتمدة ؟", a: "في الوقت الحالي الشهادة غير معتمدة هي فقط شهادة اتمام محتوى لحضور ورشة او معسكر ولكن نحن نعمل لنحصل على الاعتماد الداخلي والخارجي." },
  ];
  
  return (
    <main className="min-h-screen bg-[#060a14] text-white selection:bg-blue-500/30 font-sans relative overflow-x-hidden">
      
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#0f172a', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="fixed inset-0 z-0 opacity-[0.1] pointer-events-none mix-blend-screen hidden md:block"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#060a14] via-[#0a0f1c]/95 to-[#060a14] pointer-events-none" />

      <div className="relative z-10"> 
        <Background />

        {/* ======================= 1. قسم البطل (Hero) ======================= */}
        <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
          
          <FloatingIcon icon={Code2} delay={0} x="right-[10%]" y="top-[20%]" color="bg-blue-600/10" />
          <FloatingIcon icon={BrainCircuit} delay={2} x="right-[5%]" y="bottom-[30%]" color="bg-purple-600/10" />
          <FloatingIcon icon={Palette} delay={1} x="left-[10%]" y="top-[25%]" color="bg-pink-600/10" />
          <FloatingIcon icon={GraduationCap} delay={3} x="left-[5%]" y="bottom-[25%]" color="bg-emerald-600/10" />
          <FloatingIcon icon={Laptop2} delay={1.5} x="left-[20%]" y="bottom-[10%]" color="bg-orange-600/10" />

          {/* تم إخفاء الـ Blur الثقيل على الموبايل */}
          <div className="hidden md:block absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
          <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10 animate-pulse delay-1000 pointer-events-none" />

          <div className="z-10 text-center px-4 max-w-5xl mx-auto w-full mt-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }}>
              
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0f172a] md:bg-white/[0.03] border border-white/10 md:backdrop-blur-xl mb-10 shadow-lg md:shadow-2xl">
                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 md:drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                <span className="text-sm font-bold text-gray-200 uppercase tracking-widest">المنصة الأسرع للتعلم في 2026</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight leading-tight drop-shadow-sm">
                اصنع مستقبلك <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  بكل احترافية
                </span>
              </h1>
              
              <p className="text-lg md:text-2xl text-slate-400 mb-14 max-w-3xl mx-auto font-medium leading-relaxed">
                منصة {platformSettings.platformName} تقدم لك تجربة تعليمية متكاملة تجمع بين القوة الأكاديمية ومتطلبات سوق العمل الحقيقية.
              </p>

              {/* شريط البحث */}
              <div className="relative max-w-2xl mx-auto mb-14 z-50">
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
                    <Search size={22} />
                  </div>
                  <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.trim().length >= 2) setShowSearchDropdown(true); }}
                    placeholder="ابحث عن مادة أكاديمية، ورشة، أو معسكر..." 
                    className="w-full bg-[#0f172a] md:bg-[#0f172a]/60 border border-white/10 text-white text-base md:text-lg rounded-full py-4 md:py-5 pr-12 md:pr-14 pl-28 md:pl-36 focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 md:backdrop-blur-2xl transition-all shadow-lg md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] placeholder-gray-500"
                  />
                  <button type="submit" className="absolute inset-y-1.5 md:inset-y-2 left-1.5 md:left-2 px-6 md:px-8 bg-white text-[#060a14] hover:bg-gray-200 font-black rounded-full transition-all shadow-md md:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    بحث
                  </button>
                </form>

                <AnimatePresence>
                  {showSearchDropdown && liveSearchResults.length > 0 && (
                    <motion.div 
                      key="search-dropdown-box" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-4 bg-[#0f172a] md:bg-[#0f172a]/95 md:backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl shadow-xl md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col divide-y divide-white/5 z-50 text-right"
                    >
                      {liveSearchResults.map((item: any, idx: number) => {
                        const data = item.course || item.workshop || item.bootcamp;
                        let link = "/", badge = "", color = "";
                        if (item.course) { link = `/courses/${data?.id}`; badge = "مادة أكاديمية"; color = "text-blue-400 bg-blue-400/10"; }
                        else if (item.workshop) { link = `/workshops/${data?.id}`; badge = "ورشة عمل"; color = "text-emerald-400 bg-emerald-400/10"; }
                        else if (item.bootcamp) { link = `/bootcamps/${data?.id}`; badge = "معسكر"; color = "text-pink-400 bg-pink-400/10"; }

                        return (
                          <Link href={link} key={`search-res-${item.id || idx}`} onClick={() => setShowSearchDropdown(false)}>
                            <div className="flex items-center gap-4 md:gap-5 p-4 md:p-5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-inner relative">
                                <Image unoptimized 
                                  src={getImageUrl(data?.imageUrl, 'course', 100) || FALLBACK_IMAGE} 
                                  alt={data?.title || "Search Result"} 
                                  fill
                                  sizes="64px"
                                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                              </div>
                              <div className="text-right flex-1">
                                <h4 className="text-white font-black text-sm md:text-lg group-hover:text-blue-400 transition-colors line-clamp-1">{data?.title}</h4>
                                <span className={`inline-block mt-1.5 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black border border-white/5 ${color}`}>{badge}</span>
                              </div>
                              <ArrowLeft className="text-gray-600 group-hover:text-white transition-colors shrink-0 mr-2 md:mr-4" size={20} />
                            </div>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* شعار المنصة */}
              {platformSettings.logoUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                  className="flex justify-center items-center mb-8 relative z-10 pointer-events-none"
                >
                  <div className="relative w-40 h-40 md:w-64 md:h-64 p-4 md:p-6 bg-[#0f172a] md:bg-white/[0.02] md:backdrop-blur-md rounded-full border border-white/5 shadow-lg md:shadow-[0_0_50px_rgba(255,255,255,0.03)] flex items-center justify-center">
                    <div className="hidden md:block absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                    <Image unoptimized 
                      src={platformSettings.logoUrl} 
                      alt={platformSettings.platformName} 
                      fill
                      priority 
                      sizes="(max-width: 768px) 160px, 256px"
                      className="object-contain p-6 drop-shadow-md md:drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative z-10" 
                    />
                  </div>
                </motion.div>
              )}

              {/* 🌟 أزرار "من نحن" و "طلاب الافتراضية" */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12 relative z-10"
              >
               <Link 
                 href="/about"
                 className="w-full md:w-auto group relative px-6 py-3 bg-[#0f172a] md:bg-[#0f172a]/50 md:backdrop-blur-xl border border-white/10 hover:border-blue-500/50 rounded-full font-bold text-gray-300 hover:text-white transition-all duration-500 shadow-lg flex items-center justify-center gap-3 overflow-hidden"
               >
                 <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="relative z-10 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
                   <Users size={16} className="text-blue-400 group-hover:text-white transition-colors" />
                 </div>
                 <span className="relative z-10 text-sm md:text-base tracking-wide">من نحن وفريق العمل</span>
               </Link>

               <Link 
                 href="/svu-partners"
                 className="w-full md:w-auto group relative px-6 py-3 bg-[#0f172a] md:bg-[#0f172a]/50 md:backdrop-blur-xl border border-white/10 hover:border-pink-500/50 rounded-full font-bold text-pink-400 hover:text-white transition-all duration-500 shadow-lg flex items-center justify-center gap-3 overflow-hidden"
               >
                 <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-pink-600/10 via-rose-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="relative z-10 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 group-hover:rotate-12 transition-transform duration-300">
                   <GraduationCap size={16} className="text-pink-400 group-hover:text-white transition-colors" />
                 </div>
                 <span className="relative z-10 text-sm md:text-base tracking-wide">خاص بطلاب الافتراضية فقط</span>
               </Link>
              </motion.div>

              {/* أزرار البدء والتسجيل */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                {!isLoggedIn && (
                  <>
                    <Link href="/signup" className="w-full sm:w-auto">
                      <button type="button" className="w-full group relative px-8 md:px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-black text-base md:text-lg text-white shadow-lg md:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] md:hover:-translate-y-1 transition-all overflow-hidden flex items-center justify-center gap-3">
                        <div className="hidden md:block absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-3">
                          ابدأ رحلتك مجاناً <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                      <button type="button" className="w-full px-8 md:px-10 py-4 rounded-full bg-[#0f172a] md:bg-white/[0.03] border border-white/10 hover:bg-[#1e293b] md:hover:bg-white/[0.08] text-white font-bold text-base md:text-lg md:backdrop-blur-xl transition-all flex items-center justify-center gap-3 group hover:border-white/30 md:hover:-translate-y-1 shadow-md md:shadow-lg">
                        <User className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" /> سجل الآن
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <GlowingLine color="from-red-500" />

        {/* ======================= شريط الأخبار التفاعلي ======================= */}
        {(newsList.length > 0 || isLoadingNews) && (
          <section className="relative z-40 bg-[#0a0f1c]">
            <div className="bg-[#0f172a] md:bg-[#1e293b]/30 md:backdrop-blur-3xl border-y border-white/5 shadow-md md:shadow-2xl overflow-hidden">
              <div className="flex items-center h-14">
                
                <div className="relative z-20 h-full flex items-center px-4 md:px-8 bg-gradient-to-l from-[#0f172a] to-transparent border-l border-white/5 shrink-0 shadow-sm md:shadow-lg">
                   <div className="flex items-center gap-2 text-red-500">
                     <Megaphone className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] animate-pulse" />
                      <span className="font-black tracking-widest text-xs md:text-sm uppercase text-red-500 drop-shadow-sm whitespace-nowrap">أحدث الأخبار</span>
                   </div>
                </div>

                <div className="flex-1 overflow-hidden relative h-full flex items-center group">
                  {isLoadingNews && newsList.length === 0 ? (
                    <div className="flex items-center gap-8 whitespace-nowrap px-8 animate-pulse w-full">
                      {[1, 2, 3].map((i) => (
                        <div key={`skel-news-${i}`} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-gray-600 rotate-45 mx-2" />
                          <div className="w-48 h-6 bg-white/5 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="flex items-center gap-8 whitespace-nowrap w-max px-4 md:group-hover:[animation-play-state:paused]"
                      initial={{ x: "-100vw" }} animate={{ x: ["-100vw", "100%"] }} 
                      transition={{ ease: "linear", duration: Math.max(30, newsList.length * 10), repeat: Infinity }}
                    >
                      {newsList.map((news: any, index: number) => (
                        <div 
                           key={`news-${news.id || index}-${index}`} 
                           onClick={() => setSelectedNews(news)} 
                           className="inline-flex items-center gap-3 cursor-pointer select-none group/item"
                           title="اضغط لمعرفة التفاصيل"
                        >
                          <div className="w-1.5 h-1.5 bg-red-500 rotate-45 mx-2 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                          <div className="flex items-center gap-3 bg-[#1e293b] md:bg-white/[0.03] hover:bg-red-500/10 px-4 md:px-5 py-2 rounded-full border border-white/5 hover:border-red-500/40 transition-all duration-300">
                             {news.imageUrl && (
                                <div className="relative w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-full overflow-hidden ring-1 md:ring-2 ring-white/10 group-hover/item:ring-red-400/50">
                                   <Image unoptimized 
                                      src={getImageUrl(news.imageUrl, 'news') || FALLBACK_IMAGE} 
                                      alt="" 
                                      fill
                                      sizes="24px"
                                      className="object-cover" 
                                   />
                                </div>
                             )}
                             <span className="text-xs md:text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{news.title}</span>
                             
                             {news.publisher && (
                               <span className="text-[10px] md:text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 mr-2">
                                 {news.publisher}
                               </span>
                             )}
                             
                             <span className="text-[9px] md:text-[10px] text-slate-500 border-r border-white/10 pr-2 md:pr-3 mr-1 font-mono">{formatDateAr(news.publishDate)}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================= نافذة عرض تفاصيل الخبر المنبثقة ======================= */}
        <AnimatePresence>
           {selectedNews && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-[#060a14]/95 md:bg-[#060a14]/90 md:backdrop-blur-xl"
                   onClick={() => setSelectedNews(null)}
                />

                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                   animate={{ opacity: 1, scale: 1, y: 0 }} 
                   exit={{ opacity: 0, scale: 0.95, y: 10 }}
                   className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl md:shadow-[0_30px_100px_-15px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
                >
                   <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 z-20" />

                   <button 
                     onClick={() => setSelectedNews(null)}
                     aria-label="إغلاق النافذة"
                     className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-8 h-8 md:w-10 md:h-10 bg-black/50 md:bg-black/40 hover:bg-red-500/20 text-white/90 md:text-white/70 hover:text-red-400 backdrop-blur-md rounded-full border border-white/20 hover:border-red-500/30 flex items-center justify-center transition-all shadow-lg"
                   >
                    <X size={18} />
                   </button>

                   {selectedNews.imageUrl && (
                     <div className="relative w-full h-48 sm:h-64 md:h-80 bg-slate-900 shrink-0">
                        <Image unoptimized 
                          src={getImageUrl(selectedNews.imageUrl, 'news') || FALLBACK_IMAGE} 
                          alt={selectedNews.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 42rem"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
                     </div>
                   )}

                   <div className={`p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 relative ${!selectedNews.imageUrl ? 'pt-14 md:pt-16' : '-mt-10 md:-mt-16 z-10'}`}>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                         {selectedNews.publisher && (
                           <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] md:text-xs font-black">
                            <Megaphone className="w-[12px] h-[12px] md:w-[14px] md:h-[14px]" /> {selectedNews.publisher}
                           </div>
                         )}
                         <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-[10px] md:text-xs font-medium font-mono">
                           <Calendar className="w-[12px] h-[12px] md:w-[14px] md:h-[14px]" /> {formatDateAr(selectedNews.publishDate)}
                         </div>
                      </div>

                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-4 md:mb-6 leading-snug">
                        {selectedNews.title}
                      </h2>
                      <div className="w-12 md:w-16 h-1 bg-red-500 rounded-full mb-6 md:mb-8" />
                      <div className="text-slate-300 text-sm md:text-base lg:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                         {selectedNews.content || selectedNews.description}
                      </div>
                   </div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

        {/* ======================= 2. قسم الإحصائيات ======================= */}
        <section className="py-16 md:py-24 bg-[#0a0f1c] relative z-20">
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-600/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
              {[
                { label: "مادة أكاديمية", value: platformStats.courses > 0 ? `+${platformStats.courses}` : "0", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "ورشة عمل", value: platformStats.workshops > 0 ? `+${platformStats.workshops}` : "0", icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "معسكر تدريبي", value: platformStats.bootcamps > 0 ? `+${platformStats.bootcamps}` : "0", icon: Zap, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
              ].map((stat: any, i: number) => (
                <motion.div key={`stat-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
                  className={`flex flex-col items-center justify-center p-6 md:p-8 bg-[#0f172a] md:bg-[#0f172a]/60 md:backdrop-blur-2xl rounded-2xl md:rounded-3xl border ${stat.border} shadow-lg md:shadow-2xl relative overflow-hidden group md:hover:-translate-y-2 transition-all duration-500`}
                >
                  <div className={`hidden md:block absolute inset-0 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`} />
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 md:mb-5 relative z-10 border border-white/5 md:group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 md:mb-2 relative z-10 tracking-tight">{stat.value}</h3>
                  <p className="text-sm md:text-base font-bold text-gray-400 relative z-10">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 قسم المحتوى الخاص بي */}
        {isLoggedIn && myEnrollments.length > 0 && (
          <section className="py-16 md:py-24 bg-[#060a14] relative z-20 border-t border-white/5">
            <AnimatedBeamSeparator colorFrom="from-emerald-500" colorTo="to-teal-500" />
            <div className="container mx-auto px-4 md:px-6 mt-10 md:mt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-500/10 p-2 md:p-2.5 rounded-lg md:rounded-xl border border-emerald-500/20 text-emerald-400"><PlayCircle size={20} className="md:w-6 md:h-6" /></div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">متابعة <span className="text-emerald-500">التعلم</span></h2>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm">أكمل مساراتاتك التعليمية من حيث توقفت بكل سهولة.</p>
                </div>
              </div>

              {/* 🌟 القسم بعد التعديل (غلفناه بـ relative group لتظهر الأسهم عند تمرير الماوس) */}
              <div className="relative group w-full px-1 md:px-4">
                
                {/* زر السهم لليمين */}
                <button 
                  onClick={() => scroll('right')}
                  aria-label="تمرير لليمين"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#1e293b]/90 hover:bg-emerald-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/10 translate-x-1/3 md:translate-x-1/2"
                >
                  <ChevronRight size={24} className="rtl:rotate-180" />
                </button>

                {/* حاوية الكروت (أضفنا لها الـ ref وأخفينا الشريط) */}
                <div 
                  ref={scrollRef}
                  className="flex gap-4 md:gap-6 overflow-x-auto pb-6 md:pb-8 snap-x scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                    div::-webkit-scrollbar { display: none; }
                  `}} />

                  {myEnrollments.map((enrollment: any, idx: number) => {
                    const data = enrollment.course || enrollment.workshop || enrollment.bootcamp || enrollment.freeContent || enrollment;
                    const videos = data.contents?.filter((c: any) => c.type === 'VIDEO') || [];
                    const completedCount = videos.filter((v: any) => userProgress.includes(v.id)).length;
                    const progressPercentage = videos.length > 0 ? Math.min(Math.round((completedCount / videos.length) * 100), 100) : 0;
                    
                    let typeLabel = "محتوى", badgeColor = "bg-gray-500/20 text-gray-300 border-gray-500/30", link = "/"; 
                    if (enrollment.type === 'COURSE') { typeLabel = "مادة أكاديمية"; badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30"; link = `/courses/${data.id}/learn`; }
                    else if (enrollment.type === 'WORKSHOP') { typeLabel = "ورشة عمل"; badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"; link = `/workshops/${data.id}/learn`; }
                    else if (enrollment.type === 'BOOTCAMP') { typeLabel = "معسكر"; badgeColor = "bg-pink-500/20 text-pink-300 border-pink-500/30"; link = `/bootcamps/${data.id}/learn`; }
                    else if (enrollment.type === 'FREE_CONTENT') { typeLabel = "محتوى مجاني"; badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30"; link = `/free-content/${data.id}`; }

                    return (
                      <motion.div key={`enroll-${enrollment.id || idx}`} whileHover={{ y: -5 }} className="min-w-[280px] md:min-w-[380px] snap-center bg-[#0f172a] border border-white/5 hover:border-emerald-500/30 rounded-2xl md:rounded-[2rem] p-4 md:p-5 flex flex-col transition-all shadow-md md:shadow-xl group/card relative overflow-hidden">
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                        <div className="flex gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden shrink-0 relative border border-white/10 shadow-inner">
                             <Image unoptimized 
                               src={getImageUrl(data.imageUrl, 'course') || FALLBACK_IMAGE} 
                               alt={data.title} 
                               fill
                               sizes="96px"
                               className="object-cover md:group-hover/card:scale-110 transition-transform duration-700" 
                             />
                          </div>
                          <div className="flex-1 flex flex-col justify-center py-1">
                             <div>
                                <span className={`text-[9px] md:text-[10px] px-2 md:px-2.5 py-1 rounded-full border font-black ${badgeColor} mb-2 inline-block uppercase tracking-wider`}>{typeLabel}</span>
                                <h4 className="font-bold text-xs md:text-sm text-white line-clamp-2 leading-snug">{data.title}</h4>
                             </div>
                          </div>
                        </div>

                        <div className="mb-4 md:mb-6 relative z-10">
                          <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 mb-2 md:transition-opacity md:group-hover/card:opacity-0">
                             <span>نسبة الإنجاز</span><span className="text-emerald-400">{progressPercentage}%</span>
                          </div>
                          <div className="hidden md:flex absolute top-0 left-0 w-full justify-between text-xs font-bold text-emerald-400 mb-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                             <span className="flex items-center gap-1"><PlayCircle size={12}/> أكمل من حيث توقفت</span>
                          </div>
                          <div className="h-1.5 md:h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner mt-4 md:mt-6">
                             <motion.div initial={{ width: 0 }} whileInView={{ width: `${progressPercentage}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 relative">
                                <div className="hidden md:block absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30 animate-[slide_2s_linear_infinite]"></div>
                             </motion.div>
                          </div>
                        </div>

                        <Link href={link} className="mt-auto relative z-10">
                          <button type="button" aria-label="متابعة التعلم" className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#1e293b] md:bg-white/[0.03] md:group-hover/card:bg-emerald-600 border border-white/5 md:group-hover/card:border-transparent text-gray-300 md:group-hover/card:text-white text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <PlayCircle size={16} className="md:w-[18px] md:h-[18px]" /> متابعة التعلم
                          </button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* زر السهم لليسار */}
                <button 
                  onClick={() => scroll('left')}
                  aria-label="تمرير لليسار"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#1e293b]/90 hover:bg-emerald-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/10 -translate-x-1/3 md:-translate-x-1/2"
                >
                  <ChevronLeft size={24} className="rtl:rotate-180" />
                </button>

              </div>
            </div>
          </section>
        )}

        <AnimatedBeamSeparator />

        {/* ======================= 3 & 4. قسم كيف تبدأ رحلتك + الأكثر طلباً ======================= */}
        <section id="journey-and-popular" className="py-16 md:py-24 bg-[#060a14] relative overflow-hidden">
          <div className="hidden md:block absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="hidden md:block absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">كيف تبدأ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-pink-400 drop-shadow-sm">رحلتك</span> معنا؟</h2>
              <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
                خطوات بسيطة تفصلك عن الانضمام لأفضل بيئة تعليمية تفاعلية تضمن لك التفوق والاحتراف.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 relative mb-20 md:mb-32">
              <div className="hidden md:block absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-yellow-500/30 -translate-y-1/2 z-0" />
              
              {[
                { step: "1", title: "أنشئ حسابك", desc: "سجل مجاناً وانضم لمجتمعنا", icon: User, border: "md:hover:border-blue-500/50", bgHover: "md:hover:bg-blue-500/5", textHover: "md:group-hover:text-blue-400", badge: "bg-blue-600" },
                { step: "2", title: "اختر مسارك", desc: "اختر مادة أكاديمية أو ورشة عمل", icon: Layers, border: "md:hover:border-emerald-500/50", bgHover: "md:hover:bg-emerald-500/5", textHover: "md:group-hover:text-emerald-400", badge: "bg-emerald-600" },
                { step: "3", title: "تعلم ونافس", desc: "احضر الدروس واكسب الـ XP", icon: Rocket, border: "md:hover:border-pink-500/50", bgHover: "md:hover:bg-pink-500/5", textHover: "md:group-hover:text-pink-400", badge: "bg-pink-600" },
                { step: "4", title: "احصل على الشهادة", desc: "وثق إنجازك وانطلق لسوق العمل", icon: GraduationCap, border: "md:hover:border-yellow-500/50", bgHover: "md:hover:bg-yellow-500/5", textHover: "md:group-hover:text-yellow-400", badge: "bg-yellow-500" }
              ].map((item: any, i: number) => (
                <div key={`step-${i}`} className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0f172a] md:bg-[#0a0f1c] border border-white/10 flex items-center justify-center mb-4 md:mb-6 shadow-md md:shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group ${item.border} ${item.bgHover} transition-all duration-500`}>
                    <item.icon className={`w-8 h-8 md:w-10 md:h-10 text-gray-400 ${item.textHover} md:group-hover:scale-110 transition-all duration-500`} />
                    <div className={`absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 ${item.badge} rounded-full text-white text-xs md:text-sm font-black flex items-center justify-center border-2 md:border-[3px] border-[#0a0f1c] shadow-lg`}>
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500 max-w-[200px] font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* الجزء الثاني: الأكثر طلباً المتصل بالرحلة مباشرة */}
            <div id="popular" className="pt-16 md:pt-20 border-t border-white/5 relative">
              <div className="absolute -top-3.5 md:-top-4 left-1/2 -translate-x-1/2 bg-[#060a14] px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-white/10 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-md md:shadow-lg">
                 <ArrowDownCircle size={14} className="md:w-4 md:h-4 animate-bounce text-orange-500" /> ابدأ الخطوة الثانية
              </div>
              
              <div className="flex items-end justify-between mb-10 md:mb-16 mt-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] md:text-xs font-black mb-3 md:mb-4 uppercase tracking-widest">
                    <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> مسارات مميزة
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">الأكثر طلباً 🔥</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {isLoadingFeatured ? (
                   <><SkeletonCard key="skel-1" /><SkeletonCard key="skel-2" /><SkeletonCard key="skel-3" /></>
                ) : featured.length > 0 ? (
                  featured.map((item: any, idx: number) => {
                    const data = item.course || item.workshop || item.bootcamp;
                    if (!data) return null;
                    let typeLabel = "غير معروف", link = "/", typeBadgeColor = "text-gray-300 bg-gray-500/20";
                    if (item.course) { typeLabel = "مادة أكاديمية"; link = `/courses/${data.id}`; typeBadgeColor = "text-blue-300 bg-blue-500/20 border-blue-500/30"; } 
                    else if (item.workshop) { typeLabel = "ورشة عمل"; link = `/workshops/${data.id}`; typeBadgeColor = "text-emerald-300 bg-emerald-500/20 border-emerald-500/30"; } 
                    else if (item.bootcamp) { typeLabel = "معسكر"; link = `/bootcamps/${data.id}`; typeBadgeColor = "text-pink-300 bg-pink-500/20 border-pink-500/30"; }
                    
                    return (
                      <Link href={link} key={`featured-${item.id || idx}`} className="block">
                        <div className="group relative rounded-2xl md:rounded-[2rem] bg-[#0f172a] md:bg-gradient-to-b md:from-white/[0.05] md:to-transparent md:backdrop-blur-md border border-white/10 md:hover:border-orange-500/40 transition-all duration-500 md:hover:-translate-y-2 shadow-lg md:shadow-2xl flex flex-col h-[340px] md:h-[380px] overflow-hidden">
                          
                          <div className="h-40 md:h-44 w-full relative overflow-hidden bg-slate-900 shrink-0">
                            <Image unoptimized 
                              src={getImageUrl(data.imageUrl, 'course', 600) || FALLBACK_IMAGE} 
                              alt={data.title} 
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover opacity-90 md:opacity-80 md:group-hover:scale-110 md:group-hover:opacity-100 transition-all duration-700 ease-out" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                            
                            <span className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 px-2 py-1 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[9px] font-black border md:backdrop-blur-xl uppercase tracking-tighter ${typeBadgeColor}`}>
                              {typeLabel}
                            </span>

                            {data.isPlatformSponsored && data.stampUrl && (
                              <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 w-8 h-8 md:w-9 md:h-9 bg-[#0f172a]/80 md:bg-white/10 md:backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-1 md:p-1.5 shadow-md md:shadow-xl overflow-hidden">
                                <Image unoptimized 
                                  src={getImageUrl(data.stampUrl) || FALLBACK_IMAGE} alt="Stamp" fill sizes="36px" className="object-contain p-1.5" />
                              </div>
                            )}
                          </div>

                          <div className="p-4 md:p-5 flex flex-col flex-grow relative z-10 bg-[#0f172a]">
                            <h3 className="text-base md:text-lg font-black text-white mb-1 md:group-hover:text-orange-400 transition-colors line-clamp-1">
                              {data.title}
                            </h3>
                            
                            <div className="origin-right transform scale-90 md:scale-95">
                                <ReadOnlyRating averageRating={data.averageRating || 0} reviewsCount={data.reviewsCount || 0} />
                            </div>
                            
                            <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed mb-3 md:mb-4 line-clamp-2 font-medium opacity-80 flex-grow">
                              {data.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 md:pt-4 mt-auto">
                              <div className="flex flex-col">
                                {data.offerPrice ? (
                                  <>
                                    <span className="text-[9px] md:text-[10px] text-slate-500 line-through">ل.س {data.price}</span>
                                    <span className="text-sm md:text-base font-black text-emerald-400">ل.س {data.offerPrice}</span>
                                  </>
                                ) : (
                                  <span className="text-sm md:text-base font-black text-white">ل.س {data.price}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 text-[11px] md:text-xs font-bold text-orange-400 md:group-hover:gap-2 transition-all cursor-pointer">
                                 <span>عرض التفاصيل</span>
                                 <ArrowLeft size={12} className="md:w-3.5 md:h-3.5" />
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block absolute top-0 -left-[100%] w-1/2 h-full z-50 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out_forwards]" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                   <div className="col-span-full text-center py-16 md:py-20 bg-[#0f172a] md:bg-white/[0.02] rounded-2xl md:rounded-[3rem] border border-dashed border-white/10">
                     <p className="text-gray-500 text-sm md:text-lg font-medium">لا يوجد عناصر مميزة للعرض حالياً.</p>
                   </div>
                )}
              </div>
            </div>
            
          </div>
        </section>

        {/* ======================= 6. الأقسام التفصيلية ======================= */}
        <section className="py-16 md:py-24 relative bg-[#060a14] md:bg-gradient-to-b md:from-[#060a14] md:to-[#0a0f1c] border-t border-white/5">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            
            <div id="courses" className="flex flex-col gap-8 md:gap-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-black mb-3 md:mb-4 uppercase tracking-widest"><BookOpen size={12} className="md:w-3.5 md:h-3.5" /> الكورسات الجامعية</div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight">المواد الأكاديمية <span className="text-blue-500 drop-shadow-sm">المدفوعة</span></h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                      مكتبة شاملة من المواد الجامعية المشروحة بأعلى معايير الجودة، مصممة خصيصاً لضمان تفوقك الدراسي.
                    </p>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                 <CourseCard image={platformSettings.course1Url} title="Data Structures" delay={0} />
                 <CourseCard image={platformSettings.course2Url} title="Programming 1" delay={0} />
                 <CourseCard image={platformSettings.course3Url} title="Programming 3" delay={0} />
                 <CourseCard image={platformSettings.course4Url} title="Operating Systems" delay={0} />
              </div>

              <div className="flex justify-center w-full mt-6 md:mt-10">
                <Link href="/courses">
                  <button type="button" aria-label="تصفح جميع المواد" className="w-full md:w-auto group relative overflow-hidden rounded-xl md:rounded-full bg-[#1e293b] md:bg-[#0f172a] border border-blue-500/30 md:hover:border-blue-400 shadow-md md:shadow-[0_0_20px_rgba(59,130,246,0.15)] md:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-500 px-6 md:px-12 py-3.5 md:py-5 flex items-center justify-center gap-3">
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 text-white font-bold md:font-black text-sm md:text-xl flex items-center gap-2 md:gap-3">
                      استكشف جميع المواد الأكاديمية <ArrowLeft size={18} className="md:w-5 md:h-5 md:group-hover:-translate-x-2 transition-transform duration-300 text-blue-400 md:group-hover:text-white" />
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            <div id="workshops" className="py-20 md:py-32 border-t border-white/5 mt-16 md:mt-24 relative">
              <div className="hidden md:block absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[150px] -z-10 rounded-full pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16">
                <motion.div className="max-w-xl w-full" initial={{ opacity: 0, x: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-black mb-4 md:mb-6 uppercase tracking-widest"><Wrench size={12} className="md:w-3.5 md:h-3.5" /> التطبيق العملي</div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">الورشات <span className="text-emerald-500 drop-shadow-sm">العملية</span></h2>
                  <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-8 md:mb-10">
                    جسرك الحقيقي نحو سوق العمل. ورشات تطبيقية مكثفة تركز على المهارات المطلوبة حالياً في الشركات، لتخرج منها بمشاريع فعلية.
                  </p>
                  <Link href="/workshops" className="block w-full md:w-auto">
                    <button type="button" aria-label="استكشاف الورشات" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-[#1e293b] md:bg-[#0f172a] rounded-xl md:rounded-2xl text-white font-bold text-sm md:text-base md:hover:bg-emerald-600 transition-colors shadow-md md:shadow-2xl border border-white/10 md:hover:border-transparent group">
                      استكشاف الورشات <ArrowLeft size={16} className="md:w-4 md:h-4 md:group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
                <div className="relative w-full lg:w-1/2 group h-56 md:h-72 lg:h-96 perspective-1000">
                    <div className="hidden md:block absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />
                    <div className="relative bg-[#0f172a] md:bg-[#060a14] rounded-2xl md:rounded-[2rem] overflow-hidden p-1 md:p-2 h-full shadow-lg md:shadow-2xl border border-white/10">
                        <div className="relative h-full w-full rounded-xl md:rounded-[1.5rem] overflow-hidden">
                           <Image unoptimized 
                             src={platformSettings.workshopUrl || FALLBACK_IMAGE} 
                             alt="Workshops Home" 
                             fill
                             sizes="(max-width: 1024px) 100vw, 50vw"
                             className="object-cover transition-transform duration-700 md:group-hover:scale-105" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#060a14]/60 to-transparent opacity-90" />
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-500/20 md:backdrop-blur-md rounded-full border border-emerald-500/30 flex items-center justify-center">
                                 <MonitorPlay size={24} className="md:w-8 md:h-8 text-emerald-400" />
                              </div>
                           </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div id="camps" className="text-center max-w-6xl mx-auto pt-16 md:pt-20 border-t border-white/5 relative">
              <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-pink-600/5 blur-[150px] -z-10 rounded-full pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] md:text-xs font-black mb-4 md:mb-6 uppercase tracking-widest"><Zap size={12} className="md:w-3.5 md:h-3.5" /> التدريب المكثف</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">المعسكرات التدريبية <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 drop-shadow-sm">(Bootcamps)</span></h2>
              <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-10 md:mb-16 max-w-2xl mx-auto">
                برامج تدريبية مكثفة وشاملة مصممة لنقلك من مستوى المبتدئ إلى الاحتراف في وقت قياسي وبمتابعة يومية.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 text-right mb-10 md:mb-16">
                  <SectionCard title="مكثفات امتحانية" desc="راجع منهاجك كاملاً في أيام قليلة قبل الامتحان بأسلوب مركز يضمن لك النجاح." icon={BookOpen} color="bg-pink-500/10" borderColor="border-white/5" />
                  <SectionCard title="تخصص تقني" desc="تعلم تقنية كاملة من الصفر للاحتراف عبر معسكر تطبيقي." icon={MonitorPlay} color="bg-purple-500/10" borderColor="border-white/5" />
                  <SectionCard title="مشاريع عملية" desc="ابنِ معرض أعمالك الفعلي خلال فترة المعسكر لتنافس بقوة في سوق العمل المزدحم." icon={Layers} color="bg-blue-500/10" borderColor="border-white/5" />
              </div>
              
              <Link href="/bootcamps" className="block w-full md:inline-block md:w-auto">
                  <button type="button" aria-label="استكشاف المعسكرات" className="w-full md:w-auto group inline-flex justify-center items-center gap-2 px-6 md:px-10 py-3.5 md:py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl md:rounded-full text-white font-bold md:font-black text-sm md:text-lg shadow-md md:shadow-[0_0_40px_rgba(244,63,94,0.4)] md:hover:-translate-y-1 transition-all">
                    تصفح جميع المعسكرات <ArrowLeft size={16} className="md:w-5 md:h-5 md:group-hover:-translate-x-1 transition-transform" />
                  </button>
              </Link>
            </div>
          </div>
        </section>

        <AnimatedBeamSeparator colorFrom="from-amber-500" colorTo="to-orange-500" />

        {/* 🌟 7. المحتوى المجاني */}
        <section id="free" className="py-20 md:py-32 relative bg-[#060a14] overflow-hidden">
          <div className="hidden md:block absolute top-1/2 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
          <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-16 gap-5 md:gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-500 text-[10px] md:text-xs font-black mb-4 md:mb-5 uppercase tracking-widest shadow-sm md:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                        <Gift size={12} className="md:w-3.5 md:h-3.5" /> وصول مفتوح للجميع
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                        المحتوى المجاني <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-md">المميز</span>
                    </h2>
                    <p className="text-slate-400 text-sm md:text-lg mt-3 md:mt-5 max-w-2xl font-medium">
                       اسئلة خاصة بمواد اكاديمية موزعة ضمن كويزات متفاوتة الصعوبة وغالباً تكون مدعمة بفيدوهات على يوتيوب او على تيلغرام ضمن مجموعات عامة.
                    </p>
                  </div>
                  <Link href="/free-content" className="w-full md:w-auto mt-2 md:mt-0">
                    <button type="button" aria-label="عرض المكتبة الكاملة" className="w-full md:w-auto group relative overflow-hidden bg-[#1e293b] md:bg-[#0f172a] text-white text-sm font-bold px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 md:hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 shadow-md md:shadow-2xl">
                        <span className="relative z-10 flex items-center gap-2 md:group-hover:text-amber-400 transition-colors">
                           استكشف المكتبة الكاملة <ArrowLeft size={16} className="md:w-[18px] md:h-[18px] md:group-hover:-translate-x-1 transition-transform" />
                        </span>
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                  </Link>
              </div>
              
              {freeContent.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                      {freeContent.map((item: any, idx: number) => (
                          <motion.div 
                              key={`free-content-${item.id || idx}`} 
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: 0 }}
                              className="h-[320px] md:h-[360px]"
                          >
                             <FreeContentCard item={item} />
                          </motion.div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-20 md:py-32 text-slate-400 bg-[#0f172a] md:bg-[#0f172a]/40 md:backdrop-blur-2xl rounded-2xl md:rounded-[3rem] border border-dashed border-white/10 md:shadow-inner max-w-4xl mx-auto relative z-10">
                      <Gift size={48} className="md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-amber-500/30" />
                      <p className="text-xl md:text-2xl font-black text-white mb-2">لا يوجد محتوى مجاني حالياً</p>
                      <p className="text-sm md:text-base font-medium px-4">نعمل على إضافة محتوى حصري ومميز قريباً، ابقَ على اطلاع! 🎁</p>
                  </div>
              )}
          </div>
        </section>

        <BadgeSeparator icon={Award} text="الكفاءات والخبرات" color="text-blue-400" glow="shadow-blue-500/20" />

        {/* 🌟 8. قسم نخبة المدربين */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-[#060a14] md:bg-gradient-to-b md:from-[#060a14] md:via-[#0f172a] md:to-[#0a0f1c]">
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight">
                تعلم من <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">نخبة الخبراء</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-xl leading-relaxed font-medium">
                كادر تعليمي يمتلك خبرات عملية قوية ، ينقلون لك خلاصة تجاربهم بأسلوب أكاديمي وعملي معاً.
              </p>
            </div>
            
            {instructorsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {instructorsList.map((instructor: any, idx: number) => {
                  const fallbackAvatar = `https://ui-avatars.com/api/?name=${instructor.firstName || 'U'}&background=0D8ABC&color=fff&size=256`;
                  return (
                    <motion.div 
                      key={`inst-${instructor.id || idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0, duration: 0.5 }}
                      className="group bg-[#0f172a] md:bg-[#060a14]/50 border border-white/5 md:hover:border-blue-500/30 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center text-center transition-all duration-500 md:hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] md:hover:-translate-y-2 md:backdrop-blur-3xl overflow-hidden relative"
                    >
                      <div className="hidden md:block absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 mt-1 md:mt-2">
                         <Image unoptimized 
                           src={getImageUrl(instructor.avatar || instructor.imageUrl, 'avatar', 200) || fallbackAvatar} 
                           alt={instructor.firstName || 'Instructor'} 
                           fill
                           sizes="128px"
                           className="object-cover rounded-full border-2 border-white/5 md:group-hover:border-blue-400/50 transition-colors duration-500 shadow-lg md:shadow-2xl"
                           onError={(e: any) => { e.currentTarget.srcset = ""; e.currentTarget.src = fallbackAvatar; }} 
                         />
                         
                         {instructor.isElite && (
                           <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#0f172a] md:bg-[#060a14] p-1 md:p-1.5 rounded-full z-20">
                              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 md:p-2 rounded-full shadow-lg" title="مدرب خبير معتمد">
                                <ShieldCheck size={14} className="md:w-4 md:h-4 drop-shadow-sm" />
                              </div>
                           </div>
                         )}
                       </div>
                      
                      <h3 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2 md:group-hover:text-blue-400 transition-colors duration-300">
                         {instructor.firstName} {instructor.lastName}
                      </h3>
                      
                      <p className="text-[11px] md:text-xs text-slate-400 mb-6 md:mb-8 font-medium tracking-wide">
                         {instructor.specialization || "مدرب معتمد"}
                      </p>

                      <div className="flex gap-3 md:gap-4 mb-8 md:mb-10 w-full justify-center">
                         <a href={instructor.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all shadow-sm" aria-label="LinkedIn">
                             <Linkedin size={18} className="md:w-5 md:h-5" />
                         </a>
                         <a href={instructor.github || '#'} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white hover:text-black hover:border-white transition-all shadow-sm" aria-label="GitHub">
                             <Github size={18} className="md:w-5 md:h-5" />
                         </a>
                      </div>

                      <Link href={`/instructor/${instructor.id}`} scroll={true} className="w-full mt-auto">
                         <button type="button" aria-label={`عرض السيرة الذاتية`} className="w-full py-3 md:py-4 bg-[#1e293b] md:bg-transparent border border-white/10 md:group-hover:bg-white/5 md:group-hover:border-blue-500/30 text-slate-300 md:group-hover:text-blue-400 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                           عرض الملف الشخصي <ArrowLeft size={14} className="md:w-4 md:h-4 md:group-hover/btn:-translate-x-1 transition-transform" />
                         </button>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 md:py-20 bg-[#0f172a] md:bg-[#0f172a]/40 md:backdrop-blur-md rounded-2xl md:rounded-[3rem] border border-dashed border-white/10 max-w-4xl mx-auto">
                <Users size={48} className="md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-slate-600" />
                <p className="text-slate-400 text-sm md:text-xl font-bold">جاري تحميل قائمة المدربين...</p>
              </div>
            )}
          </div>
        </section>

        <CurveSeparator topColor="#0a0f1c" bottomColor="#060a14" />

        {/* ======================= 9. قسم الشهادات ======================= */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-[#060a14]">
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-yellow-500/5 blur-[150px] -z-10 pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2 z-10 text-center md:text-right">
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-yellow-500/10 md:bg-gradient-to-r md:from-yellow-500/20 md:to-amber-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] md:text-xs font-black mb-4 md:mb-6 md:shadow-lg shadow-yellow-500/10 uppercase tracking-widest">
                 <Award size={12} className="md:w-3.5 md:h-3.5" /> شهادة اتمام محتوى  
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight">
                 توج مسيرتك بشهادة <br className="hidden md:block" />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-md">
                   تصنع الفارق
                 </span>
              </h2>
              
              <p className="text-slate-300 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto md:mx-0 font-medium">
                عند إتمامك لأي مسار تعليمي بنجاح، ستحصل على شهادة إتمام محتوى من منصة Up Scale
              </p>

              <ul className="space-y-3 md:space-y-4 mb-10 text-right">
                <li className="flex items-center gap-3 md:gap-4 text-gray-200 text-sm md:text-base font-medium bg-[#0f172a] md:bg-[#0f172a]/60 md:backdrop-blur-xl p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 md:hover:border-emerald-500/30 transition-all shadow-md md:shadow-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                    <Briefcase size={20} className="md:w-6 md:h-6" />
                  </div>
                  إثبات حقيقي لمهاراتك يضيف قيمة قوية لسيرتك الذاتية
                </li>
                <li className="flex items-center gap-3 md:gap-4 text-gray-200 text-sm md:text-base font-medium bg-[#0f172a] md:bg-[#0f172a]/60 md:backdrop-blur-xl p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 md:hover:border-blue-500/30 transition-all shadow-md md:shadow-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                    <Trophy size={20} className="md:w-6 md:h-6" />
                  </div>
                  تتويج لجهودك بعد إتمام متطلبات المسار بنجاح
                </li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/2 relative perspective-1000 group">
              <div className="hidden md:block absolute -inset-4 bg-gradient-to-tr from-yellow-500 via-amber-600 to-orange-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 -z-10" />
              
              <motion.div 
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -5 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative z-10 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg md:shadow-2xl border border-yellow-500/20 bg-[#0f172a]"
              >
                <div className="h-1.5 md:h-2 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600" />
                <div className="p-2 md:p-3">
                   <Image unoptimized 
                     src={platformSettings.certificateUrl || FALLBACK_IMAGE} 
                     alt="certificate Preview" 
                     width={800}
                     height={550}
                     className="w-full h-auto object-cover rounded-xl md:rounded-[2rem] shadow-inner border border-white/5"
                   />
                </div>
              </motion.div>

              <div className="absolute -bottom-4 -left-2 md:-bottom-8 md:-left-8 w-16 h-16 md:w-28 md:h-28 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-md md:shadow-[0_20px_50px_rgba(245,158,11,0.5)] border-4 md:border-[6px] border-[#060a14] z-20 md:group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck size={28} className="md:w-12 md:h-12 text-[#060a14]" />
              </div>
            </div>

          </div>
        </section>

        <CurveSeparator topColor="#0a0f1c" bottomColor="#0f172a" />

        {/* ======================= 10. قسم الأسئلة الشائعة ======================= */}
        <section className="py-16 md:py-24 bg-[#0f172a] relative">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight">الأسئلة <span className="text-blue-500 drop-shadow-sm">الشائعة</span></h2>
              <p className="text-slate-400 text-sm md:text-lg">كل ما تحتاج معرفته قبل البدء في رحلتك التعليمية معنا.</p>
            </div>
            
            <div className="flex flex-col gap-3 md:gap-4">
              {faqs.map((faq: {q: string; a: string}, index: number) => (
                <FAQItem key={`faq-item-${index}`} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ======================= 11. النداء الأخير (Bottom CTA) ======================= */}
       <section className="py-20 md:py-32 relative overflow-hidden bg-[#0f172a] border-t border-white/5">
          <div className="absolute inset-0 bg-[#060a14] md:bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-transparent opacity-90" />
          <div className="hidden md:block absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-6 md:mb-8 leading-tight drop-shadow-lg tracking-tight">
              هل أنت مستعد لبدء رحلتك <br className="hidden md:block" /> نحو الاحتراف؟
            </h2>
            <p className="text-base md:text-xl lg:text-2xl text-blue-200/80 mb-10 md:mb-14 max-w-3xl mx-auto font-medium">
              اختر مسارك الآن وانضم لأفضل بيئة تعليمية تفاعلية.
            </p>
            <div className="flex justify-center w-full md:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <button type="button" aria-label="أنشئ حسابك مجاناً" className="w-full md:w-auto px-8 md:px-14 py-4 md:py-6 bg-white text-slate-900 hover:bg-gray-100 rounded-xl md:rounded-full font-black text-base md:text-xl shadow-lg md:shadow-[0_0_40px_rgba(255,255,255,0.2)] md:hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] md:hover:-translate-y-2 transition-all duration-500 flex items-center justify-center gap-3">
                  أنشئ حسابك مجاناً <ArrowLeft size={20} className="md:w-6 md:h-6" />
                </button>
              </Link>
            </div>
          </div>
        </section>        
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[100] p-3 md:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] md:hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] border border-white/20 transition-all md:hover:-translate-y-1 cursor-pointer"
            title="العودة لأعلى الصفحة"
            aria-label="العودة لأعلى الصفحة"
          >
            <ArrowUp size={20} className="md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </main>
  );
}