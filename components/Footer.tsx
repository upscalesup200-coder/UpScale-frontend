"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 1. استيراد usePathname
import { API_BASE_URL } from "@/config/api";
import { Mail, MapPin, Phone, ArrowLeft, Facebook, Instagram, Send, MessageCircle } from "lucide-react"; 

export default function Footer() {
  const pathname = usePathname(); // 👈 2. جلب المسار الحالي

  const [footerData, setFooterData] = useState({
    platformName: "Up Scale Training Hub",
    footerDescription: "منصتك الأولى للتعلم والتطور المهني. نحن نجمع بين التعليم الأكاديمي ومتطلبات سوق العمل لنصنع مستقبلاً أفضل.",
    contactEmail: "support@upscale.com",
    contactPhone: "0985364635",
    footerLogoUrl: "",
    socialFacebook: "",
    socialInstagram: "",
    socialTelegram: "",
    socialWhatsapp: ""
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`, {
        next: { revalidate: 3600 } 
    })
      .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch settings");
          return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setFooterData((prev) => ({
            platformName: data.platformName || prev.platformName,
            footerDescription: data.footerDescription || prev.footerDescription,
            contactEmail: data.contactEmail || prev.contactEmail,
            contactPhone: data.contactPhone || prev.contactPhone,
            footerLogoUrl: data.footerLogoUrl || "",
            socialFacebook: data.socialFacebook || "",
            socialInstagram: data.socialInstagram || "",
            socialTelegram: data.socialTelegram || "",
            socialWhatsapp: data.socialWhatsapp || ""
          }));
        }
      })
      .catch((err) => console.warn("Using default footer settings (network or server error)."));
  }, []);

  // 👈 3. الشرط السحري: إذا ما كنا بالصفحة الرئيسية، الفوتر ما رح ينعرض أبداً
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="relative bg-[#060a14] pt-32 pb-12 overflow-hidden z-40">
      
      {/* 🌊 تأثيرات الإضاءة الخلفية */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* 🌊 التموجات الاحترافية (Layered SVG Waves) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[120px]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-[#0f172a]"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-[#0f172a]"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f172a]"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* 🌟 القسم الأول: الشعار، الوصف، والسوشيال ميديا */}
          <div className="col-span-1 md:col-span-5 flex flex-col items-start text-right">
            
            <div className="max-w-md w-full flex flex-col items-center">
              {footerData.footerLogoUrl ? (
                <img 
                  src={footerData.footerLogoUrl} 
                  alt={footerData.platformName} 
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="max-w-[220px] h-auto object-contain mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] translate-x-4"
                />
              ) : (
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 drop-shadow-sm text-center translate-x-4">
                  {footerData.platformName}
                </h2>
              )}
              
              <p className="text-slate-400 leading-relaxed font-medium mb-8 w-full text-right">
                {footerData.footerDescription}
              </p>
            </div>

            {/* ✅ أزرار التواصل الاجتماعي */}
            <div className="flex items-center gap-3">
              {footerData.socialFacebook && (
                <a href={footerData.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] text-slate-400 hover:text-white transition-all shadow-lg">
                  <Facebook size={18} />
                </a>
              )}
              {footerData.socialInstagram && (
                <a href={footerData.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="انستغرام" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F56040] hover:border-transparent text-slate-400 hover:text-white transition-all shadow-lg">
                  <Instagram size={18} />
                </a>
              )}
              {footerData.socialTelegram && (
                <a href={footerData.socialTelegram} target="_blank" rel="noopener noreferrer" aria-label="تيليجرام" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:border-[#0088cc] text-slate-400 hover:text-white transition-all shadow-lg pl-1">
                  <Send size={18} />
                </a>
              )}
              {footerData.socialWhatsapp && (
                <a href={footerData.socialWhatsapp} target="_blank" rel="noopener noreferrer" aria-label="واتساب" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] text-slate-400 hover:text-white transition-all shadow-lg">
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          {/* 🌟 القسم الثاني: روابط سريعة */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col md:pl-8">
            <h3 className="text-white font-black text-xl mb-6 relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-l from-blue-500 to-transparent rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-slate-400 font-medium">
              {[
                { name: "الأكثر طلباً", link: "/#popular" },
                { name: "لوحة الشرف", link: "/leaderboard" },
                { name: "المواد الأكاديمية", link: "/courses" },
                { name: "الورشات التدريبية", link: "/workshops" },
                { name: "المعسكرات (Bootcamps)", link: "/bootcamps" },
                { name: "المحتوى المجاني", link: "/free-content" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.link} className="group flex items-center gap-2 hover:text-blue-400 transition-colors w-max">
                    <ArrowLeft size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 🌟 القسم الثالث: معلومات التواصل */}
          <div className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col">
            <h3 className="text-white font-black text-xl mb-6 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-l from-emerald-500 to-transparent rounded-full"></span>
            </h3>
            <ul className="space-y-6 text-slate-400 font-medium text-right">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col pt-1.5" dir="ltr">
                  <span className="text-xs text-slate-500 mb-0.5 text-right font-bold uppercase tracking-wider">البريد الإلكتروني</span>
                  <span className="text-sm text-white group-hover:text-blue-300 transition-colors text-right">{footerData.contactEmail}</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-pink-500/20 group-hover:border-pink-500/30 group-hover:text-pink-400 transition-all">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col pt-1.5" dir="ltr">
                  <span className="text-xs text-slate-500 mb-0.5 text-right font-bold uppercase tracking-wider">رقم الهاتف</span>
                  <span className="text-sm text-white font-mono group-hover:text-pink-300 transition-colors text-right">{footerData.contactPhone}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* 🌟 القسم السفلي: الحقوق */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium text-center md:text-right">
            © {new Date().getFullYear()} <span className="text-white font-bold">{footerData.platformName}</span>. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}