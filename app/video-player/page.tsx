"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ChevronRight, Maximize, Minimize, Play } from "lucide-react";

function FullScreenVideoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const otp = searchParams.get("otp");
  const playbackInfo = searchParams.get("playbackInfo");

  const [isDesktopApp, setIsDesktopApp] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDesktopApp(!!(window as any).isUpScaleApp);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch(err => {
        console.error("خطأ في تشغيل وضع ملء الشاشة:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (isDesktopApp === null) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#060a14] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
      </div>
    );
  }

  if (isDesktopApp === false) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-[#0f172a] items-center justify-center text-center p-6" dir="rtl">
        <ShieldAlert size={64} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-black text-white mb-2">وصول غير مصرح به</h2>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed">
          هذه القاعة الدراسية محمية ولا يمكن الوصول إليها إلا من خلال تطبيق سطح المكتب الخاص بالمنصة. يرجى تسجيل الدخول عبر التطبيق.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#060a14] overflow-hidden font-sans" dir="rtl">
      {/* هيدر الفيديو للعودة للوحة التحكم */}
      <div className="h-16 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 flex items-center px-6 shadow-sm shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
          <ChevronRight size={18} className="rtl:rotate-180" /> العودة للوحة التحكم
        </button>
      </div>

      {/* مساحة عرض الفيديو الكاملة */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden p-4 md:p-8">
        {otp && playbackInfo ? (
          <div 
            ref={videoContainerRef}
            className={`w-full h-full max-w-6xl mx-auto relative group shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black ${isFullscreen ? 'max-w-none rounded-none border-none' : 'rounded-[2rem] overflow-hidden'}`}
          >
             <button 
               onClick={toggleFullScreen} 
               className={`absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-lg backdrop-blur-sm border border-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isFullscreen ? 'opacity-100' : ''}`}
               title={isFullscreen ? "تصغير الشاشة" : "ملء الشاشة"}
             >
               {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
             </button>

             <iframe
               src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
               style={{ border: 0, width: "100%", height: "100%" }}
               allow="encrypted-media"
               allowFullScreen
               title="Secure Player"
             ></iframe>
          </div>
        ) : (
          <div className="text-center bg-[#0f172a] border border-white/5 p-12 rounded-[2.5rem] shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play size={32} className="translate-x-[-2px]"/>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">استوديو التعلم</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              يرجى تحديد مقطع فيديو لمشاهدته.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoPlayerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[100dvh] w-full bg-[#060a14] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
      </div>
    }>
      <FullScreenVideoContent />
    </Suspense>
  );
}