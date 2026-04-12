"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Award, Loader2, 
  Menu, Flag, X, Check, ArrowRight, Eye, Image as ImageIcon, Copy, Terminal, Lock, AlertCircle, ZoomIn, ShieldAlert, LogOut,
  Sigma, Code, FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from "@/config/api"; 
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from "react-hot-toast";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';


const prepareLatexText = (str: string) => {
    if (!str) return "";
    
    let safeStr = str
        .replace(/\\left\\vert/g, '\\left|')
        .replace(/\\right\\vert/g, '\\right|')
        .replace(/\\vert/g, '|');

    if (safeStr.includes('$')) return safeStr;
    
    if (safeStr.includes('\\') && !/[\u0600-\u06FF]/.test(safeStr)) {
      return `$$${safeStr}$$`;
    }
    
    return safeStr;
};

const CodeBlock = ({ code, isSmall }: { code: string, isSmall: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        toast.error("فشل النسخ");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="my-4 w-full rounded-lg border border-white/10 overflow-hidden shadow-2xl bg-[#0d1117] group relative" 
      dir="ltr" 
      style={{ direction: 'ltr', textAlign: 'left' }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>

      <div className="bg-[#161b22] px-3 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-2 text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            <Terminal size={8} /> snippet.tsx
          </span>
        </div>
        <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded flex items-center gap-1 text-[10px]"
        >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div 
        className={`${isSmall ? 'p-3 text-sm' : 'p-6 text-[15px]'} overflow-auto max-h-[600px] custom-scrollbar bg-[#0d1117] w-full`} 
        dir="ltr"
      >
        <pre 
          className="font-mono text-slate-200 text-left leading-relaxed whitespace-pre min-w-full" 
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontVariantLigatures: "none", direction: 'ltr', textAlign: 'left' }}
        >
          <code>{code}</code>
        </pre>
      </div>
    </motion.div>
  );
};

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  
  const { examId } = use(params);
  const router = useRouter();
  
  const [examData, setExamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false); 
  
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null); 
  
  const [timeLeft, setTimeLeft] = useState<number>(0); 
  const [endTime, setEndTime] = useState<number | null>(null); 
  const [isTimeUp, setIsTimeUp] = useState(false); 
  
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [viewingDetail, setViewingDetail] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [cheatingWarnings, setCheatingWarnings] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const isSubmittingRef = useRef(false); 
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null); 

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const fetchExam = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/exam/${examId}`, {
          withCredentials: true
      });
      setExamData(res.data);
      
      if (res.data.duration && !endTime) {
          const savedEndTime = localStorage.getItem(`exam_${examId}_endTime`);
          if (savedEndTime) {
              setEndTime(parseInt(savedEndTime, 10));
          } else {
              const newEndTime = Date.now() + res.data.duration * 60 * 1000;
              setEndTime(newEndTime);
              localStorage.setItem(`exam_${examId}_endTime`, newEndTime.toString());
          }
      }

      const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
      if (savedAnswers) {
          setSelectedAnswers(JSON.parse(savedAnswers));
      }

      const savedWarnings = localStorage.getItem(`exam_${examId}_warnings`);
      if (savedWarnings) setCheatingWarnings(parseInt(savedWarnings, 10));
      
      setIsWaitingRoom(false);
      setIsLoading(false);

    } catch (err: any) {
      if (err.response && err.response.status === 403) {
          setIsWaitingRoom(true);
          setIsLoading(false); 
      } else if (err.response && err.response.status === 409) {
          setIsAlreadySubmitted(true);
          setIsLoading(false);
      } else {
          setError("خطأ في تحميل الامتحان. يرجى المحاولة لاحقاً.");
          setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (examId) fetchExam();
  }, [examId, router]);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isWaitingRoom) {
          const jitterDelay = 10000 + Math.random() * 5000; 
          interval = setInterval(() => {
              fetchExam();
          }, jitterDelay); 
      }
      return () => clearInterval(interval);
  }, [isWaitingRoom]);

  useEffect(() => {
    if (isWaitingRoom || isLoading || isSubmitted || isTimeUp || isAlreadySubmitted) return;

    const handleBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            handleCheatingAttempt();
        }, 1000);
    };

    const handleFocus = () => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [isWaitingRoom, isLoading, isSubmitted, isTimeUp, isAlreadySubmitted, cheatingWarnings]);

  useEffect(() => {
    if (isLoading || isWaitingRoom || isSubmitted || isTimeUp || isAlreadySubmitted) return;

    const interval = setInterval(async () => {
      const currentPing = Math.floor(Math.random() * 50) + 30; 

      try {
        await axios.post(`${API_BASE_URL}/api/exam/${examId}/heartbeat`, {
          ping: currentPing,
          warnings: cheatingWarnings,
          status: 'ONLINE'
        }, { 
          withCredentials: true 
        });
      } catch (error) {
        console.error("Heartbeat sync failed:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, isWaitingRoom, isSubmitted, isTimeUp, isAlreadySubmitted, examId, cheatingWarnings]);

  const handleCheatingAttempt = () => {
    if (isSubmittingRef.current || isSubmitted) return;

    const newWarningsCount = cheatingWarnings + 1;
    setCheatingWarnings(newWarningsCount);
    localStorage.setItem(`exam_${examId}_warnings`, newWarningsCount.toString());

    if (newWarningsCount === 1) {
        setShowCheatWarning(true); 
    } else if (newWarningsCount >= 2) {
        setShowCheatWarning(false);
        toast.error("تم إغلاق الامتحان لتجاوزك قوانين المراقبة المتفق عليها!", { duration: 6000 });
        forceSubmitExam(true, newWarningsCount); 
    }
  };

  const forceSubmitExam = async (isKicked = false, finalWarnings = cheatingWarnings) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      if (isKicked) {
          await axios.post(`${API_BASE_URL}/api/exam/${examId}/heartbeat`, {
              ping: 0,
              warnings: finalWarnings,
              status: 'KICKED'
          }, { withCredentials: true }).catch(()=>null);
      }

      const res = await axios.post(`${API_BASE_URL}/api/exam/${examId}/submit`, {
        answers: selectedAnswers || {}
      }, { withCredentials: true });

      setResult(res.data);
      setIsSubmitted(true);
      
      localStorage.removeItem(`exam_${examId}_answers`);
      localStorage.removeItem(`exam_${examId}_endTime`);
      localStorage.removeItem(`exam_${examId}_warnings`);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء تسليم الامتحان.";
      toast.error(errorMessage, { duration: 6000 });
      
      if (err.response?.status === 400 && errorMessage.includes('مسبقاً')) {
          localStorage.removeItem(`exam_${examId}_answers`);
          localStorage.removeItem(`exam_${examId}_endTime`);
          localStorage.removeItem(`exam_${examId}_warnings`);
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  useEffect(() => {
    if (!endTime || isSubmitted || isLoading || isWaitingRoom || isTimeUp || isAlreadySubmitted) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0 && !isTimeUp) {
        clearInterval(timer);
        setIsTimeUp(true); 
        forceSubmitExam(); 
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, isSubmitted, isLoading, isWaitingRoom, isTimeUp, isAlreadySubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (choiceId: string) => {
    if (isSubmitted || isTimeUp) return;
    const currentQuestion = examData.questions[currentQuestionIndex];
    const newAnswers = { ...selectedAnswers, [currentQuestion.id]: choiceId };
    
    setSelectedAnswers(newAnswers);
    localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(newAnswers));
  };

  const handleJumpToQuestion = (index: number) => {
      setCurrentQuestionIndex(index);
      setShowQuestionGrid(false);
  };

  const handleExitExam = () => {
    if (confirm("هل أنت متأكد من رغبتك في إغلاق الامتحان والخروج؟ (سيتم مسح إجاباتك الحالية)")) {
        localStorage.removeItem(`exam_${examId}_answers`);
        localStorage.removeItem(`exam_${examId}_endTime`);
        localStorage.removeItem(`exam_${examId}_warnings`);
        router.back();
    }
  };

  const handleSubmitManual = async () => {
    if(!confirm("هل أنت متأكد من تسليم الإجابات وإنهاء الامتحان نهائياً؟ لا يمكنك التراجع!")) return;
    forceSubmitExam();
  };

  const renderFormattedContent = (content: string, format: string = "TEXT", isSmall: boolean = false) => {
    if (!content) return null;
    
    const isLikelyMath = /\\(frac|sqrt|int|sum|prod|pmatrix|begin|end|cdot|infty|pi|theta|left|right|lim|log|cap|cup|in|exists|alpha|beta)/.test(content);
    const effectiveFormat = (format === "CODE") ? "CODE" : (format === "MATH" || isLikelyMath) ? "MATH" : "TEXT";

    return (
        <div className={`mt-4 ${isSmall ? 'p-3' : 'p-4 md:p-5'} bg-[#0d1117] rounded-2xl border border-white/10 shadow-inner w-full`}>
            
            {effectiveFormat === 'MATH' && (
                <div dir="ltr">
                    <span className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5 w-fit bg-black/30 px-3 py-1.5 rounded-lg">
                        <Sigma size={14} className="text-indigo-400"/> المعادلة الرياضية:
                    </span>
                    <div className={`w-full flex justify-start items-center overflow-x-auto custom-scrollbar ${isSmall ? 'py-1' : 'py-2 pb-4'}`} dir="ltr">
                        <div className={`${isSmall ? 'text-sm' : 'text-xl md:text-2xl'} text-slate-200`}>
                            <Latex strict={false}>{prepareLatexText(content)}</Latex>
                        </div>
                    </div>
                </div>
            )}

            {effectiveFormat === 'CODE' && (
                <div dir="ltr">
                    <span className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 w-fit bg-black/30 px-3 py-1.5 rounded-lg">
                        <Code size={14} className="text-indigo-400"/> الكود البرمجي المرفق:
                    </span>
                    <CodeBlock code={content} isSmall={isSmall} />
                </div>
            )}

            {effectiveFormat === 'TEXT' && (
                <div dir="rtl">
                    <span className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5 w-fit bg-black/30 px-3 py-1.5 rounded-lg">
                        <FileText size={14} className="text-indigo-400"/> محتوى إضافي:
                    </span>
                    <p className={`${isSmall ? 'text-xs' : 'text-[15px]'} text-slate-300 leading-relaxed whitespace-pre-wrap`} dir="auto">
                        <Latex strict={false}>{prepareLatexText(content)}</Latex>
                    </p>
                </div>
            )}
        </div>
    );
  };

  const renderFullQuestion = (questionItem: any, isSmall: boolean = false) => {
      const text = questionItem.text || questionItem.questionText || ""; 
      const content = questionItem.content; 
      const format = questionItem.format || "TEXT";

      return (
          <div className="flex flex-col w-full gap-2">
              {text && (
                  <h2 className={`${isSmall ? 'text-sm' : 'text-xl md:text-2xl'} font-bold leading-relaxed text-white text-right select-none overflow-x-auto custom-scrollbar`} dir="rtl">
                      <Latex strict={false}>{prepareLatexText(text)}</Latex>
                  </h2>
              )}
              <div className="w-full text-left select-none" dir="ltr" style={{ direction: 'ltr' }}>
                  {content ? renderFormattedContent(content, format, isSmall) : null}
              </div>
          </div>
      );
  };

  if (isAlreadySubmitted) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden relative" dir="rtl">
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full bg-[#1e293b]/40 backdrop-blur-2xl border border-red-500/20 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group"
            >
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-[#0f172a] border border-red-500/50 flex items-center justify-center shadow-xl relative z-10">
                        <Lock size={40} className="text-red-500" />
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">غير مصرح لك بالدخول</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            لقد قمت بتقديم هذا الامتحان مسبقاً. نظامنا لا يسمح بإعادة تقديم الامتحانات النهائية لضمان تكافؤ الفرص للجميع.
                        </p>
                    </div>

                    <button onClick={() => router.back()} className="px-6 py-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <ArrowRight size={18}/> العودة للقائمة
                    </button>
                </div>
            </motion.div>
        </div>
      );
  }

  if (isWaitingRoom) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden relative" dir="rtl">
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                        <div className="w-24 h-24 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center shadow-xl relative z-10 ring-4 ring-amber-500/10">
                            <Clock size={40} className="text-amber-500" />
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">الامتحان مغلق</h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-[80%] mx-auto">
                            لم يقم المدرب بفتح الامتحان بعد. يرجى الانتظار، سيتم تحديث الصفحة تلقائياً فور البدء.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-5 py-2.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Loader2 size={14} className="animate-spin" />
                        <span>جاري الاتصال بالخادم...</span>
                    </div>
                </div>
            </motion.div>
        </div>
      );
  }

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4"><Loader2 className="animate-spin text-indigo-500" size={50}/><span className="animate-pulse text-indigo-300">جاري تجهيز الامتحان...</span></div>;
  if (error || !examData) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4"><AlertCircle size={50} className="text-red-500"/><p>{error}</p><button onClick={() => router.back()} className="px-4 py-2 bg-white/10 rounded">العودة</button></div>;

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans overflow-y-auto relative selection:bg-indigo-500/30" dir="rtl">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10"></div>
        
        <AnimatePresence>
        {viewingDetail && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" 
                onClick={() => setViewingDetail(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1e293b] border border-white/10 w-full max-w-4xl rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <h3 className="text-base font-bold text-indigo-400">تفاصيل السؤال</h3>
                        <button onClick={() => setViewingDetail(null)} aria-label="إغلاق التفاصيل" title="إغلاق التفاصيل" className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"><X size={18} /></button>
                    </div>
                    
                    <div className="mb-6">{renderFullQuestion(viewingDetail)}</div>

                    {viewingDetail.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/30 flex justify-center p-3">
                            <img src={getImageUrl(viewingDetail.imageUrl)!} alt="Question" className="max-h-[250px] object-contain" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-lg border overflow-x-auto custom-scrollbar ${viewingDetail.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
    <span className={`text-[10px] font-bold block mb-1 ${viewingDetail.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>إجابتك</span>
    <span className="font-bold text-white text-sm">
        <Latex strict={false}>{prepareLatexText(viewingDetail.userAnswer)}</Latex>
    </span>
</div>
<div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg overflow-x-auto custom-scrollbar">
    <span className="text-[10px] text-emerald-400 font-bold block mb-1">الإجابة الصحيحة</span>
    <span className="font-bold text-white text-sm">
        <Latex strict={false}>{prepareLatexText(viewingDetail.correctAnswer)}</Latex>
    </span>
</div>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-[1.5rem] p-8 text-center border ${result.isPassed ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'} backdrop-blur-xl shadow-xl`}
            >
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-xl ring-4 ${result.isPassed ? 'bg-emerald-500 text-white ring-emerald-500/20' : 'bg-red-500 text-white ring-red-500/20'}`}>
                    {result.isPassed ? <Award size={40} /> : <XCircle size={40} />}
                </div>
                
                <h1 className="text-2xl font-bold mb-2">
                    {result.isPassed ? 'مبارك! اجتزت الامتحان بنجاح 🥳' : 'حظ أوفر في المرة القادمة 😔'}
                </h1>
                
                <p className="text-slate-400 mb-6 text-sm">
                    نتيجتك هي: 
                    <span className={`font-bold text-2xl mx-1 ${result.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.score}
                    </span>
                    من أصل
                    <span className="font-bold text-xl mx-1 text-slate-200">
                        {result.totalMaxPoints}
                    </span>
                </p>

                <button onClick={() => router.back()} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-sm transition-all flex items-center gap-2 mx-auto">
                    <ArrowRight size={16}/> العودة للقائمة
                </button>
            </motion.div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[1.5rem] overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/5 flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/10"><CheckCircle2 size={18}/></div>
                    <h3 className="text-lg font-bold">تحليل الإجابات</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-start w-1/3">السؤال</th>
                                <th className="px-4 py-3 text-start">إجابتك</th>
                                <th className="px-4 py-3 text-center">الحالة</th>
                                <th className="px-4 py-3 text-center">التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {result.details?.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-slate-300 font-medium truncate max-w-[200px]">{item.questionText?.substring(0, 60) || "نص السؤال"}...</td>
                                    <td className={`px-4 py-3 font-bold ${item.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <Latex strict={false}>{prepareLatexText(item.userAnswer)}</Latex>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.isCorrect ? <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> : <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                         <button 
                                            onClick={() => {
                                                const originalQuestion = examData.questions.find((q: any) => q.id === item.questionId || q.id === item.id) || examData.questions[index];
                                                setViewingDetail({
                                                    ...originalQuestion, 
                                                    ...item              
                                                });
                                            }} 
                                            aria-label="عرض تفاصيل السؤال" 
                                            title="عرض التفاصيل" 
                                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 rounded-lg transition-all"
                                        >
                                            <Eye size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const currentOptions = currentQuestion.options || currentQuestion.choices || []; 
  const totalQuestions = examData.questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  const timerPercentage = (timeLeft / (examData.duration * 60)) * 100;
  const timerColor = timerPercentage > 20 ? 'text-indigo-400' : 'text-red-500 animate-pulse';

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden flex flex-col md:flex-row selection:bg-indigo-500/30" dir="rtl">
      
      <AnimatePresence>
        {showCheatWarning && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-red-950/80 border border-red-500 max-w-lg w-full rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                >
                    <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                        <ShieldAlert size={48} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">تحذير صارم!</h2>
                    <p className="text-red-200 text-lg leading-relaxed mb-8">
                        يمنع منعاً باتاً مغادرة نافذة الامتحان أو فتح تبويبات أخرى. لقد تم تسجيل هذه المحاولة.
                        <br/>
                        <strong className="text-white mt-2 block">في حال تكرار هذا الأمر، سيتم إغلاق الامتحان وتسليمه تلقائياً!</strong>
                    </p>
                    <button 
                        onClick={() => setShowCheatWarning(false)}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full w-full shadow-lg transition-colors"
                    >
                        أفهم ذلك، عُد إلى الامتحان
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200 select-none">
                <div 
                    onContextMenu={(e) => { e.preventDefault(); return false; }} 
                    className="fixed inset-0 z-[70]"
                />
                
                <div className="flex justify-between items-center p-4 bg-[#111827] border-b border-white/10 text-white z-[80] relative">
                    <h3 className="font-bold text-sm flex items-center gap-2"><ImageIcon size={16} className="text-blue-400"/> معاينة الصورة (محمي)</h3>
                    <button onClick={() => setZoomedImage(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" aria-label="إغلاق المعاينة" title="إغلاق المعاينة">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                    <img 
                        src={zoomedImage} 
                        alt="Zoomed" 
                        className="max-w-full max-h-full object-contain shadow-2xl relative z-[73]" 
                    />
                </div>
            </div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#0f172a]/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:translate-x-0 md:static ${showQuestionGrid ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-5 border-b border-white/5 relative">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white"><Flag className="text-indigo-500" size={18} /> خريطة الامتحان</h2>
            <p className="text-[10px] text-slate-500 mt-1 mr-7">يمكنك التنقل بحرية بين الأسئلة</p>
            <button onClick={() => setShowQuestionGrid(false)} aria-label="إغلاق القائمة" title="إغلاق القائمة" className="md:hidden absolute top-5 left-5 p-1.5 bg-white/5 rounded-lg text-slate-400"><X size={18}/></button>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
                {examData.questions.map((_: any, idx: number) => {
                    const isAnswered = !!selectedAnswers[examData.questions[idx].id];
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleJumpToQuestion(idx)} 
                            aria-label={`السؤال ${idx + 1}`}
                            title={`الانتقال إلى السؤال ${idx + 1}`}
                            className={`
                                w-full text-right px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between group
                                ${isCurrent 
                                    ? 'bg-gradient-to-l from-indigo-600/90 to-indigo-700/90 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                                    : isAnswered 
                                        ? 'bg-emerald-900/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/20' 
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] ${isCurrent ? 'bg-white/20' : 'bg-black/20'}`}>{idx + 1}</span>
                                السؤال {idx + 1}
                            </span>
                            {isAnswered && <CheckCircle2 size={14} className={isCurrent ? 'text-white/80' : 'text-emerald-500'} />}
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="p-4 bg-gradient-to-t from-[#0f172a] to-transparent">
            <button onClick={() => handleSubmitManual()} disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group border border-white/10">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>تسليم نهائي <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /></>}
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen relative z-0">
        
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setShowQuestionGrid(true)} aria-label="فتح القائمة" title="فتح القائمة" className="md:hidden p-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"><Menu size={18}/></button>
                <div className="hidden md:flex flex-col">
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">الاختبار الحالي</span>
                     <span className="text-xs font-bold text-slate-200">{examData.title || "امتحان نهائي"}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <button onClick={handleExitExam} title="إغلاق الامتحان والخروج" className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-full border border-white/5 hover:border-red-500/20 transition-colors">
                    <LogOut size={14} /> إغلاق وتراجع
                </button>

                <div className={`flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner ${timerColor}`}>
                    <Clock size={16} />
                    <span className="font-mono text-lg font-bold tracking-widest pt-0.5">{formatTime(timeLeft)}</span>
                </div>

                <button onClick={handleExitExam} title="إغلاق الامتحان" className="sm:hidden p-2 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full border border-white/5 hover:border-red-500/20 transition-colors">
                    <LogOut size={16} />
                </button>
            </div>
        </header>

        <div className="h-0.5 w-full bg-white/5 relative">
            <motion.div 
                className="absolute top-0 right-0 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            
            <div className="w-full max-w-4xl mx-auto pb-12 pt-4">
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 15, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.99 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full"
                    >
                        <div className="bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                            
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold tracking-wide">
                                    سؤال {currentQuestionIndex + 1} من {totalQuestions}
                                </span>
                                {currentQuestion.imageUrl && <span className="text-xs text-slate-400 flex items-center gap-1.5"><ImageIcon size={14}/> يحتوي على صورة</span>}
                            </div>

                            <div className="mb-8">
                                {renderFullQuestion(currentQuestion)}
                            </div>

                            {currentQuestion.imageUrl && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="mb-8 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-lg relative group"
                                    onContextMenu={(e) => e.preventDefault()} 
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-10">
                                        <button 
                                            onClick={() => setZoomedImage(getImageUrl(currentQuestion.imageUrl)!)} 
                                            aria-label="عرض الصورة بحجم كامل" 
                                            title="عرض بحجم كامل" 
                                            className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold hover:bg-white/30 transition-colors flex items-center gap-1.5 pointer-events-auto shadow-lg"
                                        >
                                            <ZoomIn size={16}/> معاينة مكبرة
                                        </button>
                                    </div>
                                    <img 
                                        src={getImageUrl(currentQuestion.imageUrl)!} 
                                        alt="صورة توضيحية" 
                                        className="w-full h-auto max-h-[350px] object-contain mx-auto select-none pointer-events-none relative z-0 p-2" 
                                    />
                                </motion.div>
                            )}

                            <div className="grid gap-4 mt-8">
                                {currentOptions.map((choice: any, idx: number) => {
                                    const isSelected = selectedAnswers[currentQuestion.id] === choice.id;
                                    return (
                                        <motion.button
                                            key={choice.id}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleOptionSelect(choice.id)}
                                            className={`
                                                relative w-full p-5 rounded-xl border flex items-center justify-between transition-all duration-200 group overflow-hidden text-right
                                                ${isSelected 
                                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.2)]' 
                                                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-4 z-10 w-full">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500 group-hover:border-slate-300'}`}>
                                                    {isSelected && <motion.div layoutId="check" className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className={`text-[15px] md:text-base font-medium flex-1 overflow-x-auto custom-scrollbar leading-relaxed ${isSelected ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`} dir="auto">
                                                    <Latex strict={false}>{prepareLatexText(choice.text)}</Latex>
                                                </span>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>
        </main>
      </div>
    </div>
  );
}