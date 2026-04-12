"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, KeyRound, CheckCircle, AlertCircle, Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/config/api"; 

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (cooldown > 0) {
          timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      }
      return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return; 

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(API_ROUTES.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
          console.warn("Failed to send OTP (may not exist)");
      }

      setMessage({ type: "success", text: "إذا كان البريد مسجلاً لدينا، فستصلك رسالة تحتوي على رمز التحقق." });
      setStep(2); 
      setCooldown(60); 

    } catch (err: any) {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(API_ROUTES.RESET_PASSWORD_CONFIRM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPass: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");

      setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح! جاري تحويلك..." });
      
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
      setStep(1); 
      setMessage({type: "", text: ""});
      setCode("");
      setNewPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]" dir="rtl">
       <div className="fixed inset-0 pointer-events-none -z-10" 
         style={{
            background: `radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.1) 0%, transparent 50%)`
         }}
       />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg shadow-purple-500/10">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">
            {step === 1 ? "استعادة كلمة المرور" : "تعيين كلمة المرور الجديدة"}
          </h1>
          <p className="text-gray-400 text-sm px-4">
            {step === 1 ? "أدخل بريدك الإلكتروني المسجل لنرسل لك رمز التحقق" : `تم إرسال الرمز إلى ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border leading-relaxed ${
                  message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
            >
              {message.type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="emailInput" className="text-sm font-bold text-gray-300 mr-1">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600 text-left"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <Loader2 className="animate-spin" />
              ) : cooldown > 0 ? (
                  <span>إعادة المحاولة بعد ({cooldown}) ثانية</span>
              ) : (
                  <span>إرسال الرمز</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetConfirm} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="otpInput" className="text-sm font-bold text-gray-300 mr-1">رمز التحقق (OTP)</label>
              <div className="relative group">
                <Hash className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                <input
                  id="otpInput"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all tracking-[0.5em] text-center text-lg font-bold placeholder:tracking-normal placeholder:text-gray-600 placeholder:text-sm"
                  placeholder="123456"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPasswordInput" className="text-sm font-bold text-gray-300 mr-1">كلمة المرور الجديدة</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                <input
                  id="newPasswordInput"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600 text-left"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <span>تأكيد التغيير</span>}
            </button>
            
            <button 
                type="button" 
                onClick={handleGoBack}
                className="w-full text-sm text-gray-400 hover:text-white mt-2 transition-colors flex items-center justify-center gap-2"
            >
                <ArrowLeft size={14} />
                لم يصلك الرمز؟ حاول مرة أخرى
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                العودة لتسجيل الدخول
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
        </div>
      </motion.div>
    </div>
  );
}