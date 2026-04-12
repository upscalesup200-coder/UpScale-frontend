"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_ROUTES } from "@/config/api";

// ==========================================
// 1. مكون محتوى الصفحة (يستخدم useSearchParams)
// ==========================================
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // توجيه المستخدم لصفحة الدخول إذا لم يكن هناك إيميل في الرابط
  useEffect(() => {
    if (!emailParam) {
      router.replace("/login");
    }
  }, [emailParam, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("يرجى إدخال الكود المكون من 6 أرقام بالكامل");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_ROUTES.VERIFY_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "الكود غير صحيح");

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // تجنب الـ Render إذا لم يكن هناك إيميل

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className="w-[92%] sm:w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] bg-[#0f172a]/80 md:bg-[#0f172a]/60 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10"
    >
      {success ? (
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/30 shadow-lg">
            <CheckCircle size={40} />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2">تم التفعيل! 🎉</h2>
          <p className="text-gray-400 text-sm">جاري توجيهك لتسجيل الدخول...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">تفعيل الحساب 🔐</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            حسابك غير مفعل بعد. يرجى إدخال كود التحقق المرسل إلى <br />
            <span className="text-purple-400 font-mono mt-1 block" dir="ltr">{email}</span>
          </p>

          <div className="flex justify-center gap-2 mb-6" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                // 👇 الأسطر التي تم إضافتها لحل مشكلة إمكانية الوصول 👇
                aria-label={`الرقم ${index + 1} من كود التحقق`}
                title={`أدخل الرقم ${index + 1}`}
                // 👆 ========================================= 👆
                className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black text-white bg-white/[0.05] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 text-xs font-bold text-red-400 bg-red-500/10 p-2 rounded-lg">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الحساب"}
          </button>

          {/* زر إعادة الإرسال */}
          <ResendOtpButton email={email} />

          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-6 w-full">
            <ArrowRight size={14} /> العودة لتسجيل الدخول
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// ==========================================
// 2. المكون الرئيسي (مغلف بـ Suspense لمتطلبات Next.js)
// ==========================================
export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#060a14] selection:bg-purple-500/30 font-sans" dir="rtl">
      {/* الخلفية المتحركة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-20%] md:top-[-20%] md:left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-orange-600/10 rounded-full blur-[80px] md:blur-[120px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] right-[-20%] md:bottom-[-20%] md:right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-red-600/10 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      {/* المحتوى */}
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-orange-500 relative z-10" />}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}

// ==========================================
// 3. مكون زر إعادة الإرسال
// ==========================================
const ResendOtpButton = ({ email }: { email: string }) => {
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setMessage("");

    try {
      const res = await fetch(API_ROUTES.RESEND_OTP || "/api/users/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل إرسال الكود");

      setMessage("✅ تم إرسال كود جديد إلى بريدك!");
      setCountdown(60); 
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs md:text-sm text-gray-400">
        لم يصلك الكود؟{" "}
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="font-bold text-orange-400 hover:text-orange-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? (
            <Loader2 size={14} className="animate-spin inline mr-1" />
          ) : countdown > 0 ? (
            `إعادة إرسال (${countdown}ث)`
          ) : (
            "إعادة إرسال"
          )}
        </button>
      </div>
      {message && <p className="text-xs text-center text-gray-300 bg-white/5 py-1 px-3 rounded-md">{message}</p>}
    </div>
  );
};