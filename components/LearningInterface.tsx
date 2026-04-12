"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { 
  PlayCircle, CheckSquare, Award, CheckCircle2, 
  Clock, BadgeCheck, FileText, ChevronLeft, Search, 
  CornerDownLeft, Bell, HelpCircle, GraduationCap, Star, 
  Layers, Laptop, MonitorDown, DownloadCloud, Zap, BookOpen
} from "lucide-react";
import axios from 'axios';
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { useRouter } from "next/navigation"; 
import StudentTaskSubmission from "@/components/StudentTaskSubmission";
import { useAuth } from "@/context/AuthContext";

export type LearningType = 'WORKSHOP' | 'BOOTCAMP' | 'COURSE' | 'FREE_CONTENT';

export interface LearningInterfaceProps {
  data: any;       
  type: LearningType; 
  userProgress?: string[];
}

export default function LearningInterface({ data, type, userProgress = [] }: LearningInterfaceProps) {
  const { user } = useAuth();
  const router = useRouter(); 
  
  // 🌟 فلترة المحتوى (فقط التقييمات)
  const videos = useMemo(() => data.contents?.filter((c: any) => c.type === 'VIDEO') || [], [data]);
  const tasks = useMemo(() => data.contents?.filter((c: any) => c.type === 'TASK') || [], [data]);
  const quizzes = useMemo(() => data.contents?.filter((c: any) => c.type === 'QUIZ') || [], [data]);
  const exams = useMemo(() => data.contents?.filter((c: any) => c.type === 'EXAM') || [], [data]);

  // 🌟 التبويبات الثابتة (تظهر دائماً حتى لو كانت فارغة)
  const allTabs = useMemo(() => [
    { id: 'TASKS', label: 'المهام العملية', icon: CheckSquare, count: tasks.length, color: 'text-blue-400', border: 'border-blue-500', bgHover: 'hover:bg-blue-500/10' },
    { id: 'QUIZZES', label: 'الاختبارات القصيرة', icon: HelpCircle, count: quizzes.length, color: 'text-amber-400', border: 'border-amber-500', bgHover: 'hover:bg-amber-500/10' },
    { id: 'EXAMS', label: 'الامتحانات النهائية', icon: GraduationCap, count: exams.length, color: 'text-rose-400', border: 'border-rose-500', bgHover: 'hover:bg-rose-500/10' }
  ], [tasks.length, quizzes.length, exams.length]);

  const [activeTab, setActiveTab] = useState(allTabs[0].id);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>(userProgress);

  // 🌟 جلب تقدم الطالب الفعلي
  useEffect(() => {
    const fetchUserProgress = async () => {
        try {
            const progressUrl = API_ROUTES.MY_PROGRESS ? API_ROUTES.MY_PROGRESS : `${process.env.NEXT_PUBLIC_API_URL}/enrollments/progress`;
            const res = await axios.get(progressUrl, { withCredentials: true });
            if (Array.isArray(res.data)) { setCompletedVideos(res.data); }
        } catch (error) { console.error("Failed to fetch progress", error); }
    };
    fetchUserProgress();
  }, []);

  useEffect(() => { 
      if (userProgress.length > 0) {
          setCompletedVideos(prev => Array.from(new Set([...prev, ...userProgress]))); 
      }
  }, [userProgress]);

  const courseVideoIds = videos.map((v: any) => v.id);
  const actualCompletedVideosCount = completedVideos.filter(id => courseVideoIds.includes(id)).length;
  const progressPercentage = videos.length > 0 ? Math.min(Math.round((actualCompletedVideosCount / videos.length) * 100), 100) : 0;

  const handleStartQuiz = (quizId: string) => { router.push(`/quiz/${quizId}`); };
  const handleStartExam = (examId: string) => { router.push(`/exam/${examId}`); };

  return (
    <div className="min-h-[100dvh] w-full bg-[#060a14] text-white font-sans selection:bg-purple-500/30 relative overflow-hidden" dir="rtl">
      
      {/* 🌟 تأثيرات الإضاءة الجمالية في الخلفية */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10">
        
        {/* 👇 زر العودة للقائمة الرئيسية (الداشبورد) */}
        <button 
          onClick={() => router.push('/desktop')} 
          className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all w-fit border border-white/5 hover:border-white/10 shadow-sm"
        >
          <CornerDownLeft size={16} className="rtl:rotate-180" /> العودة للقائمة الرئيسية
        </button>

        {/* ===================== 1. الهيدر (معلومات المادة والتقدم) ===================== */}
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 border border-purple-500/20 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-inner">
                        <BookOpen size={14} /> {type === 'COURSE' ? 'كورس مدفوع' : type === 'WORKSHOP' ? 'ورشة عمل' : 'معسكر تدريبي'}
                    </span>
                    <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-inner">
                        <BadgeCheck size={14} /> مسار نشط
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400 leading-tight mb-3 drop-shadow-sm">{data.title}</h1>
                <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed font-medium">{data.description || 'مرحباً بك في ساحة التقييمات والاختبارات الخاصة بهذه المادة. حقق أفضل النتائج هنا!'}</p>
            </div>

            <div className="w-full lg:w-80 shrink-0 bg-[#060a14]/80 p-5 rounded-3xl border border-white/5 relative z-10 shadow-inner">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-bold text-gray-400">تقدمك في المسار</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{progressPercentage}%</span>
                </div>
                <div className="h-3 w-full bg-[#1f2937] rounded-full overflow-hidden shadow-inner relative">
                    <div className="h-full bg-gradient-to-l from-purple-500 to-blue-500 shadow-[0_0_15px_rgba(124,58,237,0.6)] transition-all duration-1000 ease-out relative" style={{ width: `${progressPercentage}%` }}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 text-center font-bold flex items-center justify-center gap-1">
                    <MonitorDown size={12}/> يعتمد على المشاهدات في التطبيق
                </p>
            </div>
        </header>

        {/* ===================== 2. بانر تطبيق الديسكتوب ===================== */}
        <div className="mb-10 bg-gradient-to-l from-blue-900/40 to-[#0f172a] border border-blue-500/30 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] group transition-all duration-500 hover:border-blue-500/50">
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform">
                        <MonitorDown size={36} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2 drop-shadow-md">
                            تطبيق UpScale للكمبيوتر <Zap size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                            لضمان أفضل جودة وأعلى مستويات الأمان، المحاضرات والملخصات (PDF) متوفرة حصراً للعرض من خلال تطبيقنا المخصص لنظام التشغيل Windows.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                    
                    {/* 👇 زر التحميل المربوط مع BunnyCDN */}
                    <a 
                        href="https://UpscaleFile.b-cdn.net/UpScale_Setup_v1.exe" // 👈 قم بتبديل هذا النص بالرابط المباشر من BunnyCDN (مثل: https://yourzone.b-cdn.net/UpScale_Setup.exe)
                        download
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 relative overflow-hidden text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95"
                    >
                        <DownloadCloud size={20} />
                        تحميل البرنامج الآن
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                    </a>
                    
                    <span className="text-[10px] text-gray-400 mt-2 font-bold flex items-center gap-1"><Laptop size={12}/> متوافق مع Windows 10/11 - الحجم 422MB</span>
                </div>
            </div>
        </div>

        {/* ===================== 3. التبويبات الفخمة (Tabs) ===================== */}
        <div className="mb-8 relative">
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/10"></div>
            <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-4 snap-x relative z-10">
                {allTabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id} 
                            onClick={() => { setActiveTab(tab.id); setCurrentTask(null); }} 
                            className={`snap-center shrink-0 px-6 py-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 flex items-center gap-3 border ${isActive ? `bg-[#1e293b] border-b-4 ${tab.border} border-x-white/5 border-t-white/5 text-white shadow-xl transform -translate-y-1` : `bg-transparent border-transparent text-gray-500 ${tab.bgHover} hover:text-gray-300`}`}
                        >
                            <tab.icon size={20} className={isActive ? tab.color : 'opacity-50'} />
                            {tab.label}
                            <span className={`text-[11px] px-2 py-1 rounded-lg transition-all ${isActive ? `bg-white/10 ${tab.color} shadow-inner` : 'bg-white/5 text-gray-600'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* ===================== 4. مساحة عرض المحتوى (Grid Cards) ===================== */}
        <div className="min-h-[40vh]">
            <AnimatePresence mode="wait">
                
                {/* 📝 قسم المهام (TASKS) */}
                {activeTab === 'TASKS' && (
                    <motion.div key="tasks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        {currentTask ? (
                            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                <button onClick={() => setCurrentTask(null)} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl transition-colors w-fit border border-white/5 hover:border-white/10 shadow-sm">
                                    <ChevronLeft size={16} className="rtl:rotate-180" /> العودة لقائمة المهام
                                </button>
                                <StudentTaskSubmission taskId={currentTask.id} taskTitle={currentTask.title} taskDescription={currentTask.description} taskDueDate={currentTask.dueDate} />
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tasks.map((task: any) => (
                                    <div key={task.id} className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/40 rounded-[2rem] p-6 transition-all duration-300 group flex flex-col h-full shadow-lg hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        <div className="relative z-10 flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                                                    <CheckSquare size={20} />
                                                </div>
                                                {task.dueDate && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 flex items-center gap-1"><Clock size={10}/> ينتهي: {new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>}
                                            </div>
                                            <h3 className="font-black text-lg text-white mb-2 line-clamp-2 leading-snug">{task.title}</h3>
                                            <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed font-medium">{task.description || 'مهمة عملية تتطلب التنفيذ والرفع للمراجعة من قبل المدرب.'}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto relative z-10">
                                            {task.url && (
                                                <a href={task.url} target="_blank" rel="noreferrer" className="w-full sm:flex-1 text-center inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-[#1e293b] hover:bg-emerald-600 text-gray-300 hover:text-white py-3 rounded-xl border border-white/5 transition-all shadow-sm">
                                                    تصفح الملف <FileText size={14}/>
                                                </a>
                                            )}
                                            <button onClick={() => setCurrentTask(task)} className="w-full sm:flex-1 text-center inline-flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-xl transition-all bg-[#1e293b] hover:bg-blue-600 text-gray-300 hover:text-white border border-white/5 group-hover:border-blue-500/30 shadow-sm">
                                                شاشة التسليم <CornerDownLeft size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={CheckSquare} color="blue" title="لا يوجد مهام عملية حالياً" desc="لم يقم المدرب بإضافة أي مهام أو وظائف تتطلب التسليم في هذا المسار حتى الآن." />
                        )}
                    </motion.div>
                )}

                {/* 🎯 قسم الكويزات (QUIZZES) */}
                {activeTab === 'QUIZZES' && (
                    <motion.div key="quizzes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        {quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz: any) => {
                                    const specificQuiz = Array.isArray(quiz.quiz) ? quiz.quiz[0] : quiz.quiz;
                                    const difficulty = Number(specificQuiz?.difficulty || quiz.difficulty || 1);
                                    let diffText = "مستوى سهل"; let diffColor = "text-emerald-400"; let diffBg = "bg-emerald-500/10"; let diffBorder = "border-emerald-500/20";
                                    if (difficulty === 2) { diffText = "مستوى متوسط"; diffColor = "text-yellow-400"; diffBg = "bg-yellow-500/10"; diffBorder = "border-yellow-500/20"; }
                                    if (difficulty === 3) { diffText = "مستوى متقدم"; diffColor = "text-red-400"; diffBg = "bg-red-500/10"; diffBorder = "border-red-500/20"; }
                                    const duration = specificQuiz?.duration || quiz.duration || 0;

                                    return (
                                    <button key={quiz.id} onClick={() => handleStartQuiz(quiz.id)} className="text-right bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a] border border-white/5 hover:border-amber-500/50 rounded-[2rem] p-6 transition-all duration-300 group relative overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)]">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        <div className="mb-6 relative z-10 w-full flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform shadow-inner"><HelpCircle size={24} /></div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold text-gray-300 bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1"><Clock size={12} className="text-amber-400"/> {duration} دقيقة</span>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${diffColor} ${diffBg} ${diffBorder} flex items-center gap-1`}><Star size={10}/> {diffText}</span>
                                                </div>
                                            </div>
                                            <h4 className="font-black text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">{quiz.title}</h4>
                                        </div>
                                        <div className="w-full text-center bg-[#1e293b] group-hover:bg-amber-500 text-amber-500 group-hover:text-black text-sm py-3.5 rounded-xl transition-all font-black mt-auto relative z-10 border border-white/5 group-hover:border-transparent shadow-sm">
                                            بدء الاختبار القصير
                                        </div>
                                    </button>
                                )})}
                            </div>
                        ) : (
                            <EmptyState icon={HelpCircle} color="amber" title="لا يوجد اختبارات قصيرة (كويزات)" desc="لم يتم إدراج أي اختبارات قصيرة لتقييم مستواك في هذه المادة حتى الآن." />
                        )}
                    </motion.div>
                )}

                {/* 🎓 قسم الامتحانات (EXAMS) */}
                {activeTab === 'EXAMS' && (
                    <motion.div key="exams" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        {exams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam: any) => {
                                    const specificExam = Array.isArray(exam.exam) ? exam.exam[0] : exam.exam;
                                    const duration = specificExam?.duration || exam.duration || 0;

                                    return (
                                    <button key={exam.id} onClick={() => handleStartExam(exam.id)} className="text-right bg-gradient-to-br from-rose-900/10 to-[#0f172a] border border-white/5 hover:border-rose-500/50 rounded-[2rem] p-6 transition-all duration-300 group relative overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[0_15px_40px_rgba(243,33,113,0.15)]">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        <div className="mb-6 relative z-10 w-full flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform shadow-inner"><GraduationCap size={24} /></div>
                                                <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1.5"><Clock size={12} /> {duration} دقيقة</span>
                                            </div>
                                            <h4 className="font-black text-lg text-white group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug">{exam.title}</h4>
                                        </div>
                                        <div className="w-full text-center bg-gradient-to-r from-[#1e293b] to-[#1e293b] group-hover:from-rose-600 group-hover:to-pink-600 text-rose-400 group-hover:text-white text-sm py-3.5 rounded-xl transition-all font-black mt-auto relative z-10 border border-white/5 group-hover:border-transparent shadow-sm">
                                            دخول قاعة الامتحان النهائي
                                        </div>
                                    </button>
                                )})}
                            </div>
                        ) : (
                            <EmptyState icon={GraduationCap} color="rose" title="لا يوجد امتحانات نهائية حالياً" desc="الامتحانات النهائية سيتم إدراجها هنا في نهاية المسار التعليمي لتقييم اجتيازك." />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </main>
    </div>
  );
}

// 🌟 مكون (Empty State) ليظهر بشكل فخم عند عدم وجود محتوى في التبويب
function EmptyState({ icon: Icon, color, title, desc }: { icon: any, color: string, title: string, desc: string }) {
    // تحديد الألوان ديناميكياً باستخدام Tailwind classes
    const colorClasses = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', shadow: 'shadow-blue-500/20' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', shadow: 'shadow-amber-500/20' },
        rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', shadow: 'shadow-rose-500/20' }
    }[color as 'blue' | 'amber' | 'rose'] || { bg: 'bg-gray-500/10', text: 'text-gray-500', shadow: 'shadow-gray-500/20' };

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0f172a]/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-white/10 min-h-[40vh]">
            <div className={`w-28 h-28 rounded-full ${colorClasses.bg} flex items-center justify-center mb-6 shadow-xl ${colorClasses.shadow}`}>
                <Icon size={48} className={colorClasses.text} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">{title}</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed font-medium">{desc}</p>
        </div>
    );
}