"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Loader2, Trash2, X, CheckCheck, HelpCircle, GraduationCap, Video, Clock } from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    try {
      const res = await fetch(`${API_ROUTES.NOTIFICATIONS}?type=CHAT`, {
        credentials: "include", 
        next: { revalidate: 10 } 
      });

      if (!isMounted.current) return;

      if (res.status === 401) {
         router.push('/login');
         return; 
      }

      if (res.ok) {
        const data = await res.json();
        const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
        
        setNotifications(sorted);
        setUnreadCount(sorted.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();
    
    // ✅ تم تخفيض وقت الفحص إلى 10 ثوانٍ لتسريع الاستلام
    const jitter = Math.floor(Math.random() * 3000); 
    const intervalTime = 10000 + jitter; 
    
    const interval = setInterval(() => {
        fetchNotifications(true); 
    }, intervalTime); 

    let lastFocusTime = 0;
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime > 10000) { 
          fetchNotifications(true);
          lastFocusTime = now;
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]); 

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch(`${API_ROUTES.MARK_READ}?type=CHAT`, {
        method: 'PATCH',
        credentials: "include"
      });
    } catch (e) { 
        console.error("Failed to mark as read"); 
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
        await fetch(API_ROUTES.DELETE_NOTIFICATION(id), {
            method: 'DELETE',
            credentials: "include" 
        });
    } catch (error) { 
        console.error("Failed to delete notification"); 
    }
  };

  const clearAllNotifications = async () => {
      if (notifications.length === 0) return;
      
      const oldNotifications = [...notifications];
      setNotifications([]);
      setUnreadCount(0);
      
      try {
          const res = await fetch(`${API_ROUTES.CLEAR_NOTIFICATIONS}?type=CHAT`, {
              method: 'DELETE',
              credentials: "include" 
          });
          if(!res.ok) throw new Error();
      } catch (error) { 
          if (isMounted.current) {
              setNotifications(oldNotifications);
              setUnreadCount(oldNotifications.filter(n => !n.isRead).length);
          }
      }
  };

  return (
    <div className="relative">
      <button 
        aria-label="إشعارات النقاشات"
        title="النقاشات"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAsRead(); }}
        className={`relative p-2 rounded-xl transition-all duration-300 group ${
            isOpen ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <MessageCircle size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0f172a] animate-in zoom-in">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          
          <div className="fixed top-[95px] left-1/2 -translate-x-1/2 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-4 w-[92vw] max-w-[350px] sm:w-96 bg-[#162032] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 origin-top">
            
            <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">النقاشات والأسئلة</h3>
                  <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      {notifications.length}
                  </span>
              </div>
              
              {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors"
                  >
                      <Trash2 size={12} />
                      مسح الكل
                  </button>
              )}
            </div>
            
            <div className="max-h-[60vh] sm:max-h-[350px] overflow-y-auto custom-scrollbar p-1">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-purple-500" size={24}/>
                    <span className="text-xs">جاري التحميل...</span>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => {
                    const isQuestion = notif.title.includes('سؤال');
                    const isReply = notif.title.includes('رد');

                    return (
                      <Link 
                        key={notif.id} 
                        href={notif.link || '#'} 
                        onClick={() => setIsOpen(false)}
                        className="block p-3 m-1 rounded-xl hover:bg-white/5 transition-all relative group/item border border-transparent hover:border-white/5"
                      >
                        {!notif.isRead && (
                            <div className="absolute top-4 left-3 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                        
                        <button 
                            onClick={(e) => deleteNotification(e, notif.id)}
                            className="absolute top-2 left-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover/item:opacity-100 transition-all z-20"
                            title="حذف"
                            aria-label="حذف الإشعار"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex gap-3 items-start">
                            <div className={`mt-1 min-w-[36px] h-9 rounded-full flex items-center justify-center shrink-0 ${
                                isQuestion ? 'bg-amber-500/20 text-amber-500' : 
                                isReply ? 'bg-purple-600/20 text-purple-400' : 
                                'bg-white/5 text-gray-400'
                            }`}>
                                {isQuestion ? <HelpCircle size={18} /> : isReply ? <GraduationCap size={18} /> : <MessageCircle size={18} />}
                            </div>
                            
                            <div className="w-full pr-1 pl-4">
                                <div className="flex flex-col mb-1">
                                    <h4 className={`text-xs line-clamp-1 mb-0.5 ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
                                        {' - '}
                                        {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-400 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-1 mb-1 text-purple-300 text-[10px]">
                                        <Video size={10} /> تفاصيل:
                                    </div>
                                    {notif.message}
                                </div>
                            </div>
                        </div>
                      </Link>
                    )
                })
              ) : (
                <div className="p-10 text-center text-gray-500 text-xs flex flex-col items-center gap-3 opacity-60">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <CheckCheck size={24} />
                  </div>
                  لا يوجد نقاشات جديدة حالياً
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}