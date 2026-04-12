"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import toast, { Toaster } from "react-hot-toast"; 
import { Settings, Save, Loader2, X, CheckCircle, UploadCloud } from "lucide-react"; 

export default function PlatformSettingsPage() {
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("identity"); 
  const [loading, setLoading] = useState(true);
  
  // داتا الإعدادات (الهوية والفوتر)
  const [platformName, setPlatformName] = useState("Up Scale Training Hub");
  const [footerDescription, setFooterDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // داتا الصفحات القانونية 
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  // داتا السوشيال ميديا 
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTelegram, setSocialTelegram] = useState("");
  const [socialWhatsapp, setSocialWhatsapp] = useState("");

  // داتا معلومات الدفع
  const [haramTransferInfo, setHaramTransferInfo] = useState("");
  const [syriatelCashNumber, setSyriatelCashNumber] = useState("");
  const [mtnCashNumber, setMtnCashNumber] = useState("");
  const [chamCashNumber, setChamCashNumber] = useState("");

  // الصور 
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [course1File, setCourse1File] = useState<File | null>(null);
  const [course2File, setCourse2File] = useState<File | null>(null);
  const [course3File, setCourse3File] = useState<File | null>(null);
  const [course4File, setCourse4File] = useState<File | null>(null);
  const [workshopFile, setWorkshopFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setPlatformName(data.platformName || "Up Scale Training Hub");
          setFooterDescription(data.footerDescription || "");
          setContactEmail(data.contactEmail || "");
          setContactLocation(data.contactLocation || "");
          setContactPhone(data.contactPhone || "");
          setTermsContent(data.termsContent || "");
          setPrivacyContent(data.privacyContent || "");
          setSocialFacebook(data.socialFacebook || "");
          setSocialInstagram(data.socialInstagram || "");
          setSocialTelegram(data.socialTelegram || "");
          setSocialWhatsapp(data.socialWhatsapp || "");
          setHaramTransferInfo(data.haramTransferInfo || "");
          setSyriatelCashNumber(data.syriatelCashNumber || "");
          setMtnCashNumber(data.mtnCashNumber || "");
          setChamCashNumber(data.chamCashNumber || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch current settings", err);
        setLoading(false);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!platformName) {
        toast.error("اسم المنصة مطلوب!");
        return;
      }

      setIsSavingSettings(true);

      try {
          const formData = new FormData();
          
          formData.append('platformName', platformName);
          formData.append('footerDescription', footerDescription);
          formData.append('contactEmail', contactEmail);
          formData.append('contactLocation', contactLocation);
          formData.append('contactPhone', contactPhone);
          formData.append('termsContent', termsContent);
          formData.append('privacyContent', privacyContent);
          formData.append('socialFacebook', socialFacebook);
          formData.append('socialInstagram', socialInstagram);
          formData.append('socialTelegram', socialTelegram);
          formData.append('socialWhatsapp', socialWhatsapp);
          formData.append('haramTransferInfo', haramTransferInfo);
          formData.append('syriatelCashNumber', syriatelCashNumber);
          formData.append('mtnCashNumber', mtnCashNumber);
          formData.append('chamCashNumber', chamCashNumber);

          if (logoFile) formData.append('logo', logoFile);
          if (footerLogoFile) formData.append('footerLogo', footerLogoFile);
          if (certificateFile) formData.append('certificate', certificateFile);
          if (course1File) formData.append('course1', course1File);
          if (course2File) formData.append('course2', course2File);
          if (course3File) formData.append('course3', course3File);
          if (course4File) formData.append('course4', course4File);
          if (workshopFile) formData.append('workshop', workshopFile); 

// ✅ التعديل هنا: حذفنا التوكن واستخدمنا credentials: "include"
const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    credentials: "include", // ✅ إرسال كوكيز المصادقة تلقائياً
    body: formData
});

          let data;
          try {
              const text = await res.text();
              data = text ? JSON.parse(text) : {};
          } catch(err) {
              data = { message: "استجابة غير مقروءة من الخادم" };
          }

          if (res.ok) {
              toast.success("تم تحديث إعدادات المنصة بنجاح!");
              setLogoFile(null); setFooterLogoFile(null); setCertificateFile(null);
              setCourse1File(null); setCourse2File(null); setCourse3File(null); setCourse4File(null); setWorkshopFile(null);
          } else {
              toast.error(`فشل الحفظ: ${data.message || 'حدث خطأ غير معروف'}`);
          }
      } catch (error) {
          console.error("Error saving settings", error);
          toast.error("حدث خطأ في الاتصال بالخادم أثناء حفظ الإعدادات.");
      } finally {
          setIsSavingSettings(false);
      }
  };

  const renderImageUploader = (label: string, stateFile: File | null, setState: any) => {
      const inputId = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
      return (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <label htmlFor={inputId} className="text-sm font-bold text-gray-300 cursor-pointer">{label}</label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#0a0f1c]">
                  <input 
                      id={inputId} title={`رفع ${label}`} aria-label={`رفع ${label}`} type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={(e) => { if (e.target.files && e.target.files[0]) setState(e.target.files[0]); }}
                  />
                  {stateFile ? (
                      <div className="flex flex-col items-center text-green-400">
                          <CheckCircle size={24} className="mb-1" />
                          <span className="text-xs font-bold truncate max-w-[150px]">{stateFile.name}</span>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center text-gray-500 hover:text-blue-400 transition-colors pointer-events-none">
                          <UploadCloud size={24} className="mb-1" />
                          <span className="text-xs font-medium">اضغط لرفع صورة</span>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen text-white pt-24 px-8 pb-12" dir="rtl">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <div className="max-w-6xl mx-auto">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-slate-700 p-3 rounded-2xl border border-white/10 shadow-lg shadow-slate-900/50">
                    <Settings size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black">إعدادات المنصة الشاملة</h1>
                    <p className="text-gray-400 mt-1">إدارة الهوية، طرق الدفع، الروابط، والصور الخاصة بالمنصة</p>
                </div>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {['identity', 'payment', 'legal', 'social'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                {tab === 'identity' && 'الهوية والصور'}
                                {tab === 'payment' && 'بوابات الدفع'}
                                {tab === 'legal' && 'الصفحات القانونية'}
                                {tab === 'social' && 'التواصل والسوشيال'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    <form id="settingsForm" onSubmit={handleSaveSettings}>
                        {/* Tab Content: Identity */}
                        {activeTab === 'identity' && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-3">
                                    <label htmlFor="platformNameInput" className="text-sm font-bold text-gray-300">اسم المنصة</label>
                                    <input id="platformNameInput" type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {renderImageUploader("شعار المنصة", logoFile, setLogoFile)}
                                    {renderImageUploader("شعار الفوتر", footerLogoFile, setFooterLogoFile)}
                                    {renderImageUploader("صورة الشهادة", certificateFile, setCertificateFile)}
                                    {renderImageUploader("صورة الورشات", workshopFile, setWorkshopFile)}
                                    {renderImageUploader("صورة المادة 1", course1File, setCourse1File)}
                                    {renderImageUploader("صورة المادة 2", course2File, setCourse2File)}
                                    {renderImageUploader("صورة المادة 3", course3File, setCourse3File)}
                                    {renderImageUploader("صورة المادة 4", course4File, setCourse4File)}
                                </div>
                            </section>
                        )}

                        {/* Tab Content: Payment */}
                        {activeTab === 'payment' && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <label htmlFor="haramTransferInput" className="text-sm font-bold text-gray-300">معلومات حوالة الهرم</label>
                                        <textarea id="haramTransferInput" rows={5} value={haramTransferInfo} onChange={(e) => setHaramTransferInfo(e.target.value)} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-green-500 outline-none custom-scrollbar" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="syriatelCashInput" className="text-sm font-bold text-gray-300">رقم سيريتل كاش</label>
                                        <input id="syriatelCashInput" type="text" value={syriatelCashNumber} onChange={(e) => setSyriatelCashNumber(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-green-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="mtnCashInput" className="text-sm font-bold text-gray-300">رقم MTN كاش</label>
                                        <input id="mtnCashInput" type="text" value={mtnCashNumber} onChange={(e) => setMtnCashNumber(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-green-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="chamCashInput" className="text-sm font-bold text-gray-300">رقم شام كاش</label>
                                        <input id="chamCashInput" type="text" value={chamCashNumber} onChange={(e) => setChamCashNumber(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-green-500 text-left outline-none" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Tab Content: Legal */}
                        {activeTab === 'legal' && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="termsInput" className="text-sm font-bold text-gray-300">شروط الاستخدام</label>
                                        <textarea id="termsInput" rows={12} value={termsContent} onChange={(e) => setTermsContent(e.target.value)} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-purple-500 outline-none custom-scrollbar leading-relaxed" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="privacyInput" className="text-sm font-bold text-gray-300">سياسة الخصوصية</label>
                                        <textarea id="privacyInput" rows={12} value={privacyContent} onChange={(e) => setPrivacyContent(e.target.value)} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-purple-500 outline-none custom-scrollbar leading-relaxed" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Tab Content: Social */}
                        {activeTab === 'social' && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="emailInput" className="text-sm font-bold text-gray-300">الإيميل الرسمي</label>
                                        <input id="emailInput" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="phoneInput" className="text-sm font-bold text-gray-300">رقم الهاتف</label>
                                        <input id="phoneInput" type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="facebookInput" className="text-sm font-bold text-gray-300">رابط فيسبوك</label>
                                        <input id="facebookInput" type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="telegramInput" className="text-sm font-bold text-gray-300">رابط تلغرام</label>
                                        <input id="telegramInput" type="url" value={socialTelegram} onChange={(e) => setSocialTelegram(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="instagramInput" className="text-sm font-bold text-gray-300">رابط انستغرام</label>
                                        <input id="instagramInput" type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="whatsappInput" className="text-sm font-bold text-gray-300">رابط واتساب</label>
                                        <input id="whatsappInput" type="url" value={socialWhatsapp} onChange={(e) => setSocialWhatsapp(e.target.value)} dir="ltr" className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-emerald-500 text-left outline-none" />
                                    </div>
                                </div>
                            </section>
                        )}
                    </form>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                    <button form="settingsForm" type="submit" disabled={isSavingSettings} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/30 flex items-center gap-3 transition-all">
                        {isSavingSettings ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} حفظ الإعدادات
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}