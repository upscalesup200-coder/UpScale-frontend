"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link"; 
import axios from 'axios'; 
import { API_ROUTES } from "@/config/api";
import { API_BASE_URL } from "@/config/api"; 
import { 
  Video, FileText, CheckSquare, Plus, Link as LinkIcon, 
  Loader2, HelpCircle, Trash2, GraduationCap, Pencil, LayoutDashboard, Upload,
  Code, Type, Sigma, BookOpen, Layers, Star, File, Users, CheckCircle, Clock, ArrowRight,
  Tent, Wrench, Gift, Percent, Lock, Unlock, X, Copy, Eye, Check
} from "lucide-react";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import MathInput from "@/components/MathInput"; 
import { getImageUrl } from "@/utils/imageHelper";

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const CodeBlock = ({ code, isSmall }: { code: string, isSmall: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2 w-full rounded-lg border border-white/10 overflow-hidden shadow-xl bg-[#0d1117] relative" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
      <div className="bg-[#161b22] px-3 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/80"></div><div className="w-2 h-2 rounded-full bg-yellow-500/80"></div><div className="w-2 h-2 rounded-full bg-green-500/80"></div></div>
          <span className="ml-2 text-[10px] text-slate-400 font-mono">snippet</span>
        </div>
        <button type="button" onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 transition-all border border-white/5">
          {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={`${isSmall ? 'p-3 text-[10px]' : 'p-4 text-xs md:text-sm'} overflow-x-auto custom-scrollbar`} dir="ltr">
        <pre className="font-mono text-slate-300 text-left whitespace-pre"><code>{code}</code></pre>
      </div>
    </div>
  );
};

export default function InstructorDashboard() {
  const [data, setData] = useState<any>({ courses: [], workshops: [], bootcamps: [], freeContent: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [contentType, setContentType] = useState("VIDEO"); 
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  
  const [dueDate, setDueDate] = useState<string>(""); 
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0); 

  const [quizDuration, setQuizDuration] = useState<number>(30);
  const [quizDifficulty, setQuizDifficulty] = useState<number>(1);
  const [quizTotalScore, setQuizTotalScore] = useState<number>(100);
  
  const [questions, setQuestions] = useState<any[]>([
    { 
      id: 1, text: "", content: "", format: "TEXT", type: "MCQ", points: 10, 
      imageUrl: "", isUploading: false, allowMultipleCorrect: false, 
      choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] 
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<{[key: number]: HTMLInputElement | null}>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

const fetchData = async () => {
    try {
      const res = await fetch(API_ROUTES.INSTRUCTOR_MY_ITEMS, {
        credentials: "include" 
      });
      if (!res.ok) {
         if (res.status === 401) { window.location.href = '/login'; return null; }
         return null;
      }
      const text = await res.text();
      if (!text || text.length === 0) return { courses: [], workshops: [], bootcamps: [], freeContent: [] };
      const rawData = JSON.parse(text);
      setData({
        courses: Array.isArray(rawData.courses) ? rawData.courses : [],
        workshops: Array.isArray(rawData.workshops) ? rawData.workshops : [],
        bootcamps: Array.isArray(rawData.bootcamps) ? rawData.bootcamps : [],
        freeContent: Array.isArray(rawData.freeContent) ? rawData.freeContent : []
      });
      return rawData;
    } catch (err) {
      console.error("Error parsing data:", err);
      return { courses: [], workshops: [], bootcamps: [], freeContent: [] };
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().then((newData) => {
      if (newData && !selectedItem) {
        if (newData.bootcamps?.length > 0) handleSelectItem(newData.bootcamps[0], 'BOOTCAMP');
        else if (newData.workshops?.length > 0) handleSelectItem(newData.workshops[0], 'WORKSHOP');
        else if (newData.courses?.length > 0) handleSelectItem(newData.courses[0], 'COURSE');
        else if (newData.freeContent?.length > 0) handleSelectItem(newData.freeContent[0], 'FREE_CONTENT');
      }
      setLoading(false);
    });
  }, []);

 const handleSelectItem = (item: any, type: string) => {
      setSelectedItem({ ...item, type });
      setContentType(type === 'FREE_CONTENT' ? 'QUIZ' : 'VIDEO'); 
      resetForms();
  };

  const resetForms = () => {
    setContentTitle("");
    setContentUrl("");
    setDueDate(""); 
    setEditingContentId(null);
    setIsUploadingFile(false);
    setIsVideoUploading(false);
    setUploadProgress(0); 
    
    setQuizDifficulty(1);
    setQuizDuration(30);
    setQuizTotalScore(100);
    setQuestions([{ id: Date.now(), text: "", content: "", format: "TEXT", type: "MCQ", points: 10, imageUrl: "", isUploading: false, allowMultipleCorrect: false, choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
  };

const handleVideoUpload = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_VIDEO_SIZE) {
          alert("❌ حجم الفيديو كبير جداً! أقصى حد مسموح هو 2 جيجابايت.");
          e.target.value = null;
          return;
      }

      setIsVideoUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', contentTitle || file.name);

      const isPaidContent = selectedItem.type !== 'FREE_CONTENT';
      const uploadUrl = isPaidContent 
          ? `${API_BASE_URL}/api/vdocipher/upload`
          : `${API_BASE_URL}/api/users/upload-video`;

      try {
          const res = await axios.post(uploadUrl, formData, {
              withCredentials: true, 
              headers: { 
                  'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                  setUploadProgress(percentCompleted);
              }
          });

          setContentUrl(res.data.url || res.data.videoId); 
          alert(`✅ تم رفع الفيديو إلى السيرفر بنجاح! ${isPaidContent ? '(مشفّر)' : '(مجاني)'}\n\n🔓 تم فتح حقل العنوان الآن، يرجى كتابة "عنوان الفيديو" ثم الضغط على "إضافة للقائمة".`);
      } catch (error) {
          console.error("Upload Error:", error);
          alert("❌ فشل رفع الفيديو، تأكد من الاتصال بالإنترنت.");
      } finally {
          setIsVideoUploading(false);
          setUploadProgress(0);
          e.target.value = null; 
      }
  };

const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        alert("❌ حجم الملف كبير جداً! أقصى حد مسموح هو 20 ميجابايت.");
        e.target.value = null;
        return;
    }

    setIsUploadingFile(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await axios.post(API_ROUTES.UPLOAD_MEDIA, formData, {
            withCredentials: true, 
            headers: { 
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress(percentCompleted);
            }
        });
        
        setContentUrl(res.data.url); 
        
    } catch (error) {
        alert("❌ فشل رفع الملف، تأكد من الاتصال.");
    } finally {
        setIsUploadingFile(false);
        setUploadProgress(0);
    }
  };

const handleImageUpload = async (qIndex: number, file: File) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        alert("❌ حجم الصورة كبير جداً!");
        return;
    }

    setQuestions(prev => {
        const up = [...prev];
        up[qIndex].isUploading = true;
        return up;
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await fetch(API_ROUTES.UPLOAD_MEDIA, {
            method: 'POST',
            credentials: 'include', 
            body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        updateQuestion(qIndex, 'imageUrl', data.url);
    } catch (error) {
        alert("❌ فشل رفع الصورة");
    } finally {
        setQuestions(prev => {
            const up = [...prev];
            up[qIndex].isUploading = false;
            return up;
        });
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now(), text: "", content: "", format: "TEXT", type: "MCQ", points: 10, imageUrl: "", isUploading: false,
      allowMultipleCorrect: false, 
      choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] 
    }]);
  };

  const removeQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const updateChoice = (qIndex: number, cIndex: number, field: string, value: any) => {
    const newQ = [...questions];
    if (field === 'isCorrect' && !newQ[qIndex].allowMultipleCorrect) {
        newQ[qIndex].choices = newQ[qIndex].choices.map((c: any, i: number) => ({
            ...c,
            isCorrect: i === cIndex ? value : false
        }));
    } else {
        newQ[qIndex].choices[cIndex][field] = value;
    }
    setQuestions(newQ);
  };

  const addChoice = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].choices.push({ text: "", isCorrect: false });
    setQuestions(newQ);
  };

  const removeChoice = (qIndex: number, cIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].choices.splice(cIndex, 1);
    setQuestions(newQ);
  };

  const refreshSelectedItem = (updatedData: any) => {
      if (!selectedItem) return;
      let updatedItem = null;
      if (selectedItem.type === 'COURSE') updatedItem = updatedData.courses?.find((i: any) => i.id === selectedItem.id);
      else if (selectedItem.type === 'WORKSHOP') updatedItem = updatedData.workshops?.find((i: any) => i.id === selectedItem.id);
      else if (selectedItem.type === 'BOOTCAMP') updatedItem = updatedData.bootcamps?.find((i: any) => i.id === selectedItem.id);
      else if (selectedItem.type === 'FREE_CONTENT') updatedItem = updatedData.freeContent?.find((i: any) => i.id === selectedItem.id);
      if (updatedItem) { setSelectedItem({ ...updatedItem, type: selectedItem.type }); }
  };

