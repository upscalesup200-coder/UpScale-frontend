"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import { 
  Loader2, Users, ShieldCheck, Palette, Headphones, 
  Target, Rocket, MonitorPlay, Smartphone, Monitor, 
  GraduationCap, Code2, Database, Cpu, Server, BrainCircuit
} from "lucide-react";
import dynamic from "next/dynamic";
import { Cairo } from "next/font/google"; 
import { getImageUrl } from "@/utils/imageHelper"; 

const cairo = Cairo({ 
  subsets: ["arabic"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  display: 'swap'
});

export default function AboutPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getAvatarImage = (gender: string) => {
    const isGirl = gender === 'girl' || gender === 'female';
    const color = "#cbd5e1"; 

    const maleSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="40" r="22" fill="${color}" />
        <path d="M50 66c-24 0-40 14-40 34h80c0-20-16-34-40-34z" fill="${color}" />
      </svg>
    `;
    
    const femaleSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="40" r="22" fill="${color}" />
        <path d="M50 66c-24 0-40 14-40 34h80c0-20-16-34-40-34z" fill="${color}" />
        <g transform="translate(62, 24) rotate(15)">
          <path d="M0 0 L-14 -10 L-10 10 Z" fill="#f472b6" />
          <path d="M0 0 L14 -10 L10 10 Z" fill="#f472b6" />
          <circle cx="0" cy="0" r="4" fill="#db2777" />
        </g>
      </svg>
    `;

    const svg = isGirl ? femaleSvg : maleSvg;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#060a14] flex flex-col items-center justify-center ${cairo.className}`}>
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-400 font-bold">جاري تحميل بيانات المنصة...</p>
      </div>
    );
  }

  const ownerImageUrl = data?.ownerImage ? (getImageUrl(data.ownerImage, 'settings') || data.ownerImage) : getAvatarImage('boy');

  return (
    <div className={`min-h-screen bg-[#060a14] text-white ${cairo.className}`} dir="rtl">
      <main className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-32 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 blur-[80px] -z-10 rounded-[4rem]" />
            
            <div className="bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group hover:border-blue-500/40 transition-colors duration-700">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] -mr-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
              
              <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"/>
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-400 font-bold mb-8 shadow-inner uppercase tracking-wider text-sm">
                  <Target size={18} /> هدفنا ورؤيتنا
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-10 text-white tracking-tight">
                  من <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-sm">نحن؟</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-300 leading-loose md:leading-[2.2] font-medium max-w-4xl mx-auto whitespace-pre-wrap relative z-10">
                  {data?.aboutPlatform || "منصة تعليمية متطورة تهدف إلى تقديم أفضل محتوى تعليمي للمتدربين، وربط الجانب الأكاديمي بمتطلبات سوق العمل الفعلي لتخريج كفاءات جاهزة للإبداع والتميز."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-32"
          >
            <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-3">
              <Rocket className="text-blue-500" size={32} /> المؤسس والمطور
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              
              <div className="col-span-1 flex flex-col bg-gradient-to-br from-[#0f172a] to-[#070b14] border border-blue-500/20 rounded-[2rem] p-8 items-center text-center shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 z-10" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#1e293b] shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-6 relative group-hover:border-blue-500/50 transition-colors duration-500 bg-[#060a14]">
                  <img 
                    src={ownerImageUrl} 
                    alt="المؤسس" 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!data?.ownerImage ? 'p-2' : ''}`}
                    onError={(e) => {
                      const fallback = getAvatarImage('boy');
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                        e.currentTarget.classList.add('p-2');
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 relative z-10">{data?.ownerName || "اسم المؤسس"}</h3>
                <p className="text-blue-400 font-bold mb-4 relative z-10">المؤسس والمطور الرئيسي</p>
                <div className="flex flex-wrap justify-center gap-2 mt-auto relative z-10">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">Software Engineer</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">AI Specialist</span>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-[#1e293b]/80 hover:border-blue-500/50 transition-all duration-300 shadow-lg relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-inner">
                  <BrainCircuit size={24} className="text-blue-400" />
                </div>
                <p className="text-slate-300 text-base md:text-lg leading-loose font-medium text-justify relative z-10">
                  مهندس تكنولوجيا معلومات متخصص في الذكاء الاصطناعي وتطوير الأنظمة الذكية، خريج الجامعة الافتراضية السورية. أجمع في مسيرتي المهنية بين الأساس الأكاديمي المتين والخبرة الهندسية العميقة في ابتكار وتصميم الحلول البرمجية المعقدة. أمتلك شغفاً حقيقياً بتسخير التكنولوجيا لحل المشكلات الواقعية، وتحديداً في قطاع تكنولوجيا التعليم (EdTech) وتطوير أنظمة الأعمال. أتميز بقدرتي على قيادة دورة حياة تطوير البرمجيات (SDLC) بالكامل، بدءاً من هندسة قواعد البيانات وتصميم معمارية النظام، وصولاً إلى بناء واجهات مستخدم تفاعلية وأنظمة حماية متقدمة.
                </p>
              </div>

              <div className="col-span-1 lg:col-span-2 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-[#1e293b]/80 hover:border-emerald-500/50 transition-all duration-300 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                    <MonitorPlay size={24} className="text-emerald-400" />
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-white leading-tight">1. هندسة وتطوير الويب الشامل (Full-Stack Development & EdTech)</h4>
                </div>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                  أقود عمليات تطوير منصات ويب متكاملة وقابلة للتوسع باستخدام أحدث التقنيات المعاصرة. وتُعد منصة التدريب الحالية (UpScale Training Hub) التي قمت ببنائها من الصفر باستخدام React/Next.js للواجهات الأمامية و NestJS و PostgreSQL للخلفية، تتويجاً لهذه الخبرة. حيث صممت معمارية النظام لتشمل:
                </p>
                <ul className="space-y-3 text-sm md:text-base text-slate-300 font-medium pr-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong className="text-white">أنظمة إدارة المحتوى والطلاب:</strong> معالجة آمنة لبيانات الطلاب، ومسارات تعليمية متعددة (مواد أكاديمية، معسكرات، ورشات عمل).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong className="text-white">بروتوكولات الأمان وحماية المحتوى الرقمي:</strong> تطوير أنظمة متقدمة لمنع القرصنة (Anti-Piracy)، تشمل تتبع عناوين IP المتعددة لمنع مشاركة الحسابات، ونظام دقيق لحساب الرصيد الزمني للمشاهدات، بالإضافة إلى التشفير العالي.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong className="text-white">أنظمة المراقبة الحية والامتحانات:</strong> بناء بيئات امتحانية مؤتمتة بالكامل، مزودة بأدوات مراقبة حية (Live Monitoring) لتتبع حالة اتصال الطلاب (Ping) ورصد محاولات الغش بشكل لحظي.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong className="text-white">الأنظمة المالية الافتراضية (Wallets):</strong> برمجة محافظ إلكترونية ونقاط مكافآت داخلية تدعم بوابات وحوالات الدفع المحلية بسلاسة وموثوقية.</span>
                  </li>
                </ul>
              </div>

              <div className="col-span-1 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-[#1e293b]/80 hover:border-purple-500/50 transition-all duration-300 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                    <Smartphone size={24} className="text-purple-400" />
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-black text-white leading-tight mb-4">2. تطوير تطبيقات الموبايل وأنظمة السوق الخليجي</h4>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed text-justify">
                  أمتلك خبرة عملية واسعة في تلبية متطلبات الأسواق سريعة النمو كالسوق السعودي، حيث قدتُ عمليات تطوير متكاملة لتطبيقات الموبايل باستخدام إطار العمل Flutter. شملت مشاريعي بناء تطبيقات توصيل لوجستية عالية الأداء (Delivery Apps) وأنظمة إدارة محتوى (CMS) مرنة تدعم آلاف المستخدمين، مع التركيز على تجربة المستخدم (UX) وسرعة الاستجابة.
                </p>
              </div>

              {/* المربع 4: الديسكتوب */}
              <div className="col-span-1 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-[#1e293b]/80 hover:border-orange-500/50 transition-all duration-300 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                    <Monitor size={24} className="text-orange-400" />
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-black text-white leading-tight mb-4">3. أنظمة سطح المكتب المتقدمة (Advanced Desktop Systems)</h4>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  على الصعيد البرمجي الكلاسيكي والمتقدم، صممت ونفذت أنظمة سطح مكتب ضخمة باستخدام C# وقواعد بيانات SQL Server. تضمنت هذه الأنظمة ابتكار منصات تدريبية متكاملة تحتوي على:
                </p>
                <ul className="space-y-2 text-sm md:text-base text-slate-300 font-medium list-disc list-inside pr-2 marker:text-orange-500">
                  <li>إدارة المهام والوظائف الأكاديمية.</li>
                  <li>بيئات برمجية تنافسية (Competitive Programming Environments) لتقييم أداء المتدربين.</li>
                  <li>أنظمة تقييم وفوترة داخلية تعتمد على بنية برمجية صلبة.</li>
                </ul>
              </div>

              <div className="col-span-1 lg:col-span-2 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-[#1e293b]/80 hover:border-pink-500/50 transition-all duration-300 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-inner">
                    <GraduationCap size={24} className="text-pink-400" />
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-white leading-tight">4. الخبرة الأكاديمية والقيادة التعليمية</h4>
                </div>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                  تمتد خبرتي لأكثر من 5 سنوات كمدرب ومحاضر تقني معتمد، تخصصت خلالها في بناء وتأهيل العقول البرمجية الشابة (وخاصة طلاب الجامعة الافتراضية السورية). شملت رحلتي الأكاديمية:
                </p>
                <ul className="space-y-3 text-sm md:text-base text-slate-300 font-medium pr-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 shrink-0" />
                    <span>تدريس سلسلة مقررات البرمجة الأساسية والمتقدمة (Programming I to IV).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 shrink-0" />
                    <span>شرح وتدريس هياكل البيانات والخوارزميات (Data Structures & Algorithms) بأسلوب يربط النظرية الأكاديمية بالتطبيق العملي.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 shrink-0" />
                    <span>تأسيس بيئة تعليمية تسد الفجوة بين المناهج الجامعية والمتطلبات الحقيقية لسوق العمل البرمجي.</span>
                  </li>
                </ul>
              </div>

              <div className="col-span-1 lg:col-span-3 bg-gradient-to-r from-[#0f172a] to-[#1e293b] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group mt-4">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                
                <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-white/10 pb-6">
                  <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                    <Code2 className="text-yellow-500" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white">الترسانة التقنية</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  <div>
                    <h5 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Cpu size={16} className="text-blue-400"/> لغات البرمجة</h5>
                    <div className="flex flex-wrap gap-2">
                      {['C++', 'C#', 'Python', 'JavaScript/TypeScript', 'PHP'].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-[#060a14] border border-white/10 rounded-lg text-sm font-mono text-blue-200 shadow-sm">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><MonitorPlay size={16} className="text-emerald-400"/> إطارات الواجهات والموبايل</h5>
                    <div className="flex flex-wrap gap-2">
                      {['React.js', 'Next.js', 'Flutter'].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-[#060a14] border border-white/10 rounded-lg text-sm font-mono text-emerald-200 shadow-sm">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Server size={16} className="text-orange-400"/> الباك إند وقواعد البيانات</h5>
                    <div className="flex flex-wrap gap-2">
                      {['Nest.js', 'Node.js', 'PostgreSQL', 'SQL Server'].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-[#060a14] border border-white/10 rounded-lg text-sm font-mono text-orange-200 shadow-sm">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-purple-400"/> المهارات الهندسية</h5>
                    <div className="flex flex-wrap gap-2">
                      {['System Design', 'Security & DRM', 'AI Solutions', 'Cloud Servers Management'].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-[#060a14] border border-white/10 rounded-lg text-[13px] font-mono text-purple-200 shadow-sm">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-3">
              <Users className="text-emerald-500" size={32} /> فريق العمل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                  <img src={getAvatarImage(data?.teamDesignAvatar || 'boy')} alt="التصميم" className="w-full h-full object-cover p-2" />
                </div>
                <Palette size={20} className="text-blue-400 mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">{data?.teamDesignName || "مجهول"}</h3>
                <p className="text-sm text-gray-400">قسم التصميم والواجهات</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                  <img src={getAvatarImage(data?.teamManageAvatar || 'boy')} alt="الإدارة" className="w-full h-full object-cover p-2" />
                </div>
                <Users size={20} className="text-emerald-400 mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">{data?.teamManageName || "مجهول"}</h3>
                <p className="text-sm text-gray-400">الإدارة العامة</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                  <img src={getAvatarImage(data?.teamSecurityAvatar || 'boy')} alt="الحماية" className="w-full h-full object-cover p-2" />
                </div>
                <ShieldCheck size={20} className="text-red-400 mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">{data?.teamSecurityName || "مجهول"}</h3>
                <p className="text-sm text-gray-400">الأمن السيبراني</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                  <img src={getAvatarImage(data?.teamSupportAvatar || 'girl')} alt="الدعم" className="w-full h-full object-cover p-2" />
                </div>
                <Headphones size={20} className="text-orange-400 mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">{data?.teamSupportName || "مجهول"}</h3>
                <p className="text-sm text-gray-400">خدمة العملاء والدعم</p>
              </div>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}