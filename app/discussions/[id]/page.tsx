"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { 
  Loader2, MessageSquare, Send, Mic, Paperclip, X, 
  Image as ImageIcon, Square, User, Trash2, Edit2, 
  Reply, HelpCircle, Check, Users, Download, FileArchive, ChevronRight 
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageHelper";


const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);

  const toggleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  return (
    <div className="flex items-center gap-2 mt-2 bg-black/20 p-1.5 rounded-full w-fit max-w-full">
      <audio ref={audioRef} controls src={src} className="h-8 max-w-[200px] sm:max-w-xs outline-none" />
      <button 
        onClick={toggleSpeed} 
        className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 border border-white/5"
      >
        {speed}x
      </button>
    </div>
  );
};

export default function DiscussionRoom() {
  const params = useParams();
  const router = useRouter(); 
  const courseId = params.id as string;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [isImportantQuestion, setIsImportantQuestion] = useState(false);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const [msgsRes, partsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/comments?videoId=${courseId}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/comments/participants?videoId=${courseId}`, { withCredentials: true })
      ]);
      setMessages(msgsRes.data);
      setParticipantsCount(partsRes.data.length);
    } catch (e) {
      console.error("فشل جلب بيانات الشات", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [courseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      toast.error("يرجى السماح بالوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !audioBlob && !attachment) return;

    setUploading(true);
    setUploadProgress(0);
    let imageUrl = null, audioUrl = null, fileUrl = null, fileName = null, fileSize = null;

    try {
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        const res = await axios.post(`${API_BASE_URL}/api/comments/upload-media`, formData, { 
          withCredentials: true,
          timeout: 0,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          }
        });
        
        if (attachment.type.startsWith("image/")) {
            imageUrl = res.data.url;
        } else {
            fileUrl = res.data.url;
            fileName = attachment.name;
            fileSize = attachment.size;
        }
      }

      if (audioBlob) {
        const formData = new FormData();
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        formData.append("file", audioFile);
        const res = await axios.post(`${API_BASE_URL}/api/comments/upload-media`, formData, { 
          withCredentials: true,
          timeout: 0,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          }
        });
        audioUrl = res.data.url;
      }

      await axios.post(`${API_BASE_URL}/api/comments`, {
        videoId: courseId, 
        content: newMessage,
        imageUrl: imageUrl, 
        audioUrl: audioUrl,
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: fileSize,
        parentId: replyTo?.id || null, 
        isImportant: isImportantQuestion 
      }, { withCredentials: true });

      setNewMessage(""); setAudioBlob(null); setAttachment(null); setRecordingTime(0);
      setReplyTo(null); setIsImportantQuestion(false); 
      fetchData();
    } catch (e) {
      toast.error("فشل إرسال الرسالة");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateMessage = async (id: string) => {
    if (!editContent.trim()) return;
    const toastId = toast.loading("جاري التعديل...");
    try {
      await axios.patch(`${API_BASE_URL}/api/comments/${id}`, { content: editContent }, { withCredentials: true });
      setMessages(messages.map(m => m.id === id ? { ...m, content: editContent } : m));
      setEditingId(null);
      toast.success("تم التعديل", { id: toastId });
    } catch (e) { toast.error("فشل التعديل", { id: toastId }); }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة نهائياً؟")) return;
    const toastId = toast.loading("جاري الحذف...");
    try {
      await axios.delete(`${API_BASE_URL}/api/comments/${id}`, { withCredentials: true });
      setMessages(messages.filter(m => m.id !== id && m.parentId !== id));
      toast.success("تم الحذف", { id: toastId });
    } catch (e) { toast.error("فشل الحذف", { id: toastId }); }
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

  const formatTimeSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "اليوم";
    if (date.toDateString() === yesterday.toDateString()) return "الأمس";
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  let lastDateHeader = "";

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0b1120] font-sans" dir="rtl">
      
      <div className="p-4 md:px-8 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-white font-black text-lg md:text-xl">ساحة النقاشات العامة</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> متصل
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                 <Users size={12} /> {participantsCount} مشارك في هذه المجموعة
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/desktop')} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5 shadow-sm"
        >
          <ChevronRight size={18} className="rtl:rotate-180" /> <span className="hidden sm:inline">العودة للوحة التحكم</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <MessageSquare size={64} className="mb-4 text-gray-600" />
              <p className="text-lg font-bold text-gray-400">كن أول من يبدأ النقاش في هذه المجموعة!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.userId === user?.id;
              const msgIsTeacher = msg.role === 'TEACHER' || msg.role === 'ADMIN';
              const isEditingThis = editingId === msg.id;

              const msgDateObj = new Date(msg.rawDate || msg.createdAt);
              const currentDateHeader = formatDateHeader(msgDateObj.toISOString());
              const showDateHeader = currentDateHeader !== lastDateHeader;
              if (showDateHeader) { lastDateHeader = currentDateHeader; }

              return (
                <React.Fragment key={idx}>
                  {showDateHeader && (
                    <div className="flex justify-center my-6">
                      <span className="bg-[#1e293b] text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
                        {currentDateHeader}
                      </span>
                    </div>
                  )}

                  <div className={`flex gap-4 relative group w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    
                    <div className={`absolute top-0 flex items-center gap-1 bg-slate-800 border border-white/10 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg ${isMe ? 'left-12 -translate-x-full' : 'right-12 translate-x-full'}`}>
                       <button onClick={() => setReplyTo(msg)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="رد">
                         <Reply size={16} />
                       </button>
                       {isMe && !msg.imageUrl && !msg.audioUrl && !msg.fileUrl && (
                         <button onClick={() => {setEditingId(msg.id); setEditContent(msg.content)}} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="تعديل">
                           <Edit2 size={16} />
                         </button>
                       )}
                       {isTeacher && (
                         <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="حذف للمدرب">
                           <Trash2 size={16} />
                         </button>
                       )}
                    </div>

                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 bg-[#1e293b] border border-white/10 overflow-hidden flex items-center justify-center shadow-sm">
                      {msg.userImage ? <img src={getImageUrl(msg.userImage, 'avatar') || ""} alt="صورة" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400"/>}
                    </div>

                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-sm font-bold ${msgIsTeacher ? 'text-blue-400' : 'text-gray-300'}`}>{msg.user}</span>
                        {msgIsTeacher && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-bold tracking-wide">المدرب</span>}
                      </div>
                      
                      <div className={`p-4 text-base relative shadow-md ${isMe ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm" : "bg-[#1e293b] text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm"} ${msg.isImportant ? 'ring-2 ring-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : ''}`}>
                        
                        {msg.isImportant && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-200 bg-orange-900/40 px-2 py-1 rounded-md mb-2 w-fit border border-orange-500/30">
                            <HelpCircle size={12}/> سؤال للمدرب
                          </div>
                        )}

                        {msg.parent && (
                          <div onClick={() => document.getElementById(`msg-${msg.parent.id}`)?.scrollIntoView({behavior: 'smooth'})} className={`mb-3 border-r-4 p-2 rounded text-xs cursor-pointer transition-colors ${isMe ? 'bg-black/20 border-emerald-300 hover:bg-black/30' : 'bg-black/30 border-blue-400 hover:bg-black/40'}`}>
                            <span className={`font-bold block mb-0.5 ${isMe ? 'text-emerald-300' : 'text-blue-400'}`}>{msg.parent.user}</span>
                            <span className="line-clamp-1 opacity-80">{msg.parent.content || "مرفق 📎"}</span>
                          </div>
                        )}

                        {isEditingThis ? (
                          <div className="min-w-[200px]">
                            <textarea 
                              value={editContent} 
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-black/20 rounded p-2 text-sm text-white outline-none mb-2 resize-none border border-white/10"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateMessage(msg.id)} className="bg-emerald-500 text-black px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm"><Check size={12}/> حفظ</button>
                              <button onClick={() => setEditingId(null)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold transition-colors">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed" id={`msg-${msg.id}`}>{msg.content}</p>}
                            
                            {msg.imageUrl && (
                              <div 
                                onClick={() => setPreviewImage(getImageUrl(msg.imageUrl, 'general') || "")}
                                className="block mt-3 rounded-xl overflow-hidden border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                <img src={getImageUrl(msg.imageUrl, 'general') || ""} alt="مرفق" className="max-w-full h-auto max-h-64 object-cover" />
                              </div>
                            )}
                            
                            {msg.audioUrl && (
                              <AudioPlayer src={getImageUrl(msg.audioUrl, 'general') || ""} />
                            )}

                            {msg.fileUrl && (
                              <a href={getImageUrl(msg.fileUrl, 'general') || ""} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/40 transition w-fit border border-white/5">
                                <FileArchive size={20} className="text-emerald-300" />
                                <span className="text-sm truncate max-w-[150px]">{msg.fileName || "ملف مرفق"}</span>
                              </a>
                            )}
                          </>
                        )}

                        <div className={`text-[10px] mt-2 flex justify-end items-center gap-1 ${isMe ? 'text-emerald-100/70' : 'text-gray-500'}`}>
                           {msgDateObj.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                           {isMe && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-6 bg-[#0f172a] border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-10 relative">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-3">
          
          {replyTo && (
            <div className="flex justify-between items-center bg-blue-500/10 border-r-4 border-blue-500 p-2 rounded-lg mb-1 text-sm shadow-inner">
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-blue-400">رد على: {replyTo.user}</span>
                 <span className="text-[10px] text-gray-400 line-clamp-1">{replyTo.content || "مرفق"}</span>
               </div>
               <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-400 p-1 bg-white/5 rounded-md"><X size={14}/></button>
            </div>
          )}

          {attachment && (
            <div className="flex items-center justify-between bg-[#1e293b] p-3 rounded-xl border border-blue-500/30 mb-2">
              <div className="flex items-center gap-2 text-sm text-blue-400 font-bold overflow-hidden">
                {attachment.type.startsWith("image/") ? <ImageIcon size={18}/> : <FileArchive size={18}/>}
                <span className="truncate max-w-[200px]">{attachment.name}</span>
              </div>
              <button onClick={() => setAttachment(null)} className="text-gray-500 hover:text-red-400"><X size={18}/></button>
            </div>
          )}

          {isRecording || audioBlob ? (
            <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/30 mb-2">
              {isRecording ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-red-400 font-mono font-bold flex-1">{formatTimeSeconds(recordingTime)}</span>
                  <button onClick={stopRecording} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"><Square size={16}/></button>
                </>
              ) : (
                <>
                  <audio src={URL.createObjectURL(audioBlob!)} controls className="h-8 flex-1 outline-none" />
                  <button onClick={cancelRecording} className="text-gray-500 hover:text-red-400 p-2 bg-white/5 rounded-md"><X size={18}/></button>
                </>
              )}
            </div>
          ) : null}

          {uploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden relative">
               <div 
                 className="bg-emerald-500 h-full transition-all duration-300" 
                 style={{ width: `${uploadProgress}%` }}
               ></div>
               <span className="absolute -top-4 right-0 text-[10px] text-emerald-400">جاري الرفع {uploadProgress}%</span>
            </div>
          )}

          <div className="flex items-end gap-3 relative">
            <div className={`flex-1 bg-[#1e293b] border ${isImportantQuestion ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-white/10'} rounded-3xl flex flex-col p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-inner`}>
              
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك للمجموعة هنا..."
                className="w-full bg-transparent border-none text-white text-base p-3 pb-2 outline-none resize-none max-h-40 min-h-[50px] custom-scrollbar"
                rows={1}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              />
              
              <div className="flex items-center justify-between px-2 pb-1 pt-2 border-t border-white/5">
                 {!isTeacher ? (
                    <button 
                      onClick={() => setIsImportantQuestion(!isImportantQuestion)} 
                      className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${isImportantQuestion ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                    >
                      <HelpCircle size={14} /> {isImportantQuestion ? 'سؤال موجه للمدرب' : 'توجيه كـ سؤال'}
                    </button>
                 ) : <div></div>}

                 <div className="flex items-center gap-2 shrink-0 ml-auto">
                   <input type="file" ref={fileInputRef} onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="hidden" accept="image/*,.pdf,.zip,.rar" />
                   
                   <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="إرفاق ملف أو صورة">
                     <Paperclip size={20} />
                   </button>
                   
                   {!newMessage && !attachment && !audioBlob && (
                     <button onClick={startRecording} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="رسالة صوتية">
                       <Mic size={20} />
                     </button>
                   )}
                 </div>
              </div>
            </div>
            
            <button 
              onClick={handleSendMessage} 
              disabled={uploading || (!newMessage.trim() && !audioBlob && !attachment)}
              className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              {uploading ? <Loader2 size={24} className="animate-spin"/> : <Send size={24} className="rtl:-scale-x-100 translate-x-[-2px]" />}
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute top-6 right-6 flex items-center gap-3 z-[210]">
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