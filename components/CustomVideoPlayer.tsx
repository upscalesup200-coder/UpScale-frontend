"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import screenfull from "screenfull";
import Hls from "hls.js"; 
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipForward, SkipBack, Settings, Loader2, Check, AlertCircle, Clock, ShieldCheck 
} from "lucide-react";

const getHlsLink = (mp4Url: string) => {
  if (!mp4Url || !mp4Url.includes("cloudinary.com") || mp4Url.includes(".m3u8")) return mp4Url;
  let hlsUrl = mp4Url.replace("/upload/", "/upload/sp_auto/");
  hlsUrl = hlsUrl.replace(".mp4", ".m3u8");
  return hlsUrl;
};

interface CustomVideoPlayerProps {
  src?: string;
  poster?: string;
  onCompleted?: () => void;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  email?: string;
  isPaid?: boolean;
  vdoOtp?: string;
  vdoPlaybackInfo?: string;
  contentId?: string;
  allowedSeconds?: number;
  consumedSeconds?: number;
  onHeartbeat?: (contentId: string, seconds: number, speed: number) => void;
}

export default function CustomVideoPlayer({ 
  src = "", 
  poster, 
  onCompleted,
  firstName,
  lastName,
  username,
  phone,
  email,
  isPaid = false,
  vdoOtp,
  vdoPlaybackInfo,
  contentId,
  allowedSeconds = 0,
  consumedSeconds = 0,
  onHeartbeat
}: CustomVideoPlayerProps) {
  const originalSrc = src;
  const hlsSrc = getHlsLink(src);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vdoIframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🌟 حفظ نسخة من المشغل للتحكم به من خارج الـ useEffect
  const vdoPlayerInstanceRef = useRef<any>(null);

  const onCompletedRef = useRef(onCompleted);
  const onHeartbeatRef = useRef(onHeartbeat);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onHeartbeatRef.current = onHeartbeat;
  }, [onCompleted, onHeartbeat]);

  const watermarkRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0); 
  const pos = useRef({ x: 50, y: 50 }); 
  const speedRef = useRef({ dx: 0.5, dy: 0.5 }); 

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(true); 
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [qualities, setQualities] = useState<{height: number, levelIndex: number}[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const remainingSeconds = Math.max(0, allowedSeconds - consumedSeconds);
  const remMins = Math.floor(remainingSeconds / 60);
  const remSecs = Math.floor(remainingSeconds % 60);
  const formattedRemaining = `${remMins}:${remSecs < 10 ? '0' : ''}${remSecs}`;

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const watermarkText = [fullName, username, phone, email].filter(Boolean).join("  •  ");

  // 🛑 نظام المراقبة: التفاعل مع زر الهروب (ESC) والخروج من ملء الشاشة
  useEffect(() => {
    setFullscreenSupported(screenfull.isEnabled);
    
    if (screenfull.isEnabled) {
      const handleFullscreenChange = () => {
        const isFull = screenfull.isFullscreen;
        setIsFullscreen(isFull);
        
        // 🛑 إذا خرج الطالب من ملء الشاشة، نوقف الفيديو فوراً!
        if (!isFull) {
          if (isPaid && vdoPlayerInstanceRef.current) {
            vdoPlayerInstanceRef.current.video.pause();
          } else if (!isPaid && videoRef.current) {
            videoRef.current.pause();
            setPlaying(false);
          }
        }
      };
      
      screenfull.on('change', handleFullscreenChange);
      return () => screenfull.off('change', handleFullscreenChange);
    }
  }, [isPaid]);

const forceFullscreenAndPlay = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (screenfull.isEnabled) {
      try {
        const targetElement = (isPaid && vdoIframeRef.current) ? vdoIframeRef.current : containerRef.current;
        
        if (targetElement) {
            // ✅ إضافة catch هنا لمنع انهيار الـ Promise
            await screenfull.request(targetElement).catch(err => {
                console.warn("Fullscreen request denied", err);
            });
        }
        
        // 🚀 زيادة التأخير قليلاً لضمان استقرار الواجهة
        setTimeout(async () => {
          try {
            if (isPaid && vdoPlayerInstanceRef.current) {
              await vdoPlayerInstanceRef.current.video.play();
            } else if (!isPaid && videoRef.current) {
              // ✅ إضافة catch لعملية التشغيل أيضاً
              await videoRef.current.play().catch(e => console.error("Play failed", e));
              setPlaying(true);
            }
          } catch (playErr) {
            console.error("Play operation failed", playErr);
          } 
        }, 300); // زيادة الوقت لـ 300ms
      } catch (err) {
        console.error("فشل التكبير التلقائي", err);
      }
    }
  }, [isPaid]);

  // تتبع النبضات
  useEffect(() => {
    if (isPaid || !playing || !contentId) return;
    const interval = setInterval(() => {
      if (onHeartbeatRef.current) onHeartbeatRef.current(contentId, 10, playbackRate);
    }, 10000);
    return () => clearInterval(interval);
  }, [playing, playbackRate, isPaid, contentId]);

  // تهيئة VdoCipher
  useEffect(() => {
    if (!isPaid || !vdoOtp || !vdoPlaybackInfo || !contentId) return;

    let heartbeatInterval: NodeJS.Timeout;
    const iframe = vdoIframeRef.current;

    const initVdoPlayer = () => {
      if (!iframe || !(window as any).VdoPlayer) return;

      try {
        let player = (window as any).VdoPlayer.getInstance(iframe);

        if (!player) {
          player = new (window as any).VdoPlayer(iframe);
        }
        
        // حفظ النسخة لنتمكن من إيقافها خارجياً
        vdoPlayerInstanceRef.current = player;

        if ((iframe as any)._isEventsAdded) return;
        (iframe as any)._isEventsAdded = true;
        
        let isVdoPlaying = false;
        let vdoCurrentSpeed = 1;

        player.video.addEventListener("play", () => { 
          isVdoPlaying = true; 
        });

        player.video.addEventListener("pause", () => { isVdoPlaying = false; });
        player.video.addEventListener("ratechange", () => { vdoCurrentSpeed = player.video.playbackRate; });
        player.video.addEventListener("ended", () => { 
           if (onCompletedRef.current) onCompletedRef.current(); 
        });

        heartbeatInterval = setInterval(() => {
          if (isVdoPlaying && contentId && onHeartbeatRef.current) {
             onHeartbeatRef.current(contentId, 10, vdoCurrentSpeed);
          }
        }, 10000);
      } catch (e) {
        console.error("VdoPlayer Init Fail:", e);
      }
    };

    if (!(window as any).VdoPlayer) {
      let script = document.querySelector('script[src="https://player.vdocipher.com/v2/api.js"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.src = "https://player.vdocipher.com/v2/api.js";
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', initVdoPlayer);
    } else {
      setTimeout(initVdoPlayer, 100);
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      const script = document.querySelector('script[src="https://player.vdocipher.com/v2/api.js"]');
      if (script) script.removeEventListener('load', initVdoPlayer);
      if (iframe) (iframe as any)._isEventsAdded = false;
    };
  }, [isPaid, vdoOtp, vdoPlaybackInfo, contentId]); 

  const animateWatermark = useCallback(() => {
    if (!containerRef.current || !watermarkRef.current || isPaid) return; 

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const watermarkW = watermarkRef.current.clientWidth;
    const watermarkH = watermarkRef.current.clientHeight;

    let { x, y } = pos.current;
    let { dx, dy } = speedRef.current;

    x += dx; y += dy;

    if (x <= 0) { x = 0; dx = Math.abs(dx); } 
    else if (x + watermarkW >= containerW) { x = Math.max(0, containerW - watermarkW); dx = -Math.abs(dx); }

    if (y <= 0) { y = 0; dy = Math.abs(dy); } 
    else if (y + watermarkH >= containerH) { y = Math.max(0, containerH - watermarkH); dy = -Math.abs(dy); }

    pos.current = { x, y };
    speedRef.current = { dx, dy };

    watermarkRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestRef.current = requestAnimationFrame(animateWatermark);
  }, [isPaid]);

  useEffect(() => {
    if (!isPaid && !hasError && !isProcessing && watermarkText) {
        requestRef.current = requestAnimationFrame(animateWatermark);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animateWatermark, hasError, isProcessing, watermarkText, isPaid]);

  useEffect(() => {
    if (isPaid) return; 

    let hls: Hls;
    const video = videoRef.current;
    if (!video) return;

    const isM3u8 = hlsSrc.includes('.m3u8');

    setHasError(false);
    setIsProcessing(false);
    setIsBuffering(true);
    setPlaying(false); 
    setCurrentQualityIndex(-1);
    setQualities([]); 

    if (Hls.isSupported() && isM3u8) {
      hls = new Hls({ autoStartLoad: true, startLevel: -1, capLevelToPlayerSize: true });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const rawQualities = data.levels.map((l, index) => ({ height: l.height, levelIndex: index })).filter((q) => q.height && q.height > 0); 
        const uniqueQualities: {height: number, levelIndex: number}[] = [];
        const seenHeights = new Set();
        rawQualities.sort((a, b) => b.height - a.height);

        for (const q of rawQualities) {
            if (!seenHeights.has(q.height)) { uniqueQualities.push(q); seenHeights.add(q.height); }
        }
        setQualities(uniqueQualities);
        setIsBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.response && (data.response.code === 404 || data.response.code === 403)) { hls.destroy(); setIsBuffering(false); setIsProcessing(true); } 
              else { hls.startLoad(); }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError(); break;
            default:
              hls.destroy(); setIsBuffering(false); setHasError(true); break;
          }
        }
      });
      hlsRef.current = hls;

    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isM3u8) {
      video.src = hlsSrc;
      video.addEventListener('loadedmetadata', () => setIsBuffering(false));
      video.addEventListener('error', () => { setIsBuffering(false); setHasError(true); });
    } else {
      video.src = originalSrc;
    }

    return () => { if (hls) hls.destroy(); };
  }, [hlsSrc, originalSrc, isPaid]); 

  const handleMouseMove = () => {
    if (isPaid || !isFullscreen) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => { setShowControls(false); setShowSettings(false); }, 3000);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current || hasError || isProcessing || isPaid) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
    setShowSettings(false);
  };

  const handleTimeUpdate = () => { if (videoRef.current && !isSeeking) setCurrentTime(videoRef.current.currentTime); };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (Number.isFinite(d)) setDuration(d);
      setIsBuffering(false);
      setHasError(false);
    }
  };
  const handleWaiting = () => setIsBuffering(true);
  const handlePlaying = () => { setIsBuffering(false); setPlaying(true); };
  const handleError = () => { setIsBuffering(false); if(!isProcessing) setHasError(true); };
  const handleEnded = () => { setPlaying(false); setShowControls(true); if (onCompletedRef.current) onCompletedRef.current(); };
  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentTime(parseFloat(e.target.value));
  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isFinite(val) && videoRef.current) videoRef.current.currentTime = val;
    setIsSeeking(false);
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; }
    setMuted(val === 0);
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (!newMuted && volume === 0) { setVolume(0.5); videoRef.current.volume = 0.5; }
  };
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSettings(false);
  };
  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = levelIndex; setCurrentQualityIndex(levelIndex); setShowSettings(false); }
  };
  const toggleFullscreen = () => {
    if (screenfull.isEnabled && containerRef.current) screenfull.toggle(containerRef.current);
    setShowSettings(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !Number.isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
const handleOpenDesktop = () => {
  // 1. جلب التوكن باستخدام الاسم الصحيح اللي لقيناه
  const token = localStorage.getItem('upscale_auth_token'); 
  
  if (token && contentId) {
    // 2. بناء الرابط العميق (Deep Link)
    const deepLink = `upscale://${token}/${contentId}`;
    
    // 3. فتح تطبيق الديسكتوب
    window.location.href = deepLink;
  } else {
    // تنبيه في حال كان المستخدم غير مسجل دخول
    alert("يرجى التأكد من تسجيل الدخول لمشاهدة المحتوى بأمان");
  }
};

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group border border-white/10 shadow-2xl select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && !showSettings && setShowControls(false)}
      onClick={() => setShowSettings(false)}
      onDoubleClick={isPaid ? undefined : toggleFullscreen}
      dir="ltr"
    >
      {/* 🔒 طبقة الحظر والإجبار على ملء الشاشة */}
      {!isFullscreen && fullscreenSupported && !hasError && !isProcessing && (
        <div 
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer group"
          onClick={forceFullscreenAndPlay}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-purple-600/90 group-hover:bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-transform group-hover:scale-110 mb-4 md:mb-6">
            <Maximize size={40} fill="white" className="text-white" />
          </div>
          <h3 className="text-white font-bold text-lg md:text-2xl mb-2 drop-shadow-lg">يجب تكبير الشاشة للمشاهدة</h3>
          <p className="text-gray-300 text-xs md:text-sm max-w-md text-center leading-relaxed px-4">
            لضمان الحماية وأفضل تجربة، لا يمكن تشغيل هذا المقطع أو التحكم به إلا في وضع ملء الشاشة.
            <br/>
            <span className="text-purple-400 font-bold mt-2 inline-block">انقر هنا للبدء</span>
          </p>
        </div>
      )}
      
      {isPaid ? (
        <div className="relative w-full h-full">
          {/* 👇 زر الفتح في الديسكتوب الأنيق والمتجاوب */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50">
            <button 
              onClick={handleOpenDesktop}
              dir="rtl"
              className="flex items-center gap-1.5 md:gap-2 bg-purple-600/95 hover:bg-purple-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold shadow-lg transition-all active:scale-95 text-[10px] sm:text-xs md:text-sm backdrop-blur-sm border border-purple-400/30"
            >
              <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" />
              <span>المشاهدة عبر تطبيق الديسكتوب</span>
            </button>
          </div>

          {vdoOtp && vdoPlaybackInfo ? (
            <iframe
              ref={vdoIframeRef}
              id={`vdo-iframe-${contentId}`}
              title="مشغل فيديو VdoCipher"
              src={`https://player.vdocipher.com/v2/?otp=${vdoOtp}&playbackInfo=${vdoPlaybackInfo}`}
              className="w-full h-full border-0"
              allow="encrypted-media; autoplay; fullscreen"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
               <ShieldCheck size={48} className="text-purple-500 mb-4 animate-pulse" />
               <p className="text-white font-bold">جاري تأمين الفيديو...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            poster={poster}
            className="w-full h-full object-contain pointer-events-none" 
            controlsList="nodownload"
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            onEnded={handleEnded}
            onError={handleError}
            playsInline
          />

          {!hasError && !isProcessing && watermarkText && (
            <div ref={watermarkRef} className="absolute top-0 left-0 pointer-events-none z-10" style={{ willChange: 'transform' }}>
              <div className="text-white/40 text-xs sm:text-sm md:text-base font-mono font-bold whitespace-nowrap select-none drop-shadow-md" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }} dir="ltr">
                {watermarkText}
              </div>
            </div>
          )}

          {(hasError || isProcessing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-sm z-20 text-center p-6 animate-in fade-in duration-500">
                {isProcessing ? (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                            <Clock size={56} className="text-amber-500 animate-pulse relative z-10" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-3 drop-shadow-md">الفيديو قيد المعالجة ⏳</h3>
                        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                            لقد تم رفع الفيديو بنجاح، لكن سيرفرات البث تحتاج لبعض الوقت...
                        </p>
                        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all active:scale-95">
                            تحديث الصفحة الآن
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle size={56} className="text-red-500 mb-4" />
                        <h3 className="text-white font-bold text-xl mb-2">عذراً، الفيديو غير متاح</h3>
                        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                            حدث خطأ أثناء محاولة تشغيل هذا الفيديو...
                        </p>
                    </>
                )}
            </div>
          )}

          {isBuffering && !hasError && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-20">
              <Loader2 className="animate-spin text-purple-500" size={50} />
            </div>
          )}

          {/* زر التشغيل العادي */}
          {!playing && !isBuffering && !hasError && !isProcessing && (isFullscreen || !fullscreenSupported) && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 hover:bg-black/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
              role="button"
              tabIndex={0}
              aria-label="تشغيل الفيديو"
            >
              <div className="w-20 h-20 bg-purple-600/90 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/40 transition-transform hover:scale-110">
                <Play size={32} fill="white" className="ml-1 text-white" />
              </div>
            </div>
          )}

          {/* شريط التحكم السفلي */}
          {!hasError && !isProcessing && (isFullscreen || !fullscreenSupported) && (
          <div 
            className={`
              absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-20 transition-all duration-300 z-30
              ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="group/slider relative w-full cursor-pointer mb-4 flex items-center h-4">
               <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 transition-all duration-100 ease-out" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
               </div>
               <input 
                 type="range" 
                 min={0} 
                 max={Number.isFinite(duration) && duration > 0 ? duration : 0.0001} 
                 step="any" 
                 value={currentTime} 
                 onMouseDown={handleSeekStart} 
                 onTouchStart={handleSeekStart} 
                 onChange={handleSeekChange} 
                 onMouseUp={handleSeekEnd} 
                 onTouchEnd={handleSeekEnd} 
                 disabled={!duration || duration === 0} 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 disabled:cursor-not-allowed"
                 aria-label="شريط تقدم الفيديو" 
               />
            </div>

            <div className="flex items-center justify-between text-white relative">
              <div className="flex items-center gap-4">
                <button onClick={handlePlayPause} className="hover:text-purple-400 transition-colors" aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}> 
                  {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-purple-400" aria-label="رجوع 10 ثواني">
                        <SkipBack size={20} />
                    </button>
                    <button onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-purple-400" aria-label="تقديم 10 ثواني">
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="relative group/volume flex items-center justify-center">
                  <button onClick={toggleMute} className="hover:text-purple-400 p-2" aria-label={muted || volume === 0 ? "إلغاء كتم الصوت" : "كتم الصوت"}>
                    {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-24 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 hidden group-hover/volume:flex items-center justify-center animate-in fade-in slide-in-from-bottom-2">
                      <div className="relative w-1.5 h-20 bg-white/20 rounded-full">
                          <div className="absolute bottom-0 left-0 w-full bg-purple-500 rounded-full transition-all" style={{ height: `${muted ? 0 : volume * 100}%` }} />
                          <input 
                            type="range" 
                            min={0} 
                            max={1} 
                            step={0.1} 
                            value={muted ? 0 : volume} 
                            onChange={handleVolumeChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer -rotate-90 origin-center" 
                            style={{ width: '80px', height: '6px', left: '-37px', top: '37px' }} 
                            aria-label="مستوى الصوت" 
                          />
                      </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-gray-300 ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className={`hover:text-purple-400 transition-colors p-2 ${showSettings ? 'text-purple-400 rotate-45' : ''}`} aria-label="إعدادات الفيديو">
                        <Settings size={20} />
                    </button>

                    {showSettings && (
                        <div className="absolute bottom-full right-0 mb-4 bg-[#1e293b] border border-white/10 rounded-xl p-3 min-w-[200px] shadow-2xl z-[100]" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-3">
                                <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider text-right">السرعة</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-2 py-1.5 rounded text-xs font-bold transition-all border ${playbackRate === rate ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'}`}>
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                             {qualities.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider text-right">الدقة</h4>
                                <div className="space-y-1">
                                    <button onClick={() => changeQuality(-1)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border ${currentQualityIndex === -1 ? 'bg-purple-600/10 text-purple-400 border-purple-500/30' : 'hover:bg-white/5 border-transparent text-gray-300'}`}>
                                        <span>Auto</span>
                                        {currentQualityIndex === -1 && <Check size={14} />}
                                    </button>
                                    {qualities.map((q) => (
                                        <button key={q.levelIndex} onClick={() => changeQuality(q.levelIndex)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border ${currentQualityIndex === q.levelIndex ? 'bg-purple-600/10 text-purple-400 border-purple-500/30' : 'hover:bg-white/5 border-transparent text-gray-300'}`}>
                                            <span>{q.height}p</span>
                                            {currentQualityIndex === q.levelIndex && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                              </div>
                             )}
                        </div>
                    )}
                 </div>
                <button onClick={toggleFullscreen} className="hover:text-purple-400 p-2" aria-label="ملء الشاشة">
                  {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                </button>
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}