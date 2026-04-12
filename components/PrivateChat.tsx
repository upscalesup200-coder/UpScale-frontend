"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, Image as ImageIcon, X, Trash2, Loader2, Play, Pause, Square, FileArchive, Edit2, Reply, CheckCheck, Check, Download } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

interface PrivateChatProps {
  contentId: string;
  receiverId?: string; 
  isTeacherMode?: boolean; 
  onClose: () => void; 
}

export default function PrivateChat({ contentId, receiverId, isTeacherMode = false, onClose }: PrivateChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = isTeacherMode 
        ? `${API_BASE_URL}/api/private-messages/${contentId}/${receiverId}`
        : `${API_BASE_URL}/api/private-messages/student-sync/${contentId}`;

      const res = await axios.get(url, { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
      });
      setMessages(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chat:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 500);
    const interval = setInterval(fetchMessages, 5000);
    
    return () => {
        clearInterval(interval);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [contentId, receiverId, isTeacherMode]);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`pm-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-white/20', 'transition-all');
      setTimeout(() => el.classList.remove('bg-white/20'), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 5 * 1024 * 1024) return toast.error("حجم التسجيل الصوتي يتجاوز 5 ميغابايت");
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      toast.error("يرجى السماح بالوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميغابايت");
    setSelectedImage(file);
    setSelectedFile(null); 
  };

  // 💡 التعديل هنا: السماح بملفات الـ PDF 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['zip', 'rar', 'pdf'].includes(ext || '')) return toast.error("يُسمح فقط بملفات ZIP أو RAR أو PDF");
    if (file.size > 50 * 1024 * 1024) return toast.error("حجم الملف يجب أن لا يتجاوز 50 ميغابايت");
    setSelectedFile(file);
    setSelectedImage(null);
  };

  // 💡 التعديل هنا: إضافة onUploadProgress و تعطيل انقطاع الاتصال للملفات الكبيرة
  const handleSendMessage = async () => {
    if (!text.trim() && !selectedImage && !audioBlob && !selectedFile) return;
    setSending(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");

      if (editingMessage) {
        await axios.patch(`${API_BASE_URL}/api/private-messages/${editingMessage.id}`, { text }, { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true 
        });
        setEditingMessage(null);
      } else {
        const formData = new FormData();
        if (text.trim()) formData.append("text", text);
        if (selectedImage) formData.append("image", selectedImage);
        if (selectedFile) formData.append("file", selectedFile);
        if (audioBlob) formData.append("audio", audioBlob, "voice-message.webm");
        if (replyingTo) formData.append("parentId", replyingTo.id);

        const url = isTeacherMode 
          ? `${API_BASE_URL}/api/private-messages/${contentId}/${receiverId}`
          : `${API_BASE_URL}/api/private-messages/student-sync/${contentId}`;

        await axios.post(url, formData, { 
            headers: { 
                Authorization: `Bearer ${token}`, 
                "Content-Type": "multipart/form-data" 
            },
            withCredentials: true,
            timeout: 0,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
        });
      }

      setText(""); setSelectedImage(null); setSelectedFile(null); setAudioBlob(null); setReplyingTo(null);
      await fetchMessages();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل إرسال الرسالة");
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة نهائياً؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/private-messages/${messageId}`, { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
      });
      fetchMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "لا تملك صلاحية الحذف");
    }
  };

  const handleClearChat = async () => {
    if (!confirm("⚠️ هل أنت متأكد من مسح المحادثة بالكامل؟ لا يمكن التراجع!")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/private-messages/clear/${contentId}/${receiverId}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true 
      });
      toast.success("تم مسح المحادثة");
      onClose(); 
    } catch (error) { toast.error("حدث خطأ أثناء المسح"); }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    const toastId = toast.loading("جاري بدء التحميل...");
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `UpScale_Image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      toast.success("تم بدء التحميل بنجاح", { id: toastId });
    } catch (error) {
      window.open(imageUrl, '_blank');
      toast.success("تم فتح الصورة للتحميل", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {isTeacherMode ? "الرد على الطالب" : "تواصل مباشر مع الأستاذ"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">هذه المحادثة خاصة ومحفوظة بالسرية</p>
          </div>
          
          <div className="flex items-center gap-2">
            {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && isTeacherMode && (
              <button 
                onClick={handleClearChat} 
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                aria-label="مسح المحادثة بالكامل"
              >
                <Trash2 size={14}/> مسح الشات
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-purple-500" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mic size={40} className="mb-2 opacity-20" />
              <p>ابدأ المحادثة الآن...</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;

              return (
                <div key={msg.id} id={`pm-${msg.id}`} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                  <div className={`w-full max-w-[85%] sm:max-w-[75%] flex flex-col gap-1`}>
                    
                    <div className={`rounded-2xl p-3 relative transition-all ${isMine ? "bg-purple-600 text-white rounded-tl-none" : "bg-gray-800 text-gray-100 rounded-tr-none border border-gray-700"}`}>
                      
                      {msg.parent && (
                        <div onClick={() => scrollToMessage(msg.parent.id)} className={`mb-2 p-2 rounded-lg text-xs cursor-pointer border-r-4 ${isMine ? 'bg-black/20 border-purple-300' : 'bg-black/40 border-gray-500'}`}>
                          <span className="font-bold block mb-1 text-[10px] opacity-70">رد على: {msg.parent.sender?.firstName || "مستخدم"}</span>
                          <span className="line-clamp-1 opacity-90">{msg.parent.text || "مرفق 📁"}</span>
                        </div>
                      )}

                      {!isMine && <p className="text-xs text-gray-400 mb-1 font-semibold">{msg.sender?.firstName} {msg.sender?.lastName} ({msg.sender?.role === 'TEACHER' ? 'الأستاذ' : 'طالب'})</p>}
                      
                      {msg.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>}
                      
                      {msg.imageUrl && (
                        <div 
                          onClick={() => setPreviewImage(msg.imageUrl)}
                          className="mt-2 rounded-lg overflow-hidden border border-white/10 hover:opacity-90 transition-opacity cursor-pointer inline-block"
                        >
                          <img src={msg.imageUrl} alt="مرفق" className="max-h-48 w-auto object-cover" />
                        </div>
                      )}
                      
                      {msg.audioUrl && <VoicePlayer src={msg.audioUrl} />}
                      {msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/40 transition w-fit border border-white/5">
                          <FileArchive size={20} className="text-blue-400" />
                          <span className="text-sm truncate max-w-[150px]">{msg.fileName || "ملف مرفق"}</span>
                        </a>
                      )}

                      <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 opacity-70 ${isMine ? 'text-white' : 'text-gray-400'}`}>
                        {msg.isEdited && <span>(مُعدلة)</span>}
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isMine && (
                          <span title={msg.isRead ? "تمت القراءة" : "تم الإرسال"}>
                            {msg.isRead ? <CheckCheck size={12} className="text-blue-300" /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <button onClick={() => { setReplyingTo(msg); setEditingMessage(null); }} className="text-gray-400 hover:text-white flex items-center gap-1"><Reply size={12}/> رد</button>
                      {isMine && <button onClick={() => { setEditingMessage(msg); setReplyingTo(null); setText(msg.text || ""); }} className="text-gray-400 hover:text-blue-400 flex items-center gap-1"><Edit2 size={12}/> تعديل</button>}
                      {(isMine || user?.role === 'ADMIN') && <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-400 hover:text-red-400 flex items-center gap-1"><Trash2 size={12}/> حذف</button>}
                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-800/30 relative">
          
          {(replyingTo || editingMessage) && (
            <div className="flex items-center justify-between bg-black/40 p-2 rounded-t-xl border-l-4 border-purple-500 mb-1 text-xs text-gray-300">
              <div className="truncate">
                <span className="text-purple-400 font-bold ml-2">{editingMessage ? 'تعديل رسالتك:' : `الرد على ${replyingTo.sender?.firstName || 'مستخدم'}:`}</span>
                {editingMessage ? editingMessage.text : replyingTo.text || "مرفق 📁"}
              </div>
              <button 
                onClick={() => { setReplyingTo(null); setEditingMessage(null); setText(""); }} 
                className="text-gray-500 hover:text-white"
                aria-label="إلغاء العملية"
              >
                <X size={14}/>
              </button>
            </div>
          )}

          {(selectedImage || selectedFile || audioBlob) && (
            <div className="flex items-center gap-3 mb-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
              {selectedImage && <span className="text-sm text-green-400 flex items-center gap-1"><ImageIcon size={16}/> صورة مرفقة</span>}
              {selectedFile && <span className="text-sm text-blue-400 flex items-center gap-1"><FileArchive size={16}/> {selectedFile.name}</span>}
              {audioBlob && <span className="text-sm text-yellow-400 flex items-center gap-1"><Mic size={16}/> تسجيل صوتي</span>}
              <button 
                onClick={() => { setSelectedImage(null); setSelectedFile(null); setAudioBlob(null); }} 
                className="text-red-400 hover:text-red-300 ml-auto"
                aria-label="حذف المرفقات"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* 💡 شريط التقدم الجديد */}
          {sending && uploadProgress > 0 && (
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden relative">
               <div 
                 className="bg-purple-500 h-full transition-all duration-300" 
                 style={{ width: `${uploadProgress}%` }}
               ></div>
               <span className="absolute -top-4 right-0 text-[10px] text-gray-400">جاري الرفع {uploadProgress}%</span>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className={`flex-1 bg-gray-900 border border-gray-700 ${replyingTo || editingMessage ? 'rounded-b-xl border-t-0' : 'rounded-xl'} overflow-hidden focus-within:border-purple-500 transition-colors`}>
              <textarea 
                value={text} onChange={(e) => setText(e.target.value)} 
                placeholder="اكتب رسالتك..."
                className="w-full bg-transparent text-white p-3 max-h-32 min-h-[44px] resize-none focus:outline-none text-sm" 
                rows={1} disabled={sending}
              />
              
              {!editingMessage && (
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1">
                    <label className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={sending} aria-label="إرفاق صورة" />
                    </label>
                    <label className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer">
                      <Paperclip size={18} />
                      {/* 💡 التعديل هنا: السماح بـ pdf */}
                      <input type="file" accept=".zip,.rar,.pdf" className="hidden" onChange={handleFileSelect} disabled={sending} aria-label="إرفاق ملف مضغوط أو PDF" />
                    </label>
                    
                    {isRecording ? (
                      <button 
                        onClick={stopRecording} 
                        className="p-1.5 sm:p-2 text-red-500 flex items-center gap-2 bg-red-500/10 rounded-lg"
                        aria-label="إيقاف التسجيل الصوتي"
                      >
                        <Square size={14} className="fill-current animate-pulse" /> 
                        <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest">{formatTime(recordingTime)}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={startRecording} 
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" 
                        disabled={sending}
                        aria-label="بدء التسجيل الصوتي"
                      >
                        <Mic size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSendMessage} 
              disabled={sending || (!text.trim() && !selectedImage && !audioBlob && !selectedFile)} 
              className="h-12 w-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-xl transition-colors shrink-0"
              aria-label="إرسال الرسالة"
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="rtl:-scale-x-100" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 💡 ================= نافذة عرض الصور (Lightbox) ================= */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="absolute top-6 right-6 flex items-center gap-3 z-[110]">
            <button 
              onClick={() => handleDownloadImage(previewImage)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg"
            >
              <Download size={18} /> حفظ الصورة
            </button>
            
            <button 
              onClick={() => setPreviewImage(null)}
              className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all"
              title="إغلاق"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[90vh] w-full flex justify-center items-center pointer-events-none">
            <img 
              src={previewImage} 
              alt="صورة مكبرة" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10 pointer-events-auto" 
            />
          </div>
          
          <div className="absolute inset-0 z-[-1] cursor-pointer" onClick={() => setPreviewImage(null)}></div>
        </div>
      )}
    </div>
  );
}

function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: any) => {
    e.stopPropagation();
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const changeSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    setSpeed(nextSpeed);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-black/30 border border-white/10 rounded-full py-1.5 px-2 sm:px-3 w-full min-w-[200px] max-w-[300px] mt-2 shadow-inner z-10 relative overflow-hidden" dir="ltr">
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
      
      <button onClick={togglePlay} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors shadow-md z-20">
        {isPlaying ? <Pause size={12} className="sm:w-3.5 sm:h-3.5 fill-white" /> : <Play size={12} className="sm:w-3.5 sm:h-3.5 fill-white translate-x-0.5" />}
      </button>
      
      <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="flex-1 w-full min-w-0 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500 z-20" />
      
      <button 
        onClick={changeSpeed} 
        className="shrink-0 text-[9px] sm:text-[10px] font-bold bg-white/10 hover:bg-white/20 text-purple-300 w-8 sm:min-w-[36px] py-1 rounded-lg transition-colors z-20 flex items-center justify-center"
        title="تغيير سرعة التشغيل"
        aria-label="تغيير سرعة التشغيل"
      >
        {speed}x
      </button>
    </div>
  );
}