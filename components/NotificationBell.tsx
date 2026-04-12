"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import { 
  Bell, CheckCircle, BookOpen, Layers, Zap, Gift, Trash2
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        credentials: "include" 
      });
      
      if (!isMounted.current || res.status === 401 || !res.ok) return;
      
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      
      // ✅ التعديل هنا: فلترة الإشعارات لاستبعاد إشعارات الدردشة (CHAT)
      const filteredData = safeData.filter((n: any) => n.type !== 'CHAT');
      
      setNotifications(filteredData);
      const unread = filteredData.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);

    } catch (err) { 
      console.error("Notification fetch error"); 
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();

    const jitter = Math.floor(Math.random() * 15000);
    const intervalTime = 60000 + jitter; 

    const interval = setInterval(fetchNotifications, intervalTime);
    
    return () => {
        isMounted.current = false;
        clearInterval(interval);
    };
  }, [fetchNotifications]); 

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    if (nextState && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      if (user) {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
                method: 'PATCH',
                credentials: "include" 
            });
        } catch (e) { 
            console.error("Failed to mark notifications as read", e); 
        }
      }
    }
  };

  const handleClear = async (e: any) => {
    e.stopPropagation();
    
    setNotifications([]);
    setUnreadCount(0);

    if (user) {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/clear`, {
                method: 'DELETE',
                credentials: "include" 
            });
        } catch(err) { 
            console.error("Failed to clear notifications", err); 
        }
    }
  };

  const getNotificationStyle = (type: string) => {
    switch(type) {
        case 'COURSE': 
          return { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
        case 'WORKSHOP': 
          return { icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
        case 'BOOTCAMP': 
          return { icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' };
        case 'FREE': 
        case 'FREE_CONTENT':
          return { icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
        default: 
          return { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' };
    }
  };

  const menuVars: Variants = {
    initial: { scaleY: 0, opacity: 0 },
    animate: { 
      scaleY: 1, 
      opacity: 1, 
      transition: { duration: 0.3, ease: "easeOut" } 
    },
    exit: { scaleY: 0, opacity: 0, transition: { duration: 0.2 } }
  };

  const containerVars: Variants = {
    animate: { transition: { staggerChildren: 0.05 } }
  };

  const itemVars: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen} 
        aria-label={`الإشعارات ${unreadCount > 0 ? `، لديك ${unreadCount} إشعارات غير مقروءة` : ''}`}
        title="الإشعارات"
        className={`relative p-2.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <Bell size={22} className={unreadCount > 0 ? 'animate-swing' : ''} />
        
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0f172a]"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-[95px] left-1/2 -translate-x-1/2 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-4 w-[92vw] max-w-[350px] sm:w-96 z-[100]"
          >
            <motion.div
              variants={menuVars}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ originY: 0 }}
              className="w-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden origin-top"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">الإشعارات</span>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-purple-500/20">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClear}
                    className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    aria-label="مسح جميع الإشعارات"
                    title="مسح الكل"
                  >
                    <Trash2 size={12} /> مسح الكل
                  </button>
                )}
              </div>

              <motion.div 
                variants={containerVars}
                initial="initial"
                animate="animate"
                className="max-h-[350px] overflow-y-auto custom-scrollbar p-2"
              >
                {notifications.length > 0 ? (
                  notifications.slice(0, 30).map((notif) => {
                    const style = getNotificationStyle(notif.type);
                    const Icon = style.icon;

                    return (
                      <motion.div variants={itemVars} key={notif.id}>
                        <Link 
                          href={notif.link || '#'} 
                          onClick={() => setIsOpen(false)}
                          className="group relative flex gap-4 p-3 mb-1 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                          {!notif.isRead && (
                              <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
                          )}

                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} group-hover:scale-105 transition-transform duration-300`}>
                            <Icon size={20} className={style.color} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                               <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors truncate pl-4">
                                 {notif.title}
                               </h4>
                               <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                 {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                               </span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center text-center gap-4"
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                      <CheckCircle size={32} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-300 font-bold">لا توجد إشعارات</p>
                      <p className="text-gray-500 text-xs mt-1">أنت مطلع على كل شيء!</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  aria-label="إغلاق قائمة الإشعارات"
                >
                  إغلاق القائمة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}