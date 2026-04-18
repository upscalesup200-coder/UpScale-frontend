"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trophy, Crown, Star, User as UserIcon, Loader2, Flame, Users, Medal, Sparkles, BookOpen, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/config/api"; 
import { getImageUrl } from "@/utils/imageHelper";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>({ courses: [], workshops: [], bootcamps: [] });
  
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [error, setError] = useState(false); 
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeItemId, setActiveItemId] = useState("all");

  const categories = [
    { id: "all", label: "الترتيب العام", icon: Trophy, color: "text-yellow-500", glow: "shadow-yellow-500/20" },
    { id: "courses", label: "المواد المدفوعة", icon: BookOpen, color: "text-blue-500", glow: "shadow-blue-500/20" },
    { id: "workshops", label: "الورشات", icon: Users, color: "text-emerald-500", glow: "shadow-emerald-500/20" },
    { id: "camps", label: "المعسكرات", icon: Flame, color: "text-pink-500", glow: "shadow-pink-500/20" },
  ];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/leaderboard-filters`)
      .then(res => {
          if(!res.ok) throw new Error("Failed");
          return res.json();
      })
      .then(data => {
        setFiltersData(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingFilters(false));
  }, []);

  const handleCategoryChange = (catId: string) => {
      setActiveCategory(catId);
      
      let newItemId = "all";
      if (catId === "courses" && filtersData.courses?.length > 0) newItemId = filtersData.courses[0].id;
      else if (catId === "workshops" && filtersData.workshops?.length > 0) newItemId = filtersData.workshops[0].id;
      else if (catId === "camps" && filtersData.bootcamps?.length > 0) newItemId = filtersData.bootcamps[0].id;
      else if (catId !== "all") newItemId = ""; 
      
      setActiveItemId(newItemId);
  };

  useEffect(() => {
    if (activeItemId === "") {
      setLeaders([]);
      setLoadingLeaders(false);
      return;
    }
    
    setLoadingLeaders(true);
    fetch(`${API_BASE_URL}/api/users/leaderboard?itemId=${activeItemId}`)
      .then((res) => {
          if(!res.ok) throw new Error("Failed");
          return res.json();
      })
      .then((data) => {
        setLeaders(Array.isArray(data) ? data : []);
      })
      .catch(() => setLeaders([])) 
      .finally(() => setLoadingLeaders(false));
  }, [activeItemId]);

  const getSubFilters = () => {
    switch (activeCategory) {
      case "courses": return filtersData.courses || [];
      case "workshops": return filtersData.workshops || [];
      case "camps": return filtersData.bootcamps || [];
      default: return [];
    }
  };

  const podiumTop3 = [
    leaders.length > 1 ? leaders[1] : null, 
    leaders.length > 0 ? leaders[0] : null, 
    leaders.length > 2 ? leaders[2] : null, 
  ];

  if (loadingFilters) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin text-yellow-500 w-12 h-12" /></div>;
  if (error) return <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4"><AlertTriangle className="text-red-500" size={48} /><p>حدث خطأ في الاتصال بالخادم.</p></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="text-center mb-10 md:mb-12">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 100 }}>
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center">
                <Trophy className="text-yellow-500 w-10 h-10 md:w-12 md:h-12" />
              </div>
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 tracking-tight">
            لوحة <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">الشرف</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm md:text-lg flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-400"/> أساطير منصة UpScale المتميزين <Sparkles size={16} className="text-purple-400"/>
          </p>
        </div>

        <div className="flex justify-start md:justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-4 custom-scrollbar snap-x w-full px-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)} 
              className={`flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl text-sm md:text-base font-bold transition-all border whitespace-nowrap shrink-0 snap-center ${
                activeCategory === cat.id 
                ? `bg-white/10 border-white/20 text-white shadow-xl ${cat.glow} scale-105` 
                : `bg-black/20 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5`
              }`}
            >
              <cat.icon size={18} className={activeCategory === cat.id ? cat.color : ""} />
              {cat.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeCategory !== "all" && getSubFilters().length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex justify-center flex-wrap gap-2 mb-12 md:mb-16"
            >
              {getSubFilters().map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border ${
                    activeItemId === item.id 
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
                    : "bg-[#1e293b] border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {loadingLeaders ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-purple-500" size={40} />
            <p className="text-gray-500 font-bold animate-pulse">جاري جلب بيانات الأساطير...</p>
          </div>
        ) : activeItemId === "" || leaders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-white/5 rounded-[2rem] md:rounded-[3rem] border border-dashed border-white/10 max-w-2xl mx-auto px-4"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-gray-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-300 mb-2">الساحة فارغة حتى الآن!</h3>
            <p className="text-sm md:text-base text-gray-500 max-w-sm">
              لم يقم المدرسون بمنح نقاط خبرة لأي طالب هنا بعد. استمر في التعلم لتكون أول من يتصدر القائمة 🚀
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeItemId}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-6 mb-16 md:mb-20 px-0 md:px-4 h-auto md:h-[400px]">
                {podiumTop3.map((user, idx) => {
                  if (!user) return <div key={`empty-${idx}`} className="hidden md:block w-[280px]"></div>; 
                  
                  const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                  const isFirst = actualRank === 1;
                  const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.firstName || 'U'}&background=0D8ABC&color=fff&size=256`;

                  const podiumConfig = {
                    1: { height: "h-auto md:h-[360px]", border: "border-yellow-400/50", glow: "shadow-[0_0_50px_rgba(250,204,21,0.2)]", badge: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-yellow-500/50", order: "order-1 md:order-2" },
                    2: { height: "h-auto md:h-[320px]", border: "border-gray-300/50", glow: "shadow-[0_0_30px_rgba(209,213,219,0.1)]", badge: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-gray-400/50", order: "order-2 md:order-1" },
                    3: { height: "h-auto md:h-[300px]", border: "border-orange-400/50", glow: "shadow-[0_0_30px_rgba(251,146,60,0.1)]", badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/50", order: "order-3 md:order-3" },
                  }[actualRank]!;

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: actualRank * 0.1, type: "spring" }}
                      className={`relative w-[90%] md:w-[280px] p-6 rounded-[2rem] md:rounded-t-[2.5rem] md:rounded-b-[1.5rem] border backdrop-blur-xl flex flex-col items-center justify-start text-center pt-12 md:pt-16 bg-gradient-to-b from-white/10 to-transparent transition-transform hover:-translate-y-2 md:hover:-translate-y-4 ${podiumConfig.height} ${podiumConfig.border} ${podiumConfig.glow} ${podiumConfig.order}`}
                    >
                      {isFirst && (
                        <motion.div 
                          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -top-10 md:-top-12"
                        >
                          <Crown className="text-yellow-400 w-14 h-14 md:w-16 md:h-16 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" fill="currentColor" />
                        </motion.div>
                      )}

                      <div className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-xl border-2 border-[#0f172a] z-20 ${podiumConfig.badge}`}>
                        {actualRank}
                      </div>

                      <div className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gray-800 mb-4 overflow-hidden border-4 relative z-10 ${isFirst ? 'border-yellow-400' : actualRank === 2 ? 'border-gray-300' : 'border-orange-400'}`}>
                        {user.avatar ? (
                          <Image 
                            src={getImageUrl(user.avatar, 'avatar') || fallbackAvatar} 
                            alt={user.firstName} 
                            fill
                            sizes="112px"
                            className="object-cover" 
                            onError={(e: any) => { e.currentTarget.srcset = ""; e.currentTarget.src = fallbackAvatar; }}
                          />
                        ) : (
                          <UserIcon className="w-full h-full p-5 md:p-6 text-gray-600" />
                        )}
                      </div>

                      {/* Name styling changed to wrap correctly and avoid being cut off */}
                      <h3 className="font-black text-base sm:text-lg md:text-xl mb-4 break-words leading-tight w-full px-2">
                        {user.firstName} {user.lastName}
                      </h3>
                      
                      <div className="mt-auto flex flex-col items-center w-full">
                        <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black/30 border border-white/5 mb-2 w-full">
                           <Star size={16} className={isFirst ? "text-yellow-400" : actualRank===2 ? "text-gray-300" : "text-orange-400"} fill="currentColor" />
                           <span className="font-black text-lg md:text-xl">{user.xp}</span>
                           <span className="text-[10px] text-gray-500 pt-1">XP</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{user.rank}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {leaders.length > 3 && (
                <div className="max-w-3xl mx-auto space-y-3 relative z-10 px-2 md:px-0">
                  {leaders.slice(3).map((user, index) => {
                    const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.firstName || 'U'}&background=0D8ABC&color=fff&size=256`;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        key={user.id} 
                        className="group flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                      >
                        <div className="flex items-center gap-3 md:gap-6 w-2/3">
                          <div className="w-8 md:w-10 text-center shrink-0">
                             <span className="text-gray-500 font-black text-xl md:text-2xl group-hover:text-purple-400 transition-colors">#{index + 4}</span>
                          </div>
                          <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-[1rem] overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                            {user.avatar ? (
                              <Image 
                                src={getImageUrl(user.avatar, 'avatar') || fallbackAvatar} 
                                alt={user.firstName} 
                                fill
                                sizes="56px"
                                className="object-cover" 
                                onError={(e: any) => { e.currentTarget.srcset = ""; e.currentTarget.src = fallbackAvatar; }}
                              />
                            ) : (
                              <UserIcon className="w-full h-full p-2 md:p-3 text-gray-500 relative z-10" />
                            )}
                          </div>
                          <div className="truncate flex items-center h-full">
                            <h4 className="font-bold text-base md:text-lg text-gray-200 group-hover:text-white transition-colors truncate w-full">
                              {user.firstName} {user.lastName}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end text-right shrink-0">
                          <div className="flex items-center gap-1 md:gap-1.5 text-yellow-500">
                            <span className="font-black text-base md:text-xl">{user.xp}</span>
                            <span className="text-[10px] md:text-xs font-bold text-yellow-500/50">XP</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Medal size={10} className="text-gray-500 md:w-3 md:h-3" />
                            <span className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-wider">{user.rank}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}