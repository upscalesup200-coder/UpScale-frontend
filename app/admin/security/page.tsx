"use client";
import React, { useEffect, useState } from 'react';
import { securityService } from '../../../services/security.service';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Ban, ShieldCheck, RefreshCw, AlertTriangle, Clock, Activity, User, BookOpen, Trash2, X, Loader2 } from "lucide-react";

export default function SecurityDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🛡️ حالات نافذة التأكيد المخصصة (Modal)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'CLEAR' | 'BLOCK' | 'UNBLOCK';
    targetIp?: string;
  }>({ isOpen: false, type: 'CLEAR' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsData, blockedData] = await Promise.all([
        securityService.getAlerts(),
        securityService.getBlockedIps()
      ]);
      setAlerts(alertsData);
      setBlockedIps(blockedData);
    } catch (error) {
      console.error("فشل جلب البيانات الأمنية", error);
      toast.error("فشل في جلب بيانات الأمان");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🛡️ دالة تنفيذ الإجراءات الأمنية بعد التأكيد من المودال
  const executeAction = async () => {
    setIsProcessing(true);
    try {
      if (actionModal.type === 'CLEAR') {
        await securityService.clearAllAlerts();
        toast.success("تم تنظيف الرادار بنجاح 🧹");
        setAlerts([]); 
      } 
      else if (actionModal.type === 'BLOCK' && actionModal.targetIp) {
        await securityService.blockIp(actionModal.targetIp);
        toast.success(`تم حظر ${actionModal.targetIp} بنجاح 🚫`);
        fetchData(); 
      } 
      else if (actionModal.type === 'UNBLOCK' && actionModal.targetIp) {
        await securityService.unblockIp(actionModal.targetIp);
        toast.success(`تم فك الحظر عن ${actionModal.targetIp} ✅`);
        setBlockedIps(prev => prev.filter(b => b.ip !== actionModal.targetIp));
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تنفيذ العملية الأمنية");
    } finally {
      setIsProcessing(false);
      setActionModal({ isOpen: false, type: 'CLEAR' });
    }
  };

  return (
    <div className="min-h-screen text-white pt-12 px-8 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🛡️ الهيدر الفخم المحدث بالأزرار */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0f172a] p-8 rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-red-500"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">غرفة العمليات الأمنية</h1>
              <p className="text-slate-400 text-sm mt-2">رصد التهديدات، الجلسات المزدوجة، وإدارة القائمة السوداء</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setActionModal({ isOpen: true, type: 'CLEAR' })}
              disabled={alerts.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${
                alerts.length === 0 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                : "bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20"
              }`}
            >
              <Trash2 size={18} />
              تنظيف الرادار
            </button>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              تحديث الرادار
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Activity className="w-10 h-10 text-red-500 animate-pulse" />
            <p className="text-slate-400">جاري مسح الشبكة... 📡</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ⚠️ القائمة الحمراء (التهديدات النشطة) */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                <AlertTriangle className="w-7 h-7 text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">التهديدات النشطة</h2>
                <span className="mr-auto bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
                  {alerts.length} تهديد
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                  <p>المنصة آمنة، لا يوجد أي تهديدات نشطة حالياً ✅.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors rounded-2xl p-5 flex flex-col gap-4">
                      
                      <div className="flex justify-between items-start border-b border-slate-700/50 pb-4">
                        <div>
                          <span className="inline-block bg-red-500/10 text-red-400 font-mono text-sm font-bold px-4 py-1.5 rounded-lg border border-red-500/20">
                            IP: {alert.ip}
                          </span>
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Clock className="w-4 h-4" />
                            آخر ظهور: <span className="text-slate-300">{new Date(alert.lastAttack).toLocaleString("ar-SA")}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className="text-yellow-400 text-sm font-bold bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
                            {alert.count} محاولة
                          </span>
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'BLOCK', targetIp: alert.ip })}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20"
                          >
                            <Ban className="w-4 h-4" />
                            حظر فوراً
                          </button>
                        </div>
                      </div>

                      {alert.user ? (
                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600 flex shrink-0 items-center justify-center">
                              {alert.user.avatar ? (
                                <img src={alert.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm flex items-center gap-2">
                                {alert.user.firstName} {alert.user.lastName}
                                {alert.user.role === 'TEACHER' ? (
                                  <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">مدرس</span>
                                ) : alert.user.role === 'STUDENT' ? (
                                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">طالب</span>
                                ) : (
                                  <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/30">إدارة</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{alert.user.email}</p>
                            </div>
                          </div>

                          {alert.user.enrollments && alert.user.enrollments.length > 0 && (
                            <div className="pt-2 border-t border-slate-700/50">
                              <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> مسجل في:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {alert.user.enrollments.map((enr: any, i: number) => (
                                  <span 
                                    key={i} 
                                    className="text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-1.5 shadow-sm transition-all hover:bg-slate-700"
                                    title={enr.itemTitle || enr.itemId}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${
                                      enr.type === 'COURSE' ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]' : 
                                      enr.type === 'BOOTCAMP' ? 'bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.6)]' : 
                                      'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]'
                                    }`}></span>
                                    <strong className="text-slate-300 font-medium">
                                      {enr.type === 'COURSE' ? 'مادة:' : enr.type === 'BOOTCAMP' ? 'معسكر:' : 'ورشة:'}
                                    </strong>
                                    <span className="text-white font-bold truncate max-w-[150px]">
                                      {enr.itemTitle || 'محتوى غير متوفر'}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-slate-700 flex items-center gap-2 text-slate-400 text-sm">
                          <User className="w-4 h-4" />
                          <span>هوية المستخدم غير معروفة (لم يسجل دخول)</span>
                        </div>
                      )}
                      
                      <div className="bg-[#0b1121] p-4 rounded-xl border border-slate-800/50">
                        <p className="text-xs text-slate-500 mb-2 font-bold">تفاصيل المخالفة:</p>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 marker:text-red-500">
                          {(alert.events || alert.endpoints || []).map((event: string, i: number) => (
                            <li key={i}>{event}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🚫 القائمة السوداء (الأجهزة المحظورة) */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                <Ban className="w-7 h-7 text-red-500" />
                <h2 className="text-2xl font-bold text-white">القائمة السوداء</h2>
                <span className="mr-auto bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
                  {blockedIps.length} محظور
                </span>
              </div>

              {blockedIps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                  <p>القائمة السوداء فارغة.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {blockedIps.map((blocked, idx) => (
                    <div key={idx} className="bg-red-950/20 border border-red-900/30 rounded-2xl p-5 flex justify-between items-center group hover:bg-red-950/40 transition-colors">
                      <div>
                        <p className="text-red-400 font-bold mb-2 font-mono text-base">{blocked.ip}</p>
                        <p className="text-sm text-slate-300 mb-2">{blocked.reason}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          تاريخ الحظر: {new Date(blocked.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                      <button
                        onClick={() => setActionModal({ isOpen: true, type: 'UNBLOCK', targetIp: blocked.ip })}
                        className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-emerald-500/20 transition-all opacity-80 group-hover:opacity-100"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        فك الحظر
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* 🛡️ نافذة التأكيد المخصصة (Custom Confirmation Modal) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 relative">
            {/* ✅ الحل هنا: إضافة aria-label و title لزر الإغلاق */}
            <button 
              onClick={() => setActionModal({ isOpen: false, type: 'CLEAR' })} 
              aria-label="إغلاق النافذة"
              title="إغلاق"
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6 mt-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                actionModal.type === 'UNBLOCK' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {actionModal.type === 'CLEAR' && <Trash2 size={40} />}
                {actionModal.type === 'BLOCK' && <Ban size={40} />}
                {actionModal.type === 'UNBLOCK' && <ShieldCheck size={40} />}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {actionModal.type === 'CLEAR' && 'تنظيف الرادار الأمني؟'}
                {actionModal.type === 'BLOCK' && 'تأكيد الحظر النهائي'}
                {actionModal.type === 'UNBLOCK' && 'فك الحظر عن الـ IP'}
              </h3>
              
              <p className="text-slate-400 text-sm">
                {actionModal.type === 'CLEAR' && 'سيتم مسح جميع التنبيهات والتهديدات النشطة من السجل. هل أنت متأكد؟'}
                {actionModal.type === 'BLOCK' && `سيتم منع العنوان ${actionModal.targetIp} من الدخول للمنصة نهائياً.`}
                {actionModal.type === 'UNBLOCK' && `سيتم السماح للعنوان ${actionModal.targetIp} باستخدام المنصة مجدداً.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={executeAction}
                disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  actionModal.type === 'UNBLOCK' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'نعم، تأكيد'}
              </button>
              <button 
                onClick={() => setActionModal({ isOpen: false, type: 'CLEAR' })}
                disabled={isProcessing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}