const handleDeleteContent = async (contentId: string) => {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذا المحتوى؟ (سيتم الحذف من المنصة فقط)")) return;
    try {
      const res = await fetch(API_ROUTES.INSTRUCTOR_DELETE_CONTENT(contentId), {
        method: 'DELETE',
        credentials: "include" 
      });
      if (res.ok) {
        alert("تم الحذف بنجاح 🗑️");
        const updatedData = await fetchData();
        if (updatedData) refreshSelectedItem(updatedData);
      } else { alert("فشل الحذف"); }
    } catch (err) { alert("خطأ في الاتصال"); }
  };

  const handleEditContent = (content: any) => {
    setEditingContentId(content.id);
    setContentType(content.type);
    setContentTitle(content.title);
    
    if (content.type === 'TASK' && content.dueDate) {
        const dateObj = new Date(content.dueDate);
        if (!isNaN(dateObj.getTime())) {
            setDueDate(dateObj.toISOString().slice(0, 16));
        } else {
            setDueDate("");
        }
    } else {
        setDueDate("");
    }

    setActiveTab('create'); 

    if (content.type === 'VIDEO' || content.type === 'TASK' || content.type === 'SUMMARY') {
        setContentUrl(content.url || "");
    } else if (content.type === 'QUIZ' || content.type === 'EXAM') {
        
        const specificData = content.type === 'QUIZ' ? content.quiz : content.exam;
        const specificObj = Array.isArray(specificData) ? specificData[0] : specificData;

        setQuizDuration(specificObj?.duration || content.duration || 30);
        setQuizDifficulty(specificObj?.difficulty || content.difficulty || 1);
        setQuizTotalScore(specificObj?.totalScore || content.totalScore || 100);
        
        const existingQuestions = specificObj?.questions || content.questions;
        
        if(existingQuestions && existingQuestions.length > 0) {
            setQuestions(existingQuestions.map((q: any) => ({ 
                ...q, 
                format: q.format || "TEXT",
                content: q.content || "",
                imageUrl: q.imageUrl || "", 
                allowMultipleCorrect: q.allowMultipleCorrect || false,
                choices: q.choices?.length > 0 ? q.choices.map((c: any) => ({
                    id: c.id,
                    text: c.text || "",
                    isCorrect: c.isCorrect || false
                })) : [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
            })));
        } else {
             setQuestions([{ id: Date.now(), text: "", content: "", format: "TEXT", type: "MCQ", points: 10, imageUrl: "", isUploading: false, allowMultipleCorrect: false, choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!selectedItem) return;
    
    if (contentType === 'VIDEO' && !contentUrl) {
      alert("الرجاء اختيار ورفع فيديو أولاً.");
      return;
    }

    setIsSubmitting(true);
    try {
      let url = editingContentId 
          ? API_ROUTES.INSTRUCTOR_UPDATE_CONTENT(editingContentId)
          : API_ROUTES.INSTRUCTOR_ADD_CONTENT;
          
      const method = editingContentId ? 'PATCH' : 'POST';
      let body: any = {
        title: contentTitle,
        type: contentType,
        targetId: selectedItem.id,
        targetType: selectedItem.type,
      };

      if (contentType === 'TASK') {
        body.url = contentUrl;
        if (dueDate) {
            const dateObj = new Date(dueDate);
            body.dueDate = isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
        } else {
            body.dueDate = null;
        }
      } else if (contentType === 'VIDEO' || contentType === 'SUMMARY') {
        body.url = contentUrl;
      } else if (contentType === 'QUIZ' || contentType === 'EXAM') {
        if (!editingContentId) {
            url = contentType === 'QUIZ' ? API_ROUTES.CREATE_QUIZ : API_ROUTES.CREATE_EXAM;
        }
        body = {
            ...body,
            duration: quizDuration,
            difficulty: quizDifficulty,
            totalScore: quizTotalScore,
            accessCode: "", 
            questions: questions.map(q => ({
                text: q.text,
                content: q.content, 
                format: q.format,
                type: q.type,
                imageUrl: q.imageUrl,
                points: q.points,
                allowMultipleCorrect: q.allowMultipleCorrect,
                choices: q.choices
            }))
        };
      }

const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' }, 
        credentials: "include", 
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(editingContentId ? "تم التعديل بنجاح ✅" : "تمت الإضافة بنجاح ✅");
        resetForms();
        const updatedData = await fetchData();
        if (updatedData) refreshSelectedItem(updatedData);
        if (contentType === 'QUIZ' || contentType === 'EXAM') { setContentType("VIDEO"); }
        setActiveTab('list');
      } else { alert("فشل العملية!"); }
    } catch (err) { alert("خطأ في الاتصال"); } finally { setIsSubmitting(false); }
  };

  const renderContentSection = (title: string, items: any[], Icon: any, colorClass: string, iconColorClass: string) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${iconColorClass}`}>
                <Icon size={22} className={iconColorClass} /> {title} 
                <span className="text-xs bg-white/10 text-white/60 px-2.5 py-0.5 rounded-full border border-white/5">{items.length}</span>
            </h3>
            <div className="overflow-x-auto bg-[#162032]/50 border border-white/5 rounded-2xl shadow-xl backdrop-blur-sm custom-scrollbar">
                <table className="w-full text-right border-collapse min-w-[600px]">
                    <thead className="bg-black/20 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-4 rounded-tr-2xl w-1/2">العنوان</th>
                            <th className="p-4 hidden md:table-cell">التفاصيل</th>
                            <th className="p-4 rounded-tl-2xl text-center w-40">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {items.map((content: any) => (
                            <tr key={content.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 font-bold text-gray-200 border-l border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${colorClass} shadow-lg shadow-black/20 shrink-0`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className="line-clamp-1">{content.title}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400 hidden md:table-cell">
                                    {content.type === 'EXAM' ? <span className="text-indigo-400 font-mono text-xs bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20">امتحان نهائي</span> :
                                     content.type === 'QUIZ' ? <span className="text-purple-400 font-mono text-xs bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">اختبار تفاعلي</span> :
                                     content.type === 'TASK' && content.dueDate ? <span className="text-blue-400 font-mono text-xs bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 flex items-center w-fit gap-1"><Clock size={10}/> {new Date(content.dueDate).toLocaleDateString('ar-EG')}</span> :
                                     content.url ? <a href={content.type === 'VIDEO' ? '#' : content.url} target="_blank" className="hover:text-white underline flex items-center gap-1 text-xs transition-colors">مرفوع <CheckCircle size={12}/></a> : <span className="text-white/20">-</span>}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2 md:opacity-60 md:group-hover:opacity-100 transition-all">
                                        {content.type === 'TASK' && (
                                            <Link href={`/instructor/submissions/${content.id}`}>
                                                <button className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all md:hover:scale-110" title="عرض التسليمات" aria-label="عرض التسليمات">
                                                    <Users size={16} />
                                                </button>
                                            </Link>
                                        )}
                                        <button onClick={() => handleEditContent(content)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all md:hover:scale-110" title="تعديل" aria-label="تعديل"><Pencil size={16} /></button>
                                        <button onClick={() => handleDeleteContent(content.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all md:hover:scale-110" title="حذف" aria-label="حذف"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin" size={40} /></div>;

  const hasContent = (data?.courses?.length > 0) || (data?.workshops?.length > 0) || (data?.bootcamps?.length > 0) || (data?.freeContent?.length > 0);
  if (!hasContent) { return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 text-center">لا يوجد مواد مرتبطة بحسابك كمدرس حالياً</div>; }

  const videos = selectedItem ? selectedItem.contents?.filter((c:any) => c.type === 'VIDEO') || [] : [];
  const quizzes = selectedItem ? selectedItem.contents?.filter((c:any) => c.type === 'QUIZ') || [] : [];
  const exams = selectedItem ? selectedItem.contents?.filter((c:any) => c.type === 'EXAM') || [] : [];
  const tasks = selectedItem ? selectedItem.contents?.filter((c:any) => c.type === 'TASK') || [] : [];
  const summaries = selectedItem ? selectedItem.contents?.filter((c:any) => c.type === 'SUMMARY') || [] : [];

  const isQuizBuilderActive = activeTab === 'create' && (contentType === 'QUIZ' || contentType === 'EXAM');

  if (isQuizBuilderActive) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-6 pt-24" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#162032] border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-2 h-full ${contentType === 'EXAM' ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                    <div className="text-center md:text-right">
                        <h1 className="text-xl md:text-2xl font-black flex flex-col md:flex-row items-center gap-3">
                            {contentType === 'EXAM' ? <GraduationCap className="text-indigo-400" size={32}/> : <HelpCircle className="text-purple-400" size={32}/>}
                            {editingContentId ? 'تعديل' : 'إعداد'} {contentType === 'EXAM' ? 'امتحان شامل' : 'كويز تفاعلي'}
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
                            <BookOpen size={16}/> تابع لـ: <span className="font-bold text-white">{selectedItem?.title}</span>
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <button 
                            type="button"
                            title="إلغاء والعودة"
                            aria-label="إلغاء والعودة"
                            onClick={() => { resetForms(); setContentType("VIDEO"); }} 
                            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            إلغاء والعودة <ArrowRight size={18}/>
                        </button>
                        <button 
                            type="button"
                            title="حفظ الاختبار"
                            aria-label="حفظ الاختبار"
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${contentType === 'EXAM' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18}/> حفظ الاختبار</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#162032] p-6 rounded-[2rem] border border-white/10 shadow-xl">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold">عنوان الاختبار</label>
                            <input 
                              type="text" 
                              title="عنوان الاختبار" 
                              aria-label="عنوان الاختبار" 
                              value={contentTitle} 
                              onChange={(e) => setContentTitle(e.target.value)} 
                              placeholder="مثال: اختبار الفصل الأول" 
                              className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-purple-500 outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold">المدة (بالدقائق)</label>
                            <input 
                              type="number" 
                              title="المدة بالدقائق" 
                              aria-label="المدة بالدقائق" 
                              value={quizDuration} 
                              onChange={(e) => setQuizDuration(parseInt(e.target.value))} 
                              className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-purple-500 outline-none text-sm text-center font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold">العلامة الكلية</label>
                            <input 
                              type="number" 
                              title="العلامة الكلية" 
                              aria-label="العلامة الكلية" 
                              value={quizTotalScore} 
                              onChange={(e) => setQuizTotalScore(parseFloat(e.target.value))} 
                              className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-purple-500 outline-none text-sm text-center font-mono"
                            />
                        </div>
                    </div>
                    {contentType === 'QUIZ' && (
                        <div className="bg-[#162032] p-6 rounded-[2rem] border border-white/10 shadow-xl flex flex-col justify-center space-y-2">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-1"><Star size={14} className="text-yellow-500"/> مستوى الصعوبة</label>
                            <select 
                              title="مستوى الصعوبة" 
                              aria-label="مستوى الصعوبة" 
                              value={quizDifficulty} 
                              onChange={(e) => setQuizDifficulty(parseInt(e.target.value))} 
                              className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-yellow-500 outline-none cursor-pointer appearance-none text-sm"
                            >
                                <option value={1}>⭐ سهل</option>
                                <option value={2}>⭐⭐ متوسط</option>
                                <option value={3}>⭐⭐⭐ صعب</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                        <Layers className={contentType === 'EXAM' ? 'text-indigo-400' : 'text-purple-400'}/> أسئلة الاختبار ({questions.length})
                    </h2>

                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-[#162032] border border-white/10 rounded-3xl p-4 md:p-6 relative group shadow-lg">
                            <div className="absolute top-4 md:top-6 left-4 md:left-6">
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="p-2 md:p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors" title="حذف السؤال" aria-label="حذف السؤال"><Trash2 size={16} className="md:w-[18px] md:h-[18px]"/></button>
                            </div>
                            
                            <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 pr-0 md:pr-2 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-base md:text-lg ${contentType === 'EXAM' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'}`}>
                                        {qIndex + 1}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap md:flex-nowrap bg-black/40 rounded-xl p-1.5 gap-1 self-start w-full md:w-auto">
                                    <button type="button" title="نص عادي" aria-label="نص عادي" onClick={() => updateQuestion(qIndex, 'format', 'TEXT')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all ${q.format === 'TEXT' || !q.format ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Type size={14}/> نص</button>
                                    <button type="button" title="كود" aria-label="كود" onClick={() => updateQuestion(qIndex, 'format', 'CODE')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all ${q.format === 'CODE' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Code size={14}/> كود</button>
                                    <button type="button" title="رياضيات" aria-label="رياضيات" onClick={() => updateQuestion(qIndex, 'format', 'MATH')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all ${q.format === 'MATH' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Sigma size={14}/> رياضيات</button>
                                </div>
                                
                                <div className="w-full md:w-32 mt-4 md:mt-0">
                                    <label className="text-[10px] text-gray-500 font-bold mb-1 block text-right md:text-center">درجة السؤال</label>
                                    <input 
                                      type="number" 
                                      title="درجة السؤال" 
                                      aria-label="درجة السؤال" 
                                      value={q.points || 0} 
                                      onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)} 
                                      className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-2 px-2 text-center text-base md:text-lg font-bold text-green-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold">السؤال (المنطوق):</label>
                                    <textarea 
                                        title="نص السؤال"
                                        aria-label="نص السؤال"
                                        value={q.text || ""} 
                                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} 
                                        placeholder="اكتب صيغة السؤال هنا..." 
                                        className="w-full rounded-xl p-4 bg-[#0f172a] border border-white/20 focus:border-indigo-500 outline-none text-sm md:text-base min-h-[80px] resize-y"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                        {q.format === 'CODE' ? <><Code size={12}/> الكود البرمجي المرفق:</> : 
                                         q.format === 'MATH' ? <><Sigma size={12}/> المعادلة الرياضية:</> : 
                                         <><FileText size={12}/> محتوى نصي إضافي:</>}
                                    </label>
                                    
                                    {q.format === 'MATH' ? (
                                        <>
                                            <MathInput 
                                                value={q.content || ""}
                                                onChange={(newVal: string) => updateQuestion(qIndex, 'content', newVal)}
                                            />
                                        </>
                                    ) : (
                                        <textarea 
                                            title="النص الإضافي"
                                            aria-label="النص الإضافي"
                                            value={q.content || ""} 
                                            onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)} 
                                            placeholder={q.format === 'CODE' ? "أكتب الكود هنا..." : "أكتب النص الإضافي هنا..."} 
                                            className={`w-full rounded-xl p-4 bg-[#0d1117] border border-gray-700 text-gray-300 ${q.format === 'CODE' ? 'font-mono' : 'font-sans'} text-sm min-h-[120px] resize-y focus:border-indigo-500 outline-none`}
                                            dir={q.format === 'CODE' ? "ltr" : "rtl"}
                                            spellCheck={false}
                                        />
                                    )}
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="w-full relative">
                                        <input type="file" title="إرفاق صورة" aria-label="إرفاق صورة" accept="image/*" className="hidden" ref={el => { fileInputRefs.current[qIndex] = el }} onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(qIndex, e.target.files[0]); }}/>
                                        <div className="flex flex-col md:flex-row gap-3 items-center w-full">
                                            <button type="button" title="رفع صورة للسؤال" aria-label="رفع صورة للسؤال" onClick={() => fileInputRefs.current[qIndex]?.click()} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0f172a] border border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-all text-xs md:text-sm text-gray-400 hover:text-white w-full md:w-auto md:flex-1">
                                                {q.isUploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} />}
                                                {q.imageUrl ? 'تغيير الصورة' : 'إرفاق صورة للسؤال'}
                                            </button>
                                            {q.imageUrl && (
                                                <div className="w-full md:w-20 h-20 md:h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black/50">
                                                    <img src={getImageUrl(q.imageUrl, 'general')||""} alt="Preview" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                                   <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> الخيارات المتوفرة</h4>
                                   
                                   <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white transition-colors">
                                       <input 
                                          type="checkbox" 
                                          className="w-4 h-4 rounded accent-indigo-500" 
                                          checked={q.allowMultipleCorrect}
                                          onChange={(e) => updateQuestion(qIndex, 'allowMultipleCorrect', e.target.checked)}
                                       />
                                       السماح بأكثر من إجابة صحيحة
                                   </label>
                                </div>
                                
                                {q.choices.map((choice: any, cIndex: number) => (
                                    <div key={cIndex} className={`flex items-center gap-2 md:gap-3 p-2 rounded-xl border ${choice.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'border-transparent hover:bg-white/5'} transition-all`}>
                                        <input 
                                            type={q.allowMultipleCorrect ? "checkbox" : "radio"} 
                                            name={`correct-${q.id}`} 
                                            title="إجابة صحيحة"
                                            aria-label="تحديد كإجابة صحيحة"
                                            checked={choice.isCorrect} 
                                            onChange={(e) => updateChoice(qIndex, cIndex, 'isCorrect', e.target.checked)} 
                                            className="w-4 h-4 md:w-5 md:h-5 accent-green-500 cursor-pointer shrink-0"
                                        />
                                        <input 
                                            type="text" 
                                            title="نص الخيار"
                                            aria-label={`نص الخيار ${cIndex + 1}`}
                                            value={choice.text || ""} 
                                            onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)} 
                                            placeholder={`الخيار ${cIndex + 1}`} 
                                            className={`flex-1 bg-transparent border-b ${choice.isCorrect ? 'border-green-500/50 text-green-400 font-bold' : 'border-white/10 text-gray-300 focus:border-white/30'} py-2 px-1 md:px-2 text-xs md:text-sm outline-none transition-all`}
                                        />
                                        <button type="button" title="حذف الخيار" aria-label="حذف الخيار" onClick={() => removeChoice(qIndex, cIndex)} className="text-gray-500 hover:text-red-400 p-2 shrink-0"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" title="إضافة خيار جديد" aria-label="إضافة خيار جديد" onClick={() => addChoice(qIndex)} className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-xs text-white hover:bg-white/10 font-bold flex items-center gap-2 transition-all w-full md:w-auto justify-center">
                                    <Plus size={14}/> إضافة خيار جديد
                                </button>
                            </div>

                            <div className="mt-8 bg-[#0a0d14] p-5 rounded-2xl border border-indigo-500/20 relative shadow-inner">
                                <div className="absolute top-0 right-6 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-b-lg text-[10px] font-bold flex items-center gap-1 border border-t-0 border-indigo-500/30">
                                    <Eye size={12}/> معاينة حية (كما سيظهر للطالب)
                                </div>
                                
                                <div className="pt-4 flex flex-col gap-4">
                                    {q.text && (
                                        <h2 className="text-sm md:text-lg font-bold leading-relaxed text-white text-right overflow-x-auto custom-scrollbar" dir="rtl">
                                            <Latex>
                                                {q.text?.includes('\\') && !q.text?.includes('$') && !/[\u0600-\u06FF]/.test(q.text) 
                                                    ? `$$${q.text}$$` 
                                                    : q.text}
                                            </Latex>
                                        </h2>
                                    )}

                                    {q.content && (
                                        <div className="bg-[#161b22] p-4 rounded-xl border border-white/5 w-full">
                                            {q.format === 'MATH' && (
                                                <div dir="ltr" className="overflow-x-auto custom-scrollbar flex justify-start">
                                                    <span className="text-xl text-slate-200">
                                                        <Latex>{q.content.trim().startsWith("$$") ? q.content : `$$${q.content}$$`}</Latex>
                                                    </span>
                                                </div>
                                            )}
                                            {q.format === 'CODE' && (
                                                <CodeBlock code={q.content} isSmall={true} />
                                            )}
                                            {(q.format === 'TEXT' || !q.format) && (
                                                <p className="text-sm text-slate-300 whitespace-pre-wrap text-right" dir="auto">{q.content}</p>
                                            )}
                                        </div>
                                    )}

                                    {q.choices.some((c:any) => c.text) && (
                                      <div className="grid gap-2">
                                          {q.choices.map((c: any, i: number) => (
                                              <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 ${c.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                                                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${c.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}></div>
                                                  <span className={`text-sm flex-1 overflow-x-auto custom-scrollbar ${c.isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`} dir="auto">
                                                      <Latex>
                                                          {c.text?.includes('\\') && !c.text?.includes('$') && !/[\u0600-\u06FF]/.test(c.text) 
                                                              ? `$$${c.text}$$` 
                                                              : (c.text || `الخيار ${i + 1}`)}
                                                      </Latex>
                                                  </span>
                                              </div>
                                          ))}
                                      </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button type="button" title="إضافة سؤال جديد" aria-label="إضافة سؤال جديد" onClick={addQuestion} className="w-full py-6 border-2 border-dashed border-white/20 rounded-3xl text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 font-bold flex flex-col items-center justify-center gap-2 transition-all">
                        <div className="p-3 bg-white/5 rounded-full"><Plus size={24}/></div>
                        إضافة سؤال جديد
                    </button>
                </div>

                <div className="pt-8 flex justify-end">
                     <button 
                         type="button"
                         title="حفظ الاختبار ونشره"
                         aria-label="حفظ الاختبار ونشره"
                         onClick={handleSubmit} 
                         disabled={isSubmitting}
                         className={`w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-white text-base md:text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${contentType === 'EXAM' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                     >
                         {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : <><CheckCircle size={20} className="md:w-6 md:h-6"/> حفظ {contentType === 'EXAM' ? 'الامتحان' : 'الكويز'} ونشره</>}
                     </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 pt-24 md:pt-32" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[50vh] lg:h-[85vh]">
           <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 shrink-0">🗂️ المحتوى الخاص بي</h2>
           
           <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-2 pb-10 border border-white/5 rounded-2xl p-2 bg-[#162032]/30 lg:border-none lg:bg-transparent lg:p-0">
               
               {data.courses?.length > 0 && (
                   <div className="mb-6">
                       <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                           <BookOpen size={16} /> المواد المدفوعة ({data.courses.length})
                       </h3>
                       <div className="space-y-3">
                           {data.courses.map((item: any) => (
                               <div key={item.id} role="button" tabIndex={0} onClick={() => handleSelectItem(item, 'COURSE')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0"><BookOpen size={20} /></div>
                                       <div><p className="font-bold text-sm line-clamp-1">{item.title}</p><span className="text-[10px] text-gray-400">مادة أكاديمية مدفوعة</span></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {data.bootcamps?.length > 0 && (
                   <div className="mb-6">
                       <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                           <Tent size={16} /> المعسكرات ({data.bootcamps.length})
                       </h3>
                       <div className="space-y-3">
                           {data.bootcamps.map((item: any) => (
                               <div key={item.id} role="button" tabIndex={0} onClick={() => handleSelectItem(item, 'BOOTCAMP')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-pink-600 border-pink-400 shadow-lg shadow-pink-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400 shrink-0"><Tent size={20} /></div>
                                       <div><p className="font-bold text-sm line-clamp-1">{item.title}</p><span className="text-[10px] text-gray-400">معسكر تدريبي مكثف</span></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {data.workshops?.length > 0 && (
                   <div className="mb-6">
                       <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                           <Wrench size={16} /> الورشات العملية ({data.workshops.length})
                       </h3>
                       <div className="space-y-3">
                           {data.workshops.map((item: any) => (
                               <div key={item.id} role="button" tabIndex={0} onClick={() => handleSelectItem(item, 'WORKSHOP')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0"><Wrench size={20} /></div>
                                       <div><p className="font-bold text-sm line-clamp-1">{item.title}</p><span className="text-[10px] text-gray-400">ورشة عمل</span></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {data.freeContent?.length > 0 && (
                   <div className="mb-6">
                       <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                           <Gift size={16} /> المحتوى المجاني ({data.freeContent.length})
                       </h3>
                       <div className="space-y-3">
                           {data.freeContent.map((item: any) => (
                               <div key={item.id} role="button" tabIndex={0} onClick={() => handleSelectItem(item, 'FREE_CONTENT')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-yellow-600 border-yellow-400 shadow-lg shadow-yellow-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400 shrink-0"><Gift size={20} /></div>
                                       <div><p className="font-bold text-sm line-clamp-1">{item.title}</p><span className="text-[10px] text-gray-400">محتوى مفتوح</span></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

           </div>
        </div>

        <div className="lg:col-span-2 space-y-6 md:space-y-8">
           {selectedItem ? (
             <>
               <div className="flex flex-col sm:flex-row gap-3 md:gap-4 border-b border-white/10 pb-4">
                   <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                       <Plus size={18} /> إضافة / تعديل
                   </button>
                   <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                       <LayoutDashboard size={18} /> أرشيف المحتوى
                   </button>
                   <Link 
                        href={`/instructor/students/${selectedItem.id}?title=${encodeURIComponent(selectedItem.title)}`}
                        className="flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20"
                   >
                        <Users size={18} /> الطلاب والنقاط
                   </Link>
               </div>

               {activeTab === 'create' && (
               <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        {editingContentId ? <Pencil className="text-yellow-500" /> : <Plus className="text-purple-500" />} 
                        {editingContentId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                      </h2>
                      {editingContentId && (
                          <button 
                              type="button" 
                              onClick={() => { resetForms(); setContentType("VIDEO"); }} 
                              className="text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 w-fit"
                          >
                              <X size={16}/> إلغاء التعديل
                          </button>
                      )}
                  </div>
                  
                 {!editingContentId && (
                      <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-black/20 rounded-xl w-full md:w-fit mb-6 overflow-x-auto custom-scrollbar pb-3 md:pb-2">
                            {selectedItem?.type !== 'FREE_CONTENT' && <button type="button" onClick={() => setContentType("VIDEO")} className={`flex items-center whitespace-nowrap gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${contentType === 'VIDEO' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}><Video size={16} /> فيديو</button>}
                            {selectedItem?.type !== 'FREE_CONTENT' && <button type="button" onClick={() => setContentType("TASK")} className={`flex items-center whitespace-nowrap gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${contentType === 'TASK' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}><CheckSquare size={16} /> تاسك</button>}
                            {selectedItem?.type === 'COURSE' && <button type="button" onClick={() => setContentType("SUMMARY")} className={`flex items-center whitespace-nowrap gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${contentType === 'SUMMARY' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}><FileText size={16} /> ملخص</button>}
                            {(selectedItem?.type === 'COURSE' || selectedItem?.type === 'FREE_CONTENT') && (<button type="button" onClick={() => setContentType("QUIZ")} className={`flex items-center whitespace-nowrap gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${contentType === 'QUIZ' ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/20'}`}><HelpCircle size={16} /> إنشاء كويز</button>)}
                            {selectedItem?.type === 'COURSE' && (<button type="button" onClick={() => setContentType("EXAM")} className={`flex items-center whitespace-nowrap gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${contentType === 'EXAM' ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20'}`}><GraduationCap size={16} /> إنشاء امتحان</button>)}
                      </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 gap-6 animate-in fade-in">
                        <div className="space-y-2">
                            <label htmlFor="contentTitleInput" className="text-xs font-bold flex items-center justify-between">
                                <span className="text-gray-400">عنوان المرفق</span>
                                
                                {contentType === 'VIDEO' && !contentUrl && !editingContentId && (
                                    <span className="text-yellow-500 flex items-center gap-1 text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                       <Lock size={12}/> قم برفع الفيديو أولاً لفتح الحقل
                                    </span>
                                )}
                                {contentType === 'VIDEO' && contentUrl && !editingContentId && (
                                    <span className="text-green-500 flex items-center gap-1 text-[10px] bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">
                                       <Unlock size={12}/> الحقل مفتوح، اكتب العنوان الآن
                                    </span>
                                )}
                            </label>
                            
                            <input 
                                id="contentTitleInput" 
                                title="عنوان المرفق" 
                                aria-label="عنوان المرفق" 
                                type="text" 
                                value={contentTitle} 
                                onChange={(e) => setContentTitle(e.target.value)} 
                                required 
                                disabled={contentType === 'VIDEO' && !contentUrl && !editingContentId}
                                placeholder={contentType === 'VIDEO' && !contentUrl && !editingContentId ? "🔒 مقفول.. يرجى رفع الفيديو بالأسفل أولاً" : "أدخل العنوان هنا..."} 
                                className={`w-full bg-[#0f172a] rounded-xl py-3 px-4 outline-none text-sm md:text-base transition-all duration-300
                                    ${contentType === 'VIDEO' && !contentUrl && !editingContentId 
                                        ? 'border border-dashed border-gray-600 cursor-not-allowed opacity-60 text-gray-500' 
                                        : 'border border-white/20 focus:border-purple-500 text-white' 
                                    }
                                `}
                            />
                        </div>
                        
                        {contentType === 'VIDEO' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold text-center block mb-1">
                                        رفع فيديو للمنصة <span className="text-purple-400">({selectedItem.type === 'FREE_CONTENT' ? 'محتوى مجاني' : 'محتوى مشفر ومحمي'})</span>
                                    </label>
                                    
                                    {isVideoUploading && (
                                        <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden border border-white/10">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-center">
                                        <input 
                                            type="file" 
                                            accept="video/mp4,video/mkv,video/webm" 
                                            className="hidden" 
                                            id="videoUpload"
                                            title="رفع فيديو للمنصة"
                                            aria-label="رفع فيديو للمنصة"
                                            onChange={handleVideoUpload}
                                        />
                                        <label 
                                            htmlFor="videoUpload" 
                                            className={`flex flex-col md:flex-row items-center justify-center gap-2 w-full py-4 md:py-3 bg-[#0f172a] border ${isVideoUploading ? 'border-purple-500 text-purple-400 cursor-wait' : 'border-dashed border-white/20 cursor-pointer hover:bg-white/5'} rounded-xl transition-all text-gray-400 hover:text-white text-xs md:text-sm text-center relative overflow-hidden`}
                                        >
                                            {isVideoUploading ? <Loader2 className="animate-spin z-10" size={20}/> : <Upload size={20} className="z-10" />}
                                            <span className="z-10 font-bold">
                                                {isVideoUploading ? `جاري الرفع... ${uploadProgress}%` : "اختر فيديو لرفعه من جهازك"}
                                            </span>
                                            
                                            {isVideoUploading && (
                                                <div 
                                                    className="absolute top-0 left-0 bottom-0 bg-purple-500/10 transition-all duration-300" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                {contentUrl && !isVideoUploading && (
                                    <div className="text-xs text-green-400 mt-2 flex items-center justify-center md:justify-start gap-1 p-2 bg-green-500/10 rounded-lg border border-green-500/20 w-full md:w-fit">
                                        <CheckCircle size={14}/> تم رفع الفيديو بنجاح وهو جاهز للحفظ
                                    </div>
                                )}
                            </div>
                        )}

                        {(contentType === 'SUMMARY' || contentType === 'TASK') && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold">
                                        {contentType === 'SUMMARY' ? 'ملف الملخص (PDF)' : 'ملف المهمة (PDF/Word/ZIP)'}
                                    </label>
                                    
                                    {isUploadingFile && (
                                        <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden border border-white/10">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1 relative">
                                            <input 
                                                type="file" 
                                                title="رفع ملف جديد"
                                                aria-label="رفع ملف جديد"
                                                accept={contentType === 'SUMMARY' ? ".pdf,.doc,.docx" : ".pdf,.doc,.docx,.zip,.rar,.txt"} 
                                                className="hidden" 
                                                id="fileUpload"
                                                onChange={handleFileUpload}
                                            />
                                            <label 
                                                htmlFor="fileUpload" 
                                                className="flex flex-col md:flex-row items-center justify-center gap-2 w-full py-4 md:py-3 bg-[#0f172a] border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-gray-400 hover:text-white text-xs md:text-sm text-center relative overflow-hidden"
                                            >
                                                {isUploadingFile ? <Loader2 className="animate-spin z-10" size={20}/> : <Upload size={20} className="z-10" />}
                                                <span className="z-10 font-bold">
                                                    {isUploadingFile ? `جاري الرفع... ${uploadProgress}%` : contentUrl ? "تم رفع الملف (اضغط للتغيير)" : "رفع ملف"}
                                                </span>
                                                
                                                {isUploadingFile && (
                                                    <div 
                                                        className="absolute top-0 left-0 bottom-0 bg-blue-500/10 transition-all duration-300" 
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    {contentUrl && !isUploadingFile && (
                                        <div className="text-xs text-emerald-400 mt-2 flex items-center justify-center md:justify-start gap-1 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-full md:w-fit" dir="ltr">
                                            <File size={12}/> File Ready
                                        </div>
                                    )}
                                </div>

                                {contentType === 'TASK' && (
                                    <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
                                        <label htmlFor="dueDateInput" className="text-xs text-blue-400 font-bold flex items-center gap-1">
                                            <Clock size={14}/> آخر موعد للتسليم (Deadline) - اختياري
                                        </label>
                                        <input 
                                            id="dueDateInput"
                                            title="آخر موعد للتسليم"
                                            aria-label="آخر موعد للتسليم"
                                            type="datetime-local"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-[#0f172a] border border-white/20 rounded-xl py-3 px-4 focus:border-blue-500 outline-none text-gray-300 text-sm dir-ltr"
                                        />
                                        <p className="text-[10px] text-gray-500">إذا تركته فارغاً، ستبقى المهمة مفتوحة دائماً ولن تُقفل.</p>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                      <button type="submit" disabled={isSubmitting || isUploadingFile || isVideoUploading || (contentType === 'VIDEO' && !contentUrl)} className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all flex justify-center items-center gap-2 ${editingContentId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                         {isSubmitting ? <Loader2 className="animate-spin" /> : (editingContentId ? "حفظ التعديلات" : "إضافة للقائمة")}
                      </button>
                  </form>
               </div>
               )}

               {activeTab === 'list' && (
                   <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                       {renderContentSection("الامتحانات", exams, GraduationCap, "bg-indigo-500/10 text-indigo-400", "text-indigo-400")}
                       {renderContentSection("الاختبارات القصيرة (Quizzes)", quizzes, HelpCircle, "bg-purple-500/10 text-purple-400", "text-purple-400")}
                       {renderContentSection("الفيديوهات", videos, Video, "bg-red-500/10 text-red-400", "text-red-400")}
                       {renderContentSection("المهام (Tasks)", tasks, CheckSquare, "bg-blue-500/10 text-blue-400", "text-blue-400")}
                       {renderContentSection("الملخصات", summaries, FileText, "bg-orange-500/10 text-orange-400", "text-orange-400")}
                       {videos.length === 0 && quizzes.length === 0 && exams.length === 0 && tasks.length === 0 && summaries.length === 0 && (
                           <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10 text-gray-500 text-center">
                               <LayoutDashboard size={48} className="mb-4 opacity-20 md:w-16 md:h-16" />
                               <p className="text-sm md:text-base">لا يوجد محتوى مضاف لهذا العنصر حتى الآن</p>
                           </div>
                       )}
                   </div>
               )}
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                 <Layers size={64} className="mb-4 opacity-20" />
                 <p>اختر عنصراً من القائمة الجانبية للبدء بإضافة وتعديل المحتوى</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}