"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  FileText, Loader2, ArrowRight, AlertTriangle, 
  UserCheck, Wallet, Shield, MessageSquare, Gavel, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function TermsPage() {
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
        if (!res.ok) throw new Error("فشل الاتصال بالسيرفر");
        return res.json();
      })
      .then((resData) => {
        if (resData && !resData.error) {
          setData({
            content: resData.termsContent || "لم يتم إضافة شروط الاستخدام بعد من قبل الإدارة.",
            teamImageUrl: resData.teamImageUrl || "",
            stampImageUrl: resData.stampImageUrl || "",
            platformName: resData.platformName || "Up Scale Training Hub"
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching terms:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // ==========================================
  // 🧠 دالة التحليل الذكي (Smart Text Parser) مخصصة للشروط
  // ==========================================
  const parseTermsContent = (text: string) => {
    if (!text.includes("1.")) return { intro: text, sections: [] };

    const parts = text.split(/(?=\d+\.\s)/);
    let intro = parts[0].trim();
    
    // إزالة كلمة "مقدمة:" إذا كانت موجودة لترتيب الشكل
    if (intro.startsWith("مقدمة:")) {
      intro = intro.replace("مقدمة:", "").trim();
    }
    
    const sections = parts.slice(1).map((part) => {
      const lines = part.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const title = lines[0].replace(/^\d+\.\s*/, '');
      const items = lines.slice(1);
      return { title, items };
    });

    return { intro, sections };
  };

  const parsedContent = parseTermsContent(data.content);

  // تعيين أيقونة محددة لكل قسم حسب معناه
  const getSectionIcon = (index: number) => {
    const icons = [UserCheck, Wallet, Shield, MessageSquare, Gavel];
    const IconComponent = icons[index % icons.length];
    return <IconComponent size={24} className="text-blue-400" />;
  };

  // تنسيق النص الذي يحتوي على نقطتين (:) لتمييز العنوان الفرعي
  const renderItemText = (itemText: string) => {
    const parts = itemText.split(/:(.+)/); // تقسيم عند أول نقطتين فقط
    if (parts.length > 1) {
      return (
        <span>
          <strong className="text-blue-400 font-black">{parts[0]}:</strong>
          <span className="text-slate-300 ml-1">{parts[1]}</span>
        </span>
      );
    }
    return <span className="text-slate-300">{itemText}</span>;
  };

  // إعدادات الحركة (Framer Motion)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans selection:bg-blue-500/30 flex flex-col" dir="rtl">
      
      {/* 🌟 هيدر الصفحة المطور */}
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-[#060a14] z-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
        
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors font-medium">
            <ArrowRight size={18} /> العودة للرئيسية
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mt-2">
              شروط <span className="text-blue-400 drop-shadow-sm">الاستخدام</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium mt-4 leading-relaxed">
            القواعد والضوابط التي تنظم استخدامك لمنصة {data.platformName}. قراءتك وموافقتك عليها تضمن لك تجربة تعليمية آمنة وموثوقة.
          </motion.p>
        </div>
      </div>

      {/* 🌟 محتوى الصفحة */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 flex-grow relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-blue-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold text-lg">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-xl">
               <AlertTriangle size={48} className="text-red-500 mb-4 opacity-80" />
               <h3 className="text-2xl font-black text-white mb-2">عذراً، حدث خطأ في الاتصال</h3>
               <p className="text-slate-400 mb-8 max-w-md leading-relaxed">لم نتمكن من جلب شروط الاستخدام. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.</p>
               <button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                 إعادة المحاولة
               </button>
            </div>
          ) : (
            <>
              {/* المقدمة */}
              {parsedContent.intro && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-l from-blue-500/10 to-[#0f172a]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl p-8 mb-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500 rounded-r-[2rem]" />
                  <h3 className="text-blue-400 font-black text-xl mb-3">مقدمة:</h3>
                  <p className="text-slate-300 text-lg font-medium leading-relaxed">
                    {parsedContent.intro}
                  </p>
                </motion.div>
              )}

              {/* الكروت (الأقسام) */}
              {parsedContent.sections.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 md:gap-8">
                  {parsedContent.sections.map((section, index) => (
                    <motion.div 
                      key={index} 
                      variants={itemVariants}
                      className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/80 backdrop-blur-md rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all duration-500 shadow-lg p-6 md:p-8 relative overflow-hidden"
                    >
                      <div className="hidden md:block absolute top-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors duration-500" />
                      
                      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#060a14] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500">
                          {getSectionIcon(index)}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white">{section.title}</h2>
                      </div>

                      {section.items.length > 0 ? (
                        <ul className="space-y-5">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                              <CheckCircle2 size={20} className="text-blue-500/70 mt-0.5 shrink-0" />
                              <div className="text-sm md:text-base leading-relaxed font-medium">
                                {renderItemText(item)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400">لا توجد تفاصيل إضافية في هذا القسم.</p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl p-8 text-slate-300 text-lg leading-loose whitespace-pre-wrap">
                  {data.content}
                </div>
              )}

              {/* قسم الصور (الختم والفريق) */}
              {(data.teamImageUrl || data.stampImageUrl) && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-10">
                  {data.stampImageUrl && (
                    <div className="w-full md:w-1/2 flex flex-col items-center group">
                      <p className="text-xs font-black text-blue-400 mb-4 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">الاعتماد الرسمي</p>
                      <div className="relative p-4 rounded-3xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-colors shadow-lg">
                        <img 
                          src={data.stampImageUrl} 
                          alt="الختم الرسمي" 
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-36 h-36 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform" 
                        />
                      </div>
                    </div>
                  )}
                  {data.teamImageUrl && (
                    <div className="w-full md:w-1/2 flex flex-col items-center group">
                      <p className="text-xs font-black text-blue-400 mb-4 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">فريق العمل</p>
                      <div className="relative overflow-hidden rounded-3xl border border-white/10 group-hover:border-blue-500/30 transition-colors shadow-lg">
                        <img 
                          src={data.teamImageUrl} 
                          alt="فريق المنصة" 
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-full h-auto max-h-[220px] object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-transparent opacity-80" />
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