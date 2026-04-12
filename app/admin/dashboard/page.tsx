"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import toast from "react-hot-toast"; 
import { 
  Users, Settings, BookOpen, Zap, Layers, GraduationCap,
  PenTool, ListChecks, Loader2, ShieldAlert, WalletCards, X, 
  Activity, Wifi, WifiOff, AlertTriangle, FolderOpen, ArrowRight, Trash2,
  RefreshCw, UserX, Ban, Unlock, MinusCircle, CalendarDays, Search,
  Eye, PlayCircle, Info, Save, UploadCloud, Lock, Globe, Monitor, Smartphone,
  PlusCircle, Network, Database
} from "lucide-react"; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    workshops: 0,
    bootcamps: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [isRecharging, setIsRecharging] = useState(false);

  const [showExamsModal, setShowExamsModal] = useState(false);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [togglingExamId, setTogglingExamId] = useState<string | null>(null);

  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [activeRooms, setActiveRooms] = useState<any[]>([]); 
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null); 
  const [isClearing, setIsClearing] = useState(false); 

  const [showSuspiciousModal, setShowSuspiciousModal] = useState(false);
  const [suspiciousAccounts, setSuspiciousAccounts] = useState<any[]>([]);
  const [isLoadingSuspicious, setIsLoadingSuspicious] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showBannedModal, setShowBannedModal] = useState(false);
  const [bannedAccounts, setBannedAccounts] = useState<any[]>([]);
  const [isLoadingBanned, setIsLoadingBanned] = useState(false);

  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [enrollmentsTab, setEnrollmentsTab] = useState<'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'TEACHER'>('COURSE');
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]); 
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false); 
  const [isResettingAll, setIsResettingAll] = useState(false);


  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [usersSearchTerm, setUsersSearchTerm] = useState("");

  const [deductModal, setDeductModal] = useState({ show: false, userId: '', userName: '', maxAmount: 0 });
  const [deductAmount, setDeductAmount] = useState<number | "">("");
  const [isDeducting, setIsDeducting] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<{id: string, name: string} | null>(null);
  const [studentProgressData, setStudentProgressData] = useState<any[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState<string | null>(null);

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false); 
  const [aboutSettings, setAboutSettings] = useState({
    aboutPlatform: "",
    ownerName: "",
    ownerBio: "",
    ownerImage: "",
    teamDesignName: "",
    teamDesignAvatar: "boy",
    teamManageName: "",
    teamManageAvatar: "boy",
    teamSecurityName: "",
    teamSecurityAvatar: "boy",
    teamSupportName: "",
    teamSupportAvatar: "boy"
  });


  const [showSVUModal, setShowSVUModal] = useState(false);
  const [svuCourses, setSvuCourses] = useState<any[]>([]);
  const [isLoadingSVU, setIsLoadingSVU] = useState(false);
  const [isSavingSVU, setIsSavingSVU] = useState(false);
  const [svuForm, setSvuForm] = useState({
    code: "",
    name: "",
    prerequisites: "",
    credits: ""
  });

  useEffect(() => {
    setIsMounted(true);
    fetch(`${API_BASE_URL}/api/admin/stats`, { 
      credentials: 'include' 
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    })
    .then((data) => {
      setStats(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch stats", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (showMonitorModal) {
          const fetchLiveSessions = async () => {
              try {
                  const res = await fetch(`${API_BASE_URL}/api/exam/admin/live-monitoring`, {
                      credentials: "include" 
                  });
                  if (res.ok) {
                      const data = await res.json();
                      setActiveRooms(data.activeRooms || []);
                      setLiveSessions(data.studentSessions || []);
                  }
              } catch (err) {
                  console.error("Error fetching live sessions", err);
              }
          };
          fetchLiveSessions();
          interval = setInterval(fetchLiveSessions, 3000); 
      }
      return () => clearInterval(interval);
  }, [showMonitorModal]);


  const fetchAllUsers = async () => {
      setIsLoadingAllUsers(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users`, { credentials: "include" });
          if (res.ok) {
              const data = await res.json();
              setAllUsersList(data);
          } else {
              toast.error("فشل في جلب قائمة المستخدمين.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsLoadingAllUsers(false);
      }
  };

  const handleOpenAllUsersModal = () => {
      setShowAllUsersModal(true);
      fetchAllUsers();
  };

  const filteredAllUsers = allUsersList.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(usersSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(usersSearchTerm.toLowerCase())
  );

  
  const fetchSVUCourses = async () => {
    setIsLoadingSVU(true);
    try {
    const res = await fetch(`${API_BASE_URL}/api/svu/admin/courses`, { credentials: "include" });      if (res.ok) {
        const data = await res.json();
        setSvuCourses(data);
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء جلب مواد الـ SVU");
    } finally {
      setIsLoadingSVU(false);
    }
  };

  const handleOpenSVUModal = () => {
    setShowSVUModal(true);
    fetchSVUCourses();
  };

  const handleSaveSVUCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svuForm.code || !svuForm.name || !svuForm.credits) {
      return toast.error("يرجى ملء الحقول الأساسية (الرمز، الاسم، عدد الساعات)");
    }
    
    setIsSavingSVU(true);
    try {
const res = await fetch(`${API_BASE_URL}/api/svu/admin/courses`, {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          code: svuForm.code,
          name: svuForm.name,
          prerequisites: svuForm.prerequisites || "None",
          credits: Number(svuForm.credits)
        })
      });
      
      if (res.ok) {
        toast.success("تمت إضافة المادة بنجاح!");
        setSvuForm({ code: "", name: "", prerequisites: "", credits: "" });
        fetchSVUCourses(); 
      } else {
        const error = await res.json();
        toast.error(error.message || "فشل إضافة المادة.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم.");
    } finally {
      setIsSavingSVU(false);
    }
  };

const handleDeleteSVUCourse = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المادة من النظام؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/svu/admin/courses/${id}`, {
        method: 'DELETE',
        credentials: "include"
      });
      
      if (res.ok) {
        toast.success("تم حذف المادة بنجاح.");
        setSvuCourses(prev => prev.filter(c => c.id !== id));
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "فشل حذف المادة! تأكد من الرابط.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم.");
    }
  };

  const handleClearExamRecords = async (examId: string) => {
      if (!confirm("هل أنت متأكد من مسح جميع سجلات المراقبة لهذا الامتحان نهائياً؟")) return;
      setIsClearing(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/exam/admin/live-monitoring/${examId}`, { 
            method: 'DELETE', 
            credentials: "include" 
          });
          if (res.ok) {
              toast.success("تم مسح السجلات بنجاح!");
              setSelectedExamId(null); 
              setLiveSessions(prev => prev.filter(s => s.examId !== examId)); 
          } else {
              toast.error("حدث خطأ أثناء المسح.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsClearing(false);
      }
  };

  const handleRechargeWallet = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!studentEmail || !amount || amount <= 0) {
          toast.error("يرجى إدخال إيميل الطالب ومبلغ الشحن بشكل صحيح.");
          return;
      }
      setIsRecharging(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/recharge-wallet`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }, 
              credentials: "include", 
              body: JSON.stringify({ email: studentEmail, amount: Number(amount) })
          });
          const data = await res.json();
          if (res.ok) {
              toast.success(`تم شحن محفظة الطالب بنجاح! الرصيد الجديد: ${data.newBalance} ل.س`);
              setShowRechargeModal(false);
              setStudentEmail("");
              setAmount("");
          } else {
              toast.error(data.message || "فشلت عملية الشحن.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsRecharging(false);
      }
  };

  const fetchContentItems = async (type: string) => {
      setIsLoadingContent(true);
      setSelectedContent(null);
      setEnrolledStudents([]);
      let endpoint = '/api/courses';
      if (type === 'WORKSHOP') endpoint = '/api/workshops';
      if (type === 'BOOTCAMP') endpoint = '/api/bootcamps';
      try {
          const res = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: "include" });
          if (res.ok) {
              const data = await res.json();
              setContentItems(Array.isArray(data) ? data : []);
          } else {
              toast.error("فشل في جلب المحتوى.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsLoadingContent(false);
      }
  };

  const fetchEnrolledStudents = async (contentId: string, type: string) => {
      setIsLoadingStudents(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/content-students/${contentId}`, { credentials: "include" });
          if (res.ok) {
              const data = await res.json();
              setEnrolledStudents(data);
          } else {
              toast.error("فشل في جلب قائمة الطلاب المسجلين.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsLoadingStudents(false);
      }
  };

  const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/teachers-management`, { credentials: "include" });
          if (res.ok) setTeachersList(await res.json());
      } catch (err) { toast.error("خطأ في الاتصال بالخادم."); } finally { setIsLoadingTeachers(false); }
  };

  const handleOpenEnrollmentsModal = () => {
      setShowEnrollmentsModal(true);
      setEnrollmentsTab('COURSE');
      fetchContentItems('COURSE');
  };

  const handleTabChange = (tab: 'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'TEACHER') => {
      setEnrollmentsTab(tab);
      if (tab === 'TEACHER') fetchTeachers();
      else fetchContentItems(tab);
  };

  const handleDeductBalance = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!deductAmount || Number(deductAmount) <= 0) {
          toast.error("يرجى إدخال مبلغ صحيح للخصم.");
          return;
      }
      if (Number(deductAmount) > deductModal.maxAmount) {
          toast.error("لا يمكنك خصم مبلغ أكبر من رصيد الطالب الحالي!");
          return;
      }
      setIsDeducting(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/deduct-wallet`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: "include",
              body: JSON.stringify({ userId: deductModal.userId, amount: Number(deductAmount) })
          });
          const data = await res.json();
          if (res.ok) {
              toast.success(`تم سحب ${deductAmount} ل.س بنجاح! الرصيد المتبقي: ${data.newBalance} ل.س`);
              setDeductModal({ show: false, userId: '', userName: '', maxAmount: 0 });
              setDeductAmount("");
              setEnrolledStudents(prev => prev.map(student => student.id === deductModal.userId ? { ...student, balance: data.newBalance } : student));
              setAllUsersList(prev => prev.map(user => user.id === deductModal.userId ? { ...user, balance: data.newBalance } : user));
          } else {
              toast.error(data.message || "فشلت عملية سحب الرصيد.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsDeducting(false);
      }
  };

  const handleResetDevice = async (userId: string, deviceType: 'web' | 'desktop' | 'mobile') => {
      const deviceName = deviceType === 'web' ? 'المتصفح' : deviceType === 'desktop' ? 'تطبيق الكمبيوتر' : 'تطبيق الموبايل';
      if (!confirm(`هل أنت متأكد من تصفير جلسة (${deviceName})؟ سيتمكن من الدخول من جهاز جديد من نفس النوع.`)) return;
      
      const toastId = toast.loading(`جاري تصفير ${deviceName}...`);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/reset-device/${userId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: "include",
              body: JSON.stringify({ deviceType }) 
          });
          const data = await res.json();
          if (res.ok) {
              toast.success(data.message || "تم التصفير بنجاح!", { id: toastId });
              if (enrollmentsTab === 'TEACHER') {
                  setTeachersList(prev => prev.map(t => t.id === userId ? { ...t, [`${deviceType}DeviceId`]: null } : t));
              } else {
                  setEnrolledStudents(prev => prev.map(s => s.id === userId ? { ...s, [`${deviceType}DeviceId`]: null } : s));
              }
              setAllUsersList(prev => prev.map(u => u.id === userId ? { ...u, [`${deviceType}DeviceId`]: null } : u));
          } else {
              toast.error(data.message || "فشلت عملية التصفير.", { id: toastId });
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.", { id: toastId });
      }
  };

  const handleResetAllUsersDevices = async () => {
    if (!confirm("تنبيه خطير ⚠️: هل أنت متأكد من تصفير جميع الأجهزة (ويب، ديسكتوب، موبايل) لـ *جميع المستخدمين* في المنصة دفعة واحدة؟ سيتم تسجيل خروج الجميع وحذف جلسات أجهزتهم.")) return;
    
    setIsResettingAll(true);
    const toastId = toast.loading("جاري تصفير جميع الأجهزة في المنصة...");
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/admin/reset-all-devices`, {
            method: 'PATCH',
            credentials: "include"
        });
        const data = await res.json();
        
        if (res.ok) {
            toast.success(data.message || "تم تصفير أجهزة جميع المستخدمين بنجاح!", { id: toastId });
            setEnrolledStudents(prev => prev.map(s => ({ ...s, webDeviceId: null, desktopDeviceId: null, mobileDeviceId: null })));
            setTeachersList(prev => prev.map(t => ({ ...t, webDeviceId: null, desktopDeviceId: null, mobileDeviceId: null })));
            setAllUsersList(prev => prev.map(u => ({ ...u, webDeviceId: null, desktopDeviceId: null, mobileDeviceId: null })));
        } else {
            toast.error(data.message || "فشلت عملية التصفير الشامل.", { id: toastId });
        }
    } catch (err) {
        toast.error("خطأ في الاتصال بالخادم.", { id: toastId });
    } finally {
        setIsResettingAll(false);
    }
  };

  const handleOpenProgressModal = async (studentId: string, studentName: string) => {
      if (!selectedContent) return;
      setSelectedStudentForProgress({ id: studentId, name: studentName });
      setShowProgressModal(true);
      setIsLoadingProgress(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/admin/student-progress/${studentId}/${selectedContent.id}`, { credentials: "include" });
          if (res.ok) {
              const data = await res.json();
              setStudentProgressData(data); 
          } else {
              toast.error("فشل في جلب سجل مشاهدات الطالب.");
          }
      } catch (err) {
          toast.error("خطأ في الاتصال بالخادم.");
      } finally {
          setIsLoadingProgress(false);
      }
  };

  const formatEnrollmentDate = (dateString: string) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchSuspiciousAccounts = async () => {
    setIsLoadingSuspicious(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/suspicious-accounts`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSuspiciousAccounts(data);
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoadingSuspicious(false);
    }
  };

  const handleOpenSuspiciousModal = () => {
    setShowSuspiciousModal(true);
    fetchSuspiciousAccounts();
  };

  const fetchBannedAccounts = async () => {
    setIsLoadingBanned(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/banned-users`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBannedAccounts(data);
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoadingBanned(false);
    }
  };

  const handleOpenBannedModal = () => {
    setShowBannedModal(true);
    fetchBannedAccounts();
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من فك الحظر عن هذا الطالب؟')) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/unban/${userId}`, { method: 'POST', credentials: "include" });
      if (res.ok) {
        toast.success("تم فك الحظر عن الطالب بنجاح!");
        setBannedAccounts(prev => prev.filter(account => account.id !== userId));
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string, durationInMinutes: number | 'permanent', label: string) => {
    if (!confirm(`هل أنت متأكد من حظر هذا الطالب لمدة: ${label}؟`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/ban/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ duration: durationInMinutes })
      });
      if (res.ok) {
        toast.success(`تم تطبيق حظر (${label}) بنجاح!`);
        setSuspiciousAccounts(prev => prev.filter(account => account.id !== userId));
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetUserIps = async (userId: string) => {
    if (!confirm('هل أنت متأكد من مسح سجل IPs هذا الطالب؟')) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/clear-ips/${userId}`, { method: 'DELETE', credentials: "include" });
      if (res.ok) {
        toast.success("تم مسح السجل بنجاح!");
        setSuspiciousAccounts(prev => prev.filter(account => account.id !== userId));
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('تنبيه خطير: هل أنت متأكد من حذف هذا الطالب نهائياً؟')) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/delete-student/${userId}`, { method: 'DELETE', credentials: "include" });
      if (res.ok) {
        toast.success("تم حذف الطالب من المنصة!");
        setSuspiciousAccounts(prev => prev.filter(account => account.id !== userId));
        setBannedAccounts(prev => prev.filter(account => account.id !== userId)); 
        setAllUsersList(prev => prev.filter(account => account.id !== userId));
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAboutModal = async () => {
    setShowAboutModal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/settings`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAboutSettings({
          aboutPlatform: data.aboutPlatform || "",
          ownerName: data.ownerName || "",
          ownerBio: data.ownerBio || "",
          ownerImage: data.ownerImage || "",
          teamDesignName: data.teamDesignName || "",
          teamDesignAvatar: data.teamDesignAvatar || "boy",
          teamManageName: data.teamManageName || "",
          teamManageAvatar: data.teamManageAvatar || "boy",
          teamSecurityName: data.teamSecurityName || "",
          teamSecurityAvatar: data.teamSecurityAvatar || "boy",
          teamSupportName: data.teamSupportName || "",
          teamSupportAvatar: data.teamSupportAvatar || "boy"
        });
      }
    } catch (err) {
      toast.error("فشل في جلب إعدادات صفحة من نحن.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingImage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        credentials: "include", 
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.url || data.fileUrl || data.imageUrl;
        setAboutSettings(prev => ({ ...prev, ownerImage: uploadedUrl }));
        toast.success("تم رفع الصورة بنجاح!");
      } else {
        toast.error("فشل رفع الصورة للمخدم.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال أثناء الرفع.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveAboutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAbout(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", 
        body: JSON.stringify(aboutSettings)
      });
      if (res.ok) {
        toast.success("تم حفظ إعدادات 'من نحن' بنجاح!");
        setShowAboutModal(false);
      } else {
        toast.error("فشل في حفظ التعديلات.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم.");
    } finally {
      setIsSavingAbout(false);
    }
  };

  const fetchAllExams = async () => {
    setIsLoadingExams(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam/admin/all-exams`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAllExams(data);
      } else {
        toast.error("فشل في جلب الامتحانات.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم.");
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handleOpenExamsModal = () => {
    setShowExamsModal(true);
    fetchAllExams();
  };

  const handleToggleExamStatus = async (contentId: string, currentStatus: boolean, examTitle: string) => {
    const actionText = currentStatus ? "إغلاق" : "فتح";
    if (!confirm(`هل أنت متأكد من ${actionText} امتحان "${examTitle}"؟\nملاحظة هامة جداً: عند الفتح، سيتم تصفير علامات وعدادات جميع الطلاب الذين قدموا مسبقاً ليبدأ الجميع معاً.`)) return;
    
    setTogglingExamId(contentId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam/${contentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ isOpen: !currentStatus })
      });
      if (res.ok) {
        toast.success(`تم ${actionText} الامتحان بنجاح!`);
        setAllExams(prev => prev.map(exam => exam.contentId === contentId ? { ...exam, isOpen: !currentStatus } : exam));
      } else {
        toast.error("فشل في تغيير حالة الامتحان.");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم.");
    } finally {
      setTogglingExamId(null);
    }
  };

  return (
    <div className="min-h-screen text-white pt-12 px-8 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">لوحة التحكم العامة 🚀</h1>
            <p className="text-gray-400">مرحباً بك في مركز إدارة المنصة</p>
          </div>
          <div className="hidden md:block px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-400">
              آخر تحديث: {isMounted ? new Date().toLocaleDateString('ar-EG') : "جاري التحديث..."}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/admin/dashboard/enrollments" className="block group"> 
            <StatCard title="إجمالي الطلاب" value={stats.users} loading={loading} icon={Users} color="text-blue-500 group-hover:text-white" bg="bg-blue-500/10 group-hover:bg-blue-500" />
          </Link>
          <StatCard title="المواد الأكاديمية" value={stats.courses} loading={loading} icon={BookOpen} color="text-cyan-500" bg="bg-cyan-500/10" />
          <StatCard title="الورشات النشطة" value={stats.workshops} loading={loading} icon={Layers} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard title="المعسكرات" value={stats.bootcamps} loading={loading} icon={Zap} color="text-pink-500" bg="bg-pink-500/10" />
        </div>

        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <PenTool size={24} className="text-purple-500" />
            إدارة المحتوى والطلاب
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          <button onClick={() => { setShowMonitorModal(true); setSelectedExamId(null); }} className="text-right group p-6 bg-gradient-to-br from-indigo-600/20 to-purple-900/20 border border-indigo-500/30 rounded-3xl hover:bg-indigo-600 hover:border-indigo-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <Activity size={24} className="text-indigo-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-indigo-100 group-hover:text-white">المراقبة الحية</h3>
            <p className="text-xs text-indigo-200/70 group-hover:text-indigo-100 relative z-10">مراقبة جودة اتصال الطلاب وحالات الغش.</p>
          </button>

          <button onClick={handleOpenExamsModal} className="text-right group p-6 bg-gradient-to-br from-fuchsia-600/20 to-pink-900/20 border border-fuchsia-500/30 rounded-3xl hover:bg-fuchsia-600 hover:border-fuchsia-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(217,70,239,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <Lock size={24} className="text-fuchsia-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-fuchsia-100 group-hover:text-white">إدارة الامتحانات</h3>
            <p className="text-xs text-fuchsia-200/70 group-hover:text-fuchsia-100 relative z-10">فتح وإغلاق الامتحانات وتصفير عدادات الطلاب.</p>
          </button>

          <button onClick={handleOpenAllUsersModal} className="text-right group p-6 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 border border-blue-500/30 rounded-3xl hover:bg-blue-600 hover:border-blue-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <Database size={24} className="text-blue-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-blue-100 group-hover:text-white">قاعدة بيانات المنصة</h3>
            <p className="text-xs text-blue-200/70 group-hover:text-blue-100 relative z-10">عرض كل المسجلين وتصفير أجهزتهم بضغطة زر.</p>
          </button>

          <button onClick={handleOpenSVUModal} className="text-right group p-6 bg-gradient-to-br from-sky-600/20 to-blue-900/20 border border-sky-500/30 rounded-3xl hover:bg-sky-600 hover:border-sky-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <Network size={24} className="text-sky-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-sky-100 group-hover:text-white">مسارات مواد (SVU)</h3>
            <p className="text-xs text-sky-200/70 group-hover:text-sky-100 relative z-10">إضافة المواد الجامعية والأسبقيات والوحدات.</p>
          </button>

          <button onClick={handleOpenSuspiciousModal} className="text-right group p-6 bg-gradient-to-br from-red-600/20 to-rose-900/20 border border-red-500/30 rounded-3xl hover:bg-red-600 hover:border-red-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <ShieldAlert size={24} className="text-red-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-red-100 group-hover:text-white">مشاركة الحسابات</h3>
            <p className="text-xs text-red-200/70 group-hover:text-red-100 relative z-10">اكتشاف الطلاب الذين يستخدمون أكثر من IP.</p>
          </button>

          <button onClick={handleOpenBannedModal} className="text-right group p-6 bg-gradient-to-br from-orange-600/20 to-orange-900/20 border border-orange-500/30 rounded-3xl hover:bg-orange-600 hover:border-orange-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <UserX size={24} className="text-orange-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-orange-100 group-hover:text-white">الطلاب المحظورين</h3>
            <p className="text-xs text-orange-200/70 group-hover:text-orange-100 relative z-10">سجل الإيقافات وفك الحظر عن الحسابات.</p>
          </button>

          <button onClick={handleOpenEnrollmentsModal} className="text-right group p-6 bg-gradient-to-br from-cyan-600/20 to-teal-900/20 border border-cyan-500/30 rounded-3xl hover:bg-cyan-600 hover:border-cyan-500 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)] xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <BookOpen size={24} className="text-cyan-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-cyan-100 group-hover:text-white">المسجلين والأجهزة</h3>
            <p className="text-xs text-cyan-200/70 group-hover:text-cyan-100 relative z-10">عرض الطلاب والأساتذة وإدارة جلسات أجهزتهم.</p>
          </button>

          <button onClick={() => setShowRechargeModal(true)} className="text-right group p-6 bg-gradient-to-br from-green-600/20 to-emerald-900/20 border border-green-500/30 rounded-3xl hover:bg-green-600 hover:border-green-500 transition-all relative overflow-hidden xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <WalletCards size={24} className="text-green-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-green-100 group-hover:text-white">شحن يدوياً</h3>
            <p className="text-xs text-green-200/70 group-hover:text-green-100 relative z-10">إضافة رصيد (ل.س) مباشرة لحساب الطالب.</p>
          </button>

          <Link href="/admin/dashboard/recharge-requests" className="group p-6 bg-gradient-to-br from-yellow-600/20 to-amber-900/20 border border-yellow-500/30 rounded-3xl hover:bg-yellow-600 hover:border-yellow-500 transition-all relative overflow-hidden xl:col-span-1">
             <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <ListChecks size={24} className="text-yellow-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-yellow-100 group-hover:text-white">طلبات الحوالات</h3>
            <p className="text-xs text-yellow-200/70 group-hover:text-yellow-100 relative z-10">مراجعة إيصالات حوالات الطلاب وقبولها.</p>
          </Link>

          <button onClick={handleOpenAboutModal} className="text-right group p-6 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 border border-blue-500/30 rounded-3xl hover:bg-blue-600 hover:border-blue-500 transition-all relative overflow-hidden xl:col-span-1">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-white/20 relative z-10">
              <Info size={24} className="text-blue-400 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10 text-blue-100 group-hover:text-white">إعدادات (من نحن)</h3>
            <p className="text-xs text-blue-200/70 group-hover:text-blue-100 relative z-10">تعديل معلومات المنصة، المالك، وفريق العمل.</p>
          </button>

        </div>
      </div>

      {showAllUsersModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowAllUsersModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-blue-500/30 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                  <Database size={28} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">قاعدة بيانات المستخدمين</h2>
                  <p className="text-sm text-gray-400">
                    جميع الحسابات المسجلة في المنصة، مع خيارات تصفير الأجهزة السريعة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResetAllUsersDevices}
                  disabled={isResettingAll}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  {isResettingAll ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  تصفير أجهزة جميع المستخدمين
                </button>

                <button onClick={() => setShowAllUsersModal(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col bg-[#060a14] rounded-b-[2.5rem]">
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="ابحث عن طالب باستخدام الاسم أو البريد الإلكتروني..."
                  value={usersSearchTerm}
                  onChange={(e) => setUsersSearchTerm(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl bg-[#0f172a]">
                {isLoadingAllUsers ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                    <p className="text-gray-400">جاري جلب قاعدة البيانات...</p>
                  </div>
                ) : filteredAllUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                    <Database size={48} className="mb-4 opacity-30" />
                    <p className="text-lg">لا يوجد مستخدمين بهذا الاسم</p>
                  </div>
                ) : (
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-black/30 text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="p-4 border-b border-white/5">المستخدم</th>
                        <th className="p-4 border-b border-white/5">الصلاحية</th>
                        <th className="p-4 border-b border-white/5 text-center">أجهزة نشطة (اضغط للتصفير)</th>
                        <th className="p-4 border-b border-white/5 text-center">تاريخ الانضمام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {filteredAllUsers.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${
                              user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                              user.role === 'TEACHER' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-white/10 text-gray-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                                <button 
                                    onClick={() => user.webDeviceId && handleResetDevice(user.id, 'web')} 
                                    disabled={!user.webDeviceId} 
                                    title={user.webDeviceId ? 'تصفير متصفح الويب' : 'غير مسجل الدخول من متصفح'} 
                                    className={`p-2 rounded-lg border transition-all ${user.webDeviceId ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                >
                                    <Globe size={18} />
                                </button>
                                <button 
                                    onClick={() => user.desktopDeviceId && handleResetDevice(user.id, 'desktop')} 
                                    disabled={!user.desktopDeviceId} 
                                    title={user.desktopDeviceId ? 'تصفير تطبيق الكمبيوتر' : 'غير مسجل من كمبيوتر'} 
                                    className={`p-2 rounded-lg border transition-all ${user.desktopDeviceId ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                >
                                    <Monitor size={18} />
                                </button>
                                <button 
                                    onClick={() => user.mobileDeviceId && handleResetDevice(user.id, 'mobile')} 
                                    disabled={!user.mobileDeviceId} 
                                    title={user.mobileDeviceId ? 'تصفير الموبايل' : 'غير مسجل من موبايل'} 
                                    className={`p-2 rounded-lg border transition-all ${user.mobileDeviceId ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                >
                                    <Smartphone size={18} />
                                </button>
                            </div>
                          </td>
                          <td className="p-4 text-center text-gray-400 font-mono text-xs">
                            {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSVUModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowSVUModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-sky-500/30 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] shadow-[0_0_40px_rgba(14,165,233,0.15)] z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-sky-500/20 p-3 rounded-xl border border-sky-500/30">
                  <Network size={28} className="text-sky-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">إدارة مسارات ومواد (SVU)</h2>
                  <p className="text-sm text-gray-400">
                    أضف المواد الجامعية، حدد الرموز، الساعات المعتمدة، واربطها بأسبقياتها.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSVUModal(false)} aria-label="إغلاق النافذة" className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14] flex flex-col lg:flex-row gap-6">
              
              <div className="w-full lg:w-1/3 bg-[#0f172a] border border-white/10 rounded-2xl p-5 h-fit sticky top-0">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                  <PlusCircle size={20} className="text-sky-400"/> إضافة مادة جديدة
                </h3>
                <form onSubmit={handleSaveSVUCourse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">رمز المقرر (مثل: GCS301)</label>
                    <input 
                      required type="text" dir="ltr"
                      value={svuForm.code} onChange={(e) => setSvuForm({...svuForm, code: e.target.value.toUpperCase()})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-sky-500 transition-colors font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">اسم المقرر (مثل: مهارات الحاسوب)</label>
                    <input 
                      required type="text"
                      value={svuForm.name} onChange={(e) => setSvuForm({...svuForm, name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">عدد الوحدات المعتمدة (الساعات)</label>
                    <input 
                      required type="number" min="1" max="10" dir="ltr"
                      value={svuForm.credits} onChange={(e) => setSvuForm({...svuForm, credits: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-sky-500 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">الأسبقيات (افصل بينها بفاصلة ، أو اكتب None)</label>
                    <input 
                      type="text" dir="ltr" placeholder="مثال: BMA401, BLC401"
                      value={svuForm.prerequisites} onChange={(e) => setSvuForm({...svuForm, prerequisites: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-sky-500 transition-colors font-mono"
                    />
                  </div>
                  <button type="submit" disabled={isSavingSVU} className="w-full py-3 mt-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                    {isSavingSVU ? <Loader2 size={18} className="animate-spin" /> : "حفظ المادة بالمنظومة"}
                  </button>
                </form>
              </div>

              <div className="w-full lg:w-2/3">
                {isLoadingSVU ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                    <p className="text-gray-400">جاري جلب هيكلية المواد...</p>
                  </div>
                ) : svuCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-[#0f172a] rounded-2xl border border-dashed border-white/10">
                    <Network size={48} className="mb-4 opacity-30" />
                    <p className="text-lg font-bold">شجرة المواد فارغة</p>
                    <p className="text-sm mt-1">قم بإضافة المواد من القائمة الجانبية لتبدأ في بناء المسار.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0f172a]">
                    <table className="w-full text-right border-collapse min-w-[600px]">
                      <thead className="bg-black/30 text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="p-4 border-b border-white/5">رمز المقرر</th>
                          <th className="p-4 border-b border-white/5">اسم المقرر</th>
                          <th className="p-4 border-b border-white/5 text-center">الوحدات</th>
                          <th className="p-4 border-b border-white/5">الأسبقيات</th>
                          <th className="p-4 border-b border-white/5 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {svuCourses.map(course => (
                          <tr key={course.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-sky-400" dir="ltr">{course.code}</td>
                            <td className="p-4 font-bold text-white">{course.name}</td>
                            <td className="p-4 text-center text-gray-300 font-mono">{course.credits}</td>
                            <td className="p-4">
                              {course.prerequisites === 'None' || !course.prerequisites ? (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded">بدون أسبقية</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {course.prerequisites.split(',').map((pre: string, i: number) => (
                                    <span key={i} className="bg-white/10 text-gray-300 text-[10px] px-2 py-1 rounded font-mono" dir="ltr">
                                      {pre.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleDeleteSVUCourse(course.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-lg transition-colors border border-red-500/20" title="حذف المادة">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {showExamsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowExamsModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-fuchsia-500/30 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-fuchsia-500/20 p-3 rounded-xl border border-fuchsia-500/30">
                  <Lock size={28} className="text-fuchsia-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">إدارة حالة الامتحانات</h2>
                  <p className="text-sm text-gray-400">
                    افتـح الامتحانات ليتمكن الطلاب من الدخول، وأغلقها فور انتهاء الوقت.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowExamsModal(false)} aria-label="إغلاق النافذة" title="إغلاق النافذة" className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14]">
              {isLoadingExams ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="animate-spin text-fuchsia-500 mb-4" size={40} />
                  <p className="text-gray-400">جاري جلب الامتحانات...</p>
                </div>
              ) : allExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <BookOpen size={48} className="mb-4 opacity-50" />
                  <p className="text-xl font-bold">لا يوجد أي امتحانات</p>
                  <p className="text-gray-400 mt-2">يجب عليك إنشاء امتحانات من لوحة إدارة المحتوى أولاً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allExams.map(exam => (
                    <div key={exam.contentId} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-fuchsia-500/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">{exam.examTitle}</h3>
                          <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded inline-block mt-1">{exam.parentName}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${exam.isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                          {exam.isOpen ? 'مفتوح الآن' : 'مغلق'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-sm text-gray-400 font-bold">{exam.totalScore} نقطة</span>
                        <button 
                          onClick={() => handleToggleExamStatus(exam.contentId, exam.isOpen, exam.examTitle)}
                          disabled={togglingExamId === exam.contentId}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            exam.isOpen 
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30' 
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                          }`}
                        >
                          {togglingExamId === exam.contentId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : exam.isOpen ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                          {exam.isOpen ? 'إغلاق الامتحان' : 'فتح الامتحان'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowAboutModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-blue-500/30 rounded-[2rem] w-full max-w-4xl max-h-[90vh] shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2rem]">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                  <Info size={28} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">إعدادات صفحة (من نحن)</h2>
                  <p className="text-sm text-gray-400">تعديل معلومات المنصة، المالك والفريق والتي ستظهر للمستخدمين.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAboutModal(false)} 
                aria-label="إغلاق نافذة الإعدادات" 
                title="إغلاق نافذة الإعدادات"
                className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14]">
              <form id="aboutSettingsForm" onSubmit={handleSaveAboutSettings} className="space-y-8">
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">1. معلومات المنصة</h3>
                  <div>
                    <label htmlFor="aboutPlatform" className="block text-sm font-bold text-gray-300 mb-2">نبذة عن المنصة والأهداف</label>
                    <textarea 
                      id="aboutPlatform"
                      title="نبذة عن المنصة والأهداف"
                      aria-label="نبذة عن المنصة والأهداف"
                      required rows={4}
                      value={aboutSettings.aboutPlatform}
                      onChange={(e) => setAboutSettings({...aboutSettings, aboutPlatform: e.target.value})}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-colors custom-scrollbar"
                      placeholder="اكتب هنا أهداف المنصة ورؤيتها..."
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">2. المبرمج وصاحب المنصة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label htmlFor="ownerName" className="block text-sm font-bold text-gray-300 mb-2">الاسم الكامل</label>
                      <input 
                        id="ownerName"
                        title="الاسم الكامل"
                        aria-label="الاسم الكامل"
                        type="text" required
                        value={aboutSettings.ownerName}
                        onChange={(e) => setAboutSettings({...aboutSettings, ownerName: e.target.value})}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 transition-colors"
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ownerImageUpload" className="block text-sm font-bold text-gray-300 mb-2">صورة المبرمج (رفع)</label>
                      <div className="flex items-center gap-3">
                        <label 
                          htmlFor="ownerImageUpload"
                          className="flex-1 flex items-center justify-center gap-2 bg-[#0f172a] border border-dashed border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500 text-blue-400 rounded-xl p-3 cursor-pointer transition-all"
                        >
                          {isUploadingImage ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                          <span className="text-sm font-bold">{isUploadingImage ? "جاري الرفع..." : "اختر صورة للرفع"}</span>
                          <input 
                            id="ownerImageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                          />
                        </label>
                        {aboutSettings.ownerImage && (
                           <img src={aboutSettings.ownerImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ownerBio" className="block text-sm font-bold text-gray-300 mb-2">نبذة مختصرة</label>
                    <textarea 
                      id="ownerBio"
                      title="نبذة مختصرة"
                      aria-label="نبذة مختصرة"
                      required rows={3}
                      value={aboutSettings.ownerBio}
                      onChange={(e) => setAboutSettings({...aboutSettings, ownerBio: e.target.value})}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-colors custom-scrollbar"
                      placeholder="نبذة عن المبرمج..."
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">3. فريق المنصة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                      <p className="text-blue-400 font-bold mb-3 text-sm">التصميم والواجهات</p>
                      <div className="space-y-3">
                        <input type="text" aria-label="اسم مسؤول التصميم" title="اسم مسؤول التصميم" placeholder="اسم المسؤول" value={aboutSettings.teamDesignName} onChange={(e) => setAboutSettings({...aboutSettings, teamDesignName: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                        <select aria-label="صورة مسؤول التصميم" title="صورة مسؤول التصميم" value={aboutSettings.teamDesignAvatar} onChange={(e) => setAboutSettings({...aboutSettings, teamDesignAvatar: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-gray-300 text-sm">
                          <option value="boy">شاب 👨‍💻</option><option value="girl">فتاة 👩‍💻</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                      <p className="text-emerald-400 font-bold mb-3 text-sm">الإدارة العامة والتسويق</p>
                      <div className="space-y-3">
                        <input type="text" aria-label="اسم مسؤول الإدارة" title="اسم مسؤول الإدارة" placeholder="اسم المسؤول" value={aboutSettings.teamManageName} onChange={(e) => setAboutSettings({...aboutSettings, teamManageName: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                        <select aria-label="صورة مسؤول الإدارة" title="صورة مسؤول الإدارة" value={aboutSettings.teamManageAvatar} onChange={(e) => setAboutSettings({...aboutSettings, teamManageAvatar: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-gray-300 text-sm">
                          <option value="boy">شاب 👨‍💼</option><option value="girl">فتاة 👩‍💼</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                      <p className="text-red-400 font-bold mb-3 text-sm">الحماية والأمن السيبراني</p>
                      <div className="space-y-3">
                        <input type="text" aria-label="اسم مسؤول الحماية" title="اسم مسؤول الحماية" placeholder="اسم المسؤول" value={aboutSettings.teamSecurityName} onChange={(e) => setAboutSettings({...aboutSettings, teamSecurityName: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                        <select aria-label="صورة مسؤول الحماية" title="صورة مسؤول الحماية" value={aboutSettings.teamSecurityAvatar} onChange={(e) => setAboutSettings({...aboutSettings, teamSecurityAvatar: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-gray-300 text-sm">
                          <option value="boy">شاب 🕵️‍♂️</option><option value="girl">فتاة 🕵️‍♀️</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                      <p className="text-orange-400 font-bold mb-3 text-sm">الدعم الفني وخدمة العملاء</p>
                      <div className="space-y-3">
                        <input type="text" aria-label="اسم مسؤول الدعم" title="اسم مسؤول الدعم" placeholder="اسم المسؤول" value={aboutSettings.teamSupportName} onChange={(e) => setAboutSettings({...aboutSettings, teamSupportName: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                        <select aria-label="صورة مسؤول الدعم" title="صورة مسؤول الدعم" value={aboutSettings.teamSupportAvatar} onChange={(e) => setAboutSettings({...aboutSettings, teamSupportAvatar: e.target.value})} className="w-full bg-[#060a14] border border-white/10 rounded-lg p-2.5 text-gray-300 text-sm">
                          <option value="boy">شاب 🎧</option><option value="girl">فتاة 🎧</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-[#0f172a] rounded-b-[2rem]">
              <button 
                type="submit" form="aboutSettingsForm" disabled={isSavingAbout}
                aria-label="حفظ التعديلات" title="حفظ التعديلات"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isSavingAbout ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> حفظ التعديلات ونشرها</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {showEnrollmentsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowEnrollmentsModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-7xl max-h-[90vh] shadow-2xl z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30">
                  <Users size={28} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">إدارة المسجلين والأرصدة والأجهزة</h2>
                  <p className="text-sm text-gray-400">
                    تصفح المواد والطلاب والأساتذة لتعديل الأرصدة أو تصفير جلسات أجهزتهم للحد من الغش.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEnrollmentsModal(false)} 
                aria-label="إغلاق نافذة إدارة المسجلين"
                title="إغلاق نافذة إدارة المسجلين"
                className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-white/10 bg-[#060a14] overflow-x-auto">
               <button 
                  onClick={() => handleTabChange('COURSE')} 
                  className={`flex-1 min-w-[150px] py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${enrollmentsTab === 'COURSE' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                  <BookOpen size={18}/> الكورسات المدفوعة
               </button>
               <button 
                  onClick={() => handleTabChange('WORKSHOP')} 
                  className={`flex-1 min-w-[150px] py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${enrollmentsTab === 'WORKSHOP' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                  <Layers size={18}/> الورشات
               </button>
               <button 
                  onClick={() => handleTabChange('BOOTCAMP')} 
                  className={`flex-1 min-w-[150px] py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${enrollmentsTab === 'BOOTCAMP' ? 'bg-pink-500/10 text-pink-400 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                  <Zap size={18}/> المعسكرات
               </button>
               <button 
                  onClick={() => handleTabChange('TEACHER')} 
                  className={`flex-1 min-w-[150px] py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${enrollmentsTab === 'TEACHER' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
               >
                  <GraduationCap size={18}/> إدارة الأساتذة
               </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#060a14]">
               
               {enrollmentsTab === 'TEACHER' ? (
                 <div className="w-full overflow-y-auto custom-scrollbar p-6">
                    {isLoadingTeachers ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
                            <p className="text-gray-400">جاري جلب قائمة الأساتذة...</p>
                        </div>
                    ) : teachersList.length === 0 ? (
                        <div className="text-center p-12 text-gray-500">لا يوجد أساتذة مسجلين حالياً.</div>
                    ) : (
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-[#0f172a] text-gray-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 rounded-tr-xl">اسم الأستاذ</th>
                                    <th className="p-4">التخصص</th>
                                    <th className="p-4 text-center">جلسات الأجهزة النشطة (للتصفير)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {teachersList.map(teacher => (
                                    <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                <img src={teacher.avatar || '/uploads/avatars/default.png'} alt={teacher.firstName} className="w-8 h-8 rounded-full" />
                                                {teacher.firstName} {teacher.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{teacher.email}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">{teacher.specialization || "-"}</td>
                                        
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => teacher.webDeviceId && handleResetDevice(teacher.id, 'web')} 
                                                    disabled={!teacher.webDeviceId} 
                                                    title={teacher.webDeviceId ? 'تصفير متصفح الويب' : 'غير مسجل الدخول من متصفح'} 
                                                    className={`p-2 rounded-lg border transition-all ${teacher.webDeviceId ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                >
                                                    <Globe size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => teacher.desktopDeviceId && handleResetDevice(teacher.id, 'desktop')} 
                                                    disabled={!teacher.desktopDeviceId} 
                                                    title={teacher.desktopDeviceId ? 'تصفير تطبيق الكمبيوتر' : 'غير مسجل من كمبيوتر'} 
                                                    className={`p-2 rounded-lg border transition-all ${teacher.desktopDeviceId ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                >
                                                    <Monitor size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => teacher.mobileDeviceId && handleResetDevice(teacher.id, 'mobile')} 
                                                    disabled={!teacher.mobileDeviceId} 
                                                    title={teacher.mobileDeviceId ? 'تصفير الموبايل' : 'غير مسجل من موبايل'} 
                                                    className={`p-2 rounded-lg border transition-all ${teacher.mobileDeviceId ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                >
                                                    <Smartphone size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                 </div>
               ) : (
                 <>
                   <div className="w-full md:w-1/3 lg:w-1/4 border-l border-white/10 overflow-y-auto custom-scrollbar p-4 bg-white/[0.02]">
                      <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 px-2">اختر من القائمة:</h3>
                      {isLoadingContent ? (
                          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-500" /></div>
                      ) : contentItems.length === 0 ? (
                          <div className="text-center p-8 text-gray-500 text-sm">لا يوجد محتوى في هذا القسم.</div>
                      ) : (
                          <div className="space-y-2">
                              {contentItems.map(item => (
                                  <button 
                                      key={item.id}
                                      onClick={() => {
                                          setSelectedContent(item);
                                          fetchEnrolledStudents(item.id, enrollmentsTab);
                                      }}
                                      className={`w-full text-right p-4 rounded-xl border transition-all ${selectedContent?.id === item.id ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                  >
                                      <div className="font-bold truncate">{item.title}</div>
                                  </button>
                              ))}
                          </div>
                      )}
                   </div>

                   <div className="w-full md:w-2/3 lg:w-3/4 overflow-y-auto custom-scrollbar p-6 relative">
                      {!selectedContent ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                              <Search size={64} className="mb-4" />
                              <p>اختر مادة من القائمة الجانبية لعرض طلابها</p>
                          </div>
                      ) : isLoadingStudents ? (
                          <div className="flex flex-col items-center justify-center h-full">
                              <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
                              <p className="text-gray-400">جاري جلب قائمة الطلاب...</p>
                          </div>
                      ) : (
                          <>
                              <div className="mb-6 pb-4 border-b border-white/10 flex justify-between items-end">
                                  <div>
                                      <h3 className="text-xl font-black text-white">{selectedContent.title}</h3>
                                      <p className="text-sm text-cyan-400 mt-1 font-bold">{enrolledStudents.length} طالب مسجل</p>
                                  </div>
                              </div>

                              {enrolledStudents.length === 0 ? (
                                  <div className="text-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
                                      لا يوجد طلاب مسجلين في هذا المحتوى حالياً.
                                  </div>
                              ) : (
                                  <table className="w-full text-right border-collapse">
                                      <thead className="bg-[#0f172a] text-gray-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                                          <tr>
                                              <th className="p-4 rounded-tr-xl">اسم الطالب</th>
                                              <th className="p-4">تاريخ التسجيل</th>
                                              <th className="p-4 text-center">الجلسات والأجهزة (للتصفير)</th>
                                              <th className="p-4 text-center">رصيد (ل.س)</th>
                                              <th className="p-4 rounded-tl-xl text-center">إجراءات إضافية</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5 text-sm">
                                          {enrolledStudents.map(student => (
                                              <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                                  <td className="p-4">
                                                      <div className="font-bold text-white">{student.firstName} {student.lastName}</div>
                                                      <div className="text-xs text-gray-500">{student.email}</div>
                                                  </td>
                                                  <td className="p-4">
                                                      <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                                                          <CalendarDays size={14} className="text-cyan-500"/> 
                                                          {formatEnrollmentDate(student.enrollmentDate)}
                                                      </div>
                                                  </td>
                                                  
                                                  <td className="p-4 text-center">
                                                      <div className="flex gap-2 justify-center">
                                                          <button 
                                                              onClick={() => student.webDeviceId && handleResetDevice(student.id, 'web')} 
                                                              disabled={!student.webDeviceId} 
                                                              title={student.webDeviceId ? 'تصفير متصفح الويب' : 'غير مسجل الدخول من متصفح'} 
                                                              className={`p-1.5 rounded-lg border transition-all ${student.webDeviceId ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                          >
                                                              <Globe size={16} />
                                                          </button>
                                                          <button 
                                                              onClick={() => student.desktopDeviceId && handleResetDevice(student.id, 'desktop')} 
                                                              disabled={!student.desktopDeviceId} 
                                                              title={student.desktopDeviceId ? 'تصفير تطبيق الكمبيوتر' : 'غير مسجل من كمبيوتر'} 
                                                              className={`p-1.5 rounded-lg border transition-all ${student.desktopDeviceId ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                          >
                                                              <Monitor size={16} />
                                                          </button>
                                                          <button 
                                                              onClick={() => student.mobileDeviceId && handleResetDevice(student.id, 'mobile')} 
                                                              disabled={!student.mobileDeviceId} 
                                                              title={student.mobileDeviceId ? 'تصفير الموبايل' : 'غير مسجل من موبايل'} 
                                                              className={`p-1.5 rounded-lg border transition-all ${student.mobileDeviceId ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' : 'bg-white/5 text-gray-600 border-transparent cursor-not-allowed'}`}
                                                          >
                                                              <Smartphone size={16} />
                                                          </button>
                                                      </div>
                                                  </td>

                                                  <td className="p-4 text-center">
                                                      <span className="font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                          {student.balance || 0}
                                                      </span>
                                                  </td>
                                                  <td className="p-4 text-center flex items-center justify-center gap-2">
                                                      <button 
                                                          onClick={() => setDeductModal({ show: true, userId: student.id, userName: `${student.firstName} ${student.lastName}`, maxAmount: student.balance || 0 })}
                                                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                      >
                                                          <MinusCircle size={14}/> سحب
                                                      </button>
                                                      <button 
                                                          onClick={() => handleOpenProgressModal(student.id, `${student.firstName} ${student.lastName}`)}
                                                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500 hover:text-white transition-colors"
                                                      >
                                                          <Eye size={14}/> مشاهدات
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              )}
                          </>
                      )}
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowProgressModal(false)}></div>
            <div className="relative bg-[#0f172a] border border-purple-500/30 rounded-[2rem] p-6 sm:p-8 max-w-4xl w-full shadow-[0_0_40px_rgba(168,85,247,0.15)] z-10 animate-in zoom-in-95 max-h-[90vh] flex flex-col" dir="rtl">
                
                <button onClick={() => setShowProgressModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>

                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                    <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/30">
                        <PlayCircle size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">سجل المشاهدات والرصيد الزمني</h3>
                        <p className="text-sm text-gray-400">الطالب: <span className="font-bold text-purple-400">{selectedStudentForProgress?.name}</span></p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#060a14] rounded-2xl border border-white/5 p-4">
                    {isLoadingProgress ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
                        </div>
                    ) : studentProgressData.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">لا يوجد سجل مشاهدات.</div>
                    ) : (
                        <div className="space-y-3">
                            {studentProgressData.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-200 truncate">{item.title}</h4>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="text-gray-500">استهلك الطالب: <span className="text-white font-black font-mono bg-white/10 px-2 py-0.5 rounded">{Math.floor(item.consumedSeconds / 60)}</span> دقيقة</span>
                                            <span className="font-bold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">مفتوح (غير محدود) ♾️</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {deductModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeductModal({ show: false, userId: '', userName: '', maxAmount: 0 })}></div>
            <div className="relative bg-[#1e293b] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] z-10 animate-in zoom-in-95" dir="rtl">
                <button onClick={() => setDeductModal({ show: false, userId: '', userName: '', maxAmount: 0 })} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><MinusCircle size={32} /></div>
                    <h3 className="text-xl font-bold text-white mb-2">سحب رصيد</h3>
                    <p className="text-xs text-red-400 mt-2 bg-red-500/10 py-1 rounded border border-red-500/20">المتوفر: {deductModal.maxAmount} ل.س</p>
                </div>
                <form onSubmit={handleDeductBalance} className="space-y-4">
                    <input type="number" required min="1" max={deductModal.maxAmount} value={deductAmount} onChange={(e) => setDeductAmount(Number(e.target.value))} className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-white text-center font-bold text-lg" />
                    <button type="submit" disabled={isDeducting} className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                        {isDeducting ? <Loader2 className="animate-spin" size={24} /> : "تأكيد سحب الرصيد"}
                    </button>
                </form>
            </div>
        </div>
      )}

      {showMonitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowMonitorModal(false)}></div>
            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] shadow-2xl z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
                
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
                    <div className="flex items-center gap-4">
                        {selectedExamId ? (
                            <button onClick={() => setSelectedExamId(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300"><ArrowRight size={24} /></button>
                        ) : (
                            <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30"><Activity size={28} className="text-indigo-400 animate-pulse" /></div>
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-white">{selectedExamId ? 'غرفة المراقبة' : 'المراقبة الحية للغرف'}</h2>
                        </div>
                    </div>
                    <button onClick={() => setShowMonitorModal(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14]">
                    {!selectedExamId ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeRooms.map((room: any) => {
                                const studentCount = liveSessions.filter(s => s.examId === room.examId).length;
                                return (
                                    <div key={room.examId} onClick={() => setSelectedExamId(room.examId)} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer">
                                        <h3 className="font-bold text-white truncate">{room.examName}</h3>
                                        <div className="text-xs text-gray-500 mt-2">{studentCount} طلاب بالداخل</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase sticky top-0">
                                <tr><th className="p-4">اسم الطالب</th><th className="p-4 text-center">حالة الاتصال</th><th className="p-4 text-center">الإنذارات</th><th className="p-4 text-center">دخول / خروج</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {liveSessions.filter(s => s.examId === selectedExamId).map((session, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors text-white">
                                        <td className="p-4 font-bold">{session.studentName}</td>
                                        <td className="p-4 text-center">{session.status === 'ONLINE' ? 'متصل ✅' : 'منقطع ❌'}</td>
                                        <td className="p-4 text-center text-red-500">{session.warnings} إنذار</td>
                                        <td className="p-4 text-center text-xs text-gray-400">{new Date(session.joinedAt).toLocaleTimeString('ar-EG')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      )}

      {showSuspiciousModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowSuspiciousModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-7xl max-h-[90vh] shadow-2xl z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30"><ShieldAlert size={28} className="text-red-400" /></div>
                <div><h2 className="text-2xl font-black text-white">رصد مشاركة الحسابات</h2></div>
              </div>
              <button onClick={() => setShowSuspiciousModal(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14]">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase sticky top-0">
                    <tr><th className="p-4">المستخدم</th><th className="p-4 text-center">عدد الـ IPs</th><th className="p-4 text-center">الإجراءات</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {suspiciousAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-white/5 transition-colors text-white">
                        <td className="p-4"><div>{account.name}</div><div className="text-xs text-gray-500">{account.email}</div></td>
                        <td className="p-4 text-center text-red-400 font-bold">{account.uniqueIpsCount}</td>
                        <td className="p-4 text-center">
                            <button onClick={()=>handleBanUser(account.id, 'permanent', 'دائم')} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-1 rounded-md text-xs">حظر دائم</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {showBannedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowBannedModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl z-10 flex flex-col animate-in zoom-in-95" dir="rtl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30"><UserX size={28} className="text-orange-400" /></div>
                <div><h2 className="text-2xl font-black text-white">قائمة الطلاب المحظورين</h2></div>
              </div>
              <button onClick={() => setShowBannedModal(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#060a14]">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase sticky top-0">
                    <tr><th className="p-4">الاسم</th><th className="p-4">البريد</th><th className="p-4 text-center">الإجراء</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-white">
                    {bannedAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">{account.firstName} {account.lastName}</td>
                        <td className="p-4">{account.email}</td>
                        <td className="p-4 text-center">
                           <button onClick={() => handleUnbanUser(account.id)} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-white">رفع الحظر</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRechargeModal(false)}></div>
            <div className="relative bg-[#1e293b] border border-green-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl z-10 animate-in zoom-in-95" dir="rtl">
                <button onClick={() => setShowRechargeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4"><WalletCards size={32} /></div>
                    <h3 className="text-xl font-bold text-white mb-2">شحن رصيد الطالب يدوياً</h3>
                </div>
                <form onSubmit={handleRechargeWallet} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">بريد الطالب الإلكتروني</label>
                        <input required type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500 transition-colors" placeholder="example@email.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">المبلغ (ل.س)</label>
                        <input required type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500 transition-colors" placeholder="0" />
                    </div>
                    <button type="submit" disabled={isRecharging} className="w-full py-4 mt-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                        {isRecharging ? <Loader2 className="animate-spin" size={24} /> : "تأكيد عملية الشحن"}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, loading }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-bold mb-1">{title}</p>
        {loading ? (
          <Loader2 className="animate-spin text-gray-500 mt-1" size={24} />
        ) : (
          <h4 className="text-3xl font-black">{value ? value.toLocaleString() : 0}</h4>
        )}
      </div>
    </div>
  );
}