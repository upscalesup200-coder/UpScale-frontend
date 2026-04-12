"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext"; 
import { 
  LayoutDashboard, Layers, Flame, LogOut, 
  BookOpen, Gift, Star, Users, Megaphone,
  BarChart3, GraduationCap, UserCheck, PlusCircle, 
  Award, Zap, Settings
} from "lucide-react";

const sidebarLinks = [
  { 
    name: "إدارة الطلاب والتسجيلات", 
    href: "/admin/dashboard/enrollments", 
    icon: BarChart3,
    color: "text-indigo-400",
    gradient: "from-indigo-500/20 to-indigo-500/0"
  },
  { 
    name: "سجلات المدرسين", 
    href: "/admin/dashboard/instructors-number", 
    icon: UserCheck,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-500/0"
  },
  { 
    name: "إضافة وتعيين مدرس", 
    href: "/admin/dashboard/instructors", 
    icon: PlusCircle,
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-teal-500/0"
  },
  { 
    name: "إدارة نخبة الخبراء", 
    href: "/admin/dashboard/elite-instructors", 
    icon: Award,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-500/0"
  },
  { 
    name: "إدارة الورشات", 
    href: "/admin/dashboard/workshops/add", 
    icon: Layers,
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-500/0"
  },
  { 
    name: "إدارة المعسكرات", 
    href: "/admin/dashboard/bootcamps/add", 
    icon: Zap, 
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-500/0"
  },
  { 
    name: "إدارة المواد", 
    href: "/admin/dashboard/courses/add", 
    icon: BookOpen,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-500/0"
  },
  { 
    name: "إدارة الأكثر طلباً", 
    href: "/admin/dashboard/featured", 
    icon: Star,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-500/0"
  },
  { 
    name: "إدارة الأخبار",
    href: "/admin/dashboard/news", 
    icon: Megaphone,
    color: "text-red-400",
    gradient: "from-red-500/20 to-red-500/0"
  },
  { 
    name: "المحتوى المجاني", 
    href: "/admin/dashboard/free-content/add", 
    icon: Gift,
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-500/0"
  },
  { 
    name: "إعدادات المنصة", 
    href: "/admin/settings", 
    icon: Settings,
    color: "text-slate-400",
    gradient: "from-slate-500/20 to-slate-500/0"
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth(); 

  const handleLogout = () => {
    logout(0); 
  };

  return (
    <aside className="w-72 bg-[#0f172a] border-l border-white/5 h-screen top-0 hidden lg:flex flex-col p-6 shadow-2xl relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/admin/dashboard" className="flex items-center gap-4 mb-10 px-2 relative z-10 hover:opacity-80 transition-opacity cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <LayoutDashboard size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-wide">لوحة التحكم</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">UpScale Admin</p>
        </div>
      </Link>

      <nav className="space-y-2 flex-1 relative z-10 overflow-y-auto custom-scrollbar">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href; 
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group overflow-hidden ${
                isActive 
                  ? "bg-white/5 text-white shadow-md border border-white/5" 
                  : "text-gray-400 hover:bg-white/[0.03] hover:text-gray-200"
              }`}
            >
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-100 transition-opacity`} />
              )}

              <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? link.color : "text-gray-500 group-hover:text-gray-300"}`}>
                <link.icon size={22} />
              </div>

              <span className="relative z-10 font-bold text-sm tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                {link.name}
              </span>
              
              {isActive && (
                <div className={`absolute left-4 w-1.5 h-1.5 rounded-full ${link.color.replace('text', 'bg')} shadow-[0_0_12px] shadow-current`} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 mt-auto relative z-10">
        <button 
            onClick={handleLogout}
            className="flex items-center justify-between group w-full p-4 rounded-2xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <LogOut size={18} className="text-gray-400 group-hover:text-red-400" />
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-gray-300 group-hover:text-white transition-colors">مغادرة الإدارة</span>
                <span className="block text-[10px] text-gray-600">تسجيل الخروج الآمن</span>
              </div>
            </div>
        </button>
      </div>
    </aside>
  );
}