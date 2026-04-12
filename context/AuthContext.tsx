"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_ROUTES } from "@/config/api";
import { toast } from "react-hot-toast";
import { AlertTriangle } from "lucide-react"; 
import axios from "axios"; 

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar?: string;
  username?: string;
  phone?: string;
  balance: number;        
  xp: number;            
  enrollments?: any[];   
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: (redirectDelay?: number) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  showSecurityAlert: () => void;
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let isBanningInProgress = false;
const originalFetch = typeof window !== "undefined" ? window.fetch : null;

// ==========================================
// 🚀 تحديد نوع الجهاز بناءً على بيئة التشغيل
// ==========================================
let currentDeviceType = 'web';
if (typeof window !== 'undefined') {
  // إذا كان التطبيق يمرر هذا المتغير، نعتبره ديسكتوب
  currentDeviceType = (window as any).isUpScaleApp ? 'desktop' : 'web';
}

axios.defaults.withCredentials = true;
// حقن نوع الجهاز في هيدرات axios الافتراضية
axios.defaults.headers.common['x-device-type'] = currentDeviceType; 

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = sessionStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useRef(true);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const logout = async (redirectDelay: number = 500) => {
    try {
      if (originalFetch) {
        await originalFetch(API_ROUTES.LOGOUT, { 
          method: 'POST', 
          credentials: 'include',
          headers: { 'x-device-type': currentDeviceType }
        });
      } else {
        await axios.post(API_ROUTES.LOGOUT);
      }
    } catch (e) {
      console.error("فشل مسح الكوكي من السيرفر");
    }

    sessionStorage.removeItem("user");
    setUser(null);
    isBanningInProgress = false; 

    if (redirectDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, redirectDelay));
    }

    if (pathname !== "/login" && pathname !== "/signup") {
      window.location.href = "/login";
    }
  };

  const handleUnauthorizedKick = async (isSecurity = false) => {
    if (isBanningInProgress) return;
    isBanningInProgress = true;

    if (isSecurity) showSecurityAlert();

    try {
      if (originalFetch) {
        await originalFetch(API_ROUTES.LOGOUT, { 
          method: 'POST', 
          credentials: 'include',
          headers: { 'x-device-type': currentDeviceType }
        });
      }
    } catch (e) {}

    sessionStorage.removeItem('user');
    setUser(null);

    if (isSecurity) {
        setTimeout(() => {
            window.location.href = "/login";
        }, 60000);
    } else {
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            window.location.href = "/login";
        } else {
            isBanningInProgress = false;
        }
    }
  };

  const login = async (token: string, userData: User) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    await delay(500); 
    
    if (userData.role === "ADMIN") router.push("/admin/dashboard");
    else if (userData.role === "TEACHER") router.push("/instructor/dashboard");
    else router.push("/");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const storedUser = sessionStorage.getItem('user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id) return;

        const res = await fetch(API_ROUTES.GET_ME, {
          method: "GET",
          credentials: "include",
          cache: "no-store", 
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'x-device-type': currentDeviceType
          }
        });

        if (res.ok) {
          const freshData = await res.json();
          updateUser({ 
            balance: freshData.balance,
            xp: freshData.xp,
            avatar: freshData.avatar,
            role: freshData.role,
            enrollments: freshData.enrollments
          });
        }
      }
    } catch (error) {}
  };

  const showSecurityAlert = () => {
    toast.custom(
      (t) => (
        <div
          className="max-w-md w-full bg-[#0f172a] shadow-[0_0_40px_0px_rgba(239,68,68,0.8)] rounded-2xl border-2 border-red-500/70 p-6 flex flex-col gap-4 relative overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 animate-pulse"></div>
          <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-500 w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-red-500 font-black text-xl m-0">تنبيه أمني عالي الأهمية!</h3>
              <p className="text-gray-300 text-xs mt-1">نظام حماية المنصة الذكي</p>
            </div>
          </div>
          <p className="text-white text-base leading-relaxed font-medium">
            تم إنهاء هذه الجلسة فوراً بسبب رصد تسجيل دخول لحسابك من جهاز آخر!
            <span className="block mt-3 text-red-400 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              لحماية حسابك، تم تسجيل هذا الحدث ورفع رقم الـ IP الخاص بك إلى سجلات الإدارة للمراجعة والحظر.
            </span>
          </p>
        </div>
      ),
      { id: 'security-toast', duration: 60000, position: 'top-center' } 
    );
  };

  const isSecurityMessage = (data: any) => {
    if (!data) return false;
    const stringData = JSON.stringify(data); 
    return stringData.includes('تنبيه أمني');
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(API_ROUTES.GET_ME, {
        method: "GET",
        credentials: "include", 
        headers: { 'x-device-type': currentDeviceType }
      });

      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const userData = JSON.parse(text);
            setUser(userData);
            sessionStorage.setItem("user", JSON.stringify(userData));
          } catch (e) {}
        }
      } else if (res.status === 401 || res.status === 403) { 
        const errorData = await res.json().catch(() => null);
        
        if (isSecurityMessage(errorData)) {
          handleUnauthorizedKick(true);
        } 
        else if (res.status === 401) {
          handleUnauthorizedKick(false);
        }
      }
    } catch (error) {
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    checkAuth();
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (originalFetch) {
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          if (input === API_ROUTES.LOGOUT || (typeof input === 'string' && input.includes('logout'))) {
             return originalFetch(input, init);
          }

          init = init || {};
          init.credentials = "include"; 
          
          // حقن نوع الجهاز في هيدرات الـ fetch
          init.headers = {
            ...init.headers,
            'x-device-type': currentDeviceType
          };

          const response = await originalFetch(input, init);
          
          if (response.status === 401 || response.status === 403) { 
              const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/signup" || window.location.pathname === "/";
              if (!isAuthPage) {
                try {
                    const clone = response.clone();
                    const data = await clone.json().catch(() => null);

                    if (isSecurityMessage(data)) {
                      handleUnauthorizedKick(true);
                    } 
                    else if (response.status === 401) {
                      handleUnauthorizedKick(false);
                    }
                } catch (e) {
                    if (response.status === 401) handleUnauthorizedKick(false);
                }
              }
          }
          return response;
        };
    }

    const axiosResponseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config && error.config.url === API_ROUTES.LOGOUT) {
            return Promise.reject(error);
        }

        if (error.response && (error.response.status === 401 || error.response.status === 403)) { 
          const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/signup" || window.location.pathname === "/";
          
          if (!isAuthPage) {
            const data = error.response.data;
            if (isSecurityMessage(data)) {
              handleUnauthorizedKick(true);
            } else if (error.response.status === 401) {
              handleUnauthorizedKick(false);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => { 
      if (originalFetch) window.fetch = originalFetch; 
      axios.interceptors.response.eject(axiosResponseInterceptor); 
    };
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, checkAuth, showSecurityAlert, refreshUser }}> 
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};