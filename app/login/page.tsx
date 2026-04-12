"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, User, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { API_ROUTES } from "@/config/api"; 

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [needsVerification, setNeedsVerification] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).isUpScaleApp) {
      setIsDesktopApp(true);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      timer = setInterval(() => setLockoutTimer((prev) => prev - 1), 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 3) {
      setFailedAttempts(0);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer, failedAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTimer > 0) return;

    setLoading(true);
    setError("");
    setNeedsVerification(false); 

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const currentDeviceType = isDesktopApp ? 'desktop' : 'web';

      const res = await fetch(API_ROUTES.LOGIN, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-device-type": currentDeviceType 
        },
        credentials: "include", 
        body: JSON.stringify({ email: sanitizedEmail, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes("غير مفعل") || data.message?.includes("verify") || data.status === "UNVERIFIED") {
            setNeedsVerification(true);
            throw new Error("حسابك غير مفعل، يرجى إدخال رمز التحقق (OTP) للمتابعة.");
        }
        const serverMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(serverMessage || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      setFailedAttempts(0);

      await login("cookie-auth", data.user); 
      
      const role = data.user?.role;

      if (isDesktopApp) {
          router.push("/desktop");
      } else {
          if (role === 'ADMIN') {
              router.push("/admin/dashboard");
          } else if (role === 'TEACHER') {
              router.push("/instructor/dashboard");
          } else {
              router.push("/");
          }
      }
      
    } catch (err: any) {
      setError(err.message);
      
      if (!needsVerification) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          if (newAttempts >= 3) {
            setLockoutTimer(30); 
            setError("محاولات كثيرة خاطئة. يرجى الانتظار لمدة 30 ثانية قبل المحاولة مجدداً.");
          }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#060a14] selection:bg-purple-500/30 font-sans" dir="rtl">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-20%] md:top-[-20%] md:left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 md:bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px]"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-20%] md:bottom-[-20%] md:right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/10 md:bg-blue-600/20 rounded-full blur-[60px] md:blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-[92%] sm:w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] bg-[#0f172a]/80 md:bg-[#0f172a]/60 border border-white/10 backdrop-blur-2xl shadow-2xl md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner mb-6">
            <User size={32} className="text-purple-400 drop-shadow-md md:w-10 md:h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 text-white tracking-tight">مرحباً بعودتك 👋</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">أدخل بياناتك للمتابعة إلى منصة التعلم</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 p-4 rounded-xl border flex flex-col gap-3 text-xs md:text-sm leading-relaxed overflow-hidden font-medium ${
                needsVerification 
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <div className="flex items-start gap-3">
                {needsVerification ? <ShieldAlert size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <span>{error}</span>
              </div>
              
              {needsVerification && (
                <button
                  onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}
                  className="mt-2 w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors border border-orange-500/20 flex items-center justify-center gap-2"
                >
                  الذهاب لصفحة التفعيل <ArrowRight size={14} className="rotate-180" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
          
          <div className="space-y-2.5">
            <label htmlFor="emailInput" className="text-xs md:text-sm font-bold text-gray-300 mr-1 block">البريد الإلكتروني</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5 pointer-events-none" />
              <input
                id="emailInput"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pr-12 pl-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 hover:bg-white/[0.05] transition-all placeholder:text-gray-600 text-left"
                placeholder="name@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="passwordInput" className="text-xs md:text-sm font-bold text-gray-300 mr-1 block">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
              <input
                id="passwordInput"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pr-12 pl-12 text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 hover:bg-white/[0.05] transition-all placeholder:text-gray-600 text-left font-mono"
                placeholder="••••••••"
                dir="ltr"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <Link 
                href="/forgot-password" 
                className="text-[11px] md:text-xs text-purple-400 hover:text-purple-300 transition-colors font-bold tracking-wide"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full py-4 md:py-4 mt-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm md:text-base shadow-lg shadow-purple-500/25 md:hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed group overflow-hidden relative"
          >
            <div className="hidden md:block absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : lockoutTimer > 0 ? (
                <span>إعادة المحاولة بعد ({lockoutTimer}) ثانية</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 md:group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        {!isDesktopApp && (
          <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-gray-400 font-medium">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors font-black border-b border-transparent hover:border-purple-400 pb-0.5 ml-1">
              إنشاء حساب جديد
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}