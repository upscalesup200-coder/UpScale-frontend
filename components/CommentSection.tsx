"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; 
import { 
  MessageSquare, Send, Reply, Trash2, Edit2, 
  X, BadgeCheck, Loader2, ImagePlus, Mic, Square,
  Play, Pause 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_ROUTES, API_BASE_URL } from "@/config/api";
import { getImageUrl } from "@/utils/imageHelper";
import { toast, Toaster } from "react-hot-toast";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 ميجابايت كحد أقصى

interface CommentSectionProps {
  targetId: string;
  targetType: string;
}

export default function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // حالات رفع الصورة المرفقة
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // حالة الصورة المعروضة بحجم كامل
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // حالات تسجيل الصوت
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_ROUTES.COMMENTS}?targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error("عذراً، يجب اختيار صورة فقط! مقاطع الفيديو غير مسموح بها.");
        e.target.value = ''; 
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        toast.error("حجم الصورة كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت.");
        e.target.value = ''; 
        return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
      setSelectedImage(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // دوال تسجيل الصوت
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobData = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlobData);
        const url = URL.createObjectURL(audioBlobData);
        setAudioPreviewUrl(url);
        stream.getTracks().forEach(track => track.stop()); // إغلاق المايك
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("يرجى السماح بالوصول إلى المايكروفون لتسجيل الصوت.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAudioBlob(null);
      setAudioPreviewUrl(null);
    }
  };

  const removeAudioPreview = () => {
    setAudioBlob(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!newComment.trim() && !selectedImage && !audioBlob) || cooldown > 0) return;

    setIsSubmitting(true);
    const toastId = toast.loading("جاري إرسال التعليق...");
    let uploadedImageUrl = null;
    let uploadedAudioUrl = null;

    try {
      // 1. رفع الصورة إذا وجدت
      if (selectedImage) {
          toast.loading("جاري رفع الصورة...", { id: toastId });
          const formData = new FormData();
          formData.append('file', selectedImage);
          const uploadRes = await fetch(`${API_BASE_URL}/api/comments/upload-media`, {
              method: 'POST',
             credentials:"include",
              body: formData
          });
          if (!uploadRes.ok) throw new Error("فشل رفع الصورة");
          uploadedImageUrl = (await uploadRes.json()).url;
      }

      // 2. رفع المقطع الصوتي إذا وجد
      if (audioBlob) {
        toast.loading("جاري رفع المقطع الصوتي...", { id: toastId });
        const formData = new FormData();
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        formData.append('file', audioFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/api/comments/upload-media`, {
            method: 'POST',
            credentials:"include",
            body: formData
        });
        if (!uploadRes.ok) throw new Error("فشل رفع المقطع الصوتي");
        uploadedAudioUrl = (await uploadRes.json()).url;
      }

      toast.loading("جاري حفظ التعليق...", { id: toastId });

      // 3. إرسال التعليق للسيرفر
      const res = await fetch(API_ROUTES.COMMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include", 
        body: JSON.stringify({
          content: newComment.trim(),
          imageUrl: uploadedImageUrl,
          audioUrl: uploadedAudioUrl, 
          targetId,
          targetType,
          parentId: replyTo?.id || null
        })
      });

      if (res.ok) {
        const newCommentData = await res.json(); 
        setComments(prev => [newCommentData, ...prev]); 
        
        // تفريغ الحقول
        setNewComment("");
        setReplyTo(null);
        removeSelectedImage();
        removeAudioPreview();
        setCooldown(5); 
        toast.success("تم إضافة التعليق", { id: toastId });
      } else {
        throw new Error("فشل الحفظ");
      }
    } catch (err) {
      toast.error("فشل الإرسال، يرجى المحاولة لاحقاً", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));

    try {
      const res = await fetch(API_ROUTES.COMMENT_ACTION(commentId), {
        method: 'DELETE',
        credentials: "include"
      });
      if (!res.ok) throw new Error();
      toast.success("تم الحذف بنجاح");
    } catch (err) {
      setComments(previousComments);
      toast.error("فشل الحذف");
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    const previousComments = [...comments];
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editContent } : c));
    setEditingId(null);

    try {
      const res = await fetch(API_ROUTES.COMMENT_ACTION(commentId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include", 
        body: JSON.stringify({ content: editContent.trim() })
      });
      if (!res.ok) throw new Error();
      toast.success("تم تعديل التعليق");
    } catch (err) {
      setComments(previousComments);
      toast.error("فشل التعديل");
    }
  };

  const canSend = newComment.trim() || selectedImage || audioBlob;

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 mt-12" dir="rtl">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-600/20 rounded-2xl">
          <MessageSquare className="text-purple-400" size={24} />
        </div>
        <h2 className="text-2xl font-black">ساحة النقاش ({comments.length})</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 space-y-4">
        {replyTo && (
          <div className="flex justify-between items-center bg-purple-600/10 border-r-4 border-purple-500 p-3 rounded-lg text-sm">
            <span className="text-purple-300">الرد على: <b>{replyTo.user?.firstName || 'مستخدم'}</b></span>
            <button 
              type="button"
              onClick={() => setReplyTo(null)} 
              className="text-gray-400 hover:text-white"
              aria-label="إلغاء الرد"
              title="إلغاء الرد"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* معاينة الصورة المرفوعة */}
        {imagePreview && (
            <div className="relative w-max mb-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/20 shadow-lg relative">
                    <Image unoptimized src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
                <button 
                    type="button" 
                    onClick={removeSelectedImage}
                    disabled={isSubmitting}
                    aria-label="إزالة الصورة"
                    title="إزالة الصورة"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform shadow-md"
                >
                    <X size={14} />
                </button>
            </div>
        )}

        {/* معاينة المقطع الصوتي قبل الإرسال */}
        {audioPreviewUrl && !isRecording && (
          <div className="relative flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-white/10 w-fit mb-2">
            <audio src={audioPreviewUrl} controls aria-label="تشغيل المقطع الصوتي" title="مقطع صوتي" className="h-10" />
            <button 
              type="button" 
              onClick={removeAudioPreview}
              disabled={isSubmitting}
              className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full p-2 transition-colors"
              aria-label="حذف المقطع الصوتي"
              title="حذف المقطع"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <div className="relative group">
          {/* إخفاء حقل النص أثناء تسجيل الصوت وإظهار واجهة التسجيل */}
          {isRecording ? (
            <div className="w-full bg-[#0f172a] border border-red-500/50 rounded-2xl p-4 min-h-[100px] flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-bold tracking-widest">{formatTime(recordingTime)}</span>
                <span className="text-sm opacity-80">جاري تسجيل الصوت...</span>
              </div>
              <button 
                type="button"
                onClick={cancelRecording}
                className="text-gray-400 hover:text-red-400 p-2"
                aria-label="إلغاء التسجيل"
                title="إلغاء التسجيل"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ) : (
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "اكتب تعليقك أو استفسارك هنا..." : "يجب تسجيل الدخول للمشاركة في النقاش"}
              disabled={!user || isSubmitting}
              maxLength={1000} 
              aria-label="اكتب تعليقك الجديد"
              title="اكتب تعليقك الجديد"
              className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 pr-4 pl-32 min-h-[100px] focus:border-purple-500 outline-none transition-all resize-none text-sm md:text-base custom-scrollbar"
            />
          )}

          <div className="absolute left-4 bottom-4 flex items-center gap-2">
            {cooldown > 0 && <span className="text-xs text-gray-500 font-mono">{cooldown}s</span>}
            
            {/* زر إرفاق الصورة مخفي أثناء التسجيل */}
            {!isRecording && (
              <>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageSelect}
                    disabled={!user || isSubmitting}
                    aria-label="إرفاق صورة"
                    title="إرفاق صورة"
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!user || isSubmitting}
                    className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-400 rounded-xl transition-all disabled:opacity-50"
                    aria-label="إرفاق صورة"
                    title="إرفاق صورة"
                >
                    <ImagePlus size={20} />
                </button>
              </>
            )}

            {/* تبديل بين زر المايكروفون، الإيقاف، وزر الإرسال */}
            {isRecording ? (
              <button 
                type="button"
                onClick={stopRecording}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all"
                aria-label="إيقاف التسجيل"
                title="إيقاف التسجيل"
              >
                <Square size={20} className="fill-white" />
              </button>
            ) : canSend ? (
              <button 
                type="submit"
                disabled={!user || isSubmitting || cooldown > 0}
                className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
                aria-label="إرسال التعليق"
                title="إرسال"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rtl:-rotate-90" />}
              </button>
            ) : (
              <button 
                type="button"
                onClick={startRecording}
                disabled={!user || isSubmitting}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
                aria-label="تسجيل صوتي"
                title="تسجيل صوتي"
              >
                <Mic size={20} />
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {loading ? (
          <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" size={32} /></div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id}
                comment={comment}
                currentUser={user}
                onReply={setReplyTo}
                onDelete={handleDelete}
                onEdit={(c: any) => { setEditingId(c.id); setEditContent(c.content); }}
                isEditing={editingId === comment.id}
                editContent={editContent}
                setEditContent={setEditContent}
                onUpdate={handleUpdate}
                cancelEdit={() => setEditingId(null)}
                onImageClick={setActiveImage}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" 
            onClick={() => setActiveImage(null)}
          >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} 
              >
                  <img 
                    src={getImageUrl(activeImage, 'general') || ""} 
                    className="rounded-xl shadow-2xl object-contain max-w-full max-h-[90vh] border border-white/10" 
                    alt="Full view"
                  />
                  <button 
                    className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 font-bold"
                    onClick={() => setActiveImage(null)}
                    aria-label="إغلاق الصورة"
                    title="إغلاق"
                  >
                    إغلاق <X size={24} />
                  </button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommentItem({ 
  comment, currentUser, onReply, onDelete, onEdit, 
  isEditing, editContent, setEditContent, onUpdate, cancelEdit, onImageClick 
}: any) {
  const isOwner = currentUser?.id === comment.userId;
  // ✅ إعطاء صلاحية الحذف للأدمن والمدرب معاً
  const canDeleteAny = currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER';
  const isInstructor = comment.user?.role === 'TEACHER' || comment.user?.role === 'ADMIN' || comment.role === 'TEACHER';

  // ✅ دالة التمرير للرد
  const scrollToOriginal = (parentId: string) => {
    const el = document.getElementById(`comment-${parentId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-white/20', 'transition-all');
      setTimeout(() => el.classList.remove('bg-white/20'), 2000);
    }
  };

  return (
    <motion.div 
      id={`comment-${comment.id}`} // إضافة ID للتمرير
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }} 
      className={`group relative flex gap-4 ${comment.parentId ? 'mr-8 md:mr-12 border-r-2 border-white/5 pr-4 pb-2' : ''}`}
    >
      <div className="shrink-0">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 shadow-lg bg-slate-800 flex items-center justify-center ${isInstructor ? 'border-amber-500/50' : 'border-white/10'}`}>
          {comment.userImage ? (
            <img 
              src={getImageUrl(comment.userImage, 'avatar')||""} 
              alt={comment.user?.firstName || 'User'}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-full h-full object-cover"
            />
          ) : (
             <span className="text-gray-500 font-bold">{comment.user?.firstName?.[0] || 'U'}</span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-sm md:text-base truncate max-w-[200px] ${isInstructor ? 'text-amber-400' : 'text-white'}`}>
            {comment.user?.firstName || 'مستخدم'} {comment.user?.lastName || ''}
          </span>
          {isInstructor && <BadgeCheck size={16} className="text-amber-500 fill-amber-500/10 shrink-0" />}
          <span className="text-[10px] text-gray-500 shrink-0">{new Date(comment.createdAt).toLocaleDateString('ar-EG')}</span>
        </div>

        {/* ✅ إضافة صندوق الرد هنا ليعرض الرسالة الأصلية فوق التعليق */}
        {comment.parentId && comment.parent && (
            <div 
                onClick={() => scrollToOriginal(comment.parentId)} 
                className="mb-2 mt-1 p-2 rounded-lg bg-black/20 border-r-4 border-purple-500/50 cursor-pointer hover:bg-black/40 transition-colors"
            >
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">
                    رد على: {comment.parent.user?.firstName || 'مستخدم'}
                </span>
                <span className="text-xs text-gray-300 line-clamp-1">{comment.parent.content || "مرفق 📁"}</span>
            </div>
        )}

        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              title="تعديل التعليق"
              aria-label="تعديل التعليق"
              placeholder="اكتب تعديلك هنا..."
              maxLength={1000}
              className="w-full bg-black/20 border border-purple-500/30 rounded-xl p-3 text-sm outline-none text-white resize-none custom-scrollbar"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => onUpdate(comment.id)} 
                aria-label="حفظ التعديل"
                title="حفظ"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-lg text-xs font-bold text-white"
              >
                حفظ
              </button>
              <button 
                onClick={cancelEdit} 
                aria-label="إلغاء التعديل"
                title="إلغاء"
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-xs text-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
             {comment.content && (
                <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                   {comment.content}
                </p>
             )}
             
             {comment.imageUrl && (
                 <div onClick={() => onImageClick(comment.imageUrl)} className="block w-fit mt-2 cursor-zoom-in" aria-label="عرض الصورة بحجم كامل" title="تكبير الصورة">
                     <div className="relative max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-md group/img">
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                            <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg border border-white/20">اضغط للتكبير</span>
                         </div>
                         <Image unoptimized 
                             src={getImageUrl(comment.imageUrl, 'general', 400) || ""} 
                             alt="مرفق التعليق" 
                             width={400} 
                             height={300} 
                             className="w-full h-auto max-h-64 object-contain bg-black/20"
                         />
                     </div>
                 </div>
             )}

             {comment.audioUrl && (
                 <VoicePlayer src={getImageUrl(comment.audioUrl, 'general') || ""} />
             )}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          {!comment.parentId && (
            <button 
                onClick={() => onReply(comment)}
                className="text-[11px] font-bold text-gray-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
                aria-label="رد على التعليق"
                title="رد"
            >
                <Reply size={14} /> رد
            </button>
          )}

          {/* ✅ التعديل هنا: تم تغيير isAdmin إلى canDeleteAny للسماح للمدرب بالحذف */}
          {(isOwner || canDeleteAny) && !isEditing && (
            <div className="flex items-center gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
              {isOwner && (
                <button 
                  onClick={() => onEdit(comment)} 
                  className="text-[11px] text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                  aria-label="تعديل التعليق"
                  title="تعديل"
                >
                  <Edit2 size={14} /> تعديل
                </button>
              )}
              <button 
                onClick={() => onDelete(comment.id)} 
                className="text-[11px] text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                aria-label="حذف التعليق"
                title="حذف"
              >
                <Trash2 size={14} /> حذف
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  const togglePlay = () => {
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
      if (total > 0) {
          setProgress((current / total) * 100);
      }
    }
  };

  const handleSeek = (e: any) => {
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const changeSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
    setSpeed(nextSpeed);
  };

  return (
    <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-full py-1.5 px-3 w-full sm:min-w-[280px] max-w-sm mt-2 shadow-inner" dir="ltr">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)} 
      />
      
      <button 
        onClick={togglePlay} 
        className="w-8 h-8 shrink-0 flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors shadow-md"
        aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
      >
        {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white translate-x-0.5" />}
      </button>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={progress || 0} 
        onChange={handleSeek}
        className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500" 
        aria-label="شريط تقدم الصوت"
        title="شريط التقدم"
      />
      
      <button 
        onClick={changeSpeed} 
        className="shrink-0 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-purple-300 px-2 py-1 rounded-lg transition-colors min-w-[36px]"
        title="تغيير سرعة التشغيل"
        aria-label="تغيير سرعة التشغيل"
      >
        {speed}x
      </button>
    </div>
  );
}