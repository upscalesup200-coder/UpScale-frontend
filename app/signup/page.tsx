"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, MapPin, Briefcase, ArrowRight, Loader2, Sparkles, CheckCircle, XCircle, Eye, EyeOff, Check, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ROUTES } from "@/config/api"; 
import { Turnstile } from '@marsidev/react-turnstile';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");

  // ==========================================
  // 🔐 حالات نافذة التحقق (OTP Modal)
  // ==========================================
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "",
    phone: "", whatsapp: "", telegram: "", specialization: "", residence: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, upper: false, lower: false, number: false, special: false,
  });

  const [fieldErrors, setFieldErrors] = useState<any>({});

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const pwd = formData.password;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = "";

    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(value)) {
      setFieldErrors((prev: any) => ({ ...prev, [name]: "يرجى الإدخال باللغة الإنجليزية حصراً" }));
      return; 
    }

    if (name === "phone" || name === "whatsapp") {
      if (!/^\d*$/.test(value)) return;
    }

    if (name === "firstName" || name === "lastName" || name === "residence" || name === "specialization") {
      if (value && !/^[a-zA-Z0-9\s,._\-()]*$/.test(value)) return;
    }

    if (name === "username") {
       newValue = value.replace(/\s/g, ''); 
       if (newValue && !/^[a-zA-Z0-9_.-]*$/.test(newValue)) return;
    }

    if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) error = "يرجى إدخال بريد إلكتروني صالح";
    }

    setFieldErrors((prev: any) => ({ ...prev, [name]: error }));
    setFormData({ ...formData, [name]: newValue });
  };

  const isFormValid = () => {
    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formData.email);
    const isRequiredFilled = formData.firstName.trim() && formData.lastName.trim() && formData.username.trim() && formData.email.trim() && formData.password && formData.phone.trim();
    return isPasswordValid && isEmailValid && isRequiredFilled && !fieldErrors.email && turnstileToken;
  };

  // ==========================================
  // 🚀 إرسال فورم التسجيل الأساسي
  // ==========================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || cooldown > 0) return;

    setLoading(true);
    setServerError("");

    try {
      const sanitizedData = {
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          specialization: formData.specialization.trim(),
          residence: formData.residence.trim(),
          turnstileToken, 
      };

      const res = await fetch(API_ROUTES.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) throw new Error("البريد الإلكتروني أو اسم المستخدم موجود مسبقاً");
        throw new Error(data.message || "حدث خطأ أثناء إنشاء الحساب");
      }

      // 👈 فتح نافذة الـ OTP
      setShowOtpModal(true);

    } catch (err: any) {
      setServerError(err.message);
      setCooldown(10); 
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 📱 دوال التحكم بمربعات إدخال الـ OTP
  // ==========================================
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // الانتقال للمربع التالي تلقائياً
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // العودة للمربع السابق عند ضغط Backspace
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // ✅ دالة إرسال الكود للتحقق
  // ==========================================
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("يرجى إدخال الكود المكون من 6 أرقام بالكامل");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch(API_ROUTES.VERIFY_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "الكود غير صحيح");

      // إخفاء النافذة وإظهار رسالة النجاح ثم التوجيه
      setShowOtpModal(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const passwordStrengthScore = Object.values(passwordCriteria).filter(Boolean).length;
  const getStrengthColor = () => {
    if (passwordStrengthScore <= 2) return "bg-red-500";
    if (passwordStrengthScore <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#060a14] py-12 px-4 selection:bg-purple-500/30 font-sans" dir="rtl">
      
      {/* الخلفية المتحركة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-20%] md:top-[-20%] md:left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 md:bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] right-[-20%] md:bottom-[-20%] md:right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/10 md:bg-blue-600/20 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }} className="w-[95%] sm:w-full max-w-3xl p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] bg-[#0f172a]/80 md:bg-[#0f172a]/60 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
        
        {/* ========================================== */}
        {/* 🌟 نافذة إدخال الكود (OTP Modal) */}
        {/* ========================================== */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#060a14]/90 backdrop-blur-sm rounded-3xl md:rounded-[2.5rem]"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm p-6 sm:p-8 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white mb-2">تأكيد البريد الإلكتروني</h2>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  أرسلنا كود تحقق من 6 أرقام إلى بريدك <br/> <span className="text-purple-400 font-mono" dir="ltr">{formData.email}</span>
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
                      aria-label={`الرقم ${index + 1} من كود التحقق`}
                      className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black text-white bg-white/[0.05] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {otpError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 text-xs font-bold text-red-400 bg-red-500/10 p-2 rounded-lg">
                      {otpError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.join("").length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                >
                  {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الحساب"}
                </button>

                {/* ✅ زر إعادة إرسال الكود */}
                <ResendOtpButton email={formData.email} />

                <button 
                  onClick={() => router.push("/login")}
                  className="mt-6 text-xs text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-4 w-full"
                >
                  التحقق لاحقاً (العودة لتسجيل الدخول)
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ========================================== */}
        {/* 🌟 واجهة النجاح الأساسية */}
        {/* ========================================== */}
        {success ? (
          <div className="text-center py-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }} className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/30 shadow-lg">
              <CheckCircle size={40} className="md:w-12 md:h-12" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">تم تفعيل حسابك بنجاح! 🎉</h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">جاري توجيهك لصفحة الدخول...</p>
          </div>
        ) : (
            <>
            <div className={`transition-opacity duration-300 ${showOtpModal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] md:text-xs font-black mb-4 border border-purple-500/20 tracking-wider">
                  <Sparkles size={14} className="md:w-4 md:h-4" />
                  <span>انضم لنخبة المتعلمين</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">إنشاء حساب جديد</h1>
                <p className="text-gray-400 text-xs md:text-sm font-medium">املأ البيانات بدقة باللغة الإنجليزية لنبدأ الرحلة سوياً</p>
              </div>

              <AnimatePresence>
                {serverError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs md:text-sm overflow-hidden font-medium">
                    <XCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSignup} className="space-y-6 md:space-y-8">
                
                {/* القسم الأول: المعلومات الشخصية */}
                <div className="space-y-4 md:space-y-5">
                  <h3 className="text-white/80 text-xs md:text-sm font-bold border-b border-white/10 pb-2">المعلومات الشخصية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <InputField label="الاسم الأول" id="firstName" icon={User} name="firstName" placeholder="مثال: Yazan" value={formData.firstName} onChange={handleChange} error={fieldErrors.firstName} dir="ltr" autoComplete="given-name" />
                    <InputField label="الكنية" id="lastName" icon={User} name="lastName" placeholder="مثال: Alsit" value={formData.lastName} onChange={handleChange} error={fieldErrors.lastName} dir="ltr" autoComplete="family-name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <InputField label="التخصص الدراسي (اختياري)" id="specialization" icon={Briefcase} name="specialization" placeholder="مثال: Informatics Engineer" value={formData.specialization} onChange={handleChange} error={fieldErrors.specialization} required={false} dir="ltr" />
                    <InputField label="مكان الإقامة (اختياري)" id="residence" icon={MapPin} name="residence" placeholder="مثال: Damascus, Syria" value={formData.residence} onChange={handleChange} error={fieldErrors.residence} required={false} dir="ltr" />
                  </div>
                </div>

                {/* القسم الثاني: معلومات الحساب */}
                <div className="space-y-4 md:space-y-5">
                  <h3 className="text-white/80 text-xs md:text-sm font-bold border-b border-white/10 pb-2">معلومات الحساب</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <InputField label="اسم المستخدم" id="username" icon={User} name="username" placeholder="مثال: yazan_alsit" value={formData.username} onChange={handleChange} error={fieldErrors.username} dir="ltr" autoComplete="username" />
                    <div className="flex flex-col gap-1 w-full">
                        <InputField label="البريد الإلكتروني" id="email" icon={Mail} name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} error={fieldErrors.email} dir="ltr" autoComplete="email" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="password" className="text-xs md:text-sm font-bold text-gray-300 mr-1 block">كلمة المرور</label>
                    <div className="relative group w-full">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pr-12 pl-12 text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 hover:bg-white/[0.05] transition-all placeholder:text-gray-600 text-left font-mono"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {formData.password && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-black/20 p-4 rounded-xl md:rounded-2xl border border-white/5 mt-2">
                            <div className="h-1.5 w-full bg-gray-700 rounded-full mb-3 overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${(passwordStrengthScore / 5) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                                <PasswordCheck label="8 محارف على الأقل" valid={passwordCriteria.length} />
                                <PasswordCheck label="حرف كبير (A-Z)" valid={passwordCriteria.upper} />
                                <PasswordCheck label="حرف صغير (a-z)" valid={passwordCriteria.lower} />
                                <PasswordCheck label="رقم (0-9)" valid={passwordCriteria.number} />
                                <PasswordCheck label="رمز خاص (!@#$)" valid={passwordCriteria.special} />
                            </div>
                        </motion.div>
                    )}
                  </div>
                </div>

                {/* القسم الثالث: معلومات التواصل */}
                <div className="space-y-4 md:space-y-5">
                  <h3 className="text-white/80 text-xs md:text-sm font-bold border-b border-white/10 pb-2">معلومات التواصل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    <InputField label="رقم الهاتف (أساسي)" id="phone" icon={Phone} name="phone" placeholder="مثال: 0987654321" value={formData.phone} onChange={handleChange} dir="ltr" autoComplete="tel" />
                    <InputField label="رقم الواتساب (اختياري)" id="whatsapp" icon={MessageCircle} name="whatsapp" placeholder="مثال: 0987654321" value={formData.whatsapp} onChange={handleChange} required={false} dir="ltr" autoComplete="tel" />
                    <InputField label="معرف التيليغرام (اختياري)" id="telegram" icon={Send} name="telegram" placeholder="مثال: @username" value={formData.telegram} onChange={handleChange} required={false} dir="ltr" />
                  </div>
                </div>

                {/* ودجت Turnstile */}
                <div className="flex justify-center mt-6">
                  <Turnstile
                    siteKey="0x4AAAAAACt-yUGHlJRK5guz" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setServerError("فشل التحقق من الأمان. يرجى المحاولة مرة أخرى.")}
                    onExpire={() => setTurnstileToken("")}
                    options={{ theme: 'dark', language: 'ar' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFormValid() || cooldown > 0}
                  className="w-full py-4 md:py-4 mt-6 md:mt-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm md:text-base shadow-lg shadow-purple-500/25 md:hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed group overflow-hidden relative"
                >
                  <div className="hidden md:block absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : cooldown > 0 ? (
                      <span>الرجاء الانتظار {cooldown} ثانية</span>
                    ) : (
                      <>
                        <span>إنشاء الحساب</span>
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 md:group-hover:-translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-gray-400 font-medium">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-black border-b border-transparent hover:border-purple-400 pb-0.5 ml-1">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ==========================================
// المكونات الإضافية 
// ==========================================

const InputField = ({ id, label, icon: Icon, type = "text", name, placeholder, value, onChange, required = true, error, dir = "ltr", autoComplete = "off" }: any) => (
  <div className="w-full flex flex-col gap-2.5">
    <label htmlFor={id} className="text-xs md:text-sm font-bold text-gray-300 mr-1 block">{label}</label>
    <div className={`relative group`}>
        <Icon className={`absolute ${dir === 'ltr' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 transition-colors w-5 h-5 pointer-events-none ${error ? "text-red-400" : "text-gray-500 group-focus-within:text-purple-400"}`} />
        <input
          id={id}
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          {...(autoComplete ? { autoComplete } : {})}
          className={`w-full bg-white/[0.03] border rounded-xl md:rounded-2xl py-3.5 md:py-4 ${dir === 'ltr' ? 'pl-12 pr-4 text-left' : 'pr-12 pl-4 text-right'} text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600 ${
              error 
              ? "border-red-500/50 focus:border-red-500 focus:bg-red-500/10 hover:bg-red-500/5" 
              : "border-white/10 focus:border-purple-500/50 focus:bg-white/10 hover:bg-white/[0.05]"
          }`}
          placeholder={placeholder}
          dir={dir}
        />
    </div>
    {error && <span className="text-[11px] md:text-xs font-bold text-red-400">{error}</span>}
  </div>
);

const PasswordCheck = ({ label, valid }: { label: string, valid: boolean }) => (
    <div className={`flex items-center gap-1.5 ${valid ? "text-green-400" : "text-gray-500 font-medium"}`}>
        {valid ? <Check size={14} className="md:w-4 md:h-4" /> : <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border border-gray-600" />}
        <span>{label}</span>
    </div>
);

// ✅ مكون زر إعادة إرسال الكود
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
      // ⚠️ تأكد من إضافة مسار إعادة الإرسال إلى API_ROUTES أو استخدم المسار المباشر
      const res = await fetch(API_ROUTES.RESEND_OTP || "/api/resend-otp", {
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
          className="font-bold text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
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