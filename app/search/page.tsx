"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";
import { 
  Search, Loader2, ArrowRight, BookOpen, Layers, Zap, 
  PlayCircle, AlertCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
// 🧩 مكون الكرت الفاخر لعرض النتائج
const ContentCard = ({ item, type }: { item: any, type: string }) => {
  const config = {
    COURSE: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500", border: "group-hover:border-blue-500/50", label: "مادة أكاديمية", link: `/courses/${item.id}` },
    WORKSHOP: { icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500", border: "group-hover:border-emerald-500/50", label: "ورشة عمل", link: `/workshops/${item.id}` },
    BOOTCAMP: { icon: Zap, color: "text-pink-400", bg: "bg-pink-500", border: "group-hover:border-pink-500/50", label: "معسكر تدريبي", link: `/bootcamps/${item.id}` },
  }[type] || { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500", border: "group-hover:border-blue-500/50", label: "محتوى", link: `/` };

  const Icon = config.icon;

  return (
    <Link href={config.link} className="block h-full" title={`الذهاب إلى ${item.title}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className={`bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-2 rounded-[2rem] transition-all duration-300 group shadow-lg hover:shadow-2xl h-full flex flex-col relative overflow-hidden ${config.border}`}
      >
        <div className={`absolute -inset-10 bg-gradient-to-tr from-${config.bg}/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none`} />
        
        <div className="h-44 w-full relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-slate-800">
          <img 
            src={getImageUrl(item.imageUrl, 'course')||""} 
            loading="lazy" // ✅ حماية أداء المتصفح وسيرفر الصور
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
            alt={item.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
          
          <div className={`absolute top-3 right-3 ${config.bg}/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-black flex items-center gap-1.5 shadow-lg border border-white/20`}>
            <Icon size={12} className="text-white" /> {config.label}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1 relative z-10">
          <h4 className="text-base font-black text-slate-100 group-hover:text-white transition-colors line-clamp-2 mb-2 leading-relaxed">
            {item.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1 font-medium leading-loose">
            {item.description || "استكشف هذا المحتوى واكتسب مهارات جديدة لتعزيز مسيرتك المهنية."}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
             <span className={`text-xs font-black ${config.color} flex items-center gap-1.5 group-hover:gap-2 transition-all bg-white/5 px-3 py-1.5 rounded-lg`}>
               التفاصيل <ArrowRight size={14} />
             </span>
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-inner">
                <PlayCircle size={16} className="text-slate-300" />
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// 🔍 مكون البحث الرئيسي
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // تعديل القيمة الأولية
  const [error, setError] = useState(false); // ✅ حالة صريحة لأخطاء السيرفر
  const [searchInput, setSearchInput] = useState(query);

  // ✅ إصلاح خلل المزامنة (Stale State) عند التراجع عبر أزرار المتصفح
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query.trim())}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل الاتصال"); // ✅ التحقق الفعلي من سلامة الاستجابة
        return res.json();
      })
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setError(true); // ✅ تفعيل حالة الخطأ
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length > 0) { // ✅ حماية من الاستعلامات الفارغة تماماً
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // ✅ حماية المتصفح من التجمد (DOM Overload Protection)
  // نعرض أول 40 نتيجة كحد أقصى للحفاظ على سلاسة الـ Animation
  const displayedResults = results.slice(0, 40);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* 🌟 هيدر البحث */}
      <div className="pt-32 pb-16 relative overflow-hidden bg-slate-900 border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-slate-900/50 to-[#0f172a]" />
        
        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <button 
             onClick={() => router.back()} 
             className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm mb-8 transition-colors"
             aria-label="العودة للصفحة السابقة"
          >
            <ArrowRight size={16} /> العودة للصفحة السابقة
          </button>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
            البحث في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">UpScale</span>
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl group">
            <label htmlFor="searchBox" className="sr-only">صندوق البحث</label>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={24} />
            </div>
            <input 
              id="searchBox"
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="عن ماذا تبحث؟ (مثال: React, برمجة, امتحان...)" 
              className="w-full bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 text-white text-lg rounded-2xl py-5 pr-16 pl-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xl"
            />
            <button 
              type="submit" 
              disabled={loading || searchInput.trim() === ""}
              className="absolute inset-y-2 left-2 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-colors shadow-lg disabled:opacity-50"
            >
              بحث
            </button>
          </form>
        </div>
      </div>

      {/* 🌟 نتائج البحث */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        
        {query && (
          <div className="mb-10 flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-white">نتائج البحث عن:</h2>
            <span className="px-4 py-1.5 bg-white/10 rounded-xl text-blue-400 font-bold border border-white/10">"{query}"</span>
            {displayedResults.length > 0 && (
                <span className="text-sm text-gray-400">({results.length} نتيجة)</span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">جاري البحث في قواعد البيانات...</p>
          </div>
        ) : error ? (
          // ✅ شاشة خطأ مخصصة تمنع تضليل المستخدم
          <div className="text-center py-24 bg-red-500/5 rounded-[3rem] border border-dashed border-red-500/20 max-w-3xl mx-auto">
             <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
             </div>
             <h3 className="text-2xl font-black text-white mb-2">عذراً، حدث خطأ في الاتصال</h3>
             <p className="text-slate-400 text-lg">لم نتمكن من الوصول لقاعدة البيانات. يرجى المحاولة مرة أخرى لاحقاً.</p>
          </div>
        ) : !query.trim() ? (
          // حالة البداية (قبل البحث)
          <div className="text-center py-24 text-gray-500 opacity-50">
             <Search size={64} className="mx-auto mb-4" />
             <p className="text-xl font-bold">اكتب ما تبحث عنه في المربع أعلاه</p>
          </div>
        ) : displayedResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedResults.map((item, idx) => (
              <motion.div 
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ContentCard item={item} type={item.contentType} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#1e293b]/30 rounded-[3rem] border border-dashed border-white/10 max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
               <AlertCircle size={40} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">لم نتمكن من العثور على أي نتائج!</h3>
            <p className="text-slate-400 text-lg">جرب البحث باستخدام كلمات مفتاحية مختلفة أو أعم.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// التغليف بـ Suspense ضروري في Next.js عند استخدام useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}