"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  ShieldCheck, Loader2, ArrowRight, AlertTriangle, 
  Database, Activity, ShieldAlert, UserCog, History, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function PrivacyPage() {
  const [data, setData] = useState({
    content: "",
    teamImageUrl: "",
    stampImageUrl: "",
    platformName: "Up Scale Training Hub"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`)
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل الاتصال");
        return res.json();
      })
      .then((resData) => {
        if (resData && !resData.error) {
          setData({
            content: resData.privacyContent || "لم يتم إضافة سياسة الخصوصية بعد من قبل الإدارة.",
            teamImageUrl: resData.teamImageUrl || "",
            stampImageUrl: resData.stampImageUrl || "",
            platformName: resData.platformName || "Up Scale Training Hub"
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching privacy policy:", err);
        setError(true);
        setLoading(false);
      });
  }, []);


  const parsePrivacyContent = (text: string) => {
    if (!text.includes("1.")) return { intro: text, sections: [] };

    const parts = text.split(/(?=\d+\.\s)/);
    const intro = parts[0].trim();
    
    const sections = parts.slice(1).map((part) => {
      const lines = part.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const title = lines[0].replace(/^\d+\.\s*/, '');
      const items = lines.slice(1);
      return { title, items };
    });

    return { intro, sections };
  };

  const parsedContent = parsePrivacyContent(data.content);

  const getSectionIcon = (index: number) => {
    const icons = [Database, Activity, ShieldAlert, UserCog, History];
    const IconComponent = icons[index % icons.length];
    return <IconComponent size={24} className="text-emerald-400" />;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans selection:bg-emerald-500/30 flex flex-col" dir="rtl">
      
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-[#060a14] z-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
        
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowRight size={18} /> العودة للرئيسية
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mt-2">
              سياسة <span className="text-emerald-400 drop-shadow-sm">الخصوصية</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium mt-4 leading-relaxed">
            الشفافية هي أساس الثقة بيننا. تعرف على التزامنا الكامل بحماية بياناتك الشخصية في {data.platformName}.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 flex-grow relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-emerald-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold text-lg">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
               <AlertTriangle size={48} className="text-red-500 mb-4 opacity-80" />
               <h3 className="text-2xl font-black text-white mb-2">عذراً، حدث خطأ في الاتصال</h3>
               <p className="text-slate-400 mb-8 max-w-md leading-relaxed">لم نتمكن من جلب سياسة الخصوصية من الخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.</p>
               <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                 إعادة المحاولة
               </button>
            </div>
          ) : (
            <>
              {parsedContent.intro && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl p-8 mb-10">
                  <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed border-r-4 border-emerald-500 pr-4">
                    {parsedContent.intro}
                  </p>
                </motion.div>
              )}

              {parsedContent.sections.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                  {parsedContent.sections.map((section, index) => (
                    <motion.div 
                      key={index} 
                      variants={itemVariants}
                      className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/80 backdrop-blur-md rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 shadow-lg p-6 md:p-8 relative overflow-hidden"
                    >
                      <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#060a14] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          {getSectionIcon(index)}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white">{section.title}</h2>
                      </div>

                      {section.items.length > 0 ? (
                        <ul className="space-y-4">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 size={18} className="text-emerald-500/70 mt-1 shrink-0" />
                              <span className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400">لم يتم إضافة تفاصيل لهذا القسم.</p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl p-8 text-slate-300 text-lg leading-loose whitespace-pre-wrap">
                  {data.content}
                </div>
              )}

              {(data.teamImageUrl || data.stampImageUrl) && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-10">
                  {data.stampImageUrl && (
                    <div className="w-full md:w-1/2 flex flex-col items-center group">
                      <p className="text-xs font-black text-emerald-500/80 mb-4 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">الاعتماد الرسمي</p>
                      <div className="relative p-2 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        <img 
                          src={data.stampImageUrl} 
                          alt="الختم الرسمي" 
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform" 
                        />
                      </div>
                    </div>
                  )}
                  {data.teamImageUrl && (
                    <div className="w-full md:w-1/2 flex flex-col items-center group">
                      <p className="text-xs font-black text-emerald-500/80 mb-4 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">فريق العمل</p>
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        <img 
                          src={data.teamImageUrl} 
                          alt="فريق المنصة" 
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-full h-auto max-h-[200px] object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] to-transparent opacity-60" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}